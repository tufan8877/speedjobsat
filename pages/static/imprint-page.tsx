import StaticPage from "@/components/static/static-page";

export default function ImprintPage() {
  const contactEmail = "kontakt@speedjob.at";
  const street = "Heiligenstädterstraße 152";

  return (
    <StaticPage title="Impressum">
      <p className="mb-6 font-semibold">Angaben gemäß österreichischem E-Commerce-Gesetz</p>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-3">Betreiber dieser Website</h2>
        <p className="mb-1"><strong>Tufan Dönmezyürek</strong></p>
        <p className="mb-1">{street}</p>
        <p className="mb-1">1190 Wien</p>
        <p className="mb-1">Österreich</p>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-3">Kontakt</h2>
        <p className="mb-1">
          E-Mail: <a href={`mailto:${contactEmail}`} className="text-primary hover:underline">{contactEmail}</a>
        </p>
        <p className="mb-1">Website: speedjob.at</p>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-3">Verantwortlich für den Inhalt</h2>
        <p className="mb-1">Tufan Dönmezyürek</p>
        <p className="mb-1">{street}</p>
        <p className="mb-1">1190 Wien, Österreich</p>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-3">Hinweis zur Plattform</h2>
        <p className="mb-3">
          speedjob.at ist eine kostenlose Plattform zur Suche und Darstellung privater Dienstleisterprofile.
          Die Kontaktaufnahme erfolgt direkt zwischen registrierten Nutzern und Dienstleistern per E-Mail.
        </p>
        <p className="mb-3">
          speedjob.at übernimmt keine Gewähr für die Richtigkeit, Vollständigkeit oder Aktualität der von Nutzern
          eingestellten Profilinformationen, Bewertungen oder sonstigen Inhalte.
        </p>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-3">Haftung für Inhalte</h2>
        <p className="mb-3">
          Die Inhalte dieser Website wurden mit größter Sorgfalt erstellt. Für die Richtigkeit, Vollständigkeit und
          Aktualität der Inhalte kann jedoch keine Gewähr übernommen werden. Nutzer sind für die von ihnen
          veröffentlichten Inhalte selbst verantwortlich.
        </p>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-3">Haftung für Links</h2>
        <p className="mb-3">
          Diese Website kann Links zu externen Websites enthalten. Auf deren Inhalte besteht kein Einfluss.
          Für externe Inhalte wird keine Haftung übernommen. Für die Inhalte der verlinkten Seiten ist stets der
          jeweilige Anbieter oder Betreiber verantwortlich.
        </p>
      </div>
    </StaticPage>
  );
}
