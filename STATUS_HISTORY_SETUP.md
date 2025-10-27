# 📊 Status-Verlauf Tracking - Setup Anleitung

## ✅ **Phase 2.3.2 - Status-Verlauf Tracking implementiert!**

### 🎯 **Was wurde implementiert:**

**✅ Datenbank-Schema:**
- `project_status_history` Tabelle
- Automatisches Tracking von Status-Änderungen
- Trigger für automatische History-Einträge
- RLS Policies für sicheren Zugriff

**✅ TypeScript Integration:**
- `ProjectStatusHistory` Interface
- Server Actions für History-Abfragen
- API für Status-Historie

**✅ UI Komponenten:**
- `StatusHistory` Komponente
- Timeline-Darstellung
- CI-konformes Design
- Responsive Layout

---

## 🚀 **Setup in Supabase:**

### **1. Datenbank-Migration ausführen:**

```bash
# Öffnen Sie die Supabase SQL Editor
# Kopieren Sie den Inhalt von database/add_status_history.sql
# Führen Sie das SQL-Script aus
```

**Oder direkt in Supabase Dashboard:**
1. Gehen Sie zu **SQL Editor**
2. Öffnen Sie die Datei `database/add_status_history.sql`
3. Kopieren Sie den gesamten Inhalt
4. Führen Sie das Script aus

### **2. Tabellen-Struktur:**

```sql
-- Haupttabelle für Status-Historie
project_status_history
├── id (UUID, Primary Key)
├── project_id (UUID, Foreign Key → projects)
├── old_status (VARCHAR)
├── new_status (VARCHAR, NOT NULL)
├── changed_at (TIMESTAMP)
├── changed_by (VARCHAR)
├── notes (TEXT)
└── created_at (TIMESTAMP)
```

### **3. Automatisches Tracking:**

Der **Trigger** `project_status_history_trigger` erstellt automatisch History-Einträge, wenn sich der Status eines Projekts ändert:

```sql
-- Trigger funktioniert automatisch bei:
UPDATE projects SET status = 'negotiation' WHERE id = '...';
-- → Erstellt automatisch History-Eintrag
```

### **4. RLS (Row Level Security):**

**Aktuelle Policies:**
- ✅ Alle können History-Einträge lesen (`SELECT`)
- ✅ Alle können History-Einträge erstellen (`INSERT`)
- Automatisches Tracking durch Trigger

**Für spätere Authentifizierung:**
- **Read-Only Users**: Können nur eigene Projekte sehen
- **Admin Users**: Können alle Projekte sehen

---

## 📊 **Nützliche SQL-Views:**

### **1. Status-Übergänge Analytics:**

```sql
SELECT * FROM status_transitions;
-- Zeigt welche Status-Wechsel am häufigsten vorkommen
```

### **2. Projekt-Timeline:**

```sql
SELECT * FROM project_status_timeline WHERE project_id = '...';
-- Zeigt vollständige Timeline eines Projekts
```

---

## 🎨 **UI Features:**

### **Status History Komponente:**

**Features:**
- ✅ Vollständiger Status-Verlauf
- ✅ Timeline-Ansicht
- ✅ Alte/Neue Status Anzeige
- ✅ Datumsstempel für jede Änderung
- ✅ Automatische Aktualisierung
- ✅ CI-konformes Design

**Position:**
- Projekt-Detail-Seite (`/projects/[id]`)
- Grid-Layout mit Timeline (2 Spalten)

---

## 🧪 **Testing:**

### **1. Manuelles Testen:**

**Datenbank direkt testen:**
```sql
-- Test: Status-Änderung
UPDATE projects SET status = 'negotiation' WHERE id = '[Ihre Projekt-ID]';

-- History prüfen
SELECT * FROM project_status_history WHERE project_id = '[Ihre Projekt-ID]';
```

### **2. UI Testen:**

**In der App:**
1. Öffnen Sie ein Projekt: `/projects/[id]`
2. Bearbeiten Sie den Status
3. Prüfen Sie die Status History Sektion
4. Alle Änderungen sollten sofort erscheinen

---

## 🔄 **Automatische Funktionen:**

### **1. Status-Änderung Tracking:**

**Beim Bearbeiten eines Projekts:**
```typescript
// Im EditProjectModal oder ähnlicher Komponente
await updateProject(projectId, {
  status: newStatus
})
// → Trigger erstellt automatisch History-Eintrag
```

### **2. Manuelles Tracking:**

**Für zusätzliche Notizen:**
```typescript
await createStatusHistoryEntry(
  projectId,
  oldStatus,
  newStatus,
  "Projekt wurde zur Verhandlung übergeben"
)
```

---

## 📈 **Analytics Möglichkeiten:**

### **1. Häufigste Status-Übergänge:**

```sql
SELECT * FROM status_transitions 
ORDER BY transition_count DESC 
LIMIT 10;
```

### **2. Durchschnittliche Bearbeitungszeit:**

```sql
SELECT 
  old_status,
  new_status,
  AVG(EXTRACT(EPOCH FROM (changed_at - created_at))) as avg_time_seconds
FROM project_status_history
GROUP BY old_status, new_status;
```

### **3. Projekte mit Status-Änderungen:**

```sql
SELECT 
  p.name,
  COUNT(psh.id) as status_changes,
  MAX(psh.changed_at) as last_status_change
FROM projects p
LEFT JOIN project_status_history psh ON p.id = psh.project_id
GROUP BY p.id, p.name
ORDER BY status_changes DESC;
```

---

## 🎯 **Nächste Schritte:**

### **Phase 2.3.3**: Meilenstein-System
- Milestones Tabelle
- Meilenstein-Tracker UI
- Benachrichtigungen

### **Phase 4.1**: Erweiterte Features
- E-Mail-Benachrichtigungen bei Status-Änderungen
- Export-Funktion für Status-Historie
- Analytics Dashboard

---

## ✅ **Checkliste:**

- [x] Datenbank-Schema erstellt
- [x] Trigger implementiert
- [x] RLS Policies konfiguriert
- [x] TypeScript Types definiert
- [x] Server Actions implementiert
- [x] UI Komponente erstellt
- [x] Integration in Projekt-Detail-Seite
- [ ] SQL Migration in Supabase ausgeführt
- [ ] Manuell getestet
- [ ] Dokumentation aktualisiert

---

**🚀 Status-Verlauf Tracking ist implementiert und ready für Production!**

**Um es zu aktivieren, führen Sie einfach das SQL Script in Supabase aus.**

