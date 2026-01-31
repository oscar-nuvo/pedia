import { Link } from "react-router-dom";
import { useState, useEffect } from "react";

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
          ? "bg-rezzy-black/95 backdrop-blur-sm border-b border-rezzy-gray-dark/50"
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
            {/* Logo mark - a simple but distinctive shape */}
            <div className="relative w-8 h-8">
              <div className="absolute inset-0 bg-rezzy-green" />
              <div className="absolute top-1 left-1 w-3 h-3 bg-rezzy-black" />
            </div>
            <span className="text-rezzy-white font-semibold text-xl tracking-tight group-hover:text-rezzy-green transition-colors duration-300">
              REZZY
            </span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <a
              href="#features"
              className="text-rezzy-gray-light hover:text-rezzy-white text-sm font-medium transition-colors duration-300"
            >
              Features
            </a>
            <a
              href="#how-it-works"
              className="text-rezzy-gray-light hover:text-rezzy-white text-sm font-medium transition-colors duration-300"
            >
              How it works
            </a>
          </nav>

          {/* CTA */}
          <div className="flex items-center gap-4">
            <Link
              to="/auth"
              className="hidden md:inline text-rezzy-gray-light hover:text-rezzy-white text-sm font-medium transition-colors duration-300"
            >
              Log in
            </Link>
            <Link
              to="/auth"
              className="relative group bg-rezzy-green text-rezzy-black text-sm font-semibold px-5 py-2.5 transition-all duration-300 hover:bg-rezzy-white"
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
