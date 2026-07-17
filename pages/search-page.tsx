import { useEffect } from "react";
import { useSearch } from "wouter";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import SearchForm from "@/components/search/search-form";
import SearchResults from "@/components/search/search-results";
import { useSeo } from "@/hooks/use-seo";
import { getServiceCategoryLabel, getCategoryGroupLabel } from "@shared/schema";

export default function SearchPage() {
  const search = useSearch();

  useEffect(() => {
    sessionStorage.setItem("lastSearchUrl", search ? `/suche?${search}` : "/suche");
  }, [search]);

  const searchParams = new URLSearchParams(search);
  const service = searchParams.get("service");
  const group = searchParams.get("group");
  const region = searchParams.get("region");
  const topic = service ? getServiceCategoryLabel(service) : group ? getCategoryGroupLabel(group) : null;

  const title = topic
    ? `${topic}${region ? ` in ${region}` : ""} – Dienstleister finden | speedjob.at`
    : "Dienstleister in Österreich finden | speedjob.at";
  const description = topic
    ? `Finde geprüfte Anbieter für ${topic}${region ? ` in ${region}` : " in ganz Österreich"} auf speedjob.at.`
    : "Durchsuche alle Dienstleisterprofile auf speedjob.at nach Kategorie, Bundesland und Bewertung.";

  useSeo({
    title,
    description,
    path: search ? `/suche?${search}` : "/suche",
  });

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">Suchergebnisse</h1>

            <SearchForm />
            <SearchResults />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
