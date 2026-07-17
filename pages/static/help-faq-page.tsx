import StaticPage from "@/components/static/static-page";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function HelpFaqPage() {
  const contactEmail = "kontakt@speedjob.at";

  return (
    <StaticPage
      title="Hilfe & FAQ"
      description="Antworten auf häufige Fragen zur Nutzung, Registrierung und Profilerstellung auf speedjob.at."
    >
      <p className="mb-6">
        Hier finden Sie Antworten auf häufige Fragen zu speedjob.at. speedjob.at ist eine Plattform zur Kontaktvermittlung und nicht selbst Anbieter oder Auftraggeber der angebotenen Leistungen.
      </p>

      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Allgemeine Fragen</h2>
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="what-is-speedjob">
            <AccordionTrigger>Was ist speedjob.at?</AccordionTrigger>
            <AccordionContent>
              speedjob.at ist eine Online-Plattform, auf der Nutzer Dienstleisterprofile suchen und ein eigenes Profil erstellen können. speedjob.at stellt nur die technische Plattform bereit und wird nicht Vertragspartner der Nutzer.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="liability">
            <AccordionTrigger>Haftet speedjob.at für Dienstleistungen?</AccordionTrigger>
            <AccordionContent>
              Nein. Vereinbarungen, Preise, Zahlungen, Termine, Qualität und Durchführung werden direkt zwischen Kunden und Dienstleistern geklärt. speedjob.at haftet, soweit gesetzlich zulässig, nicht für Schäden, Streitigkeiten, Zahlungsausfälle oder mangelhafte Leistungen zwischen Nutzern.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="regions">
            <AccordionTrigger>Wo ist speedjob.at verfügbar?</AccordionTrigger>
            <AccordionContent>
              speedjob.at ist auf Österreich ausgerichtet. Nutzer können Bundesländer als Tätigkeitsregionen angeben.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Profile</h2>
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="one-service">
            <AccordionTrigger>Wie viele Dienstleistungen kann ich anbieten?</AccordionTrigger>
            <AccordionContent>
              Pro Dienstleisterprofil kann genau eine Hauptdienstleistung ausgewählt werden. Dadurch bleiben Profile klar und übersichtlich.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="contact-email">
            <AccordionTrigger>Welche E-Mail wird als Kontakt angezeigt?</AccordionTrigger>
            <AccordionContent>
              Als Kontakt-E-Mail wird automatisch die E-Mail-Adresse Ihres registrierten Benutzerkontos verwendet. Dadurch sollen falsche oder fremde Kontakt-E-Mails vermieden werden.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Bewertungen und Support</h2>
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="reviews">
            <AccordionTrigger>Wie kann ich eine Bewertung abgeben?</AccordionTrigger>
            <AccordionContent>
              Sie müssen registriert und angemeldet sein. Öffnen Sie ein fremdes Dienstleisterprofil, wählen Sie Sterne aus und schreiben Sie einen sachlichen Kommentar. Falsche, beleidigende oder rechtswidrige Bewertungen können entfernt werden.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="delete-account">
            <AccordionTrigger>Wie kann ich Daten oder mein Konto löschen lassen?</AccordionTrigger>
            <AccordionContent>
              Schreiben Sie uns an {contactEmail}. Wir prüfen die Anfrage und bearbeiten sie nach den geltenden Datenschutzregeln und gesetzlichen Aufbewahrungspflichten.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="support">
            <AccordionTrigger>Wie erreiche ich den Support?</AccordionTrigger>
            <AccordionContent>
              Schreiben Sie an {contactEmail}. Geben Sie bitte Ihre registrierte E-Mail-Adresse und eine genaue Beschreibung Ihres Anliegens an. Senden Sie niemals Ihr Passwort.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

      <div className="mt-8 p-6 bg-gray-50 rounded-lg">
        <h3 className="text-xl font-semibold mb-3">Weitere Hilfe benötigt?</h3>
        <p>
          Kontaktieren Sie uns unter <a href={`mailto:${contactEmail}`} className="text-primary hover:underline">{contactEmail}</a>.
        </p>
      </div>
    </StaticPage>
  );
}
