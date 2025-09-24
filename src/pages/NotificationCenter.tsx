import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Send, Edit, Trash2, Bell, Users, Building, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

interface Notification {
  id: string;
  title: string;
  message: string;
  targetRole: "all" | "college-admin" | "faculty" | "student";
  targetColleges: string[];
  priority: "low" | "medium" | "high" | "urgent";
  type: "info" | "success" | "warning" | "error";
  status: "draft" | "sent" | "scheduled";
  scheduledFor: Date;
  sentAt?: Date;
  createdAt: Date;
}

const mockColleges = [
  { id: "1", name: "PlantechX Engineering College", code: "PEC001" },
  { id: "2", name: "Tech Innovation Institute", code: "TII002" },
  { id: "3", name: "Future Tech University", code: "FTU003" }
];

export default function NotificationCenter() {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    message: "",
    targetRole: "all" as const,
    targetColleges: [] as string[],
    priority: "medium" as const,
    type: "info" as const,
    scheduledFor: new Date()
  });

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      
      // Mock notifications data
      const mockNotifications: Notification[] = [
        {
          id: "1",
          title: "System Maintenance Scheduled",
          message: "The platform will undergo maintenance on Sunday from 2 AM to 4 AM. Please save your work.",
          targetRole: "all",
          targetColleges: [],
          priority: "high",
          type: "warning",
          status: "sent",
          scheduledFor: new Date("2024-03-15"),
          sentAt: new Date("2024-03-10"),
          createdAt: new Date("2024-03-10")
        },
        {
          id: "2",
          title: "New Exam Available",
          message: "A new Data Structures assessment has been created and is available for assignment.",
          targetRole: "college-admin",
          targetColleges: ["1", "2"],
          priority: "medium",
          type: "info",
          status: "sent",
          scheduledFor: new Date("2024-03-12"),
          sentAt: new Date("2024-03-12"),
          createdAt: new Date("2024-03-12")
        },
        {
          id: "3",
          title: "Welcome to the Platform",
          message: "Welcome to the educational platform! Please complete your profile setup.",
          targetRole: "student",
          targetColleges: [],
          priority: "low",
          type: "success",
          status: "draft",
          scheduledFor: new Date("2024-03-20"),
          createdAt: new Date("2024-03-15")
        }
      ];
      
      setNotifications(mockNotifications);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to fetch notifications: " + error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNotification = async () => {
    if (!formData.title || !formData.message) {
      toast({
        title: "Error",
        description: "Please fill all required fields",
        variant: "destructive"
      });
      return;
    }

    try {
      const newNotification: Notification = {
        id: Date.now().toString(),
        title: formData.title,
        message: formData.message,
        targetRole: formData.targetRole,
        targetColleges: formData.targetColleges,
        priority: formData.priority,
        type: formData.type,
        status: "sent",
        scheduledFor: formData.scheduledFor,
        sentAt: new Date(),
        createdAt: new Date()
      };

      setNotifications(prev => [newNotification, ...prev]);
      
      toast({
        title: "Notification Sent",
        description: `Notification sent to ${formData.targetRole === 'all' ? 'all users' : formData.targetRole}`
      });
      
      resetForm();
      setIsCreateModalOpen(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to send notification: " + error.message,
        variant: "destructive"
      });
    }
  };

  const handleEditNotification = async () => {
    if (!selectedNotification) return;

    try {
      const updatedNotification = {
        ...selectedNotification,
        title: formData.title,
        message: formData.message,
        targetRole: formData.targetRole,
        targetColleges: formData.targetColleges,
        priority: formData.priority,
        type: formData.type,
        scheduledFor: formData.scheduledFor
      };

      setNotifications(prev => prev.map(notif => 
        notif.id === selectedNotification.id ? updatedNotification : notif
      ));
      
      toast({
        title: "Notification Updated",
        description: "Notification has been updated successfully"
      });
      
      setIsEditModalOpen(false);
      setSelectedNotification(null);
      resetForm();
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to update notification: " + error.message,
        variant: "destructive"
      });
    }
  };

  const handleDeleteNotification = async (notificationId: string) => {
    try {
      setNotifications(prev => prev.filter(notif => notif.id !== notificationId));
      toast({
        title: "Notification Deleted",
        description: "Notification has been deleted successfully"
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to delete notification: " + error.message,
        variant: "destructive"
      });
    }
  };

  const openEditModal = (notification: Notification) => {
    setSelectedNotification(notification);
    setFormData({
      title: notification.title,
      message: notification.message,
      targetRole: notification.targetRole,
      targetColleges: notification.targetColleges,
      priority: notification.priority,
      type: notification.type,
      scheduledFor: notification.scheduledFor
    });
    setIsEditModalOpen(true);
  };

  const resetForm = () => {
    setFormData({
      title: "",
      message: "",
      targetRole: "all",
      targetColleges: [],
      priority: "medium",
      type: "info",
      scheduledFor: new Date()
    });
  };

  const handleCollegeToggle = (collegeId: string) => {
    setFormData(prev => ({
      ...prev,
      targetColleges: prev.targetColleges.includes(collegeId)
        ? prev.targetColleges.filter(id => id !== collegeId)
        : [...prev.targetColleges, collegeId]
    }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "sent": return "default";
      case "draft": return "secondary";
      case "scheduled": return "outline";
      default: return "secondary";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent": return "destructive";
      case "high": return "default";
      case "medium": return "secondary";
      case "low": return "outline";
      default: return "secondary";
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "success": return "bg-success/10 text-success";
      case "warning": return "bg-warning/10 text-warning";
      case "error": return "bg-destructive/10 text-destructive";
      case "info": return "bg-info/10 text-info";
      default: return "bg-muted/10 text-muted-foreground";
    }
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading notifications...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={() => navigate('/admin')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-foreground">Notification Center</h1>
          <p className="text-muted-foreground">Send notifications to colleges, faculty, and students</p>
        </div>
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="w-4 h-4 mr-2" />
              Create Notification
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Notification</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  placeholder="Enter notification title"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                />
              </div>
              
              <div>
                <Label htmlFor="message">Message *</Label>
                <Textarea
                  id="message"
                  placeholder="Enter notification message"
                  value={formData.message}
                  onChange={(e) => setFormData({...formData, message: e.target.value})}
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="targetRole">Target Role *</Label>
                  <Select value={formData.targetRole} onValueChange={(value: any) => setFormData({...formData, targetRole: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Users</SelectItem>
                      <SelectItem value="college-admin">College Admins</SelectItem>
                      <SelectItem value="faculty">Faculty</SelectItem>
                      <SelectItem value="student">Students</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="priority">Priority</Label>
                  <Select value={formData.priority} onValueChange={(value: any) => setFormData({...formData, priority: value})}>
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

              <div>
                <Label htmlFor="type">Notification Type</Label>
                <Select value={formData.type} onValueChange={(value: any) => setFormData({...formData, type: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="info">Information</SelectItem>
                    <SelectItem value="success">Success</SelectItem>
                    <SelectItem value="warning">Warning</SelectItem>
                    <SelectItem value="error">Error</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formData.targetRole !== "all" && (
                <div>
                  <Label>Target Colleges (Optional)</Label>
                  <div className="mt-2 space-y-2 max-h-32 overflow-y-auto border rounded-lg p-3">
                    {mockColleges.map((college) => (
                      <div key={college.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`college-${college.id}`}
                          checked={formData.targetColleges.includes(college.id)}
                          onCheckedChange={() => handleCollegeToggle(college.id)}
                        />
                        <Label htmlFor={`college-${college.id}`} className="text-sm">
                          {college.name} ({college.code})
                        </Label>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Leave empty to send to all colleges
                  </p>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateNotification}>
                <Send className="w-4 h-4 mr-2" />
                Send Notification
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Notifications Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Platform Notifications
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Target Role</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Scheduled For</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {notifications.map((notification) => (
                <TableRow key={notification.id} className="hover:bg-accent/50">
                  <TableCell>
                    <div>
                      <p className="font-medium">{notification.title}</p>
                      <p className="text-sm text-muted-foreground truncate max-w-xs">
                        {notification.message}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {notification.targetRole === "all" ? (
                        <Users className="w-4 h-4" />
                      ) : (
                        <Building className="w-4 h-4" />
                      )}
                      <span className="capitalize">{notification.targetRole.replace("-", " ")}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getPriorityColor(notification.priority)}>
                      {notification.priority}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={getTypeColor(notification.type)}>
                      {notification.type}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusColor(notification.status)}>
                      {notification.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {notification.scheduledFor.toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditModal(notification)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteNotification(notification.id)}
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

      {/* Edit Notification Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Notification</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="editTitle">Title *</Label>
              <Input
                id="editTitle"
                placeholder="Enter notification title"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
              />
            </div>
            
            <div>
              <Label htmlFor="editMessage">Message *</Label>
              <Textarea
                id="editMessage"
                placeholder="Enter notification message"
                value={formData.message}
                onChange={(e) => setFormData({...formData, message: e.target.value})}
                rows={4}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="editTargetRole">Target Role *</Label>
                <Select value={formData.targetRole} onValueChange={(value: any) => setFormData({...formData, targetRole: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Users</SelectItem>
                    <SelectItem value="college-admin">College Admins</SelectItem>
                    <SelectItem value="faculty">Faculty</SelectItem>
                    <SelectItem value="student">Students</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="editPriority">Priority</Label>
                <Select value={formData.priority} onValueChange={(value: any) => setFormData({...formData, priority: value})}>
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

            <div>
              <Label htmlFor="editType">Notification Type</Label>
              <Select value={formData.type} onValueChange={(value: any) => setFormData({...formData, type: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="info">Information</SelectItem>
                  <SelectItem value="success">Success</SelectItem>
                  <SelectItem value="warning">Warning</SelectItem>
                  <SelectItem value="error">Error</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.targetRole !== "all" && (
              <div>
                <Label>Target Colleges (Optional)</Label>
                <div className="mt-2 space-y-2 max-h-32 overflow-y-auto border rounded-lg p-3">
                  {mockColleges.map((college) => (
                    <div key={college.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`edit-college-${college.id}`}
                        checked={formData.targetColleges.includes(college.id)}
                        onCheckedChange={() => handleCollegeToggle(college.id)}
                      />
                      <Label htmlFor={`edit-college-${college.id}`} className="text-sm">
                        {college.name} ({college.code})
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditNotification}>
              <Send className="w-4 h-4 mr-2" />
              Update Notification
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}