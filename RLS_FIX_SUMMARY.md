# RLS Fix - Meridiana CRM

## Problem

Beim Erstellen von Projekten trat folgender Fehler auf:
```
Error: new row violates row-level security policy for table "projects"
```

## Ursache

- **RLS Policies aktiviert**: Row Level Security ist für alle Tabellen aktiviert
- **Falscher Client**: Server Actions verwendeten den Browser-Client (`@supabase/supabase-js`)
- **Keine Session**: Browser-Client hat keine Session in Server Actions
- **Policy braucht Session**: `auth.role() = 'authenticated'` benötigt eine Auth-Session

## Lösung

### 1. Server-Client erstellt (`lib/supabase-server.ts`)
- Verwendet `@supabase/ssr` für Server Actions
- Liest Cookies für Auth-Session
- Korrekte Session-Behandlung

### 2. Server Actions umgestellt (`lib/actions.ts`)
- Alle Server Actions verwenden jetzt `createSupabaseServerClient()`
- Cookie-basierte Auth-Session wird richtig übergeben
- RLS Policies werden korrekt evaluiert

### 3. Data Cleaning verbessert
- Leere Strings werden zu `null` konvertiert
- Verhindert "invalid input syntax for type date"
- Optional fields werden korrekt behandelt

## Implementierte Funktionen

✅ **createProject**: Erstellt Projekte mit Auth-Session
✅ **getProjectById**: Holt Projekte mit Auth-Session
✅ **updateProject**: Aktualisiert Projekte mit Auth-Session
✅ **deleteProject**: Löscht Projekte mit Auth-Session
✅ **getProjects**: Holt alle Projekte mit Auth-Session
✅ **getContacts**: Holt Kontakte mit Auth-Session
✅ **createContact**: Erstellt Kontakte mit Auth-Session
✅ **getDashboardStats**: Berechnet Statistiken mit Auth-Session

## Testen

1. Server läuft auf `http://localhost:3000`
2. Login mit vorhandenem Benutzer
3. Projekt anlegen sollte jetzt funktionieren
4. Keine RLS Policy Verletzungen mehr

## Nächste Schritte

1. SQL-Script in Supabase ausführen:
   ```sql
   -- Führen Sie aus: database/setup_rls.sql
   ```
2. Testen Sie die Anwendung
3. Überprüfen Sie, ob Projekte erstellt werden können

