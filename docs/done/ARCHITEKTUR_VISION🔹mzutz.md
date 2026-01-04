# Architektur-Vision: Ökosysteme, Layering und GIDs 🔹mzutz

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

### 3. GIDs (Global Identifiers) und Semantische Identität
Zur Identifizierung von Content-Elementen (Projekten, Schritten, Medien) nutzen wir **GIDs**. Diese markieren die semantische Identität eines Objekts, unabhängig davon, in welchem Repository oder Layer es gerade gespeichert ist.

*   **Format**: `ÖKOSYSTEM:TYP:SLUG` (z.B. `RPL:PROJ:space-talk`).
    *   **Ökosystem**: Der Gültigkeitsbereich (z.B. `RPL`).
    *   **Typ**: Die Art des Objekts (`PROJ` für Projekt, `PATH` für Pfad, `STEP` für Schritt, `ASSET` für Medien).
    *   **Slug**: Die menschenlesbare Identität.
*   **Identität bei Forks**: Wenn ein Projekt geforkt wird, bleibt die GID identisch. Das System nutzt das **Layering**, um zu entscheiden, welche Instanz dieser GID (z.B. aus `tag-makerspace` statt `official`) angezeigt wird.
*   **Vorteil**: Lernfortschritte und semantische Verknüpfungen (Achievements) bleiben erhalten, auch wenn der Content lokal angepasst oder verschoben wird.
*   **Abstammung**: GIDs in verschiedenen Sprachen (z.B. `en` und `de-DE`) erlauben es, die semantische Äquivalenz präzise zu verfolgen.

### 4. Makerspace-spezifische Konfiguration und Mehrsprachigkeit
Die Entscheidung, welche Inhalte in einem Makerspace verfügbar sein sollen, wird zentral gesteuert und ist vom eigentlichen Content getrennt.

*   **Speicherort**: `content/ÖKOSYSTEM/config/`.
*   **Funktion**: Hier wird konfiguriert, welche Lernpfade aus welchen Quellen (API-Bases, Git-Repos) lokal synchronisiert und "abonniert" werden.
*   **Mehrsprachigkeit**: Inhalte (Titel, Beschreibungen, Abschnitte) werden in den YAML-Dateien als Dictionaries mit Sprachschlüsseln (`en`, `de-DE`) gespeichert.
*   **Markdown statt HTML**: In den YAML-Dateien speichern wir reines Markdown. Der API-Server wandelt dieses bei Bedarf für das Frontend in HTML um.
*   **Semantische Sektionen**: Anstatt loser Listen nutzen wir feste Schlüssel für Inhaltsbereiche (z.B. `overview`, `need`, `know`, `mentor`). Dies erlaubt dem Frontend eine stabile Zuordnung von Icons und Layouts, unabhängig von der gewählten Sprache.
*   **Gecachte API**: Lokale Pfad-Dateien (`.yaml`) fungieren als Read-Through-Cache der offiziellen APIs.

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

