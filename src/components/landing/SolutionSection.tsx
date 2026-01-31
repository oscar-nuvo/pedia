import { useState, useEffect, useRef } from "react";

interface Feature {
  id: string;
  number: string;
  title: string;
  description: string;
  demo: {
    question: string;
    response: string;
  };
}

const features: Feature[] = [
  {
    id: "instant",
    number: "01",
    title: "Instant Answers",
    description:
      "Evidence-based clinical guidance in seconds. No more hunting through UpToDate while your patient waits.",
    demo: {
      question: "Differential for pediatric chest pain with fever?",
      response: `→ Myocarditis
→ Pericarditis
→ Pneumonia with pleuritis
→ Costochondritis (less likely with fever)
→ Kawasaki disease (if meeting other criteria)

Workup: ECG, troponin, CXR, inflammatory markers.

⚠ Red flags: Tachycardia out of proportion, hypotension, muffled heart sounds.`,
    },
  },
  {
    id: "learn",
    number: "02",
    title: "Learn While You Work",
    description:
      "Every answer comes with the 'why'. Turn clinical encounters into learning opportunities.",
    demo: {
      question: "Why is high-dose amoxicillin recommended for AOM?",
      response: `Standard amoxicillin may not achieve adequate middle ear concentrations against resistant S. pneumoniae.

High-dose (80-90 mg/kg/day) achieves:
• Higher middle ear fluid concentrations
• Better coverage of intermediate-resistant strains
• Similar safety profile to standard dosing

Teaching point: Always consider site-specific pharmacokinetics when choosing antibiotic dosing.`,
    },
  },
  {
    id: "safety",
    number: "03",
    title: "Never Miss Anything",
    description:
      "Drug interactions, contraindications, red flags—Rezzy catches what you might overlook at 3am.",
    demo: {
      question: "Can I add ondansetron for patient on fluoxetine?",
      response: `⚠ INTERACTION DETECTED

Both fluoxetine and ondansetron prolong QTc interval.

Risk: Additive QTc prolongation → Torsades de pointes

Recommendation:
• Consider alternative antiemetic (metoclopramide)
• If ondansetron necessary: obtain baseline ECG
• Avoid in patients with other QT-prolonging factors

Severity: Moderate-High`,
    },
  },
];

const SolutionSection = () => {
  const [activeFeature, setActiveFeature] = useState(features[0]);
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.2 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="features"
      className="relative bg-rezzy-cream py-32 overflow-hidden"
    >
      {/* Background elements */}
      <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(74, 155, 140, 0.15) 1px, transparent 0)', backgroundSize: '32px 32px' }} />

      {/* Gradient accent */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-rezzy-sage-pale/30 to-transparent" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12">
        {/* Section header */}
        <div
          className={`mb-20 transition-all duration-700 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <span className="text-rezzy-sage font-mono text-sm tracking-wider">
            FEATURES
          </span>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-rezzy-ink mt-4 tracking-tight">
            Everything you need to feel confident
          </h2>
        </div>

        {/* Feature grid */}
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-16">
          {/* Feature list */}
          <div className="lg:col-span-5 space-y-3">
            {features.map((feature, index) => (
              <button
                key={feature.id}
                onClick={() => setActiveFeature(feature)}
                className={`w-full text-left p-6 rounded-3xl border transition-all duration-300 group hover:-translate-y-2 hover:rotate-[0.5deg] ${
                  activeFeature.id === feature.id
                    ? "bg-rezzy-cream-warm border-rezzy-sage/30 shadow-lg"
                    : "bg-rezzy-cream border-rezzy-cream-deep hover:border-rezzy-sage/20 hover:bg-rezzy-cream-warm hover:shadow-md"
                } ${
                  isVisible
                    ? "opacity-100 translate-x-0"
                    : "opacity-0 -translate-x-8"
                }`}
                style={{ transitionDelay: `${300 + index * 100}ms` }}
              >
                <div className="flex items-start gap-4">
                  {/* Number */}
                  <span
                    className={`font-mono text-3xl font-bold transition-colors duration-300 ${
                      activeFeature.id === feature.id
                        ? "text-rezzy-sage-lighter"
                        : "text-rezzy-sage-pale group-hover:text-rezzy-sage-lighter"
                    }`}
                  >
                    {feature.number}
                  </span>

                  {/* Content */}
                  <div className="flex-1">
                    <h3
                      className={`text-xl font-semibold mb-2 transition-colors duration-300 ${
                        activeFeature.id === feature.id
                          ? "text-rezzy-ink"
                          : "text-rezzy-ink-soft group-hover:text-rezzy-ink"
                      }`}
                    >
                      {feature.title}
                    </h3>
                    <p
                      className={`text-sm leading-relaxed transition-colors duration-300 ${
                        activeFeature.id === feature.id
                          ? "text-rezzy-ink-muted"
                          : "text-rezzy-ink-light group-hover:text-rezzy-ink-muted"
                      }`}
                    >
                      {feature.description}
                    </p>
                  </div>

                  {/* Arrow indicator */}
                  <div
                    className={`mt-1 transition-all duration-300 ${
                      activeFeature.id === feature.id
                        ? "text-rezzy-sage translate-x-0 opacity-100"
                        : "text-rezzy-ink-light -translate-x-2 opacity-0 group-hover:opacity-50"
                    }`}
                  >
                    →
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Feature demo */}
          <div
            className={`lg:col-span-7 transition-all duration-700 ${
              isVisible
                ? "opacity-100 translate-x-0"
                : "opacity-0 translate-x-8"
            }`}
            style={{ transitionDelay: "600ms" }}
          >
            <div className="relative bg-white border border-rezzy-sage/10 rounded-3xl h-full min-h-[400px] shadow-lg">
              {/* Demo header */}
              <div className="flex items-center justify-between px-5 py-3 border-b border-rezzy-cream-deep rounded-t-3xl bg-rezzy-cream-warm/50">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-rezzy-sage rounded-full animate-pulse" />
                  <span className="text-rezzy-sage font-mono text-xs">
                    LIVE PREVIEW
                  </span>
                </div>
                <span className="text-rezzy-ink-light font-mono text-xs">
                  {activeFeature.number}
                </span>
              </div>

              {/* Demo content */}
              <div className="p-6 space-y-6">
                {/* Question */}
                <div className="flex items-start gap-3">
                  <span className="text-rezzy-ink-muted font-mono text-sm mt-0.5">
                    Q:
                  </span>
                  <p className="text-rezzy-ink text-base">
                    {activeFeature.demo.question}
                  </p>
                </div>

                {/* Divider */}
                <div className="w-full h-px bg-rezzy-cream-deep" />

                {/* Response */}
                <div className="flex items-start gap-3">
                  <span className="text-rezzy-sage font-mono text-sm mt-0.5">
                    A:
                  </span>
                  <pre className="text-rezzy-ink-soft font-mono text-sm leading-relaxed whitespace-pre-wrap flex-1">
                    {activeFeature.demo.response}
                  </pre>
                </div>
              </div>

              {/* Demo footer */}
              <div className="absolute bottom-0 left-0 right-0 px-5 py-3 border-t border-rezzy-cream-deep bg-rezzy-cream-warm/30 rounded-b-3xl">
                <span className="text-rezzy-ink-muted text-xs font-mono">
                  Response time: 0.8s • Sources: AAP Guidelines
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SolutionSection;
