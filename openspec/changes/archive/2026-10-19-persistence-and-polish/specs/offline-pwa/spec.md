# Spec Delta

## Purpose

Makes the game behave like an installed app: it can be added to the home screen and keeps working with no connection.

## ADDED Requirements

### Requirement: Installable
The site SHALL provide a web app manifest with name, short name, start URL and scope relative to the deployment path, standalone display mode, theme and background colours matching the app, and PNG icons (192 and 512 pixels, including a maskable variant) plus an Apple touch icon.

#### Scenario: Installability check
- **WHEN** the built site is audited by the browser for installability
- **THEN** no manifest or icon errors are reported

### Requirement: Offline use
After one successful visit, the app SHALL load and be fully playable with no network, including starting new games.

#### Scenario: Offline reload
- **WHEN** the player has loaded the site once, then goes offline and reloads
- **THEN** the start menu appears and a new game can be started and played

### Requirement: Updates
When a new version is deployed, the app SHALL pick it up on a later visit without serving a mixed set of old and new files, and obsolete caches SHALL be removed.

#### Scenario: New version
- **WHEN** a new build is deployed and the player visits again online
- **THEN** after the new version activates, only files from the new build are served and the old cache is deleted

### Requirement: Sub-path hosting
Manifest, icons and the service worker SHALL work when the site is hosted at a repository sub-path such as /sudoku-vibes/.

#### Scenario: Sub-path
- **WHEN** the site is served from /sudoku-vibes/
- **THEN** the service worker registers with that scope and the manifest and icons resolve

### Requirement: Safe registration
The service worker SHALL only be registered in production builds, and registration failure SHALL NOT affect gameplay.

#### Scenario: Registration unsupported
- **WHEN** the browser lacks service worker support or registration fails
- **THEN** the game works normally
