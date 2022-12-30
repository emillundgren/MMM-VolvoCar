const got = require('got');
const Log = require("logger");

class VolvoApis {
	constructor(config) {
		this.vcc_api_key = config.authVccApiKey
		this.apiBaseUrl = config.apiBaseUrl
		this.carVin = config.carVin
	}

	async getRechargeStatus(access_token) {
		try {
			const response = await got(`${this.apiBaseUrl}/energy/v1/vehicles/${this.carVin}/recharge-status`, {
				headers: {
					'User-Agent': 'MMM-VolvoCar',
					'Authorization': `Bearer ${access_token}`,
					'vcc-api-key': this.vcc_api_key
				}
			});
			return JSON.parse(response.body)
		} catch (error) {
			Log.error(error);
		}
	}

	async getWindowsStatus(access_token) {
		try {
			const response = await got(`${this.apiBaseUrl}/connected-vehicle/v1/vehicles/${this.carVin}/windows`, {
				headers: {
					'User-Agent': 'MMM-VolvoCar',
					'Authorization': `Bearer ${access_token}`,
					'vcc-api-key': this.vcc_api_key
				}
			});
			return JSON.parse(response.body)
		} catch (error) {
			Log.error(error);
		}
	}

	async getDoorsStatus(access_token) {
		try {
			const response = await got(`${this.apiBaseUrl}/connected-vehicle/v1/vehicles/${this.carVin}/doors`, {
				headers: {
					'User-Agent': 'MMM-VolvoCar',
					'Authorization': `Bearer ${access_token}`,
					'vcc-api-key': this.vcc_api_key
				}
			});
			return JSON.parse(response.body)
		} catch (error) {
			Log.error(error);
		}
	}

	async getExternalTemp(access_token) {
		try {
			const response = await got(`${this.apiBaseUrl}/connected-vehicle/v1/vehicles/${this.carVin}/environment`, {
				headers: {
					'User-Agent': 'MMM-VolvoCar',
					'Authorization': `Bearer ${access_token}`,
					'vcc-api-key': this.vcc_api_key
				}
			});
			return JSON.parse(response.body)
		} catch (error) {
			Log.error(error);
		}
	}

	async getVehicleDetails(access_token) {
		try {
			const response = await got(`${this.apiBaseUrl}/connected-vehicle/v1/vehicles/${this.carVin}`, {
				headers: {
					'User-Agent': 'MMM-VolvoCar',
					'Authorization': `Bearer ${access_token}`,
					'vcc-api-key': this.vcc_api_key
				}
			});
			return JSON.parse(response.body)
		} catch (error) {
			Log.error(error);
		}
	}

	async getTyres(access_token) {
		try {
			const response = await got(`${this.apiBaseUrl}/connected-vehicle/v1/vehicles/${this.carVin}/tyres`, {
				headers: {
					'User-Agent': 'MMM-VolvoCar',
					'Authorization': `Bearer ${access_token}`,
					'vcc-api-key': this.vcc_api_key
				}
			});
			return JSON.parse(response.body)
		} catch (error) {
			Log.error(error);
		}
	}

	async getStatistics(access_token) {
		try {
			const response = await got(`${this.apiBaseUrl}/connected-vehicle/v1/vehicles/${this.carVin}/statistics`, {
				headers: {
					'User-Agent': 'MMM-VolvoCar',
					'Authorization': `Bearer ${access_token}`,
					'vcc-api-key': this.vcc_api_key
				}
			});
			return JSON.parse(response.body)
		} catch (error) {
			Log.error(error);
		}
	}

	async getOdometer(access_token) {
		try {
			const response = await got(`${this.apiBaseUrl}/connected-vehicle/v1/vehicles/${this.carVin}/odometer`, {
				headers: {
					'User-Agent': 'MMM-VolvoCar',
					'Authorization': `Bearer ${access_token}`,
					'vcc-api-key': this.vcc_api_key
				}
			});
			return JSON.parse(response.body)
		} catch (error) {
			Log.error(error);
		}
	}

	async getFuel(access_token) {
		try {
			const response = await got(`${this.apiBaseUrl}/connected-vehicle/v1/vehicles/${this.carVin}/fuel`, {
				headers: {
					'User-Agent': 'MMM-VolvoCar',
					'Authorization': `Bearer ${access_token}`,
					'vcc-api-key': this.vcc_api_key
				}
			});
			return JSON.parse(response.body)
		} catch (error) {
			Log.error(error);
		}
	}

	async getDiagEngine(access_token) {
		try {
			const response = await got(`${this.apiBaseUrl}/connected-vehicle/v1/vehicles/${this.carVin}/engine`, {
				headers: {
					'User-Agent': 'MMM-VolvoCar',
					'Authorization': `Bearer ${access_token}`,
					'vcc-api-key': this.vcc_api_key
				}
			});
			return JSON.parse(response.body)
		} catch (error) {
			Log.error(error);
		}
	}

	async getDiagnostics(access_token) {
		try {
			const response = await got(`${this.apiBaseUrl}/connected-vehicle/v1/vehicles/${this.carVin}/diagnostics`, {
				headers: {
					'User-Agent': 'MMM-VolvoCar',
					'Authorization': `Bearer ${access_token}`,
					'vcc-api-key': this.vcc_api_key
				}
			});
			return JSON.parse(response.body)
		} catch (error) {
			Log.error(error);
		}
	}

	async getDiagBrakes(access_token) {
		try {
			const response = await got(`${this.apiBaseUrl}/connected-vehicle/v1/vehicles/${this.carVin}/brakes`, {
				headers: {
					'User-Agent': 'MMM-VolvoCar',
					'Authorization': `Bearer ${access_token}`,
					'vcc-api-key': this.vcc_api_key
				}
			});
			return JSON.parse(response.body)
		} catch (error) {
			Log.error(error);
		}
	}
}

module.exports = VolvoApis