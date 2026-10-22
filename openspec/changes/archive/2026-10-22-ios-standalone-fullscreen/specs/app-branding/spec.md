# Spec Delta

## ADDED Requirements

### Requirement: Translucent status bar
In the installed iOS home-screen app the status bar SHALL be translucent so the background photo runs under the clock and status icons, and the app content SHALL respect the top safe-area inset.

#### Scenario: Status bar over the photo
- **WHEN** the installed iOS app is opened
- **THEN** the photo is visible behind the status bar and no content is covered by the clock
