import { Check, X } from "lucide-react";

const comparisonData = [
  {
    feature: "Setup Time",
    pediatricAI: "30 seconds",
    traditional: "3-6 months",
    pediatricAIBetter: true
  },
  {
    feature: "Documentation Time",
    pediatricAI: "30 seconds/note",
    traditional: "5-8 minutes/note",
    pediatricAIBetter: true
  },
  {
    feature: "Family Scheduling",
    pediatricAI: "Automatic sibling coordination",
    traditional: "Manual coordination",
    pediatricAIBetter: true
  },
  {
    feature: "Pediatric Workflows",
    pediatricAI: "Built-in AAP guidelines",
    traditional: "Generic templates",
    pediatricAIBetter: true
  },
  {
    feature: "AI Assistant",
    pediatricAI: "Pediatric-specialized AI",
    traditional: "No AI support",
    pediatricAIBetter: true
  },
  {
    feature: "Training Required",
    pediatricAI: "None - intuitive design",
    traditional: "Weeks of training",
    pediatricAIBetter: true
  },
  {
    feature: "Monthly Cost (Solo)",
    pediatricAI: "$149/month",
    traditional: "$300-500/month",
    pediatricAIBetter: true
  },
  {
    feature: "Growth Chart Analysis",
    pediatricAI: "AI-powered insights",
    traditional: "Manual plotting",
    pediatricAIBetter: true
  },
  {
    feature: "Vaccine Tracking",
    pediatricAI: "Automated scheduling",
    traditional: "Manual reminders",
    pediatricAIBetter: true
  },
  {
    feature: "Parent Communication",
    pediatricAI: "AI-powered portal",
    traditional: "Basic messaging",
    pediatricAIBetter: true
  }
];

const ComparisonSection = () => {
  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-neutral-800 mb-4">
            PediatricAI vs. Traditional EHR Systems
          </h2>
          <p className="text-xl text-neutral-600 max-w-3xl mx-auto">
            See why pediatricians are switching from legacy systems to PediatricAI
          </p>
        </div>

        <div className="max-w-5xl mx-auto">
          <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
            {/* Header */}
            <div className="grid grid-cols-3 bg-neutral-50 border-b border-neutral-200">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-neutral-600">Feature</h3>
              </div>
              <div className="p-6 bg-gradient-to-r from-brand-lavender to-brand-purple">
                <h3 className="text-lg font-bold text-white">PediatricAI</h3>
              </div>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-neutral-600">Traditional EHR</h3>
              </div>
            </div>

            {/* Comparison Rows */}
            {comparisonData.map((row, index) => (
              <div 
                key={index} 
                className={`grid grid-cols-3 border-b border-neutral-100 ${
                  index % 2 === 0 ? 'bg-neutral-25' : 'bg-white'
                }`}
              >
                <div className="p-6">
                  <span className="font-medium text-neutral-800">{row.feature}</span>
                </div>
                <div className="p-6 bg-brand-peach/20">
                  <div className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-brand-purple flex-shrink-0" />
                    <span className="font-medium text-brand-purple">{row.pediatricAI}</span>
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-3">
                    <X className="w-5 h-5 text-accent-rose flex-shrink-0" />
                    <span className="text-neutral-600">{row.traditional}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom Summary */}
          <div className="grid md:grid-cols-2 gap-8 mt-12">
            <div className="bg-brand-peach/20 border border-brand-coral/30 rounded-3xl p-8">
              <h3 className="text-xl font-bold text-brand-purple mb-4">With PediatricAI</h3>
              <ul className="space-y-3 text-brand-purple">
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-brand-coral" />
                  <span>Save 2+ hours daily on documentation</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-brand-coral" />
                  <span>Start seeing patients in 30 seconds</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-brand-coral" />
                  <span>50% lower cost than competitors</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-brand-coral" />
                  <span>Pediatric-specialized workflows</span>
                </li>
              </ul>
            </div>

            <div className="bg-accent-lilac/30 border border-accent-rose/30 rounded-3xl p-8">
              <h3 className="text-xl font-bold text-neutral-700 mb-4">Traditional EHR Systems</h3>
              <ul className="space-y-3 text-neutral-600">
                <li className="flex items-center gap-3">
                  <X className="w-5 h-5 text-accent-rose" />
                  <span>Months of implementation time</span>
                </li>
                <li className="flex items-center gap-3">
                  <X className="w-5 h-5 text-accent-rose" />
                  <span>Generic, not pediatric-focused</span>
                </li>
                <li className="flex items-center gap-3">
                  <X className="w-5 h-5 text-accent-rose" />
                  <span>High monthly costs and setup fees</span>
                </li>
                <li className="flex items-center gap-3">
                  <X className="w-5 h-5 text-accent-rose" />
                  <span>Extensive staff training required</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="text-center mt-12">
            <button className="bg-gradient-to-r from-brand-pink to-brand-coral text-white px-8 py-4 rounded-full font-semibold hover:shadow-lg hover:shadow-brand-pink/30 transition-all">
              Switch to PediatricAI - Free Trial
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ComparisonSection;