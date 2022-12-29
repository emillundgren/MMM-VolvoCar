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
		updateInterval: 10 * 60 * 1000,
		client_id: null,
		client_secret: null,
		vcc_api_key: null,
		car_vin: null,
		car_type: null,
		fuel_tank_capacity: 60,
		display: {
			statusbar: true,
			info_icons: true,
			alert_icons: true,
			statusbar_color: {
				active: true,
				warning: {
					from: 20,
					until: 11
				},
				danger: {
					from: 10,
					until: 0
				}
			}
		},
	}
},
```

## Configuration options
| **Option** | **Description**| **Default value** | **Possible values** |
| --- | --- | --- | --- |
| `updateInterval` | How often the module should fetch new data from the APIs (milliseconds) | `10 * 60 * 1000` _10 minutes_ | Any positive integer (milliseconds) |
| `client_id` | The client_id for your application. See Authorization | `null` | A string with the client_id |
| `client_secret` | The client_secret for your application. See Authorization | `null` | A string with the client_secret |
| `vcc_api_key` | The vcc_api_key for your application. See Authorization | `null` | A string with the vcc_api_key |
| `car_vin` | The VIN-code for your car. | `null` | A string with the VIN-code |
| `car_type` | The type of car | `null` | `electric` or `hybrid` or `petrol` or `diesel` |
| `fuel_tank_capacity` | The size of your fuel tank. _Only needed if  your `car_type` is not `electric`_ | `60` | Any positive integer |
| `display` | See more under Configuration options - Display |  |  |

## Configuration options - Display
| **Option** | **Description**| **Default value** | **Possible values** |
| --- | --- | --- | --- |
| `statusbar` | Show or hide the statusbars | `true` | `true` or `false` |
| `info_icons` | Show or hide the info icons | `true` | `true` or `false` |
| `alert_icons` | Show or hide the alert icons | `true` | `true` or `false` |
| `statusbar_color` | See more under Configuration options - Display - Statusbar Color |  |  |

## Configuration options - Display - Statusbar Color
| **Option** | **Description**| **Default value** | **Possible values** |
| --- | --- | --- | --- |
| `active` | Active or inactivate the warning colors on the statusbar | `true` | `true` or `false` |
| `warning` | Set the `from`/`until` values for when the warning color should be displayed | `{ from: 20, until: 11 },` | `from` and `until` take any positive integer between `0` and `100` |
| `danger` | Set the `from`/`until` values for when the danger color should be displayed | `{ from: 20, until: 11 },` | `from` and `until` take any positive integer between `0` and `100` |
