import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";

interface FavoriteButtonProps {
  profileId: number;
  size?: "sm" | "default" | "lg";
  variant?: "default" | "secondary" | "outline" | "ghost";
}

export function FavoriteButton({ 
  profileId,
  size = "default", 
  variant = "outline"
}: FavoriteButtonProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Prüft, ob das Profil bereits favorisiert ist
  const { 
    data: favoriteStatus,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['/api/favorites', profileId],
    queryFn: async () => {
      if (!user) return { isFavorite: false };
      
      const response = await fetch(`/api/favorites/${profileId}`);
      
      if (!response.ok) {
        throw new Error('Fehler beim Abrufen des Favoriten-Status');
      }
      
      return response.json();
    },
    enabled: !!user // Nur ausführen, wenn ein Benutzer angemeldet ist
  });
  
  // Lokaler State für optimistisches UI-Update
  const [isFavorite, setIsFavorite] = useState(false);
  
  useEffect(() => {
    if (!isLoading && !isError && favoriteStatus) {
      setIsFavorite(favoriteStatus.isFavorite);
    }
  }, [favoriteStatus, isLoading, isError]);
  
  // Mutation zum Hinzufügen eines Favoriten
  const addFavoriteMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/favorites", { profileId });
    },
    onMutate: () => {
      // Optimistisches Update
      setIsFavorite(true);
    },
    onSuccess: () => {
      // Cache invalidieren
      queryClient.invalidateQueries({ queryKey: ['/api/favorites'] });
      queryClient.invalidateQueries({ queryKey: ['/api/favorites', profileId] });
      
      // Erfolgsmeldung anzeigen
      toast({
        title: "Zu Favoriten hinzugefügt",
        description: "Das Profil wurde zu Ihren Favoriten hinzugefügt.",
      });
    },
    onError: (error: any) => {
      // Zurücksetzen bei Fehler
      setIsFavorite(false);
      
      // Fehlermeldung anzeigen
      toast({
        title: "Fehler beim Hinzufügen zu Favoriten",
        description: error.message || "Bitte versuchen Sie es erneut",
        variant: "destructive",
      });
    }
  });
  
  // Mutation zum Entfernen eines Favoriten
  const removeFavoriteMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("DELETE", `/api/favorites/${profileId}`);
    },
    onMutate: () => {
      // Optimistisches Update
      setIsFavorite(false);
    },
    onSuccess: () => {
      // Cache invalidieren
      queryClient.invalidateQueries({ queryKey: ['/api/favorites'] });
      queryClient.invalidateQueries({ queryKey: ['/api/favorites', profileId] });
      
      // Erfolgsmeldung anzeigen
      toast({
        title: "Aus Favoriten entfernt",
        description: "Das Profil wurde aus Ihren Favoriten entfernt.",
      });
    },
    onError: (error: any) => {
      // Zurücksetzen bei Fehler
      setIsFavorite(true);
      
      // Fehlermeldung anzeigen
      toast({
        title: "Fehler beim Entfernen aus Favoriten",
        description: error.message || "Bitte versuchen Sie es erneut",
        variant: "destructive",
      });
    }
  });
  
  // Handling für Klick auf Favoriten-Button
  const handleToggleFavorite = () => {
    if (!user) {
      // Benutzer ist nicht angemeldet, zur Anmeldeseite weiterleiten
      toast({
        title: "Anmeldung erforderlich",
        description: "Sie müssen angemeldet sein, um Favoriten zu verwenden.",
        variant: "default",
      });
      return;
    }
    
    if (isFavorite) {
      removeFavoriteMutation.mutate();
    } else {
      addFavoriteMutation.mutate();
    }
  };
  
  // Verarbeitung läuft
  const isProcessing = 
    isLoading || 
    addFavoriteMutation.isPending || 
    removeFavoriteMutation.isPending;
  
  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleToggleFavorite}
      disabled={isProcessing}
      aria-label={isFavorite ? "Aus Favoriten entfernen" : "Zu Favoriten hinzufügen"}
      className="group"
    >
      <Heart 
        className={`h-4 w-4 ${isFavorite ? 'fill-red-500 text-red-500' : 'fill-none group-hover:fill-red-300'}`} 
      />
      <span className="ml-2">
        {isFavorite ? "Favorisiert" : "Favorisieren"}
      </span>
    </Button>
  );
}