import StaticPage from "@/components/static/static-page";

export default function TermsOfServicePage() {
  return (
    <StaticPage title="Nutzungsbedingungen">
      <p className="mb-4 text-sm text-gray-500">Letzte Aktualisierung: 28. Juni 2026</p>

      <div className="mb-5">
        <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-4">
          <p className="font-semibold text-red-600 text-sm md:text-base">
            WICHTIGER HINWEIS: SpeedJobs.at ist ausschließlich eine Online-Plattform zur Kontaktvermittlung zwischen Nutzern. SpeedJobs.at ist nicht Vertragspartner, Arbeitgeber, Auftragnehmer, Auftraggeber, Zahlungsdienstleister, Versicherer oder Qualitätsprüfer der angebotenen Leistungen. Jede Kontaktaufnahme, Beauftragung, Zahlung und Durchführung erfolgt eigenverantwortlich und auf eigenes Risiko der beteiligten Nutzer.
          </p>
        </div>

        <p className="mb-4">
          Diese Nutzungsbedingungen regeln die Nutzung von SpeedJobs.at. Mit der Registrierung oder Nutzung der Plattform akzeptieren Sie diese Bedingungen. Wenn Sie mit diesen Bedingungen nicht einverstanden sind, dürfen Sie SpeedJobs.at nicht nutzen.
        </p>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-3">1. Rolle von SpeedJobs.at</h2>
        <p className="mb-3">
          SpeedJobs.at stellt eine technische Plattform bereit, auf der Nutzer Dienstleisterprofile veröffentlichen, Hilfsgesuche bzw. Aufträge einstellen, Profile suchen, Kontaktinformationen einsehen und Bewertungen abgeben können. SpeedJobs.at vermittelt lediglich den Kontakt und übernimmt keine Verantwortung für die tatsächliche Durchführung, Qualität, Sicherheit, Rechtmäßigkeit, Bezahlung oder das Ergebnis einer Dienstleistung.
        </p>
        <p className="mb-3 font-semibold">
          Verträge entstehen ausschließlich zwischen den jeweiligen Nutzern. SpeedJobs.at wird nicht Partei solcher Verträge.
        </p>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-3">2. Registrierung und Benutzerkonto</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>Die Registrierung ist nur Personen erlaubt, die mindestens 18 Jahre alt und geschäftsfähig sind.</li>
          <li>Alle Angaben müssen wahrheitsgemäß, aktuell und vollständig sein.</li>
          <li>Pro Benutzerkonto ist grundsätzlich nur ein Dienstleisterprofil und nur ein aktiver Auftrag zulässig.</li>
          <li>Pro Dienstleisterprofil darf nur eine Hauptdienstleistung angeboten werden.</li>
          <li>Die Kontakt-E-Mail wird automatisch aus der registrierten Konto-E-Mail übernommen.</li>
          <li>Benutzer sind selbst für die Sicherheit ihres Kontos und Passworts verantwortlich.</li>
        </ul>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-3">3. Pflichten der Nutzer</h2>
        <p className="mb-3">Nutzer verpflichten sich, SpeedJobs.at nur rechtmäßig und fair zu verwenden. Verboten sind insbesondere:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>falsche, irreführende oder betrügerische Angaben,</li>
          <li>illegale, gefährliche, sittenwidrige oder nicht genehmigte Tätigkeiten,</li>
          <li>Beleidigungen, Drohungen, Diskriminierung, Belästigung oder unseriöse Kontaktaufnahme,</li>
          <li>das Anbieten von Leistungen ohne erforderliche Gewerbeberechtigung, Ausbildung, Bewilligung oder Versicherung, sofern eine solche notwendig ist,</li>
          <li>Spam, Schadsoftware, Manipulationen, automatisierte Abfragen oder Angriffe auf die Plattform,</li>
          <li>die Umgehung von Sicherheitsfunktionen, Limits oder Plattformregeln.</li>
        </ul>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-3">4. Eigenverantwortung bei Aufträgen und Dienstleistungen</h2>
        <p className="mb-3">
          Nutzer müssen selbst prüfen, ob ein Dienstleister geeignet, seriös, qualifiziert, versichert und rechtlich berechtigt ist, eine bestimmte Leistung zu erbringen. Dienstleister müssen selbst sicherstellen, dass sie alle rechtlichen, steuerlichen, sozialversicherungsrechtlichen, gewerberechtlichen und sonstigen Verpflichtungen einhalten.
        </p>
        <p className="mb-3">
          Preise, Zahlungsbedingungen, Termine, Umfang der Leistung, Haftung, Gewährleistung und sonstige Vereinbarungen müssen die beteiligten Nutzer direkt miteinander klären. SpeedJobs.at ist daran nicht beteiligt.
        </p>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-3">5. Bewertungen</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>Bewertungen müssen wahrheitsgemäß, sachlich und fair sein.</li>
          <li>Es dürfen keine falschen Tatsachenbehauptungen, Beleidigungen, Drohungen oder rechtswidrige Inhalte veröffentlicht werden.</li>
          <li>SpeedJobs.at kann Bewertungen prüfen, ausblenden oder löschen, wenn sie gegen Regeln oder geltendes Recht verstoßen.</li>
          <li>SpeedJobs.at übernimmt keine Gewähr für die Richtigkeit, Vollständigkeit oder Aussagekraft von Bewertungen.</li>
        </ul>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-3">6. Sperrung, Löschung und Moderation</h2>
        <p className="mb-3">
          SpeedJobs.at kann Konten, Profile, Aufträge, Bewertungen oder sonstige Inhalte jederzeit ablehnen, bearbeiten, ausblenden, sperren oder löschen, wenn ein Verstoß gegen diese Bedingungen, gesetzliche Vorschriften, Sicherheitsinteressen oder berechtigte Interessen der Plattform oder anderer Nutzer vorliegt.
        </p>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-3">7. Haftungsausschluss</h2>
        <p className="mb-3 font-semibold">
          Soweit gesetzlich zulässig, haftet SpeedJobs.at nicht für Schäden, Verluste, Verletzungen, Sachschäden, Vermögensschäden, Datenverluste, Zahlungsausfälle, mangelhafte Leistungen, Betrug, Streitigkeiten, Verzögerungen, Unfälle oder sonstige Nachteile, die aus Kontakten, Aufträgen, Dienstleistungen, Treffen, Zahlungen oder Vereinbarungen zwischen Nutzern entstehen.
        </p>
        <p className="mb-3">
          SpeedJobs.at haftet insbesondere nicht für Handlungen, Unterlassungen, Aussagen, Qualifikationen, Preise, Verfügbarkeit, Zuverlässigkeit oder Arbeitsergebnisse von Nutzern. Die Nutzung der Plattform und jede daraus folgende Kontaktaufnahme erfolgt auf eigenes Risiko.
        </p>
        <p className="mb-3">
          Zwingende gesetzliche Haftungen, insbesondere für vorsätzliches oder grob fahrlässiges Verhalten von SpeedJobs.at, bleiben unberührt, soweit sie rechtlich nicht ausgeschlossen werden können.
        </p>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-3">8. Keine Rechts-, Steuer- oder Fachberatung</h2>
        <p className="mb-3">
          Inhalte auf SpeedJobs.at dienen nur der allgemeinen Information. Sie stellen keine Rechtsberatung, Steuerberatung, Berufsberatung, Sicherheitsprüfung oder fachliche Empfehlung dar. Nutzer müssen bei Bedarf selbst fachkundigen Rat einholen.
        </p>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-3">9. Verfügbarkeit der Plattform</h2>
        <p className="mb-3">
          SpeedJobs.at bemüht sich um einen stabilen Betrieb, garantiert jedoch keine ununterbrochene, fehlerfreie oder jederzeit verfügbare Nutzung. Wartungen, technische Störungen, Sicherheitsmaßnahmen oder externe Ausfälle können die Nutzung zeitweise einschränken.
        </p>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-3">10. Änderungen</h2>
        <p className="mb-3">
          SpeedJobs.at kann diese Nutzungsbedingungen anpassen, wenn dies aus rechtlichen, technischen oder organisatorischen Gründen erforderlich ist. Die aktuelle Fassung wird auf der Website veröffentlicht.
        </p>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-3">11. Anwendbares Recht</h2>
        <p className="mb-3">
          Es gilt österreichisches Recht, soweit keine zwingenden Verbraucherschutzvorschriften entgegenstehen. Gerichtsstand ist, soweit zulässig, Österreich.
        </p>
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-3">12. Kontakt</h2>
        <p className="mb-3">
          Bei Fragen zu diesen Nutzungsbedingungen kontaktieren Sie uns bitte unter:
          <a href="mailto:kontaktspeedjobs@gmail.com" className="text-primary hover:underline ml-1">kontaktspeedjobs@gmail.com</a>
        </p>
      </div>
    </StaticPage>
  );
}
