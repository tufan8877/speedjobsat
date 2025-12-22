import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useLocation, Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { serviceCategories } from "@shared/schema";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Home, ChevronRight, Upload, X, Image } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { JobListing } from "@shared/sqlite-schema";

interface SimpleJobPageProps {
  isEditMode?: boolean;
}

/**
 * Einfache Seite zum Erstellen oder Bearbeiten eines Auftrags
 * Diese Seite verwendet keine komplexen Formulare oder Validierungen
 */
export default function SimpleJobPage({ isEditMode = false }: SimpleJobPageProps) {
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const { user } = useAuth();
  
  // Einfacher State für Formularfelder
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [date, setDate] = useState("");
  const [contactInfo, setContactInfo] = useState("");
  const [category, setCategory] = useState("Sonstiges");
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [uploadedImageUrls, setUploadedImageUrls] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(isEditMode);
  const [jobId, setJobId] = useState<number | null>(null);
  
  // Im Bearbeitungsmodus Auftragsdaten laden
  useEffect(() => {
    if (isEditMode) {
      const path = window.location.pathname;
      const matches = path.match(/\/auftraege\/bearbeiten\/(\d+)/);
      const id = matches ? parseInt(matches[1]) : null;
      
      if (id) {
        setJobId(id);
        
        // Auftrag laden
        const fetchJob = async () => {
          try {
            setIsLoading(true);
            const response = await fetch(`/api/jobs/${id}`);
            
            if (!response.ok) {
              throw new Error("Fehler beim Laden des Auftrags");
            }
            
            const job: JobListing = await response.json();
            
            // Formularfelder mit Auftragsdaten befüllen
            setTitle(job.title);
            setDescription(job.description);
            setLocation(job.location);
            // ISO-Datum in lokales Datumsformat umwandeln für date-input
            setDate(job.date ? new Date(job.date).toISOString().split('T')[0] : "");
            setContactInfo(job.contactInfo);
            setCategory(job.category);
            
          } catch (error) {
            console.error("Fehler beim Laden des Auftrags:", error);
            toast({
              title: "Fehler",
              description: "Der Auftrag konnte nicht geladen werden.",
              variant: "destructive"
            });
            // Bei Fehler zurück zur Übersicht
            navigate("/auftraege");
          } finally {
            setIsLoading(false);
          }
        };
        
        fetchJob();
      } else {
        // Keine gültige ID gefunden
        toast({
          title: "Fehler",
          description: "Ungültige Auftrags-ID",
          variant: "destructive"
        });
        navigate("/auftraege");
      }
    }
  }, [isEditMode, navigate, toast]);

  // Bildauswahl-Handler
  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    // Maximale Anzahl prüfen (5 Bilder)
    if (selectedImages.length + files.length > 5) {
      toast({
        title: "Zu viele Bilder",
        description: "Sie können maximal 5 Bilder hinzufügen.",
        variant: "destructive"
      });
      return;
    }

    // Dateigröße prüfen (max 5MB pro Datei)
    const invalidFiles = files.filter(file => file.size > 5 * 1024 * 1024);
    if (invalidFiles.length > 0) {
      toast({
        title: "Datei zu groß",
        description: "Jedes Bild darf maximal 5MB groß sein.",
        variant: "destructive"
      });
      return;
    }

    // Dateityp prüfen
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    const invalidTypes = files.filter(file => !validTypes.includes(file.type));
    if (invalidTypes.length > 0) {
      toast({
        title: "Ungültiger Dateityp",
        description: "Nur JPEG, PNG, GIF und WebP Dateien sind erlaubt.",
        variant: "destructive"
      });
      return;
    }

    setSelectedImages(prev => [...prev, ...files]);
  };

  // Bild entfernen
  const removeImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
  };

  // Bilder hochladen
  const uploadImages = async (): Promise<string[]> => {
    if (selectedImages.length === 0) return [];

    const formData = new FormData();
    selectedImages.forEach(file => {
      formData.append('images', file);
    });

    try {
      const response = await fetch('/api/jobs/upload', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Upload fehlgeschlagen');
      }

      const result = await response.json();
      console.log('Upload-Ergebnis:', result);
      return result.images || [];
    } catch (error) {
      console.error('Fehler beim Bildupload:', error);
      toast({
        title: "Upload-Fehler",
        description: "Die Bilder konnten nicht hochgeladen werden.",
        variant: "destructive"
      });
      return [];
    }
  };
  
  // Einfache Validierung
  const isFormValid = title && description && location && date && contactInfo && category;
  
  // Formular absenden
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isFormValid) {
      toast({
        title: "Fehler",
        description: "Bitte füllen Sie alle Felder aus",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Erst Bilder hochladen (optional)
      let imageUrls: string[] = [];
      if (selectedImages.length > 0) {
        imageUrls = await uploadImages();
      }

      // Auftragsdaten vorbereiten
      const jobData = {
        title,
        description,
        location,
        date: new Date(date).toISOString(),
        contactInfo,
        category,
        images: imageUrls.length > 0 ? imageUrls : undefined
      };
      
      let url = "/api/jobs";
      let method = "POST";
      let successMessage = "Ihr Auftrag wurde erfolgreich erstellt und wird nun in der Auftragsliste angezeigt";
      
      // Im Bearbeitungsmodus PUT-Anfrage an die richtige URL senden
      if (isEditMode && jobId) {
        url = `/api/jobs/${jobId}`;
        method = "PUT";
        successMessage = "Ihr Auftrag wurde erfolgreich aktualisiert";
      }
      
      console.log(`${isEditMode ? 'Aktualisiere' : 'Erstelle'} Auftrag:`, jobData);
      console.log(`Bildupload erfolgreich. ${imageUrls.length} Bilder hochgeladen:`, imageUrls);
      
      // API-Anfrage senden
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(jobData)
      });
      
      if (!response.ok) {
        throw new Error(`Fehler beim ${isEditMode ? 'Aktualisieren' : 'Erstellen'} des Auftrags`);
      }
      
      const data = await response.json();
      
      // Cache für Aufträge invalidieren und sofort neu laden
      await queryClient.invalidateQueries({ queryKey: ['/api/jobs'] });
      await queryClient.invalidateQueries({ queryKey: ['/api/my-jobs'] });
      
      // Sofortiges Refetch erzwingen
      await queryClient.refetchQueries({ queryKey: ['/api/jobs'] });
      
      toast({
        title: isEditMode ? "Auftrag aktualisiert" : "Auftrag erstellt",
        description: successMessage
      });
      
      // Zur Auftragsübersicht navigieren
      navigate("/auftraege");
    } catch (error) {
      console.error("Fehler:", error);
      toast({
        title: "Fehler",
        description: `Es ist ein Fehler aufgetreten. Bitte versuchen Sie es später erneut.`,
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="container py-8">
      {/* Breadcrumb für einfache Navigation */}
      <div className="flex items-center mb-4 text-sm max-w-2xl mx-auto">
        <Link href="/">
          <Button variant="link" className="p-0 h-auto">
            <Home className="h-4 w-4 mr-1" />
            Startseite
          </Button>
        </Link>
        <ChevronRight className="h-4 w-4 mx-2 text-muted-foreground" />
        <Link href="/auftraege">
          <Button variant="link" className="p-0 h-auto">
            Aufträge
          </Button>
        </Link>
        <ChevronRight className="h-4 w-4 mx-2 text-muted-foreground" />
        <span className="text-muted-foreground">
          {isEditMode ? "Auftrag bearbeiten" : "Auftrag erstellen"}
        </span>
      </div>
      
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl">
            {isLoading ? "Laden..." : isEditMode ? "Auftrag bearbeiten" : "Einfache Auftragserstellung"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-8 flex flex-col items-center justify-center">
              <Loader2 className="h-8 w-8 mb-4 animate-spin text-primary" />
              <p>Auftragsdaten werden geladen...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Titel</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="z.B. 'Hilfe bei Umzug gesucht'"
                  required
                />
              </div>
            
            <div className="space-y-2">
              <Label htmlFor="category">Kategorie</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Kategorie wählen" />
                </SelectTrigger>
                <SelectContent>
                  {serviceCategories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Beschreibung</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Beschreiben Sie Ihren Auftrag detailliert..."
                className="min-h-[120px]"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="location">Ort</Label>
              <input
                id="location"
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="z.B. 'Wien, 1100'"
                required
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="date">Datum</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="contactInfo">Kontaktinformation</Label>
              <Input
                id="contactInfo"
                value={contactInfo}
                onChange={(e) => setContactInfo(e.target.value)}
                placeholder="z.B. 'Tel: 01234567890' oder 'E-Mail: name@beispiel.at'"
                required
              />
            </div>
            
            {/* Bildupload (optional) */}
            <div className="space-y-2">
              <Label htmlFor="images">Bilder hinzufügen (optional)</Label>
              <div className="space-y-3">
                {/* Bildauswahl */}
                <div className="flex items-center justify-center w-full">
                  <label
                    htmlFor="images"
                    className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
                  >
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="w-8 h-8 mb-4 text-gray-500" />
                      <p className="mb-2 text-sm text-gray-500">
                        <span className="font-semibold">Klicken Sie hier</span> um Bilder hochzuladen
                      </p>
                      <p className="text-xs text-gray-500">
                        PNG, JPG, GIF oder WebP (max. 5MB pro Bild, maximal 5 Bilder)
                      </p>
                    </div>
                    <input
                      id="images"
                      type="file"
                      className="hidden"
                      multiple
                      accept="image/*"
                      onChange={handleImageSelect}
                      disabled={selectedImages.length >= 5}
                    />
                  </label>
                </div>

                {/* Bildvorschau */}
                {selectedImages.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {selectedImages.map((file, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={URL.createObjectURL(file)}
                          alt={`Bild ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-4 h-4" />
                        </button>
                        <div className="absolute bottom-1 left-1 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                          {(file.size / (1024 * 1024)).toFixed(1)}MB
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {selectedImages.length > 0 && (
                  <p className="text-sm text-gray-600">
                    {selectedImages.length} von 5 Bildern ausgewählt
                  </p>
                )}
              </div>
            </div>
            
            <Button type="submit" className="w-full" disabled={isSubmitting || !isFormValid}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isEditMode ? "Wird aktualisiert..." : "Wird erstellt..."}
                </>
              ) : (isEditMode ? "Auftrag aktualisieren" : "Auftrag erstellen")}
            </Button>
          </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}