# 🚀 Supabase Setup - Phase 1

## 📋 **Schritt-für-Schritt Anleitung**

### **1. Supabase-Projekt erstellen**

1. **Gehen Sie zu [supabase.com](https://supabase.com)**
2. **Klicken Sie auf "Start your project"**
3. **Melden Sie sich mit GitHub an** (empfohlen)
4. **Erstellen Sie ein neues Projekt:**
   - **Name**: `meridiana-crm`
   - **Database Password**: Notieren Sie sich das Passwort!
   - **Region**: Wählen Sie die nächstgelegene Region (z.B. Frankfurt)

### **2. API-Keys abrufen**

Nach der Erstellung:
1. **Gehen Sie zu Settings → API**
2. **Kopieren Sie:**
   - **Project URL** (z.B. `https://xyz.supabase.co`)
   - **anon public key** (beginnt mit `eyJ...`)

### **3. Environment Variables konfigurieren**

Erstellen Sie eine `.env.local` Datei im Projekt-Root:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

**Wichtig**: Ersetzen Sie `your_supabase_url_here` und `your_supabase_anon_key_here` mit Ihren echten Werten!

### **4. Datenbank-Schema erstellen**

1. **Gehen Sie zu SQL Editor in Supabase**
2. **Kopieren Sie den Inhalt von `database/schema.sql`**
3. **Führen Sie das SQL-Script aus**

Das Script erstellt:
- ✅ **projects** Tabelle für Börsenmäntel
- ✅ **contacts** Tabelle für Kontakte
- ✅ **project_contacts** Verknüpfungstabelle
- ✅ **Sample-Daten** für Tests
- ✅ **Indexes** für Performance
- ✅ **Row Level Security** für Sicherheit

### **5. Testen der Verbindung**

Nach der Konfiguration:
1. **Starten Sie den Development Server neu:**
   ```bash
   npm run dev
   ```
2. **Öffnen Sie `http://localhost:3000/dashboard`**
3. **Sie sollten echte Daten aus der Datenbank sehen!**

---

## 🔧 **Troubleshooting**

### **Problem: "Error loading data"**
- ✅ Prüfen Sie die `.env.local` Datei
- ✅ Stellen Sie sicher, dass die Supabase-URL korrekt ist
- ✅ Prüfen Sie, ob das SQL-Schema ausgeführt wurde

### **Problem: "No data found"**
- ✅ Prüfen Sie, ob die Sample-Daten eingefügt wurden
- ✅ Gehen Sie zu Table Editor in Supabase und prüfen Sie die `projects` Tabelle

### **Problem: "Connection failed"**
- ✅ Prüfen Sie Ihre Internetverbindung
- ✅ Stellen Sie sicher, dass die Supabase-URL erreichbar ist

---

## 📊 **Was Sie nach dem Setup haben:**

### **✅ Echte Datenbank-Integration**
- Alle Projekte werden in Supabase gespeichert
- Automatische Berechnung der KPIs
- Sichere Datenspeicherung

### **✅ Live-Dashboard**
- Echtzeit-Daten aus der Datenbank
- Automatische Updates bei Änderungen
- McKinsey-Level UI/UX

### **✅ Bereit für Phase 2**
- CRUD-Operationen (Create, Read, Update, Delete)
- Formulare für neue Projekte
- Kontakt-Management

---

## 🎯 **Nächste Schritte nach erfolgreichem Setup:**

1. **Testen Sie das Dashboard** - Alle Daten sollten aus der Datenbank kommen
2. **Prüfen Sie die KPIs** - Werte sollten korrekt berechnet werden
3. **Bereit für Phase 2** - CRUD-Funktionalität implementieren

**🚀 Sobald alles funktioniert, können wir mit Phase 2 (CRUD-Funktionalität) beginnen!**
