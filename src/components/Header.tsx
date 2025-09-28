import { Button } from "@/components/ui/button";
import { Heart, Menu } from "lucide-react";
import { Link } from "react-router-dom";

const Header = () => {
  return (
    <header className="bg-white/95 backdrop-blur-md border-b border-neutral-200 sticky top-0 z-50">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center">
              <Heart className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-black">PediatricAI</span>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <a href="/overview" className="text-neutral-600 hover:text-primary transition-colors font-medium">
              Overview
            </a>
            <a href="/scheduling" className="text-neutral-600 hover:text-primary transition-colors font-medium">
              Scheduling
            </a>
            <a href="/documentation" className="text-neutral-600 hover:text-primary transition-colors font-medium">
              Documentation
            </a>
            <a href="/ai-copilot" className="text-neutral-600 hover:text-primary transition-colors font-medium">
              AI Co-Pilot
            </a>
            <a href="/analytics" className="text-neutral-600 hover:text-primary transition-colors font-medium">
              Analytics
            </a>
          </nav>

          {/* CTA */}
          <div className="flex items-center space-x-4">
            <Link to="/auth">
              <Button variant="ghost" className="hidden md:inline-flex">
                Sign In
              </Button>
            </Link>
            <Link to="/auth">
              <Button variant="accent">
                Get Started
              </Button>
            </Link>
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;