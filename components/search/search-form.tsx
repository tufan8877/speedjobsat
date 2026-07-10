import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Card, CardContent } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { federalStates, serviceCategories, getServiceCategoryLabel } from "@shared/schema";
import { useLocation, useSearch } from "wouter";

interface SearchFormValues {
  service?: string;
  region?: string;
  name?: string;
}

export default function SearchForm() {
  const [, setLocation] = useLocation();
  const search = useSearch();
  const searchParams = new URLSearchParams(search);

  const [initialValues, setInitialValues] = useState<SearchFormValues>({
    service: searchParams.get("service") || undefined,
    region: searchParams.get("region") || undefined,
    name: searchParams.get("name") || undefined,
  });

  const form = useForm<SearchFormValues>({
    defaultValues: initialValues,
  });

  useEffect(() => {
    const nextValues = {
      service: searchParams.get("service") || undefined,
      region: searchParams.get("region") || undefined,
      name: searchParams.get("name") || undefined,
    };

    setInitialValues(nextValues);
    form.reset(nextValues);
  }, [search, form]);

  const onSubmit = (values: SearchFormValues) => {
    const params = new URLSearchParams();

    if (values.service && values.service !== "all") params.append("service", values.service);
    if (values.region && values.region !== "all") params.append("region", values.region);
    if (values.name?.trim()) params.append("name", values.name.trim());

    const query = params.toString();
    setLocation(query ? `/suche?${query}` : "/suche");
  };

  const handleClear = () => {
    form.reset({
      service: undefined,
      region: undefined,
      name: "",
    });
    setLocation("/suche");
  };

  return (
    <Card className="mb-6">
      <CardContent className="pt-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="service"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dienstleistung</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Dienstleistung wählen" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="all">Alle Dienstleistungen</SelectItem>
                        {serviceCategories.map((service) => (
                          <SelectItem key={service} value={service}>
                            {getServiceCategoryLabel(service)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="region"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bundesland</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Bundesland wählen" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="all">Alle Bundesländer</SelectItem>
                        {federalStates.map((state) => (
                          <SelectItem key={state} value={state}>
                            {state}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Filter</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="z. B. Mathematik, Therme, Küche"
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormDescription>
                      Durchsucht Namen, Dienstleistungen und Profilbeschreibungen.
                    </FormDescription>
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-between pt-2">
              <Button type="button" variant="outline" onClick={handleClear}>
                Zurücksetzen
              </Button>
              <Button type="submit">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                Filtern
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
