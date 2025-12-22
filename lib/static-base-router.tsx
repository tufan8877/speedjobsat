import { Router, useLocation, type RouterProps } from "wouter";
import { useState, useEffect } from "react";

// StaticBaseRouter für clientseitiges Routing mit Wouter
export function StaticBaseRouter(props: RouterProps) {
  // Statischer Basispfad
  const base = typeof props.base === "string" ? props.base : "";
  const [currentPath, setCurrentPath] = useState<string | null>(null);
  
  // Benutze für History-API
  const [_path, _navigate] = useLocation();
  
  // Aktualisiere Pfad beim Laden und bei Navigationsereignissen
  useEffect(() => {
    // Initialer Pfad
    const path = window.location.pathname;
    setCurrentPath(path);
    
    // Event-Listener für Navigation
    const handleNavigate = () => {
      const newPath = window.location.pathname;
      setCurrentPath(newPath);
    };
    
    // Füge Event-Listener für Verlauf hinzu
    window.addEventListener("popstate", handleNavigate);
    
    return () => {
      window.removeEventListener("popstate", handleNavigate);
    };
  }, []);
  
  // Route zu einem Pfad
  const customNavigate = (to: string) => {
    if (to[0] === "/") {
      to = base + to;
    }
    
    // Benutze die History-API
    window.history.pushState(null, "", to);
    setCurrentPath(to);
  };
  
  // Wenn noch kein Pfad festgelegt ist, zeige nichts an
  if (currentPath === null) {
    return null;
  }
  
  // Hook für Routing ersetzen
  const customUseRouter = () => {
    return [currentPath.replace(base, "") || "/", customNavigate];
  };
  
  return (
    <Router hook={customUseRouter} base={base}>
      {props.children}
    </Router>
  );
}
