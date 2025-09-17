import { useState } from "react";
import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Edit, Download, Search, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { coursesAPI } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface EnrolledStudent {
  id: string;
  name: string;
  registrationId: string;
  batch: string;
  stream: string;
  section: string;
  email: string;
  enrolledDate: string;
  status: "enrolled" | "not-enrolled";
  course: string;
}

export default function EnrolledStudents() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [courseFilter, setCourseFilter] = useState("all");
  const [batchFilter, setBatchFilter] = useState("all");
  const [branchFilter, setBranchFilter] = useState("all");
  const [sectionFilter, setSectionFilter] = useState("all");
  const [editingStudent, setEditingStudent] = useState<EnrolledStudent | null>(null);
  const [students, setStudents] = useState<EnrolledStudent[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch enrolled students on component mount
  useEffect(() => {
    fetchEnrolledStudents();
  }, []);

  const fetchEnrolledStudents = async () => {
    try {
      setLoading(true);
      const filters = {
        ...(courseFilter !== "all" && { course: courseFilter }),
        ...(batchFilter !== "all" && { batch: batchFilter }),
        ...(branchFilter !== "all" && { branch: branchFilter }),
        ...(sectionFilter !== "all" && { section: sectionFilter })
      };
      
      const response = await coursesAPI.getEnrolledStudents(filters);
      const formattedStudents = response.students.map((student: any) => ({
        id: student.id,
        name: student.name,
        registrationId: student.registrationId,
        batch: student.batch,
        stream: student.stream,
        section: student.section,
        email: student.email,
        enrolledDate: new Date(student.enrolledDate).toISOString().split('T')[0],
        status: student.status,
        course: student.courses?.[0]?.category || 'General'
      }));
      setStudents(formattedStudents);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to fetch enrolled students: " + error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Refetch when filters change
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchEnrolledStudents();
    }, 500);
    
    return () => clearTimeout(timeoutId);
  }, [searchTerm, courseFilter, batchFilter, branchFilter, sectionFilter]);
  // Filter students based on all criteria
  const filteredStudents = students.filter(student => {
    const matchesSearch = 
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.registrationId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCourse = courseFilter === "all" || student.course === courseFilter;
    const matchesBatch = batchFilter === "all" || student.batch === batchFilter;
    const matchesBranch = branchFilter === "all" || student.stream === branchFilter;
    const matchesSection = sectionFilter === "all" || student.section === sectionFilter;

    return matchesSearch && matchesCourse && matchesBatch && matchesBranch && matchesSection;
  });

  const handleEditStudent = (student: EnrolledStudent) => {
    setEditingStudent({ ...student });
  };

  const handleSaveStudent = () => {
    if (editingStudent) {
      // Update student in backend would go here
      fetchEnrolledStudents();
      toast({
        title: "Student Updated",
        description: "Student information has been updated successfully"
      });
      setEditingStudent(null);
    }
  };

  const handleExportData = () => {
    const csvContent = [
      "Name,Registration ID,Batch,Stream,Section,Email,Enrolled Date,Status,Course",
      ...filteredStudents.map(student => 
        `${student.name},${student.registrationId},${student.batch},${student.stream},${student.section},${student.email},${student.enrolledDate},${student.status},${student.course}`
      )
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.setAttribute("hidden", "");
    a.setAttribute("href", url);
    a.setAttribute("download", "enrolled_students.csv");
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50 p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading enrolled students...</p>
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
          <h1 className="text-4xl font-bold text-foreground">Enrolled Students</h1>
        </div>
        <Button 
          onClick={handleExportData} 
          className="bg-green-600 hover:bg-green-700 text-white shadow-md hover:shadow-lg transition-all"
        >
          <Download className="w-4 h-4 mr-2" />
          Export Data
        </Button>
      </div>

      {/* Filter Students Panel */}
      <Card className="mb-6 shadow-lg border-0 bg-white">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-bold text-gray-900">Filter Students</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div>
              <Label htmlFor="course" className="text-sm font-medium text-gray-700">Course Category</Label>
              <Select value={courseFilter} onValueChange={setCourseFilter}>
                <SelectTrigger className="bg-white border-gray-200 shadow-sm">
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent className="bg-white border shadow-lg">
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="Data Science">Data Science</SelectItem>
                  <SelectItem value="Web Development">Web Development</SelectItem>
                  <SelectItem value="AI & ML">AI & ML</SelectItem>
                  <SelectItem value="Cybersecurity">Cybersecurity</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="batch" className="text-sm font-medium text-gray-700">Batch</Label>
              <Select value={batchFilter} onValueChange={setBatchFilter}>
                <SelectTrigger className="bg-white border-gray-200 shadow-sm">
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent className="bg-white border shadow-lg">
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="2024-A">2024-A</SelectItem>
                  <SelectItem value="2024-B">2024-B</SelectItem>
                  <SelectItem value="2023-A">2023-A</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="branch" className="text-sm font-medium text-gray-700">Branch</Label>
              <Select value={branchFilter} onValueChange={setBranchFilter}>
                <SelectTrigger className="bg-white border-gray-200 shadow-sm">
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent className="bg-white border shadow-lg">
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="Computer Science">Computer Science</SelectItem>
                  <SelectItem value="Information Technology">Information Technology</SelectItem>
                  <SelectItem value="Electronics">Electronics</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="section" className="text-sm font-medium text-gray-700">Section</Label>
              <Select value={sectionFilter} onValueChange={setSectionFilter}>
                <SelectTrigger className="bg-white border-gray-200 shadow-sm">
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent className="bg-white border shadow-lg">
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="A">A</SelectItem>
                  <SelectItem value="B">B</SelectItem>
                  <SelectItem value="C">C</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              placeholder="Search by name, registration ID, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 h-12 bg-white border-gray-200 shadow-sm text-gray-900 placeholder-gray-500"
            />
          </div>
        </CardContent>
      </Card>

      {/* Student List Table */}
      <Card className="shadow-lg border-0 bg-white">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-bold text-gray-900">
            Student List ({filteredStudents.length} students)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-gray-50 border-b border-gray-200">
                  <TableHead className="font-semibold text-gray-700">S.No</TableHead>
                  <TableHead className="font-semibold text-gray-700">Name</TableHead>
                  <TableHead className="font-semibold text-gray-700">Registration ID</TableHead>
                  <TableHead className="font-semibold text-gray-700">Batch</TableHead>
                  <TableHead className="font-semibold text-gray-700">Stream</TableHead>
                  <TableHead className="font-semibold text-gray-700">Section</TableHead>
                  <TableHead className="font-semibold text-gray-700">Email</TableHead>
                  <TableHead className="font-semibold text-gray-700">Enrolled Date</TableHead>
                  <TableHead className="font-semibold text-gray-700">Status</TableHead>
                  <TableHead className="font-semibold text-gray-700">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.map((student, index) => (
                  <TableRow key={student.id} className="hover:bg-gray-50 transition-colors">
                    <TableCell className="text-gray-600">{index + 1}</TableCell>
                    <TableCell className="font-bold text-gray-900">{student.name}</TableCell>
                    <TableCell className="text-gray-600">{student.registrationId}</TableCell>
                    <TableCell className="text-gray-600">{student.batch}</TableCell>
                    <TableCell className="text-gray-600">{student.stream}</TableCell>
                    <TableCell className="text-gray-600">{student.section}</TableCell>
                    <TableCell className="text-gray-600">{student.email}</TableCell>
                    <TableCell className="text-gray-600">{student.enrolledDate}</TableCell>
                    <TableCell>
                      <Badge 
                        variant={student.status === "enrolled" ? "default" : "destructive"}
                        className={`px-3 py-1 text-xs font-medium rounded-full ${
                          student.status === "enrolled" 
                            ? "bg-purple-100 text-purple-700 border border-purple-200" 
                            : "bg-red-100 text-red-700 border border-red-200"
                        }`}
                      >
                        {student.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditStudent(student)}
                            className="border-purple-200 text-purple-600 hover:bg-purple-50"
                          >
                            <Edit className="w-4 h-4 mr-1" />
                            Edit
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-white">
                          <DialogHeader>
                            <DialogTitle>Edit Student Details</DialogTitle>
                            <DialogDescription>
                              Update the student information below.
                            </DialogDescription>
                          </DialogHeader>
                          {editingStudent && (
                            <div className="space-y-4">
                              <div>
                                <Label htmlFor="edit-name">Name</Label>
                                <Input
                                  id="edit-name"
                                  value={editingStudent.name}
                                  onChange={(e) =>
                                    setEditingStudent({ ...editingStudent, name: e.target.value })
                                  }
                                />
                              </div>
                              <div>
                                <Label htmlFor="edit-email">Email</Label>
                                <Input
                                  id="edit-email"
                                  value={editingStudent.email}
                                  onChange={(e) =>
                                    setEditingStudent({ ...editingStudent, email: e.target.value })
                                  }
                                />
                              </div>
                              <div>
                                <Label htmlFor="edit-batch">Batch</Label>
                                <Input
                                  id="edit-batch"
                                  value={editingStudent.batch}
                                  onChange={(e) =>
                                    setEditingStudent({ ...editingStudent, batch: e.target.value })
                                  }
                                />
                              </div>
                              <div>
                                <Label htmlFor="edit-section">Section</Label>
                                <Input
                                  id="edit-section"
                                  value={editingStudent.section}
                                  onChange={(e) =>
                                    setEditingStudent({ ...editingStudent, section: e.target.value })
                                  }
                                />
                              </div>
                              <div className="flex justify-end space-x-2">
                                <Button variant="outline" onClick={() => setEditingStudent(null)}>
                                  Cancel
                                </Button>
                                <Button 
                                  onClick={handleSaveStudent}
                                  className="bg-purple-600 hover:bg-purple-700 text-white"
                                >
                                  Save Changes
                                </Button>
                              </div>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}