# static-deployment Specification

## Purpose
Defines how the game is built and published as a static site on GitHub Pages so that every merged change is playable online.

## Requirements

### Requirement: Static production build
The project SHALL produce a self-contained static site in `dist/` via a single build command, with no server-side runtime.

#### Scenario: Build succeeds
- **WHEN** the build command is run on a clean checkout after installing dependencies
- **THEN** `dist/` contains an `index.html` and bundled assets, and the command exits with status 0

### Requirement: Sub-path hosting
The built site SHALL work when served from a repository sub-path such as `/sudoku-vibes/`.

#### Scenario: Assets resolve under sub-path
- **WHEN** `dist/` is served from `/sudoku-vibes/`
- **THEN** all scripts and styles referenced by `index.html` load without 404 errors

### Requirement: Automated deployment
A push to `main` SHALL type-check, test, build and publish the site to GitHub Pages; a failing check MUST prevent publishing.

#### Scenario: Green push deploys
- **WHEN** a commit is pushed to `main` and type-check and tests pass
- **THEN** the workflow publishes `dist/` to GitHub Pages

#### Scenario: Failing tests block deploy
- **WHEN** a commit is pushed to `main` and a test fails
- **THEN** no deployment is made
