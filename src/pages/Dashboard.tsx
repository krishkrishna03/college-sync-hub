import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useProfile } from "@/contexts/ProfileContext";
import { Users, GraduationCap, ClipboardList, Megaphone, TrendingUp, Calendar, BookOpen, BarChart3 } from "lucide-react";
import { StatCard } from "@/components/ui/stat-card";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { dashboardAPI } from "@/lib/api";

export default function Dashboard() {
  const navigate = useNavigate();
  const { profileData } = useProfile();
  const [stats, setStats] = useState({
    totalStudents: 0,
    facultyMembers: 0,
    activeTests: 0,
    announcements: 0
  });
  const [recentActivities, setRecentActivities] = useState([]);
  const [upcomingTests, setUpcomingTests] = useState([]);
  const [loading, setLoading] = useState(true);

  // Redirect based on user role
  useEffect(() => {
    const userRole = localStorage.getItem('userRole') || profileData.role;
    
    if (userRole) {
      switch (userRole) {
        case 'admin':
          navigate('/admin');
          return;
        case 'college-admin':
          navigate('/college');
          return;
        case 'faculty':
          navigate('/faculty-dashboard');
          return;
        case 'student':
          navigate('/student-dashboard');
          return;
      }
    }
  }, [profileData.role, navigate]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Mock dashboard data
        setStats({
          totalStudents: 1245,
          facultyMembers: 45,
          activeTests: 28,
          announcements: 12
        });
        
        setRecentActivities([
          {
            action: "New student enrolled",
            details: "John Doe - Computer Science",
            time: "2 hours ago",
            type: "success"
          },
          {
            action: "Test assigned",
            details: "Data Structures Assessment to CSE-A",
            time: "4 hours ago",
            type: "info"
          },
          {
            action: "Faculty account created",
            details: "Dr. Smith - Mathematics Department",
            time: "1 day ago",
            type: "success"
          }
        ]);
        
        setUpcomingTests([
          {
            id: "1",
            title: "Programming Fundamentals",
            batch: "2025",
            date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
            students: 45
          },
          {
            id: "2",
            title: "Database Management",
            batch: "2026",
            date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
            students: 38
          }
        ]);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const getStatsArray = () => {
    return [
      {
        title: "Total Students",
        value: stats.totalStudents.toLocaleString(),
        change: "+12% from last month",
        icon: Users,
        trend: "up" as const,
      },
      {
        title: "Faculty Members", 
        value: stats.facultyMembers.toString(),
        change: "+3 new hires",
        icon: GraduationCap,
        trend: "up" as const,
      },
      {
        title: "Active Tests",
        value: stats.activeTests.toString(),
        change: "8 scheduled today",
        icon: ClipboardList,
        trend: "neutral" as const,
      },
      {
        title: "Announcements",
        value: stats.announcements.toString(),
        change: "2 pending approval", 
        icon: Megaphone,
        trend: "neutral" as const,
      },
    ];
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6 animate-fade-in">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here's what's happening at your college.</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {getStatsArray().map((stat, index) => (
          <StatCard
            key={index}
            title={stat.title}
            value={stat.value}
            change={stat.change}
            icon={stat.icon}
            trend={stat.trend}
          />
        ))}
      </div>

      {/* Recent Activity */}
      <Card className="hover:shadow-elevated transition-all duration-300">
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest updates from your college</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {recentActivities.map((activity) => (
            <div key={activity.action + activity.time} className="flex items-start gap-3 p-3 rounded-lg hover:bg-accent/50 transition-colors">
              <div className={`w-2 h-2 rounded-full mt-2 ${
                activity.type === 'success' ? 'bg-success' :
                activity.type === 'warning' ? 'bg-warning' :
                activity.type === 'info' ? 'bg-info' : 'bg-muted'
              }`} />
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium">{activity.action}</p>
                <p className="text-xs text-muted-foreground">{activity.details}</p>
                <p className="text-xs text-muted-foreground">{activity.time}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Upcoming Tests */}
      <Card className="hover:shadow-elevated transition-all duration-300">
        <CardHeader>
          <CardTitle>Upcoming Tests</CardTitle>
          <CardDescription>Tests scheduled for the next few days</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {upcomingTests.map((test) => (
              <div key={test.id || test.title} className="p-4 border border-border rounded-lg hover:shadow-card transition-all duration-200">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-primary" />
                    <h4 className="font-medium text-sm">{test.title}</h4>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Batch:</span>
                    <Badge variant="outline">{test.batch}</Badge>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Schedule:</span>
                    <span className="font-medium">{test.date ? new Date(test.date).toLocaleDateString() : 'TBD'}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Students:</span>
                    <span className="font-medium">{test.students}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}