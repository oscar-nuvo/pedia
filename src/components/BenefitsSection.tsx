import { Brain, Clock, Users, Zap, Shield, Heart } from "lucide-react";

const benefits = [
  {
    icon: Brain,
    title: "AI-Powered Documentation",
    description: "Ambient listening converts conversations into structured SOAP notes automatically, reducing documentation time by 80%",
    color: "primary"
  },
  {
    icon: Clock,
    title: "30-Second Setup",
    description: "Get started immediately with our intuitive interface. No months of training or complex implementation required",
    color: "secondary"
  },
  {
    icon: Users,
    title: "Family-Centric Design",
    description: "Built for pediatrics with sibling scheduling, family health histories, and age-appropriate workflows",
    color: "accent"
  },
  {
    icon: Zap,
    title: "Smart Automation",
    description: "AI agents handle appointment scheduling, follow-ups, and routine communications automatically",
    color: "primary"
  },
  {
    icon: Shield,
    title: "HIPAA Compliant",
    description: "Enterprise-grade security with end-to-end encryption and audit logging for complete peace of mind",
    color: "secondary"
  },
  {
    icon: Heart,
    title: "Pediatric Specialized",
    description: "AAP guidelines built-in, growth chart analysis, vaccine tracking, and developmental milestone monitoring",
    color: "accent"
  }
];

const BenefitsSection = () => {
  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-neutral-800 mb-4">
            Why Pediatricians Choose PediatricAI
          </h2>
          <p className="text-xl text-neutral-600 max-w-3xl mx-auto">
            Built specifically for pediatric practices, our AI-first platform eliminates administrative 
            burden so you can focus on what matters most—your patients.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon;
            return (
              <div key={index} className="group p-8 rounded-3xl bg-white border border-neutral-200 hover:shadow-xl hover:shadow-brand-pink/10 transition-all duration-300">
                <div className={`w-12 h-12 rounded-3xl flex items-center justify-center mb-6 ${
                  benefit.color === 'primary' ? 'bg-gradient-to-r from-brand-lavender to-brand-purple' :
                  benefit.color === 'secondary' ? 'bg-gradient-to-r from-brand-peach to-brand-coral' :
                  'bg-gradient-to-r from-brand-pink to-accent-rose'
                } shadow-lg ${
                  benefit.color === 'primary' ? 'shadow-brand-lavender/20' :
                  benefit.color === 'secondary' ? 'shadow-brand-coral/20' :
                  'shadow-brand-pink/20'
                }`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-neutral-800 mb-3">
                  {benefit.title}
                </h3>
                <p className="text-neutral-600 leading-relaxed">
                  {benefit.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default BenefitsSection;