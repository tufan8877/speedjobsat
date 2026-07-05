import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { JobListingCard } from "./job-listing-card";
import { JobListing } from "@shared/sqlite-schema";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Loader2, PlusCircle } from "lucide-react";

export function MyJobs() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [jobToDelete, setJobToDelete] = useState<JobListing | null>(null);

  const { data: jobs, isLoading, error } = useQuery<JobListing[]>({
    queryKey: ["/api/my-jobs"],
    queryFn: async () => {
      const response = await fetch("/api/my-jobs", {
        credentials: "include",
        headers: { "Cache-Control": "no-cache" },
      });

      if (!response.ok) {
        throw new Error("Fehler beim Abrufen Ihrer Aufträge");
      }

      return response.json();
    },
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
      await queryClient.invalidateQueries({ queryKey: ["/api/my-jobs"] });
      await queryClient.invalidateQueries({ queryKey: ["/api/jobs"] });

      toast({
        title: "Auftrag gelöscht",
        description: "Ihr Auftrag wurde erfolgreich gelöscht. Sie können jetzt wieder einen neuen Auftrag erstellen.",
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

  const confirmDelete = () => {
    if (!jobToDelete) return;
    deleteJobMutation.mutate(jobToDelete.id);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-12">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-12">
        <h3 className="text-xl font-semibold mb-2">Fehler beim Laden Ihrer Aufträge</h3>
        <p className="text-muted-foreground">{(error as Error).message}</p>
      </div>
    );
  }

  if (!jobs || jobs.length === 0) {
    return (
      <div className="text-center p-12">
        <h3 className="text-xl font-semibold mb-2">Kein Auftrag vorhanden</h3>
        <p className="text-muted-foreground mb-6">
          Sie können einen Auftrag erstellen. Pro Benutzer ist nur ein Auftrag erlaubt.
        </p>
        <Link href="/auftrag-erstellen">
          <Button>
            <PlusCircle className="h-4 w-4 mr-2" />
            Auftrag erstellen
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-semibold">Mein Auftrag</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Pro Benutzer ist nur ein Auftrag erlaubt. Wenn Sie einen neuen Auftrag erstellen möchten, löschen Sie zuerst den bestehenden Auftrag.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {jobs.slice(0, 1).map((job) => (
          <JobListingCard
            key={job.id}
            job={job}
            onDelete={() => setJobToDelete(job)}
            showActions={!deleteJobMutation.isPending}
          />
        ))}
      </div>

      <AlertDialog open={!!jobToDelete} onOpenChange={(open) => !open && setJobToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Auftrag löschen</AlertDialogTitle>
            <AlertDialogDescription>
              Sind Sie sicher, dass Sie den Auftrag "{jobToDelete?.title}" löschen möchten? Danach können Sie einen neuen Auftrag erstellen.
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
    </div>
  );
}
