const got = require('got');
const Log = require("logger");

class VolvoApis {
	constructor(config) {
		this.vcc_api_key = config.vcc_api_key
		this.apiBaseUrl = config.apiBaseUrl
		this.car_vin = config.car_vin
	}

	async getRechargeStatus(access_token) {
		try {
			const response = await got(`${this.apiBaseUrl}/energy/v1/vehicles/${this.car_vin}/recharge-status`, {
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
			const response = await got(`${this.apiBaseUrl}/connected-vehicle/v1/vehicles/${this.car_vin}/windows`, {
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
			const response = await got(`${this.apiBaseUrl}/connected-vehicle/v1/vehicles/${this.car_vin}/doors`, {
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
			const response = await got(`${this.apiBaseUrl}/connected-vehicle/v1/vehicles/${this.car_vin}/environment`, {
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
			const response = await got(`${this.apiBaseUrl}/connected-vehicle/v1/vehicles/${this.car_vin}`, {
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
			const response = await got(`${this.apiBaseUrl}/connected-vehicle/v1/vehicles/${this.car_vin}/tyres`, {
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
			const response = await got(`${this.apiBaseUrl}/connected-vehicle/v1/vehicles/${this.car_vin}/statistics`, {
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
			const response = await got(`${this.apiBaseUrl}/connected-vehicle/v1/vehicles/${this.car_vin}/odometer`, {
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
			const response = await got(`${this.apiBaseUrl}/connected-vehicle/v1/vehicles/${this.car_vin}/fuel`, {
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
			const response = await got(`${this.apiBaseUrl}/connected-vehicle/v1/vehicles/${this.car_vin}/engine`, {
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
			const response = await got(`${this.apiBaseUrl}/connected-vehicle/v1/vehicles/${this.car_vin}/diagnostics`, {
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
			const response = await got(`${this.apiBaseUrl}/connected-vehicle/v1/vehicles/${this.car_vin}/brakes`, {
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