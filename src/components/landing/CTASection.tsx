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
      className="relative bg-rezzy-black py-32 overflow-hidden"
    >
      {/* Background effects */}
      <div className="absolute inset-0 gradient-mesh opacity-50" />

      {/* Top border */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-rezzy-gray-dark to-transparent" />

      {/* Animated glow orb */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-rezzy-green/10 rounded-full blur-[120px] animate-breathe" />

      <div className="relative z-10 max-w-4xl mx-auto px-6 lg:px-12 text-center">
        {/* Main headline */}
        <h2
          className={`transition-all duration-700 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <span className="block text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-bold text-rezzy-white leading-[0.95] tracking-tight">
            Stop drowning.
          </span>
          <span
            className={`block text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-bold text-rezzy-green leading-[0.95] tracking-tight text-glow transition-all duration-700 delay-200 ${
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8"
            }`}
          >
            Start thriving.
          </span>
        </h2>

        {/* Subtext */}
        <p
          className={`text-rezzy-gray-light text-lg lg:text-xl max-w-lg mx-auto mt-8 leading-relaxed transition-all duration-700 delay-300 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          Join residents who refuse to let information overload win.
        </p>

        {/* CTA Button */}
        <div
          className={`mt-12 transition-all duration-700 delay-500 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <Link
            to="/auth"
            className="group relative inline-flex items-center gap-3 bg-rezzy-green text-rezzy-black
                     font-semibold text-lg px-10 py-5 transition-all duration-300
                     hover:bg-rezzy-white btn-glow"
          >
            <span>GET STARTED FREE</span>
            <span className="text-xl group-hover:translate-x-1 transition-transform duration-300">
              →
            </span>
          </Link>
        </div>

        {/* Trust badges */}
        <div
          className={`mt-12 flex flex-wrap items-center justify-center gap-8 transition-all duration-700 delay-700 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <span className="text-rezzy-gray text-sm font-mono flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-rezzy-green" />
            No credit card
          </span>
          <span className="text-rezzy-gray text-sm font-mono flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-rezzy-green" />
            Setup in 30 seconds
          </span>
          <span className="text-rezzy-gray text-sm font-mono flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-rezzy-green" />
            Cancel anytime
          </span>
        </div>
      </div>

      {/* Footer */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12 mt-32">
        <div className="border-t border-rezzy-gray-dark/50 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="relative w-6 h-6">
              <div className="absolute inset-0 bg-rezzy-green" />
              <div className="absolute top-0.5 left-0.5 w-2 h-2 bg-rezzy-black" />
            </div>
            <span className="text-rezzy-white font-semibold text-sm">REZZY</span>
          </div>

          {/* Links */}
          <div className="flex items-center gap-6 text-rezzy-gray text-sm">
            <a href="#" className="hover:text-rezzy-white transition-colors">
              Privacy
            </a>
            <a href="#" className="hover:text-rezzy-white transition-colors">
              Terms
            </a>
            <a href="#" className="hover:text-rezzy-white transition-colors">
              Contact
            </a>
          </div>

          {/* Copyright */}
          <span className="text-rezzy-gray-dark text-sm font-mono">
            © 2025 Rezzy
          </span>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
