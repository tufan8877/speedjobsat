import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";

export default defineConfig(async () => {
  return {
    plugins: [
      react(),
      runtimeErrorOverlay(),
      ...(process.env.NODE_ENV !== "production" && process.env.REPL_ID
        ? [
            (await import("@replit/vite-plugin-cartographer").then((m) =>
              m.cartographer(),
            )) as any,
          ]
        : []),
    ],

    resolve: {
      alias: {
        // Du hast deine Frontend-Dateien im Repo-Root (components/, hooks/, pages/, App.tsx, main.tsx, ...)
        "@": path.resolve(import.meta.dirname, "."),
        "@shared": path.resolve(import.meta.dirname, "shared"),
        "@assets": path.resolve(import.meta.dirname, "attached_assets"),
      },
    },

    // Wichtig: index.html liegt bei dir im Root
    root: path.resolve(import.meta.dirname, "."),

    build: {
      // Frontend landet in dist/public (das kann dein Express-Server dann ausliefern)
      outDir: path.resolve(import.meta.dirname, "dist/public"),
      emptyOutDir: true,
    },
  };
});
