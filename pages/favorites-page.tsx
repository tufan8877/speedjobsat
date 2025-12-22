import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Profile } from "@shared/schema";
import { Badge } from "@/components/ui/badge";
import { FavoriteButton } from "@/components/favorites/favorite-button";
import { Link } from "wouter";

export default function FavoritesPage() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  
  // Wenn kein Benutzer angemeldet ist, zur Anmeldeseite weiterleiten
  if (!user) {
    navigate("/auth?redirect=/favorites");
    return null;
  }
  
  // Ruft alle Favoriten des Benutzers ab
  const { data: favoriteProfiles, isLoading, error } = useQuery<Profile[]>({
    queryKey: ['/api/favorites'],
    queryFn: async () => {
      const response = await fetch('/api/favorites');
      
      if (!response.ok) {
        throw new Error('Fehler beim Abrufen Ihrer Favoriten');
      }
      
      return response.json();
    }
  });
  
  // Lädt noch
  if (isLoading) {
    return (
      <div className="container py-8">
        <h1 className="text-3xl font-bold mb-8">Meine Favoriten</h1>
        <div className="flex justify-center items-center p-12">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      </div>
    );
  }
  
  // Fehler beim Laden
  if (error) {
    return (
      <div className="container py-8">
        <h1 className="text-3xl font-bold mb-8">Meine Favoriten</h1>
        <div className="text-center p-12">
          <h3 className="text-xl font-semibold mb-2">Fehler beim Laden Ihrer Favoriten</h3>
          <p className="text-muted-foreground">{(error as Error).message}</p>
        </div>
      </div>
    );
  }
  
  // Keine Favoriten gefunden
  if (!favoriteProfiles || favoriteProfiles.length === 0) {
    return (
      <div className="container py-8">
        <h1 className="text-3xl font-bold mb-8">Meine Favoriten</h1>
        <div className="text-center p-12">
          <h3 className="text-xl font-semibold mb-2">Keine Favoriten vorhanden</h3>
          <p className="text-muted-foreground mb-6">
            Sie haben noch keine Dienstleister zu Ihren Favoriten hinzugefügt. 
            Durchsuchen Sie die verfügbaren Dienstleister und fügen Sie sie zu Ihren Favoriten hinzu.
          </p>
          <Link href="/search">
            <Button>Dienstleister suchen</Button>
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-2">Meine Favoriten</h1>
      <p className="text-muted-foreground mb-8">
        Hier finden Sie eine Übersicht Ihrer favorisierten Dienstleister.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {favoriteProfiles.map((profile) => (
          <Card key={profile.id} className="overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex items-start gap-4">
                <Avatar className="h-12 w-12 border">
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {profile.firstName?.charAt(0) || ''}
                    {profile.lastName?.charAt(0) || ''}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-lg">
                    {profile.firstName} {profile.lastName}
                  </CardTitle>
                  <CardDescription className="text-sm mt-1">
                    {profile.services && profile.services.length > 0 ? profile.services.join(", ") : "Keine Dienstleistungen angegeben"}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="pb-3">
              <div className="mb-4">
                <h4 className="text-sm font-semibold mb-1">Tätig in:</h4>
                <div className="flex flex-wrap gap-1">
                  {profile.regions && profile.regions.length > 0 ? (
                    profile.regions.map((region) => (
                      <Badge key={region} variant="outline" className="text-xs">
                        {region}
                      </Badge>
                    ))
                  ) : (
                    <Badge variant="outline" className="text-xs">Keine Region angegeben</Badge>
                  )}
                </div>
              </div>
              
              {profile.description && (
                <div>
                  <h4 className="text-sm font-semibold mb-1">Beschreibung:</h4>
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {profile.description}
                  </p>
                </div>
              )}
            </CardContent>
            
            <CardFooter className="flex justify-between pt-0">
              <Link href={`/providers/${profile.id}`}>
                <Button variant="outline" size="sm">Profil ansehen</Button>
              </Link>
              
              <FavoriteButton profileId={profile.id} />
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}