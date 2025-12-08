const crypto = require("crypto");
const got = require("got");
const fs = require("fs");
const path = require("path");

class VolvoOAuth {

    constructor(config) {
        this.clientId = config.clientId;
        this.clientSecret = config.clientSecret;
        this.scope = config.scope;
        this.authUrl = config.authUrl;
        this.tokenUrl = config.tokenUrl;
        this.redirectUri = config.redirectUri;

        this.tokenFile = path.join(__dirname, "token.json");

        this.verifier = null;
        this.challenge = null;
        this.state = null;
        this.token = null;
        this.refreshPromise = null;

        this.loadToken();
    }

    loadToken() {
        if (fs.existsSync(this.tokenFile)) {
            try {
                this.token = JSON.parse(fs.readFileSync(this.tokenFile));
                console.debug(`MMM-VolvoCar [oauth]: Token loaded - ${JSON.stringify(this.token)}`);
                return true;
            } catch (e) {
                console.error("Failed to load token:", e);
            }
        }
        return false;
    }

    saveToken(body) {
        // Accept either a string (raw JSON) or an already-parsed object
        let data = body;
        if (typeof body === "string") {
            try {
                data = JSON.parse(body);
            } catch (err) {
                console.error("Unable to parse token body as JSON:", err);
                data = {};
            }
        }

        // Merge with existing token to preserve refresh_token if provider doesn't return one
        const token = {
            ...this.token,
            ...data,
            refresh_token: data.refresh_token ?? this.token?.refresh_token
        };

        // Only compute expires_at if expires_in is provided (some endpoints may not include it)
        if (typeof token.expires_in === "number") {
            token.expires_at = Date.now() + token.expires_in * 1000;
        } else if (!token.expires_at) {
            // fallback: set a conservative expiry (optional) or leave undefined
            token.expires_at = Date.now();
        }

        console.debug(`MMM-VolvoCar [oauth]: Saving new token: ${JSON.stringify(token)}`);
        fs.writeFileSync(this.tokenFile, JSON.stringify(token, null, 2));
        this.token = token;
    }

    isTokenValid() {
        if (!this.token) return false;
        return (this.token.expires_at > Date.now() + 10_000);
    }

    async getValidAccessToken() {
        if (this.isTokenValid()) {
            return this.token.access_token;
        }

        if (!this.token || !this.token.refresh_token) {
            return null;
        }

        if (this.refreshPromise) {
            await this.refreshPromise;
            return this.token?.access_token ?? null;
        }

        this.refreshPromise = this.refreshAccessToken()
            .finally(() => {
                this.refreshPromise = null;
            });

        const success = await this.refreshPromise;

        if (!success) {
            throw new Error("Unable to refresh token");
        }

        return this.token?.access_token ?? null;
    }

    async refreshAccessToken() {
        console.log("MMM-VolvoCar [oauth]: Refreshing the access_token")
        if (!this.token || !this.token.refresh_token) {
            console.error("MMM-VolvoCar [oauth]: No tokens available");
            return false;
        }

        const authHeader = "Basic " + Buffer.from(`${this.clientId}:${this.clientSecret}`).toString("base64");

        try {
            const response = await got.post(this.tokenUrl, {
                form: {
                    grant_type: "refresh_token",
                    refresh_token: this.token.refresh_token,
                    code_verifier: this.verifier
                },
                headers: {
                    "Authorization": authHeader,
                    "Content-Type": "application/x-www-form-urlencoded"
                },
                responseType: "json"
            });

            this.saveToken(response.body);
            return true;

        } catch (err) {
            console.error("Refresh token failed:", err.response?.statusCode, err.response?.body);
            return false;
        }
    }

    generateVerifier() {
        return crypto.randomBytes(32).toString("base64url");
    }

    generateChallenge(v) {
        return crypto.createHash("sha256").update(v).digest("base64url");
    }

    getAuthorizationUrl() {
        this.verifier = this.generateVerifier();
        this.challenge = this.generateChallenge(this.verifier);
        this.state = crypto.randomBytes(16).toString("hex");

        const p = new URLSearchParams({
            client_id: this.clientId,
            response_type: "code",
            redirect_uri: this.redirectUri,
            scope: this.scope,
            state: this.state,
            code_challenge: this.challenge,
            code_challenge_method: "S256"
        });

        return `${this.authUrl}?${p.toString()}`;
    }

    async exchangeCodeForToken(code) {
        const authHeader = "Basic " + Buffer.from(`${this.clientId}:${this.clientSecret}`).toString("base64");

        const response = await got.post(this.tokenUrl, {
            form: {
                grant_type: "authorization_code",
                code,
                redirect_uri: this.redirectUri,
                code_verifier: this.verifier
            },
            headers: {
                "Authorization": authHeader,
                "Content-Type": "application/x-www-form-urlencoded"
            },
            responseType: "json"
        });

        this.saveToken(response.body);
    }
}

module.exports = VolvoOAuth;