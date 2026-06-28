SpeedJobs Postgres-Fix

Ich konnte nicht direkt in dein GitHub-Repo schreiben: GitHub hat den Schreibzugriff mit 403 "Resource not accessible by integration" blockiert.

Dieses Paket enthält die wichtigsten kompletten Ersatzdateien für den Wechsel auf Render Postgres.

So nutzt du es:
1. ZIP entpacken.
2. Dateien 1:1 in deinem Repo ersetzen/anlegen.
3. Auf Render Environment Variables setzen:
   DATABASE_URL = von Render Postgres
   SESSION_SECRET = langer zufälliger Wert
   ADMIN_EMAIL = deine Admin-Mail
   ADMIN_PASSWORD = neues sicheres Admin-Passwort
4. Deploy starten.
5. Wenn Build-Fehler kommt, den Render-Log hier schicken.

Wichtig:
- Das alte hardcodierte Admin-Passwort muss aus server/sqlite-auth.ts entfernt werden.
- SQLite sollte danach nicht mehr aktiv genutzt werden.
- Login läuft über sichere Postgres-Sessions.
