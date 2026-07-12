import { useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ImagePlus, Loader2, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface GalleryImage {
  id: number;
  imageData: string;
}

const MAX_IMAGES = 6;
const MAX_FILE_SIZE = 2 * 1024 * 1024;

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("Bild konnte nicht gelesen werden"));
    reader.readAsDataURL(file);
  });
}

export default function ProfileGalleryManager() {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isPreparing, setIsPreparing] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: images = [], isLoading } = useQuery<GalleryImage[]>({
    queryKey: ["/api/my-profile/gallery"],
  });

  const uploadMutation = useMutation({
    mutationFn: async (imageData: string) => {
      const response = await fetch("/api/my-profile/gallery", {
        method: "POST",
        credentials: "include",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ imageData }),
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(body.message || "Bild konnte nicht gespeichert werden");
      return body;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/my-profile/gallery"] }),
    onError: (error: Error) => toast({ title: "Upload fehlgeschlagen", description: error.message, variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (imageId: number) => {
      const response = await fetch(`/api/my-profile/gallery/${imageId}`, {
        method: "DELETE",
        credentials: "include",
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(body.message || "Bild konnte nicht gelöscht werden");
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/my-profile/gallery"] }),
    onError: (error: Error) => toast({ title: "Löschen fehlgeschlagen", description: error.message, variant: "destructive" }),
  });

  const handleFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    const remaining = MAX_IMAGES - images.length;
    const selected = Array.from(files).slice(0, remaining);

    if (selected.length === 0) {
      toast({ title: "Galerie voll", description: `Es sind maximal ${MAX_IMAGES} Bilder erlaubt.` });
      return;
    }

    setIsPreparing(true);
    try {
      for (const file of selected) {
        if (!file.type.match(/^image\/(jpeg|png|webp)$/)) {
          toast({ title: "Ungültiges Format", description: `${file.name}: Nur JPG, PNG und WebP sind erlaubt.`, variant: "destructive" });
          continue;
        }
        if (file.size > MAX_FILE_SIZE) {
          toast({ title: "Bild zu groß", description: `${file.name}: Maximal 2 MB pro Bild.`, variant: "destructive" });
          continue;
        }
        const imageData = await fileToDataUrl(file);
        await uploadMutation.mutateAsync(imageData);
      }
    } finally {
      setIsPreparing(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <Card className="mt-6 shadow-md">
      <CardHeader>
        <CardTitle>Arbeitsbilder</CardTitle>
        <CardDescription>
          Laden Sie bis zu {MAX_IMAGES} Bilder Ihrer Arbeiten hoch. Erlaubt sind JPG, PNG und WebP mit maximal 2 MB pro Bild.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          className="hidden"
          onChange={(event) => handleFiles(event.target.files)}
        />

        <div className="flex items-center justify-between gap-3 mb-4">
          <span className="text-sm text-gray-600">{images.length} von {MAX_IMAGES} Bildern</span>
          <Button
            type="button"
            variant="outline"
            onClick={() => inputRef.current?.click()}
            disabled={images.length >= MAX_IMAGES || isPreparing || uploadMutation.isPending}
          >
            {(isPreparing || uploadMutation.isPending) ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ImagePlus className="mr-2 h-4 w-4" />}
            Bilder hinzufügen
          </Button>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-8"><Loader2 className="h-7 w-7 animate-spin text-primary" /></div>
        ) : images.length === 0 ? (
          <div className="rounded-lg border border-dashed p-8 text-center text-sm text-gray-500">
            Noch keine Arbeitsbilder hochgeladen.
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {images.map((image) => (
              <div key={image.id} className="relative overflow-hidden rounded-lg border bg-gray-50 aspect-square">
                <img src={image.imageData} alt="Arbeitsbild" className="h-full w-full object-cover" />
                <Button
                  type="button"
                  size="icon"
                  variant="destructive"
                  className="absolute right-2 top-2 h-8 w-8"
                  onClick={() => deleteMutation.mutate(image.id)}
                  disabled={deleteMutation.isPending}
                  aria-label="Bild löschen"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
