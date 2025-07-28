import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Users, FileText, Bot, MessageSquare, BarChart3, Clock, AlertCircle } from "lucide-react";
import { Link } from "react-router-dom";

const Overview = () => {
  const todayStats = {
    totalAppointments: 12,
    urgentAddOns: 3,
    pendingTasks: 7,
    messagesPending: 5
  };

  const upcomingAppointments = [
    { time: "8:00 AM", patient: "Emma Martinez", type: "Well Visit", age: "6mo", status: "ready" },
    { time: "8:30 AM", patient: "Jake Thompson", type: "Sick Visit", age: "3yr", status: "urgent" },
    { time: "9:00 AM", patient: "Sofia Chen", type: "Follow-up", age: "8yr", status: "ready" },
    { time: "9:30 AM", patient: "Michael Davis", type: "Well Visit", age: "2yr", status: "ready" }
  ];

  const quickActions = [
    { title: "Schedule Patient", icon: Calendar, color: "bg-primary", href: "/scheduling" },
    { title: "AI Co-Pilot", icon: Bot, color: "bg-secondary-purple", href: "/ai-copilot" },
    { title: "Documentation", icon: FileText, color: "bg-secondary-orange", href: "/documentation" },
    { title: "Analytics", icon: BarChart3, color: "bg-success", href: "/analytics" }
  ];

  const pendingTasks = [
    { task: "Review lab results for Maria Santos", urgency: "high", time: "2 hours ago" },
    { task: "Complete prior auth for Jake's referral", urgency: "medium", time: "4 hours ago" },
    { task: "Follow up on Emma's vaccine reaction", urgency: "low", time: "1 day ago" }
  ];

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <div className="bg-white border-b border-neutral-200 px-6 py-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-neutral-900">Good morning, Dr. Chen</h1>
          <p className="text-neutral-600 mt-1">Ready to start your day? Here's what's ahead.</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Today's Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-neutral-900">{todayStats.totalAppointments}</p>
                  <p className="text-sm text-neutral-500">Today's Appointments</p>
                </div>
                <Calendar className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-secondary-orange">{todayStats.urgentAddOns}</p>
                  <p className="text-sm text-neutral-500">Urgent Add-ons</p>
                </div>
                <AlertCircle className="w-8 h-8 text-secondary-orange" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-warning">{todayStats.pendingTasks}</p>
                  <p className="text-sm text-neutral-500">Pending Tasks</p>
                </div>
                <Clock className="w-8 h-8 text-warning" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-success">{todayStats.messagesPending}</p>
                  <p className="text-sm text-neutral-500">Messages</p>
                </div>
                <MessageSquare className="w-8 h-8 text-success" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Today's Schedule */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-neutral-800">Today's Schedule</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {upcomingAppointments.map((appointment, index) => (
                    <div key={index} className="flex items-center justify-between p-3 rounded-xl bg-neutral-50">
                      <div className="flex items-center space-x-4">
                        <div className="text-sm font-medium text-neutral-600 w-16">
                          {appointment.time}
                        </div>
                        <div>
                          <p className="font-medium text-neutral-800">{appointment.patient}</p>
                          <p className="text-sm text-neutral-500">{appointment.type} • {appointment.age}</p>
                        </div>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                        appointment.status === 'urgent' 
                          ? 'bg-error/10 text-error' 
                          : 'bg-success/10 text-success'
                      }`}>
                        {appointment.status}
                      </div>
                    </div>
                  ))}
                </div>
                <Button className="w-full mt-4" variant="outline" asChild>
                  <Link to="/scheduling">View Full Schedule</Link>
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions & Tasks */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-neutral-800">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  {quickActions.map((action, index) => (
                    <Link key={index} to={action.href}>
                      <div className="flex flex-col items-center p-4 rounded-xl bg-neutral-50 hover:bg-neutral-100 transition-colors cursor-pointer">
                        <div className={`w-12 h-12 rounded-xl ${action.color} flex items-center justify-center mb-2`}>
                          <action.icon className="w-6 h-6 text-white" />
                        </div>
                        <p className="text-sm font-medium text-neutral-700 text-center">{action.title}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Pending Tasks */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-neutral-800">Pending Tasks</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {pendingTasks.map((task, index) => (
                    <div key={index} className="p-3 rounded-xl bg-neutral-50">
                      <p className="text-sm font-medium text-neutral-800 mb-1">{task.task}</p>
                      <div className="flex items-center justify-between">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          task.urgency === 'high' ? 'bg-error/10 text-error' :
                          task.urgency === 'medium' ? 'bg-warning/10 text-warning' :
                          'bg-neutral-200 text-neutral-600'
                        }`}>
                          {task.urgency}
                        </span>
                        <span className="text-xs text-neutral-500">{task.time}</span>
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

export default Overview;