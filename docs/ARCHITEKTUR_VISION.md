# Architektur-Vision: Ökosysteme, Layering und GIDs

Dieses Dokument hält die Diskussion und Vision zur langfristigen Strukturierung der MDTutor-Plattform fest. Ziel ist es, eine kohärente Sicht im Makerspace zu schaffen, die verschiedene Content-Quellen nahtlos integriert.

## Kernkonzepte

### 1. Von Providern zu Ökosystemen
Anstatt Inhalte hart nach Anbietern (z.B. Raspberry Pi) zu trennen, gruppieren wir sie nach **Ökosystemen**. Ein Ökosystem definiert ein gemeinsames semantisches Vokabular (Tags, Achievements, Badges) und technische Standards (Parser-Typen).

*   **RPL-Ökosystem**: Umfasst alle Inhalte, die dem Raspberry Pi Standard folgen.
*   **Andere Ökosysteme**: Zukünftige Integrationen wie das "Materialnetzwerk" können eigene Ökosysteme mit eigenen Parsern bilden.

### 2. Layering und Overlays (Priorisierung)
Innerhalb eines Ökosystems nutzen wir **Layer**, um verschiedene Instanzen desselben Inhalts zu verwalten. Dies ermöglicht es, eigene Forks von RPL-Inhalten mit lokalen Anpassungen zu nutzen, ohne die Verbindung zum Original zu verlieren.

*   **Layer-Priorität**: Eine Konfiguration legt fest, in welcher Reihenfolge Layer sich überschreiben (z.B. 1. Lokal TAG-Makerspace, 2. Official RPL).
*   **Nahtlose Integration**: Die Web-App zeigt immer die "beste" verfügbare Version eines Inhalts an.

### 3. GIDs (Global Identifiers)
Zur Identifizierung von Content-Elementen (Projekten, Schritten, Medien) führen wir **GIDs** ein. Diese werden direkt in die Markdown-Quellen (z.B. im Frontmatter) eingebettet.

*   **Identität über Repositories hinweg**: Dieselbe GID in einem Original-Repo und einem lokalen Fork markiert sie als semantisch identisch.
*   **Abstammung und Übersetzung**: GIDs erlauben es, die Verwandtschaft zwischen verschiedenen Sprachversionen (`en` vs. `de-DE`) präzise zu verfolgen.
*   **Abwärtskompatibilität**: GIDs können bei Bedarf wieder entfernt werden, ohne die Grundstruktur zu zerstören.

### 4. Semantische Klassen und Namespacing
Trotz der Layer-Struktur nutzen wir Präfixe wie `RPL:` für semantische Klassen (Achievements, Badges). Dies verhindert Kollisionen zwischen Ökosystemen, in denen IDs sonst identisch sein könnten.

### 5. Medien-Metadaten und Lizenzen
Langfristig werden Bilder und andere Medien mit Metadaten ausgestattet, um insbesondere Lizenzinformationen (z.B. CC-BY) und Urheberschaft über GIDs zu verwalten und automatisiert auszuweisen.

## Verzeichnisstruktur (Soll-Zustand)

```text
content/
  RPL/                       (Ökosystem)
    ecosystem.yaml           (Definitionen & Standards)
    sources.yaml             (Zentrale Fetch-Konfiguration)
    layers/
      official/              (Original Content)
      tag-makerspace/        (Lokale Forks & Anpassungen)
```

## Umsetzungsschritte
1.  **Restrukturierung**: Umstellung des `content/` Verzeichnisses auf das Layer-Modell.
2.  **Fetch-Tools**: Anpassung der Werkzeuge, um Inhalte in die korrekten Layer zu laden.
3.  **Parser-Erweiterung**: Schrittweiser Ausbau der semantischen Erkennung (GIDs, Scratch-Previews ohne rohes HTML).
4.  **API-Server**: Implementierung der Layer-Auflösung (Priority-Search).

