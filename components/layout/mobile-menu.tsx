import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { X } from "lucide-react";
import { User } from "@shared/schema";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onLogout: () => void;
}

export default function MobileMenu({ isOpen, onClose, user, onLogout }: MobileMenuProps) {
  if (!isOpen) return null;

  const initials = user?.email ? user.email.substring(0, 2).toUpperCase() : "";

  const menuItems = user
    ? [
        { href: "/profil", label: "Mein Profil" },
        { href: "/profil?tab=settings", label: "Einstellungen" },
        { href: "/favoriten", label: "Meine Favoriten" },
        { href: "/ueber-uns", label: "Über uns" },
        { href: "/support", label: "Support" },
        { href: "/hilfe-faq", label: "Hilfe & FAQ" },
      ]
    : [
        { href: "/ueber-uns", label: "Über uns" },
        { href: "/support", label: "Support" },
        { href: "/hilfe-faq", label: "Hilfe & FAQ" },
      ];

  return (
    <div className="fixed inset-0 bg-white z-50 overflow-y-auto">
      <div className="min-h-full px-6 pt-6 pb-8">
        <div className="flex justify-between items-center mb-8">
          <Link href="/" className="flex items-center" onClick={onClose}>
            <span className="text-primary text-2xl font-bold font-title">
              speedjobs<span className="text-secondary">.at</span>
            </span>
          </Link>
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
            <X className="h-6 w-6" />
          </Button>
        </div>

        {user && (
          <div className="flex items-center gap-4 mb-8 pb-6 border-b border-gray-100">
            <Avatar className="h-16 w-16 flex-shrink-0">
              <AvatarFallback className="bg-primary text-white text-xl">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <div className="font-medium text-xl text-gray-900 truncate">
                {user.email}
              </div>
              <div className="text-base text-gray-500">
                {user.isAdmin ? "Administrator" : "Benutzer"}
              </div>
            </div>
          </div>
        )}

        <nav className="mb-8">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block text-gray-700 py-5 border-b border-gray-100 text-2xl font-normal leading-none"
              onClick={onClose}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex flex-col space-y-3">
          {user ? (
            <Button
              variant="outline"
              className="w-full py-6 text-base border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
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
                <Button variant="outline" className="w-full py-6 text-base">
                  Anmelden
                </Button>
              </Link>
              <Link href="/auth?tab=register" onClick={onClose} className="w-full">
                <Button className="w-full py-6 text-base bg-primary text-white">
                  Registrieren
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
