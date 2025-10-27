# Vercel Deployment - Meridiana CRM

## Repository erfolgreich gepusht! ✅

Repository: https://github.com/amszabries-glitch/meridiana.git

## Nächste Schritte für Vercel Deployment:

### 1. **Vercel Account erstellen (falls noch nicht vorhanden):**
   - Gehen Sie zu: https://vercel.com/signup
   - Wählen Sie "Continue with GitHub"
   - Autorisiere Vercel-Zugriff

### 2. **Projekt importieren:**
   - Klicken Sie auf "Add New Project"
   - Wählen Sie das Repository: `amszabries-glitch/meridiana`
   - Klicken Sie auf "Import"

### 3. **Environment Variables setzen:**

Im Vercel Dashboard unter Project Settings > Environment Variables:

```
NEXT_PUBLIC_SUPABASE_URL=ihre_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=ihr_supabase_anon_key
```

Diese finden Sie in:
- Supabase Dashboard > Project Settings > API

### 4. **Build Settings:**
   - Framework Preset: **Next.js**
   - Build Command: `npm run build` (automatisch)
   - Output Directory: `.next` (automatisch)

### 5. **Deploy!**
   - Klicken Sie auf "Deploy"
   - Warten Sie ~2-3 Minuten
   - Ihre App ist live! 🎉

## Features:
✅ iOS Mobile optimiert
✅ Responsive Design
✅ Authentication
✅ Real-time Supabase
✅ Project Management
✅ Analytics & Reporting
✅ Dokumenten-Verwaltung
✅ Pipeline Board
✅ Contact Management

## Support:
Bei Problemen kontrollieren Sie die Vercel Build Logs.

