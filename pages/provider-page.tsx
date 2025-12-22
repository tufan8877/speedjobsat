import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import ProviderProfile from "@/components/profile/provider-profile";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft } from "lucide-react";
import { Link } from "wouter";

export default function ProviderPage() {
  const params = useParams();
  const profileId = parseInt(params.id || "0", 10);
  
  const { isLoading, error } = useQuery({
    queryKey: [`/api/profiles/${profileId}`],
  });
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="mb-6">
              <Link href="/suche">
                <Button variant="ghost" className="pl-0">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Zurück zur Suche
                </Button>
              </Link>
            </div>
            
            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Fehler beim Laden</h2>
                <p className="text-gray-600">
                  Das angeforderte Dienstleisterprofil konnte nicht geladen werden.
                </p>
              </div>
            ) : (
              <ProviderProfile profileId={profileId} />
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
