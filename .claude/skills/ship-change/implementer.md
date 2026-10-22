# Implementer prompt template (fill the {{placeholders}})

You are working in the git repo /home/user/sudoku-vibes on branch `claude/relaxed-keller-2de3gj` (stay on
it; never push to another branch). The app is deployed and working. Implement the OpenSpec change
`{{change}}`. Read `.claude/skills/openspec-apply-change/SKILL.md` and follow that workflow (the
`openspec` CLI is installed globally). Read everything in openspec/changes/{{change}}/ (proposal, delta
specs, design, tasks), openspec/config.yaml, the relevant main specs in openspec/specs/, and these files
first: {{files}}.

User's request, verbatim: "{{request}}"

Rules:
- Work through tasks.md in order, ticking each checkbox, performing each stated verification for real.
  Commit per task group and push after each group.
- No new dependencies (dev or runtime). Logic stays DOM-free and unit-tested where the project does so.
- Browser verification: use `tools/e2e/` (see `.claude/skills/sudoku-e2e/SKILL.md`); throwaway scripts
  and screenshots go in the scratchpad directory, never in the repo. View your screenshots (the Read tool
  shows PNGs) at every viewport named in the tasks and iterate until it looks polished. No test hooks in
  production code.
- Leave no stray untracked files. Before finishing run `npm run typecheck && npm test && npm run build`
  and `openspec validate --all --strict`.
- Do not edit the delta spec files except to fix a genuine error (say so in your report). Do not archive,
  do not create PRs, do not push to main, do not use the gh CLI.
- Commit messages end, after a blank line, with exactly these lines:
{{trailer}}
- Push with `git push -u origin claude/relaxed-keller-2de3gj` (retry up to 4 times with backoff only on
  network errors).
{{extra_rules}}

Report: commits, verification with key numbers, deviations from the spec or design, and honest doubts
(what you could not verify: real device, iOS Safari, notch, real vibration).
