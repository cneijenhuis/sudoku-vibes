# app-icon Specification

## Purpose
Gives the app a recognisable icon that matches its summery look, in every size browsers and phones ask for.

## Requirements

### Requirement: Icon artwork
The app icon SHALL show the deckchair with the inflatable yellow 7 from the background photo, as an opaque, full-bleed square image, with the chair and the 7 inside the central 70% so the circle crop used for maskable icons does not cut the 7.

#### Scenario: Recognisable
- **WHEN** the icon is shown at 60px on a home screen
- **THEN** the yellow 7 and the deckchair are recognisable

#### Scenario: Circle crop
- **WHEN** the maskable icon is cropped to a circle
- **THEN** the 7 is fully visible

### Requirement: Icon files
The site SHALL provide PNG icons of 192px, 512px, a 512px maskable icon, a 180px Apple touch icon and a 32px favicon, all linked from the page head or the web app manifest. The Apple touch icon SHALL be opaque.

#### Scenario: Files linked
- **WHEN** the built site's head and manifest are inspected
- **THEN** each icon file exists and is referenced, and the browser reports no installability or manifest errors

### Requirement: Single source
All icon files SHALL be rendered from one committed master image by a documented script, so the set can be regenerated consistently.

#### Scenario: Regeneration
- **WHEN** the render script is run
- **THEN** all icon files are rewritten from the master image

### Requirement: Lean first visit
Icons that are only used when installing the app (the 512px icons) SHALL NOT be part of the offline precache, while icons shown in normal use (favicon, 192px, Apple touch icon) SHALL be.

#### Scenario: Precache list
- **WHEN** the built service worker is inspected
- **THEN** it lists the favicon, 192px and Apple touch icons and not the 512px icons
