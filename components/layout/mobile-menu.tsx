import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { X } from "lucide-react";
import { User } from "@shared/schema";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onLogout: () => void;
}

export default function MobileMenu({ isOpen, onClose, user, onLogout }: MobileMenuProps) {
  if (!isOpen) return null;
  
  // Benutzerinitiale für Avatar
  const initials = user?.email 
    ? user.email.substring(0, 2).toUpperCase()
    : "";
  
  return (
    <div className="fixed inset-0 bg-white z-40 p-4">
      <div className="flex justify-between items-center mb-8">
        <Link href="/" className="flex items-center space-x-2" onClick={onClose}>
          <span className="text-primary text-2xl font-bold font-title">
            speedjobs<span className="text-secondary">.at</span>
          </span>
        </Link>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-6 w-6" />
        </Button>
      </div>
      
      {user && (
        <div className="flex items-center space-x-3 mb-6 pb-6 border-b border-gray-100">
          <Avatar className="h-10 w-10">
            <AvatarFallback className="bg-primary text-white">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium">
              {user.email}
            </div>
            <div className="text-sm text-gray-500">
              {user.isAdmin ? "Administrator" : "Benutzer"}
            </div>
          </div>
        </div>
      )}
      
      <nav className="flex flex-col space-y-4 mb-8">
        <Link href="/suche" className="text-gray-700 py-2 border-b border-gray-100 font-medium" onClick={onClose}>
          Dienstleistungen
        </Link>
        <Link href="/auftraege" className="text-gray-700 py-2 border-b border-gray-100 font-medium" onClick={onClose}>
          Aufträge
        </Link>
        <Link href="/ueber-uns" className="text-gray-700 py-2 border-b border-gray-100 font-medium" onClick={onClose}>
          Über uns
        </Link>
        <Link href="/support" className="text-gray-700 py-2 border-b border-gray-100 font-medium" onClick={onClose}>
          Support
        </Link>
        <Link href="/hilfe-faq" className="text-gray-700 py-2 border-b border-gray-100 font-medium" onClick={onClose}>
          Hilfe & FAQ
        </Link>
        <Link href="/sicherheitstipps" className="text-gray-700 py-2 border-b border-gray-100 font-medium" onClick={onClose}>
          Sicherheitstipps
        </Link>
        
        {user && (
          <>
            <Link href="/profil" className="text-gray-700 py-2 border-b border-gray-100 font-medium" onClick={onClose}>
              Mein Profil
            </Link>
            <Link href="/profil?tab=settings" className="text-gray-700 py-2 border-b border-gray-100 font-medium" onClick={onClose}>
              Einstellungen
            </Link>
            <Link href="/favoriten" className="text-gray-700 py-2 border-b border-gray-100 font-medium" onClick={onClose}>
              Meine Favoriten
            </Link>
            <Link href="/auftraege?tab=my-jobs" className="text-gray-700 py-2 border-b border-gray-100 font-medium" onClick={onClose}>
              Meine Aufträge
            </Link>
            {user.isAdmin && (
              <Link href="/admin" className="text-gray-700 py-2 border-b border-gray-100 font-medium" onClick={onClose}>
                Admin-Bereich
              </Link>
            )}
          </>
        )}
      </nav>
      
      <div className="flex flex-col space-y-3">
        {user ? (
          <Button 
            variant="outline" 
            className="w-full py-3"
            onClick={() => {
              onLogout();
              onClose();
            }}
          >
            Abmelden
          </Button>
        ) : (
          <>
            <Link href="/auth" onClick={onClose} className="w-full">
              <Button variant="outline" className="w-full">
                Anmelden
              </Button>
            </Link>
            <Link href="/auth?tab=register" onClick={onClose} className="w-full">
              <Button className="w-full bg-primary text-white">
                Registrieren
              </Button>
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
