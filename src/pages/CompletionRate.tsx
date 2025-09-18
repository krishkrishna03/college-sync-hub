import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, Users, TrendingUp, Award, Target } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { coursesAPI } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface CourseCompletion {
  id: string;
  courseName: string;
  totalEnrolled: number;
  assignmentsCompleted: number;
  studentsCertified: number;
  completionRate: number;
  certificationRate: number;
}

export default function CompletionRate() {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [overallStats, setOverallStats] = useState({
    totalEnrolled: 1000,
    assignmentsCompleted: 798,
    overallCompletion: 79.8,
    studentsCertified: 679
  });
  const [courseCompletions, setCourseCompletions] = useState<CourseCompletion[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch completion data on component mount
  useEffect(() => {
    fetchCompletionData();
  }, []);

  const fetchCompletionData = async () => {
    try {
      setLoading(true);
      const response = await coursesAPI.getCompletionRate();
      setOverallStats(response.overallStats);
      setCourseCompletions(response.courseCompletions);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to fetch completion data: " + error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getCompletionBadge = (rate: number) => {
    if (rate >= 85) return { label: "Excellent", variant: "default" as const, icon: "↗️", color: "bg-blue-100 text-blue-700 border-blue-200" };
    if (rate >= 75) return { label: "Good", variant: "secondary" as const, icon: "↗️", color: "bg-purple-100 text-purple-700 border-purple-200" };
    if (rate >= 65) return { label: "Average", variant: "outline" as const, icon: "→", color: "bg-yellow-100 text-yellow-700 border-yellow-200" };
    return { label: "Needs Improvement", variant: "destructive" as const, icon: "↘️", color: "bg-red-100 text-red-700 border-red-200" };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50 p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading completion data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50 p-6">
      {/* Header Section */}
      <div className="flex items-center gap-4 mb-8">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => navigate('/courses')}
          className="bg-white shadow-sm hover:shadow-md transition-shadow"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>
        <div className="text-center flex-1">
          <h1 className="text-4xl font-bold text-foreground">Course Completion Rate</h1>
        </div>
      </div>

      {/* Overall Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="bg-white shadow-lg border-0 hover:shadow-xl transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Students</CardTitle>
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{overallStats.totalEnrolled}</div>
            <p className="text-xs text-gray-500 mt-1">Students across all courses</p>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-lg border-0 hover:shadow-xl transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Assignments Completed</CardTitle>
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{overallStats.assignmentsCompleted}</div>
            <p className="text-xs text-gray-500 mt-1">Total assignments submitted</p>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-lg border-0 hover:shadow-xl transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Overall Completion</CardTitle>
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
              <Target className="w-5 h-5 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{overallStats.overallCompletion}%</div>
            <Progress 
              value={overallStats.overallCompletion} 
              className="mt-3 h-2 bg-gray-200" 
            />
          </CardContent>
        </Card>

        <Card className="bg-white shadow-lg border-0 hover:shadow-xl transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Certified Students</CardTitle>
            <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
              <Award className="w-5 h-5 text-yellow-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{overallStats.studentsCertified}</div>
            <p className="text-xs text-gray-500 mt-1">Successfully certified</p>
          </CardContent>
        </Card>
      </div>

      {/* Course-wise Statistics Table */}
      <Card className="bg-white shadow-lg border-0">
        <CardHeader className="pb-4">
          <CardTitle className="text-2xl font-bold text-gray-900">Course-wise Completion Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-gray-50 border-b border-gray-200">
                  <TableHead className="font-semibold text-gray-700">S.No</TableHead>
                  <TableHead className="font-semibold text-gray-700">Course Name</TableHead>
                  <TableHead className="font-semibold text-gray-700">Total Enrolled</TableHead>
                  <TableHead className="font-semibold text-gray-700">Assignments Completed</TableHead>
                  <TableHead className="font-semibold text-gray-700">Students Certified</TableHead>
                  <TableHead className="font-semibold text-gray-700">Completion Rate</TableHead>
                  <TableHead className="font-semibold text-gray-700">Certification Rate</TableHead>
                  <TableHead className="font-semibold text-gray-700">Performance</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {courseCompletions.map((course, index) => {
                  const completionBadge = getCompletionBadge(course.completionRate);
                  
                  return (
                    <TableRow key={course.id} className="hover:bg-gray-50 transition-colors">
                      <TableCell className="text-gray-600">{index + 1}</TableCell>
                      <TableCell className="font-bold text-gray-900">{course.courseName}</TableCell>
                      <TableCell className="text-gray-600">{course.totalEnrolled}</TableCell>
                      <TableCell className="text-gray-600">
                        <div>
                          <span className="font-medium">{course.assignmentsCompleted}</span>
                          <span className="text-sm text-gray-500 ml-1">({course.completionRate}%)</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-600">
                        <div>
                          <span className="font-medium">{course.studentsCertified}</span>
                          <span className="text-sm text-gray-500 ml-1">({course.certificationRate}%)</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-2">
                          <div className="text-sm font-bold text-gray-900">{course.completionRate}%</div>
                          <Progress 
                            value={course.completionRate} 
                            className="h-2 bg-gray-200"
                          />
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-2">
                          <div className="text-sm font-bold text-gray-900">{course.certificationRate}%</div>
                          <Progress 
                            value={course.certificationRate} 
                            className="h-2 bg-gray-200"
                          />
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={completionBadge.variant}
                          className={`px-3 py-1 text-xs font-medium rounded-full ${completionBadge.color}`}
                        >
                          {completionBadge.icon} {completionBadge.label}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}