# Supabase Schema Cache Refresh

## Problem
Nach dem Hinzufügen neuer Tabellen (`project_status_history` und `milestones`) zeigt Supabase manchmal Schema Cache-Fehler.

## Lösung: Schema Cache Refresh

### Option 1: Automatic Refresh (Recommended)
Die beste Lösung ist, dass die neuen Tabellen einfach existieren müssen. Wenn SQL ausgeführt wurde, macht Supabase automatisch einen Cache Refresh.

### Option 2: Manual Supabase Dashboard Refresh
1. Go to your Supabase Dashboard: https://app.supabase.com
2. Select your project
3. Go to **Database** → **Tables**
4. Check if these tables exist:
   - `project_status_history`
   - `milestones`
5. If tables exist, Supabase will automatically refresh the cache
6. If you see errors, click the **"Refresh Schema"** button (usually in the SQL Editor)

### Option 3: Re-run SQL Migrations
If cache issues persist:

1. Go to **SQL Editor** in Supabase Dashboard
2. Re-run the migration files:
   - `database/add_status_history.sql`
   - `database/add_milestones.sql`
3. Wait 1-2 minutes for cache refresh

### Option 4: API Database Refresh
If you have Supabase CLI:

```bash
# Install Supabase CLI (if not installed)
npm install -g supabase

# Login
supabase login

# Link your project
supabase link --project-ref YOUR_PROJECT_REF

# Reset database (BE CAREFUL - this will delete all data!)
# Only use this for development
supabase db reset
```

## Verification

Check if tables are accessible:

```bash
# In your terminal
curl -X GET 'https://YOUR_PROJECT_REF.supabase.co/rest/v1/project_status_history?select=*' \
  -H 'apikey: YOUR_ANON_KEY' \
  -H 'Authorization: Bearer YOUR_ANON_KEY'

curl -X GET 'https://YOUR_PROJECT_REF.supabase.co/rest/v1/milestones?select=*' \
  -H 'apikey: YOUR_ANON_KEY' \
  -H 'Authorization: Bearer YOUR_ANON_KEY'
```

## Status
- ✅ SQL migrations were executed
- ✅ Tables should exist in database
- ⏳ Cache refresh is automatic (may take 1-2 minutes)

## Next Steps
1. Test the features in localhost
2. If errors persist, wait 5 minutes and refresh page
3. If still errors, re-run SQL migrations from Supabase Dashboard

