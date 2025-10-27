# 📄 Dokumenten-Management Setup

## Supabase Schema Update

Um das Dokumenten-Management System zu aktivieren, müssen Sie das erweiterte Schema in Ihrer Supabase-Datenbank ausführen.

### Schritt 1: Supabase Dashboard öffnen
1. Gehen Sie zu [supabase.com](https://supabase.com)
2. Melden Sie sich an und wählen Sie Ihr Meridiana-Projekt aus
3. Navigieren Sie zu **SQL Editor** im linken Menü

### Schritt 2: Schema ausführen
1. Klicken Sie auf **"New query"**
2. Kopieren Sie den gesamten Inhalt aus `database/add_documents.sql`
3. Fügen Sie den Code in den SQL Editor ein
4. Klicken Sie auf **"Run"** um das Schema auszuführen

### Schritt 3: Überprüfung
Nach der Ausführung sollten Sie folgende neue Tabellen sehen:
- ✅ `documents` - Haupttabelle für Dokumente
- ✅ `document_versions` - Versionskontrolle für Dokumente

### Schritt 4: Testen
1. Gehen Sie zu `http://localhost:3001/documents`
2. Sie sollten die Dokumente-Seite mit Sample-Daten sehen
3. Testen Sie den Upload von neuen Dokumenten

## Was wird hinzugefügt:

### 📊 Neue Tabellen:
- **`documents`** - Speichert Dokument-Metadaten
- **`document_versions`** - Versionskontrolle für Dokumente

### 🔧 Features:
- **Kategorisierung**: Legal, Financial, Technical, Marketing, General
- **Tags-System**: Flexible Kategorisierung mit Tags
- **Verknüpfungen**: Zu Projekten und Kontakten
- **Versionskontrolle**: Mehrere Versionen pro Dokument
- **Berechtigungen**: Public/Private Dokumente

### 📈 Sample-Daten:
- TechCorp Due Diligence Report (Legal)
- FinanceGroup Financial Statements (Financial)  
- StartupXYZ Pitch Deck (Marketing)

## Troubleshooting:

### Fehler: "relation already exists"
- Das Schema wurde bereits ausgeführt
- Dokumente-Tabellen sind bereits vorhanden
- Sie können direkt mit der Anwendung fortfahren

### Fehler: "syntax error at or near NOT"
- **Gelöst!** Das Schema wurde korrigiert
- PostgreSQL unterstützt `IF NOT EXISTS` nicht für alle Statements
- Das neue Schema verwendet sichere DO-Blocke

### Fehler: "permission denied"
- Stellen Sie sicher, dass Sie als Projekt-Owner angemeldet sind
- Überprüfen Sie die Supabase-Berechtigungen

### Keine Sample-Daten sichtbar
- Überprüfen Sie, ob die Projekte in der `projects` Tabelle existieren
- Die Sample-Dokumente werden nur erstellt, wenn entsprechende Projekte vorhanden sind

## Nächste Schritte:
Nach erfolgreichem Setup können Sie:
1. **Dokumente hochladen** über die Upload-Funktion
2. **Kategorisieren** und **taggen** von Dokumenten
3. **Verknüpfen** mit Projekten und Kontakten
4. **Suchen und filtern** nach verschiedenen Kriterien
5. **Versionskontrolle** für wichtige Dokumente

---

**Hinweis**: Das Dokumenten-Management System ist vollständig in die bestehende CRM-Architektur integriert und nutzt die gleichen Design-Prinzipien und Corporate Identity.
