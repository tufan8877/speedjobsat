import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import HeroSection from "@/components/home/hero-section";
import PlatformCategories from "@/components/home/platform-categories";
import TopProfiles from "@/components/home/top-profiles";
import HowItWorks from "@/components/home/how-it-works";

export default function HomePage() {
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
