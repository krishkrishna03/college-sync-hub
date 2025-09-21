import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useProfile } from "@/contexts/ProfileContext";
import { 
  LayoutDashboard, 
  Users, 
  GraduationCap, 
  BookOpen, 
  ClipboardList, 
  BarChart3, 
  Megaphone, 
  User, 
  LogOut,
  Menu,
  X,
  ChevronDown,
  ChevronRight,
  UserCheck,
  Calendar,
  FileText,
  Target,
  TrendingUp,
  Bell,
  BookOpenCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navigationItems = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { 
    name: "Student Management", 
    icon: Users, 
    hasDropdown: true,
    children: [
      { name: "Batch & Branch Management", href: "/batch-years", icon: Calendar },
      { name: "Students/Mentors", href: "/students", icon: Users }
    ]
  },
  { name: "Faculty Management", href: "/faculty", icon: GraduationCap },
  { 
    name: "Exam Management", 
    icon: ClipboardList, 
    hasDropdown: true,
    children: [
      { name: "Assessments", href: "/assessments", icon: FileText },
      { name: "Company Specific", href: "/company-tests", icon: Target },
      { name: "Practice", href: "/practice", icon: BookOpenCheck },
      { name: "Mock Tests", href: "/mock-tests", icon: ClipboardList }
    ]
  },
  { name: "LSRW", href: "/lsrw", icon: BookOpen },
  { name: "Course Management", href: "/courses", icon: BookOpen },
  { name: "Participation Report", href: "/participation", icon: UserCheck },
  { 
    name: "Performance Report", 
    icon: BarChart3, 
    hasDropdown: true,
    children: [
      { name: "Assessment", href: "/performance/assessment", icon: FileText },
      { name: "Mock Test", href: "/performance/mock-test", icon: ClipboardList },
      { name: "Company Specific", href: "/performance/company-specific", icon: Target }
    ]
  },
  { name: "Test Request", href: "/test-request", icon: TrendingUp },
  { name: "Announcements", href: "/announcements", icon: Bell },
  { name: "Profile", href: "/profile", icon: User },
];

export function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [dropdownStates, setDropdownStates] = useState<Record<string, boolean>>({});
  const location = useLocation();
  const { profileData } = useProfile();
  const navigate = useNavigate();

  const toggleSidebar = () => setIsOpen(!isOpen);
  const toggleCollapse = () => setIsCollapsed(!isCollapsed);

  const toggleDropdown = (itemName: string) => {
    setDropdownStates(prev => ({
      ...prev,
      [itemName]: !prev[itemName]
    }));
  };

  const isActive = (href: string) => {
    if (href === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(href);
  };

  const isParentActive = (children: any[]) => {
    return children.some(child => isActive(child.href));
  };

  // Filter navigation items based on user role
  const getFilteredNavigationItems = () => {
    const role = profileData.role;
    
    if (role === 'admin') {
      return [
        { name: "Admin Dashboard", href: "/admin", icon: LayoutDashboard },
        { name: "Profile", href: "/profile", icon: User },
      ];
    }
    
    if (role === 'college-admin') {
      return [
        { name: "College Dashboard", href: "/college", icon: LayoutDashboard },
        { name: "Profile", href: "/profile", icon: User },
      ];
    }
    
    if (role === 'faculty') {
      return [
        { name: "Faculty Dashboard", href: "/faculty-dashboard", icon: LayoutDashboard },
        { name: "My Students", href: "/students", icon: Users },
        { name: "Test Management", href: "/exam-management", icon: ClipboardList },
        { name: "Announcements", href: "/announcements", icon: Bell },
        { name: "Profile", href: "/profile", icon: User },
      ];
    }
    
    if (role === 'student') {
      return [
        { name: "Student Dashboard", href: "/student-dashboard", icon: LayoutDashboard },
        { name: "My Tests", href: "/my-tests", icon: ClipboardList },
        { name: "My Courses", href: "/my-courses", icon: BookOpen },
        { name: "Announcements", href: "/announcements", icon: Bell },
        { name: "Profile", href: "/profile", icon: User },
      ];
    }
    
    // Default navigation for faculty and students
    return navigationItems;
  };

  const filteredNavigationItems = getFilteredNavigationItems();

  return (
    <>
      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden fixed top-4 left-4 z-50"
        onClick={toggleSidebar}
      >
        {isOpen ? <X /> : <Menu />}
      </Button>

      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-40 bg-card border-r border-border transform transition-all duration-300 ease-in-out",
          "md:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full",
          isCollapsed ? "w-16" : "w-64"
        )}
      >
        {/* Logo */}
        <div className={cn(
          "flex items-center gap-3 border-b border-border transition-all duration-300",
          isCollapsed ? "p-3 justify-center" : "p-6"
        )}>
          <img 
            src="/lovable-uploads/c328e2b5-b12a-4d3d-b229-131e690bee30.png" 
            alt="PlantechX Logo" 
            className={cn(
              "object-contain transition-all duration-300",
              isCollapsed ? "w-8 h-8" : "w-10 h-10"
            )}
          />
          {!isCollapsed && (
            <div className="text-left">
              <h1 className="text-lg font-bold text-foreground">PlantechX</h1>
              <p className="text-sm text-muted-foreground">Admin Portal</p>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="ml-auto hidden md:flex"
            onClick={toggleCollapse}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <X className="w-4 h-4" />}
          </Button>
        </div>

        {/* Navigation */}
        <nav className={cn(
          "flex-1 p-4 space-y-2 overflow-y-auto",
          isCollapsed && "px-2"
        )}>
          {filteredNavigationItems.map((item) => (
            <div key={item.name}>
              {item.hasDropdown ? (
                <div>
                  <button
                    onClick={() => toggleDropdown(item.name)}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                      "hover:bg-accent hover:text-accent-foreground",
                      isParentActive(item.children || [])
                        ? "bg-primary text-primary-foreground shadow-primary"
                        : "text-muted-foreground",
                      isCollapsed && "justify-center px-2"
                    )}
                  >
                    <div className={cn("flex items-center gap-3", isCollapsed && "gap-0")}>
                      <item.icon className="w-5 h-5 flex-shrink-0" />
                      {!isCollapsed && item.name}
                    </div>
                    {!isCollapsed && (
                      dropdownStates[item.name] ? (
                        <ChevronDown className="w-4 h-4 ml-auto" />
                      ) : (
                        <ChevronRight className="w-4 h-4 ml-auto" />
                      )
                    )}
                  </button>
                  {!isCollapsed && dropdownStates[item.name] && (
                    <div className="mt-1 ml-4 space-y-1">
                      {item.children?.map((child) => (
                        <NavLink
                          key={child.name}
                          to={child.href}
                          className={cn(
                            "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                            "hover:bg-accent hover:text-accent-foreground",
                            isActive(child.href)
                              ? "bg-primary text-primary-foreground shadow-primary"
                              : "text-muted-foreground"
                          )}
                          onClick={() => setIsOpen(false)}
                        >
                          <child.icon className="w-4 h-4" />
                          {child.name}
                        </NavLink>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <NavLink
                  to={item.href || "/"}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                    "hover:bg-accent hover:text-accent-foreground",
                    isActive(item.href || "/")
                      ? "bg-primary text-primary-foreground shadow-primary"
                      : "text-muted-foreground",
                    isCollapsed && "justify-center px-2"
                  )}
                  onClick={() => setIsOpen(false)}
                >
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                  {!isCollapsed && item.name}
                </NavLink>
              )}
            </div>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-border">
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={() => window.location.href = '/login'}
          >
            <LogOut className="w-5 h-5" />
            Logout
          </Button>
        </div>
      </div>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-background/80 backdrop-blur-sm md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}