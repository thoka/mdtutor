# Scratch Code Block Styling

## Anforderung

Tutorial-Inhalte enthalten Scratch-Code-Referenzen mit speziellen Klassen, z.B.:
- `<code class="block3events">when this sprite clicked</code>`
- `<code class="block3motion">point towards</code>`
- `<code class="block3looks">change color effect</code>`
- `<code class="block3control">forever</code>`

Diese sollen farblich kodiert werden, um Scratch-Blöcke visuell zu repräsentieren.

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
