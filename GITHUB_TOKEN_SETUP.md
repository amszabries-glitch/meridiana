# GitHub Personal Access Token Setup

## Token-Berechtigungen für Meridiana

Erstellen Sie ein Personal Access Token mit folgenden Berechtigungen:

### Notwendige Scopes:
1. **`repo`** (Vollzugriff auf Repositories) - Das ist das wichtigste!
   - Erlaubt: read/write access zu allen Repos
   - Benötigt für: Push, Pull, Clone

### Optional (wenn Sie später deployen möchten):
2. **`workflow`** - GitHub Actions
3. **`admin:repo_hook`** - Repository Webhooks

## Anleitung:

1. **Gehen Sie zu GitHub:**
   - https://github.com/settings/tokens

2. **Klicken Sie auf:**
   - "Generate new token (classic)"

3. **Token-Einstellungen:**
   - **Note:** Meridiana Deployment
   - **Expiration:** 90 days (oder No expiration)
   - **Scopes:** 
     - ✅ **repo** (ganz unten, bei "Repository permissions")

4. **Klicken Sie auf "Generate token"**

5. **Kopieren Sie den Token** (wird nur einmal angezeigt!)

6. **Führen Sie aus:**
```bash
cd /Users/alicamadeline/Desktop/Meridiana
git remote set-url origin https://YOUR_TOKEN@github.com/amszabries-glitch/meridiana.git
git push -u origin main
```

Ersetzen Sie `YOUR_TOKEN` mit dem kopierten Token.

## Sicherheit:
⚠️ **WICHTIG:** Der Token ist wie ein Passwort. Teilen Sie ihn niemals!

Nach dem Push können wir das Deployment auf Vercel einrichten.

