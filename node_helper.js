const NodeHelper = require("node_helper");
const got = require('got');
const OAuth = require('./auth/oauth.js');
const VolvoApis = require('./api/volvo.js')

module.exports = NodeHelper.create({
  // Defaults for the node_helper
  defaults: {
    authUrl: 'https://api.imgur.com/oauth2/authorize',
    tokenUrl: 'https://api.imgur.com/oauth2/token',
    redirect_uri: 'http://localhost:8080/MMM-VolvoCar/callback',
  },

  // Create config object for the node_helper
  config: {},

  // Create authClient object
  authClient: null,

  // Create Volvo API
  volvoApiClient: null,

  start: function () {
    this.expressApp.get(`/${this.name}/auth`, this.loginHandler.bind(this));
    this.expressApp.get(`/${this.name}/callback`, this.callbackHandler.bind(this));
    this.defaults.tokenFile = `./modules/${this.name}/tokens.json`;
  },


   loginHandler: function (req, res) {
    // Get the authUrl + csrfState parameters from the authClient
    var [authUrl, csrfState] = this.authClient.getAuthorizationParameters();

    // Set a cookie with the csrfState to be able to verify later
    res.cookie('MMM-VolvoCar-state', csrfState, { maxAge: 1000 * 60 * 5 });

    // Redirect to the authUrl
    res.redirect(authUrl);
   },

  callbackHandler: function (req, res) {
    // Get the authorization code from the callback
    var {code,state} = req.query;

    // Parse the cookies to get the state cookie set in the previous auth request
    var { groups: { csrfState } } = /(MMM-VolvoCar-state)=(?<csrfState>.*?)($|;|,(?! ))/.exec(req.headers.cookie)

    console.log('CALLBACK HANDLER: state - '+state)
    console.log('CALLBACK HANDLER: csrfState - '+csrfState)
    
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
    var self = this;

    if (notification === 'SET_CONFIG') {
      // Append the node_module defaults to the main modules config object
      this.config = Object.assign(this.defaults, payload);

      // If the authClient is set, check if token is expired and then show login prompt, otherwise start the app
      if (this.authClient != null) {
        this.authClient.isExpired() ? self.sendSocketNotification('SHOW_LOGIN') : self.sendSocketNotification('MODULE_READY');
      }

      // Make sure that we have a client_id and client_secret set in the config
      if (!this.config.client_id || !this.config.client_secret) {
        console.log(this.name+' - SET_CONFIG: Either client_id or client_secret is not set, exiting...');
        return;
      }

      // If no authClient is created, create one!
      if (this.authClient === null) {
        console.log("AUTHCLIENT IS NULL - CREATING A NEW CLIENT")
        this.authClient = new OAuth(this.config);
      }

      // If no volvoApiClient is created, create one!
      if (this.volvoApiClient === null) {
        console.log("VOLVOAPICLIENT IS NULL - CREATING A NEW CLIENT")
        this.volvoApiClient = new VolvoApis();
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
    else if (notification === 'GET_CAR_DATA') {
      console.log("GET_CAR_DATA - fetcing data...")

        const getTest = this.volvoApiClient.getAccountBase(this.authClient.access_token);
        getTest.then((data) => {
            self.sendSocketNotification('UPDATE_DATA_ON_MM', data.body);
            console.log('ACCOUNTBASE: '+data.body)
        })

        

      /* const reqOptions = {
        url: 'https://api.imgur.com/3/account/cykelstyre',
        method: 'GET',
        headers: {
          'User-Agent': 'MagicMirror',
          'Authorization': 'Bearer ' + this.authClient.access_token
        }
      }

      request(reqOptions, function (error, response, body) {
        console.log(body);
      }); */

    }
  },
});