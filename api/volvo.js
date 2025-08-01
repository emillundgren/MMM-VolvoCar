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
			const response = await got(`${this.apiBaseUrl}/energy/v2/vehicles/${this.carVin}/state`, {
				headers: {
					'User-Agent': 'MMM-VolvoCar',
					'Authorization': `Bearer ${access_token}`,
					'vcc-api-key': this.vcc_api_key,
					'accept': 'application/json'
				}
			});
			// Parse result and create new object
			const result = JSON.parse(response.body);
			const newObject = {
				data: result
			}
			return newObject;
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
			// Parse result and create new object
			const result = JSON.parse(response.body);
			const newObject = {
				status: result.status,
				operationId: result.operationId,
				data: {
					location: {
						coordinates: result.data.geometry.coordinates,
						lon: result.data.geometry.coordinates[0],
						lat: result.data.geometry.coordinates[1],
						height: result.data.geometry.coordinates[2],
						heading: result.data.properties.heading,
						timestamp: result.data.properties.timestamp,
					}
				}
			}
			return newObject;
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

	async getEngineDiagnostic(access_token) {
		try {
			const response = await got(`${this.apiBaseUrl}/connected-vehicle/v2/vehicles/${this.carVin}/engine`, {
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

	async getDiagnostics(access_token) {
		try {
			const response = await got(`${this.apiBaseUrl}/connected-vehicle/v2/vehicles/${this.carVin}/diagnostics`, {
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

	async getBrakeFluidLevel(access_token) {
		try {
			const response = await got(`${this.apiBaseUrl}/connected-vehicle/v2/vehicles/${this.carVin}/brakes`, {
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

	async getWindowStatus(access_token) {
		try {
			const response = await got(`${this.apiBaseUrl}/connected-vehicle/v2/vehicles/${this.carVin}/windows`, {
				headers: {
					'User-Agent': 'MMM-VolvoCar',
					'Authorization': `Bearer ${access_token}`,
					'vcc-api-key': this.vcc_api_key,
					'accept': 'application/json'
				}
			});
			// Parse result and create new object
			const result = JSON.parse(response.body);
			const newObject = {
				status: result.status,
				operationId: result.operationId,
				data: {
					windows: {
						frontLeft: result.data.frontLeftWindow,
						frontRight: result.data.frontRightWindow,
						rearLeft: result.data.rearLeftWindow,
						rearRight: result.data.rearRightWindow,
						sunroof: result.data.sunroof,
					}
				}
			}
			return newObject;
		} catch (error) {
			Log.error(error);
		}
	}

	async getDoorAndLockStatus(access_token) {
		try {
			const response = await got(`${this.apiBaseUrl}/connected-vehicle/v2/vehicles/${this.carVin}/doors`, {
				headers: {
					'User-Agent': 'MMM-VolvoCar',
					'Authorization': `Bearer ${access_token}`,
					'vcc-api-key': this.vcc_api_key,
					'accept': 'application/json'
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
						centralLock: result.data.centralLock,
						frontLeft: result.data.frontLeftDoor,
						frontRight: result.data.frontRightDoor,
						rearLeft: result.data.rearLeftDoor,
						rearRight: result.data.rearRightDoor,
						tailGate: result.data.tailGate,
						hood: result.data.hood,
						tankLid: result.data.tankLid,
					}
				}
			}
			return newObject;
		} catch (error) {
			Log.error(error);
		}
	}

	async getEngineStatus(access_token) {
		try {
			const response = await got(`${this.apiBaseUrl}/connected-vehicle/v2/vehicles/${this.carVin}/engine-status`, {
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

	async getFuelAmount(access_token) {
		try {
			const response = await got(`${this.apiBaseUrl}/connected-vehicle/v2/vehicles/${this.carVin}/fuel`, {
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

	async getOdometer(access_token) {
		try {
			const response = await got(`${this.apiBaseUrl}/connected-vehicle/v2/vehicles/${this.carVin}/odometer`, {
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

	async getStatistics(access_token) {
		try {
			const response = await got(`${this.apiBaseUrl}/connected-vehicle/v2/vehicles/${this.carVin}/statistics`, {
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

	async getTyresStatus(access_token) {
		try {
			const response = await got(`${this.apiBaseUrl}/connected-vehicle/v2/vehicles/${this.carVin}/tyres`, {
				headers: {
					'User-Agent': 'MMM-VolvoCar',
					'Authorization': `Bearer ${access_token}`,
					'vcc-api-key': this.vcc_api_key,
					'accept': 'application/json'
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

	async getVehicleDetails(access_token) {
		try {
			const response = await got(`${this.apiBaseUrl}/connected-vehicle/v2/vehicles/${this.carVin}`, {
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

	async getWarnings(access_token) {
		try {
			const response = await got(`${this.apiBaseUrl}/connected-vehicle/v2/vehicles/${this.carVin}/warnings`, {
				headers: {
					'User-Agent': 'MMM-VolvoCar',
					'Authorization': `Bearer ${access_token}`,
					'vcc-api-key': this.vcc_api_key,
					'accept': 'application/json'
				}
			});
			// Parse result and create new object
			const result = JSON.parse(response.body);
			const newObject = {
				status: result.status,
				operationId: result.operationId,
				data: {
					warnings: {
						brakeLightLeftWarning: result.data.brakeLightLeftWarning,
						brakeLightCenterWarning: result.data.brakeLightCenterWarning,
						brakeLightRightWarning: result.data.brakeLightRightWarning,
						fogLightFrontWarning: result.data.fogLightFrontWarning,
						fogLightRearWarning: result.data.fogLightRearWarning,
						positionLightFrontLeftWarning: result.data.positionLightFrontLeftWarning,
						positionLightFrontRightWarning: result.data.positionLightFrontRightWarning,
						positionLightRearLeftWarning: result.data.positionLightRearLeftWarning,
						positionLightRearRightWarning: result.data.positionLightRearRightWarning,
						highBeamLeftWarning: result.data.highBeamLeftWarning,
						highBeamRightWarning: result.data.highBeamRightWarning,
						lowBeamLeftWarning: result.data.lowBeamLeftWarning,
						lowBeamRightWarning: result.data.lowBeamRightWarning,
						daytimeRunningLightLeftWarning: result.data.daytimeRunningLightLeftWarning,
						daytimeRunningLightRightWarning: result.data.daytimeRunningLightRightWarning,
						turnIndicationFrontLeftWarning: result.data.turnIndicationFrontLeftWarning,
						turnIndicationFrontRightWarning: result.data.turnIndicationFrontRightWarning,
						turnIndicationRearLeftWarning: result.data.turnIndicationRearLeftWarning,
						turnIndicationRearRightWarning: result.data.turnIndicationRearRightWarning,
						registrationPlateLightWarning: result.data.registrationPlateLightWarning,
						sideMarkLightsWarning: result.data.sideMarkLightsWarning,
						hazardLightsWarning: result.data.hazardLightsWarning,
						reverseLightsWarning: result.data.reverseLightsWarning,
					}
				}
			}
			return newObject
		} catch (error) {
			Log.error(error);
		}
	}
}

module.exports = VolvoApis