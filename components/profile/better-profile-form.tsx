import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { z } from "zod";
import { 
  federalStates, 
  serviceCategories,
  availabilityPeriods
} from "@shared/schema";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage,
  FormDescription
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, Save } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Definiere Formulartyp
interface ProfileFormValues {
  firstName: string;
  lastName: string;
  description: string;
  services: string[];
  regions: string[];  // Mehrere Bundesländer
  phoneNumber: string;
  email: string;
  socialMedia: string;
  availablePeriods: string[];
  isAvailable: boolean;
}

// Schema für Formularvalidierung
const profileFormSchema = z.object({
  firstName: z.string().optional().default(""),
  lastName: z.string().optional().default(""),
  description: z.string().optional().default(""),
  services: z.array(z.string()).min(1, "Wählen Sie mindestens eine Dienstleistung aus"),
  regions: z.array(z.string()).min(1, "Wählen Sie mindestens ein Bundesland aus"),
  phoneNumber: z.string().optional().default(""),
  email: z.string().optional().default(""),
  socialMedia: z.string().optional().default(""),
  availablePeriods: z.array(z.string()).min(1, "Wählen Sie mindestens eine Verfügbarkeitszeit aus"),
  isAvailable: z.boolean().default(true)
}).refine((data) => {
  // Mindestens eine Kontaktmöglichkeit muss angegeben werden
  return data.phoneNumber.trim() !== "" || data.email.trim() !== "" || data.socialMedia.trim() !== "";
}, {
  message: "Geben Sie mindestens eine Kontaktmöglichkeit an (Telefon, E-Mail oder Social Media)",
  path: ["phoneNumber"]
});

export default function BetterProfileForm() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [hasContactInfo, setHasContactInfo] = useState(false);

  // Form initialisieren
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      description: "",
      services: [],
      regions: [],
      phoneNumber: "",
      email: "",
      socialMedia: "",
      availablePeriods: [],
      isAvailable: true
    }
  });

  // Profile Daten laden
  const { data: profile, isLoading } = useQuery<any>({
    queryKey: ['/api/my-profile'],
    retry: 1
  });

  // Überprüfen Sie, ob der Benutzer Kontaktinformationen eingegeben hat
  const watchPhoneNumber = form.watch("phoneNumber");
  const watchEmail = form.watch("email");
  const watchSocialMedia = form.watch("socialMedia");

  useEffect(() => {
    const hasContact = 
      (watchPhoneNumber && watchPhoneNumber.trim() !== "") || 
      (watchEmail && watchEmail.trim() !== "") || 
      (watchSocialMedia && watchSocialMedia.trim() !== "");
    setHasContactInfo(hasContact ? true : false);
  }, [watchPhoneNumber, watchEmail, watchSocialMedia]);

  // Profil aktualisieren
  const updateProfile = useMutation({
    mutationFn: async (data: ProfileFormValues) => {
      console.log("Sende Profildaten an API:", data);
      const res = await apiRequest("PUT", "/api/my-profile", data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/my-profile'] });
      toast({
        title: "Profil gespeichert",
        description: "Ihr Profil wurde erfolgreich gespeichert.",
      });
    },
    onError: (error: any) => {
      console.error("Fehler beim Speichern des Profils:", error);
      toast({
        title: "Fehler beim Speichern",
        description: error.message || "Bitte versuchen Sie es erneut",
        variant: "destructive",
      });
    }
  });

  // Formular absenden
  const onSubmit = (values: ProfileFormValues) => {
    updateProfile.mutate(values);
  };

  // Profildaten in das Formular einsetzen, wenn sie geladen wurden
  useEffect(() => {
    if (profile) {
      console.log("Profildaten geladen:", profile);
      
      // Daten in Formular eingeben
      form.reset({
        firstName: profile.firstName || "",
        lastName: profile.lastName || "",
        description: profile.description || "",
        services: profile.services || [],
        // Wandle region in regions Array um, wenn es noch nicht ein Array ist
        regions: Array.isArray(profile.regions) 
          ? profile.regions 
          : (profile.region ? [profile.region] : []),
        phoneNumber: profile.phoneNumber || "",
        email: profile.email || "",
        socialMedia: profile.socialMedia || "",
        availablePeriods: profile.availablePeriods || [],
        isAvailable: profile.isAvailable !== undefined ? profile.isAvailable : true
      });
      
      // Kontakt-Status aktualisieren
      const hasContact = 
        (profile.phoneNumber && profile.phoneNumber.trim() !== "") || 
        (profile.email && profile.email.trim() !== "") || 
        (profile.socialMedia && profile.socialMedia.trim() !== "");
      setHasContactInfo(hasContact ? true : false);
    }
  }, [profile, form]);

  // Während des Ladens einen Loader anzeigen
  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-12">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Card className="w-full shadow-md">
      <CardHeader>
        <CardTitle>Mein Profil</CardTitle>
        <CardDescription>
          Geben Sie alle nötigen Informationen ein, damit Kunden Sie finden können
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* Profilbild (optional) */}
            <div className="flex flex-col items-center mb-6">
              <Avatar className="h-32 w-32 mb-4">
                {profile?.profileImage ? (
                  <AvatarImage src={profile.profileImage} alt="Profilbild" />
                ) : (
                  <AvatarFallback className="bg-primary text-white text-2xl">
                    {form.getValues("firstName")?.[0] || "?"}{form.getValues("lastName")?.[0] || "?"}
                  </AvatarFallback>
                )}
              </Avatar>
              <div className="flex flex-col items-center gap-2">
                <div className="flex space-x-2">
                  <label htmlFor="profile-image-upload" className="cursor-pointer text-sm text-primary hover:text-primary/80">
                    Profilbild ändern
                  </label>
                  
                  {profile?.profileImage && (
                    <button
                      type="button"
                      className="text-sm text-destructive hover:text-destructive/80"
                      onClick={async () => {
                        try {
                          // Bestätigungsdialog
                          if (!confirm("Möchten Sie Ihr Profilbild wirklich entfernen?")) {
                            return;
                          }
                          
                          toast({
                            title: "Profilbild wird entfernt...",
                            description: "Bitte warten Sie einen Moment.",
                          });
                          
                          // API aufrufen, um das Bild zu entfernen
                          await apiRequest("DELETE", "/api/my-profile/image");
                          
                          // Cache invalidieren
                          queryClient.invalidateQueries({ queryKey: ['/api/my-profile'] });
                          
                          toast({
                            title: "Profilbild entfernt",
                            description: "Ihr Profilbild wurde erfolgreich entfernt."
                          });
                        } catch (error: any) {
                          console.error("Fehler beim Entfernen:", error);
                          toast({
                            title: "Fehler beim Entfernen",
                            description: error.message || "Das Profilbild konnte nicht entfernt werden.",
                            variant: "destructive"
                          });
                        }
                      }}
                    >
                      Profilbild entfernen
                    </button>
                  )}
                </div>
                <input 
                  id="profile-image-upload" 
                  type="file" 
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      // Bildgröße prüfen
                      if (file.size > 5 * 1024 * 1024) { // 5MB
                        toast({
                          title: "Bild zu groß",
                          description: "Bitte wählen Sie ein Bild, das kleiner als 5MB ist.",
                          variant: "destructive"
                        });
                        return;
                      }
                      
                      // Stellen Sie sicher, dass es sich um ein Bild handelt
                      if (!file.type.startsWith('image/')) {
                        toast({
                          title: "Ungültiges Dateiformat",
                          description: "Bitte wählen Sie eine Bilddatei (JPG, PNG, etc.).",
                          variant: "destructive"
                        });
                        return;
                      }
                      
                      const reader = new FileReader();
                      reader.onload = async (event) => {
                        const base64Image = event.target?.result as string;
                        try {
                          // Ladeindikator anzeigen
                          toast({
                            title: "Bild wird hochgeladen...",
                            description: "Bitte warten Sie einen Moment.",
                          });
                          
                          const res = await apiRequest("POST", "/api/my-profile/image", { image: base64Image });
                          
                          // Cache invalidieren, um das neue Bild zu laden
                          queryClient.invalidateQueries({ queryKey: ['/api/my-profile'] });
                          
                          toast({
                            title: "Bild hochgeladen",
                            description: "Ihr Profilbild wurde erfolgreich aktualisiert."
                          });
                        } catch (error: any) {
                          console.error("Fehler beim Hochladen:", error);
                          toast({
                            title: "Fehler beim Hochladen",
                            description: error.message || "Das Bild konnte nicht hochgeladen werden.",
                            variant: "destructive"
                          });
                        }
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                />
                <p className="text-xs text-muted-foreground">
                  Klicken Sie, um ein Bild hochzuladen (max. 5MB)
                </p>
              </div>
            </div>

            {/* Allgemeine Informationen */}
            <div className="space-y-6">
              <h3 className="text-lg font-medium">Persönliche Informationen</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Vorname</FormLabel>
                      <FormControl>
                        <Input placeholder="Vorname" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nachname</FormLabel>
                      <FormControl>
                        <Input placeholder="Nachname" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Beschreibung</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Beschreiben Sie Ihre Erfahrung und Dienstleistungen..." 
                        className="resize-none min-h-[120px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="isAvailable"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel>Verfügbarkeit</FormLabel>
                      <FormDescription>
                        Sind Sie derzeit für neue Aufträge verfügbar?
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            {/* Dienstleistungen */}
            <div className="space-y-6">
              <h3 className="text-lg font-medium">Dienstleistungen</h3>
              
              <FormField
                control={form.control}
                name="services"
                render={() => (
                  <FormItem>
                    <FormLabel>Angebotene Dienstleistungen</FormLabel>
                    <FormDescription>
                      Wählen Sie alle Dienstleistungen aus, die Sie anbieten (mindestens eine).
                    </FormDescription>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1 mt-2">
                      {serviceCategories.map((service) => (
                        <FormField
                          key={service}
                          control={form.control}
                          name="services"
                          render={({ field }) => {
                            return (
                              <FormItem key={service} className="flex flex-row items-start space-x-3 space-y-0">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(service)}
                                    onCheckedChange={(checked) => {
                                      return checked
                                        ? field.onChange([...field.value, service])
                                        : field.onChange(
                                            field.value?.filter(
                                              (value) => value !== service
                                            )
                                          )
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="font-normal">
                                  {service}
                                </FormLabel>
                              </FormItem>
                            )
                          }}
                        />
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Verfügbarkeitszeiten */}
            <div className="space-y-6">
              <h3 className="text-lg font-medium">Verfügbarkeitszeiten</h3>
              
              <FormField
                control={form.control}
                name="availablePeriods"
                render={() => (
                  <FormItem>
                    <FormLabel>Wann sind Sie verfügbar?</FormLabel>
                    <FormDescription>
                      Wählen Sie alle Zeiten aus, in denen Sie normalerweise verfügbar sind (mindestens eine).
                    </FormDescription>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1 mt-2">
                      {availabilityPeriods.map((period) => (
                        <FormField
                          key={period}
                          control={form.control}
                          name="availablePeriods"
                          render={({ field }) => {
                            return (
                              <FormItem
                                key={period}
                                className="flex flex-row items-start space-x-3 space-y-0"
                              >
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(period)}
                                    onCheckedChange={(checked) => {
                                      return checked
                                        ? field.onChange([...field.value, period])
                                        : field.onChange(
                                            field.value?.filter((value) => value !== period)
                                          )
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="font-normal">
                                  {period}
                                </FormLabel>
                              </FormItem>
                            )
                          }}
                        />
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Bundesländer - MEHRERE auswählbar */}
            <div className="space-y-6">
              <h3 className="text-lg font-medium">Tätigkeitsregionen</h3>
              
              <FormField
                control={form.control}
                name="regions"
                render={() => (
                  <FormItem>
                    <FormLabel>In welchen Bundesländern sind Sie tätig?</FormLabel>
                    <FormDescription>
                      Wählen Sie alle Bundesländer aus, in denen Sie Ihre Dienste anbieten (mindestens eines).
                    </FormDescription>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1 mt-2">
                      {federalStates.map((state) => (
                        <FormField
                          key={state}
                          control={form.control}
                          name="regions"
                          render={({ field }) => {
                            return (
                              <FormItem key={state} className="flex flex-row items-start space-x-3 space-y-0">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(state)}
                                    onCheckedChange={(checked) => {
                                      return checked
                                        ? field.onChange([...field.value, state])
                                        : field.onChange(
                                            field.value?.filter(
                                              (value) => value !== state
                                            )
                                          )
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="font-normal">
                                  {state}
                                </FormLabel>
                              </FormItem>
                            )
                          }}
                        />
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Kontaktmöglichkeiten */}
            <div className="space-y-6">
              <h3 className="text-lg font-medium">Kontaktmöglichkeiten</h3>
              
              {!hasContactInfo && (
                <Alert variant="destructive" className="mb-4">
                  <AlertTitle>Achtung</AlertTitle>
                  <AlertDescription>
                    Mindestens eine Kontaktmöglichkeit ist erforderlich (Telefon, E-Mail oder Social Media).
                  </AlertDescription>
                </Alert>
              )}

              <FormField
                control={form.control}
                name="phoneNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefonnummer (optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="+43 123 456789" {...field} />
                    </FormControl>
                    <FormDescription>
                      Mindestens eine der Kontaktmöglichkeiten muss angegeben werden.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>E-Mail (optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="kontakt@beispiel.at" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="socialMedia"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Social Media (optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Instagram, Facebook, WhatsApp,..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Speichern Button */}
            <div className="flex justify-end">
              <Button 
                type="submit" 
                disabled={updateProfile.isPending || !hasContactInfo}
                className="bg-primary text-white flex items-center gap-2"
              >
                {updateProfile.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Speichern...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Profil speichern
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}