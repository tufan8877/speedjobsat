import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { federalStates, serviceCategories, getServiceCategoryLabel } from "@shared/schema";
import { useLocation } from "wouter";
import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";

export default function HeroSection() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const [service, setService] = useState<string>("");
  const [region, setRegion] = useState<string>("");
  const [name, setName] = useState<string>("");

  const handleSearch = () => {
    const searchParams = new URLSearchParams();
    if (service) searchParams.append("service", service);
    if (region) searchParams.append("region", region);
    if (name.trim()) searchParams.append("name", name.trim());

    const query = searchParams.toString();
    setLocation(query ? `/suche?${query}` : "/suche");
  };

  return (
    <section className="bg-white text-gray-900 pt-8 pb-8 sm:pt-10 sm:pb-10 md:pt-8 md:pb-10 lg:pt-10 lg:pb-12 border-b border-gray-100">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto text-center">
          <div className="mb-6 sm:mb-7 md:mb-6">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-title mb-3 leading-tight text-primary tracking-tight">
              Finde passende Dienstleistungen in deiner Nähe
            </h1>
            <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Suche Profile aus Handwerk, Gastro, IT, Reinigung, Transport und weiteren Bereichen. Vergleiche Leistungen, Regionen und Bewertungen und nimm direkt per E-Mail Kontakt auf.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-2 mb-6 text-sm text-gray-700">
            <span className="rounded-full bg-gray-100 px-3 py-1">Kostenloses Profil</span>
            <span className="rounded-full bg-gray-100 px-3 py-1">Kontakt per E-Mail</span>
            <span className="rounded-full bg-gray-100 px-3 py-1">Bewertungen & Favoriten</span>
          </div>

          <div className="flex flex-col sm:flex-row justify-center gap-3 mb-6 md:mb-6">
            <Button
              variant="outline"
              className="w-full sm:w-auto border-primary text-primary hover:bg-primary/5 px-5 py-6 text-base md:px-6 md:py-5 md:text-base"
              onClick={() => setLocation(user ? "/profil" : "/auth?tab=register")}
            >
              {user ? "Mein Profil" : "Kostenloses Profil erstellen"}
            </Button>
          </div>

          <Card className="bg-white rounded-xl shadow-lg overflow-visible border border-gray-100">
            <CardContent className="p-4 sm:p-5 md:p-6 text-left">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
                <div>
                  <Label htmlFor="service" className="text-gray-700 text-sm font-medium mb-2 block">
                    Dienstleistung
                  </Label>
                  <Select value={service} onValueChange={setService}>
                    <SelectTrigger className="w-full h-14 px-3 bg-gray-50 border border-gray-200 rounded text-base leading-normal text-gray-800 [&>span]:leading-normal">
                      <SelectValue placeholder="Kategorie wählen" />
                    </SelectTrigger>
                    <SelectContent position="popper" side="bottom" align="start" avoidCollisions={false} className="z-[100]">
                      {serviceCategories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {getServiceCategoryLabel(category)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="region" className="text-gray-700 text-sm font-medium mb-2 block">
                    Bundesland
                  </Label>
                  <Select value={region} onValueChange={setRegion}>
                    <SelectTrigger className="w-full h-14 px-3 bg-gray-50 border border-gray-200 rounded text-base leading-normal text-gray-800 [&>span]:leading-normal">
                      <SelectValue placeholder="Bundesland wählen" />
                    </SelectTrigger>
                    <SelectContent position="popper" side="bottom" align="start" avoidCollisions={false} className="z-[100]">
                      {federalStates.map((state) => (
                        <SelectItem key={state} value={state}>
                          {state}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="name" className="text-gray-700 text-sm font-medium mb-2 block">
                    Filter
                  </Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="z. B. Mathematik, Therme, Küche"
                    className="h-14 bg-gray-50 border-gray-200 text-base"
                  />
                  <p className="mt-2 text-xs text-gray-500">
                    Durchsucht Namen, Dienstleistungen und Profilbeschreibungen.
                  </p>
                </div>

                <div className="md:pt-7">
                  <Button
                    className="w-full h-14 bg-primary hover:bg-primary/90 text-white rounded font-medium transition text-base"
                    onClick={handleSearch}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                      <circle cx="11" cy="11" r="8" />
                      <path d="m21 21-4.3-4.3" />
                    </svg>
                    Dienstleistungen suchen
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
