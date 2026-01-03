# MDTutor Sentinel Orchestrator

Dieses Verzeichnis ist die Steuerzentrale für die Systemintegrität und Entwicklungs-Orchestrierung.

## Struktur
- `rules/`: Definitionen von Integritäts-Checks und Prozess-Regeln (Kaskade 0-5).
- `actions/`: Automatisierte Arbeitsabläufe (dev, seed, etc.).
- `runner.rb`: Zentraler Einstiegspunkt.

## Nutzung
```bash
# Alle Integritäts-Checks ausführen
ruby sentinel/runner.rb

# Agenten-Modus (Markdown Ausgabe)
SENTINEL_FORMAT=agent ruby sentinel/runner.rb
```
