import { AlertTriangle, ArrowRight, CheckCircle } from "lucide-react";

const problems = [
  {
    title: "3+ Hours Daily on Documentation",
    description: "Traditional EHRs force physicians to spend more time typing than treating patients",
    impact: "Leads to physician burnout and reduced patient satisfaction"
  },
  {
    title: "Complex Family Scheduling",
    description: "Managing sibling appointments, parent availability, and coordinated care is a nightmare",
    impact: "Results in scheduling conflicts and frustrated families"
  },
  {
    title: "Generic, Not Pediatric-Focused",
    description: "Most EHRs are built for general medicine, missing pediatric-specific workflows",
    impact: "Inefficient workflows and missed pediatric care opportunities"
  },
  {
    title: "Months of Training Required",
    description: "Traditional systems take 3-6 months to implement with extensive staff training",
    impact: "Disrupted practice operations and high implementation costs"
  }
];

const solutions = [
  {
    title: "30-Second Documentation",
    description: "AI ambient listening converts conversations to structured SOAP notes automatically",
    benefit: "Saves 120+ minutes daily"
  },
  {
    title: "Family-Centric Scheduling",
    description: "Intelligent scheduling that understands family dynamics and sibling coordination",
    benefit: "95% appointment satisfaction"
  },
  {
    title: "Pediatric-Specialized AI",
    description: "Built specifically for pediatrics with AAP guidelines, growth charts, and vaccine tracking",
    benefit: "Clinically accurate for pediatrics"
  },
  {
    title: "Instant Setup",
    description: "Start scheduling appointments and seeing patients within 30 seconds of signup",
    benefit: "No implementation downtime"
  }
];

const ProblemSolutionSection = () => {
  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-neutral-800 mb-4">
            The Pediatric Practice Crisis
          </h2>
          <p className="text-xl text-neutral-600 max-w-3xl mx-auto">
            Traditional EHRs are killing pediatric practice efficiency. PediatricAI is the antidote.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-16 items-start">
          {/* Problems Side */}
          <div>
            <div className="flex items-center gap-3 mb-8">
              <AlertTriangle className="w-8 h-8 text-accent-rose" />
              <h3 className="text-2xl font-bold text-neutral-800">Current Problems</h3>
            </div>
            
            <div className="space-y-6">
              {problems.map((problem, index) => (
                <div key={index} className="bg-accent-lilac/30 border border-accent-rose/30 rounded-2xl p-6">
                  <h4 className="font-semibold text-neutral-800 mb-2">{problem.title}</h4>
                  <p className="text-neutral-700 mb-3">{problem.description}</p>
                  <p className="text-sm text-accent-rose font-medium">{problem.impact}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Solutions Side */}
          <div>
            <div className="flex items-center gap-3 mb-8">
              <CheckCircle className="w-8 h-8 text-brand-coral" />
              <h3 className="text-2xl font-bold text-neutral-800">PediatricAI Solutions</h3>
            </div>
            
            <div className="space-y-6">
              {solutions.map((solution, index) => (
                <div key={index} className="bg-brand-peach/20 border border-brand-coral/30 rounded-2xl p-6">
                  <h4 className="font-semibold text-neutral-800 mb-2">{solution.title}</h4>
                  <p className="text-neutral-700 mb-3">{solution.description}</p>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-brand-coral" />
                    <p className="text-sm text-brand-coral font-medium">{solution.benefit}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Transformation Arrow */}
        <div className="flex justify-center my-12">
          <div className="bg-gradient-to-r from-brand-coral to-brand-pink rounded-full p-4 shadow-lg shadow-brand-coral/20">
            <ArrowRight className="w-8 h-8 text-white" />
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center">
          <h3 className="text-2xl font-bold text-neutral-800 mb-4">
            Ready to Transform Your Practice?
          </h3>
          <p className="text-neutral-600 mb-6">
            Join 1,000+ pediatricians who've already made the switch
          </p>
          <button className="bg-gradient-to-r from-brand-pink to-brand-coral text-white px-8 py-4 rounded-full font-semibold hover:shadow-lg hover:shadow-brand-pink/30 transition-all">
            Start Your Free Trial
          </button>
        </div>
      </div>
    </section>
  );
};

export default ProblemSolutionSection;