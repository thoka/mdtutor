# Sentinel Migration Mapping

Dieses Dokument verfolgt die Überführung der manuellen `PROJECT_RULES.md` in das automatisierte Sentinel-Framework.

| Regel-Bereich | Regel / Anweisung | Sentinel-Ort | Status | Anmerkung |
| :--- | :--- | :--- | :--- | :--- |
| **Git Rules** | NEVER code without a feature branch | `test/0-process/workflow.rb` | ✅ | |
| **Git Rules** | ALWAYS commit an Implementation Plan | `test/0-process/workflow.rb` | ✅ | |
| **Architecture** | Monorepo: Uses pnpm workspaces | `test/1-setup/environment.rb` | ✅ | Prüft `node_modules` |
| **Architecture** | Web App: Svelte 5 + Vite | `test/1-setup/environment.rb` | ✅ | Port-Checks (5201) |
| **Architecture** | API Server: Express | `test/1-setup/environment.rb` | ✅ | Port-Checks (3101) |
| **Architecture** | Achievements & SSO (Ruby) | `test/1-setup/environment.rb` | ✅ | Port-Checks (3102, 3103) |
| **Workflow** | Planning First | `test/0-process/workflow.rb` | ✅ | Brain-Doc Check |
| **Workflow** | Setup: `pnpm install` | `test/1-setup/environment.rb` | ✅ | |
| **Workflow** | Development: `pnpm run dev` | `test/README.md` | ✅ | Dokumentiert im Test-README |
| **Ecosystem** | `content/RPL` presence | `test/1-setup/environment.rb` | ✅ | |
| **Svelte 5** | Use Runes exclusively | `test/4-contracts/web.rb` | ⏳ | Geplant als Lint-Check |
| **Data Flow** | GIDs (ECOSYSTEM:TYPE:SLUG) | `test/2-data/gids.rb` | ⏳ | Geplant |
| **API-First** | API Spec tested by RSpec | `test/4-contracts/api.rb` | ⏳ | Geplant |

