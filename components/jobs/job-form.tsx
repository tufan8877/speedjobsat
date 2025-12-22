import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { serviceCategories } from "@shared/schema";
import { JobListing } from "@shared/sqlite-schema";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarIcon, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

// Formularschema für Joblistings
const jobFormSchema = z.object({
  title: z.string().min(5, "Titel muss mindestens 5 Zeichen lang sein"),
  description: z.string().min(20, "Beschreibung muss mindestens 20 Zeichen lang sein"),
  location: z.string().min(3, "Ort muss mindestens 3 Zeichen lang sein"),
  date: z.date({
    required_error: "Bitte wählen Sie ein Datum aus",
  }),
  contactInfo: z.string().min(5, "Kontaktinformation muss mindestens 5 Zeichen lang sein"),
  category: z.string({
    required_error: "Bitte wählen Sie eine Kategorie aus",
  }),
  images: z.array(z.string()).optional(),
});

// Formulartypendefinition
type JobFormValues = z.infer<typeof jobFormSchema>;

interface JobFormProps {
  initialData?: JobListing;
  isEdit?: boolean;
}

export function JobForm({ initialData, isEdit = false }: JobFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, navigate] = useLocation();
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [imagePreview, setImagePreview] = useState<string[]>([]);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);

  console.log("JobForm rendered with:", { isEdit, initialDataExists: !!initialData });
  
  // Funktion zum Handhaben der Dateiauswahl
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    setSelectedFiles(files);
    
    // Erstelle Preview-URLs für die ausgewählten Bilder
    const previewUrls: string[] = [];
    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          previewUrls.push(e.target.result as string);
          if (previewUrls.length === files.length) {
            setImagePreview(previewUrls);
          }
        }
      };
      reader.readAsDataURL(file);
    });
  };

  // Mutation für das Hochladen von Bildern
  const uploadImagesMutation = useMutation({
    mutationFn: async (files: FileList) => {
      const formData = new FormData();
      Array.from(files).forEach(file => {
        formData.append('images', file);
      });
      
      const response = await fetch('/api/jobs/upload', {
        method: 'POST',
        body: formData,
        credentials: 'include', // Wichtig für Session-basierte Authentifizierung
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Upload-Fehler:', response.status, errorText);
        throw new Error(`Fehler beim Hochladen der Bilder: ${response.status} ${errorText}`);
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      setUploadedImages(data.images);
      form.setValue('images', data.images);
    },
    onError: () => {
      toast({
        title: "Fehler beim Hochladen",
        description: "Die Bilder konnten nicht hochgeladen werden.",
        variant: "destructive",
      });
    },
  });
  
  // Formular initialisieren
  const form = useForm<JobFormValues>({
    resolver: zodResolver(jobFormSchema),
    defaultValues: {
      title: initialData?.title || "",
      description: initialData?.description || "",
      location: initialData?.location || "",
      date: initialData?.date ? new Date(initialData.date) : new Date(),
      contactInfo: initialData?.contactInfo || "",
      category: initialData?.category || "",
    },
  });
  
  // Mutation für das Erstellen eines neuen Auftrags
  const createJobMutation = useMutation({
    mutationFn: async (data: JobFormValues) => {
      const formattedData = {
        ...data,
        // Datum als ISO-String formatieren
        date: data.date.toISOString(),
      };
      
      console.log("FRONTEND: Sending job data:", formattedData);
      
      // API-Anfrage zum Erstellen eines neuen Auftrags
      const response = await apiRequest("POST", "/api/jobs", formattedData);
      console.log("FRONTEND: Response status:", response.status);
      return response.json();
    },
    onSuccess: () => {
      // Cache invalidieren
      queryClient.invalidateQueries({ queryKey: ['/api/jobs'] });
      queryClient.invalidateQueries({ queryKey: ['/api/my-jobs'] });
      
      // Erfolgsmeldung anzeigen
      toast({
        title: "Auftrag erfolgreich erstellt",
        description: "Ihr Auftrag wurde erfolgreich erstellt und ist nun für Dienstleister sichtbar.",
      });
      
      // Zur Auftragsübersicht navigieren
      navigate("/auftraege");
    },
    onError: (error: any) => {
      // Fehlermeldung anzeigen
      toast({
        title: "Fehler beim Erstellen des Auftrags",
        description: error.message || "Bitte versuchen Sie es erneut",
        variant: "destructive",
      });
    },
  });
  
  // Mutation für das Aktualisieren eines bestehenden Auftrags
  const updateJobMutation = useMutation({
    mutationFn: async (data: JobFormValues) => {
      if (!initialData?.id) {
        throw new Error("Auftrags-ID fehlt");
      }
      
      const formattedData = {
        ...data,
        // Datum als ISO-String formatieren
        date: data.date.toISOString(),
      };
      
      // API-Anfrage zum Aktualisieren eines Auftrags
      const response = await apiRequest("PUT", `/api/jobs/${initialData.id}`, formattedData);
      return response.json();
    },
    onSuccess: () => {
      // Cache invalidieren
      queryClient.invalidateQueries({ queryKey: ['/api/jobs'] });
      queryClient.invalidateQueries({ queryKey: ['/api/my-jobs'] });
      queryClient.invalidateQueries({ queryKey: [`/api/jobs/${initialData?.id}`] });
      
      // Erfolgsmeldung anzeigen
      toast({
        title: "Auftrag erfolgreich aktualisiert",
        description: "Ihr Auftrag wurde erfolgreich aktualisiert.",
      });
      
      // Zur Auftragsübersicht navigieren
      navigate("/auftraege");
    },
    onError: (error: any) => {
      // Fehlermeldung anzeigen
      toast({
        title: "Fehler beim Aktualisieren des Auftrags",
        description: error.message || "Bitte versuchen Sie es erneut",
        variant: "destructive",
      });
    },
  });
  
  // Formular absenden
  const onSubmit = async (values: JobFormValues) => {
    console.log("=== FORM SUBMIT DEBUG ===");
    console.log("isEdit:", isEdit);
    console.log("initialData:", initialData);
    console.log("values:", values);
    console.log("Form errors:", form.formState.errors);
    
    // Erst Bilder hochladen, falls welche ausgewählt wurden
    if (selectedFiles && selectedFiles.length > 0) {
      try {
        await uploadImagesMutation.mutateAsync(selectedFiles);
      } catch (error) {
        console.error("Fehler beim Hochladen der Bilder:", error);
        return; // Stoppe hier, wenn Upload fehlschlägt
      }
    }
    
    // Dann Auftrag mit hochgeladenen Bildern erstellen/aktualisieren
    const finalValues = {
      ...values,
      images: uploadedImages.length > 0 ? uploadedImages : values.images || []
    };
    
    if (isEdit && initialData) {
      console.log("=== USING UPDATE MUTATION ===");
      updateJobMutation.mutate(finalValues);
    } else {
      console.log("=== USING CREATE MUTATION ===");
      createJobMutation.mutate(finalValues);
    }
  };
  
  // Verarbeitung läuft
  const isSubmitting = createJobMutation.isPending || updateJobMutation.isPending;
  
  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{isEdit ? "Auftrag bearbeiten" : "Neuen Auftrag erstellen"}</CardTitle>
        <CardDescription>
          {isEdit 
            ? "Aktualisieren Sie die Details Ihres bestehenden Auftrags."
            : "Erstellen Sie einen neuen Auftrag, um Dienstleister zu finden."
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Titel</FormLabel>
                  <FormControl>
                    <Input placeholder="z.B. 'Hilfe bei Umzug gesucht'" {...field} />
                  </FormControl>
                  <FormDescription>
                    Ein kurzer, aussagekräftiger Titel für Ihren Auftrag.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Kategorie</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Wählen Sie eine Kategorie" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {serviceCategories.filter(cat => cat && cat.length > 0).map((category) => (
                        <SelectItem key={category} value={category || "Sonstiges"}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Wählen Sie die passendste Kategorie für Ihren Auftrag.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Beschreibung</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Beschreiben Sie Ihren Auftrag detailliert..."
                      className="resize-none min-h-[120px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Eine ausführliche Beschreibung Ihres Auftrags. Je detaillierter, desto besser.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ort</FormLabel>
                    <FormControl>
                      <input
                        type="text"
                        placeholder="z.B. 'Wien, 1100'"
                        value={field.value || ''}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                        name={field.name}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      />
                    </FormControl>
                    <FormDescription>
                      Wo soll der Auftrag ausgeführt werden?
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Datum</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP", { locale: de })
                            ) : (
                              <span>Datum auswählen</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date < new Date(new Date().setHours(0, 0, 0, 0))
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormDescription>
                      Wann soll der Auftrag ausgeführt werden?
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="contactInfo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Kontaktinformation</FormLabel>
                  <FormControl>
                    <Input placeholder="z.B. 'Tel: 01234567890' oder 'E-Mail: name@beispiel.at'" {...field} />
                  </FormControl>
                  <FormDescription>
                    Wie können interessierte Dienstleister Sie erreichen?
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Bildupload-Bereich */}
            <div className="space-y-4">
              <FormLabel>Bilder hinzufügen (optional)</FormLabel>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                <div className="text-center">
                  <Input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                    id="image-upload"
                  />
                  <label 
                    htmlFor="image-upload"
                    className="cursor-pointer flex flex-col items-center"
                  >
                    <svg className="h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-sm text-gray-600">
                      Klicken Sie hier oder ziehen Sie Bilder hinein
                    </span>
                    <span className="text-xs text-gray-500 mt-1">
                      PNG, JPG, GIF bis zu 5MB (max. 5 Bilder)
                    </span>
                  </label>
                </div>
              </div>
              
              {/* Bildvorschau */}
              {imagePreview.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {imagePreview.map((src, index) => (
                    <div key={index} className="relative">
                      <img
                        src={src}
                        alt={`Vorschau ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg border"
                      />
                    </div>
                  ))}
                </div>
              )}
              
              {uploadImagesMutation.isPending && (
                <div className="text-center">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                  <p className="text-sm text-gray-600 mt-2">Bilder werden hochgeladen...</p>
                </div>
              )}
            </div>
            
            <Button type="submit" className="w-full" disabled={isSubmitting || uploadImagesMutation.isPending}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isEdit ? "Aktualisiere..." : "Erstelle..."}
                </>
              ) : (
                isEdit ? "Auftrag aktualisieren" : "Auftrag erstellen"
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}