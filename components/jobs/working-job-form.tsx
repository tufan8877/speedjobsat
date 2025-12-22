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

const categories = [
  "Reinigung",
  "Gartenpflege", 
  "Umzug",
  "Handwerk",
  "Transport",
  "Elektriker",
  "Installateur",
  "Maler",
  "Dachdecker",
  "Automechaniker",
  "Schlosser",
  "Masseur",
  "Nachhilfe"
];

export function WorkingJobForm() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [loading, setLoading] = useState(false);
  
  // Separate state für jedes Feld
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [category, setCategory] = useState("");
  const [date, setDate] = useState("");
  const [contactInfo, setContactInfo] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !description || !location || !category || !contactInfo) {
      toast({
        title: "Fehlende Angaben",
        description: "Bitte füllen Sie alle Pflichtfelder aus",
        variant: "destructive",
      });
      return;
    }
    
    setLoading(true);

    try {
      const jobData = {
        title: title.trim(),
        description: description.trim(),
        location: location.trim(),
        category: category,
        date: date ? new Date(date).toISOString() : new Date().toISOString(),
        contactInfo: contactInfo.trim()
      };

      console.log("Sende Auftragsdaten:", jobData);

      const response = await fetch("/api/jobs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(jobData),
      });

      if (response.ok) {
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
      toast({
        title: "Fehler",
        description: "Ein unerwarteter Fehler ist aufgetreten",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
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
            <Label htmlFor="title">Titel *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="z.B. 'Hilfe bei Umzug gesucht'"
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Beschreibung *</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Beschreiben Sie detailliert, was Sie benötigen..."
              rows={4}
              required
            />
          </div>

          <div>
            <Label htmlFor="category">Kategorie *</Label>
            <Select value={category} onValueChange={setCategory}>
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
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="z.B. 'Wien, 1010'"
              required
            />
          </div>

          <div>
            <Label htmlFor="date">Gewünschtes Datum</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="contactInfo">Kontaktinformation *</Label>
            <Input
              id="contactInfo"
              value={contactInfo}
              onChange={(e) => setContactInfo(e.target.value)}
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