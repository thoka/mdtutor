# Implementation Plan - Add Back to Overview Button 🔹ABQ55

Add a button to the top-left navigation bar that allows users to return to the project overview page from any tutorial or pathway.

## Proposed Changes

### Frontend (`apps/web`)

#### [apps/web/src/App.svelte](../../apps/web/src/App.svelte)
- Import `link` and `location` from `svelte-spa-router`.
- Import `currentLanguage` from `./lib/stores`.
- Define a derived state `showBackButton` to determine when to display the button (hide on home/projects overview).
- Update the `global-nav-bar` structure to include the button.
- Style the button using RPL-standard classes (`rpf-button`, `rpf-button--tertiary`).
- Adjust the layout of `global-nav-bar__content` to support left and right aligned items.

## Verification Plan

### Manual Verification
1. Open the application at the home page (`/` or `/de-DE/projects`). The button should NOT be visible.
2. Navigate to a Lernpfad (e.g., `/de-DE/pathways/scratch-intro`). The button SHOULD be visible in the top left.
3. Click the button. It should navigate back to `/de-DE/projects`.
4. Navigate to a Project (e.g., `/de-DE/projects/silly-eyes/0`). The button SHOULD be visible.
5. Click the button. It should navigate back to `/de-DE/projects`.
6. Switch language to English. The button text should change to "Back to overview".
7. Click the button. It should navigate back to `/en/projects`.

