# Implementation Plan - Optimize Index Page CSS

Optimize the index page (`HomeView.svelte`) to reduce the "too much white" issue and improve visual structure.

## Problem
- The index page has a white background.
- Pathway cards also have a white background.
- Lack of visual separation between content and background.
- The layout feels "empty" or "too bright" due to excessive white space.

## Proposed Changes
1.  **Global Background**: Set a light off-white background color for the main layout to provide contrast for the white cards.
2.  **Card Enhancements**:
    - Improve card shadows to make them "pop" against the new background.
    - Ensure consistent padding and alignment.
3.  **Home Page Specifics**:
    - Add a container background for `HomeView` if needed.
    - Refine typography colors for better readability (slightly darker headings).

## Detailed Steps
1.  **Analyze current styles**:
    - `apps/web/src/app.css`
    - `apps/web/src/routes/HomeView.svelte`
2.  **Apply Background Change**:
    - In `apps/web/src/app.css`, set `background-color: #f5f7f9` (or similar) for `body` or `.c-layout`.
3.  **Update `HomeView.svelte`**:
    - Ensure `.c-pathway-card` has a clear white background and better shadow.
    - Adjust `.c-home-view` padding/margins.
4.  **Verification**:
    - Take a screenshot and compare with the previous state.
    - Ensure other pages (TutorialView) still look good.

## TDD / Verification
- Manual verification via Browser/Puppeteer screenshot.
- Check that the contrast ratio remains accessible.

