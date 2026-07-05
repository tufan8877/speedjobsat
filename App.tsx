import { Switch, Route, useLocation, useSearch } from "wouter";
import { useEffect } from "react";
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/home-page";
import AuthPage from "@/pages/auth-page";
import ProfilePage from "@/pages/profile-page";
import SearchPage from "@/pages/search-page";
import AdminPage from "@/pages/admin-page";
import ProviderPage from "@/pages/provider-page";
import JobsPage from "@/pages/jobs-page";
import JobDetailPage from "@/pages/job-detail-page";
import EditJobPage from "@/pages/edit-job-page";
import FavoritesPage from "@/pages/favorites-page";
import CreateJobPage from "@/pages/create-job-page";
import { ProtectedRoute } from "@/lib/protected-route";

// Statische Seiten
import AboutPage from "@/pages/static/about-page";
import ContactPage from "@/pages/static/contact-page";
import HelpFaqPage from "@/pages/static/help-faq-page";
import PrivacyPolicyPage from "@/pages/static/privacy-policy-page";
import SafetyTipsPage from "@/pages/static/safety-tips-page";
import SupportPage from "@/pages/static/support-page";
import TermsOfServicePage from "@/pages/static/terms-of-service-page";

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

      <Switch>
        {/* Öffentliche Routen */}
        <Route path="/" component={HomePage} />
        <Route path="/auth" component={AuthPage} />
        <Route path="/suche" component={SearchPage} />
        <Route path="/anbieter/:id" component={ProviderPage} />
        <ProtectedRoute path="/auftraege/bearbeiten/:id" component={EditJobPage} />
        <Route path="/auftraege/:id">
          {() => <JobDetailPage />}
        </Route>
        <Route path="/auftraege" component={JobsPage} />

        {/* Geschützte Routen */}
        <ProtectedRoute path="/profil" component={ProfilePage} />
        <ProtectedRoute path="/favoriten" component={FavoritesPage} />
        <ProtectedRoute path="/auftrag-erstellen" component={CreateJobPage} />
        <ProtectedRoute path="/admin" component={AdminPage} />

        {/* Statische Seiten */}
        <Route path="/ueber-uns" component={AboutPage} />
        <Route path="/kontakt" component={ContactPage} />
        <Route path="/hilfe-faq" component={HelpFaqPage} />
        <Route path="/datenschutz" component={PrivacyPolicyPage} />
        <Route path="/sicherheitstipps" component={SafetyTipsPage} />
        <Route path="/support" component={SupportPage} />
        <Route path="/nutzungsbedingungen" component={TermsOfServicePage} />

        <Route component={NotFound} />
      </Switch>
    </>
  );
}

export default App;
