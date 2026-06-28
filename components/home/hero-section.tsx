import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { federalStates, serviceCategories } from "@shared/schema";
import { useLocation } from "wouter";
import { useState } from "react";

export default function HeroSection() {
  const [, setLocation] = useLocation();
  const [service, setService] = useState<string>("");
  const [region, setRegion] = useState<string>("");

  const handleSearch = () => {
    const searchParams = new URLSearchParams();
    if (service) searchParams.append("service", service);
    if (region) searchParams.append("region", region);

    setLocation(`/suche?${searchParams.toString()}`);
  };

  return (
    <section className="bg-white text-gray-900 pt-5 pb-8 md:bg-gradient-to-br md:from-primary-600 md:to-primary-700 md:text-white md:py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-left md:text-center">
          <div className="hidden md:block">
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold font-title mb-3">
              Finden Sie lokale Fachkräfte in Österreich
            </h1>
            <p className="text-base md:text-lg opacity-90 mb-5">
              Installateure, Mechaniker, Pflegekräfte und mehr - alle von verifizierten Anbietern
            </p>
          </div>

          <div className="flex flex-col sm:flex-row justify-center gap-3 mb-5 md:mb-6">
            <Button
              className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-white md:bg-white md:hover:bg-gray-100 md:text-primary font-semibold"
              onClick={() => setLocation("/auftrag-erstellen")}
            >
              Einen Auftrag erstellen
            </Button>
            <Button
              variant="outline"
              className="w-full sm:w-auto border-primary text-primary hover:bg-primary/5 md:bg-transparent md:border-white md:hover:bg-white/10 md:text-white"
              onClick={() => setLocation("/auftraege")}
            >
              Aufträge durchsuchen
            </Button>
          </div>

          <Card className="bg-white rounded-lg shadow-lg overflow-hidden">
            <CardContent className="p-4 md:p-6 text-left">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="service" className="text-gray-700 text-sm font-medium mb-1">
                    Dienstleistung
                  </Label>
                  <Select value={service} onValueChange={setService}>
                    <SelectTrigger className="w-full p-3 bg-gray-50 border border-gray-200 rounded text-gray-800">
                      <SelectValue placeholder="Kategorie wählen" />
                    </SelectTrigger>
                    <SelectContent>
                      {serviceCategories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="region" className="text-gray-700 text-sm font-medium mb-1">
                    Bundesland
                  </Label>
                  <Select value={region} onValueChange={setRegion}>
                    <SelectTrigger className="w-full p-3 bg-gray-50 border border-gray-200 rounded text-gray-800">
                      <SelectValue placeholder="Wählen Sie ein Bundesland" />
                    </SelectTrigger>
                    <SelectContent>
                      {federalStates.map((state) => (
                        <SelectItem key={state} value={state}>
                          {state}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-end">
                  <Button
                    className="w-full bg-primary hover:bg-primary/90 text-white p-3 rounded font-medium transition"
                    onClick={handleSearch}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                      <circle cx="11" cy="11" r="8" />
                      <path d="m21 21-4.3-4.3" />
                    </svg>
                    Suchen
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
