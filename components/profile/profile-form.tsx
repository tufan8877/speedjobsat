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
import { Loader2, Upload } from "lucide-react";
import { Switch } from "@/components/ui/switch";

// Definiere Formulartyp
interface ProfileFormValues {
  firstName: string;
  lastName: string;
  profileImage?: string;
  description: string;
  services: string[];
  region: string;
  phone: string;
  email: string;
  socialMedia: string;
  availablePeriods: string[];
  isAvailable: boolean;
  contactValidation: {
    hasPhone: boolean;
    hasEmail: boolean;
    hasSocialMedia: boolean;
  }
}

export default function ProfileForm() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("general");
  const [previewMode, setPreviewMode] = useState(false);
  
  // Fetch current profile data
  const { data: profile, isLoading } = useQuery<any>({
    queryKey: ['/api/my-profile'],
    retry: false
  });
  
  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: any) => {
      console.log("Mutation erhält Daten:", data);
      
      // Konvertiere die Daten in das richtige Format für die API
      const apiData = {
        firstName: data.firstName || "",
        lastName: data.lastName || "",
        description: data.description || "",
        services: data.services || [],
        region: data.region || "",
        phoneNumber: data.phoneNumber || "",
        availablePeriods: data.availablePeriods || [],
        isAvailable: data.isAvailable !== undefined ? data.isAvailable : true
      };
      
      console.log("Sende Daten an API:", apiData);
      const res = await apiRequest("PUT", "/api/my-profile", apiData);
      const result = await res.json();
      console.log("API-Antwort:", result);
      return result;
    },
    onSuccess: () => {
      // Alle Profile-relevanten Caches invalidieren für sofortige Homepage-Updates
      queryClient.invalidateQueries({ queryKey: ['/api/my-profile'] });
      queryClient.invalidateQueries({ queryKey: ['/api/profiles'] });
      queryClient.invalidateQueries({ predicate: (query) => 
        query.queryKey[0] === '/api/profiles' || query.queryKey.includes('/api/profiles')
      });
      toast({
        title: "Profil gespeichert",
        description: "Ihre Profiländerungen wurden erfolgreich gespeichert.",
      });
    },
    onError: (error) => {
      toast({
        title: "Fehler beim Speichern",
        description: error.message || "Bitte versuchen Sie es erneut.",
        variant: "destructive",
      });
    }
  });
  
  // Initialize form
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(
      z.object({
        firstName: z.string().optional(),
        lastName: z.string().optional(),
        profileImage: z.string().optional(),
        description: z.string().optional(),
        services: z.array(z.string()).min(1, "Wählen Sie mindestens eine Dienstleistung"),
        region: z.string().min(1, "Bundesland ist erforderlich"),
        phone: z.string().optional(),
        email: z.string().optional(),
        socialMedia: z.string().optional(),
        availablePeriods: z.array(z.string()).min(1, "Wählen Sie mindestens eine Verfügbarkeit"),
        isAvailable: z.boolean().default(true),
        contactValidation: z.object({
          hasPhone: z.boolean().optional(),
          hasEmail: z.boolean().optional(),
          hasSocialMedia: z.boolean().optional()
        }).optional()
      }).refine(data => {
        return data.phone || data.email || data.socialMedia;
      }, {
        message: "Mindestens eine Kontaktmöglichkeit ist erforderlich",
        path: ["contactValidation"]
      })
    ),
    defaultValues: {
      firstName: "",
      lastName: "",
      description: "",
      services: [],
      region: "",
      phone: "",
      email: "",
      socialMedia: "",
      availablePeriods: [],
      isAvailable: true,
      contactValidation: {
        hasPhone: false,
        hasEmail: false,
        hasSocialMedia: false
      }
    },
  });
  
  // Update form values when profile data is loaded
  useEffect(() => {
    if (profile && !isLoading) {
      const formData = {
        firstName: profile.firstName || "",
        lastName: profile.lastName || "",
        description: profile.description || "",
        services: profile.services || [],
        region: profile.region || "",
        phone: profile.phone || "",
        email: profile.email || "",
        socialMedia: profile.socialMedia || "",
        availablePeriods: profile.availablePeriods || [],
        isAvailable: profile.isAvailable !== undefined ? profile.isAvailable : true,
        contactValidation: {
          hasPhone: !!profile.phone,
          hasEmail: !!profile.email,
          hasSocialMedia: !!profile.socialMedia
        }
      };
      form.reset(formData);
    }
  }, [profile, isLoading, form]);
  
  // Watch for contact fields to update validation
  const phone = form.watch("phone");
  const email = form.watch("email");
  const socialMedia = form.watch("socialMedia");
  
  useEffect(() => {
    form.setValue("contactValidation.hasPhone", !!phone);
    form.setValue("contactValidation.hasEmail", !!email);
    form.setValue("contactValidation.hasSocialMedia", !!socialMedia);
  }, [phone, email, socialMedia, form]);
  
  // Handle form submission
  const onSubmit = (values: ProfileFormValues) => {
    // Validierung
    const hasPhone = !!values.phone?.trim();
    const hasEmail = !!values.email?.trim();
    const hasSocialMedia = !!values.socialMedia?.trim();
    
    if (!hasPhone && !hasEmail && !hasSocialMedia) {
      form.setError("contactValidation.hasPhone", { 
        type: "manual", 
        message: "Mindestens eine Kontaktmöglichkeit ist erforderlich" 
      });
      setActiveTab("contact");
      return;
    }
    
    if (!values.services || values.services.length === 0) {
      form.setError("services", { 
        type: "manual", 
        message: "Mindestens eine Dienstleistung ist erforderlich" 
      });
      setActiveTab("services");
      return;
    }
    
    if (!values.region) {
      form.setError("region", { 
        type: "manual", 
        message: "Region ist erforderlich" 
      });
      setActiveTab("regions");
      return;
    }
    
    // Daten für API anpassen (mit exakten Feldnamen von server/schema.ts)
    const profileData = {
      firstName: values.firstName || "",
      lastName: values.lastName || "",
      description: values.description || "",
      services: values.services || [],
      region: values.region || "",
      phoneNumber: values.phone || "", // phoneNumber statt phone wird im Backend erwartet
      availablePeriods: values.availablePeriods || [],
      isAvailable: values.isAvailable
    };
    
    console.log("Sende Profildaten:", profileData);
    
    updateProfileMutation.mutate(profileData);
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  // Vorschaukomponente
  if (previewMode) {
    const formData = form.getValues();
    return (
      <Card className="w-full">
        <CardHeader className="relative">
          <Button 
            variant="outline" 
            size="sm"
            className="absolute right-4 top-4"
            onClick={() => setPreviewMode(false)}
          >
            Bearbeiten
          </Button>
          <CardTitle>Profil-Vorschau</CardTitle>
          <CardDescription>
            So wird Ihr Profil für andere Nutzer angezeigt.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-6">
            <div className="md:w-1/3">
              <div className="flex flex-col items-center mb-6">
                <Avatar className="h-32 w-32 mb-4">
                  <AvatarImage src="" />
                  <AvatarFallback className="bg-primary text-white text-2xl">
                    {formData.firstName?.[0]}{formData.lastName?.[0]}
                  </AvatarFallback>
                </Avatar>
                <h2 className="text-xl font-bold">{formData.firstName} {formData.lastName}</h2>
                <div className="mt-2 inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-sm">
                  {formData.isAvailable ? "Verfügbar" : "Nicht verfügbar"}
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium mb-2">Dienstleistungen</h3>
                  <div className="flex flex-wrap gap-2">
                    {formData.services.map((service) => (
                      <span key={service} className="px-2 py-1 bg-secondary text-secondary-foreground rounded-md text-sm">
                        {service}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-2">Region</h3>
                  <p>{formData.region}</p>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-2">Kontakt</h3>
                  <ul className="space-y-2">
                    {formData.phone && (
                      <li className="flex items-center gap-2">
                        <span className="text-muted-foreground">Telefon:</span> {formData.phone}
                      </li>
                    )}
                    {formData.email && (
                      <li className="flex items-center gap-2">
                        <span className="text-muted-foreground">E-Mail:</span> {formData.email}
                      </li>
                    )}
                    {formData.socialMedia && (
                      <li className="flex items-center gap-2">
                        <span className="text-muted-foreground">Social Media:</span> {formData.socialMedia}
                      </li>
                    )}
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-2">Verfügbarkeitszeiten</h3>
                  <div className="flex flex-wrap gap-2">
                    {formData.availablePeriods.map((period) => (
                      <span key={period} className="px-2 py-1 bg-secondary text-secondary-foreground rounded-md text-sm">
                        {period}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="md:w-2/3">
              <h3 className="text-lg font-medium mb-4">Über mich</h3>
              <div className="prose prose-sm max-w-none">
                {formData.description ? (
                  <p>{formData.description}</p>
                ) : (
                  <p className="text-muted-foreground italic">Keine Beschreibung vorhanden.</p>
                )}
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="border-t pt-6 flex justify-center">
          <Button 
            variant="outline" 
            type="button" 
            className="mr-2"
            onClick={() => setPreviewMode(false)}
          >
            Zurück zum Bearbeiten
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Mein Dienstleisterprofil</CardTitle>
        <CardDescription>
          Füllen Sie alle erforderlichen Informationen aus, damit Kunden Sie finden können.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="general">Allgemein</TabsTrigger>
            <TabsTrigger value="services">Dienstleistungen</TabsTrigger>
            <TabsTrigger value="availability">Zeiten</TabsTrigger>
            <TabsTrigger value="regions">Standorte</TabsTrigger>
            <TabsTrigger value="contact">Kontakt</TabsTrigger>
          </TabsList>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 mt-6">
              <TabsContent value="general" className="space-y-4">
                <div className="flex flex-col md:flex-row items-start md:space-x-6 space-y-4 md:space-y-0">
                  <div className="flex flex-col items-center space-y-2">
                    <Avatar className="h-24 w-24">
                      <AvatarImage src="" />
                      <AvatarFallback className="bg-primary text-white text-lg">
                        {form.getValues("firstName")?.[0]}{form.getValues("lastName")?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <Button type="button" variant="outline" size="sm" className="mt-2">
                      <Upload className="h-4 w-4 mr-2" />
                      Bild hochladen
                    </Button>
                  </div>
                  
                  <div className="flex-1 space-y-4 w-full">
                    <div className="grid md:grid-cols-2 gap-4">
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
                              placeholder="Beschreiben Sie Ihre Erfahrung und Ihre Dienstleistungen..." 
                              className="resize-none min-h-[120px]"
                              {...field} 
                            />
                          </FormControl>
                          <FormDescription>
                            Diese Beschreibung wird in Ihrem öffentlichen Profil angezeigt.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="isAvailable"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm mt-6">
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
                </div>
              </TabsContent>
              
              <TabsContent value="services" className="space-y-4">
                <FormField
                  control={form.control}
                  name="services"
                  render={() => (
                    <FormItem>
                      <FormLabel>Dienstleistungen</FormLabel>
                      <FormDescription>
                        Wählen Sie alle Dienstleistungen aus, die Sie anbieten (mindestens eine).
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


              </TabsContent>
              
              <TabsContent value="availability" className="space-y-4">
                <FormField
                  control={form.control}
                  name="availablePeriods"
                  render={({ field }) => (
                    <FormItem className="space-y-4">
                      <FormLabel>Verfügbarkeitszeiten</FormLabel>
                      <FormDescription>
                        Wählen Sie die Zeiträume aus, in denen Sie verfügbar sind.
                      </FormDescription>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {availabilityPeriods.map((period) => (
                          <FormItem key={period} className="flex flex-row items-start space-x-3 space-y-0 p-2 border rounded-md">
                            <FormControl>
                              <Checkbox
                                checked={(field.value || []).includes(period)}
                                onCheckedChange={(checked) => {
                                  const currentValue = field.value || [];
                                  return checked
                                    ? field.onChange([...currentValue, period])
                                    : field.onChange(
                                        currentValue.filter(
                                          (value: string) => value !== period
                                        )
                                      );
                                }}
                              />
                            </FormControl>
                            <FormLabel className="font-normal">
                              {period}
                            </FormLabel>
                          </FormItem>
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>
              
              <TabsContent value="regions" className="space-y-4">
                <FormField
                  control={form.control}
                  name="region"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tätigkeitsgebiete</FormLabel>
                      <FormDescription>
                        Wählen Sie das Bundesland aus, in dem Sie Ihre Dienstleistungen anbieten.
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
              </TabsContent>
              
              <TabsContent value="contact" className="space-y-4">
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Telefonnummer</FormLabel>
                      <FormControl>
                        <Input placeholder="+43 123 456789" {...field} />
                      </FormControl>
                      <FormDescription>
                        Optional, aber mindestens eine Kontaktmöglichkeit ist erforderlich.
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
                      <FormLabel>Kontakt-E-Mail</FormLabel>
                      <FormControl>
                        <Input placeholder="kontakt@beispiel.at" {...field} />
                      </FormControl>
                      <FormDescription>
                        Optional, aber mindestens eine Kontaktmöglichkeit ist erforderlich.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="socialMedia"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Social Media / Messenger</FormLabel>
                      <FormControl>
                        <Input placeholder="z.B. WhatsApp, Instagram, etc." {...field} />
                      </FormControl>
                      <FormDescription>
                        Optional, aber mindestens eine Kontaktmöglichkeit ist erforderlich.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="contactValidation"
                  render={() => (
                    <FormItem>
                      <div className="text-sm text-destructive">
                        {!form.getValues("contactValidation.hasPhone") && 
                         !form.getValues("contactValidation.hasEmail") && 
                         !form.getValues("contactValidation.hasSocialMedia") && 
                          "Bitte geben Sie mindestens eine Kontaktmöglichkeit an."}
                      </div>
                    </FormItem>
                  )}
                />
              </TabsContent>
              
              <div className="flex justify-between mt-8">
                {activeTab !== "general" && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      const tabs = ["general", "services", "regions", "contact"];
                      const currentIndex = tabs.indexOf(activeTab);
                      if (currentIndex > 0) {
                        setActiveTab(tabs[currentIndex - 1]);
                      }
                    }}
                  >
                    Zurück
                  </Button>
                )}
                
                <div className="ml-auto flex space-x-2">
                  {activeTab !== "contact" ? (
                    <Button
                      type="button"
                      onClick={() => {
                        const tabs = ["general", "services", "regions", "contact"];
                        const currentIndex = tabs.indexOf(activeTab);
                        if (currentIndex < tabs.length - 1) {
                          setActiveTab(tabs[currentIndex + 1]);
                        }
                      }}
                    >
                      Weiter
                    </Button>
                  ) : (
                    <Button
                      type="submit"
                      disabled={updateProfileMutation.isPending}
                    >
                      {updateProfileMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Speichern...
                        </>
                      ) : (
                        "Profil speichern"
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </form>
          </Form>
        </Tabs>
      </CardContent>
      {/* Keine duplicated Footer Buttons mehr */}
    </Card>
  );
}
