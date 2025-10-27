# Börsenmäntel-Kostenmodell - Analyse

## Aktuelle Felder
- `purchase_price` (Kaufpreis)
- `selling_price` (Verkaufspreis)

## Kostenkategorien für Börsenmäntel-Transaktionen

### 1. Transaktionskosten
- **Gebühren Rechtsanwalt** (Legal Fees)
- **Notar-Kosten** (Notary Fees)
- **Due Diligence Kosten**
- **Makler-Provisiоn** (Broker Commission)
- **Börsen-Gebühren**

### 2. Ongoing Betriebskosten
- **Monatliche Börsen-Gebühren** (Listing Fees)
- **Compliance-Kosten** (Reportings)
- **Steuerberatung**
- **Wartungskosten** (Corporate Maintenance)

### 3. Kapitalkosten
- **Zinszahlungen** (falls Fremdkapital)
- **Dividenden**
- **Aktienrückkauf-Kosten**

### 4. One-Time Setup Costs
- **Börsenlisting-Gebühren**
- **IPO-Kosten**
- **Marketing-Kosten**

### 5. Risiko-Absicherung
- **Versicherungen**
- **Abschreibungen**

---

## Vorgeschlagene neue Felder

### Transaktionskosten (Transaction Costs)
```typescript
legal_fees: number           // Rechtsanwalt-Gebühren
notary_fees: number          // Notar-Kosten
due_diligence_costs: number  // Due Diligence Kosten
broker_commission: number    // Makler-Provisiоn (in % oder fix)
exchange_fees: number        // Börsen-Gebühren
```

### Laufende Betriebskosten (Ongoing Operational Costs)
```typescript
monthly_listing_fee: number    // Monatliche Börsen-Gebühr
compliance_costs: number        // Compliance-Kosten (jährlich)
accounting_costs: number        // Steuerberatung (jährlich)
maintenance_costs: number       // Corporate Maintenance
```

### Gesamtkosten-Rechnung
```typescript
total_operational_costs: number     // Summe aller laufenden Kosten
total_transaction_costs: number     // Summe aller Transaktionskosten
total_cost: number                  // Gesamtsumme aller Kosten
net_profit: number                  // Verkaufspreis - Gesamtkosten
net_roi: number                     // (Net Profit / Total Cost) * 100
```

---

## Neue Berechnungen

### 1. Gesamte Investition (Total Investment)
```
Total Investment = purchase_price + total_transaction_costs + (total_operational_costs * months_held)
```

### 2. Nettogewinn (Net Profit)
```
Net Profit = selling_price - total_investment
```

### 3. Net ROI
```
Net ROI = (Net Profit / Total Investment) * 100
```

### 4. Cash-on-Cash Return
```
Cash-on-Cash Return = (selling_price - purchase_price - total_costs) / purchase_price * 100
```

### 5. Break-Even Zeitpunkt
```
Break-Even Months = total_costs / monthly_revenue (falls vorhanden)
```

---

## UI-Erweiterungen

### Projekt-Detail-Seite
- Neue Sektion: **"Kostenaufschlüsselung"**
  - Transaktionskosten
  - Betriebskosten (pro Monat)
  - Gesamtkosten
  - Net ROI

### Dashboard KPIs
- **Durchschnittliche Transaktionskosten**
- **Durchschnittliche Betriebskosten pro Monat**
- **Net ROI statt Brutto-ROI**

### Analytics Charts
- Kostenverteilung nach Kategorie
- Kosten vs. Verkaufspreis Trend
- Break-Even Analyse

---

## Empfehlung

### Minimum Viable (Phase 1)
```
- legal_fees (EUR)
- due_diligence_costs (EUR)
- broker_commission_percentage (Decimal 0-1)
- monthly_listing_fee (EUR)
- total_operational_costs_annual (EUR)
```

### Full Implementation (Phase 2)
Alle oben genannten Kostenfelder implementieren

---

## Migration Strategy

1. **Add fields to Project interface** (`lib/supabase.ts`)
2. **Create SQL migration** (`database/add_costs.sql`)
3. **Update calculations** (`lib/analytics.ts`)
4. **Update UI** (Project Detail, Dashboard, Analytics)
5. **Update export functions** (`lib/export.ts`)

