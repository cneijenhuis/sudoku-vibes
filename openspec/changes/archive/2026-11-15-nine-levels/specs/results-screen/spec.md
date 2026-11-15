## MODIFIED Requirements

### Requirement: Next difficulty
The screen SHALL offer a "Next difficulty" action that starts a new game one level harder than the one just played, in the order Super Easy, Easy, Gentle, Medium, Tricky, Hard, Tough, Extreme, Impossible. After Impossible the action SHALL NOT be offered.

#### Scenario: Step up
- **WHEN** the player finishes an Easy game and taps "Next difficulty"
- **THEN** the loading screen for Gentle is shown and then a new Gentle game starts

#### Scenario: Hardest level
- **WHEN** the player finishes an Impossible game
- **THEN** no "Next difficulty" action is shown and "Same difficulty" and "Menu" remain
