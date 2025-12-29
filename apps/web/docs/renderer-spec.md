# Renderer Specification

## Overview

Web-based tutorial renderer for the Markdown-based learning platform. Displays parsed tutorial content with interactive elements, progress tracking, and navigation.

**Target Design Reference**: https://projects.raspberrypi.org/en/projects/silly-eyes

## Architecture

- **Framework**: Svelte 5 + Vite
- **Backend**: API Server (Express) serving cached tutorial data
- **Data Flow**: API → Svelte Components → User Interaction → LocalStorage

## URL Structure

### Routing Pattern
```
/:slug/:step?
```

- `slug`: Tutorial identifier (e.g., `silly-eyes`)
- `step`: Optional step number (0-indexed)
- Default: Step 0 if not specified

### Examples
- `/silly-eyes` → Step 0 (Introduction)
- `/silly-eyes/0` → Step 0 (Introduction)
- `/silly-eyes/2` → Step 2 (Make silly eyes)

### Behavior
- URL reflects current step
- Browser history supported (back/forward)
- Direct URL access to specific steps
- Invalid step numbers redirect to step 0

## Layout Structure

```
┌─────────────────────────────────────────────────────────┐
│ Header                                                  │
│ Tutorial Title                                          │
└─────────────────────────────────────────────────────────┘
│                                                           │
│  ┌──────────────┐  ┌──────────────────────────────────┐ │
│  │ Sidebar      │  │ Content Area                     │ │
│  │ (Fixed)      │  │ (Scrollable)                     │ │
│  │              │  │                                  │ │
│  │ ☑ Step 0     │  │ <h2>Step Title</h2>             │ │
│  │ ○ Step 1     │  │                                  │ │
│  │ ○ Step 2     │  │ <rendered HTML content>         │ │
│  │ ○ Step 3     │  │                                  │ │
│  │ ○ Step 4     │  │ - Task checkboxes               │ │
│  │ ○ Step 5     │  │ - Collapsible panels            │ │
│  │ ○ Step 6     │  │ - Scratch embeds                │ │
│  │              │  │ - Images, code blocks            │ │
│  │              │  │                                  │ │
│  │              │  │ ┌─────────────────────────────┐ │ │
│  │              │  │ │ [← Previous] [Next →]      │ │ │
│  │              │  │ └─────────────────────────────┘ │ │
│  └──────────────┘  └──────────────────────────────────┘ │
│                                                           │
```

### Components

#### Header
- Tutorial title
- Breadcrumb navigation (later)

#### Sidebar
- **Position**: Fixed left side, full height
- **Width**: ~250px
- **Content**: Step list with:
  - Step number
  - Step title
  - Completion indicator (☑ checkmark)
  - Active state highlighting
- **Interaction**: Click to navigate to step
- **Responsive**: Collapsible on mobile (later phase)

#### Content Area
- **Position**: Main content area, scrollable
- **Width**: Remaining space after sidebar
- **Content**: 
  - Step title (h2)
  - Rendered HTML from parser
  - Interactive elements (tasks, panels)
  - Navigation buttons (bottom)

#### Navigation Buttons
- **Previous**: Disabled on step 0
- **Next**: Disabled on last step
- Updates URL on click
- Keyboard shortcuts (later): Arrow keys

## Progress Tracking

### LocalStorage Schema

```javascript
// Completed steps per tutorial
progress_{slug}: [0, 1, 2]  // Array of completed step indices

// Completed tasks per step
tasks_{slug}_{step}: [0, 2]  // Array of completed task indices
```

### Progress Logic

1. **Step Completion**:
   - Automatically marked when user clicks "Next" button
   - Persists in LocalStorage
   - Shows checkmark in sidebar

2. **Task Completion**:
   - User clicks checkbox in task block
   - Persists per step in LocalStorage
   - Restores state on step load

3. **Later**: Sync with backend API for multi-device progress

## Content Rendering

### HTML Rendering
- Use Svelte's `{@html}` directive
- Content from `step.content` field in API response
- Already processed by parser (unified.js pipeline)

### Interactive Elements

#### 1. Task Blocks (`.c-project-task`)
```html
<div class="c-project-task">
  <input class="c-project-task__checkbox" type="checkbox" />
  <div class="c-project-task__body">
    Task content...
  </div>
</div>
```

**Behavior**:
- Checkboxes are interactive
- State saved to LocalStorage
- Restored on page load
- CSS styling from RPL classes

#### 2. Collapsible Panels (`.c-project-panel--ingredient`)
```html
<div class="c-project-panel c-project-panel--ingredient">
  <h3 class="c-project-panel__heading js-project-panel__toggle">
    Panel Title
  </h3>
  <div class="c-project-panel__content u-hidden">
    Panel content...
  </div>
</div>
```

**Behavior**:
- Click heading to toggle visibility
- Toggle `.u-hidden` class on content
- CSS transition for smooth open/close

#### 3. Scratch Embeds (iframes)
```html
<iframe src="https://scratch.mit.edu/projects/embed/495141114/?autostart=false" 
        width="485" height="402"></iframe>
```

**Phase 1**: Render as-is from API
**Phase 2** (later): Custom Scratch player for offline support

#### 4. Scratch Code Blocks
```html
<pre><code class="language-scratch">
when green flag clicked
forever
  point towards (mouse-pointer v)
end
</code></pre>
```

**Phase 1**: Basic `<pre>` rendering
**Phase 2** (later): Syntax highlighting with Scratch block colors

### CSS Classes (from RPL)

- `.c-project-task`: Task block container
- `.c-project-task__checkbox`: Task checkbox
- `.c-project-panel`: Panel container
- `.c-project-panel--ingredient`: Transclusion panel variant
- `.c-project-panel__heading`: Clickable panel heading
- `.c-project-panel__content`: Panel content area
- `.u-hidden`: Utility class for hidden elements
- `.u-no-print`: Hidden in print mode
- `.u-print-only`: Visible only in print mode

## Data Model

### API Response Structure
```typescript
interface TutorialData {
  data: {
    id: string;
    type: "projects";
    attributes: {
      id: number;
      content: {
        title: string;
        description: string;
        pdf: string;
        steps: Step[];
      }
    }
  }
}

interface Step {
  title: string;
  content: string;  // HTML from parser
  position: number;
  quiz: boolean;
  challenge: boolean;
  completion: string[];
  ingredients: string[];
  knowledgeQuiz: object;
}
```

### Component State
```typescript
// Global state (Svelte stores)
let tutorial: TutorialData | null = null;
let currentStep: number = 0;
let completedSteps: Set<number> = new Set();

// Per-step state
let completedTasks: Set<number> = new Set();
```

## Implementation Phases

### Phase 1: Core Functionality (Current)
- [x] API Server serving cached data
- [x] Vite proxy configuration
- [ ] Basic routing (slug/step)
- [ ] Sidebar with step list
- [ ] Content area with HTML rendering
- [ ] Prev/Next navigation
- [ ] Task checkbox state (LocalStorage)
- [ ] Collapsible panels

### Phase 2: Enhanced Features
- [ ] Panel toggle animations
- [ ] Keyboard navigation
- [ ] Progress indicators
- [ ] Mobile-responsive sidebar
- [ ] Print stylesheet support
- [ ] Error handling & loading states

### Phase 3: Advanced Features
- [ ] Scratch code syntax highlighting
- [ ] Custom Scratch player (offline)
- [ ] Backend progress sync
- [ ] Learning path display
- [ ] Search functionality
- [ ] Tutorial list view

## Technical Notes

### Router Implementation
- Custom hash-based or path-based routing (no SvelteKit)
- Options:
  - `svelte-spa-router` (lightweight)
  - `navaid` (minimal)
  - Custom implementation with `window.location`

### State Management
- Svelte stores for global state
- LocalStorage wrapper utilities
- Reactive stores for URL changes

### CSS Strategy
- Import base RPL styles
- Override with custom variables
- Component-scoped styles in Svelte
- Print media queries

### Performance
- Lazy load iframe content
- Virtualized step list (if >50 steps)
- Debounce LocalStorage writes
- Cache tutorial data after first load

## Future Considerations

### Offline Support
- Service Worker for caching
- Offline-first architecture
- Local tutorial storage

### Accessibility
- Keyboard navigation
- Screen reader support
- ARIA labels
- Focus management

### i18n
- Language selector
- API lang parameter
- Translation system

### Analytics
- Step completion tracking
- Time spent per step
- Common drop-off points
