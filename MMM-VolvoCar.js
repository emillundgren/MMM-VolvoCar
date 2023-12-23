Module.register("MMM-VolvoCar", {
	// Default settings for the module
	defaults: {
		// SETTINGS: MMM-VolvoCar module
		moduleDataRefreshInterval: 10 * 60 * 1000,

		// SETTINGS: Authorization
		authTokenUrl: 'https://volvoid.eu.volvocars.com/as/token.oauth2',
		authScope: 'openid email profile care_by_volvo:financial_information:invoice:read care_by_volvo:financial_information:payment_method care_by_volvo:subscription:read customer:attributes customer:attributes:write order:attributes vehicle:attributes tsp_customer_api:all conve:brake_status conve:command_accessibility conve:commands conve:diagnostics_engine_status conve:diagnostics_workshop conve:doors_status conve:engine_status conve:environment conve:fuel_status conve:lock_status conve:navigation conve:odometer_status conve:trip_statistics conve:tyre_status conve:vehicle_relation conve:warnings conve:windows_status energy:battery_charge_level energy:charging_connection_status energy:charging_system_status energy:electric_range energy:estimated_charging_time energy:recharge_status vehicle:attributes',
		authUsername: null,
		authPassword: null,
		authVccApiKey: null,
		authTokenFile: './modules/MMM-VolvoCar/assets/tokens.json',

		// SETTINGS: API
		apiBaseUrl: 'https://api.volvocars.com',
		apiUseSampleDataFile: false,
		apiSampleDataFile: './modules/MMM-VolvoCar/assets/sampleData.json',

		// SETTINGS: Car
		carVin: null,
		carFuelTankSize: 60,

		// SETTINGS: Display
		// Header Image
		hideHeaderImage: false,
		headerImageLayout: 1,
		hideHeaderImageTextModel: false,
		hideHeaderImageTextCustom: false,
		headerImageCustomText: null,
		headerImageFile: './modules/MMM-VolvoCar/assets/headerImage.png',

		// Statusbars
		hideStatusbar: false,
		useStatusbarChargingAnimation: true,
		useStatusbarColor: true,
		statusbarColorDangerMinMax: [0, 10],
		statusbarColorWarnMinMax: [11, 20],

		// Info Icons
		hideInfoIcons: false,

		// Alert Icons
		hideAlertIcons: false,

		// Last Updated
		hideLastUpdated: false,
		dateFormat: 'YYYY-MM-DD HH:mm:ss',
	},

	// Start our module and send the config to the node_helper
	start: function () {
		Log.info(this.name + ' is starting');

		// Assign some default loading variables
		this.loading = true;
		this.authenticated = false;

		this.sendSocketNotification('MMMVC_SET_CONFIG', this.config);
	},

	// Define required scripts.
	getScripts: function () {
		return [
			"moment.js",
		];
	},

	// Get the CSS-file for the module
	getStyles: function () {
		return [
			this.file('MMM-VolvoCar.css'),
			'font-awesome.css',
		]
	},

	// Get translations for the module
	getTranslations: function () {
		return {
			en: "translations/en.json",
			sv: "translations/sv.json"
		};
	},

	// The template of how the data is shown on the mirror
	getTemplate: function () {
		return "templates\\mmm-volvocar.njk"
	},

	// Data for the template above
	getTemplateData: function () {
		var templateData = {
			loading: this.loading,
			authenticated: this.authenticated,
			config: this.config,
			carData: this.carData,
			lastUpdated: this.lastUpdated
		};
		return templateData
	},

	socketNotificationReceived: function (notification, payload) {
		Log.info(`${this.name} received a socket notification: ${notification}`);
		var self = this;

		// When not authenticated, we show the auth-link
		if (notification === 'MMMVC_SHOW_AUTH') {
			this.loading = false;
			this.authenticated = false;
			self.updateDom();
		}

		// When the module is ready, we request to fetch data from the API
		if (notification === 'MMMVC_MODULE_READY') {
			this.loading = false;
			this.authenticated = true;

			// Do an initial fetch of the data and then start the loop of updating the data
			this.sendSocketNotification('MMMVC_GET_CAR_DATA');
			self.startLoop();
		}

		// Redraw the module with the new data
		if (notification === 'MMMVC_REDRAW_MIRROR') {
			const now = moment();

			this.carData = payload.data;
			this.lastUpdated = now.format(this.config.dateFormat);
			self.updateDom();
		}
	},

	// Start the loop that refreshes the data based on the set updateInterval
	startLoop: function () {
		Log.log(this.name + ' is starting the update loop');
		window.setInterval(() => {
			this.sendSocketNotification('MMMVC_GET_CAR_DATA');
		}, this.config.moduleDataRefreshInterval);
	},
});