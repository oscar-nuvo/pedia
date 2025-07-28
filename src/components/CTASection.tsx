import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle } from "lucide-react";

const CTASection = () => {
  return (
    <section className="py-24 bg-gradient-to-br from-brand-peach to-accent-cream">
      <div className="container mx-auto px-6 text-center">
        <div className="max-w-4xl mx-auto space-y-8">
          <h2 className="text-3xl lg:text-5xl font-bold text-neutral-800">
            Ready to Transform Your Pediatric Practice?
          </h2>
          <p className="text-xl text-neutral-700 leading-relaxed">
            Join thousands of pediatricians who've already reduced their documentation time 
            and improved patient care with PediatricAI.
          </p>

          {/* Benefits List */}
          <div className="flex flex-wrap justify-center gap-6 text-left">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-brand-coral" />
              <span className="text-neutral-700">30-day free trial</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-brand-coral" />
              <span className="text-neutral-700">No setup fees</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-brand-coral" />
              <span className="text-neutral-700">Cancel anytime</span>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="accent" size="xl" className="group">
              Start Your Free Trial
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button variant="white" size="xl">
              Schedule a Demo
            </Button>
          </div>

          {/* Trust Message */}
          <p className="text-sm text-neutral-600">
            No credit card required • HIPAA compliant • 24/7 support
          </p>
        </div>
      </div>
    </section>
  );
};

export default CTASection;