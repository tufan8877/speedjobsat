import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { ArrowRight, ShieldCheck, Search, Star, UserRound, Users } from "lucide-react";

const features = [
  { icon: UserRound, title: "Kostenloses Profil", text: "Einfach erstellen und starten" },
  { icon: Search, title: "Mehr Sichtbarkeit", text: "Von Kunden in deiner Region gefunden" },
  { icon: ShieldCheck, title: "Geschützte Daten", text: "Kontaktdaten bleiben privat" },
  { icon: Star, title: "Bewertungen", text: "Baue Vertrauen auf und bekomme mehr Anfragen" },
];

export default function HeroSection() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();

  return (
    <section className="relative overflow-hidden bg-white">
      <div className="container relative mx-auto px-4 pb-14 pt-10 lg:pb-20 lg:pt-14">
        <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14">
          <div>
            <h1 className="font-title max-w-xl text-4xl font-black leading-[1.08] tracking-tight text-primary sm:text-5xl lg:text-[3.4rem]">
              Deine Fähigkeiten.
              <br />
              Dein Profil.
              <br />
              <span className="text-secondary">Deine Chance.</span>
            </h1>
            <p className="mt-6 max-w-lg text-lg leading-relaxed text-slate-600">
              Präsentiere deine Dienstleistungen und finde passende Kunden in{" "}
              <span className="font-semibold text-secondary">ganz Österreich</span>.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button
                onClick={() => setLocation(user ? "/profil" : "/auth?tab=register")}
                className="h-13 rounded-xl bg-secondary px-6 text-base font-bold text-white shadow-[0_10px_24px_rgba(255,107,11,0.28)] hover:bg-secondary/90"
              >
                <UserRound className="mr-2 h-5 w-5" />
                {user ? "Mein Profil öffnen" : "Kostenlos registrieren"}
              </Button>
              <Button
                variant="outline"
                onClick={() => setLocation("/ueber-uns")}
                className="h-13 rounded-xl border-primary/20 px-6 text-base font-bold text-primary hover:bg-primary/5"
              >
                Mehr erfahren
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>

            <div className="mt-9 grid grid-cols-2 gap-x-6 gap-y-6 sm:grid-cols-4">
              {features.map(({ icon: Icon, title, text }) => (
                <div key={title} className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent text-secondary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-primary">{title}</p>
                    <p className="mt-0.5 text-xs leading-snug text-slate-500">{text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-xl lg:mt-4">
            <div className="relative overflow-hidden rounded-[2rem] bg-slate-100 shadow-[0_30px_70px_rgba(7,43,76,0.18)]">
              <img
                src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=85"
                alt="Junger Dienstleister arbeitet am Laptop"
                className="h-[380px] w-full object-cover object-center sm:h-[460px]"
              />
            </div>

            <div className="absolute left-4 top-4 hidden h-40 w-40 rounded-full bg-primary p-6 text-center shadow-[0_20px_45px_rgba(7,43,76,0.35)] sm:flex sm:flex-col sm:items-center sm:justify-center">
              <p className="text-[13px] font-bold leading-snug text-white">
                Für Studenten, Selbstständige &amp; Dienstleister aller Branchen
              </p>
            </div>

            <div className="absolute -right-4 top-6 hidden rounded-2xl border border-slate-100 bg-white p-4 shadow-xl sm:block">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-accent text-secondary">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-primary">Tausende</p>
                  <p className="text-xs text-slate-500">zufriedene Kunden</p>
                </div>
              </div>
            </div>

            <div className="absolute -right-4 top-1/2 hidden -translate-y-1/2 rounded-2xl border border-slate-100 bg-white p-4 shadow-xl sm:block">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-accent text-amber-500">
                  <Star className="h-5 w-5 fill-current" />
                </div>
                <div>
                  <p className="text-sm font-bold text-primary">Bewertungen 5.0</p>
                  <div className="mt-0.5 flex gap-0.5 text-amber-400">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <Star key={index} className="h-3.5 w-3.5 fill-current" />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="absolute -right-4 bottom-6 hidden rounded-2xl border border-slate-100 bg-white p-4 shadow-xl sm:block">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-primary">Sicher &amp;</p>
                  <p className="text-xs text-slate-500">vertrauensvoll</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
