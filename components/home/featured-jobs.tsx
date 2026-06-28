import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { MapPin, Calendar, Phone } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import { JobListing } from "@shared/schema";
import { serviceCategories, federalStates } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";

export default function FeaturedJobs() {
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");

  const { data: jobs, isLoading, error } = useQuery<JobListing[]>({
    queryKey: ["/api/jobs", "home-latest-3"],
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
        selectedCategory === "" ||
        job.category === selectedCategory;

      const matchesLocation =
        !selectedLocation ||
        selectedLocation === "alle" ||
        selectedLocation === "" ||
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
      <section className="py-12 bg-muted/30">
        <div className="container">
          <h2 className="text-3xl font-bold mb-8 text-center">Aktuelle Aufträge</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
      <section className="py-12">
        <div className="container">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-4">Aktuelle Aufträge</h2>
            <p className="text-red-500">Fehler beim Laden der Aufträge.</p>
          </div>
        </div>
      </section>
    );
  }

  if (!jobs || jobs.length === 0) {
    return (
      <section className="py-12 bg-muted/30">
        <div className="container">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-4">Aktuelle Aufträge</h2>
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
    <section className="py-12 bg-muted/30">
      <div className="container">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-4">Aktuelle Aufträge</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Hier sehen Sie die 3 neuesten Aufträge auf unserer Plattform. Der neueste Auftrag steht immer an erster Stelle.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-gray-700 text-sm font-medium mb-2 block">Kategorie / Service</label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Kategorie wählen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="alle">Alle Kategorien</SelectItem>
                  {serviceCategories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-gray-700 text-sm font-medium mb-2 block">Bundesland</label>
              <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                <SelectTrigger>
                  <SelectValue placeholder="Bundesland wählen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="alle">Alle Bundesländer</SelectItem>
                  {federalStates.map((state) => (
                    <SelectItem key={state} value={state}>
                      {state}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {(selectedCategory || selectedLocation) && (
            <div className="mt-4 text-sm text-gray-600">
              {filteredJobs.length} von {jobs?.length || 0} Aufträgen gefunden – angezeigt werden die neuesten 3
            </div>
          )}
        </div>

        {latestFilteredJobs.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            Keine passenden Aufträge gefunden.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {latestFilteredJobs.map((job) => (
              <Card key={job.id} className="h-full flex flex-col">
                <CardHeader>
                  <div className="flex justify-between items-start gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline">{job.category}</Badge>
                      </div>
                      <CardTitle className="text-lg line-clamp-1">{job.title}</CardTitle>
                      <CardDescription className="mt-1">
                        Auftrag {job.id}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="flex-1">
                  <p className="text-sm text-muted-foreground line-clamp-3 mb-4">{job.description}</p>

                  <div className="space-y-2">
                    <div className="flex items-center text-sm">
                      <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>{job.location}</span>
                    </div>

                    <div className="flex items-center text-sm">
                      <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>{job.date ? format(new Date(job.date), "PPP", { locale: de }) : "Kein Datum angegeben"}</span>
                    </div>

                    <div className="flex items-center text-sm">
                      <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                      {user ? (
                        <span className="line-clamp-1">{job.contactInfo}</span>
                      ) : (
                        <span className="text-orange-600">Registrierung erforderlich</span>
                      )}
                    </div>
                  </div>
                </CardContent>

                <CardFooter>
                  <Link href={`/auftraege/${job.id}`}>
                    <Button variant="default" className="w-full">
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
            <Button variant="outline" size="lg">
              Alle Aufträge anzeigen
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
