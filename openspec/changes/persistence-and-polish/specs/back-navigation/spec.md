# Spec Delta

## Purpose

Makes the browser and Android Back button behave like a phone app: back goes to the menu instead of leaving the site.

## ADDED Requirements

### Requirement: Back returns to the menu
Pressing Back on the loading, error, game or results screen SHALL return to the start menu instead of leaving the app. On the start menu, Back SHALL behave as the browser normally does.

#### Scenario: Back from game
- **WHEN** the player is in a game and presses Back
- **THEN** the start menu is shown, the game is saved and the timer is stopped

#### Scenario: Back from loading
- **WHEN** the player presses Back while a puzzle is loading
- **THEN** generation is cancelled and the start menu is shown

#### Scenario: Back from results
- **WHEN** the player is on the results screen and presses Back
- **THEN** the start menu is shown

#### Scenario: Back on the menu
- **WHEN** the player presses Back on the start menu
- **THEN** the browser leaves the page as normal

### Requirement: No history clutter
In-app navigation SHALL NOT leave extra history entries that need repeated Back presses to leave the app, and reloading the page SHALL show the start menu.

#### Scenario: Several games
- **WHEN** the player plays three games in a row, returns to the menu and presses Back
- **THEN** a single Back leaves the page
