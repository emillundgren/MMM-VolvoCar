const Log = require("logger");
const fs = require('fs');
const got = require('got');
const querystring = require('querystring');
const crypto = require('crypto');

const EXPIRYTHRESHOLD = 3300;

class OAuth {
	constructor(config) {
		this.username = config.authUsername;
		this.password = config.authPassword;
		this.scope = config.authScope;
		this.authUrl = config.authUrl;
		this.tokenUrl = config.authTokenUrl;
		this.redirect_uri = config.authRedirectUri;
		this.tokenFile = config.authTokenFile;
		if (!isNullOrUndefined(this.tokenFile)) this.initTokenFromFile();
	}

	async getToken() {
		var self = this;
		Log.info('Fetching a new access_token');
		try {
			const response = await got.post(this.tokenUrl, {
				body: querystring.stringify({
					username: this.username,
					password: this.password,
					access_token_manager_id: 'JWTh4Yf0b',
					grant_type: 'password',
					scope: this.scope,
				}),
				headers: {
					'Authorization': 'Basic aDRZZjBiOlU4WWtTYlZsNnh3c2c1WVFxWmZyZ1ZtSWFEcGhPc3kxUENhVXNpY1F0bzNUUjVrd2FKc2U0QVpkZ2ZJZmNMeXc=',
					'Content-Type': 'application/x-www-form-urlencoded',
					'User-Agent': 'okhttp/4.10.0',
				}
			});

			self.saveAndInitToken(response.body);
		} catch (error) {
			Log.error(error);
		}
	}

	async refreshToken(refreshToken, callback) {
		var self = this;
		Log.info('Refreshing the access_token using the refresh_token');
		try {
			const response = await got.post(this.tokenUrl, {
				body: querystring.stringify({
					access_token_manager_id: "JWTh4Yf0b",
					grant_type: "refresh_token",
					refresh_token: refreshToken,
				}),
				headers: {
					'Authorization': 'Basic aDRZZjBiOlU4WWtTYlZsNnh3c2c1WVFxWmZyZ1ZtSWFEcGhPc3kxUENhVXNpY1F0bzNUUjVrd2FKc2U0QVpkZ2ZJZmNMeXc=',
					'Content-Type': 'application/x-www-form-urlencoded',
					'User-Agent': 'okhttp/4.10.0',
				}
			});

			self.saveAndInitToken(response.body);
			callback();
		} catch (error) {
			Log.error(error);
		}
	}

	initTokenFromFile() {
		try {
			Log.log(`Init token from file ${this.tokenFile}`);
			if (fs.existsSync(this.tokenFile)) {
				var data = fs.readFileSync(this.tokenFile, 'utf8');
				this.initToken(JSON.parse(data));
			}
			else {
				Log.info('No token file found');
				this.getToken();
			}
		} catch (error) {
			Log.error(error)
		}
	}

	initToken(tokenObj) {
		this.access_token = tokenObj.access_token;
		this.refresh_token = tokenObj.refresh_token;
		this.expires_at = tokenObj.expires_at;
		this.expiry_time = tokenObj.expiry_time;
	}

	isExpired() {
		Log.log(`isExpired:  ${(new Date().getTime() > (this.expiry_time))}`)
		Log.log(`Expiry_time: ${this.expiry_time}, datenow: ${new Date().getTime()}`)
		if (isNullOrUndefined(this.access_token) || this.access_token.length === 0) return true;
		return (new Date().getTime() > (this.expiry_time));
	}

	saveAndInitToken(tokenBody) {
		try {
			var token = JSON.parse(tokenBody);
			token.expiry_time = new Date().getTime() + (token.expires_in * 1000);
			this.initToken(token);
			fs.writeFileSync(this.tokenFile, JSON.stringify(token));
		} catch (error) {
			Log.error(error);
		}
	}

}

function isNullOrUndefined(obj) {
	return (typeof obj === 'undefined') || (typeof obj === 'unknown') || (obj === null);
}

module.exports = OAuth;