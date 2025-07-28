import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Users, Clock, Plus, Filter } from "lucide-react";

const Scheduling = () => {
  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="bg-white border-b border-neutral-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-neutral-900">Smart Scheduling & Patient Management</h1>
            <p className="text-neutral-600 mt-1">Manage appointments and patient relationships with AI-powered insights</p>
          </div>
          <Button className="bg-primary text-white">
            <Plus className="w-4 h-4 mr-2" />
            New Appointment
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Key Features Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <Calendar className="w-5 h-5 mr-2 text-primary" />
                Family-Linked Scheduling
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-neutral-600 mb-4">Automatically suggests sibling appointments and coordinates family availability</p>
              <Button variant="outline" size="sm">Configure</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <Users className="w-5 h-5 mr-2 text-secondary-orange" />
                Patient Demographics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-neutral-600 mb-4">Visual family trees and relationship management with HIPAA compliance</p>
              <Button variant="outline" size="sm">View Families</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <Clock className="w-5 h-5 mr-2 text-success" />
                Smart Availability
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-neutral-600 mb-4">AI-powered suggestions for optimal appointment timing based on patient needs</p>
              <Button variant="outline" size="sm">Optimize</Button>
            </CardContent>
          </Card>
        </div>

        {/* Calendar View Placeholder */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Weekly Calendar View</CardTitle>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm">
                  <Filter className="w-4 h-4 mr-2" />
                  Filter
                </Button>
                <Button variant="outline" size="sm">Today</Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-96 bg-neutral-100 rounded-xl flex items-center justify-center">
              <div className="text-center">
                <Calendar className="w-16 h-16 text-neutral-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-neutral-600">Interactive Calendar Coming Soon</h3>
                <p className="text-neutral-500">Drag-and-drop scheduling with pediatric-specific enhancements</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Scheduling;