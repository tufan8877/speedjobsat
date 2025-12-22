import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { ArrowLeft, MapPin, Calendar, User, Phone, AlertTriangle, Loader2 } from "lucide-react";
import { JobListing } from "@shared/sqlite-schema";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function JobDetailPage() {
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [job, setJob] = useState<JobListing | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // URL-Parameter manuell parsen
  const path = window.location.pathname;
  const matches = path.match(/\/auftraege\/(\d+)/);
  const jobId = matches ? parseInt(matches[1]) : NaN;
  
  // Auftragsdaten laden
  useEffect(() => {
    if (isNaN(jobId)) {
      toast({
        title: "Ungültige Auftrags-ID",
        description: "Die angegebene Auftrags-ID ist ungültig.",
        variant: "destructive",
      });
      navigate("/auftraege");
      return;
    }
    
    // Daten direkt laden ohne react-query
    const fetchJob = async () => {
      try {
        setIsLoading(true);
        console.log(`Lade Auftrag mit ID ${jobId}...`);
        const response = await fetch(`/api/jobs/${jobId}`);
        
        if (!response.ok) {
          throw new Error(`Fehler beim Laden: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log("Auftragsdaten geladen:", data);
        setJob(data);
        setError(null);
      } catch (err) {
        console.error("Fehler beim Laden des Auftrags:", err);
        setError(err instanceof Error ? err : new Error(String(err)));
        setJob(null);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchJob();
  }, [jobId, navigate, toast]);
  
  // Prüfen, ob der Benutzer berechtigt ist (Eigentümer oder Admin)
  const isOwner = user && job && (user.id === job.userId || user.isAdmin === true);
  
  // Löschfunktion
  const handleDeleteJob = async () => {
    if (!job) return;
    
    setIsDeleting(true);
    try {
      await apiRequest("DELETE", `/api/jobs/${job.id}`);
      toast({
        title: "Auftrag gelöscht",
        description: "Der Auftrag wurde erfolgreich gelöscht.",
      });
      navigate("/auftraege");
    } catch (error: any) {
      toast({
        title: "Fehler beim Löschen",
        description: error.message || "Der Auftrag konnte nicht gelöscht werden.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container py-8">
          <div className="mb-8">
            <Link href="/auftraege" className="inline-flex items-center">
              <Button variant="ghost" className="pl-0">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Zurück zur Übersicht
              </Button>
            </Link>
          </div>
          
          <Card>
            <CardHeader>
              <Skeleton className="h-8 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent className="space-y-6">
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-3/4" />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
              </div>
            </CardContent>
            <CardFooter>
              <Skeleton className="h-10 w-full" />
            </CardFooter>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }
  
  if (error || !job) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container py-8">
          <div className="mb-8">
            <Link href="/auftraege" className="inline-flex items-center">
              <Button variant="ghost" className="pl-0">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Zurück zur Übersicht
              </Button>
            </Link>
          </div>
          
          <Card className="text-center p-8">
            <CardHeader>
              <CardTitle className="text-2xl">Auftrag nicht gefunden</CardTitle>
              <CardDescription>
                Der gesuchte Auftrag ist nicht verfügbar oder existiert nicht.
                {error && (
                  <div className="mt-2 text-sm text-red-500">
                    Fehler: {error.message}
                  </div>
                )}
              </CardDescription>
            </CardHeader>
            <CardFooter className="justify-center pt-6">
              <Link href="/auftraege">
                <Button>Zu allen Aufträgen</Button>
              </Link>
            </CardFooter>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container py-8">
        <div className="mb-8">
          <Link href="/auftraege" className="inline-flex items-center">
            <Button variant="ghost" className="pl-0">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Zurück zur Übersicht
            </Button>
          </Link>
          
          <h1 className="text-3xl font-bold mt-3">{job.title}</h1>
          <div className="flex items-center mt-2">
            <Badge variant="outline" className="mr-2">
              {job.category}
            </Badge>
            <span className="text-sm text-muted-foreground">
              Erstellt am {format(new Date(job.createdAt || new Date()), "PPP", { locale: de })}
            </span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Auftragsbeschreibung</CardTitle>
              </CardHeader>
              <CardContent>
                {/* Bilder anzeigen, falls vorhanden */}
                {job.images && (() => {
                  console.log("Rohe Bilddaten:", job.images);
                  try {
                    // Prüfen, ob images bereits ein Array ist oder ein JSON-String
                    let images;
                    if (typeof job.images === 'string') {
                      images = JSON.parse(job.images);
                    } else {
                      images = job.images;
                    }
                    
                    console.log("Verarbeitete Bilder:", images);
                    
                    return images && images.length > 0 && (
                      <div className="mb-6">
                        <h4 className="font-medium mb-3">Auftragsbilder ({images.length})</h4>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          {images.map((imagePath: string, index: number) => (
                            <div key={index} className="relative">
                              <img
                                src={imagePath}
                                alt={`Auftragsbild ${index + 1}`}
                                className="w-full h-32 object-cover rounded-lg border cursor-pointer hover:opacity-80 transition-opacity"
                                onClick={() => window.open(imagePath, '_blank')}
                                onError={(e) => {
                                  console.error(`Fehler beim Laden des Bildes: ${imagePath}`);
                                  e.currentTarget.style.display = 'none';
                                }}
                              />
                              <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                                {index + 1}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  } catch (e) {
                    console.error("Fehler beim Parsen der Bilder:", e);
                    return (
                      <div className="mb-6 p-4 bg-red-50 rounded-lg">
                        <p className="text-red-700">Fehler beim Laden der Bilder</p>
                        <p className="text-sm text-red-600 mt-1">Debug: {job.images}</p>
                      </div>
                    );
                  }
                })()}
                
                <p className="whitespace-pre-wrap">{job.description}</p>
                
                {!user && (
                  <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
                    <h3 className="font-medium text-blue-700 mb-2">Interesse an diesem Auftrag?</h3>
                    <p className="text-gray-700 mb-3 text-sm">
                      Um mit dem Auftraggeber in Kontakt zu treten, müssen Sie sich registrieren oder anmelden.
                      Als registrierter Benutzer können Sie direkt Kontakt aufnehmen.
                    </p>
                    <Link href="/auth">
                      <Button size="sm">Registrieren / Anmelden</Button>
                    </Link>
                  </div>
                )}
                
                {isOwner && (
                  <div className="mt-8 border-t pt-4">
                    <h3 className="font-medium mb-2">Auftragsoptionen</h3>
                    <div className="flex flex-wrap gap-2">
                      <Link href={`/auftraege/bearbeiten/${job.id}`}>
                        <Button variant="outline" size="sm">Bearbeiten</Button>
                      </Link>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm" className="text-destructive border-destructive hover:bg-destructive/10">
                            Löschen
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Auftrag löschen</AlertDialogTitle>
                            <AlertDialogDescription>
                              Sind Sie sicher, dass Sie den Auftrag "{job.title}" löschen möchten? 
                              Diese Aktion kann nicht rückgängig gemacht werden.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel disabled={isDeleting}>Abbrechen</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={handleDeleteJob}
                              disabled={isDeleting}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              {isDeleting ? (
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
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Auftragsdetails</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start">
                  <MapPin className="h-5 w-5 mr-3 text-muted-foreground mt-0.5" />
                  <div>
                    <h3 className="font-medium">Ort</h3>
                    <p>{job.location}</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <Calendar className="h-5 w-5 mr-3 text-muted-foreground mt-0.5" />
                  <div>
                    <h3 className="font-medium">Datum</h3>
                    <p>{job.date ? format(new Date(job.date), "PPP", { locale: de }) : "Kein Datum angegeben"}</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <User className="h-5 w-5 mr-3 text-muted-foreground mt-0.5" />
                  <div>
                    <h3 className="font-medium">Auftraggeber</h3>
                    <p>Privater Auftraggeber</p>
                  </div>
                </div>
                
                {user ? (
                  <div className="flex items-start">
                    <Phone className="h-5 w-5 mr-3 text-muted-foreground mt-0.5" />
                    <div>
                      <h3 className="font-medium">Kontakt</h3>
                      <p className="break-words">{job.contactInfo}</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start">
                    <Phone className="h-5 w-5 mr-3 text-muted-foreground mt-0.5" />
                    <div>
                      <h3 className="font-medium">Kontakt</h3>
                      <p className="text-orange-600">
                        📋 Registrierung erforderlich
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex-col items-stretch">
                {!user && (
                  <div className="mb-4 p-3 bg-muted rounded-md text-sm">
                    <div className="flex items-center mb-2">
                      <AlertTriangle className="h-4 w-4 mr-2 text-amber-500" />
                      <span className="font-medium">Hinweis</span>
                    </div>
                    <p>Melden Sie sich an, um mit dem Auftraggeber in Kontakt zu treten.</p>
                  </div>
                )}
                {user && !isOwner && (
                  <Button className="w-full" onClick={() => {
                    // Hier können wir in Zukunft eine Funktion zum Kontaktieren des Auftraggebers implementieren
                    toast({
                      title: "Kontaktinformationen verfügbar",
                      description: "Sie können den Auftraggeber unter den angegebenen Kontaktdaten erreichen.",
                    });
                  }}>
                    Kontakt aufnehmen
                  </Button>
                )}
              </CardFooter>
            </Card>
            
            <div className="mt-4 p-4 bg-muted rounded-md text-sm">
              <p className="font-medium mb-1">Haftungsausschluss</p>
              <p>speedjobs.at vermittelt nur zwischen Dienstleistern und Auftraggebern. Wir übernehmen keine Haftung für die Qualität der Ausführung oder die Bezahlung von Aufträgen.</p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}