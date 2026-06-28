import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { federalStates, serviceCategories, availabilityPeriods } from "@shared/schema";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, Save } from "lucide-react";

const schema = z.object({
  firstName: z.string().optional().default(""),
  lastName: z.string().optional().default(""),
  description: z.string().optional().default(""),
  services: z.array(z.string()).min(1, "Wählen Sie mindestens eine Dienstleistung aus"),
  regions: z.array(z.string()).min(1, "Wählen Sie mindestens ein Bundesland aus"),
  availablePeriods: z.array(z.string()).min(1, "Wählen Sie mindestens eine Verfügbarkeitszeit aus"),
  isAvailable: z.boolean().default(true),
});

type FormValues = z.infer<typeof schema>;

function CheckList({ items, value, onChange }: { items: string[]; value: string[]; onChange: (value: string[]) => void }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 mt-2">
      {items.map((item) => (
        <label key={item} className="flex items-center gap-2 text-sm">
          <Checkbox
            checked={value.includes(item)}
            onCheckedChange={(checked) => {
              onChange(checked ? [...value, item] : value.filter((v) => v !== item));
            }}
          />
          <span>{item}</span>
        </label>
      ))}
    </div>
  );
}

export default function AutoEmailProfileForm() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      firstName: "",
      lastName: "",
      description: "",
      services: [],
      regions: [],
      availablePeriods: [],
      isAvailable: true,
    },
  });

  const { data: profile, isLoading } = useQuery<any>({
    queryKey: ["/api/my-profile"],
    retry: 1,
  });

  useEffect(() => {
    if (!profile) return;
    form.reset({
      firstName: profile.firstName || "",
      lastName: profile.lastName || "",
      description: profile.description || "",
      services: Array.isArray(profile.services) ? profile.services : [],
      regions: Array.isArray(profile.regions) ? profile.regions : profile.region ? [profile.region] : [],
      availablePeriods: Array.isArray(profile.availablePeriods) ? profile.availablePeriods : [],
      isAvailable: profile.isAvailable !== undefined ? profile.isAvailable : true,
    });
  }, [profile, form]);

  const mutation = useMutation({
    mutationFn: async (values: FormValues) => {
      const res = await apiRequest("PUT", "/api/my-profile", values);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/my-profile"] });
      toast({
        title: "Profil gespeichert",
        description: "Ihre registrierte E-Mail wurde automatisch als Kontakt hinterlegt.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Fehler beim Speichern",
        description: error.message || "Bitte versuchen Sie es erneut.",
        variant: "destructive",
      });
    },
  });

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
        <CardDescription>Bearbeiten Sie Ihre Dienstleister-Informationen.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit((values) => mutation.mutate(values))} className="space-y-8">
            <div className="flex justify-center">
              <Avatar className="h-24 w-24">
                {profile?.profileImage ? (
                  <AvatarImage src={profile.profileImage} alt="Profilbild" />
                ) : (
                  <AvatarFallback className="bg-primary text-white text-xl">
                    {(form.watch("firstName")?.[0] || "?") + (form.watch("lastName")?.[0] || "")}
                  </AvatarFallback>
                )}
              </Avatar>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <FormField control={form.control} name="firstName" render={({ field }) => (
                <FormItem><FormLabel>Vorname</FormLabel><FormControl><Input placeholder="Vorname" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="lastName" render={({ field }) => (
                <FormItem><FormLabel>Nachname</FormLabel><FormControl><Input placeholder="Nachname" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
            </div>

            <FormField control={form.control} name="description" render={({ field }) => (
              <FormItem><FormLabel>Beschreibung</FormLabel><FormControl><Textarea placeholder="Beschreiben Sie Ihre Erfahrung und Dienstleistungen..." className="min-h-[120px]" {...field} /></FormControl><FormMessage /></FormItem>
            )} />

            <FormField control={form.control} name="isAvailable" render={({ field }) => (
              <FormItem className="flex items-center justify-between rounded-lg border p-3">
                <div><FormLabel>Verfügbarkeit</FormLabel><FormDescription>Sind Sie derzeit verfügbar?</FormDescription></div>
                <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
              </FormItem>
            )} />

            <FormField control={form.control} name="services" render={({ field }) => (
              <FormItem><FormLabel>Dienstleistungen</FormLabel><FormDescription>Wählen Sie Ihre angebotenen Leistungen.</FormDescription><CheckList items={serviceCategories} value={field.value || []} onChange={field.onChange} /><FormMessage /></FormItem>
            )} />

            <FormField control={form.control} name="availablePeriods" render={({ field }) => (
              <FormItem><FormLabel>Verfügbarkeitszeiten</FormLabel><FormDescription>Wählen Sie Ihre Zeiten.</FormDescription><CheckList items={availabilityPeriods} value={field.value || []} onChange={field.onChange} /><FormMessage /></FormItem>
            )} />

            <FormField control={form.control} name="regions" render={({ field }) => (
              <FormItem><FormLabel>Tätigkeitsregionen</FormLabel><FormDescription>Wählen Sie Ihre Bundesländer.</FormDescription><CheckList items={federalStates} value={field.value || []} onChange={field.onChange} /><FormMessage /></FormItem>
            )} />

            <Alert className="bg-blue-50 border-blue-200 text-blue-900">
              <AlertDescription>
                Als einzige Kontaktmöglichkeit wird automatisch Ihre registrierte E-Mail verwendet:<br />
                <strong>{user?.email || "Ihre registrierte E-Mail"}</strong>
              </AlertDescription>
            </Alert>

            <div className="flex justify-end">
              <Button type="submit" disabled={mutation.isPending} className="bg-primary text-white flex items-center gap-2">
                {mutation.isPending ? <><Loader2 className="h-4 w-4 animate-spin" />Speichern...</> : <><Save className="h-4 w-4" />Profil speichern</>}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
