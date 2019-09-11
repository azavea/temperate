# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

<!--When making a new release, remember to update the magic links at the bottom.-->
## [Unreleased]
 - Updated Plan Wizard to allow selecting Organization boundaries
 - Added map page

## [1.10.0] - 2019-09-03
 - Updated Node.js to version 10
 - Updated Angular to version 8
 - The `climate-change-components` library is now a part of this project as the `climate-api` module instead of being installed as an NPM dependency

## [1.9.0] - 2019-05-14
### Added
 - Added database constraints and validations to ensure it is not possible to create duplicate organizations or locations
### Changed
 - Do not list administrators under colleague list on settings page
 - Updated text on subscription package selection modal

## [1.8.0] - 2019-04-18
### Added
 - Added ability to remove users from an organization to the settings page
 - Added ability for users to download charts as PNGs
### Fixed
 - Fixed bug where organization dropdown could be shown to a user with no organizations
 - Fixed a bug where users can invite the same user to their organization twice.
 - Fixed a bug where users could accidentally create duplicate organizations
 - Fixed Climate API URL path used when creating organizations
### Changed
 - Existing users can now be invited to new and existing organizations.
 - Changed text from "Send us a message" to "Ask an expert"

## [1.7.0] - 2019-02-16
### Changed
 - Reverted pricing changes from previous release

## [1.6.0] - 2019-01-16
### Added
 - A PlanItOrganization.source field. Refactors the Missy importer to use the field. The source default of USER should be backwards compatible with all other use cases within the application.
 - Switched autocomplete in Organization Creation to the Google Places autocomplete. This is temporarily restricted to only US cities.
### Fixed
 - Redirect users without a plan and an expired subscription to the subscription page
 - Users with multiple organizations with the same name can now correctly change orgs via the dropdown
### Removed
 - API and client app dependence on Climate API city id. Instead, the app uses the geom field of
   PlanItLocation for any location related queries.

## [1.5.0] - 2018-09-14
### Added
 - Allow users to switch organizations or create multiple new organizations

## [1.4.0] - 2018-08-20
### Added
 - Temperate-specific terms of service and require opt-in to terms for registration

## [1.3.0] - 2018-07-06
### Changed
- Use datasets property of Climate Change API cities when calculating concern values

## [1.2.0] - 2018-07-03
### Added
- Pull SSL certificate ARN from remote state

## [1.1.0] - 2018-05-15
### Added
- Automatic emails notifying users of their upcoming trial expiration
- Database field to track PlanItLocation georegion directly
### Fixed
- Prevent Missy ingest script from failing if user organization has same name as Missy organization
- Prevent Chrome's insubordinate autocomplete on the city selector

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

[Unreleased]: https://github.com/azavea/temperate/compare/1.9.0...HEAD
[1.10.0]: https://github.com/azavea/temperate/compare/1.9.0...1.10.0
[1.9.0]: https://github.com/azavea/temperate/compare/1.8.0...1.9.0
[1.8.0]: https://github.com/azavea/temperate/compare/1.7.0...1.8.0
[1.7.0]: https://github.com/azavea/temperate/compare/1.6.0...1.7.0
[1.6.0]: https://github.com/azavea/temperate/compare/1.5.0...1.6.0
[1.5.0]: https://github.com/azavea/temperate/compare/1.4.0...1.5.0
[1.4.0]: https://github.com/azavea/temperate/compare/1.3.0...1.4.0
[1.3.0]: https://github.com/azavea/temperate/compare/1.2.0...1.3.0
[1.2.0]: https://github.com/azavea/temperate/compare/1.1.0...1.2.0
[1.1.0]: https://github.com/azavea/temperate/compare/1.0.2...1.1.0
[1.0.2]: https://github.com/azavea/temperate/compare/1.0.1...1.0.2
[1.0.1]: https://github.com/azavea/temperate/compare/1.0.0...1.0.1
[1.0.0]: https://github.com/azavea/temperate/compare/0.1.5...1.0.0
[0.1.5]: https://github.com/azavea/temperate/compare/0.1.4...0.1.5
[0.1.4]: https://github.com/azavea/temperate/compare/0.1.3...0.1.4
[0.1.3]: https://github.com/azavea/temperate/compare/0.1.2...0.1.3
[0.1.2]: https://github.com/azavea/temperate/compare/0.1.1...0.1.2
[0.1.1]: https://github.com/azavea/temperate/compare/0.1.0...0.1.1
