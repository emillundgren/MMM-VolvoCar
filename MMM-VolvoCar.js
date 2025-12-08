Module.register("MMM-VolvoCar", {

    defaults: {
		// SETTINGS: MMM-VolvoCar module
		refreshInterval: 10 * 60 * 1000,

        // SETTINGS: API & Authorization
        authUrl: "https://volvoid.eu.volvocars.com/as/authorization.oauth2",
        tokenUrl: "https://volvoid.eu.volvocars.com/as/token.oauth2",
        apiBaseUrl: "https://api.volvocars.com",
        scope: "openid conve:fuel_status conve:brake_status conve:doors_status location:read openid conve:diagnostics_workshop conve:trip_statistics conve:environment conve:odometer_status conve:engine_status conve:lock_status conve:vehicle_relation conve:windows_status conve:tyre_status conve:connectivity_status energy:state:read energy:capability:read conve:battery_charge_level conve:diagnostics_engine_status conve:warnings",
        apiUseSampleDataFile: false,
		apiSampleDataFile: './modules/MMM-VolvoCar/assets/sampleData.json',
        clientId: null,
        clientSecret: null,
        redirectUri: null,
        apiKey: null,

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

    start() {
        this.authenticated = false;
        this.authUrl = null;

        this.sendSocketNotification("MMMVC_INIT_MODULE", this.config);
    },

    getStyles: function () {
		return [
			'assets\\MMM-VolvoCar.css',
		]
	},

    getTranslations() {
        return {
			en: "translations/en.json",
			sv: "translations/sv.json"
		};
    },

    getTemplate() {
        return "templates\\MMM-VolvoCar.njk"
    },
    getTemplateData() {
        var templateData = {
            authenticated: this.authenticated,
            authUrl: this.authUrl,
            config: this.config,
            carData: this.carData,
            lastUpdated: this.lastUpdated,
        }
        return templateData
    },

    socketNotificationReceived(notification, payload) {
        if (notification === "MMMVC_AUTH_SUCCESSFUL") {
            this.authenticated = true;
            this.updateDom();
            this.sendSocketNotification('MMMVC_FETCH_DATA');
            this.startLoop();
        }

        if (notification === "VOLVO_AUTH_NEEDED") {
            fetch("/MMM-VolvoCar/generate-url")
                .then(r => r.text())
                .then(url => {
                    this.authUrl = url;
                    this.updateDom();
                });
        }

        if (notification === "MMMVC_REDRAW_MODULE") {
            const now = moment();
            this.carData = payload;
            this.lastUpdated = now.format(this.config.dateFormat);
            this.updateDom();
        }

        if (notification === "MMMVC_UPDATE_DOM") {
            this.updateDom();
        }
    },

    startLoop: function () {
		console.log(`${this.name} is starting the update loop`);
		window.setInterval(() => {
			this.sendSocketNotification('MMMVC_FETCH_DATA');
		}, this.config.refreshInterval );
	},
});
