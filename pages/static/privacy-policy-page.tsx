import StaticPage from "@/components/static/static-page";

export default function PrivacyPolicyPage() {
  return (
    <StaticPage title="Datenschutzerklärung">
      <p className="mb-6 font-semibold">Letzte Aktualisierung: 28. Juni 2026</p>

      <div className="mb-6">
        <p className="mb-4">
          Diese Datenschutzerklärung informiert darüber, wie speedjob.at personenbezogene Daten verarbeitet. speedjob.at ist eine Online-Plattform zur Kontaktvermittlung zwischen Nutzern, Dienstleistern und Auftraggebern.
        </p>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-3">1. Verantwortlicher</h2>
        <p className="mb-3">
          Verantwortlich für die Datenverarbeitung auf dieser Website ist speedjob.at.
        </p>
        <p className="mb-3">
          Kontakt: <a href="mailto:kontaktspeedjobs@gmail.com" className="text-primary hover:underline">kontaktspeedjobs@gmail.com</a>
        </p>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-3">2. Welche Daten verarbeitet werden</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li><strong>Kontodaten:</strong> E-Mail-Adresse, verschlüsseltes Passwort, Benutzerstatus, Registrierungsdatum.</li>
          <li><strong>Profildaten:</strong> Name, Beschreibung, eine Hauptdienstleistung, Tätigkeitsregionen, Verfügbarkeit, Profilbild, automatisch verwendete Kontakt-E-Mail.</li>
          <li><strong>Auftragsdaten:</strong> Titel, Beschreibung, Ort, Kategorie, Datum, automatisch verwendete Kontakt-E-Mail.</li>
          <li><strong>Bewertungsdaten:</strong> Sternebewertung, Kommentar, Zeitpunkt und zugeordnetes Profil.</li>
          <li><strong>Technische Daten:</strong> IP-Adresse, Browser, Gerätedaten, Zeitstempel, Logdaten und sicherheitsrelevante Ereignisse.</li>
          <li><strong>Supportdaten:</strong> Nachrichten, E-Mail-Kommunikation und Angaben, die Sie uns freiwillig übermitteln.</li>
        </ul>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-3">3. Zwecke der Verarbeitung</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>Bereitstellung und Betrieb der Plattform,</li>
          <li>Registrierung, Login und Verwaltung von Benutzerkonten,</li>
          <li>Erstellung und Anzeige von Dienstleisterprofilen, Aufträgen und Bewertungen,</li>
          <li>Kontaktvermittlung zwischen Nutzern,</li>
          <li>Missbrauchsvermeidung, Sicherheit, Fehleranalyse und Plattformschutz,</li>
          <li>Bearbeitung von Supportanfragen,</li>
          <li>Erfüllung gesetzlicher Pflichten und Durchsetzung unserer Rechte.</li>
        </ul>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-3">4. Rechtsgrundlagen</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>Art. 6 Abs. 1 lit. b DSGVO: Vertragserfüllung und vorvertragliche Maßnahmen,</li>
          <li>Art. 6 Abs. 1 lit. f DSGVO: berechtigtes Interesse am sicheren und funktionsfähigen Betrieb der Plattform,</li>
          <li>Art. 6 Abs. 1 lit. c DSGVO: rechtliche Verpflichtungen,</li>
          <li>Art. 6 Abs. 1 lit. a DSGVO: Einwilligung, sofern diese im Einzelfall erforderlich ist.</li>
        </ul>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-3">5. Sichtbarkeit von Daten</h2>
        <p className="mb-3">
          Öffentliche oder registrierten Nutzern zugängliche Inhalte können je nach Funktion Profilinformationen, Dienstleistung, Region, Beschreibung, Bewertungen und Kontakt-E-Mail enthalten. Kontaktinformationen werden nur im Rahmen der Plattformfunktion angezeigt. Nutzer sind selbst verantwortlich dafür, welche Inhalte sie veröffentlichen.
        </p>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-3">6. Kontakt-E-Mail</h2>
        <p className="mb-3">
          Bei Profilen und Aufträgen wird die registrierte Konto-E-Mail automatisch als Kontakt-E-Mail verwendet. Frei eingegebene fremde Kontakt-E-Mails werden nicht als Kontaktmöglichkeit gespeichert. Dies dient der Missbrauchsvermeidung und Nachvollziehbarkeit.
        </p>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-3">7. Weitergabe an Dritte</h2>
        <p className="mb-3">
          Personenbezogene Daten werden nur weitergegeben, wenn dies zur Bereitstellung der Plattform notwendig ist, Sie eingewilligt haben, eine gesetzliche Verpflichtung besteht oder berechtigte Interessen wie Missbrauchsabwehr oder Rechtsdurchsetzung vorliegen.
        </p>
        <p className="mb-3">
          Für Hosting, Datenbank, E-Mail, technische Wartung oder Sicherheitsfunktionen können externe Dienstleister eingesetzt werden, die Daten nur im erforderlichen Umfang verarbeiten dürfen.
        </p>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-3">8. Speicherdauer</h2>
        <p className="mb-3">
          Wir speichern Daten nur so lange, wie sie für den jeweiligen Zweck erforderlich sind. Kontodaten, Profile, Aufträge und Bewertungen bleiben grundsätzlich gespeichert, solange das Konto oder der jeweilige Inhalt besteht. Gesetzliche Aufbewahrungspflichten, Sicherheitsinteressen und Nachweiszwecke können längere Speicherungen erforderlich machen.
        </p>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-3">9. Sicherheit</h2>
        <p className="mb-3">
          Wir setzen angemessene technische und organisatorische Maßnahmen ein, um Daten vor Verlust, Missbrauch, unbefugtem Zugriff, Veränderung oder Offenlegung zu schützen. Ein absoluter Schutz kann bei internetbasierten Diensten jedoch nicht garantiert werden.
        </p>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-3">10. Cookies und technische Speicherung</h2>
        <p className="mb-3">
          speedjob.at kann technisch notwendige Cookies oder vergleichbare Speichertechnologien verwenden, damit Login, Sicherheit, Seitennavigation und Plattformfunktionen funktionieren. Werden zukünftig Analyse-, Marketing- oder Trackingdienste eingesetzt, erfolgt dies nur im gesetzlich zulässigen Rahmen und, falls erforderlich, mit Einwilligung.
        </p>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-3">11. Rechte betroffener Personen</h2>
        <p className="mb-3">Sie haben nach Maßgabe der DSGVO insbesondere folgende Rechte:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Auskunft über Ihre gespeicherten Daten,</li>
          <li>Berichtigung unrichtiger Daten,</li>
          <li>Löschung oder Einschränkung der Verarbeitung,</li>
          <li>Datenübertragbarkeit,</li>
          <li>Widerspruch gegen bestimmte Verarbeitungen,</li>
          <li>Widerruf einer erteilten Einwilligung mit Wirkung für die Zukunft.</li>
        </ul>
        <p className="mt-3">
          Zur Ausübung Ihrer Rechte kontaktieren Sie uns unter <a href="mailto:kontaktspeedjobs@gmail.com" className="text-primary hover:underline">kontaktspeedjobs@gmail.com</a>.
        </p>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-3">12. Beschwerderecht</h2>
        <p className="mb-3">
          Wenn Sie der Ansicht sind, dass die Verarbeitung Ihrer personenbezogenen Daten gegen Datenschutzrecht verstößt, können Sie sich bei einer Datenschutzaufsichtsbehörde beschweren. In Österreich ist dies insbesondere die Österreichische Datenschutzbehörde.
        </p>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-3">13. Änderungen</h2>
        <p className="mb-3">
          Wir können diese Datenschutzerklärung anpassen, wenn sich rechtliche, technische oder organisatorische Anforderungen ändern. Die jeweils aktuelle Version wird auf dieser Website veröffentlicht.
        </p>
      </div>
    </StaticPage>
  );
}
