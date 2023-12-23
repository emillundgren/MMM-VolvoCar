# MMM-VolvoCar

A MagicMirror Module for displaying data from your Volvo car

[![Platform](https://img.shields.io/badge/platform-MagicMirror-informational)](https://MagicMirror.builders)
[![License](https://img.shields.io/badge/license-MIT-informational)](https://raw.githubusercontent.com/emillundgren/MMM-VolvoCar/master/LICENSE)
[![Known Vulnerabilities](https://snyk.io/test/github/emillundgren/MMM-VolvoCar/badge.svg)](https://snyk.io/test/github/emillundgren/MMM-VolvoCar)


![Example Screenshot](../assets/example.gif?raw=true)

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

## Updating

1. Navigate to the `MMM-VolvoCar` folder
	```bash
	cd ~/MagicMirror/modules/MMM-VolvoCar
	```
2. Update the repository
	```bash
	git pull
	```

## Sample Config
Here's an example of a basic config for the module. See full list of available settings below under [Configuration](#configuration)
```javascript
{
	module: "MMM-VolvoCar",
	position: "top_right",
	header: "My Volvo Car",
	config: {
		// SETTINGS: Authorization
		authUsername: 'CHANGE_FOR_YOUR_CLIENT_ID',
		authPassword: 'CHANGE_FOR_YOUR_CLIENT_SECRET',
		authVccApiKey: 'CHANGE_FOR_YOUR_VCC_API_KEY',

		// SETTINGS: Car
		carVin: 'CHANGE_FOR_YOUR_CAR_VIN',
		carFuelTankSize: 60,
	}
},
```

## Configuration
| **Setting** | **Description**|
| --- | --- |
| `moduleDataRefreshInterval` | The interval for which the data shown inthe module is refreshed <br><br> <ul><li>**Type:** `number`</li><li>**Default:** `10 * 60 * 1000`</li></ul> |
| `authTokenUrl` | The OAuth2 Token URL for the Volvo API <br><br> <ul><li>**Type:** `string`</li><li>**Default:** `https://volvoid.eu.volvocars.com/as/token.oauth2`</li></ul> |
| `authScope` | The needed scopes from the Volvo API <br><br> <ul><li>**Type:** `string`</li><li>**Default:** `openid`</li></ul> |
| `authUsername` | The username of your Volvo Cars account <br><br> <ul><li>**Type:** `string`</li><li>**Default:** `null`</li></ul> |
| `authPassword` | The password of your Volvo Cars account <br><br> <ul><li>**Type:** `string`</li><li>**Default:** `null`</li></ul> |
| `authVccApiKey` | Your Volvo API application's api key <br><br> <ul><li>**Type:** `string`</li><li>**Default:** `null`</li></ul> |
| `authTokenFile` | The path for where to store the access_token from the Volvo API <br><br> <ul><li>**Type:** `string`</li><li>**Default:** `./modules/MMM-VolvoCar/assets/tokens.json`</li></ul> |
| `apiBaseUrl` | The base URL for the Volvo API <br><br> <ul><li>**Type:** `string`</li><li>**Default:** `https://api.volvocars.com`</li></ul> |
| `apiUseSampleDataFile` | Used to decide if you want to use real data from the API or sample data from the provided file <br><br> <ul><li>**Type:** `boolean`</li><li>**Default:** `false`</li><li>**Possible values:** `true` or `false`</li></ul> |
| `apiSampleDataFile` | The path for where your sample data are stored <br><br> <ul><li>**Type:** `string`</li><li>**Default:** `./modules/MMM-VolvoCar/assets/sampleData.json`</li></ul> |
| `carVin` | The VIN-code of your car. Used in API-calls to fetch the data from your car <br><br> <ul><li>**Type:** `string`</li><li>**Default:** `null`</li></ul> |
| `carFuelTankSize` | The size of your fuel tank. <br> _Currently needed as this data is not available in the API_ <br><br> <ul><li>**Type:** `number`</li><li>**Default:** `60`</li></ul> |
| `hideHeaderImage` | Boolean to decide if the header image of your car should be shown <br><br> <ul><li>**Type:** `boolean`</li><li>**Default:** `false`</li><li>**Possible values:** `true` or `false`</li></ul> |
| `headerImageLayout` | Choose between the different layouts for the header image <br><br> <ul><li>**Type:** `number`</li><li>**Default:** `1`</li><li>**Possible values:** `1` or `2`</li></ul> |
| `hideHeaderImageTextModel` | Boolean to decide if the header image text with car model should be shown <br><br> <ul><li>**Type:** `boolean`</li><li>**Default:** `false`</li><li>**Possible values:** `true` or `false`</li></ul> |
| `hideHeaderImageTextCustom` | Boolean to decide if the header image custom text with should be shown <br><br> <ul><li>**Type:** `boolean`</li><li>**Default:** `false`</li><li>**Possible values:** `true` or `false`</li></ul> |
| `headerImageCustomText` | Custom text to display in the header image, for example the registration number of the car, if you intend to display more than one car on your Magic Mirror <br><br> <ul><li>**Type:** `string`</li><li>**Default:** `null`</li></ul> |
| `headerImageFile` | The path for where your header image is stored <br><br> <ul><li>**Type:** `string`</li><li>**Default:** `./modules/MMM-VolvoCar/assets/headerImage.png`</li></ul> |
| `hideStatusbar` | Boolean to decide if the statusbars, displaying battery/fuel percentage, should be shown <br><br> <ul><li>**Type:** `boolean`</li><li>**Default:** `false`</li><li>**Possible values:** `true` or `false`</li></ul> |
| `useStatusbarChargingAnimation` | Boolean to decide if the statusbars charging animation should be used or not <br><br> <ul><li>**Type:** `boolean`</li><li>**Default:** `true`</li><li>**Possible values:** `true` or `false`</li></ul> |
| `useStatusbarColor` | Boolean to decide if the statusbars should show color when getting low. <br> _Red between values of `statusbarColorDangerMinMax`_ <br> _Yellow between values of `statusbarColorWarnMinMax`_ <br><br> <ul><li>**Type:** `boolean`</li><li>**Default:** `true`</li><li>**Possible values:** `true` or `false`</li></ul> |
| `statusbarColorDangerMinMax` | The `min`/`max` percentage values for when to show the warning color <br><br> <ul><li>**Type:** `array` consisting of two `number`</li><li>**Default:** `[0,10]`</li></ul> |
| `statusbarColorWarnMinMax` | The `min`/`max` percentage values for when to show the warning color <br><br> <ul><li>**Type:** `array` consisting of two `number`</li><li>**Default:** `[11,20]`</li></ul> |
| `hideInfoIcons` | Boolean to decide if the default info icons should be shown <br><br> <ul><li>**Type:** `boolean`</li><li>**Default:** `false`</li><li>**Possible values:** `true` or `false`</li></ul> |
| `hideAlertIcons` | Boolean to decide if the alert icons should be shown <br><br> <ul><li>**Type:** `boolean`</li><li>**Default:** `false`</li><li>**Possible values:** `true` or `false`</li></ul> |
| `hideLastUpdated` | Boolean to decide if the last updated timestamp should be shown <br><br> <ul><li>**Type:** `boolean`</li><li>**Default:** `false`</li><li>**Possible values:** `true` or `false`</li></ul> |
| `dateFormat` | The format in which dates should be shown. <br> _Using moment.js, more info could be found on [momentjs.com](https://momentjs.com/docs)_ <br><br> <ul><li>**Type:** `string`</li><li>**Default:** `YYYY-MM-DD HH:mm:ss`</li></ul> |