import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import HeroSection from "@/components/home/hero-section";
import PlatformCategories from "@/components/home/platform-categories";
import TopProfiles from "@/components/home/top-profiles";
import HowItWorks from "@/components/home/how-it-works";
import { useSeo, SITE_URL, SITE_NAME } from "@/hooks/use-seo";

export default function HomePage() {
  useSeo({
    path: "/",
    jsonLd: [
      {
        "@context": "https://schema.org",
        "@type": "Organization",
        name: SITE_NAME,
        url: SITE_URL,
        logo: `${SITE_URL}/og-image.png`,
      },
      {
        "@context": "https://schema.org",
        "@type": "WebSite",
        name: SITE_NAME,
        url: SITE_URL,
        potentialAction: {
          "@type": "SearchAction",
          target: `${SITE_URL}/suche?name={search_term_string}`,
          "query-input": "required name=search_term_string",
        },
      },
    ],
  });

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pb-14 sm:pb-20">
        <HeroSection />
        <PlatformCategories />
        <TopProfiles />
        <HowItWorks />
      </main>
      <Footer />
    </div>
  );
}
