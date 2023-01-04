const NodeHelper = require("node_helper");
const Log = require("logger");
const got = require('got');
const fs = require('fs');
const OAuth = require('./auth/oauth.js');
const VolvoApis = require('./api/volvo.js');

module.exports = NodeHelper.create({
	// Create config object for the node_helper
	config: {},

	// Create authClient object
	authClient: null,

	// Create volvoApiClient object
	volvoApiClient: null,

	start: function () {
		// Setup the local endpoints needed for the OAuth2
		this.expressApp.get(`/${this.name}/auth`, this.loginHandler.bind(this));
		this.expressApp.get(`/${this.name}/callback`, this.callbackHandler.bind(this));
	},


	loginHandler: function (req, res) {
		// Get the fullAuthUrl + csrfState parameters from the authClient
		var [fullAuthUrl, csrfState] = this.authClient.getAuthorizationParameters();

		// Set a cookie with the csrfState to be able to verify later
		res.cookie('MMM-VolvoCar-state', csrfState, { maxAge: 1000 * 60 * 5 });

		// Redirect to the fullAuthUrl
		res.redirect(fullAuthUrl);
	},

	callbackHandler: function (req, res) {
		// Get the authorization code from the callback
		var { code, state } = req.query;

		// Parse the cookies to get the state cookie set in the previous auth request
		var { groups: { csrfState } } = /(MMM-VolvoCar-state)=(?<csrfState>.*?)($|;|,(?! ))/.exec(req.headers.cookie)

		// Verify that the state value we got back is the same as we previously sent, otherwise abort
		if (state !== csrfState) {
			res.status(422).send('Invalid state')
			return;
		}

		// Get the access token using the authorization code
		this.authClient.getToken(code, () => {
			res.redirect('/');
		});
	},

	downloadHeaderImage: function (imageUrl, localPath, carData) {
		var self = this;
		const https = require('https');

		// Adjusted image-parameters for the view we want
		const urlParamsToModify = {
			w: 720,
			bg: '00000000',
			angle: 3,
		}

		// Modify the incoming URL with the new image-parameters
		const modifiedUrl = new URL(imageUrl);
		for (const [key, value] of Object.entries(urlParamsToModify)) {
			modifiedUrl.searchParams.set(key, value);
		}

		// Download the image and save to local disk
		const file = fs.createWriteStream(localPath);
		https.get(modifiedUrl.toString(), (response) => {
			response.pipe(file);
		});

		// Make sure to re-draw the Mirror once the file finished downloading
		file.on('finish', () => {
			Log.log(`${this.name} - Finished downloading and saving image to ${localPath}`);
			self.sendSocketNotification('MMMVC_REDRAW_MIRROR', carData);
		});
	},

	socketNotificationReceived: function (notification, payload) {
		Log.info(`node_helper of ${this.name} received a socket notification: ${notification}`);
		var self = this;

		if (notification === 'MMMVC_SET_CONFIG') {
			// Set the config from the main module to the node_helper
			this.config = payload;

			// If the authClient is set, check if token is expired and then show login prompt, otherwise start the app
			if (this.authClient != null) {
				this.authClient.isExpired() ? self.sendSocketNotification('MMMVC_SHOW_AUTH') : self.sendSocketNotification('MMMVC_MODULE_READY');
			}

			// Make sure that we have needed credential set in the config
			if (!this.config.authClientId || !this.config.authClientSecret || !this.config.authVccApiKey || !this.config.carVin || !this.config.carType) {
				Log.error(this.name + ' - MMMVC_SET_CONFIG: Either authClientId, authClientSecret, authVccApiKey, carVin or carType is not set, exiting...');
				return;
			}

			// If no authClient is created, create one!
			if (this.authClient === null) {
				Log.info(`${this.name} - Setting up OAuth2 client`);
				this.authClient = new OAuth(this.config);
			}

			// If no volvoApiClient is created, create one!
			if (this.volvoApiClient === null) {
				Log.info(`${this.name} - Setting up Volvo Cars API client`);
				this.volvoApiClient = new VolvoApis(this.config);
			}

			// Check if an access token exists and if it is valid or not
			if (this.authClient.isExpired()) {
				if (this.authClient.refresh_token && this.authClient.refresh_token.length > 0) {
					this.authClient.refreshToken(() => {
						self.sendSocketNotification('MMMVC_MODULE_READY');
					});
				}
				else
					self.sendSocketNotification('MMMVC_SHOW_AUTH');
			}
			else {
				self.sendSocketNotification('MMMVC_MODULE_READY');
			}
		}

		if (notification === 'MMMVC_GET_CAR_DATA') {
			// Make sure that the authClient is setup and access_token is valid
			if (this.authClient === null) return;
			if (this.authClient.isExpired()) {
				this.authClient.refreshToken(() => {
					self.sendSocketNotification('MMMVC_GET_CAR_DATA');
				});
				return;
			}

			// Use the Sample Data instead of the API
			if (this.config.apiUseSampleDataFile && fs.existsSync(this.config.apiSampleDataFile)) {
				Log.log(`Displaying data from ${this.config.apiUseSampleDataFile} instead of using the API`);
				var apiSampleData = JSON.parse(fs.readFileSync(this.config.apiSampleDataFile, 'utf8'));

				// Download the header image if it does not already exist 
				if (!fs.existsSync(this.config.headerImageFile)) {
					this.downloadHeaderImage(apiSampleData.data.images.exteriorDefaultUrl, this.config.headerImageFile, apiSampleData);
				}

				// Send the data to the Mirror
				self.sendSocketNotification('MMMVC_REDRAW_MIRROR', apiSampleData);
				return;
			}

			// Fetch the needed data from the API
			Promise.all([
				// Energy API
				this.volvoApiClient.getRechargeStatus(this.authClient.access_token),

				// Connected Vehicle API
				this.volvoApiClient.getVehicleDetails(this.authClient.access_token),
				this.volvoApiClient.getOdometer(this.authClient.access_token),
				this.volvoApiClient.getDoorsStatus(this.authClient.access_token),
				this.volvoApiClient.getWindowsStatus(this.authClient.access_token),
				this.volvoApiClient.getTyres(this.authClient.access_token),
				this.volvoApiClient.getFuel(this.authClient.access_token),
				this.volvoApiClient.getStatistics(this.authClient.access_token),
				/* this.volvoApiClient.getExternalTemp(this.authClient.access_token), // Currently not returning any data... */
				this.volvoApiClient.getDiagnostics(this.authClient.access_token),
				this.volvoApiClient.getDiagEngine(this.authClient.access_token),
				this.volvoApiClient.getDiagBrakes(this.authClient.access_token),
			]).then((objects) => {
				const mergedObjects = Object.assign({}, ...objects.map(object => object.data));
				const carData = { data: mergedObjects };
				
				// Download the header image if it does not already exist 
				if (!fs.existsSync(this.config.headerImageFile)) {
					this.downloadHeaderImage(carData.data.images.exteriorDefaultUrl, this.config.headerImageFile, carData);
				}

				// Send the data to the Mirror
				self.sendSocketNotification('MMMVC_REDRAW_MIRROR', carData);
			});
		}
	},
});