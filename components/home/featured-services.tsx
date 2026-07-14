import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { serviceCategories, getServiceCategoryLabel } from "@shared/schema";

type ProfileForCount = {
  id?: number;
  services?: string[] | string | null;
};

const preferredServices = [
  "Installateur",
  "Elektriker",
  "Reinigung",
  "Transport",
  "Computer & IT",
  "Handwerker",
];

function ServiceToolboxIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M10 6V5a2 2 0 0 1 2-2h0a2 2 0 0 1 2 2v1" />
      <rect x="3" y="6" width="18" height="14" rx="2" />
      <path d="M3 12h18" />
      <path d="M12 12v3" />
    </svg>
  );
}

function safeArray(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(String).filter(Boolean);
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) return parsed.map(String).filter(Boolean);
    } catch {
      return value.split(",").map((item) => item.trim()).filter(Boolean);
    }
  }
  return [];
}

function countProvidersByService(profiles: ProfileForCount[]) {
  const counts: Record<string, number> = {};

  for (const profile of profiles) {
    const uniqueServices = new Set(safeArray(profile.services));
    for (const service of uniqueServices) {
      counts[service] = (counts[service] || 0) + 1;
    }
  }

  return counts;
}

export default function FeaturedServices() {
  const { data } = useQuery<{ profiles: ProfileForCount[] }>({
    queryKey: ["/api/profiles", "service-counts-live"],
    queryFn: async () => {
      const res = await fetch("/api/profiles?pageSize=1000&page=1", {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Dienstleister konnten nicht geladen werden");
      return res.json();
    },
    refetchInterval: 5000,
  });

  const providerCounts = useMemo(() => countProvidersByService(data?.profiles || []), [data?.profiles]);
  const displayedServices = useMemo(() => {
    const activeServices = [...serviceCategories]
      .filter((service) => (providerCounts[service] || 0) > 0)
      .sort((a, b) => {
        const countDiff = (providerCounts[b] || 0) - (providerCounts[a] || 0);
        if (countDiff !== 0) return countDiff;
        return serviceCategories.indexOf(a) - serviceCategories.indexOf(b);
      });

    const fallbackServices = preferredServices.filter((service) =>
      serviceCategories.includes(service as (typeof serviceCategories)[number]),
    );

    return [...activeServices, ...fallbackServices]
      .filter((service, index, array) => array.indexOf(service) === index)
      .slice(0, 6);
  }, [providerCounts]);

  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-3 mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold font-title">Kategorien auf speedjob.at</h2>
            <p className="text-gray-600 mt-2 max-w-2xl">
              Von Handwerk bis IT: Nutzer können gezielt nach Dienstleistung und Bundesland suchen.
            </p>
          </div>
          <Link href="/suche" className="text-primary hover:underline font-medium hidden md:flex items-center">
            Alle anzeigen
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-1"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6">
          {displayedServices.map((service) => {
            const count = providerCounts[service] || 0;

            return (
              <Link
                key={service}
                href={`/suche?service=${encodeURIComponent(service)}`}
                className="group bg-gray-50 hover:bg-gray-100 rounded-xl p-4 text-center transition"
              >
                <div className="w-12 h-12 bg-primary-50 rounded-full flex items-center justify-center text-primary mx-auto mb-3 group-hover:bg-primary/10 transition">
                  <ServiceToolboxIcon />
                </div>
                <h3 className="font-medium text-gray-800 group-hover:text-primary">{getServiceCategoryLabel(service)}</h3>
                <p className="text-sm text-gray-500 mt-1">
                  {count > 0 ? `${count} ${count === 1 ? "Profil" : "Profile"}` : "Kategorie ansehen"}
                </p>
              </Link>
            );
          })}
        </div>

        <div className="mt-6 text-center md:hidden">
          <Link href="/suche">
            <Button variant="link" className="text-primary hover:underline font-medium">
              Alle anzeigen
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-1"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
