import { useState } from "react";
import { Play, Mic, Calendar, FileText, MessageSquare, BarChart3 } from "lucide-react";

const demoFeatures = [
  {
    id: "ai-documentation",
    icon: Mic,
    title: "AI Documentation",
    description: "Watch ambient AI convert conversations into SOAP notes",
    preview: "Dr. Chen: 'Emma is meeting all her milestones...' → Auto-generates structured note"
  },
  {
    id: "smart-scheduling",
    icon: Calendar,
    title: "Family Scheduling",
    description: "See how siblings get automatically coordinated",
    preview: "Jake's appointment → AI suggests coordinating with sister Maria's checkup"
  },
  {
    id: "ai-copilot",
    icon: MessageSquare,
    title: "AI Co-Pilot",
    description: "Ask natural language questions about patient care",
    preview: "'Amoxicillin dose for 15kg child?' → '250mg twice daily (dosing calculator)'"
  },
  {
    id: "analytics",
    icon: BarChart3,
    title: "Practice Analytics",
    description: "Real-time insights into practice performance",
    preview: "No-show rate: 2.1% ↓ | Time saved: 147 min/day ↑"
  }
];

const InteractiveDemoSection = () => {
  const [activeDemo, setActiveDemo] = useState("ai-documentation");
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <section className="py-24 bg-neutral-50">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-black mb-4">
            See PediatricAI in Action
          </h2>
          <p className="text-xl text-neutral-600 max-w-3xl mx-auto">
            Experience the platform that's transforming pediatric practices
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Demo Controls */}
          <div className="space-y-4">
            {demoFeatures.map((feature) => {
              const Icon = feature.icon;
              const isActive = activeDemo === feature.id;
              
              return (
                <div
                  key={feature.id}
                  onClick={() => setActiveDemo(feature.id)}
                  className={`p-6 rounded-2xl cursor-pointer transition-all duration-300 ${
                    isActive 
                      ? 'bg-brand-yellow border-2 border-brand-yellow shadow-lg' 
                      : 'bg-white border-2 border-neutral-200 hover:border-neutral-300'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-xl ${
                      isActive ? 'bg-black' : 'bg-neutral-100'
                    }`}>
                      <Icon className={`w-6 h-6 ${
                        isActive ? 'text-white' : 'text-neutral-600'
                      }`} />
                    </div>
                    <div className="flex-1">
                      <h3 className={`text-lg font-semibold mb-2 ${
                        isActive ? 'text-black' : 'text-neutral-800'
                      }`}>
                        {feature.title}
                      </h3>
                      <p className={`text-sm mb-3 ${
                        isActive ? 'text-black' : 'text-neutral-600'
                      }`}>
                        {feature.description}
                      </p>
                      {isActive && (
                        <div className="bg-white/50 rounded-lg p-3 text-sm font-mono text-black">
                          {feature.preview}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Demo Video/Interactive Area */}
          <div className="bg-white rounded-3xl p-8 shadow-xl">
            <div className="aspect-video bg-neutral-900 rounded-2xl relative overflow-hidden">
              <img 
                src="/src/assets/hero-dashboard-mockup.jpg" 
                alt="PediatricAI Dashboard Demo"
                className="w-full h-full object-cover"
              />
              
              {/* Play Button Overlay */}
              <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                <button 
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="bg-brand-yellow hover:bg-brand-lime text-black w-16 h-16 rounded-full flex items-center justify-center transition-colors shadow-lg"
                >
                  <Play className="w-6 h-6 ml-1" />
                </button>
              </div>

              {/* Demo Feature Highlight */}
              <div className="absolute bottom-4 left-4 right-4">
                <div className="bg-white/95 backdrop-blur rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium text-black">
                      {demoFeatures.find(f => f.id === activeDemo)?.title} Demo
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              <h3 className="text-xl font-bold text-black">
                Interactive Demo Available
              </h3>
              <p className="text-neutral-600">
                Click the features on the left to see different aspects of PediatricAI in action.
              </p>
              <div className="flex gap-3">
                <button className="bg-black text-white px-6 py-3 rounded-full font-semibold hover:bg-neutral-800 transition-colors">
                  Schedule Live Demo
                </button>
                <button className="border border-neutral-300 text-neutral-700 px-6 py-3 rounded-full font-semibold hover:bg-neutral-50 transition-colors">
                  Try Interactive Demo
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default InteractiveDemoSection;