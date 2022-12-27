const NodeHelper = require("node_helper");
const Log = require("logger");
const got = require('got');
const OAuth = require('./auth/oauth.js');
const VolvoApis = require('./api/volvo.js');

module.exports = NodeHelper.create({
  // Defaults for the node_helper
  defaults: {
    // OAuth2 Parameters
    authUrl:      'https://volvoid.eu.volvocars.com/as/authorization.oauth2',
    tokenUrl:     'https://volvoid.eu.volvocars.com/as/token.oauth2',
    redirect_uri: 'http://localhost:8080/MMM-VolvoCar/callback',
    scope:        'openid',

    // Local storage of access_token
    tokenFile:    './modules/MMM-VolvoCar/tokens.json',

    // API Parameters
    apiBaseUrl:   'https://api.volvocars.com',
  },

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
      // Append the node_helper defaults to the main modules config object
      this.config = Object.assign(this.defaults, payload);

      // If the authClient is set, check if token is expired and then show login prompt, otherwise start the app
      if (this.authClient != null) {
        this.authClient.isExpired() ? self.sendSocketNotification('SHOW_LOGIN') : self.sendSocketNotification('MODULE_READY');
      }

      // Make sure that we have needed credential set in the config
      if (!this.config.client_id || !this.config.client_secret || !this.config.vcc_api_key || !this.config.car_vin) {
        Log.error(this.name + ' - SET_CONFIG: Either client_id, client_secret, vcc_api_key or car_vin is not set, exiting...');
        return;
      }

      // If no authClient is created, create one!
      if (this.authClient === null) {
        Log.info("AUTHCLIENT IS NULL - CREATING A NEW CLIENT");
        this.authClient = new OAuth(this.config);
      }

      // If no volvoApiClient is created, create one!
      if (this.volvoApiClient === null) {
        Log.info("VOLVOAPICLIENT IS NULL - CREATING A NEW CLIENT");
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

      // Get Promises from the Volvo API
      const getRechargeStatus = this.volvoApiClient.getRechargeStatus(this.authClient.access_token);
      const getBatteryChargeLevel = this.volvoApiClient.getBatteryChargeLevel(this.authClient.access_token);
      const getElectricRange = this.volvoApiClient.getElectricRange(this.authClient.access_token);

      //Resolv the Promises and merge the data into a single object
      getRechargeStatus.then((response) => {
        //self.sendSocketNotification('UPDATE_DATA_ON_MM', response);
        //Log.log(response.data);

        const carJson = {data: {}};
        carJson.data = response.data;
        self.sendSocketNotification('UPDATE_DATA_ON_MM', carJson);
      });

      
      /* getBatteryChargeLevel.then((response) => {
        //self.sendSocketNotification('UPDATE_DATA_ON_MM', response);
        Log.log(response);
      }); */

      
      /* getElectricRange.then((response) => {
        //self.sendSocketNotification('UPDATE_DATA_ON_MM', response);
        Log.log(response);
      }); */

    }
  },
});