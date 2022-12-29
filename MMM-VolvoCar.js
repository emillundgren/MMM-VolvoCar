Module.register("MMM-VolvoCar", {
	defaults: {
		updateInterval: 10 * 60 * 1000,
		client_id: null,
		client_secret: null,
		vcc_api_key: null,
		car_vin: null,
		car_type: null,
		fuel_tank_capacity: 60,
		display: {
			statusbar: true,
			info_icons: true,
			alert_icons: true,
			statusbar_color: {
				active: true,
				warning: {
					from: 20,
					until: 11
				},
				danger: {
					from: 10,
					until: 0
				}
			}
		},
	},

	// Create loading variable, set to true by default
	loading: true,

	// Create authenticated variable, set to false by default
	authenticated: false,

	// Create object where the data to display is stored
	carData: null,

	// Start our module and send the config to the node_module
	start: function () {
		Log.info(this.name + ' is starting');
		this.sendSocketNotification('SET_CONFIG', this.config);
	},

	// Get the CSS-file for the module
	getStyles: function () {
		return [
			this.file('MMM-VolvoCar.css'),
			'font-awesome.css',
		]
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
		};
		return templateData
	},

	socketNotificationReceived: function (notification, payload) {
		Log.info(`${this.name} received a socket notification: ${notification}`);
		var self = this;

		// When not authenticated, we show the auth-link
		if (notification === 'SHOW_LOGIN') {
			this.loading = false;
			this.authenticated = false;
			self.updateDom();
		}

		// When the module is ready, we request to fetch data from the API
		if (notification === 'MODULE_READY') {
			this.loading = false;
			this.authenticated = true;

			// Do an initial fetch of the data and then start the loop of updating the data
			this.sendSocketNotification('GET_CAR_DATA');
			self.startLoop();
		}

		// Redraw the module with the new data
		if (notification === 'UPDATE_DATA_ON_MM') {
			this.carData = payload.data;
			self.updateDom();
		}
	},

	// Start the loop that refreshes the data based on the set updateInterval
	startLoop: function () {
		Log.log(this.name + ' is starting the update loop');
		window.setInterval(() => {
			this.sendSocketNotification('GET_CAR_DATA');
		}, this.config.updateInterval);
	},
});