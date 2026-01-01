# Implementation Plan - Optimize CSS (Home & Pathway)

Optimize the index page and pathway page to reduce white space and improve layout efficiency.

## Problem (Pathway Page)
- Large banner takes too much vertical space.
- Projects are hidden "below the fold".
- Grid layout only shows few projects per row on medium screens.
- Details (What I will learn, etc.) take up too much space by default.

## Proposed Changes (Pathway Page - Phase 2)
1.  **Header Refinement**:
    - Move description text ("Du lernst...") directly under the title in the left column.
    - Ensure the progress bar is also well-integrated in the left area.
2.  **Category Title Styling**:
    - Change "Erkunden", "Gestalten", "Erfinden" titles to zentrierte, abgerundete Kacheln (Pills).
    - Assign distinct colors for each category (e.g., Explore: Green, Design: Orange, Invent: Pink).
    - Remove the bottom border and center the text.

## Detailed Steps
1.  **Modify `PathwayView.svelte`**:
    - Update HTML structure for header.
    - Update CSS for grid and header layout.
2.  **Verification**:
    - Screenshot at 960px and 1920px.
    - Check accordion behavior.

## TDD / Verification
- Manual verification via Browser/Puppeteer screenshot.
- Check that the contrast ratio remains accessible.

