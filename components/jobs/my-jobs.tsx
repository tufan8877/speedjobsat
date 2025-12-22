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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useState } from "react";
import { Loader2, PlusCircle } from "lucide-react";

export function MyJobs() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [deletingJobId, setDeletingJobId] = useState<number | null>(null);
  
  // Lädt die Aufträge des angemeldeten Benutzers
  const { data: jobs, isLoading, error } = useQuery<JobListing[]>({
    queryKey: ['/api/my-jobs'],
    queryFn: async () => {
      const response = await fetch('/api/my-jobs');
      
      if (!response.ok) {
        throw new Error('Fehler beim Abrufen Ihrer Aufträge');
      }
      
      return response.json();
    }
  });
  
  // Mutation zum Löschen eines Auftrags
  const deleteJobMutation = useMutation({
    mutationFn: async (jobId: number) => {
      await apiRequest("DELETE", `/api/jobs/${jobId}`);
    },
    onSuccess: () => {
      // Cache invalidieren
      queryClient.invalidateQueries({ queryKey: ['/api/my-jobs'] });
      queryClient.invalidateQueries({ queryKey: ['/api/jobs'] });
      
      // Erfolgsmeldung anzeigen
      toast({
        title: "Auftrag gelöscht",
        description: "Ihr Auftrag wurde erfolgreich gelöscht.",
      });
    },
    onError: (error: any) => {
      // Fehlermeldung anzeigen
      toast({
        title: "Fehler beim Löschen des Auftrags",
        description: error.message || "Bitte versuchen Sie es erneut",
        variant: "destructive",
      });
    },
    onSettled: () => {
      // Löschstatus zurücksetzen
      setDeletingJobId(null);
    }
  });
  
  // Handling für das Löschen eines Auftrags
  const handleDeleteJob = (jobId: number) => {
    setDeletingJobId(jobId);
    deleteJobMutation.mutate(jobId);
  };
  
  // Lädt noch
  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-12">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }
  
  // Fehler beim Laden
  if (error) {
    return (
      <div className="text-center p-12">
        <h3 className="text-xl font-semibold mb-2">Fehler beim Laden Ihrer Aufträge</h3>
        <p className="text-muted-foreground">{(error as Error).message}</p>
      </div>
    );
  }
  
  // Keine Aufträge gefunden
  if (!jobs || jobs.length === 0) {
    return (
      <div className="text-center p-12">
        <h3 className="text-xl font-semibold mb-2">Keine Aufträge vorhanden</h3>
        <p className="text-muted-foreground mb-6">
          Sie haben noch keine Aufträge erstellt. Erstellen Sie jetzt Ihren ersten Auftrag.
        </p>
        <Link href="/auftrag-erstellen">
          <Button>
            <PlusCircle className="h-4 w-4 mr-2" />
            Neuen Auftrag erstellen
          </Button>
        </Link>
      </div>
    );
  }
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Meine Aufträge</h2>
        <Link href="/auftrag-erstellen">
          <Button>
            <PlusCircle className="h-4 w-4 mr-2" />
            Neuen Auftrag erstellen
          </Button>
        </Link>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {jobs.map((job) => (
          <AlertDialog key={job.id}>
            <JobListingCard 
              job={job} 
              onDelete={(id) => setDeletingJobId(id)}
              showActions={!deleteJobMutation.isPending || deletingJobId !== job.id}
            />
            
            {/* Bestätigungsdialog für das Löschen */}
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Auftrag löschen</AlertDialogTitle>
                <AlertDialogDescription>
                  Sind Sie sicher, dass Sie diesen Auftrag löschen möchten? 
                  Diese Aktion kann nicht rückgängig gemacht werden.
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