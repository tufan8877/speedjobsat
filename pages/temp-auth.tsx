import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";

/**
 * Vereinfachte Auth-Seite ohne Auth-Provider-Abhängigkeiten
 */
export default function TempAuthPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("login");
  
  // Update URL when tab changes
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    const newSearch = value === "register" ? "?tab=register" : "";
    window.history.replaceState(null, "", `/auth${newSearch}`);
  };
  
  // Simulierte Login-Funktion
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Info",
      description: "Anmeldung ist derzeit deaktiviert (Fehlersuche-Modus)"
    });
  };
  
  // Simulierte Registrierung
  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Info",
      description: "Registrierung ist derzeit deaktiviert (Fehlersuche-Modus)"
    });
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white shadow-sm py-4">
        <div className="container mx-auto px-4">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-primary text-2xl font-bold">
              speedjobs<span className="text-secondary">.at</span>
            </span>
          </Link>
        </div>
      </header>
      
      <main className="flex-1 bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-8 items-start lg:items-stretch max-w-6xl mx-auto">
            <div className="lg:w-1/2 space-y-6">
              <div className="text-center lg:text-left">
                <h1 className="text-3xl font-bold">
                  Willkommen bei <span className="text-primary">speedjobs</span>
                  <span className="text-secondary">.at</span>
                </h1>
                <p className="mt-2 text-gray-600">
                  Verbinden Sie sich mit lokalen Dienstleistern in ganz Österreich
                </p>
              </div>
              
              <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="login">Anmelden</TabsTrigger>
                  <TabsTrigger value="register">Registrieren</TabsTrigger>
                </TabsList>
                
                <TabsContent value="login" className="mt-6">
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">E-Mail</Label>
                      <Input 
                        id="email" 
                        type="email" 
                        placeholder="ihre-email@beispiel.com"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Passwort</Label>
                      <Input 
                        id="password" 
                        type="password" 
                        placeholder="••••••••"
                        required
                      />
                    </div>
                    <Button type="submit" className="w-full">
                      Anmelden
                    </Button>
                  </form>
                </TabsContent>
                
                <TabsContent value="register" className="mt-6">
                  <form onSubmit={handleRegister} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">Vorname</Label>
                        <Input 
                          id="firstName" 
                          placeholder="Max"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Nachname</Label>
                        <Input 
                          id="lastName" 
                          placeholder="Mustermann"
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="registerEmail">E-Mail</Label>
                      <Input 
                        id="registerEmail" 
                        type="email" 
                        placeholder="ihre-email@beispiel.com"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="registerPassword">Passwort</Label>
                      <Input 
                        id="registerPassword" 
                        type="password" 
                        placeholder="Min. 8 Zeichen"
                        required
                      />
                    </div>
                    <Button type="submit" className="w-full">
                      Registrieren
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </div>
            
            <div className="hidden lg:block lg:w-1/2 bg-gradient-to-br from-primary-600 to-primary-700 rounded-lg p-8 text-white">
              <div className="h-full flex flex-col justify-center">
                <h2 className="text-2xl font-bold mb-6">
                  Die Plattform für Dienstleister in Österreich
                </h2>
                
                <div className="space-y-6">
                  <div className="flex items-start">
                    <div className="bg-white/20 p-2 rounded-full mr-4">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/></svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">Vertrauenswürdige Plattform</h3>
                      <p className="mt-1 text-white/80">
                        Nutzer können Bewertungen und Erfahrungsberichte einsehen, um die richtigen Dienstleister zu finden.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="bg-white/20 p-2 rounded-full mr-4">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="m16 10-4 4-2-2"/></svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">Einfache Kontaktaufnahme</h3>
                      <p className="mt-1 text-white/80">
                        Direkter Kontakt mit Dienstleistern ohne Umwege oder Vermittlungsgebühren.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="bg-white/20 p-2 rounded-full mr-4">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h20"/><path d="M21 3v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V3"/><path d="m7 21 5-5 5 5"/></svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">Kostenlose Registrierung</h3>
                      <p className="mt-1 text-white/80">
                        Erstellen Sie Ihr Profil kostenlos und präsentieren Sie Ihre Dienstleistungen.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <footer className="bg-gray-100 py-8">
        <div className="container mx-auto px-4 text-center text-gray-600">
          <p>© 2023 speedjobs.at - Alle Rechte vorbehalten</p>
        </div>
      </footer>
    </div>
  );
}