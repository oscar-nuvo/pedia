import { Link } from "react-router-dom";
import { useEffect, useRef, useState } from "react";

const CTASection = () => {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.3 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative bg-rezzy-cream py-32 overflow-hidden"
    >
      {/* Decorative floating blobs */}
      <div className="absolute top-10 right-1/4 w-[400px] h-[400px] bg-rezzy-sage-lighter/40 rounded-full blur-[100px] animate-breathe" />
      <div className="absolute bottom-10 left-1/4 w-[350px] h-[350px] bg-rezzy-coral-pale/50 rounded-full blur-[100px] animate-breathe" style={{ animationDelay: '2s' }} />

      {/* Top border */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-rezzy-cream-deep to-transparent" />

      <div className="relative z-10 max-w-4xl mx-auto px-6 lg:px-12 text-center">
        {/* Main headline */}
        <h2
          className={`transition-all duration-700 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <span className="block text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-rezzy-ink leading-[1.1] tracking-tight">
            Ready to feel unstoppable?
          </span>
        </h2>

        {/* Subtext */}
        <p
          className={`text-rezzy-ink-muted text-lg lg:text-xl max-w-lg mx-auto mt-8 leading-relaxed transition-all duration-700 delay-300 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          Join hundreds of residents who've found their calm in the chaos.
        </p>

        {/* CTA Button */}
        <div
          className={`mt-12 transition-all duration-700 delay-500 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <Link
            to="/auth"
            className="group relative inline-flex items-center gap-3 bg-rezzy-sage text-white
                     font-semibold text-lg px-12 py-5 rounded-full transition-all duration-300
                     hover:bg-rezzy-sage-light hover:shadow-lg hover:shadow-rezzy-sage/25"
          >
            <span>GET STARTED FREE</span>
            <span className="text-xl group-hover:translate-x-1 transition-transform duration-300">

            </span>
          </Link>
        </div>

        {/* Trust badges */}
        <div
          className={`mt-12 flex flex-wrap items-center justify-center gap-8 transition-all duration-700 delay-700 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <span className="text-rezzy-ink-muted text-sm font-mono flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-rezzy-sage rounded-full" />
            No credit card
          </span>
          <span className="text-rezzy-ink-muted text-sm font-mono flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-rezzy-sage rounded-full" />
            Setup in 30 seconds
          </span>
          <span className="text-rezzy-ink-muted text-sm font-mono flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-rezzy-sage rounded-full" />
            Cancel anytime
          </span>
        </div>
      </div>

      {/* Footer */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12 mt-32">
        <div className="border-t border-rezzy-cream-deep pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="relative w-6 h-6">
              <div className="absolute inset-0 bg-rezzy-sage rounded-sm" />
              <div className="absolute top-0.5 left-0.5 w-2 h-2 bg-rezzy-cream rounded-sm" />
            </div>
            <span className="text-rezzy-ink font-semibold text-sm">REZZY</span>
          </div>

          {/* Links */}
          <div className="flex items-center gap-6 text-rezzy-ink-muted text-sm">
            <a href="#" className="hover:text-rezzy-ink transition-colors">
              Privacy
            </a>
            <a href="#" className="hover:text-rezzy-ink transition-colors">
              Terms
            </a>
            <a href="#" className="hover:text-rezzy-ink transition-colors">
              Contact
            </a>
          </div>

          {/* Copyright */}
          <span className="text-rezzy-ink-light text-sm font-mono">
            © 2025 Rezzy
          </span>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
