const NodeHelper = require("node_helper");
const express = require("express");
const fs = require('fs');
const fsp = require('fs').promises;
const VolvoOAuth = require("./vcapi/oauth");
const VolvoApiClient = require("./vcapi/api");
const QRCode = require("qrcode");

module.exports = NodeHelper.create({

    start() {
        this.oauth = null;
    },

    downloadHeaderImage: async function (imageUrl, localPath) {
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
            this.sendSocketNotification("MMMVC_UPDATE_DOM");
            } catch (error) {
            console.error(`${this.name} [node_helper]: Error downloading image:`, error);
        }
    },	

    socketNotificationReceived(notification, payload) {
        console.log(`${this.name} [node_helper]: Received a socket notification - ${notification}`)
        
        if (notification === "MMMVC_INIT_MODULE") {
            // Set the config from the main module to the node_helper
            this.config = payload;

            // Verify that all needed config parameters is set
            if (!this.config.authClientId) {console.error(`${this.name} [node_helper]: The config value 'authClientId' is needed for the module to work`); return;}
            if (!this.config.authClientSecret) {console.error(`${this.name} [node_helper]: The config value 'authClientSecret' is needed for the module to work`); return;}
            if (!this.config.apiKey) {console.error(`${this.name} [node_helper]: The config value 'apiKey' is needed for the module to work`); return;}
            if (!this.config.carVin) {console.error(`${this.name} [node_helper]: The config value 'carVin' is needed for the module to work`); return;}

            // Setup instance of VolvoOAuth and VolvoApiClient
            this.oauth = new VolvoOAuth(this.config);
            this.api = new VolvoApiClient(this.oauth, this.config);

            // TODO: Check if we can avoid creating the express-server when already authenticated?
            this.registerModuleEndpoints();
            this.checkAuthStatus();
        }

        if(notification === "MMMVC_GENERATE_QR_CODE") {
            console.debug(`${this.name} [node_helper]: Got an authUrl to generate QR-code for - ${payload}`);
            QRCode.toDataURL(payload, {
                width: 300,
            })
            .then((qrCodeUrl) => {
                this.sendSocketNotification("MMMVC_SHOW_AUTH", qrCodeUrl);
            })
            .catch((error) => {
                console.error(`${this.name} [node_helper]: Error generating QR code`);
            })
        }

        if(notification === "MMMVC_FETCH_DATA") {
            // Use the Sample Data instead of the API
            if (this.config.apiUseSampleDataFile && fs.existsSync(this.config.apiSampleDataFile)) {
                console.log(`${this.name} [node_helper]: Displaying data from ${this.config.apiSampleDataFile} instead of using the API`);
                const apiSampleData = JSON.parse(fs.readFileSync(this.config.apiSampleDataFile, 'utf8'));

                // Download the header image if it does not already exist 
                if (!fs.existsSync(this.config.headerImageFile)) {
                    console.debug(`${this.name} [node_helper]: headerImage missing, trying to download...`)
                    this.downloadHeaderImage(apiSampleData.vehicleDetails.data.images.exteriorImageUrl, this.config.headerImageFile);
                } else {
                    console.debug(`${this.name} [node_helper]: headerImage already exists, no need to download again.`)
                }
                
				this.sendSocketNotification('MMMVC_REDRAW_MODULE', apiSampleData);
                console.debug(JSON.stringify(apiSampleData, null, 4));
                return;
            }
            
            // Fetch all API data
            this.api.getAllData()
            .then((carData) => {
                // Download the header image if it does not already exist 
                if (!fs.existsSync(this.config.headerImageFile)) {
                        console.debug(`${this.name} [node_helper]: headerImage missing, trying to download...`)
                        this.downloadHeaderImage(carData.vehicleDetails.data.images.exteriorImageUrl, this.config.headerImageFile);
                    } else {
                        console.debug(`${this.name} [node_helper]: headerImage already exists, no need to download again.`)
                    }

                    this.sendSocketNotification('MMMVC_REDRAW_MODULE', carData);
                    console.debug(JSON.stringify(carData, null, 4));
                }) 
                .catch(err => console.error(err));
        }
    },

    async checkAuthStatus() {
        if (this.config.apiUseSampleDataFile) {
            this.sendSocketNotification("MMMVC_AUTH_SUCCESSFUL");
            return;
        }

        try {
            const accessToken = await this.oauth.getValidAccessToken();

            if (accessToken) {
                console.log(`${this.name} [node_helper]: Authentication OK - valid token available`);
                this.sendSocketNotification("MMMVC_AUTH_SUCCESSFUL");
                return;
            }

        } catch (err) {
            console.error(`${this.name} [node_helper]: Error while checking token:`, err);
        }

        // No access token → user must log in
        console.log(`${this.name} [node_helper]: No valid token → login required.`);
        this.sendSocketNotification("MMMVC_AUTH_NEEDED");
    },

    registerModuleEndpoints() {
        const router = express.Router();

        router.get("/generate-url", (request, result) => {
            result.send(this.oauth.getAuthorizationUrl());
        });

        router.get("/callback", async (request, result) => {
            const code = request.query.code;
            const state = request.query.state;

            if (state !== this.oauth.state) {
                result.status(400).send("State mismatch");
                return;
            }

            try {
                await this.oauth.exchangeCodeForToken(code);
                this.sendSocketNotification("MMMVC_AUTH_SUCCESSFUL");

                result.send("<h2>MMM-VolvoCar: Login successful ✔</h2><p>You may close this window.</p>");

            } catch (err) {
                console.error("Token exchange failed:", err);
                result.status(500).send("Token exchange failed");
            }
        });

        this.expressApp.use("/MMM-VolvoCar", router);
    }
});
