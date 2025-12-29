# Scratch Code Block Rendering

## Overview

Tutorial content can contain Scratch code blocks that need to be rendered as visual Scratch blocks. This is implemented using the `scratchblocks` library (npm package `scratchblocks`).

## Implementation

### Markdown Syntax

Scratch blocks are written in markdown using code blocks with the `blocks3` language:

````markdown
```blocks3
when this sprite clicked
change [color v] effect by (25)
```
````

### Rendering Process

The rendering is handled in `apps/web/src/lib/StepContent.svelte`:

1. **Detection**: Finds all `<pre class="language-blocks3">` elements (or `<pre><code class="language-blocks3">`)
2. **Parsing**: Uses `scratchblocks.parse()` to parse the text into a Document object
3. **Rendering**: Uses `scratchblocks.render()` to generate SVG elements
4. **Insertion**: Appends the SVG to the pre element

### Technical Details

- **Library**: `scratchblocks` (v3.6.4)
- **Style**: Scratch 3.0 (`scratch3`)
- **Scale**: 0.675 (67.5% of original size)
- **Language**: English (`en`)

### Whitespace Preservation

The implementation preserves whitespace and newlines in the source text, which is critical for proper block rendering. The text content is read directly using `textContent` to avoid HTML normalization.

### Class Name Sanitization

A patch is applied to `DOMTokenList.prototype.add` to sanitize class names before adding them. This prevents errors when scratchblocks tries to add classes with whitespace (which can occur with certain block categories).

### CSS Styling

Scratch blocks use the `.scratchblocks` class and have:
- Transparent background
- No padding
- Proper SVG display styling

The CSS is defined in:
- `apps/web/src/app.css` - Base styles for scratchblocks
- `apps/web/src/styles/rpl-cloned/computed.css` - Cloned styles from reference site

## Legacy: Inline Code Block Styling

For inline Scratch code references (not full block rendering), the following classes were used:
- `<code class="block3events">when this sprite clicked</code>`
- `<code class="block3motion">point towards</code>`
- `<code class="block3looks">change color effect</code>`
- `<code class="block3control">forever</code>`

These are still supported for backward compatibility but full block rendering is preferred.

## HTML-Beispiele aus Tutorials

```html
<code class="block3events">when this sprite clicked</code>
<code class="block3looks">change color effect by (25)</code>
<code class="block3motion">point towards (mouse-pointer v)</code>
<code class="block3control">forever</code>
<code class="block3motion">set rotation style [all around v]</code>
```

## Scratch Block-Kategorien

Scratch verwendet folgende Hauptkategorien mit spezifischen Farben:

### Block-Typen
1. **Motion** (`block3motion`) - Blau
2. **Looks** (`block3looks`) - Lila
3. **Sound** (`block3sound`) - Pink/Magenta
4. **Events** (`block3events`) - Gelb/Orange
5. **Control** (`block3control`) - Orange
6. **Sensing** (`block3sensing`) - Türkis/Cyan
7. **Operators** (`block3operators`) - Grün
8. **Variables** (`block3variables`) - Orange/Red

### Offizielle Scratch 3.0 Farben

Basierend auf Scratch 3.0 Design:
- **Motion**: `#4C97FF` (Blau)
- **Looks**: `#9966FF` (Lila)
- **Sound**: `#CF63CF` (Pink)
- **Events**: `#FFBF00` (Gold/Gelb)
- **Control**: `#FFAB19` (Orange)
- **Sensing**: `#5CB1D6` (Türkis)
- **Operators**: `#59C059` (Grün)
- **Variables**: `#FF8C1A` (Orange)
- **My Blocks**: `#FF6680` (Rosa)

## CSS-Implementierung

### Anforderungen
- Inline-Code mit Hintergrundfarbe und Padding
- Abgerundete Ecken (Border-Radius)
- Weiße Textfarbe für guten Kontrast
- Monospace-Schriftart
- Konsistente Größe und Spacing

### Zu implementierende Klassen
```css
code.block3motion { /* Blau */ }
code.block3looks { /* Lila */ }
code.block3sound { /* Pink */ }
code.block3events { /* Gelb */ }
code.block3control { /* Orange */ }
code.block3sensing { /* Türkis */ }
code.block3operators { /* Grün */ }
code.block3variables { /* Orange/Red */ }
code.block3myblocks { /* Rosa */ }
```

## Beispiel-Verwendung im Tutorial

Aus `silly-eyes` Tutorial, Step 2:

```html
<p>Now, make the eyeball look at the <code class="block3motion">mouse-pointer</code> 
so that the user can interact with your project.</p>

<p>Add a script to <code class="block3motion">set the rotation style</code> to 
<code class="block3motion">all around</code> to make the eyeball 
<code class="block3motion">point towards the mouse pointer</code> 
<code class="block3control">forever</code>.</p>
```

## Original-Quelle

Das Original-CSS stammt von:
- Raspberry Pi Projects Website
- URL: https://projects.raspberrypi.org/
- CSS-Dateien in deren Theme/Design-System

## Umsetzung

Die Farben sollen in `apps/web/src/styles/rpl.css` integriert werden.
