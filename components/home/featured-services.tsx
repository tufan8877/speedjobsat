import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { serviceCategories, getServiceCategoryLabel } from "@shared/schema";
import {
  ArrowRight,
  BookOpen,
  Brush,
  Car,
  ChefHat,
  Code2,
  Hammer,
  HeartHandshake,
  House,
  Laptop,
  Leaf,
  Paintbrush,
  PlugZap,
  Sparkles,
  Truck,
  UsersRound,
  Wrench,
} from "lucide-react";

const preferredServices = [
  "Installateur",
  "Elektriker",
  "Reinigung",
  "Nachhilfe",
  "Computer & IT",
  "Gartenpflege",
];

type ProfileCountsResponse = {
  counts: Record<string, number>;
  totalProfiles: number;
  generatedAt?: string;
};

const serviceIcons: Record<string, any> = {
  Installateur: Wrench,
  Elektriker: PlugZap,
  Reinigung: Sparkles,
  Umzug: House,
  Transport: Truck,
  Gartenpflege: Leaf,
  Haushaltshilfe: HeartHandshake,
  Pflege: HeartHandshake,
  Kinderbetreuung: UsersRound,
  Seniorenbetreuung: UsersRound,
  Nachhilfe: BookOpen,
  "Computer & IT": Code2,
  Handwerker: Hammer,
  Maler: Paintbrush,
  Dachdecker: House,
  Automechaniker: Car,
  Schlosser: Wrench,
  Gastronomie: ChefHat,
  "Koch- & Küchenhilfe": ChefHat,
  "Service & Kellnerarbeiten": UsersRound,
  Bauarbeiten: Hammer,
  Fliesenlegerarbeiten: Brush,
  Bodenlegerarbeiten: Hammer,
  Montagearbeiten: Wrench,
  Reparaturarbeiten: Wrench,
  "Sonstige Dienstleistungen": Laptop,
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
      .sort((a, b) => {
        const countDifference = (providerCounts[b] || 0) - (providerCounts[a] || 0);
        if (countDifference !== 0) return countDifference;
        return serviceCategories.indexOf(a) - serviceCategories.indexOf(b);
      });

    const fallbackServices = preferredServices.filter((service) =>
      serviceCategories.includes(service as (typeof serviceCategories)[number]),
    );

    return [...activeServices, ...fallbackServices]
      .filter((service, index, items) => items.indexOf(service) === index)
      .slice(0, 6);
  }, [providerCounts]);

  return (
    <section className="relative overflow-hidden bg-[#072b4c] py-14 sm:py-20">
      <div className="pointer-events-none absolute -left-24 top-0 h-72 w-72 rounded-full bg-[#ff6b0b]/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 bottom-0 h-72 w-72 rounded-full bg-white/10 blur-3xl" />

      <div className="container relative mx-auto px-4">
        <div className="mb-8 flex flex-col gap-5 sm:mb-10 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <span className="inline-flex items-center rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-extrabold uppercase tracking-[0.14em] text-[#ffb27f] backdrop-blur">
              Beliebte Kategorien
            </span>
            <h2 className="mt-4 text-3xl font-black leading-tight tracking-[-0.04em] text-white sm:text-5xl">
              Finde genau die Dienstleistung,
              <span className="block text-[#ff6b0b]">die du suchst.</span>
            </h2>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-slate-300 sm:text-lg">
              Aktive Profile aus Handwerk, IT, Nachhilfe, Reinigung und vielen weiteren Bereichen in ganz Österreich.
            </p>
          </div>

          <Link
            href="/suche"
            className="hidden shrink-0 items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-5 py-3 font-bold text-white transition hover:border-[#ff6b0b] hover:bg-[#ff6b0b] sm:flex"
          >
            Alle Dienstleistungen <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 lg:grid-cols-6">
          {displayedServices.map((service) => {
            const count = providerCounts[service] || 0;
            const Icon = serviceIcons[service] || Wrench;

            return (
              <Link
                key={service}
                href={`/suche?service=${encodeURIComponent(service)}`}
                className="group relative min-h-[168px] overflow-hidden rounded-[1.4rem] border border-white/10 bg-white p-4 shadow-[0_18px_50px_rgba(0,0,0,0.18)] transition-all duration-300 hover:-translate-y-1.5 hover:border-[#ff6b0b] hover:shadow-[0_24px_60px_rgba(0,0,0,0.28)] sm:min-h-[190px] sm:p-5"
              >
                <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-[#fff0e5] transition-transform duration-300 group-hover:scale-125" />

                <div className="relative flex h-full flex-col">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#ff6b0b] text-white shadow-[0_8px_20px_rgba(255,107,11,0.3)] sm:h-14 sm:w-14">
                      <Icon className="h-6 w-6 sm:h-7 sm:w-7" />
                    </div>
                    <span className="rounded-full bg-[#072b4c] px-2.5 py-1 text-[10px] font-extrabold text-white sm:text-xs">
                      {isLoading ? "…" : count}
                    </span>
                  </div>

                  <div className="mt-auto pt-6">
                    <h3 className="text-[15px] font-black leading-snug text-[#072b4c] transition-colors group-hover:text-[#ff6b0b] sm:text-base">
                      {getServiceCategoryLabel(service)}
                    </h3>
                    <p className="mt-2 text-xs font-semibold text-slate-500">
                      {isLoading ? "Profile werden geladen" : count === 1 ? "1 aktives Profil" : `${count} aktive Profile`}
                    </p>
                  </div>

                  <div className="mt-4 flex items-center gap-1 text-xs font-bold text-[#ff6b0b] opacity-100 sm:opacity-0 sm:transition-opacity sm:group-hover:opacity-100">
                    Anzeigen <ArrowRight className="h-3.5 w-3.5" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        <div className="mt-7 sm:hidden">
          <Link href="/suche">
            <Button className="h-13 w-full rounded-xl bg-[#ff6b0b] font-bold text-white shadow-[0_12px_26px_rgba(255,107,11,0.28)] hover:bg-[#ea5c00]">
              Alle Dienstleistungen entdecken <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>

        <div className="mt-10 grid overflow-hidden rounded-[1.6rem] border border-white/10 bg-white/10 text-white backdrop-blur sm:grid-cols-3">
          <div className="px-5 py-6 text-center sm:border-r sm:border-white/10">
            <p className="text-3xl font-black">{data?.totalProfiles ?? 0}</p>
            <p className="mt-1 text-sm font-medium text-slate-300">Aktive Profile</p>
          </div>
          <div className="border-y border-white/10 px-5 py-6 text-center sm:border-y-0 sm:border-r">
            <p className="text-2xl font-black">Ganz Österreich</p>
            <p className="mt-1 text-sm font-medium text-slate-300">Alle Bundesländer</p>
          </div>
          <div className="px-5 py-6 text-center">
            <p className="text-3xl font-black text-[#ff6b0b]">Kostenlos</p>
            <p className="mt-1 text-sm font-medium text-slate-300">Profil erstellen</p>
          </div>
        </div>
      </div>
    </section>
  );
}
