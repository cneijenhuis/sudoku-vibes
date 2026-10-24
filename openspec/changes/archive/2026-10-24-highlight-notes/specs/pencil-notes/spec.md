## ADDED Requirements

### Requirement: Highlighted digit in notes
While a digit is highlighted (selected filled cell, pressed key or number-first locked digit), a note of that digit SHALL be drawn dark blue and extra bold in every empty cell that has it, other notes unchanged. It SHALL update when the highlight changes and add no fill, ring or red.

#### Scenario: Note follows the highlight
- **WHEN** cells have notes including 5 and the player highlights the 5
- **THEN** the 5 in each of those cells is dark blue and extra bold, and the other notes keep their normal style

#### Scenario: Highlight removed
- **WHEN** the highlight is cleared or moves to another digit
- **THEN** the 5 notes return to the normal note style and the new digit's notes are emphasised
