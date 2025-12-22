import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import HeroSection from "@/components/home/hero-section";
import FeaturedServices from "@/components/home/featured-services";
import ProviderListing from "@/components/home/provider-listing";
import FeaturedJobs from "@/components/home/featured-jobs";
import HowItWorks from "@/components/home/how-it-works";
import CTASection from "@/components/home/cta-section";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <HeroSection />
        <FeaturedServices />
        <ProviderListing />
        <FeaturedJobs />
        <HowItWorks />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}
