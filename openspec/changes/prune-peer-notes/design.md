# Design

`Move` gains an optional `notes?: readonly [index: number, bits: number][]`: the note bits the entry removed from every cell it changed (the entry cell if it had notes, each peer that lost the digit). `place` builds it, clears the entry cell's mask and, only when `digit === solution[i]`, clears bit `digit-1` in the 20 peers; only cells whose mask actually changes are recorded. `undo` ORs the recorded bits back into a fresh `notes` array (like `cells`); notes added since the entry are kept. Moves from `restoreGame` carry no record.

Prune only for correct digits: a wrong digit gets undone, and pruning on it would remove valid candidates. Alternative considered: prune on any digit and rely on undo restore; rejected as it hides candidates behind a visible mistake. Only the one correct entry matters for the save, so persistence needs nothing new (notes are saved as the current masks).
