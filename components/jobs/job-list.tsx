import { useQuery } from "@tanstack/react-query";
import { JobListingCard } from "./job-listing-card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { serviceCategories } from "@shared/schema";
import { useState } from "react";
import { JobListing } from "@shared/sqlite-schema";
import { Loader2 } from "lucide-react";
import { Link } from "wouter";

export function JobList() {
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [locationFilter, setLocationFilter] = useState<string>("");
  
  // Ruft alle aktiven Joblistings ab
  const { data: jobs, isLoading, error } = useQuery<JobListing[]>({
    queryKey: ['/api/jobs', categoryFilter, locationFilter],
    queryFn: async () => {
      let url = '/api/jobs?status=active';
      
      if (categoryFilter && categoryFilter !== "all") {
        url += `&category=${encodeURIComponent(categoryFilter)}`;
      }
      
      if (locationFilter) {
        url += `&location=${encodeURIComponent(locationFilter)}`;
      }
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('Fehler beim Abrufen der Aufträge');
      }
      
      return response.json();
    }
  });
  
  // Lädt noch
  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-12">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }
  
  // Fehler beim Laden
  if (error) {
    return (
      <div className="text-center p-12">
        <h3 className="text-xl font-semibold mb-2">Fehler beim Laden der Aufträge</h3>
        <p className="text-muted-foreground">{(error as Error).message}</p>
      </div>
    );
  }
  
  // Keine Aufträge gefunden
  if (!jobs || jobs.length === 0) {
    return (
      <div className="text-center p-12">
        <h3 className="text-xl font-semibold mb-2">Keine Aufträge gefunden</h3>
        <p className="text-muted-foreground mb-4">
          Es wurden keine aktiven Aufträge gefunden, die Ihren Filterkriterien entsprechen.
        </p>
        
        <div className="max-w-lg mx-auto mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
          <h4 className="font-semibold text-blue-700 mb-2">Sie suchen nach Arbeit?</h4>
          <p className="text-gray-700 mb-3">
            Dienstleister können auf dieser Plattform nach Aufträgen suchen. 
            Registrierte Benutzer können Aufträge einsehen und den Auftraggebern direkt ihre Dienste anbieten.
          </p>
          <p className="text-gray-700 text-sm mb-4">
            <span className="font-medium">Tipp:</span> Schauen Sie regelmäßig vorbei, da neue Aufträge täglich hinzugefügt werden!
          </p>
          <Link href="/auftrag-erstellen">
            <Button>Neuen Auftrag erstellen</Button>
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div>
      {/* Filter */}
      <div className="mb-6 space-y-4">
        <h2 className="text-xl font-semibold">Aufträge filtern</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium block mb-1">Kategorie</label>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Alle Kategorien" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle Kategorien</SelectItem>
                {serviceCategories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <label className="text-sm font-medium block mb-1">Ort</label>
            <Input
              placeholder="Ort eingeben..."
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
            />
          </div>
        </div>
      </div>
      
      {/* Auftragsliste */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {jobs.map((job) => (
          <JobListingCard key={job.id} job={job} showActions={true} />
        ))}
      </div>
    </div>
  );
}