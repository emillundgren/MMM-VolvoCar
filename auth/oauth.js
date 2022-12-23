const fs = require('fs');
const got = require('got');
const querystring = require('querystring');

const EXPIRYTHRESHOLD = 3300;

class OAuth {
  constructor(config) {
    this.client_id = config.client_id;
    this.client_secret = config.client_secret;
    this.scope = config.scope;
    this.authUrl = config.authUrl;
    this.tokenUrl = config.tokenUrl;
    this.redirectUri = config.redirect_uri;
    this.tokenFile = config.tokenFile;
    if (!isNullOrUndefined(this.tokenFile)) this.initTokenFromFile();
  }

  getAuthorizationParameters() {
    // Generate a random state value for the request
    const csrfState = Math.random().toString(36).substring(7);

    // Setup the required query parameters
    const queryParams = {
      response_type: 'code',
      client_id: this.client_id,
      redirect_uri: this.redirectUri,
      scope: this.scope,
      state: csrfState,
    };

    // Generate the full Authorization URL
    const authorizationUrl = `${this.authUrl}?${querystring.stringify(queryParams)}`

    // Return both the URL and the state parameter so we can save this in a cookie
    return [authorizationUrl, csrfState];
  }

  async getToken(authCode, callback) {
    var self = this;

    try {
        const response = await got.post(this.tokenUrl, {
            body: querystring.stringify({
                grant_type: 'authorization_code',
                code: authCode,
                redirect_uri: this.redirectUri,
                client_id: this.client_id,
                client_secret: this.client_secret
            }),
            headers: {
                'User-Agent': 'MMM-VolvoCar',
                'Content-Type': 'application/x-www-form-urlencoded',
            }
        });

        self.saveAndInitToken(response.body);
        callback();
    } catch (error) {
        console.log('error:', error);
    }
  }

  async refreshToken(callback) {
    var self = this;

    try {
        const response = await got.post(this.tokenUrl, {
            body: querystring.stringify({
                grant_type: 'refresh_token',
                refresh_token: this.refresh_token,
                client_id: this.client_id,
                client_secret: this.client_secret
            }),
            headers: {
                'User-Agent': 'MMM-VolvoCar',
                'Content-Type': 'application/x-www-form-urlencoded',
            }
        });

        self.saveAndInitToken(response.body);
        callback();
    } catch (error) {
        console.log('error:', error);
    }
  }

  initTokenFromFile() {
    try {
      console.log('Init token from file' + this.tokenFile);
      if (fs.existsSync(this.tokenFile)) {
        var data = fs.readFileSync(this.tokenFile, 'utf8');
        this.initToken(JSON.parse(data));
      }
      else {
        console.log('No token file found');
      }
    } catch (err) {
      console.error(err)
    }
  }

  initToken(tokenObj) {
    this.access_token = tokenObj.access_token;
    this.refresh_token = tokenObj.refresh_token;
    this.expires_at = tokenObj.expires_at;
    this.expiry_time = tokenObj.expiry_time;
  }

  isExpired() {
    console.log(`isExpired date:  ${(new Date().getTime() > (this.expiry_time - EXPIRYTHRESHOLD))}`)
    console.log(`Expiry_time: ${this.expiry_time}, datenow: ${new Date().getTime()}, threshold: ${EXPIRYTHRESHOLD}`)
    if (isNullOrUndefined(this.access_token) || this.access_token.length === 0) return true;
    return (new Date().getTime() > (this.expiry_time - EXPIRYTHRESHOLD));
  }

  saveAndInitToken(tokenBody) {
    try {
      var token = JSON.parse(tokenBody);
      //token.expiry_time = new Date().getTime() + (token.expires_in * 1000);
      token.expiry_time = new Date().getTime() + (token.expires_in);
      this.initToken(token);
      fs.writeFileSync(this.tokenFile, JSON.stringify(token));
    } catch (error) {
      console.log(error);
    }
  }

}

function isNullOrUndefined(obj) {
  return (typeof obj === 'undefined') || (typeof obj === 'unknown') || (obj === null);
}

module.exports = OAuth;