import StaticPage from "@/components/static/static-page";
import { Mail, HelpCircle, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function SupportPage() {
  return (
    <StaticPage title="Support">
      <div className="mb-8">
        <p className="mb-4">
          Über den Support können Sie Fragen zu Ihrem Konto, technischen Problemen, Profilen, Aufträgen, Bewertungen oder verdächtigem Verhalten melden. speedjob.at unterstützt bei der Nutzung der Plattform, ist jedoch nicht Partei von Vereinbarungen zwischen Nutzern.
        </p>
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
          <p className="text-sm text-yellow-800 font-medium">
            Hinweis: Der Support kann keine Rechtsberatung, Steuerberatung, Versicherungsberatung, Qualitätsprüfung oder Streitentscheidung zwischen Nutzern übernehmen.
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-10">
        <div className="bg-white border rounded-lg p-6 flex flex-col items-center text-center">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <MessageSquare className="h-6 w-6 text-primary" />
          </div>
          <h3 className="text-lg font-semibold mb-2">E-Mail Support</h3>
          <p className="mb-4 text-gray-600">Kontaktieren Sie uns bei technischen oder kontobezogenen Anliegen.</p>
          <a href="mailto:kontaktspeedjobs@gmail.com" className="mt-auto text-primary hover:underline font-medium">kontaktspeedjobs@gmail.com</a>
        </div>

        <div className="bg-white border rounded-lg p-6 flex flex-col items-center text-center">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <HelpCircle className="h-6 w-6 text-primary" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Hilfe & FAQ</h3>
          <p className="mb-4 text-gray-600">Antworten zu Auftrag, Profil, Bewertungen, Datenschutz und Plattformregeln.</p>
          <Link href="/hilfe-faq" className="mt-auto"><Button variant="outline">Zum FAQ</Button></Link>
        </div>

        <div className="bg-white border rounded-lg p-6 flex flex-col items-center text-center">
          <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
            <Mail className="h-6 w-6 text-primary" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Melden & Feedback</h3>
          <p className="mb-4 text-gray-600">Melden Sie technische Fehler, verdächtige Profile oder geben Sie Feedback.</p>
          <a href="mailto:kontaktspeedjobs@gmail.com?subject=speedjob.at%20Support" className="mt-auto"><Button variant="outline">Nachricht senden</Button></a>
        </div>
      </div>

      <div className="bg-gray-50 rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Damit wir schneller helfen können</h2>
        <ul className="list-disc pl-6 space-y-2 mb-4">
          <li>Beschreiben Sie Ihr Anliegen klar und vollständig.</li>
          <li>Geben Sie Ihre registrierte E-Mail-Adresse an.</li>
          <li>Nennen Sie bei Profilen oder Aufträgen möglichst den Namen, Titel oder Link.</li>
          <li>Beschreiben Sie technische Probleme mit Gerät, Browser und Zeitpunkt.</li>
          <li>Senden Sie niemals Ihr Passwort oder vollständige Zahlungsdaten.</li>
        </ul>
        <p>
          Wir bemühen uns um zeitnahe Rückmeldung. Eine bestimmte Reaktionszeit wird jedoch nicht garantiert.
        </p>
      </div>

      <div className="bg-white border rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Was der Support nicht leisten kann</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>keine Garantie für Dienstleister, Auftraggeber oder Bewertungen,</li>
          <li>keine Durchsetzung von Zahlungen oder privaten Vereinbarungen,</li>
          <li>keine Prüfung von Gewerbeberechtigungen, Versicherungen oder Qualifikationen,</li>
          <li>keine Haftung für Schäden oder Konflikte zwischen Nutzern, soweit gesetzlich zulässig.</li>
        </ul>
      </div>

      <div className="bg-white border rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Hilfreiche Ressourcen</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <Link href="/sicherheitstipps" className="p-4 border rounded hover:bg-gray-50 flex items-center">
            <div className="bg-red-100 rounded-full p-2 mr-3">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-600"><path d="m12 3 8 4.5v9L12 21l-8-4.5v-9L12 3"/><path d="M12 9v4"/><path d="M12 16h.01"/></svg>
            </div>
            <div>
              <h3 className="font-medium">Sicherheitstipps</h3>
              <p className="text-sm text-gray-600">Tipps zur sicheren Nutzung von speedjob.at</p>
            </div>
          </Link>

          <Link href="/nutzungsbedingungen" className="p-4 border rounded hover:bg-gray-50 flex items-center">
            <div className="bg-blue-100 rounded-full p-2 mr-3">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600"><path d="M14 3v4a1 1 0 0 0 1 1h4"/><path d="M17 21H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7l5 5v11a2 2 0 0 1-2 2z"/><line x1="9" y1="9" x2="10" y2="9"/><line x1="9" y1="13" x2="15" y2="13"/><line x1="9" y1="17" x2="15" y2="17"/></svg>
            </div>
            <div>
              <h3 className="font-medium">Nutzungsbedingungen</h3>
              <p className="text-sm text-gray-600">Regeln und Haftungshinweise zur Plattform</p>
            </div>
          </Link>

          <Link href="/datenschutz" className="p-4 border rounded hover:bg-gray-50 flex items-center">
            <div className="bg-green-100 rounded-full p-2 mr-3">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-600"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            </div>
            <div>
              <h3 className="font-medium">Datenschutz</h3>
              <p className="text-sm text-gray-600">Informationen zur Verarbeitung personenbezogener Daten</p>
            </div>
          </Link>

          <Link href="/hilfe-faq" className="p-4 border rounded hover:bg-gray-50 flex items-center">
            <div className="bg-purple-100 rounded-full p-2 mr-3">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-600"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
            </div>
            <div>
              <h3 className="font-medium">Hilfe & FAQ</h3>
              <p className="text-sm text-gray-600">Antworten auf häufige Fragen</p>
            </div>
          </Link>
        </div>
      </div>
    </StaticPage>
  );
}
