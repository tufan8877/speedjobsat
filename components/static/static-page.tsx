import { ReactNode } from "react";
import { useLocation } from "wouter";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { useSeo } from "@/hooks/use-seo";

interface StaticPageProps {
  title: string;
  description?: string;
  children: ReactNode;
}

/**
 * Basiskomponente für alle statischen Seiten
 */
export default function StaticPage({ title, description, children }: StaticPageProps) {
  const [path] = useLocation();

  useSeo({
    title: `${title} | speedjob.at`,
    description: description ?? `${title} auf speedjob.at, der Vermittlungsplattform für Dienstleister in Österreich.`,
    path,
  });

  return (
    <>
      <Header />
      
      <main className="bg-gray-50 py-4 md:py-6">
        <div className="container mx-auto px-3 md:px-4 max-w-4xl">
          <div className="bg-white p-3 sm:p-5 rounded-lg shadow-sm">
            <h1 className="text-xl md:text-2xl font-bold mb-3 text-center text-gray-900 border-b pb-2">{title}</h1>
            <div className="prose prose-blue max-w-none prose-sm md:prose-base">
              {children}
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </>
  );
}