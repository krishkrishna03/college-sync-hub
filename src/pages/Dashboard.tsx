import { Users, GraduationCap, ClipboardList, Megaphone, TrendingUp, Calendar, BookOpen, BarChart3 } from "lucide-react";
import { StatCard } from "@/components/ui/stat-card";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function Dashboard() {
  // Dynamic stats that will be updated based on portal data
  const getDynamicStats = () => {
    // These would typically come from API calls or context
    const totalStudents = 2847; // This should come from students data
    const facultyMembers = 156; // This should come from faculty data  
    const activeTests = 23; // This should come from active tests data
    const announcements = 7; // This should come from announcements data
    
    return [
      {
        title: "Total Students",
        value: totalStudents.toLocaleString(),
        change: "+12% from last month",
        icon: Users,
        trend: "up" as const,
      },
      {
        title: "Faculty Members", 
        value: facultyMembers.toString(),
        change: "+3 new hires",
        icon: GraduationCap,
        trend: "up" as const,
      },
      {
        title: "Active Tests",
        value: activeTests.toString(),
        change: "8 scheduled today",
        icon: ClipboardList,
        trend: "neutral" as const,
      },
      {
        title: "Announcements",
        value: announcements.toString(),
        change: "2 pending approval", 
        icon: Megaphone,
        trend: "neutral" as const,
      },
    ];
  };

  const stats = getDynamicStats();

  const recentActivities = [
    {
      id: 1,
      action: "New student enrolled",
      details: "John Smith - Computer Science",
      time: "2 minutes ago",
      type: "success",
    },
    {
      id: 2,
      action: "Test assigned",
      details: "Mathematics Quiz - Batch 2024",
      time: "15 minutes ago", 
      type: "info",
    },
    {
      id: 3,
      action: "Faculty added",
      details: "Dr. Emily Davis - Physics Department",
      time: "1 hour ago",
      type: "success",
    },
    {
      id: 4,
      action: "Announcement published",
      details: "Exam Schedule Update",
      time: "2 hours ago",
      type: "warning",
    },
  ];

  const upcomingTests = [
    {
      id: 1,
      title: "Computer Science Mid-term",
      batch: "CS-2024-A",
      date: "Today, 2:00 PM",
      students: 45,
    },
    {
      id: 2,
      title: "Physics Lab Assessment",
      batch: "PHY-2024-B",
      date: "Tomorrow, 10:00 AM",
      students: 32,
    },
    {
      id: 3,
      title: "Mathematics Quiz",
      batch: "MATH-2024-C",
      date: "Dec 22, 3:00 PM",
      students: 38,
    },
  ];

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
        {stats.map((stat, index) => (
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
            <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-accent/50 transition-colors">
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
              <div key={test.id} className="p-4 border border-border rounded-lg hover:shadow-card transition-all duration-200">
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
                    <span className="font-medium">{test.date}</span>
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