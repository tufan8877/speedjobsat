import { useState } from "react";
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
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";

// Definiere die Schnittstelle für das Profil
interface Profile {
  id?: number;
  userId?: number;
  firstName?: string | null;
  lastName?: string | null;
  phoneNumber?: string | null;
  profileImage?: string | null;
  services?: string[] | null;
  region?: string | null;
  description?: string | null;
  availablePeriods?: string[] | null;
  isAvailable?: boolean;
  createdAt?: Date | null;
  updatedAt?: Date | null;
}

// Definiere Formulartyp
interface ProfileFormValues {
  firstName: string;
  lastName: string;
  description: string;
  services: string[];
  region: string;
  phoneNumber: string;
  availablePeriods: string[];
  isAvailable: boolean;
}

// Schema für Formularvalidierung
const profileFormSchema = z.object({
  firstName: z.string().optional().default(""),
  lastName: z.string().optional().default(""),
  description: z.string().optional().default(""),
  services: z.array(z.string()).min(1, "Wählen Sie mindestens eine Dienstleistung aus"),
  region: z.string().min(1, "Wählen Sie Ihre Region aus"),
  phoneNumber: z.string().min(1, "Telefonnummer ist erforderlich"),
  availablePeriods: z.array(z.string()).min(1, "Wählen Sie mindestens eine Verfügbarkeitszeit aus"),
  isAvailable: z.boolean().default(true)
});

export default function ProfileFormNew() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [currentTab, setCurrentTab] = useState("general");

  // Profile Daten laden
  const { data: profile, isLoading } = useQuery({
    queryKey: ['/api/my-profile'],
    retry: false
  });

  // Form initialisieren
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      description: "",
      services: [],
      region: "",
      phoneNumber: "",
      availablePeriods: [],
      isAvailable: true
    }
  });

  // Profil aktualisieren
  const updateProfile = useMutation({
    mutationFn: async (data: ProfileFormValues) => {
      console.log("Sende Daten an API:", data);
      const res = await apiRequest("PUT", "/api/my-profile", data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/my-profile'] });
      toast({
        title: "Profil gespeichert",
        description: "Dein Profil wurde erfolgreich gespeichert.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Fehler beim Speichern",
        description: error.message || "Bitte versuche es erneut",
        variant: "destructive",
      });
    }
  });

  // Formular absenden
  const onSubmit = (values: ProfileFormValues) => {
    updateProfile.mutate(values);
  };

  // Tabs wechseln
  const handleNext = () => {
    const tabs = ["general", "services", "location", "contact"];
    const currentIndex = tabs.indexOf(currentTab);
    if (currentIndex < tabs.length - 1) {
      setCurrentTab(tabs[currentIndex + 1]);
    }
  };
  
  const handlePrevious = () => {
    const tabs = ["general", "services", "location", "contact"];
    const currentIndex = tabs.indexOf(currentTab);
    if (currentIndex > 0) {
      setCurrentTab(tabs[currentIndex - 1]);
    }
  };

  // Während des Ladens einen Loader anzeigen
  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-12">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }
  
  // Profildaten in das Formular einsetzen, wenn sie geladen wurden
  if (profile && Object.keys(form.getValues()).every(key => !form.getValues()[key as keyof ProfileFormValues])) {
    // Formularwerte aktualisieren
    form.reset({
      firstName: profile.firstName || "",
      lastName: profile.lastName || "",
      description: profile.description || "",
      services: profile.services || [],
      region: profile.region || "",
      phoneNumber: profile.phoneNumber || "",
      availablePeriods: profile.availablePeriods || [],
      isAvailable: profile.isAvailable !== undefined ? profile.isAvailable : true
    });
  }

  return (
    <Card className="w-full shadow-md">
      <CardHeader>
        <CardTitle>Mein Dienstleisterprofil</CardTitle>
        <CardDescription>
          Gib alle nötigen Informationen ein, damit Kunden dich finden können
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="general">Allgemein</TabsTrigger>
            <TabsTrigger value="services">Dienstleistungen</TabsTrigger>
            <TabsTrigger value="location">Standort</TabsTrigger>
            <TabsTrigger value="contact">Kontakt</TabsTrigger>
          </TabsList>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 mt-6">
              
              {/* Allgemeine Informationen */}
              <TabsContent value="general" className="space-y-4">
                <div className="flex flex-col space-y-4">
                  {/* Profilbild (optional) */}
                  <div className="flex flex-col items-center mb-4">
                    <Avatar className="h-32 w-32 mb-2">
                      <AvatarImage src="" />
                      <AvatarFallback className="bg-primary text-white text-2xl">
                        {form.getValues("firstName")?.[0] || "?"}{form.getValues("lastName")?.[0] || "?"}
                      </AvatarFallback>
                    </Avatar>
                    <p className="text-sm text-muted-foreground mb-2">Profilbild (optional)</p>
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm" 
                      className="mb-2"
                      onClick={() => toast({
                        title: "Bildupload",
                        description: "Diese Funktion wird in Kürze verfügbar sein.",
                      })}
                    >
                      Bild hochladen (optional)
                    </Button>
                  </div>
                
                  <div className="grid md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Vorname</FormLabel>
                          <FormControl>
                            <Input placeholder="Vorname" {...field} value={field.value || ""} />
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
                            <Input placeholder="Nachname" {...field} value={field.value || ""} />
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
                            placeholder="Beschreibe deine Erfahrung und Dienstleistungen..." 
                            className="resize-none min-h-[120px]"
                            {...field} 
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormDescription>
                          Diese Beschreibung wird in deinem öffentlichen Profil angezeigt.
                        </FormDescription>
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
                            Bist du derzeit für neue Aufträge verfügbar?
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
                
                <div className="flex justify-end">
                  <Button type="button" onClick={handleNext}>
                    Weiter
                  </Button>
                </div>
              </TabsContent>
              
              {/* Dienstleistungen */}
              <TabsContent value="services" className="space-y-4">
                <FormField
                  control={form.control}
                  name="services"
                  render={() => (
                    <FormItem>
                      <FormLabel>Dienstleistungen</FormLabel>
                      <FormDescription>
                        Wähle alle Dienstleistungen aus, die du anbietest (mindestens eine).
                      </FormDescription>
                      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-2 mt-2">
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
                
                <FormField
                  control={form.control}
                  name="availablePeriods"
                  render={() => (
                    <FormItem className="space-y-4">
                      <FormLabel>Verfügbarkeitszeiten</FormLabel>
                      <FormDescription>
                        Wann bist du normalerweise verfügbar? (mindestens eine Auswahl)
                      </FormDescription>
                      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-2">
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
                
                <div className="flex justify-between">
                  <Button type="button" variant="outline" onClick={handlePrevious}>
                    Zurück
                  </Button>
                  <Button type="button" onClick={handleNext}>
                    Weiter
                  </Button>
                </div>
              </TabsContent>
              
              {/* Standort */}
              <TabsContent value="location" className="space-y-4">
                <FormField
                  control={form.control}
                  name="region"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Region</FormLabel>
                      <FormDescription>
                        In welchem Bundesland bietest du deine Dienstleistungen an?
                      </FormDescription>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Bundesland auswählen" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {federalStates.map((state) => (
                            <SelectItem key={state} value={state}>
                              {state}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="flex justify-between">
                  <Button type="button" variant="outline" onClick={handlePrevious}>
                    Zurück
                  </Button>
                  <Button type="button" onClick={handleNext}>
                    Weiter
                  </Button>
                </div>
              </TabsContent>
              
              {/* Kontakt */}
              <TabsContent value="contact" className="space-y-4">
                <FormField
                  control={form.control}
                  name="phoneNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Telefonnummer</FormLabel>
                      <FormControl>
                        <Input placeholder="+43 123 456789" {...field} value={field.value || ""} />
                      </FormControl>
                      <FormDescription>
                        Deine Telefonnummer ist für Kunden sichtbar.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="flex justify-between">
                  <Button type="button" variant="outline" onClick={handlePrevious}>
                    Zurück
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={updateProfile.isPending}
                    className="bg-primary text-white"
                  >
                    {updateProfile.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Speichern...
                      </>
                    ) : (
                      "Profil speichern"
                    )}
                  </Button>
                </div>
              </TabsContent>
            </form>
          </Form>
        </Tabs>
      </CardContent>
    </Card>
  );
}