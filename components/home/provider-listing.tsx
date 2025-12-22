import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { StarRating } from "@/components/ui/star-rating";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Profile } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";

interface ProfileWithStats extends Profile {
  averageRating?: number;
  reviewCount?: number;
  reviews?: any[];
}

export default function ProviderListing() {
  const [sortBy, setSortBy] = useState<string>("newest");
  const { user } = useAuth();
  
  // Fetch profiles with correct API parameters
  const { data, isLoading, error } = useQuery<{profiles: ProfileWithStats[]}>({
    queryKey: ["/api/profiles", sortBy],
    queryFn: () => fetch(`/api/profiles?sort=${sortBy}&pageSize=8`).then(res => res.json()),
    refetchInterval: 5000, // Auto-refresh every 5 seconds
  });
  
  const providers = data?.profiles || [];
  
  return (
    <section className="py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between md:items-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold font-title mb-4 md:mb-0">
            Unsere Dienstleister
          </h2>
          
          <div className="flex items-center space-x-3">
            <span className="text-gray-600 whitespace-nowrap">Sortieren nach:</span>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="bg-white border border-gray-200 rounded w-40">
                <SelectValue placeholder="Sortieren nach" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="rating">Bestbewertet</SelectItem>
                <SelectItem value="newest">Neueste</SelectItem>
                <SelectItem value="reviews">Meiste Bewertungen</SelectItem>
              </SelectContent>
            </Select>
          </div>
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
            Keine Dienstleister gefunden. Schauen Sie später wieder vorbei!
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {providers.map((provider) => (
              <div key={provider.id} className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition">
                <div className="p-6">
                  <div className="flex items-start">
                    <Avatar className="h-16 w-16 rounded-full">
                      <AvatarImage 
                        src={provider.profileImage ?? undefined} 
                        alt={`${provider.firstName} ${provider.lastName}`} 
                      />
                      <AvatarFallback className="bg-primary text-white">
                        {provider.firstName?.[0]}{provider.lastName?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="ml-4 flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold">
                          {provider.firstName} {provider.lastName}
                        </h3>
                        <Badge variant="default">
                          Verfügbar
                        </Badge>
                      </div>
                      <p className="text-primary font-medium">
                        {typeof provider.services === 'string' 
                          ? JSON.parse(provider.services)[0] || "Dienstleister"
                          : provider.services?.[0] || "Dienstleister"
                        }
                      </p>
                      <div className="flex items-center text-blue-600 text-sm mt-1 mb-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                          <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
                          <circle cx="12" cy="10" r="3"/>
                        </svg>
                        <span className="font-semibold">
                          {typeof provider.regions === 'string' 
                            ? JSON.parse(provider.regions).join(", ")
                            : Array.isArray(provider.regions) 
                              ? provider.regions.join(", ")
                              : "Österreich"
                          }
                        </span>
                      </div>
                      <div className="flex items-center mt-1">
                        {provider.reviews && provider.reviews.length > 0 ? (
                          <StarRating 
                            rating={provider.reviews.reduce((sum: any, review: any) => sum + review.rating, 0) / provider.reviews.length} 
                            reviewCount={provider.reviews.length}
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
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 mr-2"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                      <span>
                        {typeof provider.regions === 'string' 
                          ? JSON.parse(provider.regions).join(", ")
                          : Array.isArray(provider.regions) 
                            ? provider.regions.join(", ")
                            : "Österreich"
                        }
                      </span>
                    </div>
                    <div className="flex items-center text-gray-600 text-sm mb-2">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 mr-2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                      <span>
                        {typeof provider.availablePeriods === 'string' 
                          ? JSON.parse(provider.availablePeriods).join(", ")
                          : Array.isArray(provider.availablePeriods) 
                            ? provider.availablePeriods.join(", ")
                            : "Nach Vereinbarung"
                        }
                      </span>
                    </div>
                    {/* Kontaktdaten nur für angemeldete Benutzer */}
                    {user ? (
                      <div className="space-y-1">
                        {provider.phoneNumber && (
                          <div className="flex items-center text-gray-600 text-sm">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 mr-2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                            <span>{provider.phoneNumber}</span>
                          </div>
                        )}
                        {provider.email && (
                          <div className="flex items-center text-gray-600 text-sm">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 mr-2 flex-shrink-0"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22 6 12 13 2 6"/></svg>
                            <span className="break-all sm:break-normal">{provider.email}</span>
                          </div>
                        )}
                        {provider.socialMedia && (
                          <div className="flex items-center text-gray-600 text-sm">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 mr-2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
                            <span>{provider.socialMedia}</span>
                          </div>
                        )}
                        {!provider.phoneNumber && !provider.email && !provider.socialMedia && (
                          <div className="flex items-center text-gray-600 text-sm">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 mr-2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                            <span>Kontakt über Profil</span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center text-gray-600 text-sm">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 mr-2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
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
            ))}
          </div>
        )}
        
        <div className="mt-10 text-center">
          <Link href="/suche">
            <Button variant="outline" className="border-primary text-primary hover:bg-primary/5">
              Mehr Dienstleister anzeigen
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
