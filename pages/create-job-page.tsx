import { SimpleWorkingForm } from "@/components/jobs/simple-working-form";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "wouter";
import { ArrowLeft } from "lucide-react";

/**
 * Seite zum Erstellen eines neuen Auftrags
 */
export default function CreateJobPage() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  
  // Wenn kein Benutzer angemeldet ist, zur Anmeldeseite weiterleiten
  if (!user) {
    navigate("/auth?redirect=/auftrag-erstellen");
    return null;
  }
  
  return (
    <div className="container py-8">
      <div className="mb-8">
        <Link href="/auftraege" className="inline-flex items-center">
          <Button variant="ghost" className="pl-0">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Zurück zur Übersicht
          </Button>
        </Link>
        
        <h1 className="text-3xl font-bold mt-3">Neuen Auftrag erstellen</h1>
        <p className="text-muted-foreground mt-1">
          Erstellen Sie einen neuen Auftrag, um Dienstleister zu finden.
        </p>
      </div>
      
      <SimpleWorkingForm />
    </div>
  );
}