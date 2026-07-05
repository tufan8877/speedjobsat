export default function HowItWorks() {
  return (
    <section className="pt-8 pb-28 sm:pt-12 sm:pb-32 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-7 sm:mb-10">
          <h2 className="text-2xl md:text-3xl font-bold font-title mb-3">
            So funktioniert speedjob.at
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto mb-4">
            Kunden und Unternehmen finden passende Dienstleister über Profile, Bewertungen und Suchfilter.
          </p>
          <div className="max-w-2xl mx-auto bg-blue-50 rounded-lg p-4 mb-6 sm:mb-8 border border-blue-100">
            <h3 className="text-lg font-semibold text-blue-700 mb-2">Fokus auf Profile</h3>
            <p className="text-gray-700 mb-2">
              Dienstleister erstellen ein Profil mit Dienstleistung, Region, Beschreibung und Kontaktdaten.
            </p>
            <p className="text-gray-700 text-sm">
              Kunden können passende Profile suchen, speichern und direkt Kontakt aufnehmen.
            </p>
          </div>
        </div>

        <h3 className="text-xl font-semibold mb-5 sm:mb-6 text-center text-primary">Für Kunden und Unternehmen</h3>
        <div className="grid md:grid-cols-3 gap-7 sm:gap-8 mb-8 sm:mb-12">
          <div className="text-center">
            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-primary-50 rounded-full flex items-center justify-center text-primary mx-auto mb-3 sm:mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">1. Suchen</h3>
            <p className="text-gray-600">
              Wählen Sie eine Dienstleistung und ein Bundesland, um passende Anbieter zu finden.
            </p>
          </div>

          <div className="text-center">
            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-primary-50 rounded-full flex items-center justify-center text-primary mx-auto mb-3 sm:mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="m16 3 5 5-5 5"/></svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">2. Auswählen</h3>
            <p className="text-gray-600">
              Vergleichen Sie Profile, Bewertungen und Beschreibungen, um den passenden Dienstleister zu finden.
            </p>
          </div>

          <div className="text-center">
            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-primary-50 rounded-full flex items-center justify-center text-primary mx-auto mb-3 sm:mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">3. Kontaktieren</h3>
            <p className="text-gray-600">
              Nehmen Sie direkt Kontakt auf und vereinbaren Sie Details eigenverantwortlich.
            </p>
          </div>
        </div>

        <h3 className="text-xl font-semibold mb-5 sm:mb-6 text-center text-primary">Für Dienstleister</h3>
        <div className="grid md:grid-cols-3 gap-7 sm:gap-8">
          <div className="text-center">
            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 mx-auto mb-3 sm:mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4Z"/></svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">1. Profil erstellen</h3>
            <p className="text-gray-600">
              Registrieren Sie sich und erstellen Sie Ihr Dienstleisterprofil mit allen wichtigen Informationen.
            </p>
          </div>

          <div className="text-center">
            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 mx-auto mb-3 sm:mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 9.1V4L6 8.5l6 4.5V7.9c5 0 8.5 3.5 8.5 8.5s-3.5 8.5-8.5 8.5-8.5-3.5-8.5-8.5H2c0 5.5 4.5 10 10 10s10-4.5 10-10-4.5-10-10-10z"/></svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">2. Sichtbar werden</h3>
            <p className="text-gray-600">
              Ihr Profil erscheint in der Suche und kann von Kunden sowie Unternehmen gefunden werden.
            </p>
          </div>

          <div className="text-center">
            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 mx-auto mb-3 sm:mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="m9 12 2 2 4-4"/></svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">3. Anfragen erhalten</h3>
            <p className="text-gray-600">
              Interessenten können Ihre Kontaktdaten sehen und Sie direkt kontaktieren.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
