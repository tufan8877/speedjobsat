import { useSearch } from "wouter";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import SearchForm from "@/components/search/search-form";
import SearchResults from "@/components/search/search-results";

export default function SearchPage() {
  const search = useSearch();
  const hasSearchParams = search && search.length > 1;
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">
              {hasSearchParams 
                ? "Suchergebnisse" 
                : "Dienstleister in Österreich finden"}
            </h1>
            
            <SearchForm />
            <SearchResults />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
