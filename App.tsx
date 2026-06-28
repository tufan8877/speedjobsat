import { Switch, Route, useLocation } from "wouter";
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

function ScrollToTop() {
  const [location] = useLocation();

  useEffect(() => {
    const hasHash = window.location.hash && window.location.hash.length > 1;

    if (hasHash) {
      const id = window.location.hash.replace("#", "");
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: "auto", block: "start" });
        return;
      }
    }

    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [location]);

  return null;
}

function App() {
  return (
    <>
      <ScrollToTop />

      <Switch>
        {/* Öffentliche Routen */}
        <Route path="/" component={HomePage} />
        <Route path="/auth" component={AuthPage} />
        <Route path="/suche" component={SearchPage} />
        <Route path="/anbieter/:id" component={ProviderPage} />
        <Route path="/auftraege" component={JobsPage} />
        <Route path="/auftraege/:id">
          {() => <JobDetailPage />}
        </Route>

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
