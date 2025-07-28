import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle } from "lucide-react";

const CTASection = () => {
  return (
    <section className="py-24 bg-brand-yellow">
      <div className="container mx-auto px-6 text-center">
        <div className="max-w-4xl mx-auto space-y-8">
          <h2 className="text-3xl lg:text-5xl font-bold text-black">
            Ready to Transform Your Pediatric Practice?
          </h2>
          <p className="text-xl text-black/80 leading-relaxed">
            Join thousands of pediatricians who've already reduced their documentation time 
            and improved patient care with PediatricAI.
          </p>

          {/* Benefits List */}
          <div className="flex flex-wrap justify-center gap-6 text-left">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-black" />
              <span className="text-black">30-day free trial</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-black" />
              <span className="text-black">No setup fees</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-black" />
              <span className="text-black">Cancel anytime</span>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="default" size="xl" className="group">
              Start Your Free Trial
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button variant="white" size="xl">
              Schedule a Demo
            </Button>
          </div>

          {/* Trust Message */}
          <p className="text-sm text-black/70">
            No credit card required • HIPAA compliant • 24/7 support
          </p>
        </div>
      </div>
    </section>
  );
};

export default CTASection;