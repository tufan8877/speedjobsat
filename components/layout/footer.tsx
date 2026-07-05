import { Link } from "wouter";

export default function Footer() {
  return (
    <footer className="bg-gray-800 text-gray-300 text-sm sm:text-base">
      <div className="container px-4 py-5 sm:py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-5 gap-y-5 md:gap-8">
          <div>
            <h3 className="text-white font-semibold text-base sm:text-lg mb-2 sm:mb-4">Über uns</h3>
            <ul className="space-y-1.5 sm:space-y-2">
              <li><Link href="/ueber-uns" className="hover:text-white transition">Über speedjob.at</Link></li>
              <li><Link href="/kontakt" className="hover:text-white transition">Kontakt</Link></li>
              <li><Link href="/impressum" className="hover:text-white transition">Impressum</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold text-base sm:text-lg mb-2 sm:mb-4">Dienstleistungen</h3>
            <ul className="space-y-1.5 sm:space-y-2">
              <li><Link href="/suche" className="hover:text-white transition">Alle Dienstleistungen</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold text-base sm:text-lg mb-2 sm:mb-4">Support</h3>
            <ul className="space-y-1.5 sm:space-y-2">
              <li><Link href="/hilfe-faq" className="hover:text-white transition">Hilfe & FAQ</Link></li>
              <li><Link href="/sicherheitstipps" className="hover:text-white transition">Sicherheitstipps</Link></li>
              <li><Link href="/nutzungsbedingungen" className="hover:text-white transition">Nutzungsbedingungen</Link></li>
              <li><Link href="/datenschutz" className="hover:text-white transition">Datenschutz</Link></li>
              <li><Link href="/support" className="hover:text-white transition">Support</Link></li>
            </ul>
          </div>

          <div className="col-span-2 md:col-span-1 min-w-0">
            <h3 className="text-white font-semibold text-base sm:text-lg mb-2 sm:mb-4">Kontakt</h3>
            <ul className="space-y-1.5 sm:space-y-2">
              <li className="min-w-0">
                <a href="mailto:kontaktspeedjob@gmail.com" className="hover:text-white transition inline-flex items-center min-w-0 leading-snug">
                  <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 flex-shrink-0"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                  <span className="truncate max-w-[260px] sm:max-w-none">kontaktspeedjob@gmail.com</span>
                </a>
              </li>
              <li>
                <div className="flex items-center text-gray-300">
                  <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 flex-shrink-0"><path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 5a3 3 0 1 1-3 3 3 3 0 0 1 3-3zm-7 7.5a7.5 7.5 0 0 1 14.993 0A8.5 8.5 0 0 1 12 17a8.5 8.5 0 0 1-7-2.5z"></path></svg>
                  Österreich
                </div>
              </li>
            </ul>
            <div className="mt-3 text-xs sm:text-sm leading-relaxed">
              <Link href="/impressum" className="text-gray-400 hover:text-white transition">
                Impressum
              </Link>
              <span className="text-gray-500"> · </span>
              <Link href="/datenschutz" className="text-gray-400 hover:text-white transition">
                Datenschutz
              </Link>
              <span className="text-gray-500"> · </span>
              <Link href="/nutzungsbedingungen" className="text-gray-400 hover:text-white transition">
                Nutzungsbedingungen
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-5 pt-4 border-t border-gray-700 flex flex-col md:flex-row justify-between items-start md:items-center gap-2 text-xs sm:text-sm">
          <p className="leading-snug">&copy; {new Date().getFullYear()} speedjob.at - Alle Rechte vorbehalten.</p>
          <div className="flex items-center">
            <svg className="h-3.5 w-auto mr-2" viewBox="0 0 36 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="0" y="0" width="36" height="24" fill="#ed2939" />
              <rect x="0" y="8" width="36" height="8" fill="#ffffff" />
            </svg>
            <span>Österreich</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
