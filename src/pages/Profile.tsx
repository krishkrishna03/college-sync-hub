import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { useProfile } from "@/contexts/ProfileContext";
import { User, Shield, Activity, Building2, Users, FileText, Megaphone } from "lucide-react";

export default function Profile() {
  const { toast } = useToast();
  const { profileData, updateProfile } = useProfile();
  
  // Local state for form
  const [localProfileData, setLocalProfileData] = useState(profileData);

  // Password state
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  // Sample activity log data
  const activityLogs = [
    {
      action: "Created new test",
      details: "Aptitude Test - Basic",
      type: "Create",
      timestamp: "2024-01-15 10:30 AM"
    },
    {
      action: "Updated student batch",
      details: "Moved 25 students to 2025 batch",
      type: "Update",
      timestamp: "2024-01-15 09:15 AM"
    },
    {
      action: "Assigned test",
      details: "Mock Test - Advanced to CSE-A",
      type: "Assign",
      timestamp: "2024-01-14 04:20 PM"
    },
    {
      action: "Sent announcement",
      details: "Exam schedule notification",
      type: "Notification",
      timestamp: "2024-01-14 02:45 PM"
    },
    {
      action: "Created faculty account",
      details: "Dr. Smith - Mathematics",
      type: "Create",
      timestamp: "2024-01-13 11:30 AM"
    }
  ];

  const handleProfileUpdate = () => {
    updateProfile(localProfileData);
    toast({
      title: "Profile Updated",
      description: "Your profile information has been updated successfully.",
    });
  };

  const handlePasswordChange = () => {
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      toast({
        title: "Error",
        description: "All password fields are required.",
        variant: "destructive",
      });
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "Error",
        description: "New password and confirm password must match.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Password Changed",
      description: "Your password has been changed successfully.",
    });
    
    setPasswordData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: ""
    });
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "Create": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "Update": return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "Assign": return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300";
      case "Notification": return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Profile</h1>
        <p className="text-muted-foreground">Manage your account settings and preferences</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="w-4 h-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Security
          </TabsTrigger>
          <TabsTrigger value="activity" className="flex items-center gap-2">
            <Activity className="w-4 h-4" />
            Activity Log
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Personal Information Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Personal Information
                </CardTitle>
                <CardDescription>
                  Update your personal details and contact information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    value={localProfileData.fullName}
                    onChange={(e) => setLocalProfileData(prev => ({ ...prev, fullName: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={localProfileData.email}
                    onChange={(e) => setLocalProfileData(prev => ({ ...prev, email: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={localProfileData.phone}
                    onChange={(e) => setLocalProfileData(prev => ({ ...prev, phone: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="department">Department</Label>
                  <Input
                    id="department"
                    value={localProfileData.department}
                    onChange={(e) => setLocalProfileData(prev => ({ ...prev, department: e.target.value }))}
                  />
                </div>
                <Button onClick={handleProfileUpdate} className="w-full">
                  Update Profile
                </Button>
              </CardContent>
            </Card>

            {/* Organization Details Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="w-5 h-5" />
                  Organization Details
                </CardTitle>
                <CardDescription>
                  Your role and organization information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>College Name</Label>
                  <Input value="ABC Engineering College" readOnly className="bg-muted" />
                </div>
                <div className="space-y-2">
                  <Label>Role</Label>
                  <Input value="Administrator" readOnly className="bg-muted" />
                </div>
                <div className="space-y-2">
                  <Label>Join Date</Label>
                  <Input value="2023-01-15" readOnly className="bg-muted" />
                </div>
                
                {/* Quick Stats */}
                <div className="mt-6 pt-4 border-t border-border">
                  <h4 className="font-medium text-foreground mb-3">Quick Stats</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-blue-500" />
                      <span className="text-muted-foreground">Students:</span>
                      <span className="font-medium">1,245</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-green-500" />
                      <span className="text-muted-foreground">Faculty:</span>
                      <span className="font-medium">45</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-purple-500" />
                      <span className="text-muted-foreground">Tests:</span>
                      <span className="font-medium">156</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Megaphone className="w-4 h-4 text-orange-500" />
                      <span className="text-muted-foreground">Announcements:</span>
                      <span className="font-medium">28</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security">
          <Card className="max-w-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Change Password
              </CardTitle>
              <CardDescription>
                Update your password to keep your account secure
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Current Password</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                />
              </div>
              <Button onClick={handlePasswordChange} className="w-full">
                Change Password
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Activity Log Tab */}
        <TabsContent value="activity">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Recent Activity
              </CardTitle>
              <CardDescription>
                Track your recent actions and system activity
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Action</TableHead>
                      <TableHead>Details</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Timestamp</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {activityLogs.map((log, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{log.action}</TableCell>
                        <TableCell>{log.details}</TableCell>
                        <TableCell>
                          <Badge className={getTypeColor(log.type)}>
                            {log.type}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{log.timestamp}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}