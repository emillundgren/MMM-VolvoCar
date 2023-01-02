# MMM-VolvoCar

A MagicMirror Module for displaying data from your Volvo car

[![Platform](https://img.shields.io/badge/platform-MagicMirror-informational)](https://MagicMirror.builders)
[![License](https://img.shields.io/badge/license-MIT-informational)](https://raw.githubusercontent.com/emillundgren/MMM-VolvoCar/master/LICENSE)
[![Known Vulnerabilities](https://snyk.io/test/github/emillundgren/MMM-VolvoCar/badge.svg)](https://snyk.io/test/github/emillundgren/MMM-VolvoCar)


![Example Screenshot](../assets/example.png?raw=true)

## Installation
To use this module, you simply need to clone this repository into your Magic Mirror's modules folder

1. Navigate to the `modules` folder
	```bash
	cd ~/MagicMirror/modules
	```
2. Clone the repository
	```bash
	git clone https://github.com/emillundgren/MMM-VolvoCar.git
	```
3. Add the module to your Magic Mirror by copying the [Sample Config](#sample-config) below and add that to your `config.js`
4. Start your Magic Mirror and press the Authenticate link. <br> _For more details about authentication see the [Authentication](AUTHENTICATION.md) section_

## Sample Config
Here's an example of a basic config for the module. See full list of available settings below under [Configuration](#configuration)
```javascript
{
	module: "MMM-VolvoCar",
	position: "top_right",
	header: "My Volvo Car",
	config: {
		// SETTINGS: Authorization
		authClientId: 'CHANGE_FOR_YOUR_CLIENT_ID',
		authClientSecret: 'CHANGE_FOR_YOUR_CLIENT_SECRET',
		authVccApiKey: 'CHANGE_FOR_YOUR_VCC_API_KEY',

		// SETTINGS: Car
		carType: 'hybrid',
		carVin: 'CHANGE_FOR_YOUR_CAR_VIN',
		carFuelTankSize: 60,
	}
},
```

## Configuration
| **Setting** | **Description**|
| --- | --- |
| `moduleDataRefreshInterval` | The interval for which the data shown inthe module is refreshed <br><br> <ul><li>**Type:** `number`</li><li>**Default:** `10 * 60 * 1000`</li></ul> |
| `authUrl` | The OAuth2 Authorixation URL for the Volvo API <br><br> <ul><li>**Type:** `string`</li><li>**Default:** `https://volvoid.eu.volvocars.com/as/authorization.oauth2`</li></ul> |
| `authTokenUrl` | The OAuth2 Token URL for the Volvo API <br><br> <ul><li>**Type:** `string`</li><li>**Default:** `https://volvoid.eu.volvocars.com/as/token.oauth2`</li></ul> |
| `authRedirectUri` | 	The OAuth2 Redirect Callback URL on our module <br><br> <ul><li>**Type:** `string`</li><li>**Default:** `http://localhost:8080/MMM-VolvoCar/callback`</li></ul> |
| `authScope` | The needed scopes from the Volvo API <br><br> <ul><li>**Type:** `string`</li><li>**Default:** `openid`</li></ul> |
| `authClientId` | Your Volvo API application's client_id <br><br> <ul><li>**Type:** `string`</li><li>**Default:** `null`</li></ul> |
| `authClientSecret` | Your Volvo API application's client_secret <br><br> <ul><li>**Type:** `string`</li><li>**Default:** `null`</li></ul> |
| `authVccApiKey` | Your Volvo API application's api key <br><br> <ul><li>**Type:** `string`</li><li>**Default:** `null`</li></ul> |
| `authTokenFile` | The path for where to store the access_token from the Volvo API <br><br> <ul><li>**Type:** `string`</li><li>**Default:** `./modules/MMM-VolvoCar/tokens.json`</li></ul> |
| `apiBaseUrl` | The base URL for the Volvo API <br><br> <ul><li>**Type:** `string`</li><li>**Default:** `https://api.volvocars.com`</li></ul> |
| `apiUseSampleDataFile` | Used to decide if you want to use real data from the API or sample data from the provided file <br><br> <ul><li>**Type:** `boolean`</li><li>**Default:** `false`</li><li>**Possible values:** `true` or `false`</li></ul> |
| `apiSampleDataFile` | The path for where your sample data are stored <br><br> <ul><li>**Type:** `string`</li><li>**Default:** `./modules/MMM-VolvoCar/sampleData.json`</li></ul> |
| `carType` | The type of car. Used to to decide what info should be shown <br><br> <ul><li>**Type:** `string`</li><li>**Default:** `null`</li><li>**Possible values:** `electric` or `hybrid` or `petrol` or `diesel`</li></ul> |
| `carVin` | The VIN-code of your car. Used in API-calls to fetch the data from your car <br><br> <ul><li>**Type:** `string`</li><li>**Default:** `null`</li></ul> |
| `carFuelTankSize` | The size of your fuel tank. <br> _Currently needed as this data is not available in the API_ <br><br> <ul><li>**Type:** `number`</li><li>**Default:** `60`</li></ul> |
| `hideStatusbar` | Boolean to decide if the statusbars, displaying battery/fuel percentage, should be shown <br><br> <ul><li>**Type:** `boolean`</li><li>**Default:** `false`</li><li>**Possible values:** `true` or `false`</li></ul> |
| `hideInfoIcons` | Boolean to decide if the default info icons should be shown <br><br> <ul><li>**Type:** `boolean`</li><li>**Default:** `false`</li><li>**Possible values:** `true` or `false`</li></ul> |
| `hideAlertIcons` | Boolean to decide if the alert icons should be shown <br><br> <ul><li>**Type:** `boolean`</li><li>**Default:** `false`</li><li>**Possible values:** `true` or `false`</li></ul> |
| `hideLastUpdated` | Boolean to decide if the last updated timestamp should be shown <br><br> <ul><li>**Type:** `boolean`</li><li>**Default:** `false`</li><li>**Possible values:** `true` or `false`</li></ul> |
| `useStatusbarColor` | Boolean to decide if the statusbars should show color when getting low. <br> _Red between values of `statusbarColorDangerMinMax`_ <br> _Yellow between values of `statusbarColorWarnMinMax`_ <br><br> <ul><li>**Type:** `boolean`</li><li>**Default:** `true`</li><li>**Possible values:** `true` or `false`</li></ul> |
| `statusbarColorDangerMinMax` | The `min`/`max` percentage values for when to show the warning color <br><br> <ul><li>**Type:** `array` consisting of two `number`</li><li>**Default:** `[0,10]`</li></ul> |
| `statusbarColorWarnMinMax` | The `min`/`max` percentage values for when to show the warning color <br><br> <ul><li>**Type:** `array` consisting of two `number`</li><li>**Default:** `[11,20]`</li></ul> |
| `dateFormat` | The format in which dates should be shown. <br> _Using moment.js, more info could be found on [momentjs.com](https://momentjs.com/docs)_ <br><br> <ul><li>**Type:** `string`</li><li>**Default:** `YYYY-MM-DD HH:mm:ss`</li></ul> |