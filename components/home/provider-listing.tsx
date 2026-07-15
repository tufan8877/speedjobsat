import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { StarRating } from "@/components/ui/star-rating";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { Profile, getServiceCategoryLabel } from "@shared/schema";
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
    queryKey: ["/api/profiles", "home-latest-4-no-badges"],
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
      if (dateB !== dateA) return dateB - dateA;
      return Number(b.id || 0) - Number(a.id || 0);
    })
    .slice(0, 4);

  return (
    <section className="py-8 sm:py-12 bg-accent/40">
      <div className="container mx-auto px-4">
        <div className="flex flex-row items-center justify-between gap-3 mb-6 sm:mb-8">
          <div>
            <h2 className="font-title text-xl font-black text-primary sm:text-2xl md:text-3xl">
              Neue Profile
            </h2>
            <p className="text-slate-600 mt-2 hidden sm:block">
              Aktuelle Angebote mit Region, Verfügbarkeit und Bewertungen.
            </p>
          </div>
          <Link href="/suche">
            <Button variant="ghost" size="sm" className="font-bold text-secondary hover:text-secondary/80 whitespace-nowrap">
              Alle anzeigen →
            </Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-10 w-10 animate-spin text-secondary" />
          </div>
        ) : error ? (
          <div className="text-center py-10 text-slate-500">
            Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.
          </div>
        ) : providers.length === 0 ? (
          <div className="text-center py-10 text-slate-500">
            Noch keine Profile vorhanden. Erstellen Sie das erste kostenlose Profil auf speedjob.at.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {providers.map((provider, index) => {
              const services = safeArray(provider.services);
              const regions = safeArray(provider.regions);
              const availablePeriods = safeArray(provider.availablePeriods);
              const reviews = provider.reviews || [];

              return (
                <div key={provider.id} className="bg-white rounded-2xl shadow-sm overflow-hidden transition hover:-translate-y-0.5 hover:shadow-lg border border-slate-100">
                  <div className="p-4 sm:p-6">
                    <div className="flex items-start gap-3 sm:gap-4">
                      <Avatar className="h-14 w-14 sm:h-16 sm:w-16 rounded-full flex-shrink-0">
                        <AvatarImage
                          src={provider.profileImage ?? undefined}
                          alt={`${provider.firstName || ""} ${provider.lastName || ""}`}
                        />
                        <AvatarFallback className="bg-primary text-white">
                          {provider.firstName?.[0] || "D"}{provider.lastName?.[0] || String(index + 1)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base sm:text-lg font-bold text-primary truncate">
                          {provider.firstName} {provider.lastName}
                        </h3>
                        <p className="text-secondary font-semibold truncate text-sm sm:text-base">
                          {services[0] ? getServiceCategoryLabel(services[0]) : "Dienstleistung"}
                        </p>
                        <div className="flex items-center text-primary/70 text-xs sm:text-sm mt-1 mb-2">
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
                            <p className="text-xs sm:text-sm text-slate-500">Noch keine Bewertungen</p>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-slate-100 space-y-2">
                      <div className="flex items-start text-slate-600 text-xs sm:text-sm">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 sm:w-5 mr-2 flex-shrink-0 mt-0.5 text-secondary">
                          <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                          <circle cx="12" cy="10" r="3" />
                        </svg>
                        <span>{regions.length > 0 ? regions.join(", ") : "Österreich"}</span>
                      </div>
                      <div className="flex items-start text-slate-600 text-xs sm:text-sm">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 sm:w-5 mr-2 flex-shrink-0 mt-0.5 text-secondary">
                          <circle cx="12" cy="12" r="10" />
                          <polyline points="12 6 12 12 16 14" />
                        </svg>
                        <span>{availablePeriods.length > 0 ? availablePeriods.join(", ") : "Nach Vereinbarung"}</span>
                      </div>

                      {user ? (
                        <div className="space-y-1">
                          {provider.email ? <div className="text-xs sm:text-sm text-slate-600 break-all">✉️ {provider.email}</div> : <div className="text-xs sm:text-sm text-slate-600">Kontakt über Profil</div>}
                        </div>
                      ) : (
                        <div className="text-xs sm:text-sm text-slate-600">📋 Registrierung erforderlich, um die E-Mail-Adresse zu sehen</div>
                      )}
                    </div>

                    <div className="mt-5">
                      <Link href={`/anbieter/${provider.id}`}>
                        <Button className="w-full rounded-xl font-bold h-10 sm:h-11">
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

        <div className="mt-8 sm:mt-10 text-center">
          <Link href="/suche">
            <Button variant="outline" className="rounded-xl border-primary/20 font-bold text-primary hover:bg-primary/5 w-full sm:w-auto">
              Mehr Profile anzeigen
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
