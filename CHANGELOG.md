# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

<!--When making a new release, remember to update the magic links at the bottom.-->

## [Unreleased]
- Add database field to track PlanItLocation georegion directly

## [1.0.2] - 2018-04-19
### Fixed
- Correct a reference in `ingest_missy_dataset`

## [1.0.1] - 2018-04-19
### Added
- User is now CC'ed on "add city" email
- Preload static indicator chart configuration data on app load
- Include logout link in expired account modal
### Fixed
- Change forgot password form to a single input
- Tweak faulty password validation
- Use stored coordinates and switch geocoders in `ingest_missy_dataset`
- Change cyclone and tropical storms to coastal_only
- Do not log users out if Temperate's Climate API token is invalid
- Only show unique suggested actions to user

## [1.0.0] - 2018-04-03
- MVP Release
### Added
- Links to Azavea privacy policy and terms of service
- Show register links on production
### Removed
- Hourly subscription option from pricing and subscription pages
### Fixed
- Miscellaneous styling and bug fixes
- Copy changes across site
- Marketing page images not showing in IE
- Correctly send org name, location and support request description in help form
- Indicator charts accidentally broken by earlier refactor

## [0.1.5] - 2018-04-02
### Added
- City Profile
- All 'risks' dashboard view
### Changed
- Remove last step of the Create Organization wizard
### Fixed
- Cleanup site copy
- Email copy and design cleanup
- Miscellaneous bugs

## [0.1.4] - 2018-03-28
### Added
- Show basic, relevant indicator data for Top Concerns
- Unstyled review plan page
- New marketing page
### Changed
- Updated fixtures:
  - ActionCategory
  - Concern
  - WeatherEvent
### Fixed
- Miscellaneous bugs
- Improved user workflow for the action steps

## [0.1.3] - 2018-03-16
### Changed
- Hide register links on production
### Fixed
- Improved behavior of ngx-bootstrap typeahead controls when interacting with keyboard

## [0.1.2] - 2018-03-14
### Added
- User sees confirmation prompt when attempting to delete a Risk or Action
### Changed
- Removed remaining lorem ipsum text from homepage
### Fixed
- Org and user API endpoint visibility
- Improved suggested actions workflow when there are no suggested actions to display

## [0.1.1] - 2018-03-11
### Changed
- App now hosted at https://temperate.io instead of https://app.temperate.io
- Production application no longer restricted to use on Azavea VPN

## [0.1.0] - 2018-03-08
### Added
- Initial release

[Unreleased]: https://github.com/azavea/temperate/compare/1.0.2...HEAD
[1.0.2]: https://github.com/azavea/temperate/compare/1.0.1...1.0.2
[1.0.1]: https://github.com/azavea/temperate/compare/1.0.0...1.0.1
[1.0.0]: https://github.com/azavea/temperate/compare/0.1.5...1.0.0
[0.1.5]: https://github.com/azavea/temperate/compare/0.1.4...0.1.5
[0.1.4]: https://github.com/azavea/temperate/compare/0.1.3...0.1.4
[0.1.3]: https://github.com/azavea/temperate/compare/0.1.2...0.1.3
[0.1.2]: https://github.com/azavea/temperate/compare/0.1.1...0.1.2
[0.1.1]: https://github.com/azavea/temperate/compare/0.1.0...0.1.1
