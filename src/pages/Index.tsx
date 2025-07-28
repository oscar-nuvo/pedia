import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import StatsSection from "@/components/StatsSection";
import ProblemSolutionSection from "@/components/ProblemSolutionSection";
import BenefitsSection from "@/components/BenefitsSection";
import InteractiveDemoSection from "@/components/InteractiveDemoSection";
import FeatureShowcase from "@/components/FeatureShowcase";
import TestimonialsSection from "@/components/TestimonialsSection";
import ComparisonSection from "@/components/ComparisonSection";
import ROICalculatorSection from "@/components/ROICalculatorSection";
import TrustSecuritySection from "@/components/TrustSecuritySection";
import FAQSection from "@/components/FAQSection";
import CTASection from "@/components/CTASection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <HeroSection />
      <StatsSection />
      <ProblemSolutionSection />
      <BenefitsSection />
      <InteractiveDemoSection />
      <FeatureShowcase />
      <TestimonialsSection />
      <ComparisonSection />
      <ROICalculatorSection />
      <TrustSecuritySection />
      <FAQSection />
      <CTASection />
      <Footer />
    </div>
  );
};

export default Index;
