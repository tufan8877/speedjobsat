import { ReactNode } from "react";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";

interface StaticPageProps {
  title: string;
  children: ReactNode;
}

/**
 * Basiskomponente für alle statischen Seiten
 */
export default function StaticPage({ title, children }: StaticPageProps) {
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