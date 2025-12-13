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
        // Set parameter starting values
        this.loading        = true;
        this.loadingReason  = "init";
        this.authenticated  = false;
        this.error          = false;
        this.authUrl        = null;
        this.qrCode         = null;
        this.carData        = null;
        this.lastUpdated    = null;

        // Initialize the module
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
            loading:        this.loading,
            loadingReason:  this.loadingReason,
            error:          this.error,
            authenticated:  this.authenticated,
            authUrl:        this.authUrl,
            qrCode:         this.qrCode,
            config:         this.config,
            carData:        this.carData,
            lastUpdated:    this.lastUpdated,
        }
        return templateData
    },

    socketNotificationReceived(notification, payload) {
        if (notification === "MMMVC_AUTH_NEEDED") {
            fetch("/MMM-VolvoCar/generate-url")
                .then(response => response.text())
                .then(authUrl => {
                    this.authUrl = authUrl;
                    this.sendSocketNotification("MMMVC_GENERATE_QR_CODE", authUrl);
                });
        }

        if (notification === "MMMVC_SHOW_AUTH") {
            this.loading        = false;
            this.loadingReason  = "auth";
            this.qrCode = payload;
            this.updateDom();
        }

        if (notification === "MMMVC_AUTH_SUCCESSFUL") {
            this.authenticated  = true;
            this.loading        = true;
            this.loadingReason  = "fetching";
            this.updateDom();
            this.sendSocketNotification('MMMVC_FETCH_DATA');
            this.startLoop();
        }

        if (notification === "MMMVC_FETCH_ERROR") {
            Log.error(`${this.name}: API Fetch error`);
            this.loading    = false;
            this.error      = true;
            this.carData    = null;
            this.updateDom();
        }

        if (notification === "MMMVC_REDRAW_MODULE") {
            const now           = moment();
            this.loading        = false;
            this.loadingReason  = null;
            this.error          = null;
            this.carData        = payload;
            this.lastUpdated    = now.format(this.config.dateFormat);
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
