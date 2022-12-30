# MMM-VolvoCar

A MagicMirror Module for displaying data from your Volvo car

[![Platform](https://img.shields.io/badge/platform-MagicMirror-informational)](https://MagicMirror.builders)
[![License](https://img.shields.io/badge/license-MIT-informational)](https://raw.githubusercontent.com/emillundgren/MMM-VolvoCar/master/LICENSE)
[![Known Vulnerabilities](https://snyk.io/test/github/emillundgren/MMM-VolvoCar/badge.svg)](https://snyk.io/test/github/emillundgren/MMM-VolvoCar)


![Example Screenshot](../assets/example.png?raw=true)

## Sample Config
```javascript
{
	module: "MMM-VolvoCar",
	position: "top_right",
	header: "test header",
	config: {
		moduleDataRefreshInterval: 10 * 60 * 1000,

		// SETTINGS: Authorization
		authUrl: 'https://volvoid.eu.volvocars.com/as/authorization.oauth2',
		authTokenUrl: 'https://volvoid.eu.volvocars.com/as/token.oauth2',
		authRedirectUri: 'http://localhost:8080/MMM-VolvoCar/callback',
		authScope: 'openid',
		authClientId: null,
		authClientSecret: null,
		authVccApiKey: null,
		authTokenFile: './modules/MMM-VolvoCar/tokens.json',

		// SETTINGS: API
		apiBaseUrl: 'https://api.volvocars.com',
		apiUseSampleDataFile: false,
		apiSampleDataFile: './modules/MMM-VolvoCar/sampleData.json',

		// SETTINGS: Car
		carType: null,
		carVin: null,
		carFuelTankSize: 60,

		// SETTINGS: Display
		hideStatusbar: false,
		hideInfoIcons: false,
		hideAlertIcons: false,
		useStatusbarColor: true,
		statusbarColorDangerMinMax: [0, 10],
		statusbarColorWarnMinMax: [11, 20],
	}
},
```

## Configuration options
| **Option** | **Description**| **Type** | **Default** | **Possible values** |
| --- | --- | --- | --- | --- |
| `moduleDataRefreshInterval` | The interval for which the data shown inthe module is refreshed | `number` | `10 * 60 * 1000` | |
| `authUrl` | The OAuth2 Authorixation URL for the Volvo API | `string` | `https://volvoid.eu.volvocars.com/as/authorization.oauth2` | |
| `authTokenUrl` | The OAuth2 Token URL for the Volvo API | `string` | `https://volvoid.eu.volvocars.com/as/token.oauth2` | |
| `authRedirectUri` | The OAuth2 Redirect Callback URL on our module | `string` | `http://localhost:8080/MMM-VolvoCar/callback` | |
| `authScope` | The needed scopes from the Volvo API | `string` | `openid` | |
| `authClientId` | Your Volvo API application's client_id | `string` | `null` | |
| `authClientSecret` | Your Volvo API application's client_secret | `string` | `null` | |
| `authVccApiKey` | Your Volvo API application's api key | `string` | `null` | |
| `authTokenFile` | The path for where to store the access_token from the Volvo API | `string` | `./modules/MMM-VolvoCar/tokens.json` |  |
| `apiBaseUrl` | The base URL for the Volvo API | `string` | `https://api.volvocars.com` | |
| `apiUseSampleDataFile` | Used to decide if you want to use real data from the API or sample data from the provided file | `boolean` | `false` | `true` or `false` |
| `apiSampleDataFile` | The path for where your sample data are stored | `string` | `./modules/MMM-VolvoCar/sampleData.json` | |
| `carType` | The type of car. Used to to decide what info should be shown | `string` | `null` | `electric` or `hybrid` or `petrol` or `diesel` |
| `carVin` | The VIN-code of your car. Used in API-calls to fetch the data from your car | `string` | `null` | |
| `carFuelTankSize` | The size of your fuel tank. <br> _Currently needed as this data is not available in the API_ | `number` | `60` | |
| `hideStatusbar` | Boolean to decide if the statusbars, displaying battery/fuel percentage, should be shown | `boolean` | `false` | `true` or `false` |
| `hideInfoIcons` | Boolean to decide if the default info icons should be shown | `boolean` | `false` | `true` or `false` |
| `hideAlertIcons` | Boolean to decide if the alert icons should be shown | `boolean` | `false` | `true` or `false` |
| `useStatusbarColor` | Boolean to decide if the statusbars should show color when getting low. <br> _Red between values of `statusbarColorDangerMinMax`_ <br>_Yellow between values of `statusbarColorWarnMinMax`_ | `boolean` | `true` | `true` or `false` |
| `statusbarColorDangerMinMax` | The `min`/`max` percentage values for when to show the danger color | `array` consiting of two `number` | `[0, 10]` | `array` with two valid `number` between `0` and `100` |
| `statusbarColorWarnMinMax` | The `min`/`max` percentage values for when to show the warning color | `array` consiting of two `number` | `[11, 20]` | `array` with two valid `number` between `0` and `100` |