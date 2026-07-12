import { useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import AdminDashboard from "@/components/admin/admin-dashboard";
import ProfileVerificationPanel from "@/components/admin/profile-verification-panel";
import { AlertTriangle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function AdminPage() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (user && !user.isAdmin) {
      setLocation("/");
    }
  }, [user, setLocation]);

  if (user && !user.isAdmin) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 bg-gray-50 py-8">
          <div className="container mx-auto px-4">
            <Alert variant="destructive" className="max-w-lg mx-auto">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Zugriff verweigert</AlertTitle>
              <AlertDescription>
                Sie haben keine Berechtigung, auf den Admin-Bereich zuzugreifen.
              </AlertDescription>
            </Alert>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold">Admin-Bereich</h1>
              <p className="mt-1 text-sm text-gray-600">Profile verwalten und geprüfte Dienstleister freigeben.</p>
            </div>
            <ProfileVerificationPanel />
            <AdminDashboard />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
