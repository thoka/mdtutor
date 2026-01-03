# Walkthrough - Sticky Task Checkboxes

## Changes
- **Sticky Implementation**: Task checkboxes (`.c-project-task__checkbox`) now use `position: sticky` with a `top: 20px` offset.
- **Ancestor Fixes**: Set `overflow: visible !important` on several ancestor containers (`.c-project-steps`, `.c-project-steps__wrapper`, `.c-project-steps__content`, `.c-project-task`) to ensure the sticky behavior is not blocked.
- **User Benefit**: The checkmark remains visible at the top of the viewport as long as the user is reading the corresponding task description, even if it's long.

## Verification Results
- **E2E Test**: Verified that the checkbox stays at ~20px from the top when the container is scrolled up.
