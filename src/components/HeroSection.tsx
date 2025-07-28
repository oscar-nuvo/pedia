import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Clock, Users, Brain, Shield, Play } from "lucide-react";
import heroImage from "@/assets/hero-dashboard-mockup.jpg";

const HeroSection = () => {
  const [timeCount, setTimeCount] = useState(0);
  const [practiceCount, setPracticeCount] = useState(0);

  useEffect(() => {
    const timeInterval = setInterval(() => {
      setTimeCount(prev => prev < 120 ? prev + 2 : 120);
    }, 30);

    const practiceInterval = setInterval(() => {
      setPracticeCount(prev => prev < 25000 ? prev + 500 : 25000);
    }, 20);

    return () => {
      clearInterval(timeInterval);
      clearInterval(practiceInterval);
    };
  }, []);

  return (
    <section className="py-24 bg-white overflow-hidden">
      <div className="container mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-black text-white px-4 py-2 rounded-full animate-fade-in">
              <Brain className="w-4 h-4" />
              <span className="text-sm font-medium">AI-First Pediatric EHR</span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl lg:text-6xl font-bold text-black leading-tight animate-fade-in">
              Save{" "}
              <span className="bg-brand-yellow px-3 py-1 rounded-2xl inline-block hover-scale">
                {timeCount} Minutes
              </span>{" "}
              Daily with AI-First Pediatric Practice Management
            </h1>

            {/* Description */}
            <p className="text-xl text-neutral-600 leading-relaxed animate-fade-in">
              Built specifically for pediatricians, our AI-powered platform eliminates 
              documentation burden, automates scheduling, and provides intelligent 
              clinical support—so you can focus on what matters most: your patients.
            </p>

            {/* Key Stats */}
            <div className="flex flex-wrap gap-6 animate-fade-in">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-brand-yellow" />
                <span className="font-semibold text-black">{timeCount}min Saved Daily</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-brand-yellow" />
                <span className="font-semibold text-black">{(practiceCount/1000).toFixed(0)}K+ Target Practices</span>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 animate-fade-in">
              <Button variant="default" size="xl" className="group">
                Start Free Trial
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button variant="outline" size="xl">
                <Play className="w-5 h-5 mr-2" />
                Watch Demo
              </Button>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap gap-6 text-sm text-neutral-600 animate-fade-in">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4" />
                <span>HIPAA Compliant</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4" />
                <span>SOC 2 Certified</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>99.9% Uptime</span>
              </div>
            </div>

            {/* Social Proof */}
            <div className="pt-4 border-t border-neutral-200 animate-fade-in">
              <p className="text-neutral-600 mb-3">Trusted by pediatricians nationwide</p>
              <div className="flex items-center gap-3">
                <div className="flex -space-x-2">
                  {[1,2,3,4,5].map(i => (
                    <div key={i} className="w-8 h-8 bg-brand-yellow rounded-full border-2 border-white"></div>
                  ))}
                </div>
                <span className="text-sm text-neutral-600">1,000+ pediatricians switched this month</span>
              </div>
            </div>
          </div>

          {/* Hero Image */}
          <div className="relative animate-fade-in">
            {/* Main Hero Image */}
            <div className="bg-neutral-100 rounded-3xl overflow-hidden shadow-2xl hover:shadow-3xl transition-shadow duration-500">
              <img 
                src={heroImage} 
                alt="PediatricAI Dashboard"
                className="w-full h-auto hover-scale"
              />
            </div>
            
            {/* Floating Elements */}
            <div className="absolute -top-4 -right-4 bg-brand-yellow rounded-2xl p-4 shadow-lg animate-float">
              <div className="text-black text-center">
                <div className="text-2xl font-bold">30s</div>
                <div className="text-xs">Setup Time</div>
              </div>
            </div>
            
            <div className="absolute -bottom-4 -left-4 bg-black text-white rounded-2xl p-4 shadow-lg animate-float" style={{animationDelay: '1s'}}>
              <div className="text-center">
                <div className="text-2xl font-bold">95%</div>
                <div className="text-xs">User Satisfaction</div>
              </div>
            </div>

            {/* Additional floating testimonial */}
            <div className="absolute top-1/2 -left-8 bg-white rounded-xl p-3 shadow-lg max-w-xs animate-float" style={{animationDelay: '2s'}}>
              <p className="text-xs text-neutral-600">"Saves me 2+ hours daily!"</p>
              <p className="text-xs font-semibold text-black">- Dr. Sarah Chen</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
export default HeroSection;