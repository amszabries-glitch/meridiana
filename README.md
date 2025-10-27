# Meridiana CRM - Capital Markets Deal Management

Ein hochwertiges, benutzerfreundliches CRM-System für Meridiana Capital Markets, entwickelt für professionelles Deal-Management und Pipeline-Tracking.

## 🚀 Features

### 📊 **Dashboard & Analytics**
- Übersichtliche Statistiken und KPIs
- Pipeline-Visualisierung mit Charts
- Performance-Metriken und Gewinnraten
- Schnellaktionen für häufige Aufgaben

### 💼 **Deal Management**
- Vollständige Deal-Pipeline von Lead bis Close
- Prioritäts- und Status-Management
- Wert- und Wahrscheinlichkeits-Tracking
- Erwartete vs. tatsächliche Schließdaten

### 👥 **Kontakt-Management**
- Zentrale Kontaktverwaltung
- Deal-Kontakt-Zuordnungen
- Rollen-basierte Kontakt-Kategorisierung
- Vollständige Kommunikationshistorie

### 📅 **Aktivitäten & Tasks**
- Aktivitäts-Tracking (Calls, Meetings, E-Mails)
- Terminplanung und Erinnerungen
- Deal-bezogene Aktivitäten
- Fortschritts-Monitoring

### 🎨 **Premium Design**
- Moderne, konsultantengradige UI/UX
- Responsive Design für alle Geräte
- Dunkel-/Hellmodus Support
- Hochwertige Animationen und Übergänge

## 🛠 Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui
- **Backend**: Supabase (PostgreSQL + Auth + Real-time)
- **Charts**: Recharts
- **Icons**: Lucide React
- **Deployment**: Vercel + GitHub

## 📋 Voraussetzungen

- Node.js 18+ 
- npm oder yarn
- Supabase Account
- GitHub Account (für Deployment)

## 🚀 Setup & Installation

### 1. Repository klonen
```bash
git clone <repository-url>
cd meridiana-crm
```

### 2. Dependencies installieren
```bash
npm install
# oder
yarn install
```

### 3. Supabase Setup

#### 3.1 Supabase Projekt erstellen
1. Gehen Sie zu [supabase.com](https://supabase.com)
2. Erstellen Sie ein neues Projekt
3. Notieren Sie sich die Projekt-URL und API-Keys

#### 3.2 Datenbankschema einrichten
1. Öffnen Sie die SQL-Editor in Ihrem Supabase Dashboard
2. Kopieren Sie den Inhalt von `supabase/schema.sql`
3. Führen Sie das SQL-Script aus

#### 3.3 Umgebungsvariablen konfigurieren
```bash
cp env.example .env.local
```

Füllen Sie `.env.local` mit Ihren Supabase-Credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### 4. Entwicklungsserver starten
```bash
npm run dev
# oder
yarn dev
```

Öffnen Sie [http://localhost:3000](http://localhost:3000) in Ihrem Browser.

## 🗄 Datenbankschema

Das System verwendet folgende Haupttabellen:

- **profiles**: Benutzerprofile und Rollen
- **deals**: Deal-Informationen und Status
- **contacts**: Kontaktverwaltung
- **deal_contacts**: Deal-Kontakt-Zuordnungen
- **activities**: Aktivitäten und Tasks

### Wichtige Features:
- Row Level Security (RLS) für Datenschutz
- Automatische Timestamps
- Optimierte Indizes für Performance
- Analytics-Funktionen für Dashboard

## 🎯 Verwendung

### Erste Schritte
1. **Registrierung**: Erstellen Sie ein neues Konto
2. **Dashboard**: Überblick über alle wichtigen Metriken
3. **Deals**: Erstellen und verwalten Sie Ihre Deals
4. **Kontakte**: Fügen Sie wichtige Geschäftspartner hinzu
5. **Aktivitäten**: Planen Sie Follow-ups und Meetings

### Deal-Pipeline
- **Lead**: Erste Kontaktaufnahme
- **Qualifiziert**: Interesse bestätigt
- **Angebot**: Offizielle Angebotserstellung
- **Verhandlung**: Preis- und Konditionsverhandlung
- **Gewonnen**: Deal erfolgreich abgeschlossen
- **Verloren**: Deal nicht erfolgreich

### Best Practices
- Aktualisieren Sie regelmäßig den Deal-Status
- Dokumentieren Sie alle wichtigen Aktivitäten
- Nutzen Sie die Wahrscheinlichkeits-Features
- Überwachen Sie Ihre Pipeline-Performance

## 🚀 Deployment

### Vercel Deployment
1. Verbinden Sie Ihr GitHub Repository mit Vercel
2. Konfigurieren Sie die Umgebungsvariablen in Vercel
3. Deploy automatisch bei jedem Push

### Umgebungsvariablen für Production
```env
NEXT_PUBLIC_SUPABASE_URL=your_production_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_production_service_role_key
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

## 🔒 Sicherheit

- Supabase Row Level Security (RLS)
- Benutzer-Authentifizierung mit E-Mail/Passwort
- OAuth-Integration (Google)
- Sichere API-Endpunkte
- Datenvalidierung auf Client und Server

## 📈 Performance

- Server-Side Rendering (SSR)
- Optimierte Datenbankabfragen
- Lazy Loading für große Datensätze
- Caching-Strategien
- Responsive Images

## 🤝 Support & Wartung

### Häufige Aufgaben
- Regelmäßige Backups über Supabase
- Performance-Monitoring
- Sicherheits-Updates
- Feature-Updates basierend auf Feedback

### Troubleshooting
- Überprüfen Sie die Supabase-Verbindung
- Kontrollieren Sie die Umgebungsvariablen
- Prüfen Sie die Browser-Konsole auf Fehler
- Überwachen Sie die Supabase-Logs

## 📝 Lizenz

© 2024 Meridiana Capital Markets. Alle Rechte vorbehalten.

## 🎨 Design-System

Das System verwendet ein konsistentes Design-System mit:
- Meridiana Corporate Colors
- Premium Schatten und Effekte
- Responsive Grid-Layouts
- Accessibility-konforme Komponenten
- Moderne Animationen und Übergänge

---

**Entwickelt für Meridiana Capital Markets** - Professionelles Deal-Management für den Kapitalmarkt.
