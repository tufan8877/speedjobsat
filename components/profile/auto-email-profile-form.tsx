import { useEffect } from "react";
import { Link } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { federalStates, serviceCategories, availabilityPeriods, getServiceCategoryLabel } from "@shared/schema";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CheckCircle2, Circle, Loader2, Save } from "lucide-react";

const schema = z.object({
  firstName: z.string().optional().default(""),
  lastName: z.string().optional().default(""),
  phoneNumber: z
    .string()
    .max(30, "Die Telefonnummer ist zu lang")
    .regex(/^[0-9+\s()\/-]*$/, "Bitte geben Sie eine gültige Telefonnummer ein")
    .optional()
    .default(""),
  description: z.string().optional().default(""),
  service: z.string().min(1, "Wählen Sie eine Dienstleistung aus"),
  regions: z.array(z.string()).min(1, "Wählen Sie mindestens ein Bundesland aus"),
  availablePeriods: z.array(z.string()).min(1, "Wählen Sie mindestens eine Verfügbarkeitszeit aus"),
  isAvailable: z.boolean().default(true),
});

type FormValues = z.infer<typeof schema>;

const descriptionExample = `Beispiel: Ich biete Installateurarbeiten mit Erfahrung in Thermenservice, Störungsbehebung und Reparaturen an. Ich arbeite zuverlässig, sauber und bin in Wien und Niederösterreich verfügbar.`;

function CheckList({ items, value, onChange }: { items: string[]; value: string[]; onChange: (value: string[]) => void }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 mt-2">
      {items.map((item) => (
        <label key={item} className="flex items-center gap-2 text-sm rounded-md border border-gray-100 px-3 py-2 hover:bg-gray-50">
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
      phoneNumber: "",
      description: "",
      service: "",
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
    const savedServices = Array.isArray(profile.services) ? profile.services : [];
    form.reset({
      firstName: profile.firstName || "",
      lastName: profile.lastName || "",
      phoneNumber: profile.phoneNumber || "",
      description: profile.description || "",
      service: savedServices[0] || "",
      regions: Array.isArray(profile.regions) ? profile.regions : profile.region ? [profile.region] : [],
      availablePeriods: Array.isArray(profile.availablePeriods) ? profile.availablePeriods : [],
      isAvailable: profile.isAvailable !== undefined ? profile.isAvailable : true,
    });
  }, [profile, form]);

  const watchedValues = form.watch();
  const completionItems = [
    {
      label: "Vor- und Nachname",
      complete: Boolean(watchedValues.firstName?.trim() && watchedValues.lastName?.trim()),
    },
    {
      label: "Ausführliche Beschreibung",
      complete: Boolean(watchedValues.description?.trim() && watchedValues.description.trim().length >= 50),
    },
    {
      label: "Hauptdienstleistung",
      complete: Boolean(watchedValues.service),
    },
    {
      label: "Tätigkeitsregion",
      complete: Boolean(watchedValues.regions?.length),
    },
    {
      label: "Verfügbarkeitszeiten",
      complete: Boolean(watchedValues.availablePeriods?.length),
    },
    {
      label: "Profilbild",
      complete: Boolean(profile?.profileImage),
    },
    {
      label: "Registrierte E-Mail",
      complete: Boolean(user?.email),
    },
  ];
  const completedItems = completionItems.filter((item) => item.complete).length;
  const completionPercentage = Math.round((completedItems / completionItems.length) * 100);
  const missingItems = completionItems.filter((item) => !item.complete);

  const mutation = useMutation({
    mutationFn: async (values: FormValues) => {
      const res = await apiRequest("PUT", "/api/my-profile", {
        ...values,
        services: [values.service],
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/my-profile"] });
      toast({
        title: "Profil gespeichert",
        description: "Ihr Profil wurde gespeichert. Ihre registrierte E-Mail bleibt die feste Kontaktmöglichkeit.",
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
        <CardTitle>Mein Dienstleisterprofil</CardTitle>
        <CardDescription>
          Füllen Sie Ihr Profil klar und professionell aus. Kunden sehen Ihre Leistung, Region, Beschreibung und Bewertungen.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-6 rounded-xl border border-gray-200 bg-white p-4 sm:p-5 shadow-sm">
          <div className="flex items-center justify-between gap-4 mb-3">
            <div>
              <p className="font-semibold text-gray-900">Profilvollständigkeit</p>
              <p className="text-sm text-gray-600">
                {completionPercentage === 100
                  ? "Ihr Profil ist vollständig."
                  : "Vervollständigen Sie Ihr Profil, damit es professioneller wirkt."}
              </p>
            </div>
            <span className="text-2xl font-bold text-primary whitespace-nowrap">{completionPercentage} %</span>
          </div>

          <progress
            value={completionPercentage}
            max={100}
            className="h-3 w-full overflow-hidden rounded-full accent-primary"
            aria-label={`Profil zu ${completionPercentage} Prozent vollständig`}
          />

          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
            {completionItems.map((item) => (
              <div key={item.label} className="flex items-center gap-2 text-sm">
                {item.complete ? (
                  <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-green-600" />
                ) : (
                  <Circle className="h-4 w-4 flex-shrink-0 text-gray-400" />
                )}
                <span className={item.complete ? "text-gray-700" : "text-gray-500"}>{item.label}</span>
              </div>
            ))}
          </div>

          {missingItems.length > 0 && (
            <p className="mt-4 text-xs text-gray-500">
              Noch offen: {missingItems.map((item) => item.label).join(", ")}.
            </p>
          )}
          <p className="mt-2 text-xs text-gray-500">Die freiwillige Handynummer wird für die 100 % nicht benötigt.</p>
        </div>

        <div className="mb-6 rounded-lg border border-primary/10 bg-primary/5 p-4 text-sm text-gray-700">
          <p className="font-semibold text-gray-900 mb-2">Tipps für ein starkes Profil</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Schreiben Sie kurz, welche Arbeiten Sie anbieten.</li>
            <li>Nennen Sie Erfahrung, Region und wann Sie erreichbar sind.</li>
            <li>Wählen Sie nur die passende Hauptdienstleistung aus.</li>
          </ul>
        </div>

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
                <FormItem>
                  <FormLabel>Vorname</FormLabel>
                  <FormControl><Input placeholder="z. B. Max" {...field} /></FormControl>
                  <FormDescription>Dieser Name wird im Profil angezeigt.</FormDescription>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="lastName" render={({ field }) => (
                <FormItem>
                  <FormLabel>Nachname</FormLabel>
                  <FormControl><Input placeholder="z. B. Mustermann" {...field} /></FormControl>
                  <FormDescription>Kann vollständig oder abgekürzt angegeben werden.</FormDescription>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            <FormField control={form.control} name="phoneNumber" render={({ field }) => (
              <FormItem>
                <FormLabel>Handynummer <span className="font-normal text-gray-500">(optional)</span></FormLabel>
                <FormControl>
                  <Input type="tel" inputMode="tel" placeholder="z. B. +43 676 1234567" {...field} />
                </FormControl>
                <FormDescription>
                  Die registrierte E-Mail bleibt verpflichtend. Die Handynummer wird nur zusätzlich angezeigt, wenn Sie sie freiwillig eintragen.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="description" render={({ field }) => (
              <FormItem>
                <FormLabel>Beschreibung</FormLabel>
                <FormDescription>
                  Beschreiben Sie kurz Ihre Erfahrung, Ihre Leistungen und Ihre Arbeitsweise. Für die Profilvollständigkeit werden mindestens 50 Zeichen berücksichtigt.
                </FormDescription>
                <FormControl>
                  <Textarea placeholder={descriptionExample} className="min-h-[150px]" {...field} />
                </FormControl>
                <p className="text-xs text-gray-500">Beispielbereiche: Installateurarbeiten, Elektroarbeiten, Gastronomie, IT-Service, Reinigung, Transport und Handwerksarbeiten.</p>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="isAvailable" render={({ field }) => (
              <FormItem className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <FormLabel>Profil aktiv anzeigen</FormLabel>
                  <FormDescription>Wenn aktiv, können Nutzer Ihr Profil in der Suche finden.</FormDescription>
                </div>
                <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
              </FormItem>
            )} />

            <FormField control={form.control} name="service" render={({ field }) => (
              <FormItem>
                <FormLabel>Hauptdienstleistung</FormLabel>
                <FormDescription>Wählen Sie die wichtigste Dienstleistung aus. Das hilft Kunden, Sie schneller zu finden.</FormDescription>
                <FormControl>
                  <select
                    value={field.value}
                    onChange={(event) => field.onChange(event.target.value)}
                    className="flex h-12 w-full appearance-none rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="" disabled>Dienstleistung wählen</option>
                    {serviceCategories.map((service) => (
                      <option key={service} value={service}>{getServiceCategoryLabel(service)}</option>
                    ))}
                  </select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="availablePeriods" render={({ field }) => (
              <FormItem>
                <FormLabel>Verfügbarkeitszeiten</FormLabel>
                <FormDescription>Wählen Sie aus, wann Sie grundsätzlich erreichbar oder verfügbar sind.</FormDescription>
                <CheckList items={availabilityPeriods} value={field.value || []} onChange={field.onChange} />
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="regions" render={({ field }) => (
              <FormItem>
                <FormLabel>Tätigkeitsregionen</FormLabel>
                <FormDescription>Wählen Sie alle Bundesländer aus, in denen Sie tätig sind.</FormDescription>
                <CheckList items={federalStates} value={field.value || []} onChange={field.onChange} />
                <FormMessage />
              </FormItem>
            )} />

            <Alert className="bg-blue-50 border-blue-200 text-blue-900">
              <AlertDescription>
                Ihre registrierte E-Mail ist die feste Kontaktmöglichkeit:<br />
                <strong>{user?.email || "Ihre registrierte E-Mail"}</strong>
                <br />
                Die Handynummer ist freiwillig und wird nur zusätzlich angezeigt. Ihre E-Mail können Sie in den{" "}
                <Link href="/profil?tab=settings" className="font-semibold underline underline-offset-2 hover:text-blue-700">
                  Einstellungen
                </Link>{" "}
                ändern.
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
