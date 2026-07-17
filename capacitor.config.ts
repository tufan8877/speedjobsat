import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "at.speedjob.app",
  appName: "speedjob.at",
  webDir: "dist/public",
  server: {
    // Die App lädt die live Webseite statt eines lokal gebündelten Builds.
    // Vorteil: Inhalte aktualisieren sich mit jedem Deploy automatisch,
    // ohne dass die App im Store neu eingereicht werden muss.
    url: "https://speedjob.at",
    cleartext: false,
  },
  ios: {
    contentInset: "always",
  },
  android: {
    allowMixedContent: false,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1200,
      backgroundColor: "#072b4c",
      androidScaleType: "CENTER_CROP",
      showSpinner: false,
    },
  },
};

export default config;
