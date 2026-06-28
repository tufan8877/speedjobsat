import { useAuth } from "@/hooks/use-auth";
import EmailVerificationNotice from "@/components/auth/email-verification-notice";
import AutoEmailProfileForm from "@/components/profile/auto-email-profile-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function VerifiedProfileGate() {
  const { user } = useAuth();
  const emailVerified = !!user?.isAdmin || !!(user as any)?.emailVerified;

  if (!emailVerified) {
    return (
      <Card className="w-full shadow-md">
        <CardHeader>
          <CardTitle>E-Mail-Adresse bestätigen</CardTitle>
          <CardDescription>
            Bitte bestätigen Sie zuerst Ihre E-Mail-Adresse. Danach können Sie Ihr Dienstleisterprofil erstellen oder bearbeiten.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <EmailVerificationNotice email={user?.email} />
        </CardContent>
      </Card>
    );
  }

  return <AutoEmailProfileForm />;
}
