# visual-theme Specification

## Purpose
Gives every screen a consistent "Summer Vibes" look: a beach photo background, frosted white surfaces, one rounded typeface and a single set of colours.

## Requirements

### Requirement: Background photo
Every screen SHALL show a full-screen beach photo behind all content, covering the whole screen without distortion, centred, and not scrolling with content. While the photo loads, or if it fails, the page SHALL show the plain fallback colour #F6E9D2.

#### Scenario: Photo visible
- **WHEN** any screen is shown at 390x844 or 375x667
- **THEN** the beach photo fills the viewport behind the content with no empty edges

#### Scenario: Photo fails
- **WHEN** the photo file cannot be loaded
- **THEN** the page background is #F6E9D2 and all text remains legible

### Requirement: Backgrounds are configurable
Available backgrounds SHALL be defined in a single list (identifier, image, fallback colour, focal position). Adding another SHALL require only a new image and a list entry. The app SHALL pick one at random at launch and again whenever a new game starts, avoiding the previous one when several exist. Resuming a game or returning to the menu SHALL NOT change it.

#### Scenario: One background configured
- **WHEN** the list contains one entry
- **THEN** that background is shown on every screen

#### Scenario: Second entry added
- **WHEN** a second entry is added to the list
- **THEN** the app can show it without any component changes

#### Scenario: New game changes the background
- **WHEN** the player starts a new game while several backgrounds exist
- **THEN** a randomly chosen background different from the current one is shown

#### Scenario: Resume keeps it
- **WHEN** the player resumes a saved game or returns to the menu
- **THEN** the background does not change

### Requirement: Colour tokens
The theme SHALL define named tokens for surface (rgba(255,253,248,0.86)), ink (#10233A), entry (#067684), strong line (#1E4D6B), soft line (rgba(30,77,107,0.42)), key text (#1E4D6B), highlight (#FFE08A), highlight text (#6E4300), highlight ring (#F4B400), highlight edge (#D9A100), done text (#4F6E82), done edge (#6F8FA3), accent (#E2533F), status (#B83A28), fallback (#F6E9D2) and board shadow (0 14px 30px rgba(40,30,10,0.22)), and components SHALL use these tokens rather than literal colours.

#### Scenario: Token usage
- **WHEN** the built stylesheet is inspected
- **THEN** the token values above are defined once as custom properties and component rules reference them

### Requirement: Typography
All text SHALL use the Fredoka typeface (weights 500, 600, 700) with a system-ui sans-serif fallback. The font files SHALL be served from the app itself, not from a third-party host, and SHALL be available offline.

#### Scenario: Offline text
- **WHEN** the app is loaded once online and then opened offline
- **THEN** text renders in Fredoka

#### Scenario: No third-party requests
- **WHEN** the app loads
- **THEN** no request is made to a host other than the app's own origin

### Requirement: Glass surfaces
White surfaces (board, header buttons, timer pill, wordmark pill, number keys, and the cards and sheets of other screens) SHALL use the surface token with a 3px background blur. Where background blur is unsupported, the surface alpha SHALL be 0.94.

#### Scenario: Blur supported
- **WHEN** the browser supports backdrop blur
- **THEN** surfaces show the blurred photo through 86% white

#### Scenario: Blur unsupported
- **WHEN** the browser does not support backdrop blur
- **THEN** surfaces are 94% white

### Requirement: Reduced transparency
When the user prefers reduced transparency, surfaces SHALL be opaque #FFFDF8.

#### Scenario: Preference set
- **WHEN** the user's system requests reduced transparency
- **THEN** surfaces are opaque and no blur is applied

### Requirement: Legibility
Body text, digits and labels SHALL keep a contrast ratio of at least 4.5:1 against their surface, and the error colour SHALL meet the same ratio and be a clear red distinct from the accent and status colours.

#### Scenario: Contrast
- **WHEN** token pairs for ink, key text, entry, status, done text and error on the surface colour are measured over a solid #FFFDF8 backing
- **THEN** each is at least 4.5:1

### Requirement: Other screens use the theme
The start menu, loading and error screens, pause overlay and results screen SHALL use the same tokens, typeface and glass surfaces, remain fully legible over the photo, and keep their existing layout and behaviour.

#### Scenario: Menu over the photo
- **WHEN** the start menu is shown
- **THEN** its text and buttons are legible, use Fredoka and sit on glass surfaces over the beach photo

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
