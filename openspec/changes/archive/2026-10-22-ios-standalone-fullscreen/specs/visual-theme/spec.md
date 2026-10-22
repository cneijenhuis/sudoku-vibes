# Spec Delta

## MODIFIED Requirements

### Requirement: Background photo
Every screen SHALL show a full-screen beach photo behind all content, covering the whole screen without distortion, centred, and not scrolling with content. While the photo loads, or if it fails, the page SHALL show the plain fallback colour #F6E9D2.

#### Scenario: Photo visible
- **WHEN** any screen is shown at 390x844 or 375x667
- **THEN** the beach photo fills the viewport behind the content with no empty edges

#### Scenario: Photo fails
- **WHEN** the photo file cannot be loaded
- **THEN** the page background is #F6E9D2 and all text remains legible

## ADDED Requirements

### Requirement: Photo covers the whole screen in home-screen mode
In the installed home-screen (standalone) app the photo SHALL reach every edge of the screen, including under the status bar and the home-indicator area, even where the platform reports a layout viewport shorter than the screen. The photo SHALL be painted on the page canvas, and where the viewport is shorter than the screen by up to 120 points the page SHALL be sized to the screen height.

#### Scenario: Short viewport reported
- **WHEN** the installed app reports a viewport 59 points shorter than the screen
- **THEN** the photo still extends to the bottom edge of the screen with no beige strip

#### Scenario: Normal browser
- **WHEN** the site is opened in an ordinary browser tab
- **THEN** the page is sized to the viewport as usual

### Requirement: Stable sizing
The page height decision SHALL give the same result whether or not the reported viewport has already grown to the screen height, so the photo does not flicker between a gap and full coverage. It SHALL be re-evaluated shortly after launch and on resize, orientation change, focus, visibility change and touch, because the platform may change the viewport after launch without an event.

#### Scenario: Viewport changes after launch
- **WHEN** the reported viewport is full height at launch and shrinks a moment later without a resize event
- **THEN** the page is sized to the screen height within a few seconds and stays that size

#### Scenario: No flicker
- **WHEN** the reported viewport grows to the screen height after the page has been sized
- **THEN** the page height does not change
