import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import RezzyLogo from "../RezzyLogo";

const LandingHeader = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-rezzy-cream/95 backdrop-blur-sm border-b border-rezzy-ink-light/20"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link
            to="/"
            className="group flex items-center gap-3"
          >
            <RezzyLogo size={32} />
            <span className="text-rezzy-ink font-semibold text-xl tracking-tight group-hover:text-rezzy-sage transition-colors duration-300">
              Rezzy
            </span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <a
              href="#features"
              className="text-rezzy-ink-muted hover:text-rezzy-ink text-sm font-medium transition-colors duration-300"
            >
              Features
            </a>
            <a
              href="#how-it-works"
              className="text-rezzy-ink-muted hover:text-rezzy-ink text-sm font-medium transition-colors duration-300"
            >
              How it works
            </a>
          </nav>

          {/* CTA */}
          <div className="flex items-center gap-4">
            <Link
              to="/auth"
              className="hidden md:inline text-rezzy-ink-muted hover:text-rezzy-ink hover:bg-rezzy-cream-warm px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-300"
            >
              Log in
            </Link>
            <Link
              to="/auth"
              className="relative group bg-rezzy-sage text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-all duration-300 hover:bg-rezzy-sage-light"
            >
              <span className="relative z-10">Get Started</span>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};

export default LandingHeader;
