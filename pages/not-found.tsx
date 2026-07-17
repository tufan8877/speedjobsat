import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
import { useSeo } from "@/hooks/use-seo";

export default function NotFound() {
  useSeo({ title: "Seite nicht gefunden | speedjob.at", noindex: true });

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          <div className="flex mb-4 gap-2">
            <AlertCircle className="h-8 w-8 text-red-500" />
            <h1 className="text-2xl font-bold text-gray-900">Seite nicht gefunden</h1>
          </div>

          <p className="mt-4 text-sm text-gray-600">
            Die aufgerufene Seite existiert nicht oder wurde verschoben.
          </p>

          <Button asChild className="mt-6">
            <Link href="/">Zur Startseite</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
