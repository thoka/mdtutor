# Implementation Plan: Makerspace Management (Rooms & History)

Dieses Dokument beschreibt die Erweiterung des SSO- und Achievement-Systems um eine Raum-Verwaltung, Besuchs-Historie und Echtzeit-Arbeitsübersichten.

## Zielsetzung
- **Räume**: Definition von physischen Räumen (z.B. "Holzwerkstatt", "Elektronik-Labor").
- **Präsenz 2.0**: Nutzer können in spezifischen Räumen ein- und ausgecheckt werden.
- **Besuchs-Log**: Lückenlose Protokollierung der Aufenthaltszeiten pro User und Raum.
- **Arbeits-Dashboard**: Übersicht "Wer ist gerade wo?" und "Woran wird gerade gearbeitet?".
- **Daten-Integrität**: JSONL bleibt als "Raw Action Log" erhalten, die DB dient als Abfrage-Index.

## Architektur & Datenmodell

### SSO-Server (Präsenz-Infrastruktur)
- **Room**: `id`, `name`, `slug`.
- **Presence**: Update um `room_id` (beliebig viele parallele Räume möglich oder Single-Room Fokus).
- **Visit**: `user_id`, `room_id`, `started_at`, `ended_at`.

### Backend-Ruby (Aktions-Index)
- **Action (DB)**: `user_id`, `action_type`, `gid`, `metadata`, `timestamp`.
- **TrackActionService**: Schreibt redundant in **DB AND JSONL**.

## Workflow

```mermaid
sequenceDiagram
    participant U as User (SSO)
    participant S as SSO-Server
    participant B as Backend (Actions)
    
    U->>S: Admin checkt User in "Holzwerkstatt" ein
    S->>S: Erstelle Visit (started_at)
    S->>S: Update Presence (is_present=true, room_id=holz)
    
    U->>B: User bearbeitet Tutorial "Vogelhaus"
    B->>B: Schreibe JSONL (Master Log)
    B->>B: Schreibe DB (Abfrage Index)
    
    Admin->>S: Dashboard "Holzwerkstatt" aufrufen
    S->>S: Suche anwesende User
    S->>B: Frage letzte Aktionen dieser User ab
    S-->>Admin: Zeige: "Thomas arbeitet gerade an 'Vogelhaus'"
```

## Umsetzungsschritte

### 1. Räume & Besuche (SSO-Server)
- Migrationen für `rooms` und `visits`.
- Update `Presence` Logik (Check-in erzeugt Visit, Check-out beendet Visit).

### 2. Duales Logging (Backend-Ruby)
- Erstelle `Action` Model und Migration.
- Update `TrackActionService` für paralleles Schreiben (DB + JSONL).

### 3. Raum-Übersicht & Logs (UI)
- Phlex View für Besuchs-Historie (pro User/Raum).
- "Who is where?" Dashboard.

