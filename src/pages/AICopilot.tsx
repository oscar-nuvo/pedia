import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bot, MessageSquare, Lightbulb, Search, Brain, Stethoscope } from "lucide-react";

const AICopilot = () => {
  const recentQueries = [
    { query: "Amoxicillin dose for 15kg child with otitis media", response: "375mg twice daily", confidence: "98%" },
    { query: "Normal heart rate range for 3-year-old", response: "80-120 bpm at rest", confidence: "95%" },
    { query: "When to refer for growth concerns", response: "Height <3rd percentile or crossing 2+ lines", confidence: "92%" }
  ];

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="bg-white border-b border-neutral-200 px-6 py-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-neutral-900">Pediatric AI Co-Pilot</h1>
          <p className="text-neutral-600 mt-1">Your intelligent assistant for clinical decision support and medical queries</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* AI Chat Interface */}
          <div className="lg:col-span-2">
            <Card className="h-[600px] flex flex-col">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Bot className="w-5 h-5 mr-2 text-primary" />
                  AI Assistant
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                <div className="flex-1 bg-neutral-50 rounded-xl p-4 mb-4 overflow-y-auto">
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                        <Bot className="w-4 h-4 text-white" />
                      </div>
                      <div className="bg-white p-3 rounded-xl max-w-md">
                        <p className="text-neutral-800">Hello Dr. Chen! I'm here to help with clinical questions, drug dosing, guidelines, and patient-specific insights. What can I assist you with today?</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <input 
                    type="text" 
                    placeholder="Ask about dosing, guidelines, patient care..."
                    className="flex-1 px-4 py-2 border border-neutral-300 rounded-full focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <Button size="sm" className="rounded-full">
                    <MessageSquare className="w-4 h-4" />
                  </Button>
                </div>
                
                <div className="flex flex-wrap gap-2 mt-3">
                  <Button variant="outline" size="sm" className="text-xs">
                    Dosing Calculator
                  </Button>
                  <Button variant="outline" size="sm" className="text-xs">
                    Growth Charts
                  </Button>
                  <Button variant="outline" size="sm" className="text-xs">
                    AAP Guidelines
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Features */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Features</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button variant="outline" className="w-full justify-start">
                    <Brain className="w-4 h-4 mr-2" />
                    Clinical Decision Support
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Search className="w-4 h-4 mr-2" />
                    Drug Interaction Checker
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Stethoscope className="w-4 h-4 mr-2" />
                    Differential Diagnosis
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Lightbulb className="w-4 h-4 mr-2" />
                    Screening Reminders
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Recent Queries */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Recent Queries</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentQueries.map((item, index) => (
                    <div key={index} className="p-3 bg-neutral-50 rounded-xl">
                      <p className="text-sm font-medium text-neutral-800 mb-1">{item.query}</p>
                      <p className="text-sm text-primary mb-2">{item.response}</p>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-success">Confidence: {item.confidence}</span>
                        <Button variant="ghost" size="sm" className="text-xs">
                          View Details
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AICopilot;