import StaticPage from "@/components/static/static-page";
import { Mail } from "lucide-react";

export default function ContactPage() {
  return (
    <StaticPage title="Kontakt">
      <div className="flex flex-col items-center mb-8">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
          <Mail className="h-8 w-8 text-primary" />
        </div>
        <h2 className="text-2xl font-semibold mb-2">Kontaktieren Sie uns</h2>
        <p className="text-center max-w-lg mb-6">
          Haben Sie Fragen, Anregungen oder benötigen Sie Unterstützung? 
          Unser Team steht Ihnen gerne zur Verfügung.
        </p>
      </div>
      
      <div className="bg-gray-50 rounded-lg p-6 mb-8 text-center">
        <h3 className="font-semibold text-xl mb-4">E-Mail-Kontakt</h3>
        <p className="mb-2">Sie erreichen uns unter folgender E-Mail-Adresse:</p>
        <a 
          href="mailto:kontaktspeedjobs@gmail.com" 
          className="text-primary font-medium text-lg hover:underline break-all sm:break-normal"
        >
          kontaktspeedjobs@gmail.com
        </a>
        
        <p className="mt-4 text-gray-600">
          Wir bemühen uns, alle Anfragen innerhalb von 24 Stunden zu beantworten.
        </p>
      </div>
      
      <div className="border-t pt-6 mt-8">
        <h3 className="text-xl font-semibold mb-4">Häufig gestellte Fragen</h3>
        <p className="mb-4">
          Bevor Sie uns kontaktieren, schauen Sie gerne in unsere 
          <a href="/hilfe-faq" className="text-primary hover:underline mx-1">FAQ-Seite</a>
          für schnelle Antworten auf häufig gestellte Fragen.
        </p>
      </div>
    </StaticPage>
  );
}