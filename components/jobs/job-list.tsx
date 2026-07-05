import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { JobListingCard } from "./job-listing-card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { serviceCategories } from "@shared/schema";
import { JobListing } from "@shared/schema";
import { ChevronDown, Loader2 } from "lucide-react";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

function sortJobsNewestFirst(jobs: JobListing[]) {
  return [...jobs].sort((a, b) => {
    const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    if (dateB !== dateA) return dateB - dateA;
    return Number(b.id || 0) - Number(a.id || 0);
  });
}

export function JobList() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [locationFilter, setLocationFilter] = useState<string>("");
  const [jobToDelete, setJobToDelete] = useState<JobListing | null>(null);

  const { data: jobs, isLoading, isFetching, error } = useQuery<JobListing[]>({
    queryKey: ["/api/jobs", categoryFilter, locationFilter],
    queryFn: async () => {
      let url = "/api/jobs?status=active";

      if (categoryFilter && categoryFilter !== "all") {
        url += `&category=${encodeURIComponent(categoryFilter)}`;
      }

      if (locationFilter) {
        url += `&location=${encodeURIComponent(locationFilter)}`;
      }

      const response = await fetch(url, {
        credentials: "include",
        headers: { "Cache-Control": "no-cache" },
      });

      if (!response.ok) {
        throw new Error("Fehler beim Abrufen der Aufträge");
      }

      const data = await response.json();
      return sortJobsNewestFirst(Array.isArray(data) ? data : []);
    },
    refetchInterval: 15000,
    placeholderData: (previousData) => previousData,
  });

  const deleteJobMutation = useMutation({
    mutationFn: async (jobId: number) => {
      const response = await fetch(`/api/jobs/${jobId}`, {
        method: "DELETE",
        credentials: "include",
        headers: { "Cache-Control": "no-cache" },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Auftrag konnte nicht gelöscht werden");
      }

      return response.json();
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["/api/jobs"] });
      await queryClient.invalidateQueries({ queryKey: ["/api/my-jobs"] });

      toast({
        title: "Auftrag gelöscht",
        description: "Der Auftrag wurde erfolgreich gelöscht. Sie können jetzt wieder einen neuen Auftrag erstellen.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Fehler beim Löschen des Auftrags",
        description: error.message || "Bitte versuchen Sie es erneut",
        variant: "destructive",
      });
    },
    onSettled: () => {
      setJobToDelete(null);
    },
  });

  const sortedJobs = sortJobsNewestFirst(jobs || []);

  const confirmDelete = () => {
    if (!jobToDelete) return;
    deleteJobMutation.mutate(jobToDelete.id);
  };

  const filterBar = (
    <div className="mb-6 space-y-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
        <h2 className="text-xl font-semibold">Aufträge filtern</h2>
        <div className="flex items-center gap-2 text-sm text-muted-foreground min-h-5">
          <span>Neueste Aufträge werden zuerst angezeigt</span>
          {isFetching && !isLoading && (
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="job-category-filter" className="text-sm font-medium block mb-1">
            Kategorie
          </label>
          <div className="relative">
            <select
              id="job-category-filter"
              value={categoryFilter}
              onChange={(event) => setCategoryFilter(event.target.value)}
              className="h-11 w-full appearance-none rounded-md border border-input bg-white px-3 pr-10 text-sm ring-offset-background outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="all">Alle Kategorien</option>
              {serviceCategories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          </div>
        </div>

        <div>
          <label htmlFor="job-location-filter" className="text-sm font-medium block mb-1">
            Ort
          </label>
          <Input
            id="job-location-filter"
            className="h-11 bg-white"
            placeholder="Ort eingeben..."
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
          />
        </div>
      </div>
    </div>
  );

  const deleteDialog = (
    <AlertDialog open={!!jobToDelete} onOpenChange={(open) => !open && setJobToDelete(null)}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Auftrag löschen</AlertDialogTitle>
          <AlertDialogDescription>
            Sind Sie sicher, dass Sie den Auftrag "{jobToDelete?.title}" löschen möchten? Diese Aktion kann nicht rückgängig gemacht werden.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleteJobMutation.isPending}>Abbrechen</AlertDialogCancel>
          <Button
            type="button"
            variant="destructive"
            onClick={confirmDelete}
            disabled={deleteJobMutation.isPending}
          >
            {deleteJobMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Löschen...
              </>
            ) : (
              "Endgültig löschen"
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );

  if (error) {
    return (
      <div>
        {filterBar}
        <div className="text-center p-12 border rounded-lg bg-white min-h-[260px] flex flex-col items-center justify-center">
          <h3 className="text-xl font-semibold mb-2">Fehler beim Laden der Aufträge</h3>
          <p className="text-muted-foreground">{(error as Error).message}</p>
        </div>
        {deleteDialog}
      </div>
    );
  }

  if (isLoading) {
    return (
      <div>
        {filterBar}
        <div className="flex justify-center items-center p-12 border rounded-lg bg-white min-h-[260px]">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
        {deleteDialog}
      </div>
    );
  }

  if (!sortedJobs || sortedJobs.length === 0) {
    return (
      <div>
        {filterBar}
        <div className="text-center p-12 border rounded-lg bg-white min-h-[260px]">
          <h3 className="text-xl font-semibold mb-2">Keine Aufträge gefunden</h3>
          <p className="text-muted-foreground mb-4">
            Es wurden keine aktiven Aufträge gefunden, die Ihren Filterkriterien entsprechen.
          </p>

          <div className="max-w-lg mx-auto mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
            <h4 className="font-semibold text-blue-700 mb-2">Sie suchen nach Arbeit?</h4>
            <p className="text-gray-700 mb-3">
              Dienstleister können auf dieser Plattform nach Aufträgen suchen.
              Registrierte Benutzer können Aufträge einsehen und den Auftraggebern direkt ihre Dienste anbieten.
            </p>
            <p className="text-gray-700 text-sm mb-4">
              <span className="font-medium">Tipp:</span> Schauen Sie regelmäßig vorbei, da neue Aufträge täglich hinzugefügt werden!
            </p>
            <Link href="/auftrag-erstellen">
              <Button>Neuen Auftrag erstellen</Button>
            </Link>
          </div>
        </div>
        {deleteDialog}
      </div>
    );
  }

  return (
    <div>
      {filterBar}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 min-h-[260px]">
        {sortedJobs.map((job) => (
          <JobListingCard
            key={job.id}
            job={job}
            showActions={!deleteJobMutation.isPending}
            onDelete={() => setJobToDelete(job)}
          />
        ))}
      </div>

      {deleteDialog}
    </div>
  );
}
