# API Port Configuration für mehrere Entwicklungsumgebungen 🔹ZXRTF

## Problem

Wenn mehrere Agenten/IDEs gleichzeitig laufen, können sie auf unterschiedlichen Ports konfiguriert sein. Es muss sichergestellt werden, dass jede Web-App die richtige API verwendet.

## Lösung

### 1. Health Check Endpoint

Der API-Server stellt einen `/api/health` Endpoint bereit, der die aktuelle Konfiguration zurückgibt:

```bash
curl http://localhost:3203/api/health
```

Response:
```json
{
  "status": "ok",
  "port": 3203,
  "apiPort": "3203",
  "portEnv": null,
  "usingParser": true,
  "timestamp": "2025-12-29T..."
}
```

### 2. Environment-Variablen

Jede Entwicklungsumgebung sollte eine eigene `.env` Datei haben:

```bash
# .env für IDE 1
API_PORT=3201
WEB_PORT=5201

# .env für IDE 2
API_PORT=3203
WEB_PORT=5203
```

### 3. Vite Proxy Konfiguration

Der Vite-Proxy in `apps/web/vite.config.ts` verwendet automatisch `API_PORT` aus der `.env`:

```typescript
proxy: {
  '/api': {
    target: `http://localhost:${env.API_PORT || '3201'}`,
    changeOrigin: true,
  }
}
```

### 4. Tests

Es gibt Tests, die die Konfiguration validieren:

```bash
# API Server Tests
cd packages/api-server
npm test -- test/port-configuration.test.js

# Web App Tests
cd apps/web
npm test -- test/api-connection.test.js
```

Die Tests prüfen:
- ✅ Vite Proxy zeigt auf den richtigen API-Port
- ✅ API Health Endpoint ist erreichbar
- ✅ API verwendet parseProject (nicht statische Dateien)
- ✅ Port-Konfiguration ist konsistent

### 5. Runtime-Validierung (optional)

Die Web-App kann zur Laufzeit prüfen, ob die richtige API verwendet wird:

```typescript
import { checkApiHealth, validateApiPort } from './lib/api-config';

// Prüfe API Health
const health = await checkApiHealth();
console.log('API Port:', health?.port);
console.log('Using Parser:', health?.usingParser);

// Validiere Port
const isValid = await validateApiPort(3203);
```

## Best Practices

1. **Separate .env Dateien**: Jede IDE/Umgebung sollte eine eigene `.env` haben
2. **Port-Bereiche**: Verwende unterschiedliche Port-Bereiche für verschiedene Umgebungen
   - IDE 1: 3201/5201
   - IDE 2: 3203/5203
   - IDE 3: 3205/5205
3. **Health Check vor Start**: Prüfe `/api/health` bevor du die Web-App startest
4. **Tests ausführen**: Führe die Port-Konfigurationstests aus, um sicherzustellen, dass alles korrekt ist

## Troubleshooting

### Problem: Web-App verbindet sich mit falscher API

**Lösung:**
1. Prüfe `.env` Datei: `cat .env | grep API_PORT`
2. Prüfe API Health: `curl http://localhost:$(grep API_PORT .env | cut -d= -f2)/api/health`
3. Starte Web-App neu: `npm run web`

### Problem: API verwendet statische Dateien statt Parser

**Lösung:**
1. Prüfe API Health: `usingParser` sollte `true` sein
2. Starte API-Server neu: `npm run api`
3. Prüfe Logs auf Parsing-Fehler

### Problem: Port-Konflikte

**Lösung:**
1. Prüfe welche Ports belegt sind: `lsof -ti:3201,3203,5201,5203`
2. Ändere Ports in `.env`
3. Starte Server neu

