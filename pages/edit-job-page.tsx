import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useSeo } from "@/hooks/use-seo";

const categories = [
  "Reinigung", "Gartenpflege", "Umzug", "Handwerk", "Transport",
  "Elektriker", "Installateur", "Maler", "Dachdecker",
  "Automechaniker", "Schlosser", "Masseur", "Nachhilfe"
];

export default function EditJobPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, navigate] = useLocation();
  useSeo({ title: "Auftrag bearbeiten | speedjob.at", noindex: true });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location: "",
    category: "",
  });

  const path = window.location.pathname;
  const matches = path.match(/\/auftraege\/bearbeiten\/(\d+)/);
  const jobId = matches ? Number(matches[1]) : NaN;

  const { data: job, isLoading, error } = useQuery<any>({
    queryKey: [`/api/jobs/${jobId}`],
    enabled: !!user && Number.isFinite(jobId),
    queryFn: async () => {
      const response = await fetch(`/api/jobs/${jobId}`, {
        credentials: "include",
        headers: { "Cache-Control": "no-cache" },
      });

      if (!response.ok) {
        throw new Error("Auftrag konnte nicht geladen werden");
      }

      return response.json();
    },
  });

  useEffect(() => {
    if (!user) {
      navigate(`/auth?redirect=/auftraege/bearbeiten/${jobId}`);
    }
  }, [user, navigate, jobId]);

  useEffect(() => {
    if (job) {
      setFormData({
        title: job.title || "",
        description: job.description || "",
        location: job.location || "",
        category: job.category || "",
      });
    }
  }, [job]);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user?.email) {
      toast({
        title: "Nicht angemeldet",
        description: "Bitte melden Sie sich erneut an.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.title || !formData.description || !formData.location || !formData.category) {
      toast({
        title: "Fehlende Angaben",
        description: "Bitte füllen Sie alle Pflichtfelder aus.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/jobs/${jobId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          title: formData.title.trim(),
          description: formData.description.trim(),
          location: formData.location.trim(),
          category: formData.category,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Auftrag konnte nicht gespeichert werden");
      }

      await queryClient.invalidateQueries({ queryKey: ["/api/jobs"] });
      await queryClient.invalidateQueries({ queryKey: ["/api/my-jobs"] });
      await queryClient.invalidateQueries({ queryKey: [`/api/jobs/${jobId}`] });

      toast({
        title: "Auftrag gespeichert",
        description: `Ihr Auftrag wurde aktualisiert. Kontakt-E-Mail: ${user.email}`,
      });

      navigate(`/auftraege/${jobId}`);
    } catch (error) {
      toast({
        title: "Fehler beim Speichern",
        description: error instanceof Error ? error.message : "Unbekannter Fehler",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) return null;

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container py-8">
          <div className="flex justify-center items-center p-12">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
          </div>
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
          <div className="text-center p-12">
            <h1 className="text-2xl font-bold mb-2">Auftrag nicht gefunden</h1>
            <p className="text-muted-foreground mb-6">Der Auftrag konnte nicht geladen werden.</p>
            <Link href="/auftraege">
              <Button>Zu aktuellen Aufträgen</Button>
            </Link>
          </div>
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
          <Link href={`/auftraege/${jobId}`} className="inline-flex items-center">
            <Button variant="ghost" className="pl-0">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Zurück zum Auftrag
            </Button>
          </Link>

          <h1 className="text-3xl font-bold mt-3">Auftrag bearbeiten</h1>
          <p className="text-muted-foreground mt-1">
            Bearbeiten Sie Ihren bestehenden Auftrag. Die Kontakt-E-Mail wird automatisch aus Ihrem Konto übernommen.
          </p>
        </div>

        <Card className="w-full max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Auftragsdaten</CardTitle>
            <CardDescription>
              Ihre Kontakt-E-Mail wird automatisch mit Ihrer registrierten E-Mail synchronisiert.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="title">Titel *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleChange("title", e.target.value)}
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">Beschreibung *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                  rows={4}
                  required
                />
              </div>

              <div>
                <Label htmlFor="category">Kategorie *</Label>
                <Select value={formData.category} onValueChange={(value) => handleChange("category", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Wählen Sie eine Kategorie" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="location">Ort *</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => handleChange("location", e.target.value)}
                  required
                />
              </div>

              <Alert className="bg-blue-50 border-blue-200 text-blue-900">
                <AlertDescription>
                  Kontakt-E-Mail wird automatisch verwendet: <strong>{user.email}</strong>
                </AlertDescription>
              </Alert>

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Wird gespeichert..." : "Auftrag speichern"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
