# Implementation Plan - Optimize CSS (Home & Pathway)

Optimize the index page and pathway page to reduce white space and improve layout efficiency.

## Problem (Pathway Page)
- Large banner takes too much vertical space.
- Projects are hidden "below the fold".
- Grid layout only shows few projects per row on medium screens.
- Details (What I will learn, etc.) take up too much space by default.

## Proposed Changes (Pathway Page)
1.  **Banner to Icon**: Move the banner image to a small rectangular icon (80x80) next to the title.
2.  **Top Row Layout**: Create a top row containing the title/icon area and the details accordions on the right.
3.  **Accordion Optimization**: Details take minimal width when closed, can expand when open.
4.  **3-Column Grid**: Adjust project cards to fit 3 in a row at ~960px width.
5.  **Description & Progress**: Place below the top row, keeping it compact.

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

