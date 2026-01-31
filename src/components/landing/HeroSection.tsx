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
      className="relative min-h-screen bg-rezzy-cream overflow-hidden"
    >
      {/* Floating blob backgrounds */}
      <div
        className="absolute -top-32 -right-32 w-[500px] h-[500px] bg-rezzy-sage-lighter rounded-full opacity-40"
        style={{ filter: "blur(80px)" }}
      />
      <div
        className="absolute -bottom-24 -left-24 w-[350px] h-[350px] bg-rezzy-coral-pale rounded-full opacity-50"
        style={{ filter: "blur(80px)" }}
      />
      <div
        className="absolute top-1/2 left-[10%] w-[200px] h-[200px] bg-rezzy-cream-warm rounded-full opacity-60"
        style={{ filter: "blur(80px)" }}
      />

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
            <span className="inline-flex items-center gap-2 text-rezzy-sage font-medium text-xs tracking-wider bg-rezzy-sage-pale px-3 py-1.5 rounded-full">
              <span className="w-2 h-2 bg-rezzy-sage rounded-full animate-pulse" />
              AI Clinical Companion
            </span>
          </div>

          {/* Headline - Compact on mobile */}
          <h1
            className={`font-display transition-all duration-700 delay-100 ${
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-4"
            }`}
          >
            <span className="block text-2xl sm:text-3xl font-bold text-rezzy-ink leading-tight tracking-tight">
              Your residency{" "}
              <span className="text-rezzy-sage">superpower</span>,
            </span>
            <span className="block text-2xl sm:text-3xl font-bold text-rezzy-ink leading-tight tracking-tight">
              always on call
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
              <span className="inline-flex items-center gap-2 text-rezzy-sage font-medium text-sm tracking-wider bg-rezzy-sage-pale px-4 py-2 rounded-full">
                <span className="w-2 h-2 bg-rezzy-sage rounded-full animate-pulse" />
                AI Clinical Companion
              </span>
            </div>

            {/* Main headline - Stacked on desktop */}
            <h1
              className={`font-display transition-all duration-700 delay-100 ${
                isVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-4"
              }`}
            >
              <span className="block text-4xl lg:text-6xl xl:text-7xl font-bold text-rezzy-ink leading-[0.95] tracking-tight">
                Your residency
              </span>
              <span className="block text-4xl lg:text-6xl xl:text-7xl font-bold leading-[0.95] tracking-tight">
                <span className="text-rezzy-sage">superpower</span>
                <span className="text-rezzy-ink">,</span>
              </span>
              <span className="block text-4xl lg:text-6xl xl:text-7xl font-bold text-rezzy-ink leading-[0.95] tracking-tight">
                always on call
              </span>
            </h1>

            {/* Subheadline - Desktop only */}
            <p
              className={`text-rezzy-ink-muted text-lg lg:text-xl max-w-md leading-relaxed transition-all duration-700 delay-200 ${
                isVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-4"
              }`}
            >
              Clinical guidance in seconds. Learn the 'why' behind every answer.
              Feel confident, not overwhelmed.
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
                <div className="text-3xl font-bold text-rezzy-ink font-display">2 min</div>
                <div className="text-rezzy-ink-muted text-sm mt-1">avg. decision time</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-rezzy-ink font-display">47</div>
                <div className="text-rezzy-ink-muted text-sm mt-1">patients / shift</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-rezzy-sage font-display">&#8734;</div>
                <div className="text-rezzy-ink-muted text-sm mt-1">knowledge access</div>
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
          <div className="flex flex-col items-center gap-2 text-rezzy-ink-muted">
            <span className="text-xs font-mono tracking-wider">SCROLL</span>
            <div className="w-px h-8 bg-gradient-to-b from-rezzy-ink-muted to-transparent" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
