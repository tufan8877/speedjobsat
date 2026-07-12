import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck } from "lucide-react";

interface VerifiedBadgeProps {
  profileId: number;
  compact?: boolean;
}

export default function VerifiedBadge({ profileId, compact = false }: VerifiedBadgeProps) {
  const { data } = useQuery<{ verified: boolean; verifiedAt?: string | null }>({
    queryKey: [`/api/profiles/${profileId}/verification`],
    queryFn: async () => {
      const response = await fetch(`/api/profiles/${profileId}/verification`, {
        credentials: "include",
      });

      if (!response.ok) return { verified: false };
      return response.json();
    },
    staleTime: 5 * 60 * 1000,
  });

  if (!data?.verified) return null;

  return (
    <Badge
      variant="outline"
      className="border-green-300 bg-green-50 text-green-700 hover:bg-green-50"
      title="Dieses Profil wurde von speedjob.at geprüft."
    >
      <ShieldCheck className="mr-1 h-3.5 w-3.5" />
      {compact ? "Verifiziert" : "Von speedjob.at verifiziert"}
    </Badge>
  );
}
