<<<<<<< HEAD
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
=======
>>>>>>> a655124e77d653c08f2b61172894d4d4f8b7064c
import { Bell, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
<<<<<<< HEAD
=======
import { useNavigate } from "react-router-dom";
import { useProfile } from "@/contexts/ProfileContext";
>>>>>>> a655124e77d653c08f2b61172894d4d4f8b7064c
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
<<<<<<< HEAD
import { useProfile } from "@/contexts/ProfileContext";
import { dashboardAPI, authAPI } from "@/lib/api";

export function Header() {
  const navigate = useNavigate();
  const { profileData, setProfileData } = useProfile();
  const [notificationCount, setNotificationCount] = useState(0);

  // Fetch unread notifications / announcements
  const fetchNotifications = async () => {
    try {
      const stats = await dashboardAPI.getStats();
      setNotificationCount(stats.unreadAnnouncements || 0);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    }
  };

  // Fetch profile data if not already loaded
  const fetchProfile = async () => {
    if (!profileData.fullName) {
      try {
        const user = await authAPI.getCurrentUser();
        setProfileData(user);
      } catch (error) {
        console.error("Failed to fetch profile:", error);
      }
    }
  };

  useEffect(() => {
    fetchNotifications();
    fetchProfile();
  }, []);

  // Handlers
  const handleLogout = () => {
    authAPI.logout(); // Remove token from localStorage
    navigate("/login");
  };

  const handleProfileClick = () => navigate("/profile");
  const handleNotificationsClick = () => navigate("/announcements");

  return (
    <header className="h-16 bg-card border-b border-border px-6 flex items-center justify-end">
      <div className="flex items-center gap-4">
        {/* Notifications */}
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          onClick={handleNotificationsClick}
        >
          <Bell className="w-5 h-5" />
          {notificationCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 w-5 h-5 p-0 flex items-center justify-center text-xs"
            >
              {notificationCount}
            </Badge>
          )}
=======

export function Header() {
  const navigate = useNavigate();
  const { profileData } = useProfile();

  const handleLogout = () => {
    navigate('/login');
  };

  const handleProfileClick = () => {
    navigate('/profile');
  };

  const handleNotifications = () => {
    navigate('/announcements');
  };

  return (
    <header className="h-16 bg-card border-b border-border px-6 flex items-center justify-end">
      {/* Right section */}
      <div className="flex items-center gap-4">
        {/* Notifications */}
        <Button 
          variant="ghost" 
          size="icon" 
          className="relative" 
          onClick={handleNotifications}
        >
          <Bell className="w-5 h-5" />
          <Badge
            variant="destructive"
            className="absolute -top-1 -right-1 w-5 h-5 p-0 flex items-center justify-center text-xs"
          >
            3
          </Badge>
>>>>>>> a655124e77d653c08f2b61172894d4d4f8b7064c
        </Button>

        {/* Profile Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="flex items-center gap-3 cursor-pointer hover:bg-accent hover:text-accent-foreground rounded-lg p-2 transition-colors">
              <div className="text-right">
<<<<<<< HEAD
                <p className="text-sm font-medium">
                  {profileData.fullName || "User"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {profileData.role === "admin" ? "College Administrator" : profileData.role}
                </p>
              </div>
              <Avatar>
                <AvatarImage src={profileData.avatarUrl || "/api/placeholder/40/40"} />
                <AvatarFallback>
                  {profileData.fullName
                    ? profileData.fullName
                        .split(" ")
                        .map((n: string) => n[0])
                        .join("")
                        .toUpperCase()
                    : "U"}
                </AvatarFallback>
              </Avatar>
            </div>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={handleProfileClick}>Profile</DropdownMenuItem>
=======
                <p className="text-sm font-medium">{profileData.fullName}</p>
                <p className="text-xs text-muted-foreground">College Administrator</p>
              </div>
              <Avatar>
                <AvatarImage src="/api/placeholder/40/40" />
                <AvatarFallback>{profileData.fullName.split(' ').map(n => n[0]).join('').toUpperCase()}</AvatarFallback>
              </Avatar>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={handleProfileClick}>
              Profile
            </DropdownMenuItem>
>>>>>>> a655124e77d653c08f2b61172894d4d4f8b7064c
            <DropdownMenuItem onClick={handleLogout} className="text-destructive">
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
<<<<<<< HEAD
}
=======
}
>>>>>>> a655124e77d653c08f2b61172894d4d4f8b7064c
