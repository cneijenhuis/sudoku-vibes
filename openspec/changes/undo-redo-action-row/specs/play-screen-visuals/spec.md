# Spec Delta

## MODIFIED Requirements

### Requirement: Header controls
The header SHALL show pause (left) and the timer pill beside it. Pause SHALL be a 52x52px glass button with radius 18px, no border, a 0 3px 0 strong-line drop edge, a 24px ink stroke icon and the accessible name "Pause". The timer pill SHALL be a glass pill (radius 20px) with the time in 34px Fredoka 600 and below it, 6px lower, the status line in 15px 500 in the status colour.

#### Scenario: Header contents
- **WHEN** the play screen is shown
- **THEN** the pause button and the timer pill appear in one row with pause on the left, with the specified sizes and accessible name
