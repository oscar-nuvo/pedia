import { useEffect, useRef, useState } from "react";
import InteractiveDemo from "./InteractiveDemo";

const HeroSection = () => {
  const [isVisible, setIsVisible] = useState(false);
  const heroRef = useRef<HTMLElement>(null);

  useEffect(() => {
    // Trigger animations after mount
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section
      ref={heroRef}
      className="relative min-h-screen bg-rezzy-black overflow-hidden"
    >
      {/* Background grid */}
      <div className="absolute inset-0 grid-bg opacity-50" />

      {/* Gradient mesh background */}
      <div className="absolute inset-0 gradient-mesh" />

      {/* Noise overlay */}
      <div className="noise-overlay" />

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-6 lg:px-12 pt-20 md:pt-32 pb-16 md:pb-24">
        {/* Mobile Layout: Stacked, demo-centric */}
        <div className="md:hidden space-y-6">
          {/* Eyebrow */}
          <div
            className={`transition-all duration-700 ${
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-4"
            }`}
          >
            <span className="inline-flex items-center gap-2 text-rezzy-green font-mono text-xs tracking-wider">
              <span className="w-2 h-2 bg-rezzy-green animate-pulse" />
              AI-POWERED CLINICAL ASSISTANT
            </span>
          </div>

          {/* Headline - Compact on mobile */}
          <h1
            className={`transition-all duration-700 delay-100 ${
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-4"
            }`}
          >
            <span className="block text-2xl sm:text-3xl font-bold text-rezzy-white leading-tight tracking-tight">
              Your unfair advantage
            </span>
            <span className="block text-2xl sm:text-3xl font-bold leading-tight tracking-tight text-glow text-rezzy-green">
              in residency.
            </span>
          </h1>

          {/* Interactive Demo - Primary focus on mobile */}
          <div
            className={`transition-all duration-1000 delay-300 ${
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-4"
            }`}
          >
            <InteractiveDemo />
          </div>
        </div>

        {/* Desktop Layout: Two-column with full content */}
        <div className="hidden md:grid lg:grid-cols-2 gap-16 lg:gap-8 items-center min-h-[calc(100vh-8rem)]">
          {/* Left: Headline */}
          <div className="space-y-8">
            {/* Eyebrow */}
            <div
              className={`transition-all duration-700 ${
                isVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-4"
              }`}
            >
              <span className="inline-flex items-center gap-2 text-rezzy-green font-mono text-sm tracking-wider">
                <span className="w-2 h-2 bg-rezzy-green animate-pulse" />
                AI-POWERED CLINICAL ASSISTANT
              </span>
            </div>

            {/* Main headline - Stacked on desktop */}
            <h1
              className={`transition-all duration-700 delay-100 ${
                isVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-4"
              }`}
            >
              <span className="block text-4xl lg:text-6xl xl:text-7xl font-bold text-rezzy-white leading-[0.95] tracking-tight">
                Your unfair
              </span>
              <span className="block text-4xl lg:text-6xl xl:text-7xl font-bold text-rezzy-white leading-[0.95] tracking-tight">
                advantage
              </span>
              <span className="block text-4xl lg:text-6xl xl:text-7xl font-bold leading-[0.95] tracking-tight text-glow text-rezzy-green">
                in residency.
              </span>
            </h1>

            {/* Subheadline - Desktop only */}
            <p
              className={`text-rezzy-gray-light text-lg lg:text-xl max-w-md leading-relaxed transition-all duration-700 delay-200 ${
                isVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-4"
              }`}
            >
              Evidence-based answers in seconds. Learn while you work.
              Never miss a critical detail.
            </p>

            {/* Stats row - Desktop only */}
            <div
              className={`flex gap-12 pt-4 transition-all duration-700 delay-300 ${
                isVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-4"
              }`}
            >
              <div>
                <div className="text-3xl font-bold text-rezzy-white">2 min</div>
                <div className="text-rezzy-gray text-sm mt-1">avg. decision time</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-rezzy-white">47</div>
                <div className="text-rezzy-gray text-sm mt-1">patients / shift</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-rezzy-green">∞</div>
                <div className="text-rezzy-gray text-sm mt-1">knowledge access</div>
              </div>
            </div>
          </div>

          {/* Right: Interactive Demo */}
          <div
            className={`transition-all duration-1000 delay-500 ${
              isVisible
                ? "opacity-100 translate-x-0"
                : "opacity-0 translate-x-8"
            }`}
          >
            <InteractiveDemo />
          </div>
        </div>

        {/* Scroll indicator - Desktop only */}
        <div
          className={`hidden md:block absolute bottom-8 left-1/2 -translate-x-1/2 transition-all duration-700 delay-700 ${
            isVisible ? "opacity-100" : "opacity-0"
          }`}
        >
          <div className="flex flex-col items-center gap-2 text-rezzy-gray">
            <span className="text-xs font-mono tracking-wider">SCROLL</span>
            <div className="w-px h-8 bg-gradient-to-b from-rezzy-gray to-transparent" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
