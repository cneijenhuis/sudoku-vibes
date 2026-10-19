# Spec Delta

## MODIFIED Requirements

### Requirement: Difficulty choices
The start menu SHALL show the game title and exactly six buttons, in order: Super Easy, Easy, Medium, Hard, Extreme, Almost Impossible.

#### Scenario: Menu contents
- **WHEN** the app loads
- **THEN** the start menu is shown with the six labelled buttons in that order

### Requirement: Touch-friendly layout
Each difficulty button SHALL be at least 44 CSS pixels tall and the whole menu SHALL fit a 375x667 viewport without scrolling.

#### Scenario: Small phone
- **WHEN** the menu is shown at 375x667 CSS pixels
- **THEN** all six buttons are fully visible and tappable without scrolling
