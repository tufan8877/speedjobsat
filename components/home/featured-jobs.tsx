import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { Calendar, ChevronDown, MapPin, Phone } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import { JobListing } from "@shared/schema";
import { serviceCategories, federalStates } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";

export default function FeaturedJobs() {
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState("alle");
  const [selectedLocation, setSelectedLocation] = useState("alle");

  const { data: jobs, isLoading, error } = useQuery<JobListing[]>({
    queryKey: ["/api/jobs", "home-latest-3-clean-cards"],
    queryFn: async () => {
      const res = await fetch("/api/jobs", { credentials: "include" });
      if (!res.ok) throw new Error("Aufträge konnten nicht geladen werden");
      return res.json();
    },
    refetchInterval: 5000,
  });

  const filteredJobs =
    jobs?.filter((job) => {
      const matchesCategory =
        !selectedCategory ||
        selectedCategory === "alle" ||
        job.category === selectedCategory;

      const matchesLocation =
        !selectedLocation ||
        selectedLocation === "alle" ||
        job.location.toLowerCase().includes(selectedLocation.toLowerCase());

      return matchesCategory && matchesLocation;
    }) || [];

  const latestFilteredJobs = [...filteredJobs]
    .sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      if (dateB !== dateA) return dateB - dateA;
      return Number(b.id || 0) - Number(a.id || 0);
    })
    .slice(0, 3);

  if (isLoading) {
    return (
      <section className="py-8 sm:py-12 bg-muted/30">
        <div className="container px-4">
          <h2 className="text-2xl sm:text-3xl font-bold mb-8 text-center">Aktuelle Aufträge</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="h-full flex flex-col">
                <CardHeader>
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent className="flex-1">
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-3/4" />
                </CardContent>
                <CardFooter>
                  <Skeleton className="h-10 w-full" />
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-8 sm:py-12">
        <div className="container px-4">
          <div className="text-center">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">Aktuelle Aufträge</h2>
            <p className="text-red-500">Fehler beim Laden der Aufträge.</p>
          </div>
        </div>
      </section>
    );
  }

  if (!jobs || jobs.length === 0) {
    return (
      <section className="py-8 sm:py-12 bg-muted/30">
        <div className="container px-4">
          <div className="text-center">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">Aktuelle Aufträge</h2>
            <p className="mb-6">Derzeit sind keine Aufträge verfügbar.</p>
            <Link href="/auftraege">
              <Button>Alle Aufträge anzeigen</Button>
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-8 sm:py-12 bg-muted/30">
      <div className="container px-4">
        <div className="text-center mb-6 sm:mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4">Aktuelle Aufträge</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-sm sm:text-base">
            Hier sehen Sie die 3 neuesten Aufträge. Der neueste Auftrag steht immer an erster Stelle.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-4 sm:p-6 mb-6 sm:mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="home-job-category-filter" className="text-gray-700 text-sm font-medium mb-2 block">
                Kategorie / Service
              </label>
              <div className="relative">
                <select
                  id="home-job-category-filter"
                  value={selectedCategory}
                  onChange={(event) => setSelectedCategory(event.target.value)}
                  className="h-11 w-full appearance-none rounded-md border border-input bg-white px-3 pr-10 text-sm ring-offset-background outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="alle">Alle Kategorien</option>
                  {serviceCategories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              </div>
            </div>

            <div>
              <label htmlFor="home-job-location-filter" className="text-gray-700 text-sm font-medium mb-2 block">
                Bundesland
              </label>
              <div className="relative">
                <select
                  id="home-job-location-filter"
                  value={selectedLocation}
                  onChange={(event) => setSelectedLocation(event.target.value)}
                  className="h-11 w-full appearance-none rounded-md border border-input bg-white px-3 pr-10 text-sm ring-offset-background outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="alle">Alle Bundesländer</option>
                  {federalStates.map((state) => (
                    <option key={state} value={state}>
                      {state}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              </div>
            </div>
          </div>

          {(selectedCategory !== "alle" || selectedLocation !== "alle") && (
            <div className="mt-4 text-sm text-gray-600">
              {filteredJobs.length} von {jobs?.length || 0} Aufträgen gefunden – angezeigt werden die neuesten 3
            </div>
          )}
        </div>

        {latestFilteredJobs.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">Keine passenden Aufträge gefunden.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8">
            {latestFilteredJobs.map((job) => (
              <Card key={job.id} className="h-full flex flex-col overflow-hidden border border-gray-100 shadow-sm">
                <CardHeader className="p-4 sm:p-6 pb-3">
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <Badge variant="outline" className="text-xs">{job.category}</Badge>
                  </div>
                  <CardTitle className="text-base sm:text-lg line-clamp-2">{job.title}</CardTitle>
                </CardHeader>

                <CardContent className="flex-1 p-4 sm:p-6 pt-0">
                  <p className="text-sm text-muted-foreground line-clamp-3 mb-4">{job.description}</p>

                  <div className="space-y-2">
                    <div className="flex items-start text-sm">
                      <MapPin className="h-4 w-4 mr-2 mt-0.5 text-muted-foreground flex-shrink-0" />
                      <span>{job.location}</span>
                    </div>

                    <div className="flex items-start text-sm">
                      <Calendar className="h-4 w-4 mr-2 mt-0.5 text-muted-foreground flex-shrink-0" />
                      <span>{job.date ? format(new Date(job.date), "PPP", { locale: de }) : "Kein Datum angegeben"}</span>
                    </div>

                    <div className="flex items-start text-sm">
                      <Phone className="h-4 w-4 mr-2 mt-0.5 text-muted-foreground flex-shrink-0" />
                      {user ? (
                        <span className="line-clamp-1">{job.contactInfo}</span>
                      ) : (
                        <span className="text-orange-600">Registrierung erforderlich</span>
                      )}
                    </div>
                  </div>
                </CardContent>

                <CardFooter className="p-4 sm:p-6 pt-0">
                  <Link href={`/auftraege/${job.id}`}>
                    <Button variant="default" className="w-full h-10 sm:h-11">
                      Details ansehen
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}

        <div className="text-center">
          <Link href="/auftraege">
            <Button variant="outline" size="lg" className="w-full sm:w-auto">
              Alle Aufträge anzeigen
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
