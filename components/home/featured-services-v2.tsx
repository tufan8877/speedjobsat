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
  Leaf,
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
  Maler: Brush,
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
};

export default function FeaturedServicesV2() {
  const { data, isLoading } = useQuery<ProfileCountsResponse>({
    queryKey: ["/api/profile-counts", "featured-v2"],
    queryFn: async () => {
      const response = await fetch(`/api/profile-counts?_=${Date.now()}`, {
        credentials: "include",
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("Profilanzahlen konnten nicht geladen werden");
      }

      return response.json();
    },
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
    refetchInterval: 15000,
    staleTime: 0,
  });

  const counts = data?.counts || {};

  const displayedServices = useMemo(() => {
    const activeServices = [...serviceCategories]
      .filter((service) => (counts[service] || 0) > 0)
      .sort((a, b) => (counts[b] || 0) - (counts[a] || 0));

    const fallbacks = preferredServices.filter((service) =>
      serviceCategories.includes(service as (typeof serviceCategories)[number]),
    );

    return [...activeServices, ...fallbacks]
      .filter((service, index, items) => items.indexOf(service) === index)
      .slice(0, 6);
  }, [counts]);

  return (
    <section className="relative overflow-hidden bg-[#072b4c] py-14 text-white sm:py-18">
      <div className="absolute -left-24 top-0 h-72 w-72 rounded-full bg-[#ff6b0b]/20 blur-3xl" />
      <div className="absolute -right-24 bottom-0 h-72 w-72 rounded-full bg-white/5 blur-3xl" />

      <div className="container relative mx-auto px-4">
        <div className="mb-9 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <span className="inline-flex items-center rounded-full border border-[#ff6b0b]/40 bg-[#ff6b0b]/15 px-4 py-2 text-xs font-black uppercase tracking-[0.16em] text-[#ff9a57]">
              Beliebte Kategorien
            </span>
            <h2 className="mt-5 text-3xl font-black leading-tight tracking-[-0.04em] sm:text-4xl">
              Finde genau die <span className="text-[#ff6b0b]">Dienstleistung</span>, die du suchst.
            </h2>
            <p className="mt-3 max-w-xl text-base leading-relaxed text-white/70 sm:text-lg">
              Entdecke aktive Profile aus Handwerk, IT, Nachhilfe, Haushalt und vielen weiteren Bereichen in ganz Österreich.
            </p>
          </div>

          <Link href="/suche" className="hidden items-center gap-2 font-bold text-white transition hover:text-[#ff8a3d] sm:flex">
            Alle Dienstleistungen <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-6">
          {displayedServices.map((service) => {
            const count = counts[service] || 0;
            const Icon = serviceIcons[service] || Wrench;

            return (
              <Link
                key={service}
                href={`/suche?service=${encodeURIComponent(service)}`}
                className="group relative min-h-[168px] overflow-hidden rounded-[1.5rem] border border-white/10 bg-white p-4 text-[#072b4c] shadow-[0_18px_45px_rgba(0,0,0,0.16)] transition-all duration-300 hover:-translate-y-1 hover:border-[#ff6b0b] hover:shadow-[0_22px_55px_rgba(0,0,0,0.24)] sm:min-h-[184px] sm:p-5"
              >
                <div className="absolute right-0 top-0 h-24 w-24 translate-x-10 -translate-y-10 rounded-full bg-[#fff1e8] transition-transform duration-300 group-hover:scale-125" />

                <div className="relative flex h-full flex-col">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#fff0e5] text-[#ff6b0b] transition-colors group-hover:bg-[#ff6b0b] group-hover:text-white">
                      <Icon className="h-6 w-6" />
                    </div>
                    <span className="rounded-full bg-[#072b4c] px-2.5 py-1 text-[11px] font-black text-white">
                      {isLoading ? "…" : count}
                    </span>
                  </div>

                  <div className="mt-auto pt-6">
                    <h3 className="text-[15px] font-black leading-snug sm:text-base">
                      {getServiceCategoryLabel(service)}
                    </h3>
                    <p className="mt-1.5 text-xs font-semibold text-slate-500">
                      {isLoading ? "Profile werden geladen" : count === 1 ? "1 aktives Profil" : `${count} aktive Profile`}
                    </p>
                  </div>

                  <div className="mt-4 flex items-center justify-between text-xs font-black text-[#ff6b0b]">
                    <span>Anzeigen</span>
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        <div className="mt-7 sm:hidden">
          <Link href="/suche">
            <Button className="h-13 w-full rounded-xl bg-[#ff6b0b] font-black text-white hover:bg-[#ea5c00]">
              Alle Dienstleistungen entdecken <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>

        <div className="mt-10 grid overflow-hidden rounded-[1.75rem] border border-white/10 bg-white/8 backdrop-blur sm:grid-cols-3">
          <div className="px-5 py-6 text-center sm:border-r sm:border-white/10">
            <p className="text-2xl font-black text-white">{data?.totalProfiles ?? 0}</p>
            <p className="mt-1 text-sm font-semibold text-white/60">Aktive Profile</p>
          </div>
          <div className="border-y border-white/10 px-5 py-6 text-center sm:border-y-0 sm:border-r">
            <p className="text-xl font-black text-white sm:text-2xl">Ganz Österreich</p>
            <p className="mt-1 text-sm font-semibold text-white/60">Alle Bundesländer</p>
          </div>
          <div className="px-5 py-6 text-center">
            <p className="text-2xl font-black text-[#ff6b0b]">Kostenlos</p>
            <p className="mt-1 text-sm font-semibold text-white/60">Profil erstellen</p>
          </div>
        </div>
      </div>
    </section>
  );
}
