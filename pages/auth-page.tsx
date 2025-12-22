import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation, useSearch } from "wouter";
import { LoginForm, RegisterForm } from "@/components/auth/auth-forms";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";

export default function AuthPage() {
  const { user } = useAuth();
  const [location, setLocation] = useLocation();
  const search = useSearch();
  const searchParams = new URLSearchParams(search);
  const initialTab = searchParams.get("tab") === "register" ? "register" : "login";
  const [activeTab, setActiveTab] = useState(initialTab);
  
  // Update URL when tab changes
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    const newParams = new URLSearchParams(search);
    if (value === "register") {
      newParams.set("tab", "register");
    } else {
      newParams.delete("tab");
    }
    const newSearch = newParams.toString();
    const newPath = `${location.split("?")[0]}${newSearch ? `?${newSearch}` : ""}`;
    window.history.replaceState(null, "", newPath);
  };
  
  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      setLocation("/");
    }
  }, [user, setLocation]);
  
  if (user) {
    return null; // Don't render during redirect
  }
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
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
                  <LoginForm />
                </TabsContent>
                <TabsContent value="register" className="mt-6">
                  <RegisterForm />
                </TabsContent>
              </Tabs>
            </div>
            
            <div className="lg:w-1/2 bg-white border border-gray-200 rounded-lg p-6 lg:p-8 shadow-xl">
              <div className="h-full flex flex-col justify-center">
                <h2 className="text-2xl font-bold mb-6 text-gray-900">
                  Die Plattform für Dienstleister in Österreich
                </h2>
                
                <div className="space-y-4 lg:space-y-6">
                  <div className="flex items-start">
                    <div className="bg-blue-100 p-2 rounded-full mr-3 lg:mr-4 flex-shrink-0">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600 lg:w-6 lg:h-6"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/></svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-base lg:text-lg text-gray-900">Vertrauenswürdige Plattform</h3>
                      <p className="mt-1 text-sm lg:text-base text-gray-600">
                        Nutzer können Bewertungen und Erfahrungsberichte einsehen, um die richtigen Dienstleister zu finden.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="bg-green-100 p-2 rounded-full mr-3 lg:mr-4 flex-shrink-0">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-600 lg:w-6 lg:h-6"><circle cx="12" cy="12" r="10"/><path d="m16 10-4 4-2-2"/></svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-base lg:text-lg text-gray-900">Einfache Kontaktaufnahme</h3>
                      <p className="mt-1 text-sm lg:text-base text-gray-600">
                        Direkter Kontakt mit Dienstleistern ohne Umwege oder Vermittlungsgebühren.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="bg-orange-100 p-2 rounded-full mr-3 lg:mr-4 flex-shrink-0">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-orange-600 lg:w-6 lg:h-6"><path d="M2 3h20"/><path d="M21 3v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V3"/><path d="m7 21 5-5 5 5"/></svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-base lg:text-lg text-gray-900">Kostenlose Registrierung</h3>
                      <p className="mt-1 text-sm lg:text-base text-gray-600">
                        Erstellen Sie Ihr Profil kostenlos und präsentieren Sie Ihre Dienstleistungen.
                      </p>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t border-gray-200">
                    <h3 className="font-semibold text-base lg:text-lg text-gray-900 mb-2">Wie speedjobs.at funktioniert:</h3>
                    <ul className="space-y-2 text-sm lg:text-base text-gray-600">
                      <li className="flex items-start">
                        <span className="text-primary font-medium mr-2">1.</span>
                        <span>Kostenlos registrieren und Profil erstellen</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-primary font-medium mr-2">2.</span>
                        <span>Dienstleister suchen oder Hilfsgesuche veröffentlichen</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-primary font-medium mr-2">3.</span>
                        <span>Direkten Kontakt aufnehmen und Termine vereinbaren</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-primary font-medium mr-2">4.</span>
                        <span>Nach getaner Arbeit Bewertungen abgeben</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
