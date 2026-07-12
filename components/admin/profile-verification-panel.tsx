import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, ShieldCheck, ShieldX } from "lucide-react";

interface VerificationRow {
  id: number;
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
  verified: boolean;
  verifiedAt?: string | null;
}

export default function ProfileVerificationPanel() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery<VerificationRow[]>({
    queryKey: ["/api/admin/profile-verifications"],
  });

  const mutation = useMutation({
    mutationFn: async ({ profileId, verify }: { profileId: number; verify: boolean }) => {
      const endpoint = verify
        ? `/api/admin/profiles/${profileId}/verify`
        : `/api/admin/profiles/${profileId}/unverify`;
      const response = await apiRequest("POST", endpoint, {});
      return response.json();
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/profile-verifications"] });
      queryClient.invalidateQueries({ queryKey: [`/api/profiles/${variables.profileId}/verification`] });
      toast({
        title: variables.verify ? "Profil verifiziert" : "Verifizierung entfernt",
        description: variables.verify
          ? "Das grüne Verifizierungszeichen ist jetzt sichtbar."
          : "Das Verifizierungszeichen wurde entfernt.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Aktion fehlgeschlagen",
        description: error?.message || "Bitte versuchen Sie es erneut.",
        variant: "destructive",
      });
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-green-600" />
          Profilverifizierung
        </CardTitle>
        <CardDescription>
          Nur Profile manuell bestätigen, deren Angaben geprüft wurden. Verifizierte Profile erhalten ein grünes Zeichen.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : error ? (
          <p className="text-sm text-red-600">Die Profile konnten nicht geladen werden.</p>
        ) : !data?.length ? (
          <p className="text-sm text-gray-500">Noch keine Profile vorhanden.</p>
        ) : (
          <div className="space-y-3">
            {data.map((profile) => {
              const isPending = mutation.isPending && mutation.variables?.profileId === profile.id;
              const name = `${profile.firstName || ""} ${profile.lastName || ""}`.trim() || `Profil #${profile.id}`;

              return (
                <div
                  key={profile.id}
                  className="flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-gray-900">{name}</p>
                      {profile.verified ? (
                        <Badge variant="outline" className="border-green-300 bg-green-50 text-green-700">
                          <ShieldCheck className="mr-1 h-3.5 w-3.5" />
                          Verifiziert
                        </Badge>
                      ) : (
                        <Badge variant="secondary">Nicht verifiziert</Badge>
                      )}
                    </div>
                    <p className="mt-1 break-all text-sm text-gray-500">
                      Profil #{String(profile.id).padStart(6, "0")} · {profile.email || "Keine E-Mail"}
                    </p>
                  </div>

                  <Button
                    type="button"
                    size="sm"
                    variant={profile.verified ? "outline" : "default"}
                    disabled={isPending}
                    onClick={() => mutation.mutate({ profileId: profile.id, verify: !profile.verified })}
                  >
                    {isPending ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : profile.verified ? (
                      <ShieldX className="mr-2 h-4 w-4" />
                    ) : (
                      <ShieldCheck className="mr-2 h-4 w-4" />
                    )}
                    {profile.verified ? "Verifizierung entfernen" : "Profil verifizieren"}
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
