import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { serviceCategories } from "@shared/schema";

export function SimpleJobForm() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location: "",
    category: "",
    date: "",
    contactInfo: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    console.log("=== SUBMITTING JOB FORM ===");
    console.log("Form data:", formData);

    try {
      // Validierung der Pflichtfelder im Frontend
      if (!formData.title || !formData.description || !formData.location || !formData.category) {
        toast({
          title: "Fehlende Angaben",
          description: "Bitte füllen Sie alle Pflichtfelder aus",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      const requestBody = {
        title: formData.title,
        description: formData.description,
        location: formData.location,
        category: formData.category,
        date: formData.date ? new Date(formData.date).toISOString() : new Date().toISOString(),
        contactInfo: formData.contactInfo || "",
      };
      
      console.log("Request body zu senden:", requestBody);
      console.log("Request body as JSON:", JSON.stringify(requestBody));

      const response = await fetch("/api/jobs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(requestBody),
      });

      console.log("Response status:", response.status);

      if (response.ok) {
        const result = await response.json();
        toast({
          title: "Auftrag erfolgreich erstellt",
          description: "Ihr Auftrag wurde erfolgreich erstellt und ist nun sichtbar.",
        });
        navigate("/auftraege");
      } else {
        const error = await response.json();
        toast({
          title: "Fehler beim Erstellen des Auftrags",
          description: error.message || "Bitte versuchen Sie es erneut",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Fehler:", error);
      toast({
        title: "Fehler",
        description: "Ein unerwarteter Fehler ist aufgetreten",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    console.log(`Ändere Feld ${field} zu:`, value);
    setFormData(prev => {
      const newData = {
        ...prev,
        [field]: value
      };
      console.log("Neue Formulardaten:", newData);
      return newData;
    });
  };

  if (!user) {
    return <div>Bitte melden Sie sich an, um einen Auftrag zu erstellen.</div>;
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Neuen Auftrag erstellen</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Titel</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleChange("title", e.target.value)}
              placeholder="z.B. 'Hilfe bei Umzug gesucht'"
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Beschreibung</Label>
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
            <Label htmlFor="category">Kategorie</Label>
            <Select value={formData.category} onValueChange={(value) => handleChange("category", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Wählen Sie eine Kategorie" />
              </SelectTrigger>
              <SelectContent>
                {serviceCategories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="location">Ort</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => handleChange("location", e.target.value)}
              placeholder="z.B. 'Wien, 1010'"
              required
            />
          </div>

          <div>
            <Label htmlFor="date">Gewünschtes Datum</Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => handleChange("date", e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="contactInfo">Kontaktinformation</Label>
            <Input
              id="contactInfo"
              value={formData.contactInfo}
              onChange={(e) => handleChange("contactInfo", e.target.value)}
              placeholder="E-Mail oder Telefonnummer"
              required
            />
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Wird erstellt..." : "Auftrag erstellen"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}