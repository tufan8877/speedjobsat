import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "next-themes";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/use-auth";


// Sanftes Cache-Clearing ohne App-Blockierung
function clearCachesGently() {
  try {
    // Nur Storage clearing, kein Force-Reload
    if (window.localStorage) {
      const key = 'speedjobs_cache_cleared';
      if (!localStorage.getItem(key)) {
        localStorage.setItem(key, Date.now().toString());
      }
    }
  } catch (e) {
    // Fehler ignorieren
  }
}

// Sanftes Cache-Clearing beim Start
clearCachesGently();

/**
 * Hauptkomponente mit allen benötigten Providern
 */
const Root = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="light">
      <TooltipProvider>
        <AuthProvider>
          <App />
          <Toaster />
        </AuthProvider>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

createRoot(document.getElementById("root")!).render(<Root />);