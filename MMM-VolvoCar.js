Module.register("MMM-VolvoCar", {

    defaults: {
		// SETTINGS: MMM-VolvoCar module
		moduleDataRefreshInterval: 10 * 60 * 1000,

        // SETTINGS: Authorization
        authUrl: "https://volvoid.eu.volvocars.com/as/authorization.oauth2",
        authTokenUrl: "https://volvoid.eu.volvocars.com/as/token.oauth2",
        authScope: "openid conve:fuel_status conve:brake_status conve:doors_status location:read openid conve:diagnostics_workshop conve:trip_statistics conve:environment conve:odometer_status conve:engine_status conve:lock_status conve:vehicle_relation conve:windows_status conve:tyre_status conve:connectivity_status energy:state:read energy:capability:read conve:battery_charge_level conve:diagnostics_engine_status conve:warnings",
        authClientId: null,
        authClientSecret: null,
        authRedirectUri: null,
        authShowQrCode: true,
        authTokenFile: './modules/MMM-VolvoCar/vcapi/token.json',

        // SETTINGS: API
        apiBaseUrl: "https://api.volvocars.com",
        apiKey: null,
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

    start() {
        this.authenticated = false;
        this.authUrl = null;
        this.qrCode = null;

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
        Log.debug(`${this.name}: Current carData - ${this.carData}`);
        var templateData = {
            authenticated: this.authenticated,
            authUrl: this.authUrl,
            qrCode: this.qrCode,
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

        if (notification === "MMMVC_AUTH_NEEDED") {
            fetch("/MMM-VolvoCar/generate-url")
                .then(r => r.text())
                .then(url => {
                    this.authUrl = url;
                    this.sendSocketNotification("MMMVC_GENERATE_QR_CODE", url);
                });
        }

        if (notification === "MMMVC_SHOW_AUTH") {
            this.qrCode = payload;
            this.updateDom();
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
		Log.info(`${this.name} is starting the update loop`);
		window.setInterval(() => {
			this.sendSocketNotification('MMMVC_FETCH_DATA');
		}, this.config.moduleDataRefreshInterval );
	},
});
