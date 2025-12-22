import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { useState, useEffect } from "react";
import { User } from "@shared/schema";

export default function CTASection() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch("/api/user");
        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
        }
      } catch (error) {
        console.error("Fehler beim Abrufen des Benutzerprofils:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUser();
  }, []);
  
  return (
    <section className="py-12 bg-primary-600 text-white">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between">
          <div className="mb-6 md:mb-0 text-center md:text-left">
            <h2 className="text-2xl md:text-3xl font-bold font-title mb-3">
              Bieten Sie Ihre Dienstleistungen an?
            </h2>
            <p className="opacity-90 max-w-xl">
              Erstellen Sie Ihr kostenloses Profil und finden Sie neue Kunden in ganz Österreich.
            </p>
          </div>
          <div>
            {isLoading ? (
              <div className="h-10 w-32 rounded bg-gray-200 animate-pulse"></div>
            ) : user ? (
              <Link href="/profil">
                <Button className="bg-white text-primary-600 hover:bg-gray-100">
                  Mein Profil bearbeiten
                </Button>
              </Link>
            ) : (
              <Link href="/auth?tab=register">
                <Button className="bg-white text-primary-600 hover:bg-gray-100">
                  Jetzt registrieren
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}