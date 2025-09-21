import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Users, ClipboardList, BookOpen, TrendingUp, Search, Eye, FileText, Target } from "lucide-react";
import { useProfile } from "@/contexts/ProfileContext";
import { studentsAPI, testsAPI, dashboardAPI } from "@/lib/api";
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

export default function FacultyDashboard() {
  const { profileData } = useProfile();
  const { toast } = useToast();
  
  const [students, setStudents] = useState<Student[]>([]);
  const [tests, setTests] = useState<Test[]>([]);
  const [stats, setStats] = useState({
    totalStudents: 0,
    assignedTests: 0,
    completedTests: 0,
    pendingTests: 0
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [batchFilter, setBatchFilter] = useState("all");
  const [branchFilter, setBranchFilter] = useState("all");
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [selectedTest, setSelectedTest] = useState<Test | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch students from faculty's college
      const studentsResponse = await studentsAPI.getAll({
        collegeId: profileData.collegeId
      });
      
      // Fetch tests assigned to faculty's college
      const testsResponse = await testsAPI.getAll({
        collegeId: profileData.collegeId,
        assignedOnly: true
      });
      
      // Fetch dashboard stats
      const statsResponse = await dashboardAPI.getStats();
      
      setStudents(studentsResponse.students || []);
      setTests(testsResponse.tests || []);
      setStats({
        totalStudents: studentsResponse.students?.length || 0,
        assignedTests: testsResponse.tests?.length || 0,
        completedTests: testsResponse.tests?.filter((t: Test) => t.status === 'completed').length || 0,
        pendingTests: testsResponse.tests?.filter((t: Test) => t.status === 'pending').length || 0
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
          title="Completed Tests"
          value={stats.completedTests.toString()}
          change="Successfully completed"
          icon={BookOpen}
          trend="up"
        />
        <StatCard
          title="Pending Tests"
          value={stats.pendingTests.toString()}
          change="Awaiting completion"
          icon={TrendingUp}
          trend="neutral"
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
            Available Tests
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
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => handleViewTest(test)}
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
    </div>
  );
}