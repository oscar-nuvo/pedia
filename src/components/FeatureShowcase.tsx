import { CheckCircle, MessageSquare, Calendar, BarChart3 } from "lucide-react";

const features = [
  {
    icon: MessageSquare,
    title: "Smart Clinical Documentation",
    description: "AI-powered ambient listening captures patient conversations and generates structured SOAP notes automatically.",
    highlights: [
      "Ambient conversation capture",
      "Automatic SOAP note generation",
      "AAP template compliance",
      "Voice-to-text integration"
    ]
  },
  {
    icon: Calendar,
    title: "Intelligent Scheduling",
    description: "Family-centric scheduling that understands pediatric workflows and parent availability patterns.",
    highlights: [
      "Sibling appointment coordination",
      "AI receptionist for 24/7 booking",
      "Smart conflict detection",
      "Automated reminders"
    ]
  },
  {
    icon: BarChart3,
    title: "Pediatric AI Co-Pilot",
    description: "Your intelligent assistant for clinical decisions, medication dosing, and practice insights.",
    highlights: [
      "Drug dosing calculations",
      "Growth chart analysis",
      "Clinical decision support",
      "Population health insights"
    ]
  }
];

const FeatureShowcase = () => {
  return (
    <section className="py-24 bg-neutral-50">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-neutral-800 mb-4">
            Core Features That Transform Your Practice
          </h2>
          <p className="text-xl text-neutral-600 max-w-3xl mx-auto">
            Every feature is designed with pediatric workflows in mind, powered by AI to maximize 
            efficiency and minimize administrative burden.
          </p>
        </div>

        <div className="space-y-16">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            const isEven = index % 2 === 0;
            
            return (
              <div key={index} className={`grid lg:grid-cols-2 gap-12 items-center ${
                !isEven ? 'lg:grid-flow-col-dense' : ''
              }`}>
                {/* Content */}
                <div className={`space-y-6 ${!isEven ? 'lg:col-start-2' : ''}`}>
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-brand-lavender to-brand-purple rounded-3xl flex items-center justify-center shadow-lg shadow-brand-lavender/20">
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-neutral-800">
                      {feature.title}
                    </h3>
                  </div>
                  
                  <p className="text-lg text-neutral-600 leading-relaxed">
                    {feature.description}
                  </p>
                  
                  <div className="space-y-3">
                    {feature.highlights.map((highlight, idx) => (
                      <div key={idx} className="flex items-center space-x-3">
                        <CheckCircle className="w-5 h-5 text-brand-coral flex-shrink-0" />
                        <span className="text-neutral-800">{highlight}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Visual Placeholder */}
                <div className={`${!isEven ? 'lg:col-start-1' : ''}`}>
                  <div className="relative">
                    <div className="bg-white rounded-3xl p-8 shadow-xl">
                      <div className="aspect-video bg-neutral-50 rounded-3xl border-2 border-dashed border-neutral-300 flex items-center justify-center">
                        <div className="text-center space-y-2">
                          <Icon className="w-8 h-8 text-neutral-400 mx-auto" />
                          <p className="text-sm text-neutral-600">Feature Demo</p>
                        </div>
                      </div>
                    </div>
                    {/* Decorative dot */}
                    <div className="absolute -top-4 -right-4 w-8 h-8 bg-gradient-to-r from-brand-coral to-brand-pink rounded-full opacity-60"></div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FeatureShowcase;