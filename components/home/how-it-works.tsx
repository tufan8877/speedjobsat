import { Link } from "wouter";
import { Button } from "@/components/ui/button";

const steps = [
  {
    title: "Fachkraft suchen",
    text: "Wählen Sie Dienstleistung und Bundesland aus und finden Sie passende Profile in Ihrer Nähe.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.3-4.3" />
      </svg>
    ),
  },
  {
    title: "Profil vergleichen",
    text: "Sehen Sie Leistungen, Regionen, Beschreibung, Bewertungen und Favoriten auf einen Blick.",
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
    title: "Per E-Mail kontaktieren",
    text: "Registrierte Nutzer können die E-Mail-Adresse sehen und den Dienstleister direkt per E-Mail kontaktieren.",
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
    <section className="py-12 sm:py-16 bg-gradient-to-b from-white to-gray-50">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-8 sm:mb-10">
          <span className="inline-flex items-center rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary mb-4">
            Einfach. Schnell. Direkt.
          </span>
          <h2 className="text-2xl md:text-3xl font-bold font-title mb-3">
            So funktioniert speedjob.at
          </h2>
          <p className="text-gray-600 leading-relaxed">
            speedjob.at verbindet Kunden und Unternehmen mit lokalen Dienstleistern über übersichtliche Profile, Bewertungen und direkte Kontaktaufnahme per E-Mail.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-10">
          {steps.map((step) => (
            <div
              key={step.title}
              className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition p-5 sm:p-6"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-white transition">
                {step.icon}
              </div>
              <h3 className="text-lg font-semibold mb-2 text-gray-900">{step.title}</h3>
              <p className="text-gray-600 text-sm leading-relaxed">{step.text}</p>
            </div>
          ))}
        </div>

        <div className="max-w-5xl mx-auto rounded-2xl border border-primary/10 bg-white shadow-sm overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="p-5 sm:p-7">
              <h3 className="text-xl font-bold mb-2 text-gray-900">Sie sind Dienstleister?</h3>
              <p className="text-gray-600 leading-relaxed mb-5">
                Erstellen Sie ein kostenloses Profil mit Ihren Leistungen, Regionen, Beschreibung und E-Mail-Adresse. So können Kunden Sie leichter finden und per E-Mail kontaktieren.
              </p>
              <div className="flex flex-wrap gap-2 text-sm text-gray-700">
                <span className="rounded-full bg-gray-100 px-3 py-1">Eigenes Profil</span>
                <span className="rounded-full bg-gray-100 px-3 py-1">Bewertungen</span>
                <span className="rounded-full bg-gray-100 px-3 py-1">Favoriten</span>
                <span className="rounded-full bg-gray-100 px-3 py-1">Kontakt per E-Mail</span>
              </div>
            </div>

            <div className="bg-primary/5 p-5 sm:p-7 flex flex-col justify-center gap-3">
              <Link href="/auth?tab=register">
                <Button className="w-full h-11">Profil erstellen</Button>
              </Link>
              <Link href="/suche">
                <Button variant="outline" className="w-full h-11 bg-white">Dienstleister ansehen</Button>
              </Link>
              <p className="text-xs text-gray-500 text-center mt-1">
                Registrierung dauert nur wenige Minuten.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
