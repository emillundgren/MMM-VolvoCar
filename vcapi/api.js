const got = require("got");

class VolvoApiClient {

    constructor(oauth, config) {
        this.oauth = oauth;
        this.carVin = config.carVin;
        this.apiKey = config.apiKey;
        this.base = config.apiBaseUrl;
    }

    async makeRequest(path) {
        const accessToken = await this.oauth.getValidAccessToken();

        const url = `${this.base}${path}`;

        const response = await got(url, {
            responseType: "json",
            headers: {
                "Authorization": `Bearer ${accessToken}`,
                "vcc-api-key": this.apiKey
            }
        });

        return response.body;
    }

    // Energy API
    getEnergyState() {return this.makeRequest(`/energy/v2/vehicles/${this.carVin}/state`);}
    
    // Location API
    getLocation() {return this.makeRequest(`/location/v1/vehicles/${this.carVin}/location`);}
    
    // Connected Vehicle API
    getEngineDiagnostic() {return this.makeRequest(`/connected-vehicle/v2/vehicles/${this.carVin}/engine`);}
    getDiagnostics() {return this.makeRequest(`/connected-vehicle/v2/vehicles/${this.carVin}/diagnostics`);}
    getBrakeFluidLevel() {return this.makeRequest(`/connected-vehicle/v2/vehicles/${this.carVin}/brakes`);}
    getWindowStatus() {return this.makeRequest(`/connected-vehicle/v2/vehicles/${this.carVin}/windows`);}
    getDoorAndLockStatus() {return this.makeRequest(`/connected-vehicle/v2/vehicles/${this.carVin}/doors`);}
    getEngineStatus() {return this.makeRequest(`/connected-vehicle/v2/vehicles/${this.carVin}/engine-status`);}
    getFuelAmount() {return this.makeRequest(`/connected-vehicle/v2/vehicles/${this.carVin}/fuel`);}
    getOdometer() {return this.makeRequest(`/connected-vehicle/v2/vehicles/${this.carVin}/odometer`);}
    getStatistics() {return this.makeRequest(`/connected-vehicle/v2/vehicles/${this.carVin}/statistics`);}
    getTyresStatus() {return this.makeRequest(`/connected-vehicle/v2/vehicles/${this.carVin}/tyres`);}
    getVehicleDetails() {return this.makeRequest(`/connected-vehicle/v2/vehicles/${this.carVin}`);}
    getWarnings() {return this.makeRequest(`/connected-vehicle/v2/vehicles/${this.carVin}/warnings`);}

    async getAllData() {
        try {
            return await Promise.all([
                // Energy API
                this.getEnergyState(),

                // Location API
                this.getLocation(),

                // Connected Vehicle API
                this.getEngineDiagnostic(),
                this.getDiagnostics(),
                this.getBrakeFluidLevel(),
                this.getWindowStatus(),
                this.getDoorAndLockStatus(),
                this.getEngineStatus(),
                this.getFuelAmount(),
                this.getOdometer(),
                this.getStatistics(),
                this.getTyresStatus(),
                this.getVehicleDetails(),
                this.getWarnings(),
            ]).then(results => ({
                // Energy API
                energyState: results[0],

                // Location API
                location: results[1],

                // Connected Vehicle API
                engineDiagnostic: results[2],
                diagnostics: results[3],
                brakeFluidLevel: results[4],
                windowStatus: results[5],
                doorAndLockStatus: results[6],
                engineStatus: results[7],
                fuelAmount: results[8],
                odometer: results[9],
                statistics: results[10],
                tyreStatus: results[11],
                vehicleDetails: results[12],
                warnings: results[13],
            }));
        } catch (err) {
            console.error("MMM-VolvoCar [api]: Volvo API error:", err);
            throw err;
        }
    }
}

module.exports = VolvoApiClient;
