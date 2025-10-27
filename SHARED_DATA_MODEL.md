# Shared Data Model - Meridiana CRM

## Übersicht

Das Meridiana CRM verwendet ein **Shared Data Model**: Alle authentifizierten Benutzer sehen und verwalten die **gleichen Daten**.

## Datenbank-Architektur

### ✅ Shared Database
- **Ein gemeinsamer Datenbestand** für alle Benutzer
- Alle Projekte, Kontakte, Dokumente sind für alle sichtbar
- Änderungen eines Benutzers sind für alle anderen sofort sichtbar

### 🔐 Authentifizierung
- **Separate User-Accounts** zur Zugriffskontrolle
- **Gemeinsame Datenbasis** für alle authentifizierten Benutzer
- Jeder User kann sich anmelden und hat vollen Zugriff auf alle Daten

## RLS Policies

Die Row Level Security (RLS) Policies in `database/setup_rls.sql` sind so konfiguriert:

```sql
-- Alle authentifizierten Benutzer können ALLE Daten sehen und verwalten
CREATE POLICY "Authenticated users can manage projects" ON projects
  FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');
```

### Funktionsweise:
1. **Authentifizierung erforderlich**: Nur eingeloggte Benutzer haben Zugriff
2. **Voller Zugriff**: Alle authentifizierten Benutzer sehen alle Daten
3. **Keine Isolation**: Keine separate Datenbank pro Benutzer

## Vorteile

✅ **Einfache Kollaboration**: Team-Mitglieder arbeiten mit den gleichen Daten  
✅ **Einfache Verwaltung**: Ein zentraler Datenbestand  
✅ **Keine Duplikation**: Daten werden nicht pro Benutzer gespeichert  
✅ **Konsistenz**: Alle Benutzer sehen stets den aktuellen Stand  

## Verwendung

1. **Multi-User-Login**: Verschiedene Benutzer können sich anmelden
2. **Shared Data**: Alle sehen die gleichen Projekte und Kontakte
3. **Real-time Updates**: Änderungen eines Benutzers sind für alle sichtbar
4. **Zugriffskontrolle**: Nur authentifizierte Benutzer haben Zugriff

## Security

🔒 **Geschützt**: Nur authentifizierte Benutzer können Daten sehen/ändern  
🔒 **Kontrolle**: Benutzerverwaltung über Supabase Dashboard  
🔒 **RLS aktiv**: Row Level Security schützt vor unautorisiertem Zugriff  

## Implementierung

Die Authentifizierung ist implementiert mit:
- **Supabase Auth**: Email/Passwort-Login
- **Middleware**: Protected Routes, automatische Weiterleitung
- **RLS Policies**: Shared Data für alle authentifizierten User

## Beispiel

```
User A (admin@meridiana.com) meldet sich an
  ↓
Sieht alle Projekte und Kontakte
  ↓
Erstellt neues Projekt "TechCorp AG"
  ↓
User B (manager@meridiana.com) meldet sich an
  ↓
Sieht sofort das neue Projekt "TechCorp AG"
```

Beide User arbeiten mit **denselben Daten**.

