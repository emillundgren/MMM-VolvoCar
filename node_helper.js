const NodeHelper = require("node_helper");
const Log = require("logger");
const axios = require('axios');
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

	start: function () {},

	downloadHeaderImage: function (imageUrl, localPath, carData) {
		var self = this;

		// Find the image filename and make sure it's set to default.png
		const imageUrlRegEx = /(?<filename>[\w-]+)(?<fileseparator>\.)(?<fileextension>jpeg|jpg|png|gif)/g
		const imageUrlFixed = imageUrl.replace(imageUrlRegEx, "default.png");

		// Adjusted image-parameters for the view we want
		const urlParamsToModify = {
			w: 720,
			bg: '00000000',
			angle: 3,
		}

		// Modify the incoming URL with the new image-parameters
		const modifiedUrl = new URL(imageUrlFixed);
		for (const [key, value] of Object.entries(urlParamsToModify)) {
			modifiedUrl.searchParams.set(key, value);
		}

		// Create a writer to save the file
		const writer = fs.createWriteStream(localPath)

		// Download and save the imagethe image
		axios({
			method: 'get',
			url: modifiedUrl,
			responseType: 'stream',
		}).then(response => {
			return new Promise((resolve, reject) => {
				response.data.pipe(writer);

				let error = null;

				writer.on('error', err => {
					error = err;
					writer.close();
					reject(err);
			  	});

				writer.on('close', () => {
					if (!error) {
				  		resolve(true);
					}
			  	});
			});
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
			if (!this.config.authUsername || !this.config.authPassword || !this.config.authVccApiKey || !this.config.carVin || !this.config.carType) {
				Log.error(this.name + ' - MMMVC_SET_CONFIG: Either authUsername, authPassword, authVccApiKey, carVin or carType is not set, exiting...');
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
					this.authClient.refreshToken(this.authClient.refresh_token, () => {
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
				this.authClient.refreshToken(this.authClient.refresh_token, () => {
					self.sendSocketNotification('MMMVC_GET_CAR_DATA');
				});
				return;
			}

			// Use the Sample Data instead of the API
			if (this.config.apiUseSampleDataFile && fs.existsSync(this.config.apiSampleDataFile)) {
				Log.log(`Displaying data from ${this.config.apiSampleDataFile} instead of using the API`);
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

				// Location API
				this.volvoApiClient.getCarLocation(this.authClient.access_token),

				// Connected Vehicle API
				this.volvoApiClient.getVehicleDetails(this.authClient.access_token),
				this.volvoApiClient.getOdometer(this.authClient.access_token),
				this.volvoApiClient.getDoorsStatus(this.authClient.access_token),
				this.volvoApiClient.getWindowsStatus(this.authClient.access_token),
				this.volvoApiClient.getTyres(this.authClient.access_token),
				this.volvoApiClient.getFuel(this.authClient.access_token),
				this.volvoApiClient.getEngineStatus(this.authClient.access_token),
				this.volvoApiClient.getStatistics(this.authClient.access_token),
				//this.volvoApiClient.getExternalTemp(this.authClient.access_token), // Currently not returning any data...
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

				// Add full output of data for debugging
				Log.debug(JSON.stringify(carData, null, 4));
			});
		}
	},
});