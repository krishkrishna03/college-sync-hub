import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
        </Button>

        {/* Profile Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="flex items-center gap-3 cursor-pointer hover:bg-accent hover:text-accent-foreground rounded-lg p-2 transition-colors">
              <div className="text-right">
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
            <DropdownMenuItem onClick={handleLogout} className="text-destructive">
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
