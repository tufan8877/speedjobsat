import { Button } from "@/components/ui/button";
import { Link, useLocation } from "wouter";
import {
  Heart,
  HelpCircle,
  Home,
  LogIn,
  LogOut,
  MapPin,
  Search,
  Settings,
  Shield,
  User as UserIcon,
  UserPlus,
  UserRound,
  X,
} from "lucide-react";
import { User } from "@shared/schema";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useEffect } from "react";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onLogout: () => void;
}

function BrandLogo() {
  return (
    <div className="flex items-center gap-2.5">
      <div className="relative flex h-11 w-9 items-center justify-center">
        <MapPin className="absolute h-11 w-11 fill-[#ff6b0b] text-[#ff6b0b]" strokeWidth={1.6} />
        <div className="relative -mt-1 flex h-6 w-6 items-center justify-center rounded-full bg-white shadow-sm">
          <UserRound className="h-4 w-4 fill-[#072b4c] text-[#072b4c]" strokeWidth={2} />
        </div>
      </div>
      <span className="text-[1.55rem] font-black uppercase tracking-[-0.045em] text-[#072b4c]">
        Speed<span className="text-[#ff6b0b]">Job</span><span className="text-[#072b4c]">.at</span>
      </span>
    </div>
  );
}

export default function MobileMenu({ isOpen, onClose, user, onLogout }: MobileMenuProps) {
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const initials = user?.email ? user.email.substring(0, 2).toUpperCase() : "";

  const navigate = (href: string) => {
    onClose();
    setLocation(href);
    window.setTimeout(() => window.scrollTo({ top: 0, left: 0, behavior: "auto" }), 0);
  };

  const menuItems = user
    ? [
        { href: "/", label: "Startseite", icon: Home },
        { href: "/suche", label: "Dienstleistungen", icon: Search },
        { href: "/profil", label: "Mein Profil", icon: UserIcon },
        { href: "/profil?tab=settings", label: "Einstellungen", icon: Settings },
        { href: "/favoriten", label: "Meine Favoriten", icon: Heart },
        { href: "/ueber-uns", label: "Über uns", icon: UserRound },
        { href: "/hilfe-faq", label: "Hilfe & FAQ", icon: HelpCircle },
      ]
    : [
        { href: "/", label: "Startseite", icon: Home },
        { href: "/suche", label: "Dienstleistungen", icon: Search },
        { href: "/ueber-uns", label: "Über uns", icon: UserRound },
        { href: "/hilfe-faq", label: "So funktioniert’s", icon: HelpCircle },
        { href: "/kontakt", label: "Kontakt", icon: HelpCircle },
      ];

  return (
    <div className="fixed inset-0 z-[9999] bg-[#f7f9fb] md:hidden" role="dialog" aria-modal="true" aria-label="Hauptmenü">
      <div className="flex h-full flex-col overflow-y-auto">
        <div className="flex min-h-[82px] items-center justify-between border-b border-slate-200 bg-white px-4 shadow-sm">
          <button type="button" onClick={() => navigate("/")} aria-label="Zur Startseite">
            <BrandLogo />
          </button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-11 w-11 rounded-xl text-[#072b4c] hover:bg-slate-100"
            aria-label="Menü schließen"
          >
            <X className="h-7 w-7" />
          </Button>
        </div>

        <div className="flex-1 px-4 pb-8 pt-6">
          {user && (
            <div className="mb-6 flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <Avatar className="h-12 w-12">
                <AvatarFallback className="bg-[#072b4c] font-bold text-white">{initials}</AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <div className="truncate font-bold text-[#072b4c]">{user.email}</div>
                <div className="text-sm text-slate-500">{user.isAdmin ? "Administrator" : "Registrierter Nutzer"}</div>
              </div>
            </div>
          )}

          <nav className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            {menuItems.map((item, index) => {
              const Icon = item.icon;
              return (
                <button
                  type="button"
                  key={item.href}
                  onClick={() => navigate(item.href)}
                  className={`flex w-full items-center gap-3 px-4 py-4 text-left font-semibold text-[#183550] transition hover:bg-[#fff4eb] hover:text-[#ff6b0b] ${
                    index < menuItems.length - 1 ? "border-b border-slate-100" : ""
                  }`}
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#fff0e5] text-[#ff6b0b]">
                    <Icon className="h-5 w-5" />
                  </span>
                  {item.label}
                </button>
              );
            })}
          </nav>

          <div className="mt-6 flex flex-col gap-3">
            {user ? (
              <>
                {user.isAdmin && (
                  <Button
                    variant="outline"
                    className="h-12 w-full rounded-xl border-[#072b4c]/20 font-bold text-[#072b4c]"
                    onClick={() => navigate("/admin")}
                  >
                    <Shield className="mr-2 h-5 w-5" /> Admin-Bereich
                  </Button>
                )}
                <Button
                  variant="outline"
                  className="h-12 w-full rounded-xl border-red-200 font-bold text-red-600 hover:bg-red-50 hover:text-red-700"
                  onClick={() => {
                    onLogout();
                    onClose();
                  }}
                >
                  <LogOut className="mr-2 h-5 w-5" /> Abmelden
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  className="h-12 w-full rounded-xl border-[#072b4c] font-bold text-[#072b4c] hover:bg-[#072b4c]/5"
                  onClick={() => navigate("/auth?tab=login")}
                >
                  <LogIn className="mr-2 h-5 w-5" /> Anmelden
                </Button>
                <Button
                  className="h-12 w-full rounded-xl bg-[#ff6b0b] font-bold text-white shadow-[0_10px_24px_rgba(255,107,11,0.25)] hover:bg-[#ea5c00]"
                  onClick={() => navigate("/auth?tab=register")}
                >
                  <UserPlus className="mr-2 h-5 w-5" /> Kostenlos registrieren
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
