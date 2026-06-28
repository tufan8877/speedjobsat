import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { MailCheck, Loader2 } from "lucide-react";

interface EmailVerificationNoticeProps {
  email?: string | null;
  compact?: boolean;
}

export default function EmailVerificationNotice({ email, compact = false }: EmailVerificationNoticeProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const resendMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/resend-verification");
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      toast({
        title: "E-Mail wurde gesendet",
        description: data?.message || "Bitte prüfen Sie Ihr Postfach und Ihren Spam-Ordner.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "E-Mail konnte nicht gesendet werden",
        description: error.message || "Bitte versuchen Sie es später erneut.",
        variant: "destructive",
      });
    },
  });

  return (
    <Alert className="bg-yellow-50 border-yellow-200 text-yellow-900">
      <MailCheck className="h-4 w-4" />
      <AlertDescription>
        <div className={compact ? "space-y-2" : "flex flex-col md:flex-row md:items-center md:justify-between gap-3"}>
          <div>
            <strong>E-Mail noch nicht bestätigt.</strong>{" "}
            Bitte bestätigen Sie Ihre E-Mail-Adresse{email ? ` (${email})` : ""}. Erst danach können Sie Profile speichern, Aufträge erstellen und Bewertungen abgeben.
          </div>
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={resendMutation.isPending}
            onClick={() => resendMutation.mutate()}
            className="bg-white"
          >
            {resendMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Wird gesendet...
              </>
            ) : (
              "E-Mail erneut senden"
            )}
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
}
