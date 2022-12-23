const got = require('got');

class VolvoApis {
    defaultOptions = {}
    
    async getAccountBase(access_token) {
        try {
            const response = await got('https://api.imgur.com/3/account/cykelstyre', {
                headers: {
                    'User-Agent': 'MagicMirror',
                    'Authorization': 'Bearer ' + access_token
                }
            });
            return response
        } catch (error) {
            console.log('error:', error)
        }
    }

    async getAccountSettings(access_token) {
        try {
            const response = await got('https://api.imgur.com/3/account/cykelstyre/verifyemail', {
                headers: {
                    'User-Agent': 'MagicMirror',
                    'Authorization': 'Bearer ' + access_token
                }
            });
            return response
        } catch (error) {
            console.log('error:', error)
        }
    }


}

module.exports = VolvoApis