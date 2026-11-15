## MODIFIED Requirements

### Requirement: Difficulty levels
The engine SHALL define exactly nine ordered difficulty levels, numbered 1 to 9: Super Easy, Easy, Gentle, Medium, Tricky, Hard, Tough, Extreme, Impossible.

#### Scenario: Ordering
- **WHEN** levels are compared
- **THEN** Super Easy < Easy < Gentle < Medium < Tricky < Hard < Tough < Extreme < Impossible

### Requirement: Logical technique solving
The engine SHALL solve with human techniques, always applying the easiest applicable one, tried in level order: hidden single, naked single (1); locked candidates (4); naked pair (5); hidden pair, naked triple, hidden triple (6); X-Wing, naked quad, hidden quad (7); Swordfish, XY-Wing (8); Skyscraper, XYZ-Wing (9). It SHALL report every step, or that logic alone is insufficient, and SHALL accept a highest allowed level.

#### Scenario: Singles-only puzzle
- **WHEN** a puzzle solvable with only naked and hidden singles is analysed
- **THEN** the hardest technique reported is a single

#### Scenario: Needs guessing
- **WHEN** a puzzle that stalls all implemented techniques is analysed
- **THEN** the result is flagged as requiring guessing

#### Scenario: Capped solver
- **WHEN** a puzzle that needs an X-Wing is analysed with the highest allowed level set to 6
- **THEN** the solver stalls and reports that logic alone is insufficient

#### Scenario: New techniques
- **WHEN** a puzzle whose only way forward is a Skyscraper, or an XYZ-Wing, is analysed
- **THEN** the solver applies that technique and continues

## REMOVED Requirements

### Requirement: Grade assignment
**Reason**: Replaced by "Level assignment": nine levels graded by technique, score and open-moves tiers instead of technique plus givens thresholds.
**Migration**: None.

## ADDED Requirements

### Requirement: Level assignment
The grade SHALL be the highest of: the technique tier (level of the hardest technique used, 1 for singles), the score tier, and the open-moves tier. A puzzle that defeats all techniques SHALL grade Impossible.

#### Scenario: Grade by hardest technique
- **WHEN** a puzzle's hardest required technique is a naked pair and its score and open-moves tiers are at most 5
- **THEN** it is graded Tricky

#### Scenario: Beyond implemented techniques
- **WHEN** a uniquely solvable puzzle cannot be completed by any implemented technique
- **THEN** it is graded Impossible

#### Scenario: Score raises the grade
- **WHEN** a puzzle needs only singles and locked candidates but its score is in the Hard band
- **THEN** it is graded Hard

#### Scenario: Few open moves raise the grade
- **WHEN** a singles-only puzzle has a score in the Super Easy band but averages fewer open moves than the Easy threshold
- **THEN** it is graded Gentle


### Requirement: Difficulty score
The engine SHALL compute a score by summing a cost per solving step, a technique's first use costing more than later ones: single 100/100, locked candidates 350/200, naked pair 750/500, hidden pair 1500/1200, naked triple 2000/1400, hidden triple 2400/1600, X-Wing 2800/1600, XY-Wing and Skyscraper 4200/2100, naked quad 5000/4000, XYZ-Wing 5000/2500, hidden quad 7000/5000, Swordfish 8000/6000.

#### Scenario: Singles only
- **WHEN** a puzzle with 45 empty cells is solved by singles alone
- **THEN** its score is 4500

#### Scenario: Repeated technique
- **WHEN** a solve uses locked candidates twice and 50 singles
- **THEN** its score is 5000 + 350 + 200 = 5550

### Requirement: Score tiers
Score tiers SHALL use eight ascending thresholds kept in one constant (initially 4000, 4500, 5100, 5600, 6500, 8000, 10000, 13000): the tier is 1 plus the number of thresholds the score reaches.

#### Scenario: Middle of the scale
- **WHEN** a puzzle scores 7000
- **THEN** its score tier is 6 (Hard)

### Requirement: Open moves
The engine SHALL measure open moves as the mean, over the first 25 placements of the solve (or all, if fewer), of the number of empty cells that a single could fill just before that placement. The open-moves tier SHALL be 1 at or above the Super Easy threshold, 2 at or above the Easy threshold, otherwise 3; both thresholds are one constant (initially 8 and 5).

#### Scenario: Wide open puzzle
- **WHEN** a puzzle averages 9 open moves
- **THEN** its open-moves tier is 1

#### Scenario: Bottleneck puzzle
- **WHEN** a puzzle averages 3 open moves
- **THEN** its open-moves tier is 3
