# Panel-Funktionalität

## Übersicht
Collapsible Panels ermöglichen es, zusätzliche Informationen (z.B. Zutaten, Hinweise) ein- und auszublenden.

## HTML-Struktur

```html
<div class="c-project-panel c-project-panel--ingredient">
  <h3 class="c-project-panel__heading js-project-panel__toggle">
    Copy code from one sprite to another
  </h3>
  <div class="c-project-panel__content u-hidden">
    <!-- Panel-Inhalt -->
  </div>
</div>
```

## CSS-Klassen

### `.c-project-panel`
- Container für das gesamte Panel
- Definiert Border, Border-Radius, Margins

### `.c-project-panel--ingredient` 
- Modifier für Ingredient-Panels
- Hellerer Hintergrund (#fafafa)

### `.c-project-panel__heading`
- Panel-Überschrift
- Grauer Hintergrund (#f5f5f5)
- `cursor: pointer` - zeigt Klickbarkeit an
- Pfeil-Icon (▼) rechts
- Hover-Effekt

### `.js-project-panel__toggle`
- JavaScript-Hook-Klasse
- Markiert klickbare Panel-Header

### `.c-project-panel__content`
- Panel-Inhalt-Container
- CSS-Transition für smooth Animation

### `.u-hidden`
- Utility-Klasse zum Verstecken
- `display: none`

## JavaScript-Implementierung

**Datei:** `apps/web/src/lib/StepContent.svelte`

```typescript
// Handle collapsible panels
const panelToggles = contentDiv.querySelectorAll('.js-project-panel__toggle');
panelToggles.forEach(toggle => {
  toggle.addEventListener('click', (e) => {
    const panel = (e.target as HTMLElement).closest('.c-project-panel');
    const content = panel?.querySelector('.c-project-panel__content');
    if (content) {
      content.classList.toggle('u-hidden');
    }
  });
});
```

### Ablauf
1. **Event-Listener:** Beim Klick auf `.js-project-panel__toggle`
2. **Panel finden:** Sucht das umschließende `.c-project-panel` Element
3. **Content finden:** Sucht `.c-project-panel__content` innerhalb des Panels
4. **Toggle:** Fügt/entfernt `.u-hidden` Klasse

### Event-Attachment
- Events werden in `attachEventHandlers()` registriert
- Wird aufgerufen bei:
  - Component Mount (`onMount`)
  - Content-Änderungen (`$effect` auf `content` und `step`)

## CSS-Animation

```css
.c-project-panel__heading::after {
  content: '▼';
  position: absolute;
  right: 1rem;
  transition: transform 0.3s;
}

.c-project-panel__content {
  padding: 1rem;
  transition: all 0.3s ease;
}
```

- **Pfeil-Rotation:** Könnte animiert werden (aktuell statisch)
- **Content-Transition:** 0.3s ease für smooth Ein-/Ausblenden
- **Hover-Feedback:** Hintergrundfarbe ändert sich bei `:hover`

## Verbesserungsmöglichkeiten

### Aktuell implementiert:
✅ Click-Handler auf Panel-Header  
✅ Toggle von `.u-hidden` Klasse  
✅ CSS-Transition für smooth Animation  
✅ Visuelles Feedback (Hover-Effekt)  
✅ Pfeil-Icon zur Indikation  

### Mögliche Erweiterungen:
- [ ] Pfeil-Rotation bei geöffnetem Panel (▼ → ▲)
- [ ] Max-height Animation statt display: none für smoothere Übergänge
- [ ] ARIA-Attribute für Accessibility (aria-expanded, aria-controls)
- [ ] Keyboard-Navigation (Enter/Space zum Öffnen)
- [ ] Panel-State in LocalStorage speichern

## Beispiel-Verwendung im Parser

Der Parser generiert Panels für verschiedene Inhaltstypen:

```markdown
--- ingredients ---
* Scratch 3
* Eine Katze
---
```

Wird zu:

```html
<div class="c-project-panel c-project-panel--ingredient">
  <h3 class="c-project-panel__heading js-project-panel__toggle">
    You will need
  </h3>
  <div class="c-project-panel__content u-hidden">
    <ul>
      <li>Scratch 3</li>
      <li>Eine Katze</li>
    </ul>
  </div>
</div>
```

## State Management

Panels haben **keinen persistenten State**:
- Bei jedem Laden des Steps sind Panels standardmäßig geschlossen (`.u-hidden`)
- State geht bei Navigation verloren (im Gegensatz zu Task-Checkboxen)
- Nutzer muss Panels bei jedem Besuch neu öffnen

Dies ist konsistent mit dem Original-Verhalten.
