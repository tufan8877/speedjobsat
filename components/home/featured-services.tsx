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
  ShieldCheck,
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
    <section className="relative overflow-hidden bg-[#f7f9fb] py-12 sm:py-16">
      <div className="pointer-events-none absolute -left-24 top-8 h-56 w-56 rounded-full bg-[#ff6b0b]/8 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 bottom-0 h-56 w-56 rounded-full bg-[#072b4c]/8 blur-3xl" />

      <div className="container relative mx-auto px-4">
        <div className="mb-7 flex flex-col gap-4 sm:mb-9 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#ff6b0b]/15 bg-white px-3.5 py-2 text-xs font-extrabold uppercase tracking-[0.12em] text-[#d94f00] shadow-sm">
              <ShieldCheck className="h-4 w-4" /> Beliebte Kategorien
            </span>
            <h2 className="mt-4 text-3xl font-black leading-tight tracking-[-0.04em] text-[#072b4c] sm:text-4xl">
              Finde die passende <span className="text-[#ff6b0b]">Dienstleistung</span>
            </h2>
            <p className="mt-3 text-base leading-relaxed text-slate-600 sm:text-lg">
              Entdecke aktive Profile aus Handwerk, IT, Nachhilfe und vielen weiteren Bereichen in ganz Österreich.
            </p>
          </div>

          <Link href="/suche" className="hidden shrink-0 items-center gap-2 font-bold text-[#072b4c] transition hover:text-[#ff6b0b] sm:flex">
            Alle Dienstleistungen <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-6">
          {displayedServices.map((service, index) => {
            const count = providerCounts[service] || 0;
            const Icon = serviceIcons[service] || Wrench;

            return (
              <Link
                key={service}
                href={`/suche?service=${encodeURIComponent(service)}`}
                className="group relative min-h-[154px] overflow-hidden rounded-[1.35rem] border border-white bg-white p-4 shadow-[0_10px_30px_rgba(7,43,76,0.07)] transition-all duration-300 hover:-translate-y-1 hover:border-[#ff6b0b]/30 hover:shadow-[0_18px_40px_rgba(7,43,76,0.13)] sm:min-h-[172px] sm:p-5"
              >
                <div className="absolute right-0 top-0 h-20 w-20 translate-x-8 -translate-y-8 rounded-full bg-[#fff2e8] transition-transform duration-300 group-hover:scale-125" />

                <div className="relative flex h-full flex-col">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#fff0e5] text-[#ff6b0b] transition-colors group-hover:bg-[#ff6b0b] group-hover:text-white sm:h-12 sm:w-12">
                      <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
                    </div>
                    <span className="rounded-full bg-[#f2f5f8] px-2 py-1 text-[10px] font-bold text-slate-500 sm:text-xs">
                      {isLoading ? "…" : count}
                    </span>
                  </div>

                  <div className="mt-auto pt-5">
                    <h3 className="text-[15px] font-extrabold leading-snug text-[#072b4c] transition-colors group-hover:text-[#ff6b0b] sm:text-base">
                      {getServiceCategoryLabel(service)}
                    </h3>
                    <p className="mt-1.5 text-xs font-medium text-slate-500">
                      {isLoading ? "Profile werden geladen" : count === 1 ? "1 aktives Profil" : `${count} aktive Profile`}
                    </p>
                  </div>

                  <ArrowRight className="absolute bottom-0 right-0 h-4 w-4 translate-x-2 text-[#ff6b0b] opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100" />
                </div>
              </Link>
            );
          })}
        </div>

        <div className="mt-6 sm:hidden">
          <Link href="/suche">
            <Button className="h-12 w-full rounded-xl bg-[#072b4c] font-bold text-white hover:bg-[#0b3c68]">
              Alle Dienstleistungen ansehen <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>

        <div className="mt-9 grid overflow-hidden rounded-[1.6rem] border border-[#ff6b0b]/10 bg-white shadow-[0_12px_34px_rgba(7,43,76,0.07)] sm:grid-cols-3">
          <div className="px-5 py-5 text-center sm:border-r sm:border-slate-100">
            <p className="text-2xl font-black text-[#072b4c]">{data?.totalProfiles ?? 0}</p>
            <p className="mt-1 text-sm font-medium text-slate-500">Aktive Profile</p>
          </div>
          <div className="border-y border-slate-100 px-5 py-5 text-center sm:border-y-0 sm:border-r">
            <p className="text-xl font-black text-[#072b4c] sm:text-2xl">Ganz Österreich</p>
            <p className="mt-1 text-sm font-medium text-slate-500">In allen Bundesländern</p>
          </div>
          <div className="px-5 py-5 text-center">
            <p className="text-2xl font-black text-[#ff6b0b]">Kostenlos</p>
            <p className="mt-1 text-sm font-medium text-slate-500">Profil erstellen</p>
          </div>
        </div>
      </div>
    </section>
  );
}
