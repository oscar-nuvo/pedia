import { Heart } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-black text-white py-16">
      <div className="container mx-auto px-6">
        <div className="grid md:grid-cols-4 gap-8 mb-12">
          {/* Logo & Description */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-brand-yellow rounded-full flex items-center justify-center">
                <Heart className="w-5 h-5 text-black" />
              </div>
              <span className="text-xl font-bold">PediatricAI</span>
            </div>
            <p className="text-sm opacity-80 leading-relaxed">
              AI-first EHR built specifically for pediatric practices. 
              Reduce documentation time and focus on patient care.
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 className="font-semibold mb-4">Product</h4>
            <ul className="space-y-2 text-sm opacity-80">
              <li><a href="#" className="hover:opacity-100 transition-opacity">Features</a></li>
              <li><a href="#" className="hover:opacity-100 transition-opacity">Pricing</a></li>
              <li><a href="#" className="hover:opacity-100 transition-opacity">Integrations</a></li>
              <li><a href="#" className="hover:opacity-100 transition-opacity">Security</a></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-sm opacity-80">
              <li><a href="#" className="hover:opacity-100 transition-opacity">About</a></li>
              <li><a href="#" className="hover:opacity-100 transition-opacity">Careers</a></li>
              <li><a href="#" className="hover:opacity-100 transition-opacity">Contact</a></li>
              <li><a href="#" className="hover:opacity-100 transition-opacity">Blog</a></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-semibold mb-4">Support</h4>
            <ul className="space-y-2 text-sm opacity-80">
              <li><a href="#" className="hover:opacity-100 transition-opacity">Help Center</a></li>
              <li><a href="#" className="hover:opacity-100 transition-opacity">Documentation</a></li>
              <li><a href="#" className="hover:opacity-100 transition-opacity">Training</a></li>
              <li><a href="#" className="hover:opacity-100 transition-opacity">Status</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-neutral-800 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm opacity-60">
            © 2024 PediatricAI. All rights reserved.
          </p>
          <div className="flex space-x-6 text-sm opacity-60 mt-4 md:mt-0">
            <a href="#" className="hover:opacity-100 transition-opacity">Privacy Policy</a>
            <a href="#" className="hover:opacity-100 transition-opacity">Terms of Service</a>
            <a href="#" className="hover:opacity-100 transition-opacity">HIPAA Compliance</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;