# Spec Delta

## REMOVED Requirements

### Requirement: Wordmark pill
**Reason**: The product name is shown on the menu and in the app title; on the play screen the pill costs vertical space that the board can use.
**Migration**: None; the wordmark remains on the start menu.

## MODIFIED Requirements

### Requirement: Layout across devices
The play screen SHALL give the board and the number keys a 6px side gutter in portrait (the header controls keep a 12px inset), SHALL fit 390x844, 375x667, 320x568, 667x375, 844x390 and 1024x768 without scrolling or clipping, and SHALL keep touch targets at their previous size. Where the board is width-limited it SHALL be the viewport width minus the two gutters, and the board SHALL NOT be smaller than its size before the Summer Vibes restyle at any of those viewports.

#### Scenario: Small viewports
- **WHEN** the play screen is shown at 375x667, 320x568, 667x375 and 844x390
- **THEN** nothing scrolls or is clipped and the board is larger than it was before the restyle

#### Scenario: Width-limited board
- **WHEN** the play screen is shown at 390x844
- **THEN** the board is 378px wide (390 minus two 6px gutters)

#### Scenario: Tablet
- **WHEN** the play screen is shown at 768x1024
- **THEN** the board is 720px wide, centred horizontally
