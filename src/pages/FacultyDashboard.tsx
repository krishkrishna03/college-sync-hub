import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, ClipboardList, BookOpen, TrendingUp, Search, Eye, FileText, Target, CheckCircle, Clock, Award, Plus, Download, BarChart3 } from "lucide-react";
import { useProfile } from "@/contexts/ProfileContext";
import { studentsAPI, testsAPI, dashboardAPI, facultyAPI, authAPI } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { StatCard } from "@/components/ui/stat-card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, BarChart, Bar } from "recharts";

interface Student {
  id: string;
  name: string;
  email: string;
  registrationNumber: string;
  batch: string;
  branch: string;
  section: string;
  status: string;
  enrollmentDate: string;
}

interface Test {
  id: string;
  title: string;
  category: string;
  subject: string;
  difficulty: string;
  totalQuestions: number;
  duration: number;
  assignedTo: {
    batches: string[];
    branches: string[];
    sections: string[];
  };
  status: string;
  createdAt: string;
}

interface Task {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  status: "pending" | "in-progress" | "completed";
  assignedBy: string;
  createdAt: string;
}

interface TestRequest {
  id: string;
  title: string;
  description: string;
  subject: string;
  testType: string;
  numberOfQuestions: number;
  difficultyLevel: string;
  status: "pending" | "approved" | "rejected";
  requestedDate: string;
}

const chartData = [
  { month: "Jan", testsCreated: 5, testsAssigned: 8, testsApproved: 6 },
  { month: "Feb", testsCreated: 7, testsAssigned: 12, testsApproved: 9 },
  { month: "Mar", testsCreated: 6, testsAssigned: 10, testsApproved: 8 },
  { month: "Apr", testsCreated: 9, testsAssigned: 15, testsApproved: 12 },
  { month: "May", testsCreated: 8, testsAssigned: 13, testsApproved: 10 },
  { month: "Jun", testsCreated: 11, testsAssigned: 18, testsApproved: 15 }
];

export default function FacultyDashboard() {
  const { profileData } = useProfile();
  const { toast } = useToast();
  
  const [students, setStudents] = useState<Student[]>([]);
  const [tests, setTests] = useState<Test[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [stats, setStats] = useState({
    totalStudents: 0,
    assignedTests: 0,
    pendingTasks: 0,
    completedTasks: 0
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [batchFilter, setBatchFilter] = useState("all");
  const [branchFilter, setBranchFilter] = useState("all");
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [selectedTest, setSelectedTest] = useState<Test | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [testRequests, setTestRequests] = useState<TestRequest[]>([]);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [requestData, setRequestData] = useState({
    title: "",
    description: "",
    subject: "",
    testType: "",
    numberOfQuestions: "",
    difficultyLevel: ""
  });

  useEffect(() => {
    fetchDashboardData();
    fetchTestRequests();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Get current user details
      const currentUser = await authAPI.getCurrentUser();
      
      // Fetch students from faculty's college
      const studentsResponse = await facultyAPI.getMyStudents();
      
      // Fetch tests available for faculty's college
      const testsResponse = await testsAPI.getCollegeTests(currentUser.collegeId);
      
      // Fetch faculty's tasks
      const tasksResponse = await facultyAPI.getMyTasks();
      
      const formattedStudents = studentsResponse.students?.map((student: any) => ({
        id: student._id,
        name: student.userId.name,
        email: student.userId.email,
        registrationNumber: student.registrationNumber,
        batch: student.batch,
        branch: student.branch,
        section: student.section,
        status: student.userId.status,
        enrollmentDate: student.enrollmentDate
      })) || [];
      
      const formattedTests = testsResponse.tests?.map((test: any) => ({
        id: test._id,
        title: test.title,
        category: test.category,
        subject: test.subject,
        difficulty: test.difficulty,
        totalQuestions: test.totalQuestions,
        duration: test.duration,
        assignedTo: test.assignedTo,
        status: test.assignedTo?.batches?.length > 0 ? 'assigned' : 'not-assigned',
        createdAt: test.createdAt
      })) || [];
      
      const formattedTasks = tasksResponse.tasks?.map((task: any) => ({
        id: task._id,
        title: task.title,
        description: task.description,
        dueDate: task.dueDate,
        status: task.status,
        assignedBy: task.assignedBy?.name || 'Admin',
        createdAt: task.createdAt
      })) || [];
      
      setStudents(formattedStudents);
      setTests(formattedTests);
      setTasks(formattedTasks);
      setStats({
        totalStudents: formattedStudents.length,
        assignedTests: formattedTests.filter(t => t.status === 'assigned').length,
        pendingTasks: formattedTasks.filter(t => t.status === 'pending').length,
        completedTasks: formattedTasks.filter(t => t.status === 'completed').length
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to fetch dashboard data: " + error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchTestRequests = async () => {
    try {
      // Mock data for test requests
      const mockRequests: TestRequest[] = [
        {
          id: "1",
          title: "Advanced Data Structures",
          description: "Test covering advanced data structure concepts",
          subject: "Technical",
          testType: "Assessment",
          numberOfQuestions: 50,
          difficultyLevel: "Hard",
          status: "pending",
          requestedDate: new Date().toISOString()
        }
      ];
      setTestRequests(mockRequests);
    } catch (error: any) {
      console.error("Failed to fetch test requests:", error);
    }
  };

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.registrationNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesBatch = batchFilter === "all" || student.batch === batchFilter;
    const matchesBranch = branchFilter === "all" || student.branch === branchFilter;
    return matchesSearch && matchesBatch && matchesBranch;
  });

  const handleViewStudent = (student: Student) => {
    setSelectedStudent(student);
  };

  const handleViewTest = (test: Test) => {
    setSelectedTest(test);
  };

  const handleViewTask = (task: Task) => {
    setSelectedTask(task);
  };

  const handleUpdateTaskStatus = async (taskId: string, status: string) => {
    try {
      await facultyAPI.updateTaskStatus(taskId, status);
      fetchDashboardData(); // Refresh data
      toast({
        title: "Task Updated",
        description: "Task status updated successfully"
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to update task: " + error.message,
        variant: "destructive"
      });
    }
  };

  const handleAssignTest = async (testId: string, assignmentData: any) => {
    try {
      await testsAPI.assign(testId, assignmentData);
      fetchDashboardData(); // Refresh data
      toast({
        title: "Test Assigned",
        description: "Test has been assigned successfully"
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to assign test: " + error.message,
        variant: "destructive"
      });
    }
  };

  const handleCreateTestRequest = async () => {
    try {
      // API call to create test request
      const newRequest: TestRequest = {
        id: Date.now().toString(),
        ...requestData,
        numberOfQuestions: parseInt(requestData.numberOfQuestions),
        status: "pending",
        requestedDate: new Date().toISOString()
      };
      
      setTestRequests([...testRequests, newRequest]);
      toast({
        title: "Test Request Submitted",
        description: "Your test request has been submitted for approval"
      });
      
      setIsRequestModalOpen(false);
      setRequestData({
        title: "",
        description: "",
        subject: "",
        testType: "",
        numberOfQuestions: "",
        difficultyLevel: ""
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to submit test request: " + error.message,
        variant: "destructive"
      });
    }
  };

  const handleDownloadStudentReport = (studentId: string) => {
    // Generate PDF report for individual student
    window.open(`/student-report/${studentId}`, '_blank');
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

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Faculty Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {profileData.fullName}! Manage students, tests, and track progress.
        </p>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="students">Students</TabsTrigger>
          <TabsTrigger value="tests">Tests</TabsTrigger>
          <TabsTrigger value="requests">Test Requests</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Tests Created"
              value="24"
              change="+3 this month"
              icon={ClipboardList}
              trend="up"
            />
            <StatCard
              title="Tests Assigned"
              value="18"
              change="Active assignments"
              icon={Target}
              trend="neutral"
            />
            <StatCard
              title="Tests Approved"
              value="15"
              change="By admin"
              icon={CheckCircle}
              trend="up"
            />
            <StatCard
              title="Students Assigned"
              value={stats.totalStudents.toString()}
              change="Total reach"
              icon={Users}
              trend="neutral"
            />
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="hover:shadow-elevated transition-all duration-300">
              <CardHeader>
                <CardTitle>Monthly Test Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer config={{
                  testsCreated: { label: "Tests Created", color: "#3b82f6" },
                  testsAssigned: { label: "Tests Assigned", color: "#10b981" },
                  testsApproved: { label: "Tests Approved", color: "#f59e0b" }
                }}>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Line type="monotone" dataKey="testsCreated" stroke="#3b82f6" strokeWidth={2} />
                      <Line type="monotone" dataKey="testsAssigned" stroke="#10b981" strokeWidth={2} />
                      <Line type="monotone" dataKey="testsApproved" stroke="#f59e0b" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card className="hover:shadow-elevated transition-all duration-300">
              <CardHeader>
                <CardTitle>Test Performance Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer config={{
                  testsCreated: { label: "Tests Created", color: "#3b82f6" },
                  testsAssigned: { label: "Tests Assigned", color: "#10b981" }
                }}>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="testsCreated" fill="#3b82f6" />
                      <Bar dataKey="testsAssigned" fill="#10b981" />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Students Tab */}
        <TabsContent value="students" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                College Students
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Filters */}
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search students..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={batchFilter} onValueChange={setBatchFilter}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Batch" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Batches</SelectItem>
                    <SelectItem value="2025">2025</SelectItem>
                    <SelectItem value="2026">2026</SelectItem>
                    <SelectItem value="2027">2027</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={branchFilter} onValueChange={setBranchFilter}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Branch" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Branches</SelectItem>
                    <SelectItem value="CSE">CSE</SelectItem>
                    <SelectItem value="IT">IT</SelectItem>
                    <SelectItem value="EEE">EEE</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Students Table */}
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student Name</TableHead>
                    <TableHead>Registration ID</TableHead>
                    <TableHead>Batch</TableHead>
                    <TableHead>Branch</TableHead>
                    <TableHead>Section</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStudents.slice(0, 10).map((student) => (
                    <TableRow key={student.id} className="hover:bg-accent/50">
                      <TableCell className="font-medium">{student.name}</TableCell>
                      <TableCell>{student.registrationNumber}</TableCell>
                      <TableCell>{student.batch}</TableCell>
                      <TableCell>{student.branch}</TableCell>
                      <TableCell>{student.section}</TableCell>
                      <TableCell>
                        <Badge variant={student.status === "active" ? "default" : "secondary"}>
                          {student.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewStudent(student)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDownloadStudentReport(student.id)}
                          >
                            <Download className="w-4 h-4" />
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

        {/* Tests Tab */}
        <TabsContent value="tests" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ClipboardList className="w-5 h-5" />
                Available Tests for Assignment
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {tests.slice(0, 6).map((test) => (
                  <Card key={test.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <Badge variant="outline">{test.category}</Badge>
                        <Badge variant={test.difficulty === "Easy" ? "secondary" : test.difficulty === "Medium" ? "default" : "destructive"}>
                          {test.difficulty}
                        </Badge>
                      </div>
                      <CardTitle className="text-lg">{test.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Questions:</span>
                        <span className="font-medium">{test.totalQuestions}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Duration:</span>
                        <span className="font-medium">{test.duration} min</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Subject:</span>
                        <span className="font-medium">{test.subject}</span>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => handleViewTest(test)}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Button>
                        <Button
                          size="sm"
                          className="flex-1"
                          disabled={test.status === 'assigned'}
                          onClick={() => {
                            const assignmentData = {
                              batches: ['2025'],
                              branches: ['CSE'],
                              sections: ['A']
                            };
                            handleAssignTest(test.id, assignmentData);
                          }}
                        >
                          {test.status === 'assigned' ? 'Assigned' : 'Assign'}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Test Requests Tab */}
        <TabsContent value="requests" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Test Requests
                </span>
                <Dialog open={isRequestModalOpen} onOpenChange={setIsRequestModalOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Request New Test
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Request New Test</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="requestTitle">Test Title</Label>
                        <Input
                          id="requestTitle"
                          placeholder="Enter test title"
                          value={requestData.title}
                          onChange={(e) => setRequestData({...requestData, title: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="requestDescription">Description</Label>
                        <Textarea
                          id="requestDescription"
                          placeholder="Describe the test requirements"
                          value={requestData.description}
                          onChange={(e) => setRequestData({...requestData, description: e.target.value})}
                          rows={3}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="requestSubject">Subject</Label>
                          <Select value={requestData.subject} onValueChange={(value) => setRequestData({...requestData, subject: value})}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select subject" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Technical">Technical</SelectItem>
                              <SelectItem value="Logical">Logical</SelectItem>
                              <SelectItem value="Reasoning">Reasoning</SelectItem>
                              <SelectItem value="Verbal">Verbal</SelectItem>
                              <SelectItem value="Coding">Coding</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="requestTestType">Test Type</Label>
                          <Select value={requestData.testType} onValueChange={(value) => setRequestData({...requestData, testType: value})}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Practice">Practice</SelectItem>
                              <SelectItem value="Assessment">Assessment</SelectItem>
                              <SelectItem value="Mock Test">Mock Test</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="requestQuestions">Number of Questions</Label>
                          <Input
                            id="requestQuestions"
                            type="number"
                            placeholder="e.g., 50"
                            value={requestData.numberOfQuestions}
                            onChange={(e) => setRequestData({...requestData, numberOfQuestions: e.target.value})}
                          />
                        </div>
                        <div>
                          <Label htmlFor="requestDifficulty">Difficulty Level</Label>
                          <Select value={requestData.difficultyLevel} onValueChange={(value) => setRequestData({...requestData, difficultyLevel: value})}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select difficulty" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Easy">Easy</SelectItem>
                              <SelectItem value="Medium">Medium</SelectItem>
                              <SelectItem value="Hard">Hard</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsRequestModalOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleCreateTestRequest}>Submit Request</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Test Title</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Questions</TableHead>
                    <TableHead>Difficulty</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Requested Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {testRequests.map((request) => (
                    <TableRow key={request.id} className="hover:bg-accent/50">
                      <TableCell className="font-medium">{request.title}</TableCell>
                      <TableCell>{request.subject}</TableCell>
                      <TableCell>{request.testType}</TableCell>
                      <TableCell>{request.numberOfQuestions}</TableCell>
                      <TableCell>
                        <Badge variant={request.difficultyLevel === "Easy" ? "secondary" : request.difficultyLevel === "Medium" ? "default" : "destructive"}>
                          {request.difficultyLevel}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={
                          request.status === "approved" ? "default" :
                          request.status === "rejected" ? "destructive" : "secondary"
                        }>
                          {request.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(request.requestedDate).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reports Tab */}
        <TabsContent value="reports" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Student Progress Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <BarChart3 className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Individual Student Reports</h3>
                <p className="text-muted-foreground mb-4">View and download detailed progress reports for each student</p>
                <Button onClick={() => window.location.href = '/students'}>
                  <Eye className="w-4 h-4 mr-2" />
                  View Student Reports
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Student Details Modal */}
      <Dialog open={!!selectedStudent} onOpenChange={() => setSelectedStudent(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Student Details</DialogTitle>
          </DialogHeader>
          {selectedStudent && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Name</p>
                  <p className="font-semibold">{selectedStudent.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Email</p>
                  <p className="font-semibold">{selectedStudent.email}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Registration ID</p>
                  <p className="font-semibold">{selectedStudent.registrationNumber}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Batch</p>
                  <p className="font-semibold">{selectedStudent.batch}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Branch</p>
                  <p className="font-semibold">{selectedStudent.branch}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Section</p>
                  <p className="font-semibold">{selectedStudent.section}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Status</p>
                  <Badge variant={selectedStudent.status === "active" ? "default" : "secondary"}>
                    {selectedStudent.status}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Enrollment Date</p>
                  <p className="font-semibold">{new Date(selectedStudent.enrollmentDate).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

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
                  <p className="text-sm font-medium text-muted-foreground">Questions</p>
                  <p className="font-semibold">{selectedTest.totalQuestions}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Duration</p>
                  <p className="font-semibold">{selectedTest.duration} minutes</p>
                </div>
              </div>
              
              {selectedTest.assignedTo && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">Assigned To</p>
                  <div className="space-y-2">
                    {selectedTest.assignedTo.batches.length > 0 && (
                      <div>
                        <p className="text-xs text-muted-foreground">Batches:</p>
                        <div className="flex flex-wrap gap-1">
                          {selectedTest.assignedTo.batches.map((batch) => (
                            <Badge key={batch} variant="secondary" className="text-xs">
                              {batch}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    {selectedTest.assignedTo.branches.length > 0 && (
                      <div>
                        <p className="text-xs text-muted-foreground">Branches:</p>
                        <div className="flex flex-wrap gap-1">
                          {selectedTest.assignedTo.branches.map((branch) => (
                            <Badge key={branch} variant="secondary" className="text-xs">
                              {branch}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    {selectedTest.assignedTo.sections.length > 0 && (
                      <div>
                        <p className="text-xs text-muted-foreground">Sections:</p>
                        <div className="flex flex-wrap gap-1">
                          {selectedTest.assignedTo.sections.map((section) => (
                            <Badge key={section} variant="secondary" className="text-xs">
                              {section}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Task Details Modal */}
      <Dialog open={!!selectedTask} onOpenChange={() => setSelectedTask(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Task Details</DialogTitle>
          </DialogHeader>
          {selectedTask && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Task Title</p>
                  <p className="font-semibold">{selectedTask.title}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Assigned By</p>
                  <p className="font-semibold">{selectedTask.assignedBy}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Due Date</p>
                  <p className="font-semibold">{new Date(selectedTask.dueDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Status</p>
                  <Badge variant={
                    selectedTask.status === "completed" ? "default" : 
                    selectedTask.status === "in-progress" ? "secondary" : "outline"
                  }>
                    {selectedTask.status.replace("-", " ")}
                  </Badge>
                </div>
              </div>
              
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Description</p>
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm">{selectedTask.description}</p>
                </div>
              </div>

              {selectedTask.status !== "completed" && (
                <div className="flex justify-end gap-2 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => handleUpdateTaskStatus(selectedTask.id, "in-progress")}
                    disabled={selectedTask.status === "in-progress"}
                  >
                    Mark In Progress
                  </Button>
                  <Button
                    onClick={() => handleUpdateTaskStatus(selectedTask.id, "completed")}
                  >
                    Mark Completed
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}