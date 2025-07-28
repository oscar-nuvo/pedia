import { Button } from "@/components/ui/button";
import { ArrowRight, Clock, Users, Brain } from "lucide-react";
import heroImage from "@/assets/hero-dashboard.jpg";

const HeroSection = () => {
  return (
    <section className="relative overflow-hidden bg-gradient-subtle">
      <div className="container mx-auto px-6 py-20 lg:py-32">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="inline-flex items-center px-4 py-2 bg-primary-light rounded-full text-primary-dark text-sm font-medium">
                <Brain className="w-4 h-4 mr-2" />
                AI-First Pediatric EHR
              </div>
              <h1 className="text-4xl lg:text-6xl font-bold tracking-tight text-foreground">
                Save <span className="text-primary">2+ Hours</span> Daily on Documentation
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed">
                The only EHR built specifically for pediatricians. Reduce admin burden, 
                improve patient care, and get back to what you love—caring for children.
              </p>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap gap-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-secondary-light rounded-lg flex items-center justify-center">
                  <Clock className="w-6 h-6 text-secondary" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-foreground">120min</div>
                  <div className="text-sm text-muted-foreground">Saved Daily</div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-primary-light rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-foreground">25K+</div>
                  <div className="text-sm text-muted-foreground">Target Practices</div>
                </div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button variant="hero" size="xl" className="group">
                Start Free Trial
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button variant="outline" size="xl">
                Watch Demo
              </Button>
            </div>

            {/* Trust Indicators */}
            <div className="pt-8 border-t border-border">
              <p className="text-sm text-muted-foreground mb-4">Trusted by pediatricians nationwide</p>
              <div className="flex items-center space-x-8 opacity-60">
                <div className="text-lg font-semibold">HIPAA Compliant</div>
                <div className="text-lg font-semibold">SOC 2 Certified</div>
                <div className="text-lg font-semibold">99.9% Uptime</div>
              </div>
            </div>
          </div>

          {/* Right Content - Hero Image */}
          <div className="relative">
            <div className="relative z-10 rounded-2xl overflow-hidden shadow-strong">
              <img 
                src={heroImage} 
                alt="PediatricAI Dashboard" 
                className="w-full h-auto"
              />
            </div>
            {/* Decorative elements */}
            <div className="absolute top-8 -right-8 w-24 h-24 bg-accent rounded-full opacity-20"></div>
            <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-secondary rounded-full opacity-20"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;