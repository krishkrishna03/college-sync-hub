import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Search, Edit, Trash2, Building, Users, GraduationCap, School } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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

export default function AdminDashboard() {
  const { toast } = useToast();
  const [colleges, setColleges] = useState<College[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedCollege, setSelectedCollege] = useState<College | null>(null);
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
    fetchColleges();
  }, []);

  const fetchColleges = async () => {
    try {
      setLoading(true);
      // Mock data for now - replace with actual API call
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
        }
      ];
      setColleges(mockColleges);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to fetch colleges: " + error.message,
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
      // API call would go here
      toast({
        title: "College Created",
        description: `College ${formData.name} created successfully. Invitation sent to ${formData.adminEmail}`,
      });
      
      fetchColleges();
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

  const handleEditCollege = async () => {
    if (!selectedCollege) return;

    try {
      // API call would go here
      toast({
        title: "College Updated",
        description: "College information updated successfully"
      });
      
      fetchColleges();
      setIsEditModalOpen(false);
      setSelectedCollege(null);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to update college: " + error.message,
        variant: "destructive"
      });
    }
  };

  const handleDeleteCollege = async (collegeId: string) => {
    try {
      // API call would go here
      toast({
        title: "College Deleted",
        description: "College and all associated data deleted successfully"
      });
      fetchColleges();
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to delete college: " + error.message,
        variant: "destructive"
      });
    }
  };

  const handleToggleStatus = async (collegeId: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === "active" ? "inactive" : "active";
      // API call would go here
      toast({
        title: "Status Updated",
        description: `College status changed to ${newStatus}`
      });
      fetchColleges();
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to update status: " + error.message,
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

  const openEditModal = (college: College) => {
    setSelectedCollege(college);
    setFormData({
      name: college.name,
      code: college.code,
      email: college.email,
      phone: college.phone,
      address: "",
      adminName: college.adminName,
      adminEmail: college.adminEmail
    });
    setIsEditModalOpen(true);
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
            <p className="text-muted-foreground">Loading colleges...</p>
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
          <h1 className="text-3xl font-bold text-foreground">Master Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage colleges and their administrators</p>
        </div>
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
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

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Colleges</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{colleges.length}</div>
            <p className="text-xs text-muted-foreground">Active institutions</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {colleges.reduce((sum, college) => sum + college.studentsCount, 0)}
            </div>
            <p className="text-xs text-muted-foreground">Across all colleges</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Faculty</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {colleges.reduce((sum, college) => sum + college.facultyCount, 0)}
            </div>
            <p className="text-xs text-muted-foreground">Teaching staff</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Colleges</CardTitle>
            <School className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {colleges.filter(c => c.status === "active").length}
            </div>
            <p className="text-xs text-muted-foreground">Currently operational</p>
          </CardContent>
        </Card>
      </div>

      {/* Colleges Management */}
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
                <TableRow key={college.id}>
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
                      className="cursor-pointer"
                      onClick={() => handleToggleStatus(college.id, college.status)}
                    >
                      {college.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(college.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditModal(college)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteCollege(college.id)}
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

      {/* Edit College Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit College</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="editCollegeName">College Name *</Label>
              <Input
                id="editCollegeName"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="editCollegeCode">College Code *</Label>
              <Input
                id="editCollegeCode"
                value={formData.code}
                onChange={(e) => setFormData({...formData, code: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="editCollegeEmail">College Email *</Label>
              <Input
                id="editCollegeEmail"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="editCollegePhone">Phone</Label>
              <Input
                id="editCollegePhone"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
              />
            </div>
            <div className="col-span-2">
              <Label htmlFor="editAddress">Address</Label>
              <Textarea
                id="editAddress"
                value={formData.address}
                onChange={(e) => setFormData({...formData, address: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="editAdminName">Admin Name *</Label>
              <Input
                id="editAdminName"
                value={formData.adminName}
                onChange={(e) => setFormData({...formData, adminName: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="editAdminEmail">Admin Email *</Label>
              <Input
                id="editAdminEmail"
                type="email"
                value={formData.adminEmail}
                onChange={(e) => setFormData({...formData, adminEmail: e.target.value})}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditCollege}>Update College</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}