import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, Edit, Trash2, Building, Users, GraduationCap, School, Activity, BarChart3, TrendingUp, FileText, Bell } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { StatCard } from "@/components/ui/stat-card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from "recharts";
import { masterAdminAPI, collegesAPI, examsAPI, notificationsAPI } from "@/lib/api";

interface College {
  id: string;
  name: string;
  code: string;
  email: string;
  phone: string;
  adminName: string;
  adminEmail: string;
  status: "active" | "inactive";
  studentsCount: number;
  facultyCount: number;
  createdAt: string;
}

interface AuditLog {
  id: string;
  action: string;
  details: string;
  user: string;
  timestamp: string;
  type: string;
}

interface PlatformStats {
  totalColleges: number;
  totalStudents: number;
  totalFaculty: number;
  totalExams: number;
  activeUsers: number;
  monthlyGrowth: number;
}

const chartData = [
  { month: "Jan", students: 1200, faculty: 80, colleges: 5 },
  { month: "Feb", students: 1350, faculty: 85, colleges: 6 },
  { month: "Mar", students: 1500, faculty: 92, colleges: 7 },
  { month: "Apr", students: 1680, faculty: 98, colleges: 8 },
  { month: "May", students: 1850, faculty: 105, colleges: 9 },
  { month: "Jun", students: 2000, faculty: 112, colleges: 10 }
];

const pieData = [
  { name: "Active", value: 85, color: "#3b82f6" },
  { name: "Inactive", value: 15, color: "#ef4444" }
];

export default function MasterAdminDashboard() {
  const { toast } = useToast();
  const [colleges, setColleges] = useState<College[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [platformStats, setPlatformStats] = useState<PlatformStats>({
    totalColleges: 0,
    totalStudents: 0,
    totalFaculty: 0,
    totalExams: 0,
    activeUsers: 0,
    monthlyGrowth: 0
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    email: "",
    phone: "",
    address: "",
    adminName: "",
    adminEmail: ""
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Mock platform statistics for now
      setPlatformStats({
        totalColleges: 12,
        totalStudents: 2450,
        totalFaculty: 185,
        totalExams: 156,
        activeUsers: 1890,
        monthlyGrowth: 15.2
      });
      
      // Mock colleges data
      const mockColleges: College[] = [
        {
          id: "1",
          name: "PlantechX Engineering College",
          code: "PEC001",
          email: "admin@plantechx.edu",
          phone: "+91 98765 43210",
          adminName: "Dr. John Smith",
          adminEmail: "john.smith@plantechx.edu",
          status: "active",
          studentsCount: 1250,
          facultyCount: 85,
          createdAt: "2024-01-15"
        },
        {
          id: "2",
          name: "Tech Innovation Institute",
          code: "TII002",
          email: "contact@techinnovation.edu",
          phone: "+91 87654 32109",
          adminName: "Dr. Sarah Johnson",
          adminEmail: "sarah.johnson@techinnovation.edu",
          status: "active",
          studentsCount: 890,
          facultyCount: 62,
          createdAt: "2024-02-20"
        },
        {
          id: "3",
          name: "Future Tech University",
          code: "FTU003",
          email: "admin@futuretech.edu",
          phone: "+91 76543 21098",
          adminName: "Dr. Michael Brown",
          adminEmail: "michael.brown@futuretech.edu",
          status: "active",
          studentsCount: 310,
          facultyCount: 38,
          createdAt: "2024-03-10"
        }
      ];
      setColleges(mockColleges);
      
      // Mock audit logs
      const mockAuditLogs: AuditLog[] = [
        {
          id: "1",
          action: "Created new college",
          details: "Future Tech University created with admin Dr. Michael Brown",
          user: "Master Admin",
          timestamp: "2024-03-10 10:30 AM",
          type: "create"
        },
        {
          id: "2",
          action: "Created new exam",
          details: "Data Structures Assessment - 50 questions, Hard difficulty",
          user: "Master Admin",
          timestamp: "2024-03-09 02:15 PM",
          type: "create"
        },
        {
          id: "3",
          action: "Assigned exam to college",
          details: "Programming Fundamentals assigned to PlantechX Engineering College",
          user: "Master Admin",
          timestamp: "2024-03-08 11:45 AM",
          type: "assign"
        },
        {
          id: "4",
          action: "Updated college status",
          details: "Tech Innovation Institute status changed to active",
          user: "Master Admin",
          timestamp: "2024-03-07 04:20 PM",
          type: "update"
        },
        {
          id: "5",
          action: "Sent platform notification",
          details: "System maintenance notification sent to all users",
          user: "Master Admin",
          timestamp: "2024-03-06 09:00 AM",
          type: "create"
        }
      ];
      setAuditLogs(mockAuditLogs);
      
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

  const handleCreateCollege = async () => {
    if (!formData.name || !formData.code || !formData.email || !formData.adminName || !formData.adminEmail) {
      toast({
        title: "Error",
        description: "Please fill all required fields",
        variant: "destructive"
      });
      return;
    }

    try {
      // Create new college
      const newCollege: College = {
        id: Date.now().toString(),
        name: formData.name,
        code: formData.code,
        email: formData.email,
        phone: formData.phone,
        adminName: formData.adminName,
        adminEmail: formData.adminEmail,
        status: "active",
        studentsCount: 0,
        facultyCount: 0,
        createdAt: new Date().toISOString()
      };
      
      setColleges(prev => [...prev, newCollege]);
      
      toast({
        title: "College Created",
        description: `College ${formData.name} created successfully. Invitation sent to ${formData.adminEmail}`,
      });
      
      resetForm();
      setIsCreateModalOpen(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to create college: " + error.message,
        variant: "destructive"
      });
    }
  };

  const handleDeleteCollege = async (collegeId: string) => {
    try {
      setColleges(prev => prev.filter(college => college.id !== collegeId));
      toast({
        title: "College Deleted",
        description: "College and all associated data deleted successfully"
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to delete college: " + error.message,
        variant: "destructive"
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      code: "",
      email: "",
      phone: "",
      address: "",
      adminName: "",
      adminEmail: ""
    });
  };

  const filteredColleges = colleges.filter(college =>
    college.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    college.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    college.adminName.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Master Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage the entire educational platform</p>
        </div>
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm} className="bg-gradient-primary hover:shadow-primary">
              <Plus className="w-4 h-4 mr-2" />
              Add College
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New College</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="collegeName">College Name *</Label>
                <Input
                  id="collegeName"
                  placeholder="Enter college name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="collegeCode">College Code *</Label>
                <Input
                  id="collegeCode"
                  placeholder="e.g., PEC001"
                  value={formData.code}
                  onChange={(e) => setFormData({...formData, code: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="collegeEmail">College Email *</Label>
                <Input
                  id="collegeEmail"
                  type="email"
                  placeholder="admin@college.edu"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="collegePhone">Phone</Label>
                <Input
                  id="collegePhone"
                  placeholder="+1234567890"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                />
              </div>
              <div className="col-span-2">
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  placeholder="Enter college address"
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="adminName">Admin Name *</Label>
                <Input
                  id="adminName"
                  placeholder="Enter admin name"
                  value={formData.adminName}
                  onChange={(e) => setFormData({...formData, adminName: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="adminEmail">Admin Email *</Label>
                <Input
                  id="adminEmail"
                  type="email"
                  placeholder="admin@college.edu"
                  value={formData.adminEmail}
                  onChange={(e) => setFormData({...formData, adminEmail: e.target.value})}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateCollege}>Create College</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="dashboard" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="colleges">Colleges</TabsTrigger>
          <TabsTrigger value="exams">Exam Management</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="audit">Audit Logs</TabsTrigger>
        </TabsList>

        {/* Dashboard Tab */}
        <TabsContent value="dashboard" className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Total Colleges"
              value={platformStats.totalColleges.toString()}
              change="+2 this month"
              icon={Building}
              trend="up"
            />
            <StatCard
              title="Total Students"
              value={platformStats.totalStudents.toLocaleString()}
              change="+12% from last month"
              icon={Users}
              trend="up"
            />
            <StatCard
              title="Total Faculty"
              value={platformStats.totalFaculty.toString()}
              change="+8 new hires"
              icon={GraduationCap}
              trend="up"
            />
            <StatCard
              title="Active Users"
              value={platformStats.activeUsers.toString()}
              change="85% engagement"
              icon={TrendingUp}
              trend="up"
            />
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="hover:shadow-elevated transition-all duration-300">
              <CardHeader>
                <CardTitle>Platform Growth</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer config={{
                  students: { label: "Students", color: "#3b82f6" },
                  faculty: { label: "Faculty", color: "#10b981" },
                  colleges: { label: "Colleges", color: "#f59e0b" }
                }}>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Line type="monotone" dataKey="students" stroke="#3b82f6" strokeWidth={2} />
                      <Line type="monotone" dataKey="faculty" stroke="#10b981" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card className="hover:shadow-elevated transition-all duration-300">
              <CardHeader>
                <CardTitle>College Status Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer config={{
                  active: { label: "Active", color: "#3b82f6" },
                  inactive: { label: "Inactive", color: "#ef4444" }
                }}>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${value}%`}
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <ChartTooltip content={<ChartTooltipContent />} />
                    </PieChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card className="hover:shadow-elevated transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Recent Platform Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {auditLogs.slice(0, 5).map((log) => (
                  <div key={log.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-accent/50 transition-colors">
                    <div className={`w-2 h-2 rounded-full mt-2 ${
                      log.type === 'create' ? 'bg-success' :
                      log.type === 'update' ? 'bg-warning' :
                      log.type === 'delete' ? 'bg-destructive' : 'bg-info'
                    }`} />
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium">{log.action}</p>
                      <p className="text-xs text-muted-foreground">{log.details}</p>
                      <p className="text-xs text-muted-foreground">by {log.user} • {log.timestamp}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Colleges Tab */}
        <TabsContent value="colleges" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>College Management</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Search */}
              <div className="flex items-center space-x-2">
                <Search className="w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search colleges..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-sm"
                />
              </div>

              {/* Table */}
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>College Details</TableHead>
                    <TableHead>Admin Details</TableHead>
                    <TableHead>Statistics</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredColleges.map((college) => (
                    <TableRow key={college.id} className="hover:bg-accent/50">
                      <TableCell>
                        <div>
                          <p className="font-medium">{college.name}</p>
                          <p className="text-sm text-muted-foreground">Code: {college.code}</p>
                          <p className="text-sm text-muted-foreground">{college.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{college.adminName}</p>
                          <p className="text-sm text-muted-foreground">{college.adminEmail}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Users className="w-3 h-3" />
                            <span className="text-sm">{college.studentsCount} students</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <GraduationCap className="w-3 h-3" />
                            <span className="text-sm">{college.facultyCount} faculty</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={college.status === "active" ? "default" : "secondary"}
                          className={college.status === "active" ? "bg-success text-success-foreground" : ""}
                        >
                          {college.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(college.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteCollege(college.id)}
                          className="hover:bg-destructive hover:text-destructive-foreground"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Exams Tab */}
        <TabsContent value="exams" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Exam Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <FileText className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Exam Management</h3>
                <p className="text-muted-foreground mb-4">Create and manage exams for all colleges</p>
                <Button onClick={() => window.location.href = '/exam-creation'}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create New Exam
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Platform Notifications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Bell className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Notification Center</h3>
                <p className="text-muted-foreground mb-4">Send notifications to colleges, faculty, and students</p>
                <Button onClick={() => window.location.href = '/notifications'}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Notification
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Audit Logs Tab */}
        <TabsContent value="audit" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Audit Logs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Action</TableHead>
                    <TableHead>Details</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Timestamp</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {auditLogs.map((log) => (
                    <TableRow key={log.id} className="hover:bg-accent/50">
                      <TableCell className="font-medium">{log.action}</TableCell>
                      <TableCell>{log.details}</TableCell>
                      <TableCell>{log.user}</TableCell>
                      <TableCell>
                        <Badge variant={
                          log.type === 'create' ? 'default' :
                          log.type === 'update' ? 'secondary' :
                          log.type === 'delete' ? 'destructive' : 'outline'
                        }>
                          {log.type}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{log.timestamp}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}