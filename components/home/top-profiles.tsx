import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Award, Eye, Flame, Loader2, MapPin, Star } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { StarRating } from "@/components/ui/star-rating";
import { getServiceCategoryLabel } from "@shared/schema";

interface TopProfile {
  id: number;
  firstName?: string | null;
  lastName?: string | null;
  profileImage?: string | null;
  services?: string[] | string | null;
  regions?: string[] | string | null;
  averageRating?: number;
  reviewCount?: number;
  viewCount?: number;
}

interface TopProfilesResponse {
  topRated: TopProfile[];
  mostViewed: TopProfile[];
  newest: TopProfile[];
}

type Category = "topRated" | "mostViewed" | "newest";

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

const categoryConfig: Record<Category, { label: string; empty: string }> = {
  topRated: {
    label: "Top bewertet",
    empty: "Sobald erste Bewertungen vorhanden sind, erscheinen hier die bestbewerteten Profile.",
  },
  mostViewed: {
    label: "Meist angesehen",
    empty: "Sobald Profile häufiger angesehen werden, erscheinen sie hier.",
  },
  newest: {
    label: "Neu",
    empty: "Noch keine neuen Profile vorhanden.",
  },
};

export default function TopProfiles() {
  const [category, setCategory] = useState<Category>("newest");
  const { data, isLoading, error } = useQuery<TopProfilesResponse>({
    queryKey: ["/api/top-profiles"],
    queryFn: async () => {
      const response = await fetch("/api/top-profiles", { credentials: "include" });
      if (!response.ok) throw new Error("Top-Profile konnten nicht geladen werden");
      return response.json();
    },
    staleTime: 60_000,
  });

  const profiles = data?.[category] || [];

  return (
    <section className="py-10 sm:py-14 bg-white">
      <div className="container mx-auto px-4">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent text-secondary">
                <Award className="h-5 w-5" />
              </div>
              <h2 className="font-title text-2xl font-black text-primary sm:text-3xl">Top Profile</h2>
            </div>
            <p className="text-slate-600 mt-2">Entdecke gut bewertete, häufig angesehene und neue Profile.</p>
          </div>
          <Link href="/suche">
            <Button variant="outline" className="w-full rounded-xl border-primary/20 font-bold text-primary hover:bg-primary/5 sm:w-auto">
              Alle Profile ansehen
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-3 gap-1.5 mb-6 rounded-2xl bg-accent/60 p-1.5">
          <button type="button" onClick={() => setCategory("topRated")} className={`flex items-center justify-center gap-1.5 rounded-xl px-2 py-3 text-xs font-bold transition sm:text-sm ${category === "topRated" ? "bg-white text-primary shadow-sm" : "text-primary/50"}`}>
            <Star className="h-4 w-4" />Top bewertet
          </button>
          <button type="button" onClick={() => setCategory("mostViewed")} className={`flex items-center justify-center gap-1.5 rounded-xl px-2 py-3 text-xs font-bold transition sm:text-sm ${category === "mostViewed" ? "bg-white text-primary shadow-sm" : "text-primary/50"}`}>
            <Eye className="h-4 w-4" />Meist angesehen
          </button>
          <button type="button" onClick={() => setCategory("newest")} className={`flex items-center justify-center gap-1.5 rounded-xl px-2 py-3 text-xs font-bold transition sm:text-sm ${category === "newest" ? "bg-white text-primary shadow-sm" : "text-primary/50"}`}>
            <Flame className="h-4 w-4" />Neu
          </button>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-16"><Loader2 className="h-9 w-9 animate-spin text-secondary" /></div>
        ) : error ? (
          <Card className="rounded-2xl border-slate-100"><CardContent className="p-6 text-center text-slate-600">Top-Profile konnten gerade nicht geladen werden.</CardContent></Card>
        ) : profiles.length === 0 ? (
          <Card className="rounded-2xl border-slate-100"><CardContent className="p-6 text-center text-slate-600">{categoryConfig[category].empty}</CardContent></Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {profiles.map((profile) => {
              const services = safeArray(profile.services);
              const regions = safeArray(profile.regions);
              return (
                <Card key={`${category}-${profile.id}`} className="overflow-hidden rounded-2xl border-slate-100 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg">
                  <CardContent className="p-5">
                    <div className="flex items-start gap-3">
                      <Avatar className="h-14 w-14 flex-shrink-0">
                        <AvatarImage src={profile.profileImage || undefined} />
                        <AvatarFallback className="bg-primary text-white">{profile.firstName?.[0] || "D"}{profile.lastName?.[0] || ""}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-bold text-primary truncate">{profile.firstName} {profile.lastName}</h3>
                        <p className="text-sm font-semibold text-secondary truncate">{services[0] ? getServiceCategoryLabel(services[0]) : "Dienstleistung"}</p>
                        <div className="mt-1">{profile.reviewCount ? <StarRating rating={profile.averageRating || 0} reviewCount={profile.reviewCount} size="sm" /> : <span className="text-xs text-slate-500">Noch keine Bewertungen</span>}</div>
                      </div>
                    </div>
                    <div className="mt-4 flex items-center text-sm text-slate-500"><MapPin className="h-4 w-4 mr-2 flex-shrink-0 text-secondary" /><span className="truncate">{regions.length ? regions.join(", ") : "Österreich"}</span></div>
                    <div className="mt-4 flex items-center justify-between gap-2">
                      {category === "mostViewed" && <span className="inline-flex items-center rounded-full bg-accent px-2.5 py-1 text-xs font-bold text-secondary"><Eye className="h-3 w-3 mr-1" />{profile.viewCount || 0} Aufrufe</span>}
                      {category === "newest" && <span className="inline-flex items-center rounded-full bg-accent px-2.5 py-1 text-xs font-bold text-secondary">Neu</span>}
                      {category === "topRated" && <span className="inline-flex items-center rounded-full bg-accent px-2.5 py-1 text-xs font-bold text-secondary">Top bewertet</span>}
                    </div>
                    <Link href={`/anbieter/${profile.id}`}><Button className="w-full mt-4 rounded-xl font-bold">Profil ansehen</Button></Link>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
