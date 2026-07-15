import { Button } from "@/components/ui/button";
import { Link, useLocation } from "wouter";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { LogOut, User as UserIcon, Shield, Heart, UserRound } from "lucide-react";
import { useState } from "react";
import MobileMenu from "./mobile-menu";
import BrandLogo from "./brand-logo";
import { useAuth } from "@/hooks/use-auth";

export default function Header() {
  const { user, isLoading, logout, logoutPending } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [, setLocation] = useLocation();

  const goHome = (event?: React.MouseEvent) => {
    event?.preventDefault();
    setMobileMenuOpen(false);
    setLocation("/");
    window.setTimeout(() => {
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    }, 0);
  };

  return (
    <>
      <header className="site-header-fixed border-b border-slate-100 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex h-[70px] items-center justify-between">
            <Link href="/" onClick={goHome} className="cursor-pointer" aria-label="speedjob.at Startseite">
              <BrandLogo />
            </Link>

            <nav className="hidden items-center gap-7 lg:flex">
              <Link href="/suche" className="font-semibold text-primary/90 transition-colors hover:text-secondary">
                Für Dienstleistungen
              </Link>
              <Link href="/hilfe-faq" className="font-semibold text-primary/90 transition-colors hover:text-secondary">
                Hilfe
              </Link>
              <Link href="/ueber-uns" className="font-semibold text-primary/90 transition-colors hover:text-secondary">
                Über uns
              </Link>
              {user && (
                <Link href="/favoriten" className="font-semibold text-primary/90 transition-colors hover:text-secondary">
                  Favoriten
                </Link>
              )}
            </nav>

            <div className="hidden items-center gap-3 md:flex">
              {isLoading ? (
                <div className="h-9 w-9 animate-pulse rounded-full bg-slate-200" />
              ) : user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-10 w-10 rounded-full border border-slate-200">
                      <Avatar className="h-9 w-9">
                        <AvatarImage src={`https://avatar.vercel.sh/${user.email}`} alt={user.email} />
                        <AvatarFallback className="bg-primary text-white">
                          {user.email.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <div className="flex items-center justify-start gap-2 p-2">
                      <div className="flex flex-col space-y-1 leading-none">
                        <p className="font-medium">{user.email}</p>
                        <p className="break-all text-xs text-muted-foreground sm:break-normal">Status: {user.status}</p>
                      </div>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/profil" className="flex items-center">
                        <UserIcon className="mr-2 h-4 w-4" />
                        Profil verwalten
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/favoriten" className="flex items-center">
                        <Heart className="mr-2 h-4 w-4" />
                        Favoriten
                      </Link>
                    </DropdownMenuItem>
                    {user.isAdmin && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                          <Link href="/admin" className="flex items-center">
                            <Shield className="mr-2 h-4 w-4" />
                            Admin-Bereich
                          </Link>
                        </DropdownMenuItem>
                      </>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={logout} disabled={logoutPending} className="text-red-600 focus:text-red-600">
                      <LogOut className="mr-2 h-4 w-4" />
                      Abmelden
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <>
                  <Link href="/auth?tab=login">
                    <Button variant="outline" className="h-10 rounded-xl border-primary/25 px-5 font-bold text-primary hover:bg-primary/5">
                      Anmelden
                    </Button>
                  </Link>
                  <Link href="/auth?tab=register">
                    <Button className="h-10 rounded-xl bg-secondary px-5 font-bold text-white shadow-[0_8px_20px_rgba(255,107,11,0.25)] hover:bg-secondary/90">
                      <UserRound className="mr-2 h-4 w-4" />
                      Registrieren
                    </Button>
                  </Link>
                </>
              )}
            </div>

            <button
              className="rounded-xl p-2.5 hover:bg-slate-100 md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Menü öffnen"
            >
              <div className="space-y-1.5">
                <div className="h-0.5 w-6 bg-primary" />
                <div className="h-0.5 w-6 bg-primary" />
                <div className="h-0.5 w-6 bg-primary" />
              </div>
            </button>
          </div>
        </div>

        <MobileMenu isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} user={user} onLogout={logout} />
      </header>
      <div className="site-header-spacer" aria-hidden="true" />
    </>
  );
}
