# mobile-app-shell Specification

## Purpose
Defines the mobile-first page foundation (viewport, touch behaviour, layout) that all game screens are rendered into.

## Requirements

### Requirement: Mobile viewport
The page SHALL fill the device viewport without horizontal scrolling and SHALL NOT allow pinch or double-tap zoom.

#### Scenario: Phone portrait
- **WHEN** the page is opened at 375x667 CSS pixels
- **THEN** the content fits the viewport with no horizontal or vertical page scroll

### Requirement: Touch interaction defaults
Interactive controls SHALL have a minimum touch target of 44x44 CSS pixels, and long-pressing controls MUST NOT select text or open the browser context menu.

#### Scenario: Long-press on a control
- **WHEN** the user long-presses a button
- **THEN** no text selection, callout or context menu appears

### Requirement: Safe-area awareness
The layout SHALL respect device safe-area insets so content is not obscured by notches or home indicators.

#### Scenario: Device with notch
- **WHEN** the page is displayed on a device reporting non-zero safe-area insets
- **THEN** controls are inset so that none are covered by the notch or home indicator

### Requirement: Placeholder screen
On load, the shell SHALL render the start menu, which shows the app title "Sudoku".

#### Scenario: First load
- **WHEN** the page loads
- **THEN** the start menu is shown, the text "Sudoku" is visible and no console errors are logged
