const got = require('got');
const Log = require("logger");

class VolvoApis {
	constructor(config) {
		this.vcc_api_key = config.authVccApiKey
		this.apiBaseUrl = config.apiBaseUrl
		this.carVin = config.carVin
	}

	// ███████╗███╗   ██╗███████╗██████╗  ██████╗██╗   ██╗     █████╗ ██████╗ ██╗
	// ██╔════╝████╗  ██║██╔════╝██╔══██╗██╔════╝╚██╗ ██╔╝    ██╔══██╗██╔══██╗██║
	// █████╗  ██╔██╗ ██║█████╗  ██████╔╝██║  ███╗╚████╔╝     ███████║██████╔╝██║
	// ██╔══╝  ██║╚██╗██║██╔══╝  ██╔══██╗██║   ██║ ╚██╔╝      ██╔══██║██╔═══╝ ██║
	// ███████╗██║ ╚████║███████╗██║  ██║╚██████╔╝  ██║       ██║  ██║██║     ██║
	// ╚══════╝╚═╝  ╚═══╝╚══════╝╚═╝  ╚═╝ ╚═════╝   ╚═╝       ╚═╝  ╚═╝╚═╝     ╚═╝

	async getRechargeStatus(access_token) {
		try {
			const response = await got(`${this.apiBaseUrl}/energy/v1/vehicles/${this.carVin}/recharge-status`, {
				headers: {
					'User-Agent': 'MMM-VolvoCar',
					'Authorization': `Bearer ${access_token}`,
					'vcc-api-key': this.vcc_api_key,
					'accept': 'application/vnd.volvocars.api.energy.vehicledata.v1+json'
				}
			});
			return JSON.parse(response.body)
		} catch (error) {
			Log.error(error);
		}
	}

	//██╗      ██████╗  ██████╗ █████╗ ████████╗██╗ ██████╗ ███╗   ██╗     █████╗ ██████╗ ██╗
	//██║     ██╔═══██╗██╔════╝██╔══██╗╚══██╔══╝██║██╔═══██╗████╗  ██║    ██╔══██╗██╔══██╗██║
	//██║     ██║   ██║██║     ███████║   ██║   ██║██║   ██║██╔██╗ ██║    ███████║██████╔╝██║
	//██║     ██║   ██║██║     ██╔══██║   ██║   ██║██║   ██║██║╚██╗██║    ██╔══██║██╔═══╝ ██║
	//███████╗╚██████╔╝╚██████╗██║  ██║   ██║   ██║╚██████╔╝██║ ╚████║    ██║  ██║██║     ██║
	//╚══════╝ ╚═════╝  ╚═════╝╚═╝  ╚═╝   ╚═╝   ╚═╝ ╚═════╝ ╚═╝  ╚═══╝    ╚═╝  ╚═╝╚═╝     ╚═╝

	async getCarLocation(access_token) {
		try {
			const response = await got(`${this.apiBaseUrl}/location/v1/vehicles/${this.carVin}/location`, {
				headers: {
					'User-Agent': 'MMM-VolvoCar',
					'Authorization': `Bearer ${access_token}`,
					'vcc-api-key': this.vcc_api_key,
					'accept': 'application/json'
				}
			});
			return JSON.parse(response.body)
		} catch (error) {
			Log.error(error);
		}
	}

	//  ██████╗ ██████╗ ███╗   ██╗███╗   ██╗███████╗ ██████╗████████╗███████╗██████╗      █████╗ ██████╗ ██╗
	// ██╔════╝██╔═══██╗████╗  ██║████╗  ██║██╔════╝██╔════╝╚══██╔══╝██╔════╝██╔══██╗    ██╔══██╗██╔══██╗██║
	// ██║     ██║   ██║██╔██╗ ██║██╔██╗ ██║█████╗  ██║        ██║   █████╗  ██║  ██║    ███████║██████╔╝██║
	// ██║     ██║   ██║██║╚██╗██║██║╚██╗██║██╔══╝  ██║        ██║   ██╔══╝  ██║  ██║    ██╔══██║██╔═══╝ ██║
	// ╚██████╗╚██████╔╝██║ ╚████║██║ ╚████║███████╗╚██████╗   ██║   ███████╗██████╔╝    ██║  ██║██║     ██║
	//  ╚═════╝ ╚═════╝ ╚═╝  ╚═══╝╚═╝  ╚═══╝╚══════╝ ╚═════╝   ╚═╝   ╚══════╝╚═════╝     ╚═╝  ╚═╝╚═╝     ╚═╝

	async getVehicleDetails(access_token) {
		try {
			const response = await got(`${this.apiBaseUrl}/connected-vehicle/v1/vehicles/${this.carVin}`, {
				headers: {
					'User-Agent': 'MMM-VolvoCar',
					'Authorization': `Bearer ${access_token}`,
					'vcc-api-key': this.vcc_api_key,
					'accept': 'application/vnd.volvocars.api.connected-vehicle.vehicle.v1+json'
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
					'vcc-api-key': this.vcc_api_key,
					'accept': 'application/vnd.volvocars.api.connected-vehicle.vehicledata.v1+json'
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
					'vcc-api-key': this.vcc_api_key,
					'accept': 'application/vnd.volvocars.api.connected-vehicle.vehicledata.v1+json'
				}
			});
			// Parse result and create new object
			const result = JSON.parse(response.body);
			const newObject = {
				status: result.status,
				operationId: result.operationId,
				data: {
					carLocked: result.data.carLocked,
					doors: {
						frontLeft: result.data.frontLeftDoorOpen,
						frontRight: result.data.frontRightDoorOpen,
						rearLeft: result.data.rearLeftDoorOpen,
						rearRight: result.data.rearRightDoorOpen,
						hood: result.data.hoodOpen,
						tailGate: result.data.tailGateOpen,
					}
				}
			}
			return newObject;
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
					'vcc-api-key': this.vcc_api_key,
					'accept': 'application/vnd.volvocars.api.connected-vehicle.vehicledata.v1+json'
				}
			});
			// Parse result and create new object
			const result = JSON.parse(response.body);
			const newObject = {
				status: result.status,
				operationId: result.operationId,
				data: {
					windows: {
						frontLeft: result.data.frontLeftWindowOpen,
						frontRight: result.data.frontRightWindowOpen,
						rearLeft: result.data.rearLeftWindowOpen,
						rearRight: result.data.rearRightWindowOpen,
					}
				}
			}
			return newObject;
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
					'vcc-api-key': this.vcc_api_key,
					'accept': 'application/vnd.volvocars.api.connected-vehicle.vehicledata.v1+json'
				}
			});
			// Parse result and create new object
			const result = JSON.parse(response.body);
			const newObject = {
				status: result.status,
				operationId: result.operationId,
				data: {
					tires: {
						frontLeft: result.data.frontLeft,
						frontRight: result.data.frontRight,
						rearLeft: result.data.rearLeft,
						rearRight: result.data.rearRight,
					}
				}
			}
			return newObject;
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
					'vcc-api-key': this.vcc_api_key,
					'accept': 'application/vnd.volvocars.api.connected-vehicle.vehicledata.v1+json'
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
					'vcc-api-key': this.vcc_api_key,
					'accept': 'application/vnd.volvocars.api.connected-vehicle.vehicledata.v1+json'
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
					'vcc-api-key': this.vcc_api_key,
					'accept': 'application/vnd.volvocars.api.connected-vehicle.vehicledata.v1+json'
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
					'vcc-api-key': this.vcc_api_key,
					'accept': 'application/vnd.volvocars.api.connected-vehicle.vehicledata.v1+json'
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
					'vcc-api-key': this.vcc_api_key,
					'accept': 'application/vnd.volvocars.api.connected-vehicle.vehicledata.v1+json'
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
					'vcc-api-key': this.vcc_api_key,
					'accept': 'application/vnd.volvocars.api.connected-vehicle.vehicledata.v1+json'
				}
			});
			return JSON.parse(response.body)
		} catch (error) {
			Log.error(error);
		}
	}
}

module.exports = VolvoApis