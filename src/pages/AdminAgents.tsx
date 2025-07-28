import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Phone, MessageSquare, Mail, Users, Settings, Activity } from "lucide-react";

const AdminAgents = () => {
  const agentStats = [
    { title: "Calls Handled", value: "47", period: "Today", icon: Phone, color: "text-primary" },
    { title: "Messages Processed", value: "128", period: "Today", icon: MessageSquare, color: "text-success" },
    { title: "Appointments Scheduled", value: "23", period: "Today", icon: Users, color: "text-secondary-orange" },
    { title: "Follow-ups Sent", value: "85", period: "This week", icon: Mail, color: "text-secondary-purple" }
  ];

  const recentActivity = [
    { type: "call", message: "Scheduled appointment for Martinez family", time: "5 min ago", status: "completed" },
    { type: "sms", message: "Sent reminder to Thompson family", time: "12 min ago", status: "delivered" },
    { type: "email", message: "Processed billing inquiry for Chen family", time: "18 min ago", status: "completed" },
    { type: "call", message: "Escalated urgent concern to Dr. Smith", time: "25 min ago", status: "escalated" }
  ];

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="bg-white border-b border-neutral-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-neutral-900">AI Administrative Agents</h1>
            <p className="text-neutral-600 mt-1">Automated patient communications and workflow management</p>
          </div>
          <Button className="bg-primary text-white">
            <Settings className="w-4 h-4 mr-2" />
            Configure Agents
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {agentStats.map((stat, index) => (
            <Card key={index}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-neutral-900">{stat.value}</p>
                    <p className="text-sm text-neutral-500">{stat.title}</p>
                    <p className="text-xs text-neutral-400">{stat.period}</p>
                  </div>
                  <stat.icon className={`w-8 h-8 ${stat.color}`} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Agent Modules */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <Phone className="w-5 h-5 mr-2 text-primary" />
                  Multi-Modal AI Receptionist
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-neutral-600 mb-4">Handles routine communications across phone, SMS, and email channels</p>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-neutral-50 rounded-xl">
                    <div className="flex items-center space-x-3">
                      <Phone className="w-4 h-4 text-primary" />
                      <span className="text-sm font-medium">Voice Call Handling</span>
                    </div>
                    <span className="text-xs text-success bg-success/10 px-2 py-1 rounded-full">Active</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-neutral-50 rounded-xl">
                    <div className="flex items-center space-x-3">
                      <MessageSquare className="w-4 h-4 text-success" />
                      <span className="text-sm font-medium">SMS Management</span>
                    </div>
                    <span className="text-xs text-success bg-success/10 px-2 py-1 rounded-full">Active</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-neutral-50 rounded-xl">
                    <div className="flex items-center space-x-3">
                      <Mail className="w-4 h-4 text-secondary-orange" />
                      <span className="text-sm font-medium">Email Triage</span>
                    </div>
                    <span className="text-xs text-success bg-success/10 px-2 py-1 rounded-full">Active</span>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="w-full mt-4">
                  Configure Settings
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <Activity className="w-5 h-5 mr-2 text-secondary-purple" />
                  Automated Follow-Up Workflows
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-neutral-600 mb-4">Intelligent automation for care plan monitoring and follow-ups</p>
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-neutral-600">
                    <div className="w-2 h-2 bg-primary rounded-full mr-2"></div>
                    Care plan monitoring
                  </div>
                  <div className="flex items-center text-sm text-neutral-600">
                    <div className="w-2 h-2 bg-success rounded-full mr-2"></div>
                    Medication adherence check-ins
                  </div>
                  <div className="flex items-center text-sm text-neutral-600">
                    <div className="w-2 h-2 bg-secondary-orange rounded-full mr-2"></div>
                    Appointment reminder campaigns
                  </div>
                  <div className="flex items-center text-sm text-neutral-600">
                    <div className="w-2 h-2 bg-secondary-purple rounded-full mr-2"></div>
                    Health education delivery
                  </div>
                </div>
                <Button variant="outline" size="sm" className="w-full">
                  Manage Workflows
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Agent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 bg-neutral-50 rounded-xl">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      activity.type === 'call' ? 'bg-primary/10' :
                      activity.type === 'sms' ? 'bg-success/10' :
                      activity.type === 'email' ? 'bg-secondary-orange/10' : 'bg-neutral-200'
                    }`}>
                      {activity.type === 'call' && <Phone className="w-4 h-4 text-primary" />}
                      {activity.type === 'sms' && <MessageSquare className="w-4 h-4 text-success" />}
                      {activity.type === 'email' && <Mail className="w-4 h-4 text-secondary-orange" />}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-neutral-800">{activity.message}</p>
                      <p className="text-xs text-neutral-500">{activity.time}</p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      activity.status === 'completed' ? 'bg-success/10 text-success' :
                      activity.status === 'delivered' ? 'bg-primary/10 text-primary' :
                      activity.status === 'escalated' ? 'bg-warning/10 text-warning' :
                      'bg-neutral-200 text-neutral-600'
                    }`}>
                      {activity.status}
                    </span>
                  </div>
                ))}
              </div>
              <Button variant="outline" className="w-full mt-4">
                View All Activity
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminAgents;