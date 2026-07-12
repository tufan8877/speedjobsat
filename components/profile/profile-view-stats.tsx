import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Eye, CalendarDays, BarChart3, Loader2 } from "lucide-react";

type ProfileViewStatsData = {
  today: number;
  week: number;
  total: number;
};

export default function ProfileViewStats() {
  const { data, isLoading } = useQuery<ProfileViewStatsData>({
    queryKey: ["/api/my-profile/views"],
    queryFn: async () => {
      const response = await fetch("/api/my-profile/views", {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Profilaufrufe konnten nicht geladen werden");
      }

      return response.json();
    },
    refetchInterval: 30000,
  });

  const stats = data || { today: 0, week: 0, total: 0 };

  return (
    <Card className="mb-6 shadow-sm">
      <CardContent className="p-4 sm:p-5">
        <div className="flex items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Profilaufrufe</h2>
            <p className="text-sm text-gray-600">So oft wurde Ihr öffentliches Profil angesehen.</p>
          </div>
          {isLoading && <Loader2 className="h-5 w-5 animate-spin text-primary" />}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
              <Eye className="h-4 w-4 text-primary" />
              Heute
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.today}</p>
          </div>

          <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
              <CalendarDays className="h-4 w-4 text-primary" />
              Letzte 7 Tage
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.week}</p>
          </div>

          <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
              <BarChart3 className="h-4 w-4 text-primary" />
              Gesamt
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          </div>
        </div>

        <p className="mt-3 text-xs text-gray-500">
          Eigene Aufrufe werden nicht mitgezählt. Wiederholte Aufrufe derselben Person innerhalb von 30 Minuten zählen nur einmal.
        </p>
      </CardContent>
    </Card>
  );
}
