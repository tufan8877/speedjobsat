import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { serviceCategories } from "@shared/schema";

const serviceIcons = {
  "Installateur": <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="14 5 14 9"/><line x1="16" x2="16" y1="7" y2="9"/><path d="M17 11h3a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1h-3a1 1 0 0 1-1-1v-2a1 1 0 0 1 1-1Z"/><path d="M12 15v3a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1Z"/><path d="M5 11H3a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1Z"/><path d="M10 7v4"/><path d="M4 7v4"/><path d="M14 3v4"/></svg>,
  "Elektriker": <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 3v4"/><path d="M14 3v4"/><path d="M10 3v4"/><path d="M6 3v4"/><path d="M18 21v-4"/><path d="M14 21v-4"/><path d="M10 21v-4"/><path d="M6 21v-4"/><rect width="16" height="10" x="4" y="7" rx="2"/></svg>,
  "Reinigung": <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 11 18-5"/><path d="m3 11 3 9h4.3a2 2 0 0 0 1.7-1l4-7a2 2 0 0 1 1.7-1H21"/><path d="m3 11 9 3"/></svg>,
  "Umzug": <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 18V6a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v12"/><path d="M10 20v2h4v-2"/><path d="M12 2h2a2 2 0 0 1 2 2v2"/><path d="M7 8h10"/><path d="M7 12h10"/><circle cx="9" cy="16" r="1"/><circle cx="15" cy="16" r="1"/></svg>,
  "Transport": <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 6v6"/><path d="M15 6v6"/><path d="M2 12h19.6"/><path d="M18 18h3s.5-1.7.8-2.8c.1-.4.2-.8.2-1.2 0-.4-.1-.8-.2-1.2L21 10"/><path d="M5 18H2s-.5-1.7-.8-2.8c-.1-.4-.2-.8-.2-1.2 0-.4.1-.8.2-1.2L2 10"/><circle cx="7" cy="18" r="2"/><circle cx="17" cy="18" r="2"/></svg>,
  "Gartenpflege": <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 22c1.25-.987 2.36-1.89 4-2a3.41 3.41 0 0 1 2.41.938c.263.211.559.38.876.487a2.59 2.59 0 0 0 1.02.085 2.43 2.43 0 0 0 1.49-.79A3.46 3.46 0 0 1 14.21 20c1.64.11 2.75 1.013 4 2"/><path d="M2 16c1.25-.987 2.36-1.89 4-2a3.41 3.41 0 0 1 2.41.938c.263.211.559.38.876.487a2.59 2.59 0 0 0 1.02.085 2.43 2.43 0 0 0 1.49-.79A3.46 3.46 0 0 1 14.21 14c1.64.11 2.75 1.013 4 2"/><path d="m7 16 3-2"/><path d="M7 20v-4"/></svg>,
};

type ProfileForCount = {
  id?: number;
  services?: string[] | string | null;
};

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
    return [...serviceCategories]
      .filter((service) => (providerCounts[service] || 0) > 0)
      .sort((a, b) => {
        const countDiff = (providerCounts[b] || 0) - (providerCounts[a] || 0);
        if (countDiff !== 0) return countDiff;
        return serviceCategories.indexOf(a) - serviceCategories.indexOf(b);
      })
      .slice(0, 6);
  }, [providerCounts]);

  if (displayedServices.length === 0) {
    return null;
  }

  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold font-title">Beliebte Dienstleistungen</h2>
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
                <div className="w-12 h-12 bg-primary-50 rounded-full flex items-center justify-center text-primary mx-auto mb-3">
                  {serviceIcons[service as keyof typeof serviceIcons] || serviceIcons["Installateur"]}
                </div>
                <h3 className="font-medium text-gray-800 group-hover:text-primary">{service}</h3>
                <p className="text-sm text-gray-500 mt-1">
                  {count} {count === 1 ? "Anbieter" : "Anbieter"}
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
