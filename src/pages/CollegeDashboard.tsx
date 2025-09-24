import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Plus, Search, Edit, Trash2, Users, GraduationCap, Mail, UserPlus, Upload, Download, CalendarIcon, ClipboardList, Megaphone } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { StatCard } from "@/components/ui/stat-card";
import { studentsAPI, facultyAPI, testsAPI, announcementsAPI } from "@/lib/api";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface User {
  id: string;
  name: string;
  email: string;
  role: "faculty" | "student";
  status: "pending" | "active" | "inactive";
  department?: string;
  batch?: string;
  section?: string;
  createdAt: string;
}

interface TestAssignment {
  testId: string;
  testTitle: string;
  startDate: Date;
  endDate: Date;
  startTime: string;
  endTime: string;
  subject: string;
  testType: string;
  batches: string[];
  branches: string[];
  sections: string[];
}

interface Announcement {
  id: string;
  title: string;
  content: string;
  targetAudience: string;
  priority: string;
  scheduledFor: Date;
  status: string;
}

export default function CollegeDashboard() {
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isBulkUploadOpen, setIsBulkUploadOpen] = useState(false);
  const [isTestAssignOpen, setIsTestAssignOpen] = useState(false);
  const [isAnnouncementOpen, setIsAnnouncementOpen] = useState(false);
  const [bulkUploadData, setBulkUploadData] = useState({
    file: null as File | null,
    userType: "student",
    batch: "",
    branch: "",
    section: ""
  });
  const [testAssignment, setTestAssignment] = useState<TestAssignment>({
    testId: "",
    testTitle: "",
    startDate: new Date(),
    endDate: new Date(),
    startTime: "",
    endTime: "",
    subject: "",
    testType: "",
    batches: [],
    branches: [],
    sections: []
  });
  const [announcementData, setAnnouncementData] = useState<Announcement>({
    id: "",
    title: "",
    content: "",
    targetAudience: "all",
    priority: "medium",
    scheduledFor: new Date(),
    status: "draft"
  });
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "",
    department: "",
    designation: "",
    facultyId: "",
    studentId: "",
    batch: "",
    branch: "",
    section: "",
    year: ""
  });

  const [availableTests, setAvailableTests] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalFaculty: 0,
    pendingInvitations: 0,
    assignedTests: 0
  });

  useEffect(() => {
    fetchUsers();
    fetchAvailableTests();
    fetchAnnouncements();
    fetchStats();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      // Mock data for now - replace with actual API call
      const mockUsers: User[] = [
        {
          id: "1",
          name: "Dr. Alice Johnson",
          email: "alice.johnson@college.edu",
          role: "faculty",
          status: "active",
          department: "Computer Science",
          createdAt: "2024-01-15"
        },
        {
          id: "2",
          name: "John Smith",
          email: "john.smith@student.college.edu",
          role: "student",
          status: "active",
          batch: "2025",
          section: "A",
          createdAt: "2024-01-20"
        },
        {
          id: "3",
          name: "Prof. Sarah Wilson",
          email: "sarah.wilson@college.edu",
          role: "faculty",
          status: "pending",
          department: "Mathematics",
          createdAt: "2024-01-25"
        }
      ];
      setUsers(mockUsers);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to fetch users: " + error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableTests = async () => {
    try {
      const response = await testsAPI.getAll();
      setAvailableTests(response.tests || []);
    } catch (error: any) {
      console.error("Failed to fetch tests:", error);
    }
  };

  const fetchAnnouncements = async () => {
    try {
      const response = await announcementsAPI.getAll();
      setAnnouncements(response.announcements || []);
    } catch (error: any) {
      console.error("Failed to fetch announcements:", error);
    }
  };

  const fetchStats = async () => {
    try {
      // Calculate stats from users data
      const studentCount = users.filter(u => u.role === "student").length;
      const facultyCount = users.filter(u => u.role === "faculty").length;
      const pendingCount = users.filter(u => u.status === "pending").length;
      
      setStats({
        totalStudents: studentCount,
        totalFaculty: facultyCount,
        pendingInvitations: pendingCount,
        assignedTests: 0 // This would come from actual API
      });
    } catch (error: any) {
      console.error("Failed to fetch stats:", error);
    }
  };

  const handleBulkUpload = async () => {
    if (!bulkUploadData.file) {
      toast({
        title: "Error",
        description: "Please select a file",
        variant: "destructive"
      });
      return;
    }

    try {
      const formData = new FormData();
      formData.append('file', bulkUploadData.file);
      formData.append('batch', bulkUploadData.batch);
      formData.append('branch', bulkUploadData.branch);
      formData.append('section', bulkUploadData.section);

      if (bulkUploadData.userType === "student") {
        await studentsAPI.bulkUpload(formData);
      } else {
        await facultyAPI.bulkUpload(formData);
      }

      toast({
        title: "Upload Successful",
        description: `${bulkUploadData.userType}s uploaded successfully. Invitations sent.`
      });

      fetchUsers();
      setIsBulkUploadOpen(false);
      setBulkUploadData({
        file: null,
        userType: "student",
        batch: "",
        branch: "",
        section: ""
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to upload: " + error.message,
        variant: "destructive"
      });
    }
  };

  const handleAssignTest = async () => {
    try {
      await testsAPI.assign(testAssignment.testId, {
        batches: testAssignment.batches,
        branches: testAssignment.branches,
        sections: testAssignment.sections,
        startDate: testAssignment.startDate,
        endDate: testAssignment.endDate,
        startTime: testAssignment.startTime,
        endTime: testAssignment.endTime
      });

      toast({
        title: "Test Assigned",
        description: "Test has been assigned successfully"
      });

      setIsTestAssignOpen(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to assign test: " + error.message,
        variant: "destructive"
      });
    }
  };

  const handleCreateAnnouncement = async () => {
    try {
      await announcementsAPI.create(announcementData);
      toast({
        title: "Announcement Created",
        description: "Announcement has been created successfully"
      });

      fetchAnnouncements();
      setIsAnnouncementOpen(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to create announcement: " + error.message,
        variant: "destructive"
      });
    }
  };

  const handleCreateUser = async () => {
    if (!formData.name || !formData.email || !formData.role) {
      toast({
        title: "Error",
        description: "Please fill all required fields",
        variant: "destructive"
      });
      return;
    }

    try {
      // API call would go here
      toast({
        title: "Invitation Sent",
        description: `Invitation sent to ${formData.email}. They will receive an email to set up their account.`,
      });
      
      fetchUsers();
      resetForm();
      setIsCreateModalOpen(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to send invitation: " + error.message,
        variant: "destructive"
      });
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      // API call would go here
      toast({
        title: "User Deleted",
        description: "User account deleted successfully"
      });
      fetchUsers();
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to delete user: " + error.message,
        variant: "destructive"
      });
    }
  };

  const handleResendInvitation = async (userId: string, email: string) => {
    try {
      // API call would go here
      toast({
        title: "Invitation Resent",
        description: `Invitation resent to ${email}`
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to resend invitation: " + error.message,
        variant: "destructive"
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      role: "",
      department: "",
      designation: "",
      facultyId: "",
      studentId: "",
      batch: "",
      branch: "",
      section: "",
      year: ""
    });
  };

  const handleDownloadReports = () => {
    // Generate and download student reports
    const csvContent = [
      'Name,Email,Role,Department/Batch,Status,Created Date',
      ...filteredUsers.map(user => 
        `${user.name},${user.email},${user.role},${user.role === 'faculty' ? user.department : `${user.batch} - ${user.section}`},${user.status},${user.createdAt}`
      )
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'college_reports.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    const matchesStatus = statusFilter === "all" || user.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading users...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">College Dashboard</h1>
          <p className="text-muted-foreground">Comprehensive college management system</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setIsBulkUploadOpen(true)}>
            <Upload className="w-4 h-4 mr-2" />
            Bulk Upload
          </Button>
          <Button variant="outline" onClick={() => setIsTestAssignOpen(true)}>
            <ClipboardList className="w-4 h-4 mr-2" />
            Assign Test
          </Button>
          <Button variant="outline" onClick={() => setIsAnnouncementOpen(true)}>
            <Megaphone className="w-4 h-4 mr-2" />
            Create Announcement
          </Button>
          <Button onClick={handleDownloadReports}>
            <Download className="w-4 h-4 mr-2" />
            Download Reports
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Faculty"
          value={stats.totalFaculty.toString()}
          change="Teaching staff"
          icon={GraduationCap}
          trend="neutral"
        />
        <StatCard
          title="Total Students"
          value={stats.totalStudents.toString()}
          change="Enrolled students"
          icon={Users}
          trend="neutral"
        />
        <StatCard
          title="Pending Invitations"
          value={stats.pendingInvitations.toString()}
          change="Awaiting acceptance"
          icon={Mail}
          trend="neutral"
        />
        <StatCard
          title="Assigned Tests"
          value={stats.assignedTests.toString()}
          change="Active assessments"
          icon={ClipboardList}
          trend="neutral"
        />
      </div>

      </div>

      </div>

      <Tabs defaultValue="users" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="users">User Management</TabsTrigger>
          <TabsTrigger value="tests">Test Assignment</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="announcements">Announcements</TabsTrigger>
        </TabsList>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                User Management
                <div className="flex gap-2">
                  <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                    <DialogTrigger asChild>
                      <Button onClick={resetForm} size="sm">
                        <Plus className="w-4 h-4 mr-2" />
                        Add User
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Invite New User</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="userName">Name *</Label>
                            <Input
                              id="userName"
                              placeholder="Enter full name"
                              value={formData.name}
                              onChange={(e) => setFormData({...formData, name: e.target.value})}
                            />
                          </div>
                          <div>
                            <Label htmlFor="userEmail">Email *</Label>
                            <Input
                              id="userEmail"
                              type="email"
                              placeholder="user@college.edu"
                              value={formData.email}
                              onChange={(e) => setFormData({...formData, email: e.target.value})}
                            />
                          </div>
                        </div>
                        
                        <div>
                          <Label htmlFor="userRole">Role *</Label>
                          <Select value={formData.role} onValueChange={(value) => setFormData({...formData, role: value})}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select role" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="faculty">Faculty</SelectItem>
                              <SelectItem value="student">Student</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Faculty specific fields */}
                        {formData.role === "faculty" && (
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="facultyId">Faculty ID *</Label>
                              <Input
                                id="facultyId"
                                placeholder="FAC001"
                                value={formData.facultyId}
                                onChange={(e) => setFormData({...formData, facultyId: e.target.value})}
                              />
                            </div>
                            <div>
                              <Label htmlFor="department">Department *</Label>
                              <Select value={formData.department} onValueChange={(value) => setFormData({...formData, department: value})}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select department" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Computer Science">Computer Science</SelectItem>
                                  <SelectItem value="Electronics">Electronics</SelectItem>
                                  <SelectItem value="Mechanical">Mechanical</SelectItem>
                                  <SelectItem value="Civil">Civil</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="col-span-2">
                              <Label htmlFor="designation">Designation</Label>
                              <Input
                                id="designation"
                                placeholder="Assistant Professor"
                                value={formData.designation}
                                onChange={(e) => setFormData({...formData, designation: e.target.value})}
                              />
                            </div>
                          </div>
                        )}

                        {/* Student specific fields */}
                        {formData.role === "student" && (
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="studentId">Student ID *</Label>
                              <Input
                                id="studentId"
                                placeholder="STU001"
                                value={formData.studentId}
                                onChange={(e) => setFormData({...formData, studentId: e.target.value})}
                              />
                            </div>
                            <div>
                              <Label htmlFor="batch">Batch *</Label>
                              <Select value={formData.batch} onValueChange={(value) => setFormData({...formData, batch: value})}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select batch" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="2025">2025</SelectItem>
                                  <SelectItem value="2026">2026</SelectItem>
                                  <SelectItem value="2027">2027</SelectItem>
                                  <SelectItem value="2028">2028</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label htmlFor="branch">Branch *</Label>
                              <Select value={formData.branch} onValueChange={(value) => setFormData({...formData, branch: value})}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select branch" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="CSE">CSE</SelectItem>
                                  <SelectItem value="EEE">EEE</SelectItem>
                                  <SelectItem value="IT">IT</SelectItem>
                                  <SelectItem value="MECH">MECH</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label htmlFor="section">Section *</Label>
                              <Select value={formData.section} onValueChange={(value) => setFormData({...formData, section: value})}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select section" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="A">A</SelectItem>
                                  <SelectItem value="B">B</SelectItem>
                                  <SelectItem value="C">C</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        )}
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                          Cancel
                        </Button>
                        <Button onClick={handleCreateUser}>Send Invitation</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Filters */}
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Search className="w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="max-w-sm"
                  />
                </div>
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    <SelectItem value="faculty">Faculty</SelectItem>
                    <SelectItem value="student">Student</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Table */}
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Department/Batch</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id} className="hover:bg-accent/50">
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Badge variant={user.role === "faculty" ? "default" : "secondary"}>
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {user.role === "faculty" ? user.department : `${user.batch} - ${user.section}`}
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={
                            user.status === "active" ? "default" : 
                            user.status === "pending" ? "secondary" : "outline"
                          }
                        >
                          {user.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {user.status === "pending" && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleResendInvitation(user.id, user.email)}
                            >
                              <Mail className="w-4 h-4" />
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteUser(user.id)}
                          >
                            <Trash2 className="w-4 h-4" />
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

        {/* Test Assignment Tab */}
        <TabsContent value="tests" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Test Assignment</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <ClipboardList className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Assign Tests to Students</h3>
                <p className="text-muted-foreground mb-4">Select tests and assign them to specific batches, branches, and sections</p>
                <Button onClick={() => setIsTestAssignOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Assign Test
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reports Tab */}
        <TabsContent value="reports" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Student Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <FileText className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Download Student Reports</h3>
                <p className="text-muted-foreground mb-4">Generate and download comprehensive student reports</p>
                <Button onClick={handleDownloadReports}>
                  <Download className="w-4 h-4 mr-2" />
                  Download Reports
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Announcements Tab */}
        <TabsContent value="announcements" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Announcements
                <Button onClick={() => setIsAnnouncementOpen(true)} size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Announcement
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {announcements.map((announcement) => (
                  <Card key={announcement.id} className="border-l-4 border-l-primary">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-semibold">{announcement.title}</h4>
                          <p className="text-sm text-muted-foreground mt-1">{announcement.content}</p>
                          <div className="flex gap-2 mt-2">
                            <Badge variant="outline">{announcement.targetAudience}</Badge>
                            <Badge variant={announcement.priority === "high" ? "destructive" : "secondary"}>
                              {announcement.priority}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Bulk Upload Modal */}
      <Dialog open={isBulkUploadOpen} onOpenChange={setIsBulkUploadOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Bulk Upload Users</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="userType">User Type</Label>
              <Select value={bulkUploadData.userType} onValueChange={(value) => setBulkUploadData({...bulkUploadData, userType: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="student">Students</SelectItem>
                  <SelectItem value="faculty">Faculty</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="file">Upload File</Label>
              <Input
                id="file"
                type="file"
                accept=".csv,.xlsx"
                onChange={(e) => setBulkUploadData({...bulkUploadData, file: e.target.files?.[0] || null})}
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="batch">Batch</Label>
                <Select value={bulkUploadData.batch} onValueChange={(value) => setBulkUploadData({...bulkUploadData, batch: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select batch" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2025">2025</SelectItem>
                    <SelectItem value="2026">2026</SelectItem>
                    <SelectItem value="2027">2027</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="branch">Branch</Label>
                <Select value={bulkUploadData.branch} onValueChange={(value) => setBulkUploadData({...bulkUploadData, branch: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select branch" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CSE">CSE</SelectItem>
                    <SelectItem value="EEE">EEE</SelectItem>
                    <SelectItem value="IT">IT</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="section">Section</Label>
                <Select value={bulkUploadData.section} onValueChange={(value) => setBulkUploadData({...bulkUploadData, section: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select section" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A">A</SelectItem>
                    <SelectItem value="B">B</SelectItem>
                    <SelectItem value="C">C</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsBulkUploadOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleBulkUpload}>Upload</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Test Assignment Modal */}
      <Dialog open={isTestAssignOpen} onOpenChange={setIsTestAssignOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Assign Test to Students</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="testSelect">Select Test</Label>
              <Select value={testAssignment.testId} onValueChange={(value) => {
                const test = availableTests.find(t => t.id === value);
                setTestAssignment({
                  ...testAssignment,
                  testId: value,
                  testTitle: test?.title || "",
                  subject: test?.subject || "",
                  testType: test?.category || ""
                });
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a test" />
                </SelectTrigger>
                <SelectContent>
                  {availableTests.map((test) => (
                    <SelectItem key={test.id} value={test.id}>
                      {test.title} - {test.subject}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Start Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {testAssignment.startDate ? format(testAssignment.startDate, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={testAssignment.startDate}
                      onSelect={(date) => setTestAssignment({...testAssignment, startDate: date || new Date()})}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div>
                <Label>End Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {testAssignment.endDate ? format(testAssignment.endDate, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={testAssignment.endDate}
                      onSelect={(date) => setTestAssignment({...testAssignment, endDate: date || new Date()})}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startTime">Start Time</Label>
                <Input
                  id="startTime"
                  type="time"
                  value={testAssignment.startTime}
                  onChange={(e) => setTestAssignment({...testAssignment, startTime: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="endTime">End Time</Label>
                <Input
                  id="endTime"
                  type="time"
                  value={testAssignment.endTime}
                  onChange={(e) => setTestAssignment({...testAssignment, endTime: e.target.value})}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Batch</Label>
                <Select onValueChange={(value) => setTestAssignment({...testAssignment, batches: [value]})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select batch" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2025">2025</SelectItem>
                    <SelectItem value="2026">2026</SelectItem>
                    <SelectItem value="2027">2027</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Branch</Label>
                <Select onValueChange={(value) => setTestAssignment({...testAssignment, branches: [value]})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select branch" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CSE">CSE</SelectItem>
                    <SelectItem value="EEE">EEE</SelectItem>
                    <SelectItem value="IT">IT</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Section</Label>
                <Select onValueChange={(value) => setTestAssignment({...testAssignment, sections: [value]})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select section" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A">A</SelectItem>
                    <SelectItem value="B">B</SelectItem>
                    <SelectItem value="C">C</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsTestAssignOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAssignTest}>Assign Test</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Announcement Modal */}
      <Dialog open={isAnnouncementOpen} onOpenChange={setIsAnnouncementOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Announcement</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="announcementTitle">Title</Label>
              <Input
                id="announcementTitle"
                placeholder="Enter announcement title"
                value={announcementData.title}
                onChange={(e) => setAnnouncementData({...announcementData, title: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="announcementContent">Content</Label>
              <Textarea
                id="announcementContent"
                placeholder="Enter announcement content"
                value={announcementData.content}
                onChange={(e) => setAnnouncementData({...announcementData, content: e.target.value})}
                rows={4}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="targetAudience">Target Audience</Label>
                <Select value={announcementData.targetAudience} onValueChange={(value) => setAnnouncementData({...announcementData, targetAudience: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Users</SelectItem>
                    <SelectItem value="faculty">Faculty</SelectItem>
                    <SelectItem value="students">Students</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="priority">Priority</Label>
                <Select value={announcementData.priority} onValueChange={(value) => setAnnouncementData({...announcementData, priority: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAnnouncementOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateAnnouncement}>Create Announcement</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}