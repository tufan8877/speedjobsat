import StaticPage from "@/components/static/static-page";

export default function PrivacyPolicyPage() {
  return (
    <StaticPage title="Datenschutzerklärung">
      <p className="mb-6 font-semibold">
        Letzte Aktualisierung: 27. April 2025
      </p>
      
      <div className="mb-6">
        <p className="mb-4">
          Der Schutz Ihrer persönlichen Daten ist uns wichtig. Diese Datenschutzerklärung informiert
          Sie darüber, wie wir Ihre personenbezogenen Daten sammeln, verwenden, offenlegen und schützen.
        </p>
      </div>
      
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-3">1. Verantwortliche Stelle</h2>
        <p className="mb-3">
          Verantwortlich für die Datenverarbeitung auf dieser Website ist:
        </p>
        <p className="mb-3">
          speedjobs.at<br />
          E-Mail: kontaktspeedjobs@gmail.com
        </p>
      </div>
      
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-3">2. Erhebung personenbezogener Daten</h2>
        <p className="mb-3">
          Wir erheben verschiedene Arten von personenbezogenen Daten, einschließlich:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            <strong>Kontaktdaten:</strong> Name, E-Mail-Adresse, Telefonnummer, Anschrift (wenn angegeben)
          </li>
          <li>
            <strong>Kontoinformationen:</strong> Benutzername, Passwort (verschlüsselt)
          </li>
          <li>
            <strong>Profilinformationen:</strong> Dienstleistungskategorien, Tätigkeitsregionen, Verfügbarkeit, Beschreibungen
          </li>
          <li>
            <strong>Bewertungsdaten:</strong> Bewertungen, Kommentare
          </li>
          <li>
            <strong>Nutzungsdaten:</strong> IP-Adresse, Browsertyp, Betriebssystem, besuchte Seiten, Zeitstempel
          </li>
        </ul>
      </div>
      
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-3">3. Zwecke der Datenverarbeitung</h2>
        <p className="mb-3">
          Wir verarbeiten Ihre personenbezogenen Daten für folgende Zwecke:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Bereitstellung und Verwaltung unserer Website und Dienste</li>
          <li>Erstellung und Verwaltung von Benutzerkonten</li>
          <li>Vermittlung zwischen Dienstleistern und Kunden</li>
          <li>Bearbeitung von Anfragen und Supportanfragen</li>
          <li>Verbesserung unserer Dienste und Entwicklung neuer Funktionen</li>
          <li>Gewährleistung der Sicherheit unserer Website</li>
          <li>Einhaltung gesetzlicher Verpflichtungen</li>
        </ul>
      </div>
      
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-3">4. Rechtsgrundlage der Verarbeitung</h2>
        <p className="mb-3">
          Die Verarbeitung Ihrer personenbezogenen Daten erfolgt auf folgenden Rechtsgrundlagen:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Ihre Einwilligung (Art. 6 Abs. 1 lit. a DSGVO)</li>
          <li>Erfüllung eines Vertrags oder vorvertraglicher Maßnahmen (Art. 6 Abs. 1 lit. b DSGVO)</li>
          <li>Erfüllung rechtlicher Verpflichtungen (Art. 6 Abs. 1 lit. c DSGVO)</li>
          <li>Wahrung unserer berechtigten Interessen (Art. 6 Abs. 1 lit. f DSGVO)</li>
        </ul>
      </div>
      
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-3">5. Speicherdauer</h2>
        <p className="mb-3">
          Wir speichern Ihre personenbezogenen Daten nur so lange, wie es für die Erfüllung der 
          Zwecke, für die sie erhoben wurden, erforderlich ist oder solange gesetzliche Aufbewahrungsfristen 
          bestehen. Nach Ablauf dieser Fristen werden Ihre Daten routinemäßig gelöscht oder anonymisiert.
        </p>
      </div>
      
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-3">6. Weitergabe von Daten</h2>
        <p className="mb-3">
          Wir geben Ihre personenbezogenen Daten nicht ohne angemessene Grundlage an Dritte weiter. 
          Eine Weitergabe erfolgt nur:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>An Dienstleister, die uns bei der Bereitstellung unserer Dienste unterstützen und vertraglich zur Einhaltung der Datenschutzbestimmungen verpflichtet sind</li>
          <li>Wenn Sie eingewilligt haben</li>
          <li>Wenn wir gesetzlich dazu verpflichtet sind</li>
          <li>Zur Durchsetzung unserer Rechte oder zur Untersuchung potenzieller Rechtsverletzungen</li>
        </ul>
      </div>
      
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-3">7. Ihre Rechte</h2>
        <p className="mb-3">
          Als betroffene Person haben Sie folgende Rechte:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Recht auf Auskunft (Art. 15 DSGVO)</li>
          <li>Recht auf Berichtigung (Art. 16 DSGVO)</li>
          <li>Recht auf Löschung (Art. 17 DSGVO)</li>
          <li>Recht auf Einschränkung der Verarbeitung (Art. 18 DSGVO)</li>
          <li>Recht auf Datenübertragbarkeit (Art. 20 DSGVO)</li>
          <li>Widerspruchsrecht (Art. 21 DSGVO)</li>
          <li>Beschwerderecht bei einer Aufsichtsbehörde</li>
        </ul>
        <p className="mt-3">
          Um Ihre Rechte auszuüben, kontaktieren Sie uns bitte unter kontaktspeedjobs@gmail.com.
        </p>
      </div>
      
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-3">8. Datensicherheit</h2>
        <p className="mb-3">
          Wir treffen angemessene technische und organisatorische Maßnahmen, um Ihre personenbezogenen 
          Daten vor Verlust, Missbrauch, unbefugtem Zugriff, Offenlegung, Veränderung und Zerstörung zu schützen.
        </p>
      </div>
      
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-3">9. Cookies und ähnliche Technologien</h2>
        <p className="mb-3">
          Unsere Website verwendet Cookies und ähnliche Technologien, um die Benutzerfreundlichkeit 
          zu verbessern und bestimmte Funktionen bereitzustellen. Sie können Ihren Browser so einstellen, 
          dass er Sie über das Setzen von Cookies informiert oder Cookies ablehnt. 
          Beachten Sie jedoch, dass einige Funktionen unserer Website möglicherweise nicht vollständig 
          funktionieren, wenn Cookies deaktiviert sind.
        </p>
      </div>
      
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-3">10. Änderungen dieser Datenschutzerklärung</h2>
        <p className="mb-3">
          Wir behalten uns das Recht vor, diese Datenschutzerklärung jederzeit zu ändern. 
          Die aktualisierte Version wird auf unserer Website veröffentlicht, und das Datum 
          der letzten Aktualisierung wird entsprechend angepasst.
        </p>
      </div>
      
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-3">11. Kontakt</h2>
        <p className="mb-3">
          Wenn Sie Fragen zu dieser Datenschutzerklärung haben oder Ihre Datenschutzrechte 
          ausüben möchten, kontaktieren Sie uns bitte unter:
          <a href="mailto:kontaktspeedjobs@gmail.com" className="text-primary hover:underline ml-1">kontaktspeedjobs@gmail.com</a>
        </p>
      </div>
    </StaticPage>
  );
}