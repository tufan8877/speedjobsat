import StaticPage from "@/components/static/static-page";
import { ShieldCheck, AlertCircle, ThumbsUp } from "lucide-react";

export default function SafetyTipsPage() {
  return (
    <StaticPage title="Sicherheitstipps">
      <div className="mb-6">
        <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-4">
          <p className="font-semibold text-red-600 text-sm md:text-base">
            speedjob.at ist eine Kontaktplattform. Wir sind nicht Vertragspartner und prüfen keine Leistungen verbindlich. Jede Kontaktaufnahme, Beauftragung, Zahlung und Durchführung erfolgt eigenverantwortlich zwischen den Nutzern.
          </p>
        </div>
        <p className="mb-4">
          Diese Tipps helfen, Risiken zu reduzieren. Sie ersetzen keine eigene Prüfung und keine fachliche oder rechtliche Beratung. speedjob.at haftet, soweit gesetzlich zulässig, nicht für Schäden, Streitigkeiten, Zahlungsausfälle oder mangelhafte Leistungen zwischen Nutzern.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <div className="bg-blue-50 p-6 rounded-lg border border-blue-100">
          <div className="flex items-center mb-4">
            <ShieldCheck className="text-blue-500 h-8 w-8 mr-3" />
            <h2 className="text-xl font-semibold">Für Auftraggeber</h2>
          </div>
          <ul className="space-y-4">
            <li className="flex items-start"><AlertCircle className="text-red-500 h-5 w-5 mr-2 mt-0.5 flex-shrink-0" /><p><strong>Profil prüfen:</strong> Lesen Sie Beschreibung, Dienstleistung, Region und Bewertungen genau.</p></li>
            <li className="flex items-start"><AlertCircle className="text-red-500 h-5 w-5 mr-2 mt-0.5 flex-shrink-0" /><p><strong>Qualifikation erfragen:</strong> Fragen Sie bei Facharbeiten nach Ausbildung, Erfahrung, Gewerbeberechtigung oder Versicherung.</p></li>
            <li className="flex items-start"><AlertCircle className="text-red-500 h-5 w-5 mr-2 mt-0.5 flex-shrink-0" /><p><strong>Absprachen schriftlich machen:</strong> Klären Sie Preis, Umfang, Termin, Material, Anfahrt und Zahlungsart vorab.</p></li>
            <li className="flex items-start"><AlertCircle className="text-red-500 h-5 w-5 mr-2 mt-0.5 flex-shrink-0" /><p><strong>Vorsicht bei Vorauszahlungen:</strong> Zahlen Sie keine großen Beträge vorab, wenn Sie die Person nicht sicher einschätzen können.</p></li>
            <li className="flex items-start"><AlertCircle className="text-red-500 h-5 w-5 mr-2 mt-0.5 flex-shrink-0" /><p><strong>Verdacht melden:</strong> Melden Sie unseriöses Verhalten an kontaktspeedjob@gmail.com.</p></li>
          </ul>
        </div>

        <div className="bg-green-50 p-6 rounded-lg border border-green-100">
          <div className="flex items-center mb-4">
            <ShieldCheck className="text-green-500 h-8 w-8 mr-3" />
            <h2 className="text-xl font-semibold">Für Dienstleister</h2>
          </div>
          <ul className="space-y-4">
            <li className="flex items-start"><AlertCircle className="text-red-500 h-5 w-5 mr-2 mt-0.5 flex-shrink-0" /><p><strong>Nur erlaubte Leistungen anbieten:</strong> Bieten Sie nur Tätigkeiten an, die Sie fachlich und rechtlich ausführen dürfen.</p></li>
            <li className="flex items-start"><AlertCircle className="text-red-500 h-5 w-5 mr-2 mt-0.5 flex-shrink-0" /><p><strong>Ehrliche Angaben:</strong> Erfahrung, Verfügbarkeit, Preise und Qualifikationen müssen korrekt sein.</p></li>
            <li className="flex items-start"><AlertCircle className="text-red-500 h-5 w-5 mr-2 mt-0.5 flex-shrink-0" /><p><strong>Auftrag dokumentieren:</strong> Halten Sie Leistung, Preis, Ort und Termin schriftlich fest.</p></li>
            <li className="flex items-start"><AlertCircle className="text-red-500 h-5 w-5 mr-2 mt-0.5 flex-shrink-0" /><p><strong>Pflichten beachten:</strong> Steuern, Versicherung, Gewerbe und sonstige rechtliche Pflichten liegen bei Ihnen.</p></li>
            <li className="flex items-start"><AlertCircle className="text-red-500 h-5 w-5 mr-2 mt-0.5 flex-shrink-0" /><p><strong>Bei Unsicherheit ablehnen:</strong> Nehmen Sie keine Aufträge an, die Sie nicht sicher erfüllen können.</p></li>
          </ul>
        </div>
      </div>

      <div className="bg-gray-50 p-6 rounded-lg mb-8">
        <div className="flex items-center mb-4">
          <ThumbsUp className="text-primary h-8 w-8 mr-3" />
          <h2 className="text-xl font-semibold">Allgemeine Sicherheit</h2>
        </div>
        <ul className="space-y-3">
          <li className="flex items-start"><div className="bg-primary/10 rounded-full p-1 mr-3 mt-0.5"><span className="text-xs font-bold">1</span></div><p><strong>Passwort schützen:</strong> Geben Sie Ihr Passwort niemals weiter.</p></li>
          <li className="flex items-start"><div className="bg-primary/10 rounded-full p-1 mr-3 mt-0.5"><span className="text-xs font-bold">2</span></div><p><strong>Keine sensiblen Daten unnötig teilen:</strong> Geben Sie nur weiter, was für den Auftrag erforderlich ist.</p></li>
          <li className="flex items-start"><div className="bg-primary/10 rounded-full p-1 mr-3 mt-0.5"><span className="text-xs font-bold">3</span></div><p><strong>Vorsicht bei Links:</strong> Klicken Sie nicht auf verdächtige Links oder Anhänge.</p></li>
          <li className="flex items-start"><div className="bg-primary/10 rounded-full p-1 mr-3 mt-0.5"><span className="text-xs font-bold">4</span></div><p><strong>Nachweise aufbewahren:</strong> Speichern Sie Absprachen, Rechnungen und Zahlungsbestätigungen.</p></li>
          <li className="flex items-start"><div className="bg-primary/10 rounded-full p-1 mr-3 mt-0.5"><span className="text-xs font-bold">5</span></div><p><strong>Plattformregeln beachten:</strong> Nutzen Sie speedjob.at fair, ehrlich und rechtmäßig.</p></li>
        </ul>
      </div>

      <div className="bg-yellow-50 p-6 rounded-lg border border-yellow-200">
        <h2 className="text-xl font-semibold mb-4">Warnsignale</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>extrem niedrige Preise oder unrealistische Versprechen,</li>
          <li>Druck zu schneller Zahlung,</li>
          <li>unvollständige oder widersprüchliche Angaben,</li>
          <li>fehlende Nachweise bei Facharbeiten,</li>
          <li>ungewöhnliche Zahlungswege.</li>
        </ul>
        <p className="mt-4 font-semibold">Im Zweifel lieber abbrechen und keine Zahlung oder sensiblen Daten übermitteln.</p>
      </div>
    </StaticPage>
  );
}
