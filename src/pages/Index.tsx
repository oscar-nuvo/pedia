import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import StatsSection from "@/components/StatsSection";
import BenefitsSection from "@/components/BenefitsSection";
import FeatureShowcase from "@/components/FeatureShowcase";
import CTASection from "@/components/CTASection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <HeroSection />
      <StatsSection />
      <BenefitsSection />
      <FeatureShowcase />
      <CTASection />
      <Footer />
    </div>
  );
};

export default Index;
