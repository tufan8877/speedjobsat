import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, MapPinIcon, PhoneIcon, MailIcon } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { Link } from "wouter";
import { JobListing } from "@shared/sqlite-schema";
import { useAuth } from "@/hooks/use-auth";

interface JobListingCardProps {
  job: JobListing;
  onDelete?: (id: number) => void;
  showActions?: boolean;
}

export function JobListingCard({ job, onDelete, showActions = true }: JobListingCardProps) {
  const { user } = useAuth();
  
  // Parse das Datum aus dem ISO-String
  const jobDate = new Date(job.date);
  
  // Parse Bilder aus JSON, falls vorhanden
  const images = (() => {
    try {
      return job.images ? JSON.parse(job.images) : [];
    } catch (e) {
      return [];
    }
  })();
  
  // Prüfen, ob der Benutzer berechtigt ist, diesen Auftrag zu bearbeiten/löschen
  const canEdit = user && (user.id === job.userId || user.isAdmin === true);
  const canDelete = user && (user.id === job.userId || user.isAdmin === true);
  
  // Farbkodierung für Status
  const statusColors: Record<string, string> = {
    active: "bg-green-100 text-green-800",
    completed: "bg-blue-100 text-blue-800",
    cancelled: "bg-gray-100 text-gray-800"
  };
  
  // Standardfarbe falls Status unbekannt
  const statusColor = statusColors[job.status] || "bg-gray-100 text-gray-800";
  
  // Status auf Deutsch übersetzen
  const statusTranslation: Record<string, string> = {
    active: "Aktiv",
    completed: "Abgeschlossen",
    cancelled: "Abgebrochen"
  };
  
  const statusText = statusTranslation[job.status] || job.status;
  
  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg font-bold">{job.title}</CardTitle>
            <CardDescription className="text-sm mt-1">
              Kategorie: {job.category}
            </CardDescription>
          </div>
          <Badge className={statusColor}>{statusText}</Badge>
        </div>
      </CardHeader>
      
      <CardContent className="pb-3">
        {/* Bilder anzeigen, falls vorhanden */}
        {images && images.length > 0 && (
          <div className="mb-4">
            <div className="grid grid-cols-2 gap-2">
              {images.slice(0, 2).map((imagePath: string, index: number) => (
                <img
                  key={index}
                  src={imagePath}
                  alt={`Auftragsbild ${index + 1}`}
                  className="w-full h-20 object-cover rounded border"
                />
              ))}
            </div>
            {images.length > 2 && (
              <p className="text-xs text-muted-foreground mt-1">
                +{images.length - 2} weitere Bilder
              </p>
            )}
          </div>
        )}
        
        <p className="text-sm line-clamp-2 mb-4">{job.description}</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-muted-foreground">
          <div className="flex items-center">
            <CalendarIcon className="h-4 w-4 mr-2" />
            <span>{formatDate(jobDate)}</span>
          </div>
          
          <div className="flex items-center">
            <MapPinIcon className="h-4 w-4 mr-2" />
            <span>{job.location}</span>
          </div>
        </div>
        
        {user ? (
          <div className="mt-4 pt-4 border-t text-sm">
            <p className="font-semibold mb-1">Kontaktinformation:</p>
            <p className="text-muted-foreground">{job.contactInfo}</p>
          </div>
        ) : (
          <div className="mt-4 pt-4 border-t text-sm">
            <p className="font-semibold mb-1">Kontaktinformation:</p>
            <p className="text-muted-foreground text-orange-600">
              📋 Registrieren Sie sich kostenlos, um Kontaktdaten zu sehen
            </p>
          </div>
        )}
      </CardContent>
      
      {showActions && (
        <CardFooter className="flex justify-between pt-0">
          <div className="space-x-2">
            <Link href={`/auftraege/${job.id}`}>
              <Button variant="outline" size="sm">Details</Button>
            </Link>
            {canEdit && (
              <Link href={`/auftraege/bearbeiten/${job.id}`}>
                <Button variant="secondary" size="sm">Bearbeiten</Button>
              </Link>
            )}
          </div>
          
          {onDelete && canDelete && (
            <Button 
              variant="destructive" 
              size="sm"
              onClick={() => onDelete(job.id)}
            >
              Löschen
            </Button>
          )}
        </CardFooter>
      )}
    </Card>
  );
}