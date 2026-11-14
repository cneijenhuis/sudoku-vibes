## ADDED Requirements

### Requirement: Background modes
The game screen SHALL offer three backgrounds: photo (the current beach photo), light (a plain warm off-white, no photo) and dark (a plain near-black navy, no photo, with dark surfaces and light text on the game screen). The photo mode SHALL look exactly as the game screen does today.

#### Scenario: Light mode
- **WHEN** the game screen is shown in light mode
- **THEN** no photo is visible and the page behind the board is a plain off-white

#### Scenario: Dark mode
- **WHEN** the game screen is shown in dark mode
- **THEN** no photo is visible, the page is dark, and board, keys, header, action row and pause card use dark surfaces with light text

### Requirement: Background button
The game header SHALL show a background button in its right slot, styled like Pause (52x52 glass, radius 18px, drop edge, 24px stroke icon). Its icon SHALL show the current mode: picture frame (photo), sun (light), moon (dark). Each tap SHALL switch photo → light → dark → photo immediately, without pausing, resetting or saving the game. Its accessible name SHALL name the current mode, e.g. "Background: photo".

#### Scenario: Cycling
- **WHEN** the player taps the background button three times starting from photo
- **THEN** the background goes light, then dark, then photo, and the icon and accessible name follow each step

#### Scenario: Game unaffected
- **WHEN** the player taps the background button mid-game
- **THEN** the timer keeps running and the board, selection and notes are unchanged

### Requirement: Remembered choice
The chosen mode SHALL be stored on the device and used for every later game screen, including after relaunching the app. A missing, invalid or unreadable stored value SHALL mean photo, and storage failures SHALL NOT break the game.

#### Scenario: Persisted across launches
- **WHEN** the player picks dark, closes the app and later starts or resumes a game
- **THEN** the game screen opens in dark mode

#### Scenario: Storage unavailable
- **WHEN** storage is blocked or holds an unknown value
- **THEN** the game screen opens in photo mode and the button still cycles

### Requirement: Game screen only
The mode SHALL apply only while the game screen is shown. Menu, loading, results and error screens SHALL always show the photo, and leaving the game screen SHALL restore it with no flash of the plain colours.

#### Scenario: Results after dark game
- **WHEN** the player finishes a game played in dark mode
- **THEN** the results screen shows the beach photo with its normal light surfaces

#### Scenario: Quit to menu
- **WHEN** the player quits a light-mode game to the menu
- **THEN** the menu shows the beach photo

### Requirement: Readable in every mode
In light and dark mode the game screen SHALL keep text and digit contrast of at least 4.5:1 against surfaces, keep the highlight, cursor, completed and error states clearly distinguishable, use red only for errors, and keep the iOS status bar text readable.

#### Scenario: Dark contrast
- **WHEN** ink, key text, entry, status, done text and error are measured on the dark solid surface
- **THEN** each is at least 4.5:1

#### Scenario: Status bar in light mode
- **WHEN** the installed app on a notched iPhone shows a light-mode game
- **THEN** the white status bar text sits on a dark strip, not on the off-white
