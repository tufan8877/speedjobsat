import StaticPage from "@/components/static/static-page";
import { ShieldCheck, AlertCircle, ThumbsUp } from "lucide-react";

export default function SafetyTipsPage() {
  return (
    <StaticPage title="Sicherheitstipps">
      <div className="mb-6">
        <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-4">
          <p className="font-semibold text-red-600 text-sm md:text-base">
            WICHTIGER HINWEIS: speedjobs.at ist ausschließlich eine Vermittlungsplattform und übernimmt keinerlei 
            Verantwortung für Handlungen, Vereinbarungen oder Konflikte zwischen Dienstleistern und Auftraggebern.
            Jegliche Beauftragung erfolgt auf eigenes Risiko der beteiligten Parteien.
          </p>
        </div>
        
        <p className="mb-4">
          Als Plattform für die Vermittlung zwischen privaten Dienstleistern und Auftraggebern 
          möchten wir Ihnen einige Sicherheitstipps mit auf den Weg geben. 
          Diese können Ihnen helfen, Risiken zu reduzieren, sind jedoch keine Garantie für eine sichere Transaktion. 
          Die Nutzung dieser Tipps und jegliche Interaktionen über speedjobs.at erfolgen auf eigene Verantwortung.
        </p>
      </div>
      
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <div className="bg-blue-50 p-6 rounded-lg border border-blue-100">
          <div className="flex items-center mb-4">
            <ShieldCheck className="text-blue-500 h-8 w-8 mr-3" />
            <h2 className="text-xl font-semibold">Für Kunden</h2>
          </div>
          <ul className="space-y-4">
            <li className="flex items-start">
              <AlertCircle className="text-red-500 h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
              <p><strong>Überprüfen Sie Profile und Bewertungen</strong> – Lesen Sie Bewertungen und Feedback anderer Kunden, bevor Sie einen Dienstleister kontaktieren.</p>
            </li>
            <li className="flex items-start">
              <AlertCircle className="text-red-500 h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
              <p><strong>Vereinbaren Sie klare Bedingungen</strong> – Klären Sie vorab Preise, Umfang der Arbeit und Zeitrahmen.</p>
            </li>
            <li className="flex items-start">
              <AlertCircle className="text-red-500 h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
              <p><strong>Vorsicht bei Vorauszahlungen</strong> – Seien Sie vorsichtig bei hohen Vorauszahlungen, bevor die Dienstleistung erbracht wurde.</p>
            </li>
            <li className="flex items-start">
              <AlertCircle className="text-red-500 h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
              <p><strong>Persönliche Daten schützen</strong> – Geben Sie nur die notwendigen persönlichen Informationen preis.</p>
            </li>
            <li className="flex items-start">
              <AlertCircle className="text-red-500 h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
              <p><strong>Treffen an sicheren Orten</strong> – Bei persönlichen Treffen wählen Sie öffentliche oder gut besuchte Orte.</p>
            </li>
            <li className="flex items-start">
              <AlertCircle className="text-red-500 h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
              <p><strong>Auf Ihr Bauchgefühl hören</strong> – Wenn etwas zu gut erscheint, um wahr zu sein, ist es das möglicherweise auch.</p>
            </li>
            <li className="flex items-start">
              <AlertCircle className="text-red-500 h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
              <p><strong>Qualifikationen überprüfen</strong> – Fragen Sie bei Bedarf nach Qualifikationen, Referenzen oder Zertifikaten.</p>
            </li>
          </ul>
        </div>
        
        <div className="bg-green-50 p-6 rounded-lg border border-green-100">
          <div className="flex items-center mb-4">
            <ShieldCheck className="text-green-500 h-8 w-8 mr-3" />
            <h2 className="text-xl font-semibold">Für Dienstleister</h2>
          </div>
          <ul className="space-y-4">
            <li className="flex items-start">
              <AlertCircle className="text-red-500 h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
              <p><strong>Vollständiges Profil erstellen</strong> – Ein detailliertes und transparentes Profil schafft Vertrauen bei potenziellen Kunden.</p>
            </li>
            <li className="flex items-start">
              <AlertCircle className="text-red-500 h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
              <p><strong>Klare Kommunikation</strong> – Kommunizieren Sie offen und ehrlich über Ihre Fähigkeiten, Preise und Verfügbarkeit.</p>
            </li>
            <li className="flex items-start">
              <AlertCircle className="text-red-500 h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
              <p><strong>Geschäftliche und private Kommunikation trennen</strong> – Nutzen Sie eine separate E-Mail-Adresse oder Telefonnummer für Ihre Dienstleistungen.</p>
            </li>
            <li className="flex items-start">
              <AlertCircle className="text-red-500 h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
              <p><strong>Vorsicht bei Zahlungsvereinbarungen</strong> – Vereinbaren Sie klare Zahlungsbedingungen und vermeiden Sie dubiose Zahlungsmethoden.</p>
            </li>
            <li className="flex items-start">
              <AlertCircle className="text-red-500 h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
              <p><strong>Dokumentieren Sie Vereinbarungen</strong> – Halten Sie Absprachen schriftlich fest, um Missverständnisse zu vermeiden.</p>
            </li>
            <li className="flex items-start">
              <AlertCircle className="text-red-500 h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
              <p><strong>Sicherheit bei Kundenterminen</strong> – Informieren Sie jemanden über Ihren Standort, wenn Sie Kunden besuchen.</p>
            </li>
            <li className="flex items-start">
              <AlertCircle className="text-red-500 h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
              <p><strong>Auf verdächtiges Verhalten achten</strong> – Seien Sie vorsichtig bei ungewöhnlichen Anfragen oder Verhaltensweisen.</p>
            </li>
          </ul>
        </div>
      </div>
      
      <div className="bg-gray-50 p-6 rounded-lg mb-8">
        <div className="flex items-center mb-4">
          <ThumbsUp className="text-primary h-8 w-8 mr-3" />
          <h2 className="text-xl font-semibold">Allgemeine Tipps für Online-Sicherheit</h2>
        </div>
        <ul className="space-y-3">
          <li className="flex items-start">
            <div className="bg-primary/10 rounded-full p-1 mr-3 mt-0.5">
              <span className="text-xs font-bold">1</span>
            </div>
            <p><strong>Starke Passwörter verwenden</strong> – Erstellen Sie komplexe, einzigartige Passwörter für Ihr speedjobs.at-Konto und ändern Sie diese regelmäßig.</p>
          </li>
          <li className="flex items-start">
            <div className="bg-primary/10 rounded-full p-1 mr-3 mt-0.5">
              <span className="text-xs font-bold">2</span>
            </div>
            <p><strong>Verdächtige Aktivitäten melden</strong> – Melden Sie verdächtige Benutzer oder Aktivitäten an unser Team unter kontaktspeedjobs@gmail.com.</p>
          </li>
          <li className="flex items-start">
            <div className="bg-primary/10 rounded-full p-1 mr-3 mt-0.5">
              <span className="text-xs font-bold">3</span>
            </div>
            <p><strong>Vorsicht bei Links und Anhängen</strong> – Klicken Sie nicht auf verdächtige Links oder öffnen Sie unerwartete Anhänge in der Kommunikation.</p>
          </li>
          <li className="flex items-start">
            <div className="bg-primary/10 rounded-full p-1 mr-3 mt-0.5">
              <span className="text-xs font-bold">4</span>
            </div>
            <p><strong>Regelmäßige Überprüfung der Kontoaktivitäten</strong> – Überprüfen Sie regelmäßig Ihre Kontoaktivitäten auf ungewöhnliche Aktionen.</p>
          </li>
          <li className="flex items-start">
            <div className="bg-primary/10 rounded-full p-1 mr-3 mt-0.5">
              <span className="text-xs font-bold">5</span>
            </div>
            <p><strong>Software aktualisieren</strong> – Halten Sie Ihren Browser und Ihre Geräte mit den neuesten Sicherheitsupdates auf dem aktuellen Stand.</p>
          </li>
        </ul>
      </div>
      
      <div className="bg-yellow-50 p-6 rounded-lg border border-yellow-200">
        <h2 className="text-xl font-semibold mb-4">Betrugswarnung</h2>
        <p className="mb-4">
          Seien Sie wachsam gegenüber häufigen Betrugsversuchen:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li><strong>Ungewöhnlich niedrige Preise</strong> – Extrem niedrige Preise können ein Warnsignal sein.</li>
          <li><strong>Dringende Zahlungsaufforderungen</strong> – Vorsicht bei Druck zu sofortigen Zahlungen oder ungewöhnlichen Zahlungsmethoden.</li>
          <li><strong>Unvollständige Profile</strong> – Seien Sie vorsichtig bei Profilen mit minimalen Informationen oder ohne Bewertungen.</li>
          <li><strong>Identitätsdiebstahl</strong> – speedjobs.at wird Sie niemals nach Ihrem Passwort oder Ihren vollständigen Bankdaten fragen.</li>
        </ul>
        <p className="mt-4 font-semibold">
          Im Zweifelsfall immer Vorsicht walten lassen und lieber einmal mehr nachfragen.
        </p>
      </div>
    </StaticPage>
  );
}