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
  variant = "outline",
}: FavoriteButtonProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const {
    data: favoriteStatus,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["/api/favorites", profileId],
    queryFn: async () => {
      if (!user) return { isFavorite: false };

      const response = await fetch(`/api/favorites/${profileId}`, {
        credentials: "include",
        headers: {
          "Cache-Control": "no-cache",
        },
      });

      if (!response.ok) {
        throw new Error("Fehler beim Abrufen des Favoriten-Status");
      }

      return response.json();
    },
    enabled: !!user,
  });

  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    if (!user) {
      setIsFavorite(false);
      return;
    }

    if (!isLoading && !isError && favoriteStatus) {
      setIsFavorite(!!favoriteStatus.isFavorite);
    }
  }, [user, favoriteStatus, isLoading, isError]);

  const addFavoriteMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/favorites", { profileId });
      return response.json();
    },
    onMutate: () => {
      setIsFavorite(true);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/favorites"] });
      queryClient.invalidateQueries({ queryKey: ["/api/favorites", profileId] });

      toast({
        title: "Zu Favoriten hinzugefügt",
        description: "Das Profil wurde zu Ihren Favoriten hinzugefügt.",
      });
    },
    onError: (error: any) => {
      setIsFavorite(false);

      toast({
        title: "Fehler beim Hinzufügen zu Favoriten",
        description: error.message || "Bitte versuchen Sie es erneut",
        variant: "destructive",
      });
    },
  });

  const removeFavoriteMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("DELETE", `/api/favorites/${profileId}`);
      return response.json();
    },
    onMutate: () => {
      setIsFavorite(false);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/favorites"] });
      queryClient.invalidateQueries({ queryKey: ["/api/favorites", profileId] });

      toast({
        title: "Aus Favoriten entfernt",
        description: "Das Profil wurde aus Ihren Favoriten entfernt.",
      });
    },
    onError: (error: any) => {
      setIsFavorite(true);

      toast({
        title: "Fehler beim Entfernen aus Favoriten",
        description: error.message || "Bitte versuchen Sie es erneut",
        variant: "destructive",
      });
    },
  });

  const handleToggleFavorite = () => {
    if (!user) {
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

  const isProcessing =
    isLoading ||
    addFavoriteMutation.isPending ||
    removeFavoriteMutation.isPending;

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      onClick={handleToggleFavorite}
      disabled={isProcessing}
      aria-label={isFavorite ? "Aus Favoriten entfernen" : "Zu Favoriten hinzufügen"}
      className="group"
    >
      <Heart
        className={`h-4 w-4 ${isFavorite ? "fill-red-500 text-red-500" : "fill-none group-hover:fill-red-300"}`}
      />
      <span className="ml-2">
        {isFavorite ? "Favorisiert" : "Favorisieren"}
      </span>
    </Button>
  );
}
