# Implementation Plan - Refine Project Header 🔹THDm7

Reduce the vertical space of the project header and integrate the hero image seamlessly into the banner.

## Phase 1: Tests First

### 1. Manual Verification
- View the project page and verify:
  - Header is vertically more compact.
  - Hero image is smaller (approx 200-250px wide).
  - Hero image fills the right side of the banner completely (top, bottom, right).
  - Hero image has no rounding on the left side.
  - Hero image has rounding on the right side matching the banner.

## Phase 2: Implementation

### 2. Styling
Update `apps/web/src/app.css`:
- Override `.c-project-header` padding and layout.
- Adjust `.c-project-header__content` to allow seamless image placement.
- Update `.c-project-header__image` rounding and size.

## Phase 3: Verification

### 3. Verification
- Manual check in the browser.
