import React from 'react';
import { 
  Home, 
  Users, 
  GraduationCap, 
  Building, 
  BookOpen,
  UserPlus,
  BarChart3,
  FileText,
  ClipboardList,
  Bell,
  Brain,
  Target,
  Award
} from 'lucide-react';

interface SidebarItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  roles?: string[];
  badge?: number;
}

interface SidebarProps {
  userRole: string;
  activeTab: string;
  onTabChange: (tab: string) => void;
  testCounts?: {
    practiceTests: number;
    assessments: number;
  };
  unreadNotifications?: number;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  userRole, 
  activeTab, 
  onTabChange, 
  testCounts = { practiceTests: 0, assessments: 0 },
  unreadNotifications = 0
}) => {
  const menuItems: SidebarItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <Home size={20} />,
      roles: ['master_admin', 'college_admin', 'faculty', 'student'],
    },
    {
      id: 'colleges',
      label: 'Colleges',
      icon: <Building size={20} />,
      roles: ['master_admin'],
    },
    {
      id: 'stats',
      label: 'Statistics',
      icon: <BarChart3 size={20} />,
      roles: ['master_admin'],
    },
    {
      id: 'tests',
      label: 'Tests',
      icon: <FileText size={20} />,
      roles: ['master_admin'],
    },
    {
      id: 'practice-tests',
      label: 'Practice Tests',
      icon: <Brain size={20} />,
      roles: ['master_admin', 'college_admin', 'faculty', 'student'],
      badge: testCounts.practiceTests
    },
    {
      id: 'assessments',
      label: 'Assessments',
      icon: <Target size={20} />,
      roles: ['master_admin', 'college_admin', 'faculty', 'student'],
      badge: testCounts.assessments
    },
    {
      id: 'notifications',
      label: 'Notifications',
      icon: <Bell size={20} />,
      roles: ['master_admin', 'college_admin', 'faculty', 'student'],
      badge: unreadNotifications
    },
    {
      id: 'faculty',
      label: 'Faculty',
      icon: <Users size={20} />,
      roles: ['college_admin'],
    },
    {
      id: 'students',
      label: 'Students',
      icon: <GraduationCap size={20} />,
      roles: ['college_admin'],
    },
    {
      id: 'assigned-tests',
      label: 'Assigned Tests',
      icon: <ClipboardList size={20} />,
      roles: ['college_admin'],
    },
    {
      id: 'my-tests',
      label: 'My Tests',
      icon: <FileText size={20} />,
      roles: ['student'],
    },
    {
      id: 'profile',
      label: 'Profile',
      icon: <UserPlus size={20} />,
      roles: ['faculty', 'student'],
    },
  ];

  const visibleItems = menuItems.filter(item => 
    !item.roles || item.roles.includes(userRole)
  );

  return (
    <div className="bg-gray-900 text-white w-64 min-h-screen p-4">
      <div className="mb-8">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <BookOpen size={24} />
          Academic System
        </h2>
      </div>

      <nav className="space-y-2">
        {visibleItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
              activeTab === item.id
                ? 'bg-blue-600 text-white'
                : 'text-gray-300 hover:text-white hover:bg-gray-800'
            }`}
          >
            {item.icon}
            {item.label}
            {item.badge && item.badge > 0 && (
              <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                {item.badge > 99 ? '99+' : item.badge}
              </span>
            )}
          </button>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;