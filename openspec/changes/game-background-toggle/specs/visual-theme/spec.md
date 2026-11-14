## MODIFIED Requirements

### Requirement: Background photo
Every screen SHALL show a full-screen beach photo behind all content (except the game screen in the light or dark background mode), covering the whole screen without distortion, centred, and not scrolling with content. While the photo loads, or if it fails, the page SHALL show the plain fallback colour #F6E9D2.

#### Scenario: Photo visible
- **WHEN** any screen is shown at 390x844 or 375x667
- **THEN** the beach photo fills the viewport behind the content with no empty edges

#### Scenario: Photo fails
- **WHEN** the photo file cannot be loaded
- **THEN** the page background is #F6E9D2 and all text remains legible

#### Scenario: Plain game background
- **WHEN** the player has picked the light or dark background on the game screen
- **THEN** the game screen shows that plain background instead of the photo, and every other screen still shows the photo
