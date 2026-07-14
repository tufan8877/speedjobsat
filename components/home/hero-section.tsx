import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { federalStates, serviceCategories, getServiceCategoryLabel } from "@shared/schema";
import { useLocation } from "wouter";
import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { ArrowRight, CheckCircle2, Search, ShieldCheck, Sparkles, Star, UserRound, MapPin, Mail } from "lucide-react";

export default function HeroSection() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const [service, setService] = useState("");
  const [region, setRegion] = useState("");
  const [name, setName] = useState("");

  const handleSearch = () => {
    const searchParams = new URLSearchParams();
    if (service) searchParams.append("service", service);
    if (region) searchParams.append("region", region);
    if (name.trim()) searchParams.append("name", name.trim());
    const query = searchParams.toString();
    setLocation(query ? `/suche?${query}` : "/suche");
  };

  return (
    <section className="relative overflow-hidden border-b border-slate-100 bg-[#fffdfb]">
      <div className="absolute left-[-8rem] top-[-10rem] h-80 w-80 rounded-full bg-[#ff6b0b]/10 blur-3xl" />
      <div className="absolute right-[-7rem] top-20 h-80 w-80 rounded-full bg-[#072b4c]/10 blur-3xl" />

      <div className="container relative mx-auto px-4 pb-10 pt-8 lg:pb-14 lg:pt-12">
        <div className="grid items-center gap-10 lg:grid-cols-[1.08fr_0.92fr]">
          <div>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#ff6b0b]/20 bg-[#fff4eb] px-4 py-2 text-sm font-bold text-[#d94f00]">
              <Sparkles className="h-4 w-4" /> Für Dienstleister in ganz Österreich
            </div>

            <h1 className="max-w-3xl text-4xl font-black leading-[1.03] tracking-[-0.045em] text-[#072b4c] sm:text-5xl lg:text-6xl">
              Deine Fähigkeiten.<br />
              Dein Profil.<br />
              <span className="text-[#ff6b0b]">Deine Chance.</span>
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-slate-600 sm:text-xl">
              Präsentiere deine Dienstleistungen, werde in deiner Region gefunden und nimm direkt Kontakt mit passenden Kunden auf.
            </p>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Button
                onClick={() => setLocation(user ? "/profil" : "/auth?tab=register")}
                className="h-13 rounded-xl bg-[#ff6b0b] px-7 text-base font-bold text-white shadow-[0_12px_28px_rgba(255,107,11,0.28)] hover:bg-[#ea5c00]"
              >
                <UserRound className="mr-2 h-5 w-5" />
                {user ? "Mein Profil öffnen" : "Kostenlos registrieren"}
              </Button>
              <Button
                variant="outline"
                onClick={() => setLocation("/suche")}
                className="h-13 rounded-xl border-[#072b4c]/20 px-7 text-base font-bold text-[#072b4c] hover:bg-[#072b4c]/5"
              >
                Dienstleistungen entdecken <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>

            <div className="mt-8 grid max-w-2xl grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                [UserRound, "Kostenloses Profil", "Einfach erstellen"],
                [Search, "Mehr Sichtbarkeit", "Regional gefunden"],
                [ShieldCheck, "Geschützte Daten", "Nur für Mitglieder"],
                [Star, "Bewertungen", "Vertrauen aufbauen"],
              ].map(([Icon, title, text]: any) => (
                <div key={title} className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
                  <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-full bg-[#fff0e5] text-[#ff6b0b]">
                    <Icon className="h-4.5 w-4.5" />
                  </div>
                  <p className="text-sm font-bold text-[#072b4c]">{title}</p>
                  <p className="mt-0.5 text-xs text-slate-500">{text}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-xl">
            <div className="relative overflow-hidden rounded-[2rem] bg-[#e9edf0] shadow-[0_30px_70px_rgba(7,43,76,0.18)]">
              <img
                src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=85"
                alt="Junger Dienstleister arbeitet am Laptop"
                className="h-[430px] w-full object-cover object-center sm:h-[520px]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#072b4c]/45 via-transparent to-transparent" />
              <div className="absolute bottom-5 left-5 right-5 rounded-2xl border border-white/40 bg-white/92 p-4 shadow-xl backdrop-blur sm:left-7 sm:right-auto sm:w-72">
                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#fff0e5] text-[#ff6b0b]">
                    <CheckCircle2 className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="font-bold text-[#072b4c]">Profil kostenlos erstellen</p>
                    <p className="mt-1 text-sm text-slate-600">In wenigen Minuten sichtbar werden.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="absolute -left-3 top-8 hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-xl sm:block">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#ecf8ef] text-green-700"><ShieldCheck className="h-5 w-5" /></div>
                <div><p className="text-sm font-bold text-[#072b4c]">Sicher & vertrauensvoll</p><p className="text-xs text-slate-500">Geschützte Kontaktdaten</p></div>
              </div>
            </div>

            <div className="absolute -right-3 top-32 hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-xl sm:block">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#fff6dc] text-amber-600"><Star className="h-5 w-5 fill-current" /></div>
                <div><p className="text-sm font-bold text-[#072b4c]">Bewertungen</p><p className="text-xs text-slate-500">Vertrauen sichtbar machen</p></div>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 mt-10 rounded-[1.75rem] border border-slate-200 bg-white p-4 shadow-[0_18px_50px_rgba(7,43,76,0.10)] sm:p-6 lg:-mt-2">
          <div className="mb-4 flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-xl font-black text-[#072b4c]">Passende Dienstleister finden</h2>
              <p className="text-sm text-slate-500">Nach Dienstleistung, Bundesland oder Stichwort suchen.</p>
            </div>
            <div className="hidden items-center gap-2 text-sm font-semibold text-[#ff6b0b] sm:flex"><MapPin className="h-4 w-4" /> Ganz Österreich</div>
          </div>

          <div className="grid gap-3 md:grid-cols-[1fr_1fr_1.2fr_auto]">
            <select value={service} onChange={(event) => setService(event.target.value)} className="h-13 rounded-xl border border-slate-200 bg-slate-50 px-4 text-base text-slate-700 outline-none focus:border-[#ff6b0b] focus:ring-2 focus:ring-[#ff6b0b]/15">
              <option value="">Dienstleistung wählen</option>
              {serviceCategories.map((category) => <option key={category} value={category}>{getServiceCategoryLabel(category)}</option>)}
            </select>
            <select value={region} onChange={(event) => setRegion(event.target.value)} className="h-13 rounded-xl border border-slate-200 bg-slate-50 px-4 text-base text-slate-700 outline-none focus:border-[#ff6b0b] focus:ring-2 focus:ring-[#ff6b0b]/15">
              <option value="">Bundesland wählen</option>
              {federalStates.map((state) => <option key={state} value={state}>{state}</option>)}
            </select>
            <Input value={name} onChange={(event) => setName(event.target.value)} placeholder="z. B. Mathematik, Therme, Küche" className="h-13 rounded-xl border-slate-200 bg-slate-50 text-base focus-visible:ring-[#ff6b0b]/20" />
            <Button onClick={handleSearch} className="h-13 rounded-xl bg-[#072b4c] px-7 font-bold text-white hover:bg-[#0b3c68]"><Search className="mr-2 h-5 w-5" /> Suchen</Button>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-slate-500">
            <span className="flex items-center gap-1.5"><Mail className="h-3.5 w-3.5 text-[#ff6b0b]" /> Kontakt per registrierter E-Mail</span>
            <span className="flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5 text-[#ff6b0b]" /> Kontaktdaten geschützt</span>
            <span className="flex items-center gap-1.5"><Star className="h-3.5 w-3.5 text-[#ff6b0b]" /> Profile mit Bewertungen</span>
          </div>
        </div>
      </div>
    </section>
  );
}
