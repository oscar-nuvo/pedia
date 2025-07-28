import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

const faqs = [
  {
    question: "How quickly can I start using PediatricAI?",
    answer: "You can start scheduling appointments and seeing patients within 30 seconds of signing up. Our intuitive interface requires no training - if you can use an iPhone, you can use PediatricAI."
  },
  {
    question: "Is PediatricAI HIPAA compliant?",
    answer: "Yes, PediatricAI is fully HIPAA compliant with end-to-end encryption, audit logging, and SOC 2 certification. We take patient privacy and data security extremely seriously."
  },
  {
    question: "How accurate is the AI documentation?",
    answer: "Our ambient AI achieves 95%+ accuracy on SOAP note generation. The AI is specifically trained on pediatric conversations and medical terminology, requiring minimal physician review and editing."
  },
  {
    question: "Can I integrate with my existing systems?",
    answer: "Yes, PediatricAI integrates with Google Calendar, QuickBooks, lab systems (HL7 FHIR), and state vaccine registries. We also connect with major clearinghouses for seamless billing."
  },
  {
    question: "What if I'm not tech-savvy?",
    answer: "PediatricAI is designed for physicians, not IT departments. Our interface is as intuitive as consumer apps like Instagram or Uber. Plus, we provide 24/7 support and onboarding assistance."
  },
  {
    question: "How much does PediatricAI cost?",
    answer: "Solo practices pay $149/month per provider - 50% less than traditional EHR systems. This includes all features, unlimited support, and regular updates. No setup fees or long-term contracts."
  },
  {
    question: "What makes PediatricAI different from Epic or Cerner?",
    answer: "Unlike generic EHR systems, PediatricAI is built specifically for pediatrics with family-centric scheduling, growth chart analysis, vaccine tracking, and AAP guideline integration. Plus, we take 30 seconds to set up, not 6 months."
  },
  {
    question: "Can I try PediatricAI before committing?",
    answer: "Absolutely! We offer a 30-day free trial with full access to all features. No credit card required, no setup fees, and you can cancel anytime. Most pediatricians see immediate value within the first week."
  },
  {
    question: "How does family scheduling work?",
    answer: "Our AI understands family relationships and automatically suggests coordinating sibling appointments, manages complex parent availability, and sends unified family communications. It's like having a scheduling specialist who knows every family."
  },
  {
    question: "What about training my staff?",
    answer: "PediatricAI requires zero training. The interface is self-explanatory, and our AI handles most administrative tasks automatically. Your staff will be productive from day one."
  }
];

const FAQSection = () => {
  const [openFAQ, setOpenFAQ] = useState(0);

  return (
    <section className="py-24 bg-neutral-50">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-neutral-800 mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-xl text-neutral-600 max-w-3xl mx-auto">
            Everything you need to know about PediatricAI
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-white rounded-2xl shadow-sm shadow-brand-pink/5 border border-neutral-200 overflow-hidden">
                <button
                  onClick={() => setOpenFAQ(openFAQ === index ? -1 : index)}
                  className="w-full p-6 text-left flex items-center justify-between hover:bg-neutral-50 transition-colors"
                >
                  <h3 className="text-lg font-semibold text-neutral-800 pr-4">
                    {faq.question}
                  </h3>
                  {openFAQ === index ? (
                    <ChevronUp className="w-5 h-5 text-brand-coral flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-brand-coral flex-shrink-0" />
                  )}
                </button>
                
                {openFAQ === index && (
                  <div className="px-6 pb-6">
                    <div className="h-px bg-neutral-200 mb-4"></div>
                    <p className="text-neutral-700 leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <h3 className="text-xl font-bold text-neutral-800 mb-4">
              Still have questions?
            </h3>
            <p className="text-neutral-600 mb-6">
              Our pediatric specialists are here to help
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-gradient-to-r from-brand-lavender to-brand-purple text-white px-6 py-3 rounded-full font-semibold hover:shadow-lg hover:shadow-brand-lavender/30 transition-all">
                Schedule a Call
              </button>
              <button className="border border-brand-coral/30 text-brand-coral px-6 py-3 rounded-full font-semibold hover:bg-brand-peach/20 transition-colors">
                Email Support
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FAQSection;