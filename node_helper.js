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

	socketNotificationReceived: function (notification, payload) {
		Log.info(`node_helper of ${this.name} received a socket notification: ${notification}`);
		var self = this;

		if (notification === 'SET_CONFIG') {
			// Set the config from the main module to the node_helper
			this.config = payload;

			// If the authClient is set, check if token is expired and then show login prompt, otherwise start the app
			if (this.authClient != null) {
				this.authClient.isExpired() ? self.sendSocketNotification('SHOW_LOGIN') : self.sendSocketNotification('MODULE_READY');
			}

			// Make sure that we have needed credential set in the config
			if (!this.config.authClientId || !this.config.authClientSecret || !this.config.authVccApiKey || !this.config.carVin || !this.config.carType) {
				Log.error(this.name + ' - SET_CONFIG: Either authClientId, authClientSecret, authVccApiKey, carVin or carType is not set, exiting...');
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
						self.sendSocketNotification('MODULE_READY');
					});
				}
				else
					self.sendSocketNotification('SHOW_LOGIN');
			}
			else {
				self.sendSocketNotification('MODULE_READY');
			}
		}

		if (notification === 'GET_CAR_DATA') {
			// Make sure that the authClient is setup and access_token is valid
			if (this.authClient === null) return;
			if (this.authClient.isExpired()) {
				this.authClient.refreshToken(() => {
					self.sendSocketNotification('GET_CAR_DATA');
				});
				return;
			}

			// Use the Sample Data instead of the API
			if (this.config.apiUseSampleDataFile && fs.existsSync(this.config.apiSampleDataFile)) {
				Log.log("Displaying data from sampleData.json instead of using the API");
				var apiSampleData = JSON.parse(fs.readFileSync(this.config.apiSampleDataFile, 'utf8'));
				self.sendSocketNotification('UPDATE_DATA_ON_MM', apiSampleData);
				return;
			}

			// Fetch the needed data from the API
			Promise.all([
				// Energy API
				this.volvoApiClient.getRechargeStatus(this.authClient.access_token),

				// Connected Vehicle API
				this.volvoApiClient.getFuel(this.authClient.access_token),
				this.volvoApiClient.getStatistics(this.authClient.access_token),
				this.volvoApiClient.getDoorsStatus(this.authClient.access_token),
				this.volvoApiClient.getOdometer(this.authClient.access_token),
				this.volvoApiClient.getDiagnostics(this.authClient.access_token),
			]).then((objects) => {
				const mergedObjects = Object.assign({}, ...objects.map(object => object.data));
				const carData = { data: mergedObjects };
				Log.log(carData);
				self.sendSocketNotification('UPDATE_DATA_ON_MM', carData);
			});
		}
	},
});