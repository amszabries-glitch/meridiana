# Kontakt-System Verbesserung

## Übersicht
Das Kontakt-System wurde erweitert, um verschiedene Kontakttypen zu unterstützen und die Wiederverwendung von Kontakten (z.B. Insolvenzverwalter) zu ermöglichen.

## Implementierte Features

### 1. Kontakttypen
- **SQL-Migration**: `database/add_contact_type.sql`
  - Fügt `contact_type`-Feld zur `contacts`-Tabelle hinzu
  - Unterstützte Typen:
    - `general` (Standard)
    - `insolvency_admin` (Insolvenzverwalter)
    - `broker` (Makler)
    - `lawyer` (Anwalt)
    - `buyer` (Käufer)
    - `seller` (Verkäufer)
    - `advisor` (Berater)

### 2. TypeScript-Interface
- **Erweitert**: `lib/supabase.ts`
  - `Contact`-Interface enthält jetzt `contact_type`-Feld
  - Typ-sichere Nutzung der Kontakttypen

### 3. Server Actions
- **Neu**: `getContactsByType(contactType: string)`
  - Filtern von Kontakten nach Typ
  - Für Insolvenzverwalter-Auswahl verwendet

### 4. ProjectForm (Neue Projekte)
- **Neue Funktion**: Insolvenzverwalter-Dropdown
  - Lädt alle Kontakte mit Typ `insolvency_admin`
  - Auswahlmöglichkeit aus bestehenden Kontakten
  - Automatisches Ausfüllen der Felder bei Auswahl
  - Manuelle Eingabe weiterhin möglich

### 5. EditProjectModal (Projekt bearbeiten)
- **Neue Funktion**: Insolvenzverwalter-Dropdown
  - Gleiche Funktionalität wie in ProjectForm
  - Lädt bestehende Insolvenzverwalter
  - Ermöglicht Auswahl oder manuelle Eingabe

## Verwendung

### Insolvenzverwalter als Kontakt hinzufügen
1. Gehen Sie zu "Kontakte"
2. Erstellen Sie einen neuen Kontakt
3. Wählen Sie als Typ "Insolvenzverwalter"
4. Füllen Sie die Kontaktdaten aus

### Bei Projekt-Anlage/Editierung
1. Öffnen Sie das Projekt-Formular
2. Scrollen Sie zur Sektion "Insolvenzverwalter"
3. **Option A**: Wählen Sie einen Kontakt aus dem Dropdown
   - Felder werden automatisch ausgefüllt
4. **Option B**: Geben Sie die Daten manuell ein
   - Alle Felder bleiben editierbar

## Setup-Anleitung

### 1. SQL-Migration ausführen
```bash
# In Supabase SQL Editor ausführen:
database/add_contact_type.sql
```

### 2. Kontakte mit Typ versehen
- Vorhandene Kontakte haben Standard-Typ `general`
- Neue Insolvenzverwalter-Kontakte mit `insolvency_admin` erstellen
- Kontakte können später bearbeitet werden

### 3. Testen
1. Lokalen Dev-Server starten: `npm run dev`
2. Zu "Kontakte" gehen
3. Neuen Insolvenzverwalter-Kontakt erstellen
4. Projekt anlegen/bearbeiten
5. Dropdown öffnen und Kontakt auswählen

## Vorteile

✅ **Keine Duplikation**: Kontakte können wiederverwendet werden
✅ **Konsistenz**: Einheitliche Kontaktdaten
✅ **Flexibilität**: Manuelle Eingabe weiterhin möglich
✅ **Zukunftssicher**: Einfach um weitere Kontakttypen erweiterbar

## Erweiterungsmöglichkeiten

- Kontakt-Filterung in der Kontakt-Übersicht nach Typ
- Broker/Käufer-Dropdowns für Projekte
- Kontakt-Synchronisierung mit Projekten
- Kontakt-Lebenszyklus-Management

