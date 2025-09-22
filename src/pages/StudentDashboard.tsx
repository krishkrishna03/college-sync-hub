import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, ClipboardList, Award, TrendingUp, Play, Eye, Clock, Target, Calendar, User, CheckCircle, AlertCircle } from "lucide-react";
import { useProfile } from "@/contexts/ProfileContext";
import { studentsAPI, testsAPI, coursesAPI, announcementsAPI } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { StatCard } from "@/components/ui/stat-card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, BarChart, Bar } from "recharts";

interface StudentProfile {
  id: string;
  name: string;
  email: string;
  registrationNumber: string;
  batch: string;
  branch: string;
  section: string;
  year: string;
  enrollmentDate: string;
  academicStatus: string;
}

interface AssignedTest {
  id: string;
  title: string;
  category: string;
  subject: string;
  difficulty: string;
  duration: number;
  totalQuestions: number;
  cutoffMarks: number;
  scheduledDate?: string;
  status: "not-started" | "in-progress" | "completed";
  score?: number;
  accuracy?: number;
  timeTaken?: number;
}

interface EnrolledCourse {
  id: string;
  title: string;
  category: string;
  level: string;
  progress: number;
  status: "enrolled" | "completed" | "dropped";
  enrolledDate: string;
  instructor: string;
}

interface Announcement {
  id: string;
  title: string;
  content: string;
  priority: string;
  scheduledFor: string;
  isRead: boolean;
}

const performanceData = [
  { subject: "Technical", score: 85, attempts: 5 },
  { subject: "Logical", score: 92, attempts: 7 },
  { subject: "Verbal", score: 78, attempts: 4 },
  { subject: "Reasoning", score: 88, attempts: 6 },
  { subject: "Coding", score: 95, attempts: 3 }
];

const progressData = [
  { month: "Jan", score: 75, tests: 3 },
  { month: "Feb", score: 82, tests: 5 },
  { month: "Mar", score: 78, tests: 4 },
  { month: "Apr", score: 88, tests: 6 },
  { month: "May", score: 92, tests: 7 },
  { month: "Jun", score: 89, tests: 5 }
];

export default function StudentDashboard() {
  const { profileData } = useProfile();
  const { toast } = useToast();
  
  const [studentProfile, setStudentProfile] = useState<StudentProfile | null>(null);
  const [assignedTests, setAssignedTests] = useState<AssignedTest[]>([]);
  const [enrolledCourses, setEnrolledCourses] = useState<EnrolledCourse[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [stats, setStats] = useState({
    completedTests: 0,
    pendingTests: 0,
    enrolledCourses: 0,
    averageScore: 0
  });
  const [loading, setLoading] = useState(true);
  const [selectedTest, setSelectedTest] = useState<AssignedTest | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<EnrolledCourse | null>(null);

  useEffect(() => {
    fetchStudentData();
  }, []);

  const fetchStudentData = async () => {
    try {
      setLoading(true);
      
      // Get current user's student profile
      const currentUser = await authAPI.getCurrentUser();
      
      // Fetch student details
      const studentResponse = await studentsAPI.getAll({
        userId: currentUser.id
      });
      
      if (studentResponse.students && studentResponse.students.length > 0) {
        const student = studentResponse.students[0];
        setStudentProfile({
          id: student._id,
          name: student.userId.name,
          email: student.userId.email,
          registrationNumber: student.registrationNumber,
          batch: student.batch,
          branch: student.branch,
          section: student.section,
          year: student.year,
          enrollmentDate: student.enrollmentDate,
          academicStatus: student.academicStatus
        });

        // Fetch tests assigned to student's batch/branch/section
        const testsResponse = await testsAPI.getAll({
          batch: student.batch,
          branch: student.branch,
          section: student.section
        });

        const formattedTests = testsResponse.tests?.map((test: any) => ({
          id: test._id,
          title: test.title,
          category: test.category,
          subject: test.subject,
          difficulty: test.difficulty,
          duration: test.duration,
          totalQuestions: test.totalQuestions,
          cutoffMarks: test.cutoffMarks,
          scheduledDate: test.scheduledDate,
          status: getTestStatus(test, student._id),
          score: getTestScore(test, student._id),
          accuracy: getTestAccuracy(test, student._id),
          timeTaken: getTestTimeTaken(test, student._id)
        })) || [];

        setAssignedTests(formattedTests);

        // Fetch enrolled courses
        const coursesResponse = await coursesAPI.getAll({
          studentId: student._id
        });

        const formattedCourses = student.courses?.map((course: any) => ({
          id: course.courseId._id,
          title: course.courseId.title,
          category: course.courseId.category,
          level: course.courseId.level,
          progress: course.progress,
          status: course.status,
          enrolledDate: course.enrolledDate,
          instructor: course.courseId.instructor || 'TBD'
        })) || [];

        setEnrolledCourses(formattedCourses);

        // Fetch announcements for student
        const announcementsResponse = await announcementsAPI.getAll({
          targetAudience: 'students',
          batch: student.batch,
          branch: student.branch
        });

        const formattedAnnouncements = announcementsResponse.announcements?.map((ann: any) => ({
          id: ann._id,
          title: ann.title,
          content: ann.content,
          priority: ann.priority,
          scheduledFor: ann.scheduledFor,
          isRead: ann.readBy?.some((read: any) => read.userId === currentUser.id) || false
        })) || [];

        setAnnouncements(formattedAnnouncements);

        // Calculate stats
        const completedTests = formattedTests.filter(t => t.status === 'completed').length;
        const pendingTests = formattedTests.filter(t => t.status === 'not-started').length;
        const avgScore = formattedTests.filter(t => t.score).reduce((sum, t) => sum + (t.score || 0), 0) / 
                        Math.max(formattedTests.filter(t => t.score).length, 1);

        setStats({
          completedTests,
          pendingTests,
          enrolledCourses: formattedCourses.length,
          averageScore: Math.round(avgScore * 10) / 10
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to fetch student data: " + error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getTestStatus = (test: any, studentId: string) => {
    const result = test.results?.find((r: any) => r.studentId === studentId);
    return result?.status || 'not-started';
  };

  const getTestScore = (test: any, studentId: string) => {
    const result = test.results?.find((r: any) => r.studentId === studentId);
    return result?.score;
  };

  const getTestAccuracy = (test: any, studentId: string) => {
    const result = test.results?.find((r: any) => r.studentId === studentId);
    return result?.accuracy;
  };

  const getTestTimeTaken = (test: any, studentId: string) => {
    const result = test.results?.find((r: any) => r.studentId === studentId);
    return result?.timeTaken;
  };

  const handleStartTest = async (testId: string) => {
    try {
      // Navigate to test taking interface
      window.open(`/take-test/${testId}`, '_blank');
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to start test: " + error.message,
        variant: "destructive"
      });
    }
  };

  const handleViewTestDetails = (test: AssignedTest) => {
    setSelectedTest(test);
  };

  const handleViewCourseDetails = (course: EnrolledCourse) => {
    setSelectedCourse(course);
  };

  const handleMarkAnnouncementRead = async (announcementId: string) => {
    try {
      await announcementsAPI.markAsRead(announcementId);
      setAnnouncements(prev => prev.map(ann => 
        ann.id === announcementId ? { ...ann, isRead: true } : ann
      ));
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to mark announcement as read: " + error.message,
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!studentProfile) {
    return (
      <div className="p-6 space-y-6">
        <Card>
          <CardContent className="p-6 text-center">
            <User className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">Student Profile Not Found</h3>
            <p className="text-muted-foreground">Please contact your administrator to set up your student profile.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Student Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {studentProfile.name}! Track your academic progress and assignments.
        </p>
      </div>

      {/* Student Profile Card */}
      <Card className="bg-gradient-to-r from-primary/10 to-primary/5">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Registration ID</p>
              <p className="font-semibold">{studentProfile.registrationNumber}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Batch</p>
              <p className="font-semibold">{studentProfile.batch}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Branch</p>
              <p className="font-semibold">{studentProfile.branch}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Section</p>
              <p className="font-semibold">{studentProfile.section}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Assigned Exams"
          value={stats.completedTests.toString()}
          change="Total assigned"
          icon={ClipboardList}
          trend="neutral"
        />
        <StatCard
          title="Available to Take"
          value={stats.pendingTests.toString()}
          change="Ready to attempt"
          icon={Play}
          trend="neutral"
        />
        <StatCard
          title="Practice Completed"
          value={stats.completedTests.toString()}
          change="Successfully finished"
          icon={CheckCircle}
          trend="up"
        />
        <StatCard
          title="Average Score"
          value={`${stats.averageScore}%`}
          change="Overall performance"
          icon={TrendingUp}
          trend="up"
        />
      </div>

      <Tabs defaultValue="exams" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="exams">My Exams</TabsTrigger>
          <TabsTrigger value="practice">Practice Tests</TabsTrigger>
          <TabsTrigger value="courses">My Courses</TabsTrigger>
          <TabsTrigger value="progress">Progress</TabsTrigger>
          <TabsTrigger value="announcements">Announcements</TabsTrigger>
        </TabsList>

        {/* Exams Tab */}
        <TabsContent value="exams" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ClipboardList className="w-5 h-5" />
                Assigned Exams
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Exam Name</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Difficulty</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Questions</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {assignedTests.map((test) => (
                    <TableRow key={test.id} className="hover:bg-accent/50">
                      <TableCell className="font-medium">{test.title}</TableCell>
                      <TableCell>{test.subject}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{test.category}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={test.difficulty === "Easy" ? "secondary" : test.difficulty === "Medium" ? "default" : "destructive"}>
                          {test.difficulty}
                        </Badge>
                      </TableCell>
                      <TableCell>{test.duration} min</TableCell>
                      <TableCell>{test.totalQuestions}</TableCell>
                      <TableCell>
                        <Badge variant={
                          test.status === "completed" ? "default" : 
                          test.status === "in-progress" ? "secondary" : "outline"
                        }>
                          {test.status.replace("-", " ")}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {test.score ? `${test.score}%` : "-"}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {test.status === "not-started" && (
                            <Button
                              size="sm"
                              onClick={() => handleStartTest(test.id)}
                            >
                              <Play className="w-4 h-4 mr-1" />
                              Start
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewTestDetails(test)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Practice Tests Tab */}
        <TabsContent value="practice" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {["Technical", "Logical", "Reasoning", "Verbal", "Coding"].map((subject) => (
              <Card key={subject} className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <CardTitle className="text-lg">{subject} Practice</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span>Available Tests:</span>
                      <span className="font-medium">12</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Completed:</span>
                      <span className="font-medium">8</span>
                    </div>
                    <Progress value={67} className="h-2" />
                    <Button className="w-full" size="sm">
                      <Play className="w-4 h-4 mr-2" />
                      Start Practice
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Courses Tab */}
        <TabsContent value="courses" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                My Courses
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {enrolledCourses.map((course) => (
                  <Card key={course.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <Badge variant="outline">{course.category}</Badge>
                        <Badge variant={course.status === "completed" ? "default" : course.status === "enrolled" ? "secondary" : "destructive"}>
                          {course.status}
                        </Badge>
                      </div>
                      <CardTitle className="text-lg">{course.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Level:</span>
                        <span className="font-medium">{course.level}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Instructor:</span>
                        <span className="font-medium">{course.instructor}</span>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Progress:</span>
                          <span className="font-medium">{course.progress}%</span>
                        </div>
                        <Progress value={course.progress} className="h-2" />
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => handleViewCourseDetails(course)}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View Details
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Progress Tab */}
        <TabsContent value="progress" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="hover:shadow-elevated transition-all duration-300">
              <CardHeader>
                <CardTitle>Performance by Subject</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer config={{
                  score: { label: "Average Score", color: "#3b82f6" }
                }}>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={performanceData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="subject" />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="score" fill="#3b82f6" />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card className="hover:shadow-elevated transition-all duration-300">
              <CardHeader>
                <CardTitle>Score Progress Over Time</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer config={{
                  score: { label: "Average Score", color: "#10b981" }
                }}>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={progressData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Line type="monotone" dataKey="score" stroke="#10b981" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>

          {/* Upcoming Deadlines */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Upcoming Deadlines
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {assignedTests.filter(test => test.status === "not-started").slice(0, 3).map((test) => (
                  <div key={test.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-warning rounded-full"></div>
                      <div>
                        <p className="font-medium">{test.title}</p>
                        <p className="text-sm text-muted-foreground">{test.subject} • {test.duration} minutes</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">Due Soon</Badge>
                      <Button size="sm" onClick={() => handleStartTest(test.id)}>
                        <Play className="w-4 h-4 mr-1" />
                        Start
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Announcements Tab */}
        <TabsContent value="announcements" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Recent Announcements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {announcements.map((announcement) => (
                  <div 
                    key={announcement.id} 
                    className={`p-4 rounded-lg border transition-all duration-200 hover:shadow-card ${!announcement.isRead ? 'bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800' : 'bg-muted/30'}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold">{announcement.title}</h4>
                          {!announcement.isRead && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                          )}
                          <Badge variant={
                            announcement.priority === "urgent" ? "destructive" :
                            announcement.priority === "high" ? "default" :
                            announcement.priority === "medium" ? "secondary" : "outline"
                          } className="text-xs">
                            {announcement.priority}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{announcement.content}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(announcement.scheduledFor).toLocaleDateString()}
                        </p>
                      </div>
                      {!announcement.isRead && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleMarkAnnouncementRead(announcement.id)}
                          className="hover:bg-primary hover:text-primary-foreground"
                        >
                          Mark as Read
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Quick Actions */}
      <Card className="bg-gradient-to-r from-primary/10 to-primary/5">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button className="h-16 flex-col gap-2" variant="outline">
              <ClipboardList className="w-6 h-6" />
              <span>Take Practice Test</span>
            </Button>
            <Button className="h-16 flex-col gap-2" variant="outline">
              <BookOpen className="w-6 h-6" />
              <span>Browse Courses</span>
            </Button>
            <Button className="h-16 flex-col gap-2" variant="outline">
              <BarChart3 className="w-6 h-6" />
              <span>View Progress</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Old sections moved to tabs */}
      {/* Assigned Tests */}
      <div className="hidden">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ClipboardList className="w-5 h-5" />
              Assigned Tests
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Test Name</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Difficulty</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Questions</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {assignedTests.map((test) => (
                  <TableRow key={test.id}>
                    <TableCell className="font-medium">{test.title}</TableCell>
                    <TableCell>{test.subject}</TableCell>
                    <TableCell>
                      <Badge variant={test.difficulty === "Easy" ? "secondary" : test.difficulty === "Medium" ? "default" : "destructive"}>
                        {test.difficulty}
                      </Badge>
                    </TableCell>
                    <TableCell>{test.duration} min</TableCell>
                    <TableCell>{test.totalQuestions}</TableCell>
                    <TableCell>
                      <Badge variant={
                        test.status === "completed" ? "default" : 
                        test.status === "in-progress" ? "secondary" : "outline"
                      }>
                        {test.status.replace("-", " ")}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {test.score ? `${test.score}%` : "-"}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {test.status === "not-started" && (
                          <Button
                            size="sm"
                            onClick={() => handleStartTest(test.id)}
                          >
                            <Play className="w-4 h-4 mr-1" />
                            Start
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewTestDetails(test)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Enrolled Courses */}
      <div className="hidden">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              My Courses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {enrolledCourses.map((course) => (
                <Card key={course.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline">{course.category}</Badge>
                      <Badge variant={course.status === "completed" ? "default" : course.status === "enrolled" ? "secondary" : "destructive"}>
                        {course.status}
                      </Badge>
                    </div>
                    <CardTitle className="text-lg">{course.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Level:</span>
                      <span className="font-medium">{course.level}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Instructor:</span>
                      <span className="font-medium">{course.instructor}</span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Progress:</span>
                        <span className="font-medium">{course.progress}%</span>
                      </div>
                      <Progress value={course.progress} className="h-2" />
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => handleViewCourseDetails(course)}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View Details
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Announcements */}
      <div className="hidden">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              Recent Announcements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {announcements.slice(0, 5).map((announcement) => (
                <div 
                  key={announcement.id} 
                  className={`p-4 rounded-lg border ${!announcement.isRead ? 'bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800' : 'bg-muted/30'}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold">{announcement.title}</h4>
                        {!announcement.isRead && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        )}
                        <Badge variant={
                          announcement.priority === "urgent" ? "destructive" :
                          announcement.priority === "high" ? "default" :
                          announcement.priority === "medium" ? "secondary" : "outline"
                        } className="text-xs">
                          {announcement.priority}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{announcement.content}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(announcement.scheduledFor).toLocaleDateString()}
                      </p>
                    </div>
                    {!announcement.isRead && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleMarkAnnouncementRead(announcement.id)}
                      >
                        Mark as Read
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
          trend="neutral"
        />
        <StatCard
          title="Average Score"
          value={`${stats.averageScore}%`}
          change="Overall performance"
          icon={TrendingUp}
          trend="up"
        />
      </div>

      {/* Assigned Tests */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardList className="w-5 h-5" />
            Assigned Tests
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Test Name</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Difficulty</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Questions</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Score</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {assignedTests.map((test) => (
                <TableRow key={test.id}>
                  <TableCell className="font-medium">{test.title}</TableCell>
                  <TableCell>{test.subject}</TableCell>
                  <TableCell>
                    <Badge variant={test.difficulty === "Easy" ? "secondary" : test.difficulty === "Medium" ? "default" : "destructive"}>
                      {test.difficulty}
                    </Badge>
                  </TableCell>
                  <TableCell>{test.duration} min</TableCell>
                  <TableCell>{test.totalQuestions}</TableCell>
                  <TableCell>
                    <Badge variant={
                      test.status === "completed" ? "default" : 
                      test.status === "in-progress" ? "secondary" : "outline"
                    }>
                      {test.status.replace("-", " ")}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {test.score ? `${test.score}%` : "-"}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      {test.status === "not-started" && (
                        <Button
                          size="sm"
                          onClick={() => handleStartTest(test.id)}
                        >
                          <Play className="w-4 h-4 mr-1" />
                          Start
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewTestDetails(test)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>


      {/* Test Details Modal */}
      <Dialog open={!!selectedTest} onOpenChange={() => setSelectedTest(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Test Details</DialogTitle>
          </DialogHeader>
          {selectedTest && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Test Title</p>
                  <p className="font-semibold">{selectedTest.title}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Category</p>
                  <Badge variant="outline">{selectedTest.category}</Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Subject</p>
                  <p className="font-semibold">{selectedTest.subject}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Difficulty</p>
                  <Badge variant={selectedTest.difficulty === "Easy" ? "secondary" : selectedTest.difficulty === "Medium" ? "default" : "destructive"}>
                    {selectedTest.difficulty}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Duration</p>
                  <p className="font-semibold">{selectedTest.duration} minutes</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Questions</p>
                  <p className="font-semibold">{selectedTest.totalQuestions}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Cutoff Marks</p>
                  <p className="font-semibold">{selectedTest.cutoffMarks}%</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Status</p>
                  <Badge variant={
                    selectedTest.status === "completed" ? "default" : 
                    selectedTest.status === "in-progress" ? "secondary" : "outline"
                  }>
                    {selectedTest.status.replace("-", " ")}
                  </Badge>
                </div>
              </div>
              
              {selectedTest.status === "completed" && (
                <div className="grid grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Score</p>
                    <p className="text-2xl font-bold text-primary">{selectedTest.score}%</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Accuracy</p>
                    <p className="text-2xl font-bold text-success">{selectedTest.accuracy}%</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Time Taken</p>
                    <p className="text-2xl font-bold text-warning">{selectedTest.timeTaken}m</p>
                  </div>
                </div>
              )}

              {selectedTest.status === "not-started" && (
                <div className="flex justify-center pt-4">
                  <Button onClick={() => handleStartTest(selectedTest.id)}>
                    <Play className="w-4 h-4 mr-2" />
                    Start Test
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Course Details Modal */}
      <Dialog open={!!selectedCourse} onOpenChange={() => setSelectedCourse(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Course Details</DialogTitle>
          </DialogHeader>
          {selectedCourse && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Course Title</p>
                  <p className="font-semibold">{selectedCourse.title}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Category</p>
                  <Badge variant="outline">{selectedCourse.category}</Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Level</p>
                  <p className="font-semibold">{selectedCourse.level}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Instructor</p>
                  <p className="font-semibold">{selectedCourse.instructor}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Enrolled Date</p>
                  <p className="font-semibold">{new Date(selectedCourse.enrolledDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Status</p>
                  <Badge variant={selectedCourse.status === "completed" ? "default" : selectedCourse.status === "enrolled" ? "secondary" : "destructive"}>
                    {selectedCourse.status}
                  </Badge>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Progress</span>
                  <span className="text-sm font-semibold">{selectedCourse.progress}%</span>
                </div>
                <Progress value={selectedCourse.progress} className="h-3" />
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}