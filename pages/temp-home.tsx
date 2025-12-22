import { Button } from "@/components/ui/button";
import { Link } from "wouter";

/**
 * Einfache temporäre Homepage ohne Auth-Abhängigkeiten
 */
export default function TempHomePage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center">
          speedjobs<span className="text-primary">.at</span>
        </h1>
        
        <div className="text-center mb-8">
          <p className="text-xl mb-4">
            Die Plattform für Dienstleistungen in Österreich
          </p>
          <div className="flex justify-center gap-4">
            <Link href="/auth">
              <Button variant="outline">Anmelden</Button>
            </Link>
            <Link href="/auth?tab=register">
              <Button>Registrieren</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}