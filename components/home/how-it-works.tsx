import { Link } from "wouter";
import { Button } from "@/components/ui/button";

const steps = [
  {
    title: "Profil suchen",
    text: "Wähle Dienstleistung und Bundesland aus und finde passende Angebote in deiner Nähe.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.3-4.3" />
      </svg>
    ),
  },
  {
    title: "Profile vergleichen",
    text: "Sieh dir Leistungen, Region, Beschreibung, Verfügbarkeit und Bewertungen übersichtlich an.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M19 8v6" />
        <path d="M22 11h-6" />
      </svg>
    ),
  },
  {
    title: "Direkt kontaktieren",
    text: "Registrierte Nutzer sehen die Kontaktdaten und können direkt Kontakt aufnehmen.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="m3 7 9 6 9-6" />
      </svg>
    ),
  },
];

export default function HowItWorks() {
  return (
    <section className="py-12 sm:py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-8 sm:mb-10">
          <span className="inline-flex items-center rounded-full bg-accent px-4 py-1.5 text-sm font-bold text-secondary mb-4">
            Einfach. Schnell. Direkt.
          </span>
          <h2 className="font-title text-2xl font-black text-primary mb-3 md:text-3xl">
            So funktioniert speedjob.at
          </h2>
          <p className="text-slate-600 leading-relaxed">
            speedjob.at verbindet Menschen mit passenden Dienstleistungen über übersichtliche Profile, Bewertungen und Kontaktaufnahme per E-Mail.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-10">
          {steps.map((step) => (
            <div
              key={step.title}
              className="group bg-white rounded-2xl border border-slate-100 shadow-sm hover:-translate-y-0.5 hover:shadow-lg transition p-5 sm:p-6"
            >
              <div className="w-12 h-12 rounded-xl bg-accent text-secondary flex items-center justify-center mb-4 group-hover:bg-secondary group-hover:text-white transition">
                {step.icon}
              </div>
              <h3 className="text-lg font-bold mb-2 text-primary">{step.title}</h3>
              <p className="text-slate-600 text-sm leading-relaxed">{step.text}</p>
            </div>
          ))}
        </div>

        <div className="max-w-5xl mx-auto rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="p-5 sm:p-7">
              <h3 className="text-xl font-bold mb-2 text-primary">Du bietest eine Dienstleistung an?</h3>
              <p className="text-slate-600 leading-relaxed mb-5">
                Erstelle kostenlos dein Profil mit Leistung, Region, Beschreibung und Kontakt-E-Mail. So können Interessierte dein Angebot leichter finden und direkt Kontakt aufnehmen.
              </p>
              <div className="flex flex-wrap gap-2 text-sm font-semibold text-primary">
                <span className="rounded-full bg-accent px-3 py-1">Eigenes Profil</span>
                <span className="rounded-full bg-accent px-3 py-1">Bewertungen</span>
                <span className="rounded-full bg-accent px-3 py-1">Favoriten</span>
                <span className="rounded-full bg-accent px-3 py-1">Kontakt per E-Mail</span>
              </div>
            </div>

            <div className="bg-accent/60 p-5 sm:p-7 flex flex-col justify-center gap-3">
              <Link href="/auth?tab=register">
                <Button className="w-full h-11 rounded-xl font-bold">Kostenloses Profil erstellen</Button>
              </Link>
              <Link href="/suche">
                <Button variant="outline" className="w-full h-11 rounded-xl border-primary/20 bg-white font-bold text-primary hover:bg-primary/5">Profile ansehen</Button>
              </Link>
              <p className="text-xs text-slate-500 text-center mt-1">
                Registrierung dauert nur wenige Minuten.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
