---
name: ship-change
description: Take a Sudoku Vibes change from idea to merged and archived using the delegated flow (OpenSpec change, Sonnet implementer, separate Sonnet reviewer, fixes, archive, push to main). Use when the user asks for a new feature, a spec, a layout or design change, or a fix that should follow "the same setup as before".
---

# Shipping a change

1. **Clarify only what changes the result.** If a sensible default exists, state it as an assumption.
2. **Ground the spec in the code and current specs** (read the code the change touches and the relevant
   `openspec/specs/*/spec.md`), then `openspec new change <name>` and write proposal, delta specs,
   design (decisions with alternatives, risks) and tasks. Each task states how it is verified. Run
   `openspec validate <name> --strict`; commit and push the proposal.
3. **Implementer:** start a Sonnet subagent with `implementer.md` (fill the placeholders; paste this
   session's commit trailer lines from the attribution reminder).
4. **Reviewer:** when the implementer reports, start a separate Sonnet subagent with `reviewer.md`.
   Reviewers must verify themselves (build, measure, screenshots), not trust the report.
5. **REQUEST_CHANGES:** list the blocking findings and send them to the same implementer with
   SendMessage; give large fixes a fresh reviewer, verify small ones yourself. Fix trivial non-blocking
   items directly when they are cheap and safe; leave the rest and say so.
6. **Archive:** `openspec archive <name> -y`, fix any main-spec fallout (Purpose lines, requirements
   over 500 characters), then `openspec validate --all --strict`, `npm run typecheck`, `npm test`,
   `npm run build`.
7. **Ship:** commit, `git push`, and `git push origin claude/relaxed-keller-2de3gj:main`. Tell the user
   what changed, what was verified and what was not (real device, iOS, notch), what they should check on
   their phone, and that the installed app must be fully closed to pick up the new version.

While a subagent works the repo shows uncommitted files: leave them alone. Agents running in parallel
with an implementer (research, icon work) must be told to stay in the scratchpad and not touch git.
