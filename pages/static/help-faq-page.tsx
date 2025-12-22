import StaticPage from "@/components/static/static-page";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function HelpFaqPage() {
  return (
    <StaticPage title="Hilfe & FAQ">
      <p className="mb-6">
        Hier finden Sie Antworten auf häufig gestellte Fragen rund um speedjobs.at.
        Sollten Sie weitere Fragen haben, zögern Sie nicht, uns zu kontaktieren.
      </p>

      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Allgemeine Fragen</h2>
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="what-is-speedjobs">
            <AccordionTrigger>Was ist speedjobs.at?</AccordionTrigger>
            <AccordionContent>
              speedjobs.at ist eine Online-Plattform, die Privatpersonen mit qualifizierten
              lokalen Dienstleistern in Österreich verbindet. Wir helfen Ihnen dabei,
              schnell und unkompliziert den passenden Dienstleister für Ihre Bedürfnisse zu finden.
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="is-speedjobs-free">
            <AccordionTrigger>Ist die Nutzung von speedjobs.at kostenlos?</AccordionTrigger>
            <AccordionContent>
              Ja, die Nutzung von speedjobs.at ist für Personen, die nach Dienstleistern suchen,
              vollständig kostenlos. Dienstleister können sich ebenfalls kostenlos registrieren
              und ihr Profil erstellen.
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="coverage-area">
            <AccordionTrigger>In welchen Regionen ist speedjobs.at verfügbar?</AccordionTrigger>
            <AccordionContent>
              speedjobs.at ist in ganz Österreich verfügbar. Dienstleister können ihre
              Tätigkeitsbereiche nach Bundesländern angeben, sodass Sie gezielt nach Anbietern
              in Ihrer Region suchen können.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Für Kunden</h2>
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="find-service-provider">
            <AccordionTrigger>Wie finde ich einen passenden Dienstleister?</AccordionTrigger>
            <AccordionContent>
              Nutzen Sie unsere Suchfunktion und filtern Sie nach Dienstleistungskategorie,
              Region und weiteren Kriterien. Sie können die Ergebnisse nach Bewertungen oder
              Aktualität sortieren und die Profile der Dienstleister mit ihren Bewertungen
              einsehen, um die beste Wahl zu treffen.
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="contact-service-provider">
            <AccordionTrigger>Wie kontaktiere ich einen Dienstleister?</AccordionTrigger>
            <AccordionContent>
              Auf der Profilseite eines Dienstleisters finden Sie die vom Anbieter angegebenen
              Kontaktmöglichkeiten, wie Telefonnummer, E-Mail oder Social-Media-Profile.
              Sie können den Dienstleister direkt über diese Kontaktdaten erreichen.
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="leave-review">
            <AccordionTrigger>Wie kann ich eine Bewertung abgeben?</AccordionTrigger>
            <AccordionContent>
              Um eine Bewertung abzugeben, müssen Sie registriert und angemeldet sein.
              Besuchen Sie das Profil des Dienstleisters, den Sie bewerten möchten, und
              klicken Sie auf "Bewertung abgeben". Vergeben Sie Sterne und schreiben Sie
              einen Kommentar zu Ihrer Erfahrung.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Für Dienstleister</h2>
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="create-profile">
            <AccordionTrigger>Wie erstelle ich ein Dienstleisterprofil?</AccordionTrigger>
            <AccordionContent>
              Registrieren Sie sich auf speedjobs.at und melden Sie sich an. Gehen Sie dann
              zu "Mein Profil" und füllen Sie alle relevanten Informationen aus, wie Ihre
              angebotenen Dienstleistungen, Tätigkeitsregionen, Kontaktdaten und Verfügbarkeit.
              Je vollständiger Ihr Profil ist, desto besser werden Sie gefunden.
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="edit-profile">
            <AccordionTrigger>Wie kann ich mein Profil bearbeiten?</AccordionTrigger>
            <AccordionContent>
              Melden Sie sich an und gehen Sie zu "Mein Profil". Dort können Sie über den
              Button "Profil bearbeiten" alle Ihre Angaben aktualisieren, einschließlich
              Kontaktdaten, angebotene Dienstleistungen und Tätigkeitsregionen.
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="respond-to-reviews">
            <AccordionTrigger>Kann ich auf Bewertungen antworten?</AccordionTrigger>
            <AccordionContent>
              Derzeit bieten wir noch keine Funktion für Dienstleister an, auf Bewertungen zu antworten.
              Wir arbeiten jedoch daran, diese Funktion in Zukunft zu implementieren.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Technische Fragen</h2>
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="password-reset">
            <AccordionTrigger>Wie kann ich mein Passwort zurücksetzen?</AccordionTrigger>
            <AccordionContent>
              Auf der Anmeldeseite finden Sie den Link "Passwort vergessen". Klicken Sie darauf
              und folgen Sie den Anweisungen, um Ihr Passwort zurückzusetzen. Sie erhalten eine
              E-Mail mit einem Link zum Erstellen eines neuen Passworts.
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="account-deactivation">
            <AccordionTrigger>Wie kann ich mein Konto löschen?</AccordionTrigger>
            <AccordionContent>
              Um Ihr Konto zu löschen, gehen Sie zu Ihren Kontoeinstellungen (unter "Einstellungen")
              und wählen Sie dort die Option "Konto löschen". Beachten Sie, dass dieser Vorgang
              nicht rückgängig gemacht werden kann und alle Ihre Daten gelöscht werden.
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="browser-compatibility">
            <AccordionTrigger>Welche Browser werden unterstützt?</AccordionTrigger>
            <AccordionContent>
              speedjobs.at ist optimiert für moderne Browser wie Google Chrome, Mozilla Firefox,
              Microsoft Edge und Safari in ihren aktuellen Versionen. Für die beste Erfahrung
              empfehlen wir, Ihren Browser regelmäßig zu aktualisieren.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
      
      <div className="mt-8 p-6 bg-gray-50 rounded-lg">
        <h3 className="text-xl font-semibold mb-3">Weitere Hilfe benötigt?</h3>
        <p>
          Wenn Sie keine Antwort auf Ihre Frage gefunden haben, kontaktieren Sie uns bitte
          direkt unter <a href="mailto:kontaktspeedjobs@gmail.com" className="text-primary hover:underline">kontaktspeedjobs@gmail.com</a>.
          Wir helfen Ihnen gerne weiter.
        </p>
      </div>
    </StaticPage>
  );
}