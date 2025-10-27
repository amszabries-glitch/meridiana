# Insolvenzverwalter-Kontakte - Setup & Übersicht

## ✅ **Was wurde implementiert:**

### **1. Database-Schema Erweitert**
- ✅ SQL Migration: `database/add_insolvency_fields.sql`
- ✅ 7 neue Felder zur `projects` Tabelle hinzugefügt

**Neue Felder:**
```sql
insolvency_admin_name VARCHAR(255)        -- Name des Insolvenzverwalters
insolvency_admin_email VARCHAR(255)      -- E-Mail
insolvency_admin_phone VARCHAR(50)       -- Telefon
insolvency_admin_company VARCHAR(255)    -- Firma/Kanzlei
insolvency_court VARCHAR(255)            -- Insolvenzgericht
insolvency_case_number VARCHAR(100)       -- Aktenzeichen
insolvency_filing_date DATE               -- Insolvenz-Eröffnungsdatum
```

### **2. TypeScript Interface erweitert**
- ✅ `Project` Interface in `lib/supabase.ts` aktualisiert
- ✅ Alle 7 neuen Felder als optional definiert

### **3. EditProjectModal erweitert**
- ✅ Form-Felder für Insolvenzverwalter hinzugefügt
- ✅ Eigene Sektion "Insolvenzverwalter"
- ✅ 2-Column Grid Layout für optimale Darstellung
- ✅ Alle Felder mit Placeholders

**Layout:**
```
┌─────────────────────────────────────────────────────────┐
│ Insolvenzverwalter                                        │
├─────────────────────────────────────────────────────────┤
│ Name *            │ Firma                                │
│ E-Mail            │ Telefon                              │
│ Insolvenzgericht  │ Aktenzeichen                         │
│ Insolvenz-Eröffnungsdatum                               │
└─────────────────────────────────────────────────────────┘
```

### **4. Beispieldaten**
- ✅ 5 Beispieldatensätze mit Insolvenzverwalter-Infos
- ✅ Verschiedene Gerichte (Berlin, München, Hamburg, Frankfurt, Stuttgart)
- ✅ Realistische Kontaktdaten

---

## 📋 **Nächste Schritte:**

### **Step 1: SQL ausführen**
```sql
-- In Supabase SQL Editor einfügen und ausführen:
-- Die Datei: database/add_insolvency_fields.sql
```

**Was passiert:**
- 7 neue Spalten zur `projects` Tabelle hinzugefügt
- Beispieldaten für alle 5 Projekte aktualisiert
- Kommentare für Dokumentation

### **Step 2: Auf Projekt-Detailseite anzeigen**
Erweitere `app/projects/[id]/page.tsx`:

```typescript
// Insolvency Administrator Card hinzufügen
{project.insolvency_admin_name && (
  <div className="card p-6">
    <h3 className="text-lg font-semibold text-ink-700 mb-4">Insolvenzverwalter</h3>
    <div className="space-y-3">
      <div className="flex justify-between">
        <span className="text-ink-soft">Name</span>
        <span className="font-semibold text-ink">{project.insolvency_admin_name}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-ink-soft">Firma</span>
        <span className="font-semibold text-ink">{project.insolvency_admin_company}</span>
      </div>
      {/* ... weitere Felder */}
    </div>
  </div>
)}
```

---

## 🎯 **Verwendung:**

**Für Börsenmäntel:**
- Viele Börsenmäntel entstehen aus Insolvenzen
- Insolvenzverwalter ist wichtiger Ansprechpartner
- Tracking der Kontaktdaten für Projekte
- Aktenzeichen für rechtliche Dokumentation

**Workflow:**
1. Börsenmantel aus Insolvenz erwerben
2. Insolvenzverwalter-Daten eingeben
3. Alle Kontakte an einem Ort
4. Direkt Kontakt aufnehmen können

---

## ✅ **Resultat:**

Alle Kontakt-Daten des Insolvenzverwalters können jetzt für jeden Börsenmantel gespeichert werden:
- ✅ Name, E-Mail, Telefon
- ✅ Firma/Kanzlei
- ✅ Gericht und Aktenzeichen
- ✅ Eröffnungsdatum
- ✅ Im Edit-Dialog editierbar

