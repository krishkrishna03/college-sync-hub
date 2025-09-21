import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Eye, EyeOff, CheckCircle, XCircle, School } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface InvitationData {
  email: string;
  role: string;
  collegeName: string;
  collegeCode: string;
  userData: {
    name: string;
    studentId?: string;
    facultyId?: string;
    department?: string;
    batch?: string;
    branch?: string;
    section?: string;
  };
}

export default function AcceptInvitation() {
  const { token } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [invitation, setInvitation] = useState<InvitationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isValid, setIsValid] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isAccepting, setIsAccepting] = useState(false);

  useEffect(() => {
    verifyInvitation();
  }, [token]);

  const verifyInvitation = async () => {
    try {
      setLoading(true);
      // Mock verification - replace with actual API call
      const mockInvitation: InvitationData = {
        email: "john.doe@college.edu",
        role: "faculty",
        collegeName: "PlantechX Engineering College",
        collegeCode: "PEC001",
        userData: {
          name: "John Doe",
          facultyId: "FAC001",
          department: "Computer Science"
        }
      };
      
      setInvitation(mockInvitation);
      setIsValid(true);
    } catch (error: any) {
      setIsValid(false);
      toast({
        title: "Invalid Invitation",
        description: "This invitation link is invalid or has expired",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptInvitation = async () => {
    if (!password || !confirmPassword) {
      toast({
        title: "Error",
        description: "Please fill all required fields",
        variant: "destructive"
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive"
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters long",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsAccepting(true);
      // API call would go here
      
      toast({
        title: "Account Created",
        description: "Your account has been created successfully. You can now login.",
      });
      
      // Redirect to login with role-specific redirect
      navigate("/login");
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to create account: " + error.message,
        variant: "destructive"
      });
    } finally {
      setIsAccepting(false);
    }
  };

  const handleRejectInvitation = async () => {
    try {
      // API call would go here
      toast({
        title: "Invitation Rejected",
        description: "You have declined the invitation"
      });
      navigate("/login");
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to reject invitation: " + error.message,
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Verifying invitation...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isValid || !invitation) {
    return (
      <div className="min-h-screen bg-gradient-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center space-y-4">
            <XCircle className="w-16 h-16 text-destructive mx-auto" />
            <h2 className="text-2xl font-bold">Invalid Invitation</h2>
            <p className="text-muted-foreground">
              This invitation link is invalid or has expired. Please contact your administrator for a new invitation.
            </p>
            <Button onClick={() => navigate("/login")} className="w-full">
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="flex items-center justify-center w-16 h-16 bg-gradient-primary rounded-xl shadow-primary">
              <School className="w-8 h-8 text-primary-foreground" />
            </div>
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Accept Invitation</h1>
            <p className="text-muted-foreground">Complete your account setup</p>
          </div>
        </div>

        {/* Invitation Details */}
        <Card className="shadow-elevated">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2">
              <CheckCircle className="w-5 h-5 text-success" />
              Valid Invitation
            </CardTitle>
            <CardDescription>
              You've been invited to join {invitation.collegeName}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Name:</span>
                <span className="text-sm font-medium">{invitation.userData.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Email:</span>
                <span className="text-sm font-medium">{invitation.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Role:</span>
                <Badge variant="default">{invitation.role}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">College:</span>
                <span className="text-sm font-medium">{invitation.collegeName}</span>
              </div>
              {invitation.userData.department && (
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Department:</span>
                  <span className="text-sm font-medium">{invitation.userData.department}</span>
                </div>
              )}
              {invitation.userData.batch && (
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Batch:</span>
                  <span className="text-sm font-medium">{invitation.userData.batch} - {invitation.userData.section}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Password Setup */}
        <Card className="shadow-elevated">
          <CardHeader>
            <CardTitle>Set Your Password</CardTitle>
            <CardDescription>
              Create a secure password for your account
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4 text-muted-foreground" />
                  ) : (
                    <Eye className="w-4 h-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-4 h-4 text-muted-foreground" />
                  ) : (
                    <Eye className="w-4 h-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                className="flex-1"
                onClick={handleRejectInvitation}
              >
                Decline
              </Button>
              <Button
                className="flex-1"
                onClick={handleAcceptInvitation}
                disabled={isAccepting}
              >
                {isAccepting ? "Creating Account..." : "Accept & Create Account"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}