import { useQuery } from "@tanstack/react-query";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { StarRating } from "@/components/ui/star-rating";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, MapPin, Clock, Phone, Mail } from "lucide-react";
import { ReviewForm } from "./review-form";
import { useAuth } from "@/hooks/use-auth";
import { FavoriteButton } from "@/components/favorites/favorite-button";
import { formatDate } from "@/lib/utils";
import type { Profile } from "@shared/schema";

interface ProviderProfileProps {
  profileId: number;
}

export default function ProviderProfile({ profileId }: ProviderProfileProps) {
  const { user } = useAuth();
  
  const { data, isLoading, error } = useQuery<Profile>({
    queryKey: [`/api/profiles/${profileId}`],
  });
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }
  
  if (error || !data) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Profil nicht gefunden</h2>
        <p className="text-gray-600">
          Das angeforderte Dienstleisterprofil konnte nicht geladen werden.
        </p>
      </div>
    );
  }
  
  const profile = data as any;
  const reviews = profile?.reviews || [];
  const isOwnProfile = user?.id === profile.userId;
  const hasAlreadyReviewed = !!user && reviews.some((review: any) => review.userId === user.id);
  
  const reviewCount = reviews.length;
  const averageRating = reviews.length > 0 
    ? reviews.reduce((sum: any, review: any) => sum + review.rating, 0) / reviews.length 
    : null;
  
  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row">
            <div className="md:w-1/3 flex flex-col items-center mb-6 md:mb-0">
              <Avatar className="h-32 w-32 md:h-40 md:w-40">
                <AvatarImage src={profile.profileImage || ''} />
                <AvatarFallback className="text-2xl bg-primary text-white">
                  {profile.firstName?.[0]}{profile.lastName?.[0]}
                </AvatarFallback>
              </Avatar>
              
              <div className="mt-4 text-center">
                <Badge variant="default">
                  Verfügbar
                </Badge>
              </div>
              
              <div className="mt-4 text-center md:hidden w-full">
                <h1 className="text-2xl font-bold">{profile.firstName} {profile.lastName}</h1>
                <p className="text-primary font-medium mt-1">
                  {typeof profile.services === 'string' 
                    ? JSON.parse(profile.services)[0] || 'Dienstleister'
                    : profile.services?.[0] || 'Dienstleister'
                  }
                </p>
                <div className="mt-2">
                  {averageRating && averageRating > 0 ? (
                    <StarRating 
                      rating={averageRating} 
                      reviewCount={reviewCount}
                    />
                  ) : (
                    <p className="text-sm text-gray-500">Noch keine Bewertungen</p>
                  )}
                </div>
                {!isOwnProfile && (
                  <div className="mt-4">
                    <FavoriteButton profileId={profile.id} />
                  </div>
                )}
              </div>
            </div>
            
            <div className="md:w-2/3 md:pl-8">
              <div className="hidden md:block">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h1 className="text-3xl font-bold">{profile.firstName} {profile.lastName}</h1>
                    <p className="text-primary font-medium text-lg mt-1">
                      {typeof profile.services === 'string' 
                        ? JSON.parse(profile.services)[0] || 'Dienstleister'
                        : profile.services?.[0] || 'Dienstleister'
                      }
                    </p>
                  </div>
                  {!isOwnProfile && <FavoriteButton profileId={profile.id} />}
                </div>
                <div className="mt-2">
                  {averageRating && averageRating > 0 ? (
                    <StarRating 
                      rating={averageRating} 
                      reviewCount={reviewCount}
                      size="lg"
                    />
                  ) : (
                    <p className="text-sm text-gray-500">Noch keine Bewertungen</p>
                  )}
                </div>
              </div>
              
              <Separator className="my-4" />
              
              <div className="space-y-3">
                <div className="flex items-center text-gray-700">
                  <MapPin className="h-5 w-5 mr-2 flex-shrink-0" />
                  <span>
                    {typeof profile.regions === 'string' 
                      ? JSON.parse(profile.regions).join(", ")
                      : Array.isArray(profile.regions) 
                        ? profile.regions.join(", ")
                        : "Österreich"
                    }
                  </span>
                </div>
                
                <div className="flex items-center text-gray-700">
                  <Clock className="h-5 w-5 mr-2 flex-shrink-0" />
                  <span>
                    {typeof profile.availablePeriods === 'string' 
                      ? JSON.parse(profile.availablePeriods).join(", ")
                      : Array.isArray(profile.availablePeriods) 
                        ? profile.availablePeriods.join(", ")
                        : "Nach Vereinbarung"
                    }
                  </span>
                </div>
                
                {user && profile.phoneNumber && (
                  <div className="flex items-center text-gray-700">
                    <Phone className="h-5 w-5 mr-2 flex-shrink-0" />
                    <a href={`tel:${profile.phoneNumber}`} className="hover:text-primary">
                      {profile.phoneNumber}
                    </a>
                  </div>
                )}
                
                {user && profile.email && (
                  <div className="flex items-center text-gray-700">
                    <Mail className="h-5 w-5 mr-2 flex-shrink-0" />
                    <a href={`mailto:${profile.email}`} className="hover:text-primary break-all sm:break-normal">
                      {profile.email}
                    </a>
                  </div>
                )}
                
                {!user && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-2">
                    <p className="text-sm text-blue-800">
                      💡 <strong>Kontaktdaten verfügbar:</strong> Registrieren Sie sich kostenlos, um Telefon und E-Mail zu sehen.
                      <br />
                      <a href="/auth" className="text-primary font-medium hover:underline">Jetzt registrieren</a>
                    </p>
                  </div>
                )}
              </div>
              
              <div className="mt-6 flex flex-wrap gap-2">
                {(typeof profile.services === 'string' 
                  ? JSON.parse(profile.services) 
                  : profile.services || []
                ).map((service: string) => (
                  <Badge key={service} variant="outline" className="bg-primary-50 text-primary border-primary">
                    {service}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
          
          {profile.description && (
            <div className="mt-8">
              <h2 className="text-xl font-bold mb-2">Über mich</h2>
              <p className="text-gray-700 whitespace-pre-line">{profile.description}</p>
            </div>
          )}
        </CardContent>
      </Card>
      
      <Tabs defaultValue="reviews" className="mt-8">
        <TabsList className="w-full border-b">
          <TabsTrigger value="reviews" className="flex-1">
            Bewertungen ({reviewCount})
          </TabsTrigger>
          <TabsTrigger value="services" className="flex-1">
            Dienstleistungen
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="reviews" className="pt-6">
          {!isOwnProfile && user && !hasAlreadyReviewed && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-4">Bewertung abgeben</h3>
              <ReviewForm profileId={profile.id} />
            </div>
          )}

          {!isOwnProfile && user && hasAlreadyReviewed && (
            <div className="mb-8 bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-2 text-green-800">Bewertung bereits abgegeben</h3>
              <p className="text-green-700">
                Sie haben dieses Profil bereits bewertet. Pro Profil ist nur eine Bewertung möglich.
              </p>
            </div>
          )}
          
          {!isOwnProfile && !user && (
            <div className="mb-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-2 text-blue-800">Bewertung abgeben</h3>
              <p className="text-blue-700">
                Registrieren Sie sich kostenlos, um eine Bewertung für diesen Dienstleister abzugeben.
                <br />
                <a href="/auth" className="text-primary font-medium hover:underline">Jetzt registrieren</a>
              </p>
            </div>
          )}
          
          <div className="space-y-6">
            {reviews.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                Noch keine Bewertungen vorhanden.
              </div>
            ) : (
              reviews.map((review: any) => (
                <Card key={review.id}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-primary-50 text-primary">
                            U
                          </AvatarFallback>
                        </Avatar>
                        <div className="ml-3">
                          <div className="font-medium">
                            Benutzer
                          </div>
                          <div className="text-xs text-gray-500">
                            {formatDate(review.createdAt)}
                          </div>
                        </div>
                      </div>
                      <StarRating rating={review.rating} showText={false} size="sm" />
                    </div>
                    
                    {review.comment && (
                      <div className="mt-3 text-gray-700">
                        {review.comment}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="services" className="pt-6">
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">Hauptdienstleistung</h3>
              <div className="mb-4">
                <Badge variant="outline" className="bg-primary-50 text-primary border-primary px-4 py-2 text-base">
                  {profile.services?.[0] || "Dienstleister"}
                </Badge>
              </div>
              <div className="border-t pt-4">
                <h4 className="font-medium mb-2">Verfügbarkeit</h4>
                <p className="text-gray-600 text-sm">
                  Verfügbar in {typeof profile.regions === 'string' 
                    ? JSON.parse(profile.regions).join(", ")
                    : Array.isArray(profile.regions) 
                      ? profile.regions.join(", ")
                      : "Österreich"
                  }
                </p>
                <p className="text-gray-600 text-sm mt-1">
                  {typeof profile.availablePeriods === 'string' 
                    ? JSON.parse(profile.availablePeriods).join(", ")
                    : Array.isArray(profile.availablePeriods) 
                      ? profile.availablePeriods.join(", ")
                      : "Nach Vereinbarung"
                  }
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
