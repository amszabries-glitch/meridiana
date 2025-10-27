# Authentifizierung Setup - Meridiana CRM

## Übersicht

Das CRM-System wurde mit Supabase Auth gesichert, um sensible Daten zu schützen.

## Implementierte Features

### 1. **Login-System** (`app/login/page.tsx`)
- E-Mail/Passwort-Authentifizierung
- Fehlerbehandlung
- Responsives Design mit CI
- Nur manuell erstellte Benutzer haben Zugriff
- Kein öffentlicher Registrierungsprozess

### 2. **Middleware** (`middleware.ts`)
- Automatische Weiterleitung zu `/login` bei fehlender Authentifizierung
- Geschützte Routen: Nur authentifizierte Benutzer können auf Dashboard/Kontakte/Analytics zugreifen
- `/login` ist öffentlich zugänglich
- Automatische Weiterleitung zum Dashboard bei bereits angemeldeten Benutzern

### 3. **Server Client** (`lib/supabase-server.ts`)
- Server-seitiger Supabase-Client mit Cookie-basiertem Session-Management
- Für zukünftige Server Actions

### 4. **User Menu** (`components/UserMenu.tsx`)
- Anzeige des angemeldeten Benutzers
- Logout-Funktion
- Dropdown-Menü

### 5. **RLS Policies** (`database/setup_rls.sql`)
- Row Level Security für alle Tabellen
- Nur authentifizierte Benutzer können Daten sehen/ändern
- Automatische Sperre für nicht authentifizierte Zugriffe

## Setup-Anleitung

### 1. Supabase Auth aktivieren

In Ihrem Supabase Dashboard:

1. Gehen Sie zu **Authentication** > **Settings**
2. Aktivieren Sie **Email Auth**
3. Setzen Sie **Site URL** auf: `http://localhost:3003` (für Development)

### 2. Ersten Benutzer erstellen

**Option A: Via Supabase Dashboard**
1. Gehen Sie zu **Authentication** > **Users**
2. Klicken Sie auf **Add User** > **Create New User**
3. Geben Sie E-Mail und Passwort ein
4. Klicken Sie auf **Create User**

**Option B: Via SQL (für Admin-Zugang)**
```sql
-- In Supabase SQL Editor
INSERT INTO auth.users (email, encrypted_password, email_confirmed_at, created_at, updated_at)
VALUES ('admin@meridiana.com', crypt('IhrSicheresPasswort123!', gen_salt('bf')), NOW(), NOW(), NOW());
```

### 3. RLS Policies aktivieren

In Supabase SQL Editor:
```sql
-- Ausführen: database/setup_rls.sql
```

### 4. Testen

1. Server starten: `npm run dev`
2. Navigieren Sie zu `http://localhost:3003`
3. Sie werden automatisch zu `/login` weitergeleitet
4. Melden Sie sich mit Ihren Credentials an
5. Sie werden zum Dashboard weitergeleitet

## Sicherheits-Features

✅ **Geschützte Routen**: Nur `/login` ist öffentlich zugänglich
✅ **RLS Policies**: Datenbank-seitige Zugriffskontrolle
✅ **Session-Management**: Automatische Session-Verwaltung via Cookies
✅ **Automatische Logout**: Bei fehlender Session → Redirect zu Login
✅ **Passwort-Hashing**: Supabase verwendet bcrypt für Passwort-Hashing

## Login-Credentials

Nach dem Setup können Sie sich mit folgenden Daten anmelden:
- **E-Mail**: Die E-Mail-Adresse, die Sie in Supabase erstellt haben
- **Passwort**: Das Passwort, das Sie beim Erstellen festgelegt haben

## Benutzerverwaltung

### Benutzer manuell erstellen

**In Supabase Dashboard:**
1. Gehen Sie zu **Authentication** > **Users**
2. Klicken Sie auf **Add User** > **Create New User**
3. E-Mail-Adresse eingeben
4. Passwort festlegen (stark empfohlen!)
5. Bestätigen mit **Create User**

**Hinweis**: Es gibt KEINE öffentliche Registrierung. Alle Benutzer müssen von einem Administrator erstellt werden.

### Benutzer verwalten

- **Alle Benutzer anzeigen**: Authentication > Users
- **Benutzer löschen**: Users-Tabelle > Action-Menü > Delete
- **Passwort zurücksetzen**: Users-Tabelle > Action-Menü > Reset Password

### Registrierung deaktiviert

Das System verwendet **kein Sign-Up**. Nur manuell erstellte Benutzer können sich anmelden. Dies gewährleistet maximalen Schutz für sensible Daten.

## Zukünftige Erweiterungen

- [ ] Password Reset Flow
- [ ] Email Verification (optional)
- [ ] Multi-User-Support mit Rollen (Admin/User)
- [ ] User Profile Management
- [ ] Activity Logging
- [ ] 2FA (Two-Factor Authentication)

