import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import {
  BookOpen,
  CheckCircle2,
  Globe2,
  HeartHandshake,
  Laptop,
  MapPin,
  MoreHorizontal,
  Music2,
  PenTool,
  Users,
  Wrench,
} from "lucide-react";

const categories = [
  { icon: BookOpen, label: "Nachhilfe & Unterricht", href: "/suche?service=Nachhilfe" },
  { icon: Laptop, label: "IT & Technik", href: "/suche?service=Computer%20%26%20IT" },
  { icon: PenTool, label: "Design & Medien", href: "/suche" },
  { icon: Wrench, label: "Handwerk & Technik", href: "/suche?service=Handwerker" },
  { icon: Music2, label: "Musik & Kunst", href: "/suche" },
  { icon: HeartHandshake, label: "Haushalt & Betreuung", href: "/suche?service=Haushaltshilfe" },
  { icon: Globe2, label: "Sprachen & Übersetzung", href: "/suche" },
  { icon: MoreHorizontal, label: "Und viele mehr", href: "/suche" },
];

type ProfileCountsResponse = { totalProfiles: number };

export default function PlatformCategories() {
  const { data: profileCounts } = useQuery<ProfileCountsResponse>({
    queryKey: ["/api/profile-counts"],
    queryFn: async () => {
      const res = await fetch("/api/profile-counts", { credentials: "include" });
      if (!res.ok) throw new Error("Profilanzahlen konnten nicht geladen werden");
      return res.json();
    },
    staleTime: 60_000,
  });

  const stats = [
    {
      icon: Users,
      value: profileCounts ? `${profileCounts.totalProfiles}` : "–",
      label: "Registrierte Dienstleister",
      href: null,
    },
    {
      icon: MapPin,
      value: "Ganz Österreich",
      label: "Wien, Graz, Linz & mehr",
      href: null,
    },
    {
      icon: CheckCircle2,
      value: "100% Kostenlos",
      label: "Jetzt Profil erstellen",
      href: "/auth?tab=register",
    },
  ];

  return (
    <section className="px-4 pb-12 sm:pb-16">
      <div className="container mx-auto">
        <div className="overflow-hidden rounded-[1.75rem] border border-slate-100 bg-white shadow-[0_18px_50px_rgba(7,43,76,0.08)]">
          <div className="px-5 py-8 sm:px-8 sm:py-10">
            <h2 className="font-title text-center text-2xl font-black text-primary sm:text-3xl">
              Finde das <span className="text-secondary">passende Profil</span>
            </h2>

            <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-4 lg:grid-cols-8">
              {categories.map(({ icon: Icon, label, href }) => (
                <Link key={label} href={href} className="group flex flex-col items-center text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent text-primary transition-colors group-hover:bg-secondary group-hover:text-white">
                    <Icon className="h-7 w-7" strokeWidth={1.75} />
                  </div>
                  <p className="mt-3 text-sm font-bold leading-snug text-primary">{label}</p>
                </Link>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-y-6 border-t border-slate-100 bg-accent/60 px-5 py-7 sm:grid-cols-3 sm:px-8">
            {stats.map(({ icon: Icon, value, label, href }) => {
              const content = (
                <>
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-secondary shadow-sm">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-title text-lg font-black leading-tight text-primary">{value}</p>
                    <p className="text-xs text-slate-500">{label}</p>
                  </div>
                </>
              );

              return href ? (
                <Link key={label} href={href} className="group flex items-center gap-3">
                  {content}
                </Link>
              ) : (
                <div key={label} className="flex items-center gap-3">
                  {content}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
