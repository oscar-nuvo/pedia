import { useEffect, useRef, useState } from "react";

interface CounterProps {
  end: number;
  suffix?: string;
  duration?: number;
  isVisible: boolean;
}

const Counter = ({ end, suffix = "", duration = 2000, isVisible }: CounterProps) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isVisible) return;

    let startTime: number;
    let animationFrame: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);

      // Easing function for smooth deceleration
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      setCount(Math.floor(easeOutQuart * end));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationFrame);
  }, [end, duration, isVisible]);

  return (
    <span>
      {count}
      {suffix}
    </span>
  );
};

const NumbersSection = () => {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const stats = [
    {
      number: 47,
      suffix: "",
      label: "PATIENTS",
      sublabel: "per shift",
    },
    {
      number: 80,
      suffix: "",
      label: "HOURS",
      sublabel: "weekly",
    },
    {
      number: 2,
      suffix: "",
      label: "MINUTES",
      sublabel: "to decide",
    },
  ];

  return (
    <section
      ref={sectionRef}
      id="how-it-works"
      className="relative bg-rezzy-black py-32 overflow-hidden"
    >
      {/* Background accent */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-rezzy-gray-dark to-transparent" />
      <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-rezzy-gray-dark to-transparent" />

      {/* Vertical accent line */}
      <div className="absolute left-8 lg:left-16 top-0 bottom-0 w-px bg-rezzy-gray-dark/30" />

      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        {/* Section header */}
        <div
          className={`mb-20 transition-all duration-700 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <span className="text-rezzy-green font-mono text-sm tracking-wider">
            THE REALITY
          </span>
        </div>

        {/* Stats grid - asymmetric layout */}
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-8">
          {stats.map((stat, index) => (
            <div
              key={index}
              className={`lg:col-span-4 transition-all duration-700 ${
                isVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-12"
              }`}
              style={{ transitionDelay: `${200 + index * 150}ms` }}
            >
              <div className="relative group">
                {/* Number */}
                <div className="relative">
                  <span className="text-8xl sm:text-9xl lg:text-[10rem] xl:text-[12rem] font-bold text-rezzy-white leading-none tracking-tighter">
                    <Counter end={stat.number} suffix={stat.suffix} isVisible={isVisible} />
                  </span>

                  {/* Glow effect on hover */}
                  <div className="absolute inset-0 text-8xl sm:text-9xl lg:text-[10rem] xl:text-[12rem] font-bold text-rezzy-green leading-none tracking-tighter opacity-0 group-hover:opacity-20 transition-opacity duration-500 blur-2xl">
                    {stat.number}
                    {stat.suffix}
                  </div>
                </div>

                {/* Labels */}
                <div className="mt-4 space-y-1">
                  <div className="text-rezzy-white font-semibold text-sm tracking-wider">
                    {stat.label}
                  </div>
                  <div className="text-rezzy-gray text-sm">{stat.sublabel}</div>
                </div>

                {/* Decorative line */}
                <div className="mt-6 w-12 h-px bg-rezzy-gray-dark group-hover:bg-rezzy-green group-hover:w-24 transition-all duration-500" />
              </div>
            </div>
          ))}
        </div>

        {/* Punchline */}
        <div
          className={`mt-24 max-w-2xl transition-all duration-700 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
          style={{ transitionDelay: "800ms" }}
        >
          <p className="text-2xl sm:text-3xl lg:text-4xl text-rezzy-white font-medium leading-snug">
            Rezzy helps you make the{" "}
            <span className="text-rezzy-green text-glow-subtle">right decision</span>{" "}
            in those 2 minutes.
          </p>
        </div>
      </div>
    </section>
  );
};

export default NumbersSection;
