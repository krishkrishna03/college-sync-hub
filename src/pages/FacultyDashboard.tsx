import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Users, ClipboardList, BookOpen, TrendingUp, Search, Eye, FileText, Target, CheckCircle, Clock, Award } from "lucide-react";
import { useProfile } from "@/contexts/ProfileContext";
import { studentsAPI, testsAPI, dashboardAPI, facultyAPI, authAPI } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { StatCard } from "@/components/ui/stat-card";

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

  useEffect(() => {
    fetchDashboardData();
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
          Welcome back, {profileData.fullName}! Manage your college students and assigned tests.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Students"
          value={stats.totalStudents.toString()}
          change="In your college"
          icon={Users}
          trend="neutral"
        />
        <StatCard
          title="Assigned Tests"
          value={stats.assignedTests.toString()}
          change="Available for assignment"
          icon={ClipboardList}
          trend="neutral"
        />
        <StatCard
          title="Pending Tasks"
          value={stats.pendingTasks.toString()}
          change="Awaiting completion"
          icon={Clock}
          trend="neutral"
        />
        <StatCard
          title="Completed Tasks"
          value={stats.completedTasks.toString()}
          change="Successfully completed"
          icon={CheckCircle}
          trend="up"
        />
      </div>

      {/* Students Section */}
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
                <TableRow key={student.id}>
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
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewStudent(student)}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Available Tests Section */}
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
                        // Open assignment modal
                        const assignmentData = {
                          batches: ['2025'], // Default assignment
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

      {/* My Tasks Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="w-5 h-5" />
            My Tasks
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Task Title</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Assigned By</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tasks.map((task) => (
                <TableRow key={task.id}>
                  <TableCell className="font-medium">{task.title}</TableCell>
                  <TableCell className="max-w-xs truncate">{task.description}</TableCell>
                  <TableCell>{task.assignedBy}</TableCell>
                  <TableCell>{new Date(task.dueDate).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Badge variant={
                      task.status === "completed" ? "default" : 
                      task.status === "in-progress" ? "secondary" : "outline"
                    }>
                      {task.status.replace("-", " ")}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewTask(task)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      {task.status !== "completed" && (
                        <Select
                          value={task.status}
                          onValueChange={(value) => handleUpdateTaskStatus(task.id, value)}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="in-progress">In Progress</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
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