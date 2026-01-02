# Analyse: Umstellung der Paketverwaltung für MDTutor

Dieses Dokument analysiert die Vorteile einer Umstellung von `npm` auf alternative Paketmanager wie `pnpm` oder `bun` im Kontext des MDTutor-Monorepos.

## Aktueller Status
- **Manager**: `npm` (v18+ kompatibel)
- **Struktur**: Monorepo mit `npm workspaces`
- **Komponenten**:
  - `apps/web` (Svelte 5, Vite)
  - `packages/api-server` (Node.js, Express)
  - `packages/parser` (Node.js, Unified.js)
  - `packages/backend-ruby` & `packages/sso-server` (Ruby on Rails - nicht direkt von npm verwaltet, aber via Root-Scripts integriert)

---

## Vergleich der Optionen

### 1. pnpm (Empfohlen für Monorepos)
`pnpm` ist bekannt für seine Effizienz und strikte Handhabung von Abhängigkeiten.

**Vorteile für MDTutor:**
- **Speicherplatz-Effizienz**: Durch den Content-Addressable Store werden Pakete nur einmal auf der Festplatte gespeichert, auch wenn sie in mehreren Workspaces verwendet werden.
- **Strikte Abhängigkeiten**: Im Gegensatz zu `npm` erlaubt `pnpm` keinen Zugriff auf nicht deklarierte (transitive) Abhängigkeiten ("Phantom Dependencies"). Dies erhöht die Stabilität des Parsers und der API.
- **Performance**: Deutlich schnelleres `install` durch Hardlinks.
- **Bessere Workspace-Unterstützung**: `pnpm recursive` Befehle sind oft intuitiver und schneller als `npm --workspace`.

### 2. Bun
`bun` ist eine All-in-One JavaScript-Runtime und Paketmanager.

**Vorteile für MDTutor:**
- **Extreme Geschwindigkeit**: Der schnellste Paketmanager am Markt.
- **Integrierte Tools**: Könnte `dotenv`, `concurrently` und teilweise Test-Runner ersetzen.
- **Native TypeScript-Unterstützung**: Der `api-server` oder `parser` könnten ohne Build-Step direkt ausgeführt werden.

**Nachteile/Risiken:**
- **Kompatibilität**: MDTutor nutzt spezifische Node-Features und native Module (z.B. via Puppeteer). Bun ist zwar hochkompatibel, aber nicht 100% identisch mit Node.js.
- **Stabilität**: Weniger erprobt in produktiven Enterprise-Umgebungen als `pnpm`.

---

## Zusammenfassung & Empfehlung

| Feature | npm (aktuell) | pnpm | Bun |
| :--- | :--- | :--- | :--- |
| **Install Speed** | Mittel | Schnell | Extrem Schnell |
| **Disk Usage** | Hoch | Niedrig | Mittel |
| **Monorepo-Handling** | Basis | Exzellent | Gut |
| **Striktheit** | Niedrig | Hoch | Niedrig |
| **Runtime** | Node.js | Node.js | Bun Runtime |

### Empfehlung: Umstellung auf `pnpm`

Für das MDTutor-Projekt bietet **pnpm** das beste Verhältnis zwischen Stabilität, Geschwindigkeit und sauberer Architektur.

**Warum pnpm?**
1. **Vermeidung von Phantom Dependencies**: Besonders wichtig für den `parser`, damit dieser nicht versehentlich auf Pakete zugreift, die nur in `apps/web` installiert sind.
2. **Workspace-Isolation**: Die Verlinkung zwischen `packages/parser` und `apps/web` ist mit pnpm robuster.
3. **CI/CD Performance**: Kürzere Build-Zeiten in GitHub Actions.

---

## Nächste Schritte (Migrationsplan)

1. **Vorbereitung**: `pnpm` lokal installieren.
2. **Konvertierung**: `pnpm import` nutzen, um die `package-lock.json` zu konvertieren.
3. **Workspace-Config**: `pnpm-workspace.yaml` erstellen.
4. **Cleanup**: `node_modules` und `package-lock.json` löschen.
5. **Validierung**: `pnpm install` ausführen und alle Tests (`npm run test`) verifizieren.
6. **Docker-Update**: `Dockerfile` im `api-server` anpassen.
