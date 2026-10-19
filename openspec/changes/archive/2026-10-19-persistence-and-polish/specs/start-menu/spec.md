# Spec Delta

## ADDED Requirements

### Requirement: Resume entry
When a valid saved game exists, the start menu SHALL show a Resume entry above the difficulty buttons displaying the saved game's difficulty and elapsed time. It SHALL NOT be shown when there is no saved game.

#### Scenario: Saved game present
- **WHEN** the app loads with a saved Hard game at 4:32
- **THEN** the menu shows a Resume entry labelled with Hard and 4:32

### Requirement: Menu still fits
With the Resume entry and the haptics toggle shown, the menu SHALL fit 375x667 and 320x568 without scrolling, and every control SHALL be at least 44 CSS pixels tall.

#### Scenario: Crowded menu
- **WHEN** the menu is shown at 320x568 with a saved game and vibration supported
- **THEN** all controls are visible without scrolling
