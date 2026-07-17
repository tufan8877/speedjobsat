Generierte Initialen-Avatare (Name auf farbigem Hintergrund) für einen Teil der
112 Starterprofile. Keine echten oder KI-generierten Gesichter, bewusst nicht
fotorealistisch - das würde echten Nutzern vortäuschen, mit einer real
identifizierbaren Person zu tun zu haben.

Dateiname = 3-stelliger Index aus der E-Mail `starter-profile-XXX@seed.speedjob.at`.
Wird von `scripts/rebalance-starter-services.ts` gelesen und als Base64-Data-URL
in `profiles.profile_image` gespeichert.

Neu generieren: HTML mit Initialen auf Farbfläche rendern und per Chromium/
Playwright als 512x512-PNG screenshoten (siehe Git-Historie dieses Commits für
das verwendete Skript).
