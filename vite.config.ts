import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],

  // Dein index.html liegt im Projekt-Root (nicht in /client)
  root: ".",

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },

  server: {
    // Render nutzt production build, dev ist lokal
    port: 5173,
    strictPort: true,
  },

  build: {
    // Frontend wird nach dist/public gebaut, damit dein Express es serven kann
    outDir: "dist/public",
    emptyOutDir: true,
  },
});
