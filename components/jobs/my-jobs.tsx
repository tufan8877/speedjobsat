import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { JobListingCard } from "./job-listing-card";
import { JobListing } from "@shared/sqlite-schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useState } from "react";
import { Loader2, PlusCircle } from "lucide-react";

export function MyJobs() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [deletingJobId, setDeletingJobId] = useState<number | null>(null);

  const { data: jobs, isLoading, error } = useQuery<JobListing[]>({
    queryKey: ["/api/my-jobs"],
    queryFn: async () => {
      const response = await fetch("/api/my-jobs", { credentials: "include" });

      if (!response.ok) {
        throw new Error("Fehler beim Abrufen Ihrer Aufträge");
      }

      return response.json();
    },
  });

  const deleteJobMutation = useMutation({
    mutationFn: async (jobId: number) => {
      await apiRequest("DELETE", `/api/jobs/${jobId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/my-jobs"] });
      queryClient.invalidateQueries({ queryKey: ["/api/jobs"] });

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
      setDeletingJobId(null);
    },
  });

  const handleDeleteJob = (jobId: number) => {
    setDeletingJobId(jobId);
    deleteJobMutation.mutate(jobId);
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
          <AlertDialog key={job.id}>
            <JobListingCard
              job={job}
              onDelete={(id) => setDeletingJobId(id)}
              showActions={!deleteJobMutation.isPending || deletingJobId !== job.id}
            />

            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Auftrag löschen</AlertDialogTitle>
                <AlertDialogDescription>
                  Sind Sie sicher, dass Sie diesen Auftrag löschen möchten? Danach können Sie einen neuen Auftrag erstellen.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => handleDeleteJob(job.id)}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  {deleteJobMutation.isPending && deletingJobId === job.id ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Löschen...
                    </>
                  ) : (
                    "Löschen"
                  )}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        ))}
      </div>
    </div>
  );
}
