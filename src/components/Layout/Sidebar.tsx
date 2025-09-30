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
  Bell
} from 'lucide-react';

interface SidebarItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  roles?: string[];
}

interface SidebarProps {
  userRole: string;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ userRole, activeTab, onTabChange }) => {
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
      id: 'notifications',
      label: 'Notifications',
      icon: <Bell size={20} />,
      roles: ['master_admin', 'college_admin', 'faculty', 'student'],
    },
    {
      id: 'create-notification',
      label: 'Create Notification',
      icon: <Bell size={20} />,
      roles: ['master_admin', 'college_admin'],
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
          </button>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;