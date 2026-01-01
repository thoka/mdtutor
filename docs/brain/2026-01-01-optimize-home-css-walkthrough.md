# Walkthrough - Index Page CSS Optimization

I have optimized the index page to reduce the excessive white space and make the pathway cards use the full available width.

## Changes

### 1. Global Background Contrast
- Added `background-color: var(--rpf-off-white, #f8f8f8)` to the `body` and `.c-layout` in `app.css`. 
- This provides a subtle contrast against the white cards and content areas, making the layout feel less "empty".

### 2. Full-Width Pathway Cards
- Removed the `max-width: 1200px` restriction from the `HomeView` container.
- Increased the pathway card width to 100%.
- Adjusted the card layout:
    - On desktop (>= 768px), cards are horizontal with a wider image area (450px).
    - Improved card shadows and borders for better visual depth.
    - Added a stronger accent border (6px) to match the branding.

### 3. Typography and Spacing
- Increased the "Lernpfade" title size to `2rem` and added more weight.
- Improved spacing between cards and title.

## Verification Results
- **Index Page**: Cards now span the full width and pop against the gray background.
- **Tutorial Page**: Still looks correct, benefit from the global background contrast.
- **Pathway Page**: Consistent look with the rest of the app.

Screenshots were taken during the process (`index-page-after`, `tutorial-page-after-global-bg`, `pathway-page-after-global-bg`).

