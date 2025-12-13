const NodeHelper = require("node_helper");
const express = require("express");
const fs = require('fs');
const fsp = require('fs').promises;
const VolvoOAuth = require("./vcapi/oauth");
const VolvoApiClient = require("./vcapi/api");
const QRCode = require("qrcode");

module.exports = NodeHelper.create({

    start() {
        this.instances = {};
        this.endpointsRegistered = false;
    },

    getInstance(identifier, config = null) {
        if (!this.instances[identifier]) {
            this.instances[identifier] = {
                config,
                oauth: null,
                api: null
            };
        }
        return this.instances[identifier];
    },

    socketNotificationReceived(notification, payload) {
        console.log(`${this.name} [node_helper]: Received a socket notification - ${notification}`)
        
        if (notification === "MMMVC_INIT_MODULE") {
            // Setup an instnace of the module
            const { identifier, config } = payload;
            const instance = this.getInstance(identifier, config);
            instance.config = config;
            instance.oauth  = new VolvoOAuth(config);
            instance.api    = new VolvoApiClient(instance.oauth, config);

            // Verify that all needed config parameters is set
            if (!instance.config.authClientId) {console.error(`${this.name} [node_helper]: The config value 'authClientId' is needed for the module to work`); return;}
            if (!instance.config.authClientSecret) {console.error(`${this.name} [node_helper]: The config value 'authClientSecret' is needed for the module to work`); return;}
            if (!instance.config.apiKey) {console.error(`${this.name} [node_helper]: The config value 'apiKey' is needed for the module to work`); return;}
            if (!instance.config.carVin) {console.error(`${this.name} [node_helper]: The config value 'carVin' is needed for the module to work`); return;}

            if (!this.endpointsRegistered) {
                this.registerModuleEndpoints();
                this.endpointsRegistered = true;
            }
            this.checkAuthStatus(instance, identifier);
        }

        if(notification === "MMMVC_GENERATE_QR_CODE") {
            QRCode.toDataURL(payload.authUrl, {
                width: 300,
            })
            .then((qrCodeUrl) => {
                this.sendSocketNotification("MMMVC_SHOW_AUTH", {
                    identifier: payload.identifier,
                    qrCode: qrCodeUrl,
                });
            })
            .catch((error) => {
                console.error(`${this.name} [node_helper]: Error generating QR code`);
            })
        }

        if(notification === "MMMVC_FETCH_DATA") {
            const { identifier } = payload;
            const instance = this.instances[identifier];
            if (!instance) return;

            // Use the Sample Data instead of the API
            if (instance.config.apiUseSampleDataFile && fs.existsSync(instance.config.apiSampleDataFile)) {
                console.log(`${this.name} [node_helper]: Displaying data from ${instance.config.apiSampleDataFile} instead of using the API`);
                const apiSampleData = JSON.parse(fs.readFileSync(instance.config.apiSampleDataFile, 'utf8'));

                // Download the header image if it does not already exist 
                if (!fs.existsSync(instance.config.headerImageFile)) {
                    this.downloadHeaderImage(apiSampleData.vehicleDetails.data.images.exteriorImageUrl, instance.config.headerImageFile, identifier);
                }
                
				this.sendSocketNotification('MMMVC_REDRAW_MODULE', { 
                    identifier,
                    data: apiSampleData
                });
                return;
            }
            
            // Fetch all API data
            instance.api.getAllData()
            .then((carData) => {
                // Download the header image if it does not already exist 
                if (!fs.existsSync(instance.config.headerImageFile)) {
                        this.downloadHeaderImage(carData.vehicleDetails.data.images.exteriorImageUrl, instance.config.headerImageFile, identifier);
                    }

                    this.sendSocketNotification('MMMVC_REDRAW_MODULE', { 
                        identifier,
                        data: carData
                    });
                }) 
                .catch(error => {
                    console.error(error);
                    this.sendSocketNotification('MMMVC_FETCH_ERROR', {
                        identifier
                    });
                });
        }
    },

    async checkAuthStatus(instance, identifier) {
        if (instance.config.apiUseSampleDataFile) {
            this.sendSocketNotification("MMMVC_AUTH_SUCCESSFUL", { 
                identifier
            });
            return;
        }

        try {
            const accessToken = await instance.oauth.getValidAccessToken();

            if (accessToken) {
                console.log(`${this.name} [node_helper]: Authentication OK - valid token available`);
                this.sendSocketNotification("MMMVC_AUTH_SUCCESSFUL", { 
                    identifier
                });
                return;
            }

        } catch (error) {
            console.error(`${this.name} [node_helper]: Error while checking token:`, error);
        }

        // No access token → user must log in
        console.log(`${this.name} [node_helper]: No valid token → login required.`);
        this.sendSocketNotification("MMMVC_AUTH_NEEDED", { 
            identifier
        });
    },

    registerModuleEndpoints() {
        const router = express.Router();

        router.get("/generate-url/:identifier", (request, result) => {
            const identifier = request.params.identifier;
            const instance = this.instances[identifier];

            if (!instance) {
                result.status(404).send("Unknown instance");
                return;
            }
            const authurl = instance.oauth.getAuthorizationUrl(identifier);
            result.send(authurl);
        });

        router.get("/callback", async (request, result) => {
            const { code, state } = request.query;

            const lastDot = state.lastIndexOf(".");
            if (lastDot === -1) {
                res.status(400).send("Invalid state format");
                return;
            }

            const oauthState = state.slice(0, lastDot);
            const identifier = state.slice(lastDot + 1);

            const instance = this.instances[identifier];
            if (!instance) {
                result.status(400).send("Invalid instance");
                return;
            }

            if (oauthState !== instance.oauth.state.split(".")[0]) {
                result.status(400).send("State mismatch");
                return;
            }

            try {
                await instance.oauth.exchangeCodeForToken(code);
                this.sendSocketNotification("MMMVC_AUTH_SUCCESSFUL", {
                    identifier
                });

                result.send("<h2>MMM-VolvoCar: Login successful ✔</h2><p>You may close this window.</p>");

            } catch (error) {
                console.error("Token exchange failed:", error);
                result.status(500).send("Token exchange failed");
            }
        });

        this.expressApp.use("/MMM-VolvoCar", router);
    },

    downloadHeaderImage: async function (imageUrl, localPath, identifier) {
        var self = this;

        // Find the image filename and make sure it's set to default.png
        const imageUrlRegEx = /(?<filename>[\w-]+)(?<fileseparator>\.)(?<fileextension>jpeg|jpg|png|gif)/g
        const imageUrlFixed = imageUrl.replace(imageUrlRegEx, "default.png");

        // Adjusted image-parameters for the view we want
        const urlParamsToModify = {
            w: 720,
            bg: '00000000',
            angle: 3,
        }

        // Modify the incoming URL with the new image-parameters
        const modifiedUrl = new URL(imageUrlFixed);
        for (const [key, value] of Object.entries(urlParamsToModify)) {
            modifiedUrl.searchParams.set(key, value);
        }

        try {
            // Fetch the image data as an array buffer
            const response = await fetch(modifiedUrl, {
                headers: {
                    "User-Agent": "Mozilla/5.0 (MagicMirror Module)",
                },
            });
            const arrayBuffer = await response.arrayBuffer();
        
            // Write the array buffer to the file
            await fsp.writeFile(localPath, Buffer.from(arrayBuffer));
        
            console.info(`${this.name} [node_helper]: headerImage downloaded successfully:`, localPath);
            this.sendSocketNotification("MMMVC_UPDATE_DOM", {
                identifier
            });
            } catch (error) {
            console.error(`${this.name} [node_helper]: Error downloading image:`, error);
        }
    },
});
