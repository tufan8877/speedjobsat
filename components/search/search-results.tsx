import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { StarRating } from "@/components/ui/star-rating";
import { ChevronDown, Loader2, MapPin, Clock, Mail, Share2 } from "lucide-react";
import { useSearch } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { FavoriteButton } from "@/components/favorites/favorite-button";
import { getServiceCategoryLabel } from "@shared/schema";

interface SearchResultsProps {
  initialPage?: number;
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

export default function SearchResults({ initialPage = 1 }: SearchResultsProps) {
  const search = useSearch();
  const searchParams = new URLSearchParams(search);
  const { user } = useAuth();

  const service = searchParams.get("service") || undefined;
  const region = searchParams.get("region") || undefined;
  const name = searchParams.get("name") || undefined;

  const [sortBy, setSortBy] = useState<string>("newest");
  const [currentPage, setCurrentPage] = useState(initialPage);
  const pageSize = 10;

  const [profiles, setProfiles] = useState<any[]>([]);
  const [totalProfiles, setTotalProfiles] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    setCurrentPage(1);
  }, [service, region, name, sortBy]);

  useEffect(() => {
    const fetchProfiles = async () => {
      const keepCurrentResultsVisible = profiles.length > 0;
      setIsLoading(!keepCurrentResultsVisible);
      setIsRefreshing(keepCurrentResultsVisible);
      setError(null);

      try {
        const params = new URLSearchParams();
        if (service) params.append("service", service);
        if (region) params.append("region", region);
        if (name) params.append("name", name);
        params.append("sort", sortBy || "newest");
        params.append("page", currentPage.toString());
        params.append("pageSize", pageSize.toString());

        const response = await fetch(`/api/ranked-profiles?${params.toString()}`, {
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error("Failed to fetch profiles");
        }

        const data = await response.json();
        const normalizedProfiles = (data.profiles || []).map((profile: any) => ({
          ...profile,
          services: safeArray(profile.services),
          regions: safeArray(profile.regions),
          availablePeriods: safeArray(profile.availablePeriods),
          reviews: Array.isArray(profile.reviews) ? profile.reviews : [],
        }));

        setProfiles(normalizedProfiles);
        setTotalProfiles(data.total || 0);
      } catch (err) {
        setError(err as Error);
        if (!keepCurrentResultsVisible) {
          setProfiles([]);
          setTotalProfiles(0);
        }
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    };

    fetchProfiles();
    // Existing results intentionally stay visible while sorting or changing pages.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [service, region, name, sortBy, currentPage]);

  const totalPages = Math.ceil(totalProfiles / pageSize);

  const handleSortChange = (value: string) => {
    if (value === sortBy) return;
    setSortBy(value);
    setCurrentPage(1);
  };

  const getPageNumbers = () => {
    const visiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(visiblePages / 2));
    let endPage = startPage + visiblePages - 1;

    if (endPage > totalPages) {
      endPage = totalPages;
      startPage = Math.max(1, endPage - visiblePages + 1);
    }

    return Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);
  };

  return (
    <div>
      <div className="mb-6 flex min-h-[7.5rem] flex-col justify-between gap-4 md:min-h-12 md:flex-row md:items-center">
        <div className="min-w-0">
          <h2 className="text-xl font-bold">
            {isLoading ? "Suche läuft..." : `${totalProfiles} Dienstleister gefunden`}
          </h2>
          <p className="mt-1 min-h-5 text-sm text-gray-600">
            {service && `Dienstleistung: ${getServiceCategoryLabel(service)}`}
            {region && ` | Region: ${region}`}
            {name && ` | Filter: ${name}`}
          </p>
        </div>

        <div className="flex min-h-12 w-full shrink-0 items-center gap-3 md:w-auto">
          <label htmlFor="profile-sort" className="whitespace-nowrap text-gray-600">Sortieren nach:</label>
          <div className="relative h-12 w-full min-w-0 md:w-48">
            <select
              id="profile-sort"
              value={sortBy}
              onChange={(event) => handleSortChange(event.target.value)}
              disabled={isRefreshing}
              className="absolute inset-0 h-12 min-h-12 max-h-12 w-full appearance-none rounded-md border border-input bg-background px-3 pr-10 text-base leading-none outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:cursor-wait disabled:opacity-80"
              style={{ WebkitAppearance: "none" }}
            >
              <option value="newest">Neueste</option>
              <option value="rating">Top bewertet</option>
              <option value="views">Meist angesehen</option>
            </select>
            {isRefreshing ? (
              <Loader2 className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-primary" />
            ) : (
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
            )}
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex min-h-64 justify-center py-12">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      ) : error && profiles.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <h3 className="mb-2 text-lg font-semibold text-gray-800">Ein Fehler ist aufgetreten</h3>
            <p className="text-gray-600">
              Die Suchergebnisse konnten nicht geladen werden. Bitte versuchen Sie es später erneut.
            </p>
          </CardContent>
        </Card>
      ) : profiles.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <h3 className="mb-2 text-lg font-semibold text-gray-800">Keine Dienstleister gefunden</h3>
            <p className="text-gray-600">
              Bitte versuchen Sie es mit anderen Suchkriterien oder schauen Sie später wieder vorbei.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className={`space-y-4 ${isRefreshing ? "opacity-80" : "opacity-100"}`} aria-busy={isRefreshing}>
            {profiles.map((profile, index) => {
              const averageRating = profile.reviews?.length
                ? profile.reviews.reduce((sum: number, review: any) => sum + Number(review.rating || 0), 0) / profile.reviews.length
                : 0;

              return (
                <Card key={profile.id} className="overflow-hidden transition hover:shadow-md">
                  <CardContent className="p-0">
                    <div className="p-4 md:p-6">
                      <div className="flex items-start">
                        <Avatar className="h-16 w-16 rounded-full">
                          <AvatarImage
                            src={profile.profileImage}
                            alt={`${profile.firstName || ""} ${profile.lastName || ""}`}
                          />
                          <AvatarFallback className="bg-primary text-white">
                            {profile.firstName?.[0] || "D"}{profile.lastName?.[0] || String(index + 1)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="ml-4 min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <h3 className="truncate text-lg font-semibold">
                              {profile.firstName} {profile.lastName}
                            </h3>
                            <Badge variant={profile.isAvailable ? "success" : "warning"}>
                              {profile.isAvailable ? "Verfügbar" : "Teilweise verfügbar"}
                            </Badge>
                          </div>
                          <p className="font-medium text-primary">
                            {profile.services?.[0] ? getServiceCategoryLabel(profile.services[0]) : "Dienstleistung"}
                          </p>
                          {profile.reviews && profile.reviews.length > 0 ? (
                            <StarRating rating={averageRating} reviewCount={profile.reviews.length} size="sm" />
                          ) : (
                            <p className="text-sm text-gray-500">Noch keine Bewertungen</p>
                          )}
                        </div>
                      </div>

                      <div className="mt-4 border-t border-gray-100 pt-4">
                        <div className="grid gap-2 md:grid-cols-2">
                          <div className="flex items-center text-sm text-gray-600">
                            <MapPin className="mr-2 h-4 w-4 flex-shrink-0" />
                            <span>{profile.regions?.length ? profile.regions.join(", ") : "Österreich"}</span>
                          </div>

                          <div className="flex items-center text-sm text-gray-600">
                            <Clock className="mr-2 h-4 w-4 flex-shrink-0" />
                            <span>{profile.availablePeriods?.length ? profile.availablePeriods.join(", ") : "Nach Vereinbarung"}</span>
                          </div>

                          {user && profile.email && (
                            <div className="flex items-center text-sm text-gray-600">
                              <Mail className="mr-2 h-4 w-4 flex-shrink-0" />
                              <a href={`mailto:${profile.email}`} className="break-all hover:text-primary sm:break-normal">
                                {profile.email}
                              </a>
                            </div>
                          )}

                          {!user && profile.email && (
                            <div className="flex items-center text-sm text-orange-600">
                              <Mail className="mr-2 h-4 w-4 flex-shrink-0" />
                              <span>Registrierung erforderlich, um die Kontaktdaten zu sehen</span>
                            </div>
                          )}

                          {user && profile.socialMedia && (
                            <div className="flex items-center text-sm text-gray-600">
                              <Share2 className="mr-2 h-4 w-4 flex-shrink-0" />
                              <span>{profile.socialMedia}</span>
                            </div>
                          )}
                        </div>

                        <div className="mt-4 flex flex-wrap gap-2">
                          {profile.services.map((serviceItem: string) => (
                            <Badge key={serviceItem} variant="outline" className="border-primary bg-primary-50 text-primary">
                              {getServiceCategoryLabel(serviceItem)}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
                        <Link href={`/anbieter/${profile.id}`}>
                          <Button className="w-full">Profil ansehen</Button>
                        </Link>
                        <FavoriteButton profileId={profile.id} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {totalPages > 1 && (
            <div className="mt-8 flex justify-center">
              <div className="flex space-x-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  disabled={currentPage === 1 || isRefreshing}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
                </Button>

                {getPageNumbers().map((pageNumber) => (
                  <Button
                    key={pageNumber}
                    variant={pageNumber === currentPage ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(pageNumber)}
                    disabled={isRefreshing}
                  >
                    {pageNumber}
                  </Button>
                ))}

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages || isRefreshing}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
