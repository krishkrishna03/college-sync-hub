import { useState } from "react";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Search, Edit, Trash2, Eye, Upload, UserCheck, UserCog, ClipboardList, UserX } from "lucide-react";
import { BulkUploadModal, BulkResultsModal } from "@/components/BulkUploadModal";
import { useToast } from "@/hooks/use-toast";
import { facultyAPI } from "@/lib/api";

interface Faculty {
  id: number;
  name: string;
  email: string;
  facultyId: string;
  mobile: string;
  branchName: string;
  status: "Active" | "Inactive";
}

export default function FacultyManagement() {
  const { toast } = useToast();
  const [faculty, setFaculty] = useState<Faculty[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBranch, setSelectedBranch] = useState<string>("");
  const [selectedSection, setSelectedSection] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isBulkUploadOpen, setIsBulkUploadOpen] = useState(false);
  const [showBulkResults, setShowBulkResults] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [selectedFaculty, setSelectedFaculty] = useState<Faculty | null>(null);
  const [newFaculty, setNewFaculty] = useState({
    name: "",
    email: "",
    facultyId: "",
    mobile: "",
    branchName: ""
  });
  const [taskData, setTaskData] = useState({
    batches: [] as string[],
    branches: [] as string[],
    sections: [] as string[],
    description: ""
  });
  const [bulkResults, setBulkResults] = useState({
    totalRecords: 0,
    accountsCreated: 0,
    duplicatesFound: 0,
    errors: 0,
    facultyData: [] as Array<{
      name: string;
      email: string;
      facultyId: string;
      branch: string;
      mobile: string;
    }>
  });

  const batches = ["2024", "2025", "2026"];
  const branches = ["EEE", "CSE", "IT"];
  const sections = ["All", "A", "B", "C"];

  // Fetch faculty on component mount
  useEffect(() => {
    fetchFaculty();
  }, []);

  const fetchFaculty = async () => {
    try {
      setLoading(true);
      const filters = {
        ...(searchTerm && { search: searchTerm }),
        ...(selectedStatus !== "all" && { status: selectedStatus })
      };
      
      const response = await facultyAPI.getAll(filters);
      const formattedFaculty = response.faculty.map((faculty: any) => ({
        id: faculty._id,
        name: faculty.userId.name,
        email: faculty.userId.email,
        facultyId: faculty.facultyId,
        mobile: faculty.userId.profile?.phone || '',
        branchName: faculty.department,
        status: faculty.userId.status === 'active' ? 'Active' : 'Inactive',
      }));
      setFaculty(formattedFaculty);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to fetch faculty: " + error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Refetch when search term changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchFaculty();
    }, 500);
    
    return () => clearTimeout(timeoutId);
  }, [searchTerm, selectedStatus]);

  const filteredFaculty = faculty.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.facultyId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !selectedStatus || selectedStatus === "all" || member.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const handleAddFaculty = async () => {
    if (newFaculty.name && newFaculty.email && newFaculty.facultyId) {
      try {
        const response = await facultyAPI.create({
          name: newFaculty.name,
          email: newFaculty.email,
          facultyId: newFaculty.facultyId,
          mobile: newFaculty.mobile,
          department: newFaculty.branchName,
          designation: 'Faculty'
        });
        
        toast({
          title: "Faculty Account Created",
          description: `Account created successfully. Credentials sent to ${newFaculty.email}`
        });

        fetchFaculty(); // Refresh the list
        setNewFaculty({
          name: "",
          email: "",
          facultyId: "",
          mobile: "",
          branchName: ""
        });
        setIsAddModalOpen(false);
      } catch (error: any) {
        toast({
          title: "Error",
          description: "Failed to create faculty: " + error.message,
          variant: "destructive"
        });
      }
    }
  };

  const handleEditFaculty = async () => {
    if (selectedFaculty && newFaculty.name && newFaculty.email && newFaculty.facultyId) {
      try {
        await facultyAPI.update(selectedFaculty.id, {
          name: newFaculty.name,
          email: newFaculty.email,
          department: newFaculty.branchName,
          mobile: newFaculty.mobile
        });
        
        fetchFaculty();
        toast({
          title: "Faculty Updated",
          description: "Faculty information has been updated successfully"
        });
        setIsEditModalOpen(false);
        setSelectedFaculty(null);
      } catch (error: any) {
        toast({
          title: "Error",
          description: "Failed to update faculty: " + error.message,
          variant: "destructive"
        });
      }
    }
  };

  const handleFacultyActivation = async (id: number) => {
    const member = faculty.find(f => f.id === id);
    if (!member) return;
    
    try {
      const newStatus = member.status === "Active" ? "inactive" : "active";
      await facultyAPI.update(id.toString(), { status: newStatus });
      
      fetchFaculty();
      toast({
        title: `Faculty ${newStatus === "active" ? "Activated" : "Deactivated"}`,
        description: `${member.name}'s status changed to ${newStatus}`
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to update faculty status: " + error.message,
        variant: "destructive"
      });
    }
  };

  const handleRemoveFaculty = async (id: number) => {
    try {
      await facultyAPI.delete(id.toString());
      fetchFaculty();
      toast({
        title: "Faculty Removed",
        description: "Faculty member has been removed successfully"
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to remove faculty: " + error.message,
        variant: "destructive"
      });
    }
  };

  const handleBulkUploadFile = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await facultyAPI.bulkUpload(formData);
      setBulkResults(response);
      fetchFaculty(); // Refresh the list
      setIsBulkUploadOpen(false);
      setShowBulkResults(true);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to upload faculty: " + error.message,
        variant: "destructive"
      });
    }
  };

  const handleReviewDuplicates = () => {
    setShowBulkResults(false);
    setIsBulkUploadOpen(true);
    toast({
      title: "Review Mode",
      description: "Please review and fix duplicate entries in your file"
    });
  };

  const handleSendInvitations = () => {
    toast({
      title: "Sending Invitations",
      description: `Credentials sent to ${bulkResults.accountsCreated} faculty members successfully`
    });
    
    // Generate CSV download
    const csvContent = "data:text/csv;charset=utf-8,Name,Email,Faculty ID,Password,Branch,Mobile\n" + 
      bulkResults.facultyData.map(f => `${f.name},${f.email},${f.facultyId},${f.tempPassword || 'temp123'},${f.branch},${f.mobile}`).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "faculty_credentials.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    setShowBulkResults(false);
  };

  const handleTaskAssignment = async () => {
    if (taskData.description && selectedFaculty) {
      try {
        await facultyAPI.assignTask(selectedFaculty.id.toString(), {
          title: "Task Assignment",
          description: taskData.description,
          batches: taskData.batches,
          branches: taskData.branches,
          sections: taskData.sections,
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
        });
        
        toast({
          title: "Task Assigned",
          description: `Task assigned to ${selectedFaculty.name} successfully`
        });
        
        setIsTaskModalOpen(false);
        setTaskData({
          batches: [],
          branches: [],
          sections: [],
          description: ""
        });
        setSelectedFaculty(null);
      } catch (error: any) {
        toast({
          title: "Error",
          description: "Failed to assign task: " + error.message,
          variant: "destructive"
        });
      }
    }
  };

  const openEditModal = (member: Faculty) => {
    setSelectedFaculty(member);
    setNewFaculty({
      name: member.name,
      email: member.email,
      facultyId: member.facultyId,
      mobile: member.mobile,
      branchName: member.branchName
    });
    setIsEditModalOpen(true);
  };

  const openTaskModal = (member: Faculty) => {
    setSelectedFaculty(member);
    setIsTaskModalOpen(true);
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading faculty...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Faculty Management
            <div className="flex space-x-2">
              <Button variant="outline" onClick={() => setIsBulkUploadOpen(true)}>
                <Upload className="w-4 h-4 mr-2" />
                Bulk Upload
              </Button>
              <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Faculty
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Add New Faculty</DialogTitle>
                  </DialogHeader>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Name</Label>
                      <Input
                        id="name"
                        placeholder="Faculty name"
                        value={newFaculty.name}
                        onChange={(e) => setNewFaculty({...newFaculty, name: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="faculty@college.edu"
                        value={newFaculty.email}
                        onChange={(e) => setNewFaculty({...newFaculty, email: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="facultyId">Faculty ID</Label>
                      <Input
                        id="facultyId"
                        placeholder="FAC001"
                        value={newFaculty.facultyId}
                        onChange={(e) => setNewFaculty({...newFaculty, facultyId: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="mobile">Mobile</Label>
                      <Input
                        id="mobile"
                        placeholder="+1234567890"
                        value={newFaculty.mobile}
                        onChange={(e) => setNewFaculty({...newFaculty, mobile: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="branch">Branch</Label>
                      <Select value={newFaculty.branchName} onValueChange={(value) => setNewFaculty({...newFaculty, branchName: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select branch" />
                        </SelectTrigger>
                        <SelectContent>
                          {branches.map(branch => (
                            <SelectItem key={branch} value={branch}>{branch}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleAddFaculty}>Add Faculty</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              {/* Edit Faculty Modal */}
              <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Edit Faculty Details</DialogTitle>
                  </DialogHeader>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="editName">Name</Label>
                      <Input
                        id="editName"
                        placeholder="Faculty name"
                        value={newFaculty.name}
                        onChange={(e) => setNewFaculty({...newFaculty, name: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="editEmail">Email</Label>
                      <Input
                        id="editEmail"
                        type="email"
                        placeholder="faculty@college.edu"
                        value={newFaculty.email}
                        onChange={(e) => setNewFaculty({...newFaculty, email: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="editFacultyId">Faculty ID</Label>
                      <Input
                        id="editFacultyId"
                        placeholder="FAC001"
                        value={newFaculty.facultyId}
                        onChange={(e) => setNewFaculty({...newFaculty, facultyId: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="editMobile">Mobile</Label>
                      <Input
                        id="editMobile"
                        placeholder="+1234567890"
                        value={newFaculty.mobile}
                        onChange={(e) => setNewFaculty({...newFaculty, mobile: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="editBranch">Branch</Label>
                      <Select value={newFaculty.branchName} onValueChange={(value) => setNewFaculty({...newFaculty, branchName: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select branch" />
                        </SelectTrigger>
                        <SelectContent>
                          {branches.map(branch => (
                            <SelectItem key={branch} value={branch}>{branch}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleEditFaculty}>Update Faculty</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              {/* Task Assignment Modal */}
              <Dialog open={isTaskModalOpen} onOpenChange={setIsTaskModalOpen}>
                <DialogContent className="max-w-3xl">
                  <DialogHeader>
                    <DialogTitle>Assign Task to {selectedFaculty?.name}</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label>Batch (Multiple Selection)</Label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {batches.map(batch => (
                          <div key={batch} className="flex items-center space-x-2">
                            <Checkbox
                              id={`batch-${batch}`}
                              checked={taskData.batches.includes(batch)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setTaskData({...taskData, batches: [...taskData.batches, batch]});
                                } else {
                                  setTaskData({...taskData, batches: taskData.batches.filter(b => b !== batch)});
                                }
                              }}
                            />
                            <Label htmlFor={`batch-${batch}`}>{batch}</Label>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <Label>Branch (Multiple Selection)</Label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {branches.map(branch => (
                          <div key={branch} className="flex items-center space-x-2">
                            <Checkbox
                              id={`branch-${branch}`}
                              checked={taskData.branches.includes(branch)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setTaskData({...taskData, branches: [...taskData.branches, branch]});
                                } else {
                                  setTaskData({...taskData, branches: taskData.branches.filter(b => b !== branch)});
                                }
                              }}
                            />
                            <Label htmlFor={`branch-${branch}`}>{branch}</Label>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <Label>Section (Multiple Selection)</Label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {sections.map(section => (
                          <div key={section} className="flex items-center space-x-2">
                            <Checkbox
                              id={`section-${section}`}
                              checked={taskData.sections.includes(section)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setTaskData({...taskData, sections: [...taskData.sections, section]});
                                } else {
                                  setTaskData({...taskData, sections: taskData.sections.filter(s => s !== section)});
                                }
                              }}
                            />
                            <Label htmlFor={`section-${section}`}>{section}</Label>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="taskDescription">Task Description</Label>
                      <Textarea
                        id="taskDescription"
                        placeholder="Enter task description..."
                        value={taskData.description}
                        onChange={(e) => setTaskData({...taskData, description: e.target.value})}
                        rows={4}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsTaskModalOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleTaskAssignment} disabled={!taskData.description}>
                      Add Task
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4 mb-4 flex-wrap gap-2">
            <div className="flex items-center space-x-2">
              <Search className="w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search faculty..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>S.No</TableHead>
                <TableHead>Name of Faculty</TableHead>
                <TableHead>Branch Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Faculty ID</TableHead>
                <TableHead>Mobile</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredFaculty.map((member, index) => (
                <TableRow key={member.id}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell className="font-medium">{member.name}</TableCell>
                  <TableCell>{member.branchName}</TableCell>
                  <TableCell>{member.email}</TableCell>
                  <TableCell>{member.facultyId}</TableCell>
                  <TableCell>{member.mobile}</TableCell>
                  <TableCell>
                    <Badge variant={member.status === "Active" ? "default" : "secondary"}>
                      {member.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleFacultyActivation(member.id)}
                        title="Faculty Activation"
                      >
                        <UserCheck className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => openEditModal(member)}
                        title="Edit Faculty Details"
                      >
                        <UserCog className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => openTaskModal(member)}
                        title="Tasks Assignment"
                      >
                        <ClipboardList className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleRemoveFaculty(member.id)}
                        title="Remove Faculty"
                      >
                        <UserX className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Bulk Upload Modal */}
      <BulkUploadModal
        isOpen={isBulkUploadOpen}
        onClose={() => setIsBulkUploadOpen(false)}
        onUpload={handleBulkUploadFile}
      />

      {/* Bulk Results Modal */}
      <BulkResultsModal
        isOpen={showBulkResults}
        onClose={() => setShowBulkResults(false)}
        results={bulkResults}
        onReview={handleReviewDuplicates}
        onSendInvitations={handleSendInvitations}
      />
    </div>
  );
}