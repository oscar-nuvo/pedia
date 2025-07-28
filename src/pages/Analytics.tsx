import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart3, TrendingUp, Users, Activity, Target, Award } from "lucide-react";

const Analytics = () => {
  const kpiMetrics = [
    { title: "Patient Growth", value: "+12%", subtext: "New patients this month", icon: Users, color: "text-success" },
    { title: "Revenue Increase", value: "+18%", subtext: "Compared to last quarter", icon: TrendingUp, color: "text-primary" },
    { title: "Efficiency Gain", value: "2.5hrs", subtext: "Time saved per provider daily", icon: Activity, color: "text-secondary-orange" },
    { title: "Quality Score", value: "96%", subtext: "Well-visit compliance rate", icon: Award, color: "text-secondary-purple" }
  ];

  const populationInsights = [
    { metric: "Well-Visit Compliance", rate: "96%", trend: "+3%", status: "excellent" },
    { metric: "Vaccination Coverage", rate: "89%", trend: "+5%", status: "good" },
    { metric: "Screening Completion", rate: "82%", trend: "+2%", status: "good" },
    { metric: "Follow-up Adherence", rate: "74%", trend: "-1%", status: "needs-attention" }
  ];

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="bg-white border-b border-neutral-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-neutral-900">Analytics & Insights Dashboard</h1>
            <p className="text-neutral-600 mt-1">Practice performance and population health analytics</p>
          </div>
          <Button className="bg-primary text-white">
            <Target className="w-4 h-4 mr-2" />
            Generate Report
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Key Performance Indicators */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {kpiMetrics.map((metric, index) => (
            <Card key={index}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-neutral-900">{metric.value}</p>
                    <p className="text-sm font-medium text-neutral-700">{metric.title}</p>
                    <p className="text-xs text-neutral-500">{metric.subtext}</p>
                  </div>
                  <metric.icon className={`w-8 h-8 ${metric.color}`} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Practice Performance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="w-5 h-5 mr-2 text-primary" />
                Practice Performance Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold text-neutral-800 mb-3">Patient Acquisition & Retention</h4>
                  <div className="h-32 bg-neutral-100 rounded-xl flex items-center justify-center">
                    <p className="text-neutral-500">Patient growth chart visualization</p>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold text-neutral-800 mb-3">Revenue Optimization</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <p className="text-xl font-bold text-primary">$287K</p>
                      <p className="text-sm text-neutral-500">Monthly Revenue</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xl font-bold text-success">94%</p>
                      <p className="text-sm text-neutral-500">Collection Rate</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-neutral-800 mb-3">Operational Efficiency</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-neutral-600">No-show rate</span>
                      <span className="text-sm font-medium text-success">3.2%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-neutral-600">Appointment utilization</span>
                      <span className="text-sm font-medium text-primary">96.8%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-neutral-600">Average wait time</span>
                      <span className="text-sm font-medium text-secondary-orange">8 min</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Population Health */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Activity className="w-5 h-5 mr-2 text-success" />
                Population Health Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold text-neutral-800 mb-3">Quality Metrics</h4>
                  <div className="space-y-3">
                    {populationInsights.map((insight, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-neutral-50 rounded-xl">
                        <div>
                          <p className="font-medium text-neutral-800">{insight.metric}</p>
                          <p className="text-sm text-neutral-500">Current rate: {insight.rate}</p>
                        </div>
                        <div className="text-right">
                          <span className={`text-sm font-medium ${
                            insight.status === 'excellent' ? 'text-success' :
                            insight.status === 'good' ? 'text-primary' :
                            'text-warning'
                          }`}>
                            {insight.trend}
                          </span>
                          <div className={`w-3 h-3 rounded-full mt-1 ml-auto ${
                            insight.status === 'excellent' ? 'bg-success' :
                            insight.status === 'good' ? 'bg-primary' :
                            'bg-warning'
                          }`}></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-neutral-800 mb-3">Risk Population Identification</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center p-2 bg-warning/10 rounded-lg">
                      <span className="text-sm text-neutral-700">Overdue screenings</span>
                      <span className="text-sm font-medium text-warning">23 patients</span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-error/10 rounded-lg">
                      <span className="text-sm text-neutral-700">Missed vaccines</span>
                      <span className="text-sm font-medium text-error">8 patients</span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-primary/10 rounded-lg">
                      <span className="text-sm text-neutral-700">Growth concerns</span>
                      <span className="text-sm font-medium text-primary">5 patients</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-neutral-800 mb-3">Community Health Trends</h4>
                  <div className="h-24 bg-neutral-100 rounded-xl flex items-center justify-center">
                    <p className="text-neutral-500">Local disease pattern visualization</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Comparative Benchmarking */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Peer Comparison & Benchmarking</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="h-20 bg-success/10 rounded-xl flex items-center justify-center mb-3">
                  <Award className="w-8 h-8 text-success" />
                </div>
                <p className="font-semibold text-neutral-800">Quality Metrics</p>
                <p className="text-2xl font-bold text-success">Top 15%</p>
                <p className="text-sm text-neutral-500">Among similar practices</p>
              </div>
              
              <div className="text-center">
                <div className="h-20 bg-primary/10 rounded-xl flex items-center justify-center mb-3">
                  <TrendingUp className="w-8 h-8 text-primary" />
                </div>
                <p className="font-semibold text-neutral-800">Efficiency Score</p>
                <p className="text-2xl font-bold text-primary">92/100</p>
                <p className="text-sm text-neutral-500">Above average</p>
              </div>
              
              <div className="text-center">
                <div className="h-20 bg-secondary-orange/10 rounded-xl flex items-center justify-center mb-3">
                  <Users className="w-8 h-8 text-secondary-orange" />
                </div>
                <p className="font-semibold text-neutral-800">Patient Satisfaction</p>
                <p className="text-2xl font-bold text-secondary-orange">4.8/5</p>
                <p className="text-sm text-neutral-500">Excellent rating</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Analytics;