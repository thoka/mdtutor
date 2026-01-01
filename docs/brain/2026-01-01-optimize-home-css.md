# Implementation Plan - Optimize Index Page CSS

Optimize the index page (`HomeView.svelte`) to reduce the "too much white" issue and improve the layout of pathway cards.

## Problem
- The index page had a white background (fixed by adding off-white global background).
- Pathway cards were taking up full width in a single column, which looks sparse on large screens.
- Images were too large in the 1-column layout.

## Proposed Changes
1.  **Global Background**: (Completed) Set a light off-white background color.
2.  **2-Column Grid Layout**:
    - Change the pathway list to a grid layout with two columns on desktop screens.
    - Ensure cards align correctly without indentation on new lines.
3.  **Smaller Images**:
    - Reduce the size of images within the cards to accommodate the 2-column layout.
    - Experiment with image placement (left vs. top) for the 2-column view.
4.  **Card Enhancements**:
    - Maintain the improved shadows and borders.

## Detailed Steps
1.  **Update `HomeView.svelte`**:
    - Modify `.c-pathway-list` to use `display: grid` with `grid-template-columns: repeat(auto-fit, minmax(400px, 1fr))`.
    - Adjust `.c-pathway-card` and its image wrapper.
2.  **Verification**:
    - Take screenshots at different screen widths.
    - Ensure cards flow correctly into two columns.

## TDD / Verification
- Manual verification via Browser/Puppeteer screenshot.
- Check that the contrast ratio remains accessible.

