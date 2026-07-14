import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { serviceCategories, getServiceCategoryLabel } from "@shared/schema";
import { ArrowRight, BookOpen, Brush, Code2, Hammer, Languages, Music2, Sparkles, Truck, Wrench } from "lucide-react";

const preferredServices = ["Nachhilfe", "Computer & IT", "Handwerker", "Elektriker", "Reinigung", "Transport"];

type ProfileCountsResponse = {
  counts: Record<string, number>;
  totalProfiles: number;
  generatedAt?: string;
};

const serviceIcons: Record<string, any> = {
  Nachhilfe: BookOpen,
  "Computer & IT": Code2,
  Handwerker: Hammer,
  Elektriker: Wrench,
  Reinigung: Sparkles,
  Transport: Truck,
  Maler: Brush,
  Sprachen: Languages,
  Musik: Music2,
};

export default function FeaturedServices() {
  const { data, isLoading } = useQuery<ProfileCountsResponse>({
    queryKey: ["/api/profile-counts", "live"],
    queryFn: async () => {
      const res = await fetch(`/api/profile-counts?_=${Date.now()}`, {
        credentials: "include",
        cache: "no-store",
        headers: { "Cache-Control": "no-cache", Pragma: "no-cache" },
      });
      if (!res.ok) throw new Error("Profilanzahlen konnten nicht geladen werden");
      return res.json();
    },
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
    refetchInterval: 15000,
    staleTime: 0,
    gcTime: 0,
  });

  const providerCounts = data?.counts || {};

  const displayedServices = useMemo(() => {
    const activeServices = [...serviceCategories]
      .filter((service) => (providerCounts[service] || 0) > 0)
      .sort((a, b) => (providerCounts[b] || 0) - (providerCounts[a] || 0));
    const fallbackServices = preferredServices.filter((service) => serviceCategories.includes(service as any));
    return [...activeServices, ...fallbackServices].filter((service, index, array) => array.indexOf(service) === index).slice(0, 7);
  }, [providerCounts]);

  return (
    <section className="bg-white py-14 sm:py-18">
      <div className="container mx-auto px-4">
        <div className="mb-8 text-center">
          <span className="inline-flex rounded-full bg-[#fff0e5] px-4 py-2 text-sm font-bold text-[#d94f00]">Für jede Fähigkeit die passende Kategorie</span>
          <h2 className="mt-4 text-3xl font-black tracking-[-0.035em] text-[#072b4c] sm:text-4xl">
            Entdecke Dienstleistungen auf <span className="text-[#ff6b0b]">Speedjob.at</span>
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-slate-600">Von Nachhilfe über IT bis Handwerk: Finde passende Profile in deiner Region.</p>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-7">
          {displayedServices.map((service) => {
            const count = providerCounts[service] || 0;
            const Icon = serviceIcons[service] || Wrench;
            return (
              <Link
                key={service}
                href={`/suche?service=${encodeURIComponent(service)}`}
                className="group rounded-2xl border border-slate-200 bg-white p-4 text-center shadow-[0_8px_24px_rgba(7,43,76,0.06)] transition-all hover:-translate-y-1 hover:border-[#ff6b0b]/40 hover:shadow-[0_16px_34px_rgba(7,43,76,0.12)]"
              >
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#fff0e5] text-[#ff6b0b] transition group-hover:bg-[#ff6b0b] group-hover:text-white">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="min-h-10 text-sm font-bold leading-tight text-[#072b4c] group-hover:text-[#ff6b0b]">{getServiceCategoryLabel(service)}</h3>
                <p className="mt-2 text-xs text-slate-500">{isLoading ? "Wird geladen …" : count === 1 ? "1 Profil" : `${count} Profile`}</p>
              </Link>
            );
          })}
        </div>

        <div className="mt-8 text-center">
          <Link href="/suche">
            <Button variant="outline" className="h-12 rounded-xl border-[#072b4c]/20 px-6 font-bold text-[#072b4c] hover:bg-[#072b4c]/5">
              Alle Dienstleistungen ansehen <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>

        <div className="mt-12 grid gap-4 rounded-[1.75rem] border border-[#ff6b0b]/15 bg-gradient-to-r from-[#fff7f1] to-white p-5 sm:grid-cols-3 sm:p-7">
          <div className="text-center sm:border-r sm:border-slate-200"><p className="text-2xl font-black text-[#072b4c]">{data?.totalProfiles ?? 0}</p><p className="text-sm text-slate-600">Aktive Profile</p></div>
          <div className="text-center sm:border-r sm:border-slate-200"><p className="text-2xl font-black text-[#072b4c]">Ganz Österreich</p><p className="text-sm text-slate-600">Alle Bundesländer</p></div>
          <div className="text-center"><p className="text-2xl font-black text-[#ff6b0b]">Kostenlos</p><p className="text-sm text-slate-600">Profil erstellen</p></div>
        </div>
      </div>
    </section>
  );
}
