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
    
    async getBatteryChargeLevel(access_token) {
        try {
            const response = await got(`${this.apiBaseUrl}/energy/v1/vehicles/${this.car_vin}/recharge-status/battery-charge-level`, {
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
    
    async getElectricRange(access_token) {
        try {
            const response = await got(`${this.apiBaseUrl}/energy/v1/vehicles/${this.car_vin}/recharge-status/electric-range`, {
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