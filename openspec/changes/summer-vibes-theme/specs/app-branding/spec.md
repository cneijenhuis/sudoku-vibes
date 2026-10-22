# Spec Delta

## Purpose

Names the product consistently as "Sudoku Vibes" wherever people see it.

## ADDED Requirements

### Requirement: Product name
The product SHALL be called "Sudoku Vibes" in the browser tab title, the installed app name, the iOS home-screen title and the start menu header.

#### Scenario: Title and install name
- **WHEN** the page is loaded and the web app manifest is read
- **THEN** the page title is "Sudoku Vibes" and the manifest name is "Sudoku Vibes"

#### Scenario: Menu header
- **WHEN** the start menu is shown
- **THEN** its header reads "Sudoku Vibes"

### Requirement: Wordmark styling
Wherever the wordmark is shown, "Sudoku" SHALL be in the ink colour and "Vibes" in the accent colour, in Fredoka 700.

#### Scenario: Wordmark colours
- **WHEN** the wordmark is displayed
- **THEN** "Sudoku" uses the ink colour and "Vibes" uses the accent colour

### Requirement: Browser chrome colours
The theme colour and manifest background colour SHALL match the light theme (the fallback colour), not the former dark colour.

#### Scenario: Colours
- **WHEN** the page head and manifest are inspected
- **THEN** theme and background colours are #F6E9D2
