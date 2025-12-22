import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { Route, Redirect } from "wouter";

/**
 * Geschützte Route Komponente
 * Leitet zu /auth um, wenn kein Benutzer angemeldet ist
 */
export function ProtectedRoute({
  path,
  component: Component,
}: {
  path: string;
  component: () => React.JSX.Element;
}) {
  const auth = useAuth();

  if (auth.isLoading) {
    return (
      <Route path={path}>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Route>
    );
  }

  return (
    <Route path={path}>
      {() => auth.user ? <Component /> : <Redirect to={`/auth?redirect=${path}`} />}
    </Route>
  );
}