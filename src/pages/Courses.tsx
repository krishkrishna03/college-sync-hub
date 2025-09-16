import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Users, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Courses() {
  const navigate = useNavigate();

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Course Management</h1>
        <p className="text-muted-foreground">Manage courses and track student progress</p>
      </div>

      {/* Course Management Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/available-courses')}>
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-xl">Available Courses</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-3xl font-bold text-primary mb-2">24</p>
            <p className="text-muted-foreground">Course Categories</p>
            <Button className="mt-4 w-full" onClick={() => navigate('/available-courses')}>
              View Courses
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/enrolled-students')}>
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-success" />
            </div>
            <CardTitle className="text-xl">Enrolled Students</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-3xl font-bold text-success mb-2">1,248</p>
            <p className="text-muted-foreground">Active Enrollments</p>
            <Button className="mt-4 w-full" onClick={() => navigate('/enrolled-students')}>
              View Students
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/completion-rate')}>
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-warning/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="w-8 h-8 text-warning" />
            </div>
            <CardTitle className="text-xl">Completion Rate</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-3xl font-bold text-warning mb-2">87%</p>
            <p className="text-muted-foreground">Overall Progress</p>
            <Button className="mt-4 w-full" onClick={() => navigate('/completion-rate')}>
              View Reports
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}