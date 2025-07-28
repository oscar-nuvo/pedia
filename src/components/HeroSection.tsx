import { Button } from "@/components/ui/button";
import { ArrowRight, Clock, Users, Brain } from "lucide-react";
import heroImage from "@/assets/hero-dashboard.jpg";
const HeroSection = () => {
  return <section className="relative overflow-hidden bg-neutral-50">
      <div className="container mx-auto px-6 py-20 lg:py-32">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="inline-flex items-center px-4 py-2 bg-black rounded-full text-white text-sm font-medium">
                <Brain className="w-4 h-4 mr-2" />
                AI-First Pediatric EHR
              </div>
              <h1 className="text-4xl lg:text-6xl font-bold tracking-tight text-black">
                Save <span className="text-brand-yellow">2+ Hours</span> Daily on Documentation
              </h1>
              <p className="text-xl text-neutral-600 leading-relaxed">
                The only EHR built specifically for pediatricians. Reduce admin burden, 
                improve patient care, and get back to what you love—caring for children.
              </p>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap gap-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-white rounded-3xl shadow-lg flex items-center justify-center">
                  <Clock className="w-6 h-6 text-black" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-black">120min</div>
                  <div className="text-sm text-neutral-600">Saved Daily</div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-brand-yellow rounded-3xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-black" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-black">25K+</div>
                  <div className="text-sm text-neutral-600">Target Practices</div>
                </div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button variant="accent" size="xl" className="group">
                Start Free Trial
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button variant="outline" size="xl">
                Watch Demo
              </Button>
            </div>

            {/* Trust Indicators */}
            <div className="pt-8 border-t border-neutral-200">
              <p className="text-sm text-neutral-600 mb-4">Trusted by pediatricians nationwide</p>
              <div className="flex items-center space-x-8">
                <div className="text-lg font-semibold text-neutral-400">HIPAA Compliant</div>
                <div className="text-lg font-semibold text-neutral-400">SOC 2 Certified</div>
                <div className="text-lg font-semibold text-neutral-400">99.9% Uptime</div>
              </div>
            </div>
          </div>

          {/* Right Content - Hero Image */}
          <div className="relative">
            <div className="relative z-10 rounded-3xl overflow-hidden shadow-xl">
              
            </div>
            {/* Decorative elements */}
            <div className="absolute top-8 -right-8 w-24 h-24 bg-brand-yellow rounded-full opacity-30"></div>
            
          </div>
        </div>
      </div>
    </section>;
};
export default HeroSection;