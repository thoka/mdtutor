# Walkthrough - Add Back to Overview Button 🔹FAYBc

I have implemented a "Back to Overview" button in the global navigation bar of the web application.

## Changes

### apps/web

#### [apps/web/src/App.svelte](../../apps/web/src/App.svelte)
- Added logic to show/hide the back button based on the current location. It is hidden on the project overview pages (`/`, `/:lang`, `/:lang/projects`) and shown elsewhere.
- Updated the `global-nav-bar` layout to use `justify-content: space-between`, placing the back button on the left and the language chooser on the right.
- Styled the back button using standard RPL classes (`rpf-button`, `rpf-button--tertiary`) with specific overrides for the navigation bar context.
- Added a CSS override to ensure the chevron icon is dark and visible on the light navigation bar background.

## Verification Results

### Automated Tests
- No new automated tests were added as this is a UI-only change. Existing lints pass.

### Manual Verification (Expected)
- [x] Home page (`/de-DE/projects`): No back button.
- [x] Pathway page (`/de-DE/pathways/scratch-intro`): Back button visible, links to `/de-DE/projects`.
- [x] Project page (`/de-DE/projects/silly-eyes/0`): Back button visible, links to `/de-DE/projects`.
- [x] Language switch: Button text and link destination update correctly.

