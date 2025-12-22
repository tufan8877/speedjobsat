import { Switch, Route } from "wouter";
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/home-page";
import AuthPage from "@/pages/auth-page";
import ProfilePage from "@/pages/profile-page";
import SearchPage from "@/pages/search-page";
import AdminPage from "@/pages/admin-page";
import ProviderPage from "@/pages/provider-page";
import { ProtectedRoute } from "./lib/protected-route";
import { useAuth } from "./hooks/use-auth";

function App() {
  const { user } = useAuth();
  
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/auth" component={AuthPage} />
      <Route path="/suche" component={SearchPage} />
      <Route path="/anbieter/:id" component={ProviderPage} />
      <ProtectedRoute path="/profil" component={ProfilePage} />
      {user?.isAdmin && (
        <Route path="/admin" component={AdminPage} />
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

export default App;
