import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import HeroSection from "@/components/home/hero-section";
import FeaturedServicesV2 from "@/components/home/featured-services-v2";
import TopProfiles from "@/components/home/top-profiles";
import ProviderListing from "@/components/home/provider-listing";
import HowItWorks from "@/components/home/how-it-works";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pb-14 sm:pb-20">
        <HeroSection />
        <FeaturedServicesV2 />
        <TopProfiles />
        <ProviderListing />
        <HowItWorks />
      </main>
      <Footer />
    </div>
  );
}
