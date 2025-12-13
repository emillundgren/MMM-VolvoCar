const crypto = require("crypto");
const fs = require("fs");

class VolvoOAuth {

    constructor(config) {
        this.authClientId = config.authClientId;
        this.authClientSecret = config.authClientSecret;
        this.authScope = config.authScope;
        this.authUrl = config.authUrl;
        this.authTokenUrl = config.authTokenUrl;
        this.authRedirectUri = config.authRedirectUri;

        this.authTokenFile = config.authTokenFile;

        this.verifier = null;
        this.challenge = null;
        this.state = null;
        this.token = null;
        this.refreshPromise = null;

        this.loadToken();
    }

    loadToken() {
        if (fs.existsSync(this.authTokenFile)) {
            try {
                this.token = JSON.parse(fs.readFileSync(this.authTokenFile));
                return true;
            } catch (e) {
                console.error("MMM-VolvoCar [oauth]: Failed to load token:", e);
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
                console.error("MMM-VolvoCar [oauth]: Unable to parse token body as JSON - ", err);
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

        fs.writeFileSync(this.authTokenFile, JSON.stringify(token, null, 2));
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

        const authHeader = "Basic " + Buffer.from(`${this.authClientId}:${this.authClientSecret}`).toString("base64");

        const formData = new URLSearchParams({
            grant_type: "refresh_token",
            refresh_token: this.token.refresh_token,
            code_verifier: this.verifier
        });

        try {
            const response = await fetch(this.authTokenUrl, {
                method: "POST",
                headers: {
                    "User-Agent": "Mozilla/5.0 (MagicMirror Module)",
                    "Authorization": authHeader,
                    "Content-Type": "application/x-www-form-urlencoded"
                },
                body:formData.toString()
            });

            if (!response.ok) {
                const errorBody = await response.text().catch(() => null);
                console.error(`MMM-VolvoCar [oauth]: Refresh token failed: ${response.status} ${response.statusText} — ${errorBody}`);
                return false;
            }

            const data = await response.json();

            this.saveToken(data);
            return true;
        } catch (error) {

        }
    }

    generateVerifier() {
        return crypto.randomBytes(32).toString("base64url");
    }

    generateChallenge(v) {
        return crypto.createHash("sha256").update(v).digest("base64url");
    }

    getAuthorizationUrl(identifier) {
        this.verifier = this.generateVerifier();
        this.challenge = this.generateChallenge(this.verifier);
        this.state = `${crypto.randomBytes(16).toString("hex")}.${identifier}`;

        const p = new URLSearchParams({
            response_type: "code",
            client_id: this.authClientId,
            redirect_uri: this.authRedirectUri,
            scope: this.authScope,
            state: this.state,
            code_challenge: this.challenge,
            code_challenge_method: "S256"
        });

        return `${this.authUrl}?${p.toString()}`;
    }

    async exchangeCodeForToken(code) {
        const authHeader = "Basic " + Buffer.from(`${this.authClientId}:${this.authClientSecret}`).toString("base64");
        const formData = new URLSearchParams({
            grant_type: "authorization_code",
            code: code,
            redirect_uri: this.authRedirectUri,
            code_verifier: this.verifier
        });

        try {
            const response = await fetch(this.authTokenUrl, {
                method: "POST",
                headers: {
                    "User-Agent": "Mozilla/5.0 (MagicMirror Module)",
                    "Authorization": authHeader,
                    "Content-Type": "application/x-www-form-urlencoded"
                },
                body: formData.toString()
            });

            // Manual error handling since fetch does not throw on HTTP error codes
            if (!response.ok) {
                const errorBody = await response.text().catch(() => null);
                throw new Error(
                    `MMM-VolvoCar [oauth]: Token exchange failed: ${response.status} ${response.statusText} — ${errorBody}`
                );
            }

            const data = await response.json();
            this.saveToken(data);

        } catch (err) {
            console.error("MMM-VolvoCar [oauth]: exchangeCodeForToken error:", err);
        }
    }
}

module.exports = VolvoOAuth;