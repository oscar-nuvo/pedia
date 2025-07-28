import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Smartphone, Calendar, MessageSquare, FileText, Shield, Bot } from "lucide-react";

const ParentPortal = () => {
  const portalFeatures = [
    {
      title: "Family Dashboard",
      description: "Overview of all children's health status and upcoming care needs",
      icon: Smartphone,
      color: "bg-primary/10 text-primary"
    },
    {
      title: "Appointment Scheduling",
      description: "Self-service booking with real-time availability",
      icon: Calendar,
      color: "bg-success/10 text-success"
    },
    {
      title: "Secure Messaging",
      description: "Direct communication with care team",
      icon: MessageSquare,
      color: "bg-secondary-orange/10 text-secondary-orange"
    },
    {
      title: "Document Access",
      description: "Vaccination records, growth charts, and visit notes",
      icon: FileText,
      color: "bg-secondary-purple/10 text-secondary-purple"
    }
  ];

  const recentInteractions = [
    { action: "Appointment scheduled", family: "Martinez Family", time: "2 hours ago", type: "booking" },
    { action: "Message sent", family: "Thompson Family", time: "4 hours ago", type: "communication" },
    { action: "Document accessed", family: "Chen Family", time: "6 hours ago", type: "records" },
    { action: "AI query answered", family: "Davis Family", time: "8 hours ago", type: "ai" }
  ];

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="bg-white border-b border-neutral-200 px-6 py-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-neutral-900">Parent Portal & Communication</h1>
          <p className="text-neutral-600 mt-1">Secure, intuitive platform for parent-practice communication</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Portal Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {portalFeatures.map((feature, index) => (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className={`w-12 h-12 rounded-xl ${feature.color} flex items-center justify-center mb-4`}>
                  <feature.icon className="w-6 h-6" />
                </div>
                <h3 className="font-semibold text-neutral-800 mb-2">{feature.title}</h3>
                <p className="text-sm text-neutral-600">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Portal Analytics */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Portal Usage Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-primary">847</p>
                    <p className="text-sm text-neutral-500">Active Families</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-success">92%</p>
                    <p className="text-sm text-neutral-500">Login Rate</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-secondary-orange">156</p>
                    <p className="text-sm text-neutral-500">Messages Today</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-secondary-purple">43</p>
                    <p className="text-sm text-neutral-500">Appointments Booked</p>
                  </div>
                </div>
                
                <div className="h-64 bg-neutral-100 rounded-xl flex items-center justify-center">
                  <div className="text-center">
                    <Smartphone className="w-16 h-16 text-neutral-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-neutral-600">Mobile App Interface</h3>
                    <p className="text-neutral-500">Apple Health-inspired design with banking-level security</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Security & AI Features */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <Shield className="w-5 h-5 mr-2 text-success" />
                  Security Features
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-success rounded-full"></div>
                    <span className="text-sm text-neutral-600">End-to-end encryption</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-success rounded-full"></div>
                    <span className="text-sm text-neutral-600">Multi-factor authentication</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-success rounded-full"></div>
                    <span className="text-sm text-neutral-600">HIPAA compliance</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-success rounded-full"></div>
                    <span className="text-sm text-neutral-600">Biometric login</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <Bot className="w-5 h-5 mr-2 text-primary" />
                  AI Assistant Integration
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-neutral-600 mb-4">Parents can interact with AI for:</p>
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-neutral-600">
                    <div className="w-2 h-2 bg-primary rounded-full mr-2"></div>
                    Health questions & guidance
                  </div>
                  <div className="flex items-center text-sm text-neutral-600">
                    <div className="w-2 h-2 bg-success rounded-full mr-2"></div>
                    Appointment scheduling
                  </div>
                  <div className="flex items-center text-sm text-neutral-600">
                    <div className="w-2 h-2 bg-secondary-orange rounded-full mr-2"></div>
                    Billing inquiries
                  </div>
                  <div className="flex items-center text-sm text-neutral-600">
                    <div className="w-2 h-2 bg-secondary-purple rounded-full mr-2"></div>
                    Document requests
                  </div>
                </div>
                <Button variant="outline" size="sm" className="w-full">
                  Configure AI Features
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Recent Interactions */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Recent Portal Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentInteractions.map((interaction, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-neutral-50 rounded-xl">
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      interaction.type === 'booking' ? 'bg-primary/10' :
                      interaction.type === 'communication' ? 'bg-success/10' :
                      interaction.type === 'records' ? 'bg-secondary-orange/10' :
                      'bg-secondary-purple/10'
                    }`}>
                      {interaction.type === 'booking' && <Calendar className="w-4 h-4 text-primary" />}
                      {interaction.type === 'communication' && <MessageSquare className="w-4 h-4 text-success" />}
                      {interaction.type === 'records' && <FileText className="w-4 h-4 text-secondary-orange" />}
                      {interaction.type === 'ai' && <Bot className="w-4 h-4 text-secondary-purple" />}
                    </div>
                    <div>
                      <p className="font-medium text-neutral-800">{interaction.action}</p>
                      <p className="text-sm text-neutral-500">{interaction.family}</p>
                    </div>
                  </div>
                  <span className="text-sm text-neutral-500">{interaction.time}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ParentPortal;