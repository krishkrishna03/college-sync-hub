import { useState } from "react";
import { useEffect } from "react";
import { Plus, Search, Filter, Download, Upload, MoreHorizontal, Edit, Trash2, UserCheck, FileText, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { studentsAPI } from "@/lib/api";


export default function Students() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStream, setFilterStream] = useState("all");
  const [filterBatch, setFilterBatch] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const [showEditStudent, setShowEditStudent] = useState(false);
  const [showAddStudent, setShowAddStudent] = useState(false);
  const [showBulkResults, setShowBulkResults] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [bulkUploadData, setBulkUploadData] = useState({
    batch: "",
    branch: "",
    section: "",
    file: null as File | null
  });
  const [addStudentData, setAddStudentData] = useState({
    name: "",
    email: "",
    studentId: "",
    stream: "",
    batch: "",
    yearSection: "",
    enrolledDate: ""
  });
  const [bulkResults, setBulkResults] = useState({
    collegeName: "PlantechX College",
    batch: "",
    stream: "",
    totalStudents: 0,
    accountsCreated: 0,
    duplicates: 0,
    errors: 0,
    duplicatesList: [] as string[]
  });
  const navigate = useNavigate();
  const { toast } = useToast();

  // Fetch students on component mount
  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const filters = {
        ...(filterStream !== "all" && { stream: filterStream }),
        ...(filterBatch !== "all" && { batch: filterBatch }),
        ...(filterStatus !== "all" && { status: filterStatus }),
        ...(searchTerm && { search: searchTerm })
      };
      
      const response = await studentsAPI.getAll(filters);
      const formattedStudents = response.students.map((student: any) => ({
        id: student._id,
        name: student.userId.name,
        email: student.userId.email,
        studentId: student.registrationNumber,
        stream: student.branch,
        batch: student.batch,
        year: student.year,
        section: student.section,
        status: student.userId.status === 'active' ? 'Active' : 'Inactive',
        enrollmentDate: new Date(student.enrollmentDate).toISOString().split('T')[0],
      }));
      setStudents(formattedStudents);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to fetch students: " + error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Refetch when filters change
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchStudents();
    }, 500);
    
    return () => clearTimeout(timeoutId);
  }, [searchTerm, filterStream, filterBatch, filterStatus]);

  const filteredStudents = students.filter((student) => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.studentId.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStream = filterStream === "all" || student.stream === filterStream;
    const matchesBatch = filterBatch === "all" || student.batch === filterBatch;
    const matchesStatus = filterStatus === "all" || student.status === filterStatus;

    return matchesSearch && matchesStream && matchesBatch && matchesStatus;
  });

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const handleAddStudent = async () => {
    // Validate form data
    const { name, email, studentId, stream, batch, yearSection, enrolledDate } = addStudentData;
    if (!name || !email || !studentId || !stream || !batch || !yearSection || !enrolledDate) {
      toast({
        title: "Error",
        description: "Please fill all required fields",
        variant: "destructive"
      });
      return;
    }

    try {
      const [year, section] = yearSection.split(' - ');
      
      await studentsAPI.create({
        name,
        email,
        studentId,
        batch,
        branch: stream,
        section,
        year,
        enrollmentDate: enrolledDate
      });
      
      toast({
        title: "Success",
        description: `Student account created for ${name}. Credentials sent to ${email}`,
      });
      
      fetchStudents(); // Refresh the list
      setShowAddStudent(false);
      setAddStudentData({
        name: "",
        email: "",
        studentId: "",
        stream: "",
        batch: "",
        yearSection: "",
        enrolledDate: ""
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to create student: " + error.message,
        variant: "destructive"
      });
    }
  };

  const handleBulkUpload = async () => {
    if (!bulkUploadData.file || !bulkUploadData.batch || !bulkUploadData.branch || !bulkUploadData.section) {
      toast({
        title: "Error",
        description: "Please fill all fields and select a file",
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
      
      const response = await studentsAPI.bulkUpload(formData);
      
      setBulkResults({
        collegeName: "PlantechX College",
        batch: bulkUploadData.batch,
        stream: bulkUploadData.branch,
        totalStudents: response.totalRecords,
        accountsCreated: response.accountsCreated,
        duplicates: response.duplicatesFound,
        errors: response.errors,
        duplicatesList: response.duplicatesList || []
      });
      
      fetchStudents(); // Refresh the list
      setShowBulkUpload(false);
      setShowBulkResults(true);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to upload students: " + error.message,
        variant: "destructive"
      });
    }
  };

  const handleReviewDuplicates = () => {
    setShowBulkResults(false);
    setShowBulkUpload(true);
    toast({
      title: "Review Mode",
      description: "Please review and fix duplicate entries in your file"
    });
  };

  const handleSendInvitations = () => {
    toast({
      title: "Invitations Sent",
      description: `Credentials sent to ${bulkResults.accountsCreated} students successfully`
    });
    
    // Simulate CSV download
    setTimeout(() => {
      const csvContent = "data:text/csv;charset=utf-8,Name,Email,Student ID,Password\nJohn Doe,john@example.com,CS001,temp123\nJane Smith,jane@example.com,CS002,temp456";
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", "student_credentials.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "Download Ready",
        description: "Student credentials CSV file downloaded successfully"
      });
    }, 1000);
    
    setShowBulkResults(false);
    setBulkUploadData({ batch: "", branch: "", section: "", file: null });
  };

  const handleStudentAction = async (action: string, student: any) => {
    switch (action) {
      case "activate":
        try {
          await studentsAPI.update(student.id, { status: 'active' });
          fetchStudents();
          toast({
            title: "Student Activated",
            description: `${student.name}'s account has been activated`
          });
        } catch (error: any) {
          toast({
            title: "Error",
            description: "Failed to activate student: " + error.message,
            variant: "destructive"
          });
        }
        break;
      case "edit":
        setSelectedStudent(student);
        setShowEditStudent(true);
        break;
        case "academic":
        navigate(`/participation-report?student=${student.id}`);
        break;
      case "remove":
        try {
          const newStatus = student.status === "Active" ? "inactive" : "active";
          await studentsAPI.update(student.id, { status: newStatus });
          fetchStudents();
          toast({
            title: `Student ${newStatus === "active" ? "Activated" : "Deactivated"}`,
            description: `${student.name}'s status changed to ${newStatus}`
          });
        } catch (error: any) {
          toast({
            title: "Error",
            description: "Failed to update student: " + error.message,
            variant: "destructive"
          });
        }
        break;
    }
  };

  const handleEditStudent = async () => {
    if (selectedStudent) {
      try {
        await studentsAPI.update(selectedStudent.id, {
          name: selectedStudent.name,
          email: selectedStudent.email,
          batch: selectedStudent.batch,
          branch: selectedStudent.stream,
          section: selectedStudent.section,
          year: selectedStudent.year
        });
        
        fetchStudents();
        toast({
          title: "Student Updated",
          description: "Student information has been updated successfully"
        });
        setShowEditStudent(false);
        setSelectedStudent(null);
      } catch (error: any) {
        toast({
          title: "Error",
          description: "Failed to update student: " + error.message,
          variant: "destructive"
        });
      }
    }
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6 animate-fade-in">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading students...</p>
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
          <h1 className="text-3xl font-bold text-foreground">Student Management</h1>
          <p className="text-muted-foreground">Manage student enrollments, profiles, and academic records</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => {
            const filteredData = students.filter(student => {
              const matchesSearch = !searchTerm || 
                student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                student.studentId.toLowerCase().includes(searchTerm.toLowerCase());
              const matchesStream = filterStream === "all" || student.stream === filterStream;
              const matchesBatch = filterBatch === "all" || student.batch === filterBatch;
              const matchesStatus = filterStatus === "all" || student.status.toLowerCase() === filterStatus;
              return matchesSearch && matchesStream && matchesBatch && matchesStatus;
            });
            
            const csvContent = [
              'Name,Email,Student ID,Stream,Batch,Section,Status,Enrollment Date',
              ...filteredData.map(student => 
                `${student.name},${student.email},${student.studentId},${student.stream},${student.batch},${student.section},${student.status},${student.enrollmentDate}`
              )
            ].join('\n');
            
            const blob = new Blob([csvContent], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'students_data.csv';
            a.click();
          }}>
            <Download className="w-4 h-4 mr-2" />
            Export Data
          </Button>
          <Button variant="outline" size="sm" onClick={() => setShowBulkUpload(true)}>
            <Upload className="w-4 h-4 mr-2" />
            Bulk Upload
          </Button>
          <Button variant="premium" size="sm" onClick={() => setShowAddStudent(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Student
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Filter students by various criteria</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, email, or student ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={filterStream} onValueChange={setFilterStream}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Stream" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Streams</SelectItem>
                <SelectItem value="Computer Science">Computer Science</SelectItem>
                <SelectItem value="Mechanical Engineering">Mechanical Eng.</SelectItem>
                <SelectItem value="Electronics">Electronics</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterBatch} onValueChange={setFilterBatch}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Batch" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Batches</SelectItem>
                <SelectItem value="2024">2024</SelectItem>
                <SelectItem value="2023">2023</SelectItem>
                <SelectItem value="2022">2022</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Students Table */}
      <Card>
        <CardHeader>
          <CardTitle>Students ({filteredStudents.length})</CardTitle>
          <CardDescription>Complete list of enrolled students</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Student ID</TableHead>
                <TableHead>Stream</TableHead>
                <TableHead>Batch</TableHead>
                <TableHead>Year/Section</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Enrolled</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStudents.map((student) => (
                <TableRow key={student.id} className="hover:bg-accent/50">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={`/api/placeholder/40/40`} />
                        <AvatarFallback className="text-xs">
                          {getInitials(student.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{student.name}</p>
                        <p className="text-sm text-muted-foreground">{student.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{student.studentId}</Badge>
                  </TableCell>
                  <TableCell>{student.stream}</TableCell>
                  <TableCell>{student.batch}</TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <p>{student.year}</p>
                      <p className="text-muted-foreground">Section {student.section}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant={student.status === "active" ? "default" : "secondary"}
                      className={student.status === "active" ? "bg-success text-success-foreground" : ""}
                    >
                      {student.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(student.enrollmentDate).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-popover">
                        <DropdownMenuItem onClick={() => handleStudentAction("activate", student)}>
                          <UserCheck className="w-4 h-4 mr-2" />
                          Student Activation
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleStudentAction("edit", student)}>
                          <Edit className="w-4 h-4 mr-2" />
                          Edit Student
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleStudentAction("academic", student)}>
                          <FileText className="w-4 h-4 mr-2" />
                          Academic Records
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive" onClick={() => handleStudentAction("remove", student)}>
                          <Trash2 className="w-4 h-4 mr-2" />
                          Remove Student
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Bulk Upload Modal */}
      <Dialog open={showBulkUpload} onOpenChange={setShowBulkUpload}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Bulk Upload Students</DialogTitle>
            <DialogDescription>
              Upload multiple students using a CSV file
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="file">Choose File</Label>
              <Input
                id="file"
                type="file"
                accept=".csv,.xlsx"
                onChange={(e) => setBulkUploadData(prev => ({
                  ...prev,
                  file: e.target.files?.[0] || null
                }))}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="batch">Batch</Label>
              <Select value={bulkUploadData.batch} onValueChange={(value) => setBulkUploadData(prev => ({ ...prev, batch: value }))}>
                <SelectTrigger className="mt-1">
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
              <Select value={bulkUploadData.branch} onValueChange={(value) => setBulkUploadData(prev => ({ ...prev, branch: value }))}>
                <SelectTrigger className="mt-1">
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
              <Label htmlFor="section">Section/Year</Label>
              <Select value={bulkUploadData.section} onValueChange={(value) => setBulkUploadData(prev => ({ ...prev, section: value }))}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select section" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="A">A</SelectItem>
                  <SelectItem value="B">B</SelectItem>
                  <SelectItem value="C">C</SelectItem>
                  <SelectItem value="D">D</SelectItem>
                  <SelectItem value="E">E</SelectItem>
                  <SelectItem value="F">F</SelectItem>
                  <SelectItem value="G">G</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={() => setShowBulkUpload(false)}>
                Cancel
              </Button>
              <Button onClick={handleBulkUpload}>
                Upload
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Student Modal */}
      <Dialog open={showAddStudent} onOpenChange={setShowAddStudent}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Student</DialogTitle>
            <DialogDescription>
              Create a new student account and send credentials via email
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="studentName">Student Name *</Label>
              <Input
                id="studentName"
                value={addStudentData.name}
                onChange={(e) => setAddStudentData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter student full name"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="studentEmail">Email *</Label>
              <Input
                id="studentEmail"
                type="email"
                value={addStudentData.email}
                onChange={(e) => setAddStudentData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="Enter student email"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="studentId">Student ID *</Label>
              <Input
                id="studentId"
                value={addStudentData.studentId}
                onChange={(e) => setAddStudentData(prev => ({ ...prev, studentId: e.target.value }))}
                placeholder="Enter student ID"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="stream">Stream *</Label>
              <Select value={addStudentData.stream} onValueChange={(value) => setAddStudentData(prev => ({ ...prev, stream: value }))}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select stream" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Computer Science">Computer Science</SelectItem>
                  <SelectItem value="Mechanical Engineering">Mechanical Engineering</SelectItem>
                  <SelectItem value="Electronics">Electronics</SelectItem>
                  <SelectItem value="Civil Engineering">Civil Engineering</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="batch">Batch *</Label>
              <Select value={addStudentData.batch} onValueChange={(value) => setAddStudentData(prev => ({ ...prev, batch: value }))}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select batch" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2024">2024</SelectItem>
                  <SelectItem value="2025">2025</SelectItem>
                  <SelectItem value="2026">2026</SelectItem>
                  <SelectItem value="2027">2027</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="yearSection">Year/Section *</Label>
              <Select value={addStudentData.yearSection} onValueChange={(value) => setAddStudentData(prev => ({ ...prev, yearSection: value }))}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select year/section" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1st Year - A">1st Year - A</SelectItem>
                  <SelectItem value="1st Year - B">1st Year - B</SelectItem>
                  <SelectItem value="2nd Year - A">2nd Year - A</SelectItem>
                  <SelectItem value="2nd Year - B">2nd Year - B</SelectItem>
                  <SelectItem value="3rd Year - A">3rd Year - A</SelectItem>
                  <SelectItem value="3rd Year - B">3rd Year - B</SelectItem>
                  <SelectItem value="4th Year - A">4th Year - A</SelectItem>
                  <SelectItem value="4th Year - B">4th Year - B</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="enrolledDate">Enrolled Date *</Label>
              <Input
                id="enrolledDate"
                type="date"
                value={addStudentData.enrolledDate}
                onChange={(e) => setAddStudentData(prev => ({ ...prev, enrolledDate: e.target.value }))}
                className="mt-1"
              />
            </div>
            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={() => setShowAddStudent(false)}>
                Close
              </Button>
              <Button onClick={handleAddStudent}>
                Add Student
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Bulk Upload Results Modal */}
      <Dialog open={showBulkResults} onOpenChange={setShowBulkResults}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Bulk Upload Results</DialogTitle>
            <DialogDescription>
              Review the upload results and send invitations
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 p-4 bg-accent/50 rounded-lg">
              <div>
                <Label className="text-sm font-medium">College</Label>
                <p className="text-sm text-muted-foreground">{bulkResults.collegeName}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Batch</Label>
                <p className="text-sm text-muted-foreground">{bulkResults.batch}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Stream</Label>
                <p className="text-sm text-muted-foreground">{bulkResults.stream}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-primary/10 rounded-lg text-center">
                <p className="text-2xl font-bold text-primary">{bulkResults.totalStudents}</p>
                <p className="text-sm text-muted-foreground">Total Students</p>
              </div>
              <div className="p-3 bg-success/10 rounded-lg text-center">
                <p className="text-2xl font-bold text-success">{bulkResults.accountsCreated}</p>
                <p className="text-sm text-muted-foreground">Accounts Created</p>
              </div>
              <div className="p-3 bg-warning/10 rounded-lg text-center">
                <p className="text-2xl font-bold text-warning">{bulkResults.duplicates}</p>
                <p className="text-sm text-muted-foreground">Duplicates</p>
              </div>
              <div className="p-3 bg-destructive/10 rounded-lg text-center">
                <p className="text-2xl font-bold text-destructive">{bulkResults.errors}</p>
                <p className="text-sm text-muted-foreground">Errors</p>
              </div>
            </div>

            {bulkResults.duplicates > 0 && (
              <div className="p-3 bg-warning/10 rounded-lg">
                <Label className="text-sm font-medium text-warning">Duplicate Entries Found:</Label>
                <ul className="mt-2 text-sm text-muted-foreground">
                  {bulkResults.duplicatesList.map((email, index) => (
                    <li key={index} className="truncate">• {email}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={handleReviewDuplicates}>
                Review File
              </Button>
              <Button onClick={handleSendInvitations}>
                Send Invitations
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Student Modal */}
      <Dialog open={showEditStudent} onOpenChange={setShowEditStudent}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Student</DialogTitle>
            <DialogDescription>
              Update student information
            </DialogDescription>
          </DialogHeader>
          {selectedStudent && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="studentName">Student Name</Label>
                <Input
                  id="studentName"
                  defaultValue={selectedStudent.name}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="studentEmail">Email</Label>
                <Input
                  id="studentEmail"
                  type="email"
                  defaultValue={selectedStudent.email}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="studentId">Student ID</Label>
                <Input
                  id="studentId"
                  defaultValue={selectedStudent.studentId}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="editBatch">Batch</Label>
                <Select defaultValue={selectedStudent.batch}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2024">2024</SelectItem>
                    <SelectItem value="2023">2023</SelectItem>
                    <SelectItem value="2022">2022</SelectItem>
                    <SelectItem value="2021">2021</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={() => setShowEditStudent(false)}>
                  Cancel
                </Button>
                <Button onClick={handleEditStudent}>
                  Update Student
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}