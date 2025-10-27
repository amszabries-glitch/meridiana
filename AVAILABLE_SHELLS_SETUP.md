# Verfügbare Börsenmäntel - Setup & Nutzung

## ✅ **Was wurde implementiert:**

### **1. Dashboard-Komponente**
- ✅ `AvailableShells.tsx` erstellt
- ✅ Sektion ganz unten auf der Dashboard-Overview
- ✅ Mock-Daten mit 5 Beispiel-Börsenmänteln

### **2. Database-Schema**
- ✅ SQL Migration: `database/add_available_shells.sql`
- ✅ TypeScript Interface: `AvailableShell` in `lib/supabase.ts`

### **3. Features**
- ✅ Tabelle mit: Name, Börse, Sektor, Börsenwert, Verlangter Preis, Status
- ✅ Statistiken: Gesamt, Verfügbar, Ø Börsenwert, Gesamt-Wert
- ✅ Status-Badges (Verfügbar/Negotiation/Reserviert)
- ✅ Informationsbox mit Hinweis

---

## 📋 **Nächste Schritte (Zu implementieren):**

### **Step 1: SQL Migration ausführen**
```sql
-- In Supabase SQL Editor einfügen und ausführen:
-- Die Datei: database/add_available_shells.sql
```

**Was passiert:**
- Erstellt `available_shells` Tabelle
- Fügt 5 Beispiel-Datensätze hinzu
- Erstellt Indexes für Performance
- RLS Policies für Sicherheit

### **Step 2: Server Actions erstellen**
Erstelle `lib/marketActions.ts`:
```typescript
export async function getAvailableShells() {
  const { data, error } = await supabase
    .from('available_shells')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data
}

export async function addAvailableShell(shell: Partial<AvailableShell>) {
  const { data, error } = await supabase
    .from('available_shells')
    .insert(shell)
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function updateAvailableShell(id: string, updates: Partial<AvailableShell>) {
  const { data, error } = await supabase
    .from('available_shells')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function deleteAvailableShell(id: string) {
  const { error } = await supabase
    .from('available_shells')
    .delete()
    .eq('id', id)
  
  if (error) throw error
}
```

### **Step 3: Mock-Daten durch Live-Daten ersetzen**
In `components/AvailableShells.tsx`:
```typescript
'use client'

import { useEffect, useState } from 'react'
import { getAvailableShells } from '@/lib/marketActions'
import { AvailableShell } from '@/lib/supabase'

export default function AvailableShells() {
  const [shells, setShells] = useState<AvailableShell[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadShells()
  }, [])

  const loadShells = async () => {
    try {
      const data = await getAvailableShells()
      setShells(data)
    } catch (error) {
      console.error('Error loading shells:', error)
    } finally {
      setLoading(false)
    }
  }

  // ... rest of component
}
```

### **Step 4: Import-Funktionalität**
Erstelle `components/AddAvailableShellModal.tsx`:
- Formular für: Name, Börse, Sektor, Market Cap, Shares, Status, Asking Price, Contact
- Validation
- Success/Error Handling

### **Step 5: Search & Filter**
Erweitere `AvailableShells.tsx`:
```typescript
const [search, setSearch] = useState('')
const [statusFilter, setStatusFilter] = useState<string>('all')
const [exchangeFilter, setExchangeFilter] = useState<string>('all')

const filteredShells = shells.filter(shell => {
  const matchesSearch = search === '' || shell.name.toLowerCase().includes(search.toLowerCase())
  const matchesStatus = statusFilter === 'all' || shell.status === statusFilter
  const matchesExchange = exchangeFilter === 'all' || shell.exchange === exchangeFilter
  return matchesSearch && matchesStatus && matchesExchange
})
```

---

## 🎯 **Verwendete Quellen (Recherche):**

**Problem:** Keine direkten APIs für Börsenmäntel verfügbar (Nischenmarkt)

**Alternative Quellen:**
1. **Spezialisierte Makler** (Shell Company Market, Reverse IPO Services)
2. **Insolvenzverwaltung** (potentielle Übernahme-Kandidaten)
3. **Wirtschaftsanwälte** (Strukturvertrieb)
4. **M&A Beratungsgesellschaften**
5. **Branchenportale** (manual Research)

**Empfehlung:**
- Manueller Import über die Admin-Oberfläche
- Wöchentliche/monatliche Aktualisierung
- Netzwerk-Kontakte als Datenquelle nutzen

---

## 📊 **Ergebnis:**

**Visualisierung:**
- Übersicht aller verfügbaren Börsenmäntel
- Filter nach Status/Börse
- Statistiken (Gesamt, Verfügbar, Durchschnittswerte)
- "Als Projekt übernehmen" Funktion (optional)

**Workflow:**
1. Externe Quelle → Manueller Import
2. Dashboard zeigt alle verfügbaren Shells
3. User kann direkt Anfrage stellen
4. Bei Interesse → Als Projekt übernehmen

