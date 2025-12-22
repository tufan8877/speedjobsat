import StaticPage from "@/components/static/static-page";

export default function AboutPage() {
  return (
    <StaticPage title="Über uns">
      <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-5">
        <p className="font-semibold text-red-600 text-sm md:text-base">
          WICHTIGER HINWEIS: speedjobs.at ist ausschließlich eine Vermittlungsplattform und übernimmt keinerlei 
          Verantwortung für Handlungen, Vereinbarungen oder Konflikte zwischen Dienstleistern und Auftraggebern.
          Jegliche Beauftragung erfolgt auf eigenes Risiko der beteiligten Parteien.
        </p>
      </div>
      
      <h2 className="text-2xl font-semibold mb-4">Willkommen bei speedjobs.at</h2>
      
      <p className="mb-4">
        speedjobs.at ist eine Vermittlungsplattform in Österreich, die Privatpersonen mit privaten 
        Dienstleistern verbindet. Wir bieten eine Möglichkeit für Menschen, schnell und unkompliziert 
        Dienstleister für ihre individuellen Bedürfnisse zu finden, oft zu günstigeren Preisen als bei 
        gewerblichen Anbietern.
      </p>
      
      <h3 className="text-xl font-semibold mb-3 mt-6">Unsere Idee</h3>
      
      <p className="mb-4">
        speedjobs.at wurde aus der Beobachtung heraus entwickelt, dass es oft schwierig ist, 
        bezahlbare Dienstleister für kleinere Aufgaben zu finden. Viele Menschen suchen nach 
        günstigeren Alternativen zu gewerblichen Anbietern, während andere ihre Fähigkeiten und 
        Zeit anbieten möchten, um ein zusätzliches Einkommen zu erzielen.
      </p>
      
      <p className="mb-4">
        Unsere Plattform stellt lediglich den Kontakt zwischen diesen Parteien her. Wir sind 
        kein Arbeitgeber, keine Agentur und keine Partei bei Vereinbarungen zwischen Nutzern.
      </p>
      
      <h3 className="text-xl font-semibold mb-3 mt-6">Was wir bieten</h3>
      
      <ul className="list-disc pl-6 mb-4">
        <li className="mb-2">
          <strong>Einfache Vermittlung:</strong> Wir bieten eine Plattform, auf der Angebot und Nachfrage 
          nach privaten Dienstleistungen zusammenfinden können.
        </li>
        <li className="mb-2">
          <strong>Bewertungssystem:</strong> Nutzer können Erfahrungen teilen, um anderen bei der Auswahl 
          von Dienstleistern zu helfen.
        </li>
        <li className="mb-2">
          <strong>Kostenlose Nutzung:</strong> Die Registrierung und Nutzung der Plattform ist kostenfrei.
        </li>
        <li className="mb-2">
          <strong>Einfache Bedienung:</strong> Unsere Plattform ist benutzerfreundlich gestaltet, 
          ohne komplizierte Funktionen.
        </li>
      </ul>
      
      <h3 className="text-xl font-semibold mb-3 mt-6">Haftungsausschluss</h3>
      
      <p className="mb-4">
        speedjobs.at ist ausschließlich eine Vermittlungsplattform. Wir überprüfen nicht die Identität, 
        Qualifikationen oder rechtlichen Status der Nutzer. Wir sind nicht verantwortlich für die Qualität 
        der Dienstleistungen, für Streitigkeiten zwischen Nutzern oder für rechtliche Konsequenzen, 
        die aus der Nutzung unserer Plattform entstehen könnten. Jeder Nutzer handelt auf eigene Verantwortung 
        und ist selbst für die Einhaltung aller relevanten Gesetze und Vorschriften verantwortlich.
      </p>
      
      <h3 className="text-xl font-semibold mb-3 mt-6">Kontakt</h3>
      
      <p className="mb-4">
        Haben Sie Fragen oder Anregungen? Wir freuen uns über Ihre Nachricht an 
        <a href="mailto:kontaktspeedjobs@gmail.com" className="text-primary hover:underline ml-1 break-all sm:break-normal">kontaktspeedjobs@gmail.com</a>.
      </p>
    </StaticPage>
  );
}