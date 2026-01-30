import LandingHeader from "@/components/landing/LandingHeader";
import HeroSection from "@/components/landing/HeroSection";
import NumbersSection from "@/components/landing/NumbersSection";
import SolutionSection from "@/components/landing/SolutionSection";
import CTASection from "@/components/landing/CTASection";

const Index = () => {
  return (
    <div className="min-h-screen bg-rezzy-black">
      <LandingHeader />
      <HeroSection />
      <NumbersSection />
      <SolutionSection />
      <CTASection />
    </div>
  );
};

export default Index;
