import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Images, Loader2 } from "lucide-react";

interface GalleryImage {
  id: number;
  imageData: string;
}

export default function ProfileGallery({ profileId }: { profileId: number }) {
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
  const { data: images = [], isLoading } = useQuery<GalleryImage[]>({
    queryKey: [`/api/profiles/${profileId}/gallery`],
  });

  if (isLoading) {
    return (
      <Card className="mt-8">
        <CardContent className="flex justify-center py-8">
          <Loader2 className="h-7 w-7 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (images.length === 0) return null;

  return (
    <>
      <Card className="mt-8">
        <CardContent className="p-5 sm:p-6">
          <div className="mb-4 flex items-center gap-2">
            <Images className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-bold">Arbeitsbilder</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {images.map((image, index) => (
              <button
                key={image.id}
                type="button"
                className="aspect-square overflow-hidden rounded-lg border bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                onClick={() => setSelectedImage(image)}
                aria-label={`Arbeitsbild ${index + 1} vergrößern`}
              >
                <img src={image.imageData} alt={`Arbeitsbild ${index + 1}`} className="h-full w-full object-cover transition-transform hover:scale-105" loading="lazy" />
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Dialog open={Boolean(selectedImage)} onOpenChange={(open) => !open && setSelectedImage(null)}>
        <DialogContent className="max-w-4xl border-0 bg-transparent p-0 shadow-none">
          {selectedImage && (
            <img src={selectedImage.imageData} alt="Arbeitsbild vergrößert" className="max-h-[85vh] w-full rounded-lg object-contain" />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
