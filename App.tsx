import { Switch, Route, useLocation, useSearch } from "wouter";
import { lazy, Suspense, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { ProtectedRoute } from "@/lib/protected-route";

// Jede Seite wird erst geladen, wenn sie tatsächlich aufgerufen wird, statt
// alle Seiten (inkl. Admin-Dashboard, Job-Formulare etc.) in ein einziges
// großes Bundle zu packen, das jeder Besucher komplett laden muss.
const NotFound = lazy(() => import("@/pages/not-found"));
const HomePage = lazy(() => import("@/pages/home-page"));
const AuthPage = lazy(() => import("@/pages/auth-page"));
const ProfilePage = lazy(() => import("@/pages/profile-page"));
const SearchPage = lazy(() => import("@/pages/search-page"));
const AdminPage = lazy(() => import("@/pages/admin-page"));
const ProviderPage = lazy(() => import("@/pages/provider-page"));
const FavoritesPage = lazy(() => import("@/pages/favorites-page"));
const JobsPage = lazy(() => import("@/pages/jobs-page"));
const CreateJobPage = lazy(() => import("@/pages/create-job-page"));
const EditJobPage = lazy(() => import("@/pages/edit-job-page"));
const JobDetailPage = lazy(() => import("@/pages/job-detail-page"));

// Statische Seiten
const AboutPage = lazy(() => import("@/pages/static/about-page"));
const ContactPage = lazy(() => import("@/pages/static/contact-page"));
const HelpFaqPage = lazy(() => import("@/pages/static/help-faq-page"));
const ImprintPage = lazy(() => import("@/pages/static/imprint-page"));
const PrivacyPolicyPage = lazy(() => import("@/pages/static/privacy-policy-page"));
const SafetyTipsPage = lazy(() => import("@/pages/static/safety-tips-page"));
const SupportPage = lazy(() => import("@/pages/static/support-page"));
const TermsOfServicePage = lazy(() => import("@/pages/static/terms-of-service-page"));

function RouteFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
}

function getHeaderOffset() {
  const header = document.querySelector("header");
  if (header instanceof HTMLElement) {
    return header.offsetHeight + 12;
  }
  return 76;
}

function scrollToTop() {
  window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;

  const root = document.getElementById("root");
  if (root) root.scrollTop = 0;
}

function scrollToHash(hash: string) {
  const id = decodeURIComponent(hash.replace("#", ""));
  if (!id) return false;

  const element = document.getElementById(id);
  if (!element) return false;

  const top = element.getBoundingClientRect().top + window.scrollY - getHeaderOffset();
  window.scrollTo({ top: Math.max(0, top), left: 0, behavior: "auto" });
  return true;
}

function ScrollManager() {
  const [location] = useLocation();
  const search = useSearch();

  useEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    let frame = 0;
    const timers: number[] = [];

    const runScroll = () => {
      if (cancelled) return;

      if (window.location.hash && scrollToHash(window.location.hash)) {
        return;
      }

      scrollToTop();
    };

    runScroll();
    frame = window.requestAnimationFrame(runScroll);
    timers.push(window.setTimeout(runScroll, 80));

    const stopAutomaticScroll = () => {
      cancelled = true;
      if (frame) window.cancelAnimationFrame(frame);
      timers.forEach((timer) => window.clearTimeout(timer));
    };

    window.addEventListener("wheel", stopAutomaticScroll, { passive: true, once: true });
    window.addEventListener("touchmove", stopAutomaticScroll, { passive: true, once: true });

    return () => {
      stopAutomaticScroll();
      window.removeEventListener("wheel", stopAutomaticScroll);
      window.removeEventListener("touchmove", stopAutomaticScroll);
    };
  }, [location, search]);

  useEffect(() => {
    const handleHashChange = () => {
      if (window.location.hash) {
        window.requestAnimationFrame(() => scrollToHash(window.location.hash));
      }
    };

    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  return null;
}

function App() {
  return (
    <>
      <ScrollManager />

      <Suspense fallback={<RouteFallback />}>
        <Switch>
          <Route path="/" component={HomePage} />
          <Route path="/auth" component={AuthPage} />
          <Route path="/suche" component={SearchPage} />
          <Route path="/anbieter/:id" component={ProviderPage} />

          <Route path="/auftraege" component={JobsPage} />
          <Route path="/auftrag-erstellen" component={CreateJobPage} />
          <Route path="/auftraege/bearbeiten/:id" component={EditJobPage} />
          <Route path="/auftraege/:id" component={JobDetailPage} />

          <ProtectedRoute path="/profil" component={ProfilePage} />
          <ProtectedRoute path="/favoriten" component={FavoritesPage} />
          <ProtectedRoute path="/admin" component={AdminPage} />

          <Route path="/ueber-uns" component={AboutPage} />
          <Route path="/kontakt" component={ContactPage} />
          <Route path="/hilfe-faq" component={HelpFaqPage} />
          <Route path="/impressum" component={ImprintPage} />
          <Route path="/datenschutz" component={PrivacyPolicyPage} />
          <Route path="/sicherheitstipps" component={SafetyTipsPage} />
          <Route path="/support" component={SupportPage} />
          <Route path="/nutzungsbedingungen" component={TermsOfServicePage} />

          <Route component={NotFound} />
        </Switch>
      </Suspense>
    </>
  );
}

export default App;
