import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/hooks/use-auth";

const categories = [
  "Reinigung", "Gartenpflege", "Umzug", "Handwerk", "Transport",
  "Elektriker", "Installateur", "Maler", "Dachdecker",
  "Automechaniker", "Schlosser", "Masseur", "Nachhilfe"
];

export function SimpleWorkingForm() {
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [, navigate] = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location: "",
    category: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user?.email) {
      toast({
        title: "Nicht angemeldet",
        description: "Bitte melden Sie sich an, damit Ihre registrierte E-Mail als Kontakt verwendet werden kann.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    if (!formData.title || !formData.description || !formData.location || !formData.category) {
      toast({
        title: "Fehlende Angaben",
        description: "Bitte füllen Sie alle Pflichtfelder aus.",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    try {
      const jobData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        location: formData.location.trim(),
        category: formData.category,
      };

      const response = await fetch("/api/jobs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(jobData),
        credentials: "include",
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `HTTP ${response.status}`);
      }

      await queryClient.invalidateQueries({ queryKey: ["/api/my-jobs"] });
      await queryClient.invalidateQueries({ queryKey: ["/api/jobs"] });

      toast({
        title: "Auftrag erstellt!",
        description: `Ihr Auftrag wurde veröffentlicht. Kontakt-E-Mail: ${user.email}`,
      });

      setFormData({
        title: "",
        description: "",
        location: "",
        category: "",
      });

      navigate("/auftraege");
    } catch (error) {
      console.error("Fehler beim Erstellen:", error);
      toast({
        title: "Fehler beim Erstellen",
        description: error instanceof Error ? error.message : "Unbekannter Fehler",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Neuen Auftrag erstellen</CardTitle>
        <CardDescription>
          Die Kontakt-E-Mail wird automatisch aus Ihrem Benutzerkonto übernommen.
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
              placeholder="z.B. Hilfe bei Umzug gesucht"
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Beschreibung *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              placeholder="Beschreiben Sie detailliert, was Sie benötigen..."
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
              placeholder="z.B. Wien, 1010"
              required
            />
          </div>

          <Alert className="bg-blue-50 border-blue-200 text-blue-900">
            <AlertDescription>
              Kontakt-E-Mail wird automatisch verwendet: <strong>{user?.email || "Ihre registrierte E-Mail"}</strong>
            </AlertDescription>
          </Alert>

          <Button
            type="submit"
            className="w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Wird erstellt..." : "Auftrag erstellen"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
