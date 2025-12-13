# MMM-VolvoCar Change Log

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/)
and this project adheres to [Semantic Versioning](http://semver.org/).

## [3.0.0] - 2025-12-13

### Changed

- Implemented the correct OAuth flow for Volvo API
- Added possibility for running multiple instances of the module
- Update the templates


## [2.2.2] - 2025-08-01

### Changed

- Adjusted Energy API call to v2
- Added ClientId and ClientSecret to the config and the get/refresh_token calls
- Adjusted the names of some api-parameters in the template
- Temporary fix to refresh OAuth2 token

## [2.2.1] - 2023-12-24

### Changed

- Adjust the output from the location api call

### Fixed

- Fixed a typo in the translation strings

## [2.2.0] - 2023-12-23

### Added

- Added new api call to get car warnings
- Display of new warning icons
- Adjusted logic how average fuel/energy consumption is shown

### Changed

- Changed to the v2 of connected-vehicle api

### Fixed

- Fixed the method to download the image of the car

### Removed

- The setting carType was removed as that data is now available through the API

## [2.1.0] - 2023-09-22

### Added

- Default scopes for OAuth
- New data from the API: Engine status

### Changed

- Adjusted the logic for downloading the header image

## [2.0.0] - 2023-07-31

### Added

- Added support for the new Locations API

### Changed

- Changed OAuth 2.0 to the password flow
- Some minor adjustments on the layout


## [1.2.0] - 2023-03-30

### Added

- Added function that make sure to always use default.png for the header image url

### Fixed

- Added `accept` headers to the API-calls
- Adjusted to new output from the API-calls for Door and Window status

## [1.1.0] - 2023-01-22

### Added

- Added translation possibility to template
- Added translations for English and Swedish

## [1.0.0] - 2023-01-04

### Initial release of MMM-VolvoCar