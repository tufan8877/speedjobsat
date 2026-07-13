import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { StarRating } from "@/components/ui/star-rating";
import { Separator } from "@/components/ui/separator";
import { Loader2, MapPin, Clock, Mail, Phone, Share2 } from "lucide-react";
import { ReviewForm } from "./review-form";
import VerifiedBadge from "./verified-badge";
import ProfileGallery from "./profile-gallery";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { FavoriteButton } from "@/components/favorites/favorite-button";
import { formatDate } from "@/lib/utils";
import { getServiceCategoryLabel, type Profile } from "@shared/schema";

interface ProviderProfileProps {
  profileId: number;
}

function safeArray(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(String).filter(Boolean);
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed.map(String).filter(Boolean) : [];
    } catch {
      return value.split(",").map((item) => item.trim()).filter(Boolean);
    }
  }
  return [];
}

export default function ProviderProfile({ profileId }: ProviderProfileProps) {
  const { user } = useAuth();
  const { toast } = useToast();

  const { data, isLoading, error } = useQuery<Profile>({
    queryKey: [`/api/profiles/${profileId}`],
  });

  useEffect(() => {
    if (!data) return;

    fetch(`/api/profiles/${profileId}/view`, {
      method: "POST",
      credentials: "include",
      headers: { "content-type": "application/json" },
    }).catch(() => {
      // Die Profilseite bleibt auch erreichbar, falls die Statistik kurz nicht verfügbar ist.
    });
  }, [data, profileId]);

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
  const services = safeArray(profile.services);
  const regions = safeArray(profile.regions);
  const availablePeriods = safeArray(profile.availablePeriods);
  const reviews = Array.isArray(profile.reviews) ? profile.reviews : [];
  const isOwnProfile = user?.id === profile.userId;
  const hasAlreadyReviewed = !!user && reviews.some((review: any) => review.userId === user.id);
  const mainService = getServiceCategoryLabel(services[0] || "Dienstleister");
  const profileNumber = `#${String(profile.id).padStart(6, "0")}`;

  const reviewCount = reviews.length;
  const averageRating = reviews.length > 0
    ? reviews.reduce((sum: number, review: any) => sum + Number(review.rating || 0), 0) / reviews.length
    : null;

  const handleShare = async () => {
    const shareData = {
      title: `${profile.firstName || ""} ${profile.lastName || ""} auf speedjob.at`.trim(),
      text: `${mainService} – Profil ${profileNumber}`,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast({ title: "Link kopiert", description: "Der Profillink wurde in die Zwischenablage kopiert." });
      }
    } catch (shareError: any) {
      if (shareError?.name !== "AbortError") {
        toast({ title: "Teilen nicht möglich", description: "Bitte kopieren Sie den Link aus der Adresszeile.", variant: "destructive" });
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row">
            <div className="md:w-1/3 flex flex-col items-center mb-6 md:mb-0">
              <Avatar className="h-32 w-32 md:h-40 md:w-40">
                <AvatarImage src={profile.profileImage || ""} />
                <AvatarFallback className="text-2xl bg-primary text-white">
                  {profile.firstName?.[0]}{profile.lastName?.[0]}
                </AvatarFallback>
              </Avatar>

              <div className="mt-4 flex flex-col items-center gap-2 text-center">
                <Badge variant="default">{profile.isAvailable ? "Verfügbar" : "Teilweise verfügbar"}</Badge>
                <VerifiedBadge profileId={profile.id} />
                <p className="text-sm font-medium text-gray-500">Profil {profileNumber}</p>
              </div>

              <div className="mt-4 flex w-full max-w-xs gap-2">
                {!isOwnProfile && <FavoriteButton profileId={profile.id} />}
                <Button type="button" variant="outline" className="flex-1" onClick={handleShare}>
                  <Share2 className="h-4 w-4 mr-2" />
                  Teilen
                </Button>
              </div>

              <div className="mt-4 text-center md:hidden w-full">
                <h1 className="text-2xl font-bold">{profile.firstName} {profile.lastName}</h1>
                <p className="text-primary font-medium mt-1">{mainService}</p>
                <div className="mt-2">
                  {averageRating && averageRating > 0 ? (
                    <StarRating rating={averageRating} reviewCount={reviewCount} />
                  ) : (
                    <p className="text-sm text-gray-500">Noch keine Bewertungen</p>
                  )}
                </div>
              </div>
            </div>

            <div className="md:w-2/3 md:pl-8">
              <div className="hidden md:block">
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-3xl font-bold">{profile.firstName} {profile.lastName}</h1>
                  <VerifiedBadge profileId={profile.id} compact />
                </div>
                <p className="text-primary font-medium text-lg mt-1">{mainService}</p>
                <div className="mt-2">
                  {averageRating && averageRating > 0 ? (
                    <StarRating rating={averageRating} reviewCount={reviewCount} size="lg" />
                  ) : (
                    <p className="text-sm text-gray-500">Noch keine Bewertungen</p>
                  )}
                </div>
              </div>

              <Separator className="my-4" />

              <div className="space-y-3">
                <div className="flex items-center text-gray-700">
                  <MapPin className="h-5 w-5 mr-2 flex-shrink-0" />
                  <span>{regions.length > 0 ? regions.join(", ") : "Österreich"}</span>
                </div>

                <div className="flex items-center text-gray-700">
                  <Clock className="h-5 w-5 mr-2 flex-shrink-0" />
                  <span>{availablePeriods.length > 0 ? availablePeriods.join(", ") : "Nach Vereinbarung"}</span>
                </div>

                {user && profile.email && (
                  <div className="flex items-center text-gray-700">
                    <Mail className="h-5 w-5 mr-2 flex-shrink-0" />
                    <a href={`mailto:${profile.email}`} className="hover:text-primary break-all sm:break-normal">
                      {profile.email}
                    </a>
                    <span className="ml-2 text-xs text-gray-500">Hauptkontakt</span>
                  </div>
                )}

                {user && profile.phoneNumber && (
                  <div className="flex items-center text-gray-700">
                    <Phone className="h-5 w-5 mr-2 flex-shrink-0" />
                    <a href={`tel:${profile.phoneNumber}`} className="hover:text-primary">
                      {profile.phoneNumber}
                    </a>
                    <span className="ml-2 text-xs text-gray-500">optional</span>
                  </div>
                )}

                {!user && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-2">
                    <p className="text-sm text-blue-800">
                      💡 <strong>Kontaktdaten verfügbar:</strong> Registrieren Sie sich kostenlos, um die Kontaktdaten zu sehen.
                      <br />
                      <a href="/auth" className="text-primary font-medium hover:underline">Jetzt registrieren</a>
                    </p>
                  </div>
                )}
              </div>

              <div className="mt-6 flex flex-wrap gap-2">
                {services.map((service: string) => (
                  <Badge key={service} variant="outline" className="bg-primary-50 text-primary border-primary">
                    {getServiceCategoryLabel(service)}
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

      <ProfileGallery profileId={profile.id} />

      <section className="mt-8">
        <div className="w-full rounded-md border bg-white px-4 py-3 text-center text-base font-medium shadow-sm">
          Bewertungen ({reviewCount})
        </div>

        <div className="pt-6">
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
                          <AvatarFallback className="bg-primary-50 text-primary">U</AvatarFallback>
                        </Avatar>
                        <div className="ml-3">
                          <div className="font-medium">Benutzer</div>
                          <div className="text-xs text-gray-500">{formatDate(review.createdAt)}</div>
                        </div>
                      </div>
                      <StarRating rating={review.rating} showText={false} size="sm" />
                    </div>

                    {review.comment && (
                      <div className="mt-3 text-gray-700">{review.comment}</div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
