import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Mic, Clipboard, Brain, Stethoscope } from "lucide-react";

const Documentation = () => {
  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="bg-white border-b border-neutral-200 px-6 py-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-neutral-900">AI-Powered Clinical Documentation</h1>
          <p className="text-neutral-600 mt-1">Streamline documentation with intelligent templates and ambient AI</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Documentation Modules */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <Brain className="w-5 h-5 mr-2 text-primary" />
                Pre-Visit Patient Preparation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-neutral-600 mb-4">AI-generated patient briefings with growth trends, care gaps, and visit objectives</p>
              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm text-neutral-600">
                  <div className="w-2 h-2 bg-success rounded-full mr-2"></div>
                  Last visit recap and growth trends
                </div>
                <div className="flex items-center text-sm text-neutral-600">
                  <div className="w-2 h-2 bg-primary rounded-full mr-2"></div>
                  Red flag alerts and care gaps
                </div>
                <div className="flex items-center text-sm text-neutral-600">
                  <div className="w-2 h-2 bg-secondary-orange rounded-full mr-2"></div>
                  Visit objective predictions
                </div>
              </div>
              <Button variant="outline" size="sm">View Patient Briefs</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <Clipboard className="w-5 h-5 mr-2 text-secondary-orange" />
                Template-Driven Documentation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-neutral-600 mb-4">Smart templates that adapt based on visit type and patient characteristics</p>
              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm text-neutral-600">
                  <div className="w-2 h-2 bg-primary rounded-full mr-2"></div>
                  Dynamic AAP templates by age
                </div>
                <div className="flex items-center text-sm text-neutral-600">
                  <div className="w-2 h-2 bg-success rounded-full mr-2"></div>
                  Smart field population
                </div>
                <div className="flex items-center text-sm text-neutral-600">
                  <div className="w-2 h-2 bg-secondary-purple rounded-full mr-2"></div>
                  Guided workflows
                </div>
              </div>
              <Button variant="outline" size="sm">Manage Templates</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <Mic className="w-5 h-5 mr-2 text-secondary-purple" />
                Ambient AI Documentation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-neutral-600 mb-4">Real-time conversation capture and SOAP note generation</p>
              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm text-neutral-600">
                  <div className="w-2 h-2 bg-success rounded-full mr-2"></div>
                  Live transcription with speaker ID
                </div>
                <div className="flex items-center text-sm text-neutral-600">
                  <div className="w-2 h-2 bg-primary rounded-full mr-2"></div>
                  Automatic SOAP structuring
                </div>
                <div className="flex items-center text-sm text-neutral-600">
                  <div className="w-2 h-2 bg-warning rounded-full mr-2"></div>
                  Privacy-first processing
                </div>
              </div>
              <Button variant="outline" size="sm">Start Recording</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <Stethoscope className="w-5 h-5 mr-2 text-success" />
                Automated Follow-Up
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-neutral-600 mb-4">Intelligent care plan generation and next steps automation</p>
              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm text-neutral-600">
                  <div className="w-2 h-2 bg-primary rounded-full mr-2"></div>
                  AAP-guided care plans
                </div>
                <div className="flex items-center text-sm text-neutral-600">
                  <div className="w-2 h-2 bg-success rounded-full mr-2"></div>
                  Smart appointment scheduling
                </div>
                <div className="flex items-center text-sm text-neutral-600">
                  <div className="w-2 h-2 bg-secondary-orange rounded-full mr-2"></div>
                  Parent communication
                </div>
              </div>
              <Button variant="outline" size="sm">Review Care Plans</Button>
            </CardContent>
          </Card>
        </div>

        {/* Recent Documentation Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Documentation Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-xl">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <FileText className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-neutral-800">Emma Martinez - 6mo Well Visit</p>
                    <p className="text-sm text-neutral-500">SOAP note generated via ambient AI</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-success">Complete</p>
                  <p className="text-xs text-neutral-500">2 minutes ago</p>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-xl">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-secondary-orange/10 rounded-full flex items-center justify-center">
                    <Clipboard className="w-5 h-5 text-secondary-orange" />
                  </div>
                  <div>
                    <p className="font-medium text-neutral-800">Jake Thompson - Sick Visit</p>
                    <p className="text-sm text-neutral-500">Template-based documentation</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-warning">In Progress</p>
                  <p className="text-xs text-neutral-500">15 minutes ago</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Documentation;