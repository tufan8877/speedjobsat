import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { StarRating } from "@/components/ui/star-rating";
import { Loader2, MapPin, Clock, Phone, Mail, Share2 } from "lucide-react";
import { useSearch } from "wouter";
import { useAuth } from "@/hooks/use-auth";

interface SearchResultsProps {
  initialPage?: number;
}

export default function SearchResults({ initialPage = 1 }: SearchResultsProps) {
  const search = useSearch();
  const searchParams = new URLSearchParams(search);
  const { user } = useAuth();
  
  const service = searchParams.get("service") || undefined;
  const region = searchParams.get("region") || undefined;
  const name = searchParams.get("name") || undefined;
  
  const [sortBy, setSortBy] = useState<string>("rating");
  const [currentPage, setCurrentPage] = useState(initialPage);
  const pageSize = 10;
  
  const [profiles, setProfiles] = useState<any[]>([]);
  const [totalProfiles, setTotalProfiles] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  // Reset pagination when search params change
  useEffect(() => {
    setCurrentPage(1);
  }, [service, region, name]);
  
  // Fetch search results directly
  useEffect(() => {
    const fetchProfiles = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const params = new URLSearchParams();
        if (service) params.append('service', service);
        if (region) params.append('region', region);
        if (name) params.append('name', name);
        if (sortBy) params.append('sort', sortBy);
        params.append('page', currentPage.toString());
        params.append('pageSize', pageSize.toString());
        
        const response = await fetch(`/api/profiles?${params.toString()}`);
        if (!response.ok) {
          throw new Error('Failed to fetch profiles');
        }
        
        const data = await response.json();
        setProfiles(data.profiles || []);
        setTotalProfiles(data.total || 0);
      } catch (err) {
        setError(err as Error);
        setProfiles([]);
        setTotalProfiles(0);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProfiles();
  }, [service, region, name, sortBy, currentPage]);
  const totalPages = Math.ceil(totalProfiles / pageSize);
  
  // Handle sorting change
  const handleSortChange = (value: string) => {
    setSortBy(value);
    setCurrentPage(1);
  };
  
  // Generate page links
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
      <div className="flex flex-col md:flex-row justify-between md:items-center mb-6">
        <div>
          <h2 className="text-xl font-bold">
            {isLoading ? (
              "Suche läuft..."
            ) : (
              `${totalProfiles} Dienstleister gefunden`
            )}
          </h2>
          <p className="text-gray-600 text-sm mt-1">
            {service && `Dienstleistung: ${service}`}
            {region && ` | Region: ${region}`}
            {name && ` | Name: ${name}`}
          </p>
        </div>
        
        <div className="flex items-center space-x-3 mt-4 md:mt-0">
          <span className="text-gray-600 whitespace-nowrap">Sortieren nach:</span>
          <Select value={sortBy} onValueChange={handleSortChange}>
            <SelectTrigger className="w-40">
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
        <div className="flex justify-center py-12">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      ) : error ? (
        <Card>
          <CardContent className="p-6 text-center">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Ein Fehler ist aufgetreten</h3>
            <p className="text-gray-600">
              Die Suchergebnisse konnten nicht geladen werden. Bitte versuchen Sie es später erneut.
            </p>
          </CardContent>
        </Card>
      ) : profiles.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Keine Dienstleister gefunden</h3>
            <p className="text-gray-600">
              Bitte versuchen Sie es mit anderen Suchkriterien oder schauen Sie später wieder vorbei.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="space-y-4">
            {profiles.map((profile) => (
              <Card key={profile.id} className="overflow-hidden hover:shadow-md transition">
                <CardContent className="p-0">
                  <div className="p-4 md:p-6">
                    <div className="flex items-start">
                      <Avatar className="h-16 w-16 rounded-full">
                        <AvatarImage 
                          src={profile.profileImage} 
                          alt={`${profile.firstName} ${profile.lastName}`} 
                        />
                        <AvatarFallback className="bg-primary text-white">
                          {profile.firstName[0]}{profile.lastName[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="ml-4 flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-semibold">
                            {profile.firstName} {profile.lastName}
                          </h3>
                          <Badge variant={profile.isAvailable ? "success" : "warning"}>
                            {profile.isAvailable ? "Verfügbar" : "Teilweise verfügbar"}
                          </Badge>
                        </div>
                        <p className="text-primary font-medium">{profile.services[0]}</p>
                        {profile.reviews && profile.reviews.length > 0 ? (
                          <StarRating 
                            rating={profile.reviews.reduce((sum: any, review: any) => sum + review.rating, 0) / profile.reviews.length} 
                            reviewCount={profile.reviews.length}
                            size="sm"
                          />
                        ) : (
                          <p className="text-sm text-gray-500">Noch keine Bewertungen</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <div className="grid md:grid-cols-2 gap-2">
                        <div className="flex items-center text-gray-600 text-sm">
                          <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
                          <span>
                            {typeof profile.regions === 'string' 
                              ? JSON.parse(profile.regions).join(", ")
                              : Array.isArray(profile.regions) 
                                ? profile.regions.join(", ")
                                : "Österreich"
                            }
                          </span>
                        </div>
                        
                        <div className="flex items-center text-gray-600 text-sm">
                          <Clock className="h-4 w-4 mr-2 flex-shrink-0" />
                          <span>
                            {profile.availablePeriods && profile.availablePeriods.join(", ")}
                          </span>
                        </div>
                        
                        {/* Kontaktdaten nur für angemeldete Benutzer */}
                        {user && profile.phoneNumber && (
                          <div className="flex items-center text-gray-600 text-sm">
                            <Phone className="h-4 w-4 mr-2 flex-shrink-0" />
                            <a href={`tel:${profile.phoneNumber}`} className="hover:text-primary">
                              {profile.phoneNumber}
                            </a>
                          </div>
                        )}
                        
                        {user && profile.email && (
                          <div className="flex items-center text-gray-600 text-sm">
                            <Mail className="h-4 w-4 mr-2 flex-shrink-0" />
                            <a href={`mailto:${profile.email}`} className="hover:text-primary break-all sm:break-normal">
                              {profile.email}
                            </a>
                          </div>
                        )}
                        
                        {!user && (profile.phoneNumber || profile.email) && (
                          <div className="flex items-center text-orange-600 text-sm">
                            <Phone className="h-4 w-4 mr-2 flex-shrink-0" />
                            <span>📋 Registrierung erforderlich</span>
                          </div>
                        )}
                        
                        {user && profile.socialMedia && (
                          <div className="flex items-center text-gray-600 text-sm">
                            <Share2 className="h-4 w-4 mr-2 flex-shrink-0" />
                            <span>{profile.socialMedia}</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="mt-4 flex flex-wrap gap-2">
                        {profile.services.map((service) => (
                          <Badge key={service} variant="outline" className="bg-primary-50 text-primary border-primary">
                            {service}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <Link href={`/anbieter/${profile.id}`}>
                        <Button className="w-full">
                          Profil ansehen
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-8">
              <div className="flex space-x-1">
                {/* Previous button */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                </Button>
                
                {/* Page numbers */}
                {getPageNumbers().map((pageNumber) => (
                  <Button
                    key={pageNumber}
                    variant={pageNumber === currentPage ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(pageNumber)}
                  >
                    {pageNumber}
                  </Button>
                ))}
                
                {/* Next button */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
