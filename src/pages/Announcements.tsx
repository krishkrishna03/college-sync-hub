import { useState } from "react";
import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Eye, Edit, Trash2, Plus, CalendarIcon, ChevronLeft, ChevronRight, Bell, Check, X, CheckCheck } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { announcementsAPI } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface Announcement {
  id: string;
  title: string;
  content: string;
  targetAudience: string;
  batch?: string;
  branch?: string;
  section?: string;
  scheduledFor: Date;
  status: "draft" | "sent";
  createdAt: Date;
}


interface Notification {
  id: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
  from: "master-admin" | "faculty" | "user";
  isRead: boolean;
  createdAt: Date;
}

const mockNotifications: Notification[] = [
  {
    id: "n1",
    title: "System Maintenance",
    message: "Scheduled maintenance will occur on Sunday from 2 AM to 4 AM",
    type: "warning",
    from: "master-admin",
    isRead: false,
    createdAt: new Date("2024-03-20")
  },
  {
    id: "n2", 
    title: "New Course Added",
    message: "Advanced Data Structures course has been added to the curriculum",
    type: "info",
    from: "faculty",
    isRead: true,
    createdAt: new Date("2024-03-19")
  },
  {
    id: "n3",
    title: "Assignment Submission",
    message: "Student John Doe has submitted the Machine Learning assignment",
    type: "success",
    from: "user",
    isRead: false,
    createdAt: new Date("2024-03-18")
  }
];

export default function Announcements() {
  const { toast } = useToast();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [showEntries, setShowEntries] = useState("10");
  const [currentPage, setCurrentPage] = useState(1);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);
  const [activeTab, setActiveTab] = useState("announcements");
  
  // Form state
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    targetAudience: "all",
    batch: "",
    branch: "",
    section: "",
    scheduledFor: new Date()
  });

  // Fetch announcements on component mount
  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const response = await announcementsAPI.getAll();
      const formattedAnnouncements = response.announcements.map((ann: any) => ({
        id: ann._id,
        title: ann.title,
        content: ann.content,
        targetAudience: ann.targetAudience === 'all' ? 'All Users' : 
                       ann.targetAudience === 'students' ? 'All Students' :
                       ann.targetAudience === 'faculty' ? 'All Faculty' : 'Specific Batch',
        batch: ann.targetGroups?.batches?.[0],
        branch: ann.targetGroups?.branches?.[0],
        section: ann.targetGroups?.sections?.[0],
        scheduledFor: new Date(ann.scheduledFor),
        status: ann.status,
        createdAt: new Date(ann.createdAt)
      }));
      setAnnouncements(formattedAnnouncements);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to fetch announcements: " + error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleView = (announcement: Announcement) => {
    setSelectedAnnouncement(announcement);
    setIsViewOpen(true);
  };

  const handleEdit = (announcement: Announcement) => {
    setSelectedAnnouncement(announcement);
    setFormData({
      title: announcement.title,
      content: announcement.content,
      targetAudience: announcement.targetAudience.toLowerCase().replace(" ", "-"),
      batch: announcement.batch || "",
      branch: announcement.branch || "",
      section: announcement.section || "",
      scheduledFor: announcement.scheduledFor
    });
    setIsEditOpen(true);
  };

  const handleDelete = (id: string) => {
    const deleteAnnouncement = async () => {
      try {
        await announcementsAPI.delete(id);
        fetchAnnouncements();
        toast({
          title: "Announcement Deleted",
          description: "Announcement has been deleted successfully"
        });
      } catch (error: any) {
        toast({
          title: "Error",
          description: "Failed to delete announcement: " + error.message,
          variant: "destructive"
        });
      }
    };
    
    deleteAnnouncement();
  };

  const handleSave = async (isDraft: boolean) => {
    try {
      const targetGroups = formData.targetAudience === "batch" ? {
        batches: formData.batch ? [formData.batch] : [],
        branches: formData.branch ? [formData.branch] : [],
        sections: formData.section ? [formData.section] : []
      } : {};
      
      await announcementsAPI.create({
        title: formData.title,
        content: formData.content,
        targetAudience: formData.targetAudience === "all" ? "all" :
                       formData.targetAudience === "faculty" ? "faculty" :
                       formData.targetAudience === "students" ? "students" : "specific",
        targetGroups,
        scheduledFor: formData.scheduledFor.toISOString(),
        isDraft
      });
      
      fetchAnnouncements();
      toast({
        title: isDraft ? "Draft Saved" : "Announcement Sent",
        description: isDraft ? "Announcement saved as draft" : "Announcement has been sent successfully"
      });
      resetForm();
      setIsCreateOpen(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to save announcement: " + error.message,
        variant: "destructive"
      });
    }
  };

  const handleUpdate = async (isDraft: boolean) => {
    if (!selectedAnnouncement) return;

    try {
      const targetGroups = formData.targetAudience === "batch" ? {
        batches: formData.batch ? [formData.batch] : [],
        branches: formData.branch ? [formData.branch] : [],
        sections: formData.section ? [formData.section] : []
      } : {};
      
      await announcementsAPI.update(selectedAnnouncement.id, {
        title: formData.title,
        content: formData.content,
        targetAudience: formData.targetAudience === "all" ? "all" :
                       formData.targetAudience === "faculty" ? "faculty" :
                       formData.targetAudience === "students" ? "students" : "specific",
        targetGroups,
        scheduledFor: formData.scheduledFor.toISOString(),
        status: isDraft ? "draft" : "sent"
      });
      
      fetchAnnouncements();
      toast({
        title: "Announcement Updated",
        description: "Announcement has been updated successfully"
      });
      resetForm();
      setIsEditOpen(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to update announcement: " + error.message,
        variant: "destructive"
      });
    }
  };

  const getTargetAudienceDisplay = () => {
    switch (formData.targetAudience) {
      case "all": return "All Users";
      case "faculty": return "All Faculty";
      case "students": return "All Students";
      case "batch": return `Batch ${formData.batch} - ${formData.branch} - Section ${formData.section}`;
      default: return "All Users";
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      content: "",
      targetAudience: "all",
      batch: "",
      branch: "",
      section: "",
      scheduledFor: new Date()
    });
    setSelectedAnnouncement(null);
  };

  const handleMarkAsRead = (notificationId: string) => {
    setNotifications(notifications.map(notif => 
      notif.id === notificationId ? { ...notif, isRead: true } : notif
    ));
  };

  const handleDeleteNotification = (notificationId: string) => {
    setNotifications(notifications.filter(notif => notif.id !== notificationId));
  };

  const handleMarkAllAsRead = () => {
    setNotifications(notifications.map(notif => ({ ...notif, isRead: true })));
  };

  const AnnouncementForm = ({ isEdit = false }: { isEdit?: boolean }) => (
    <div className="space-y-4">
      <div>
        <Label htmlFor="title">Announcement Title</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="Enter announcement title"
        />
      </div>

      <div>
        <Label htmlFor="content">Content</Label>
        <Textarea
          id="content"
          value={formData.content}
          onChange={(e) => setFormData({ ...formData, content: e.target.value })}
          placeholder="Enter announcement description"
          rows={4}
        />
      </div>

      <div>
        <Label htmlFor="targetAudience">Target Audience</Label>
        <Select 
          value={formData.targetAudience} 
          onValueChange={(value) => setFormData({ ...formData, targetAudience: value })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Users</SelectItem>
            <SelectItem value="faculty">All Faculty</SelectItem>
            <SelectItem value="students">All Students</SelectItem>
            <SelectItem value="batch">Select Batch</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {formData.targetAudience === "batch" && (
        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label htmlFor="batch">Batch</Label>
            <Select value={formData.batch} onValueChange={(value) => setFormData({ ...formData, batch: value })}>
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
            <Select value={formData.branch} onValueChange={(value) => setFormData({ ...formData, branch: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select branch" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CSE">CSE</SelectItem>
                <SelectItem value="IT">IT</SelectItem>
                <SelectItem value="EEE">EEE</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="section">Section</Label>
            <Select value={formData.section} onValueChange={(value) => setFormData({ ...formData, section: value })}>
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

      <div>
        <Label>Scheduled For</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal",
                !formData.scheduledFor && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {formData.scheduledFor ? format(formData.scheduledFor, "PPP") : "Pick a date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={formData.scheduledFor}
              onSelect={(date) => setFormData({ ...formData, scheduledFor: date || new Date() })}
              initialFocus
              className="p-3 pointer-events-auto"
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button variant="outline" onClick={() => isEdit ? handleUpdate(true) : handleSave(true)}>
          Save as Draft
        </Button>
        <Button onClick={() => isEdit ? handleUpdate(false) : handleSave(false)}>
          Send
        </Button>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading announcements...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Announcements & Notifications</h1>
          <p className="text-muted-foreground">Manage announcements and view notifications</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()}>
              <Plus className="w-4 h-4 mr-2" />
              Create Announcement
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Announcement</DialogTitle>
            </DialogHeader>
            <AnnouncementForm />
          </DialogContent>
        </Dialog>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="announcements">Announcements</TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="w-4 h-4" />
            Notifications
            {notifications.filter(n => !n.isRead).length > 0 && (
              <Badge variant="destructive" className="ml-1 h-5 w-5 p-0 text-xs">
                {notifications.filter(n => !n.isRead).length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="announcements">
          <Card>
            <CardHeader>
              <CardTitle>Announcements</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Control Panel */}
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <span className="text-sm">Show</span>
                  <Select value={showEntries} onValueChange={setShowEntries}>
                    <SelectTrigger className="w-20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="20">20</SelectItem>
                      <SelectItem value="30">30</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                    </SelectContent>
                  </Select>
                  <span className="text-sm">entries</span>
                </div>
              </div>

              {/* Table */}
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Target Audience</TableHead>
                    <TableHead>Scheduled For</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created At</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {announcements.map((announcement) => (
                    <TableRow key={announcement.id}>
                      <TableCell className="font-medium">{announcement.title}</TableCell>
                      <TableCell>{announcement.targetAudience}</TableCell>
                      <TableCell>{format(announcement.scheduledFor, "MMM dd, yyyy")}</TableCell>
                      <TableCell>
                        <Badge variant={announcement.status === "sent" ? "default" : "secondary"}>
                          {announcement.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{format(announcement.createdAt, "MMM dd, yyyy")}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleView(announcement)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(announcement)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDelete(announcement.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              <div className="flex justify-between items-center pt-4">
                <p className="text-sm text-muted-foreground">
                  Showing 1 to {announcements.length} of {announcements.length} entries
                </p>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Previous
                  </Button>
                  <Badge variant="outline">{currentPage}</Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(currentPage + 1)}
                  >
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Notifications</CardTitle>
              <Button 
                variant="outline" 
                onClick={handleMarkAllAsRead}
                disabled={notifications.filter(n => !n.isRead).length === 0}
              >
                <CheckCheck className="w-4 h-4 mr-2" />
                Mark All as Read
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {notifications.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Bell className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p>No notifications found</p>
                  </div>
                ) : (
                  notifications.map((notification) => (
                    <div 
                      key={notification.id} 
                      className={`p-4 rounded-lg border ${!notification.isRead ? 'bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800' : 'bg-muted/30'}`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-semibold">{notification.title}</h4>
                            {!notification.isRead && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            )}
                            <Badge variant="outline" className="text-xs">
                              {notification.from}
                            </Badge>
                            <Badge 
                              variant={
                                notification.type === "success" ? "default" :
                                notification.type === "warning" ? "secondary" :
                                notification.type === "error" ? "destructive" : "outline"
                              }
                              className="text-xs"
                            >
                              {notification.type}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{notification.message}</p>
                          <p className="text-xs text-muted-foreground">
                            {format(notification.createdAt, "MMM dd, yyyy 'at' h:mm a")}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          {!notification.isRead && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleMarkAsRead(notification.id)}
                            >
                              <Check className="w-4 h-4" />
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteNotification(notification.id)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* View Modal */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Announcement Details</DialogTitle>
          </DialogHeader>
          {selectedAnnouncement && (
            <div className="space-y-4">
              <div>
                <Label className="font-semibold">Title</Label>
                <p className="text-sm mt-1">{selectedAnnouncement.title}</p>
              </div>
              <div>
                <Label className="font-semibold">Content</Label>
                <p className="text-sm mt-1">{selectedAnnouncement.content}</p>
              </div>
              <div>
                <Label className="font-semibold">Target Audience</Label>
                <p className="text-sm mt-1">{selectedAnnouncement.targetAudience}</p>
              </div>
              <div>
                <Label className="font-semibold">Scheduled For</Label>
                <p className="text-sm mt-1">{format(selectedAnnouncement.scheduledFor, "PPP")}</p>
              </div>
              <div>
                <Label className="font-semibold">Status</Label>
                <Badge className="ml-2" variant={selectedAnnouncement.status === "sent" ? "default" : "secondary"}>
                  {selectedAnnouncement.status}
                </Badge>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Announcement</DialogTitle>
          </DialogHeader>
          <AnnouncementForm isEdit={true} />
        </DialogContent>
      </Dialog>
    </div>
  );
}