import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { StarRating } from "@/components/ui/star-rating";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { Profile } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";

interface ProfileWithStats extends Profile {
  averageRating?: number;
  reviewCount?: number;
  reviews?: any[];
}

function safeArray(value: any): string[] {
  if (Array.isArray(value)) return value;
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return value.split(",").map((item) => item.trim()).filter(Boolean);
    }
  }
  return [];
}

export default function ProviderListing() {
  const { user } = useAuth();

  const { data, isLoading, error } = useQuery<{ profiles: ProfileWithStats[] }>({
    queryKey: ["/api/profiles", "home-latest-4"],
    queryFn: async () => {
      const res = await fetch("/api/profiles?sort=newest&pageSize=4&page=1", {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Profile konnten nicht geladen werden");
      return res.json();
    },
    refetchInterval: 5000,
  });

  const providers = (data?.profiles || [])
    .slice()
    .sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    })
    .slice(0, 4);

  return (
    <section className="py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between md:items-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold font-title mb-4 md:mb-0">
            Aktuelle Dienstleistungen
          </h2>
          <Link href="/suche">
            <Button variant="ghost" className="text-primary hover:text-primary/80">
              Alle anzeigen →
            </Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
          </div>
        ) : error ? (
          <div className="text-center py-10 text-gray-500">
            Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.
          </div>
        ) : providers.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            Keine Dienstleistungen gefunden. Schauen Sie später wieder vorbei!
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {providers.map((provider, index) => {
              const services = safeArray(provider.services);
              const regions = safeArray(provider.regions);
              const availablePeriods = safeArray(provider.availablePeriods);
              const reviews = provider.reviews || [];

              return (
                <div key={provider.id} className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition">
                  <div className="p-6">
                    <div className="flex items-start">
                      <Avatar className="h-16 w-16 rounded-full">
                        <AvatarImage
                          src={provider.profileImage ?? undefined}
                          alt={`${provider.firstName || ""} ${provider.lastName || ""}`}
                        />
                        <AvatarFallback className="bg-primary text-white">
                          {provider.firstName?.[0] || "D"}{provider.lastName?.[0] || String(index + 1)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="ml-4 flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <h3 className="text-lg font-semibold truncate">
                            {provider.firstName} {provider.lastName}
                          </h3>
                        </div>
                        <p className="text-primary font-medium truncate">
                          {services[0] || "Dienstleistung"}
                        </p>
                        <div className="flex items-center text-blue-600 text-sm mt-1 mb-2">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1 flex-shrink-0">
                            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                            <circle cx="12" cy="10" r="3" />
                          </svg>
                          <span className="font-semibold truncate">
                            {regions.length > 0 ? regions.join(", ") : "Österreich"}
                          </span>
                        </div>
                        <div className="flex items-center mt-1">
                          {reviews.length > 0 ? (
                            <StarRating
                              rating={reviews.reduce((sum: number, review: any) => sum + Number(review.rating || 0), 0) / reviews.length}
                              reviewCount={reviews.length}
                              size="sm"
                            />
                          ) : (
                            <p className="text-sm text-gray-500">Noch keine Bewertungen</p>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <div className="flex items-center text-gray-600 text-sm mb-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 mr-2 flex-shrink-0">
                          <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                          <circle cx="12" cy="10" r="3" />
                        </svg>
                        <span>{regions.length > 0 ? regions.join(", ") : "Österreich"}</span>
                      </div>
                      <div className="flex items-center text-gray-600 text-sm mb-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 mr-2 flex-shrink-0">
                          <circle cx="12" cy="12" r="10" />
                          <polyline points="12 6 12 12 16 14" />
                        </svg>
                        <span>{availablePeriods.length > 0 ? availablePeriods.join(", ") : "Nach Vereinbarung"}</span>
                      </div>

                      {user ? (
                        <div className="space-y-1">
                          {provider.phoneNumber && (
                            <div className="flex items-center text-gray-600 text-sm">
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 mr-2 flex-shrink-0">
                                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                              </svg>
                              <span>{provider.phoneNumber}</span>
                            </div>
                          )}
                          {provider.email && (
                            <div className="flex items-center text-gray-600 text-sm">
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 mr-2 flex-shrink-0">
                                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                                <polyline points="22 6 12 13 2 6" />
                              </svg>
                              <span className="break-all">{provider.email}</span>
                            </div>
                          )}
                          {!provider.phoneNumber && !provider.email && (
                            <div className="flex items-center text-gray-600 text-sm">
                              <span>Kontakt über Profil</span>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="flex items-center text-gray-600 text-sm">
                          <span>📋 Registrierung erforderlich</span>
                        </div>
                      )}
                    </div>

                    <div className="mt-5">
                      <Link href={`/anbieter/${provider.id}`}>
                        <Button className="w-full bg-primary hover:bg-primary/90 text-white">
                          Profil ansehen
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-10 text-center">
          <Link href="/suche">
            <Button variant="outline" className="border-primary text-primary hover:bg-primary/5">
              Mehr Dienstleistungen anzeigen
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
