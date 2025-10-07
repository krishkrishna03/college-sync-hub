import React, { useState } from 'react';
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
  TrendingUp,
  Target,
  ChevronDown,
  ChevronRight
} from 'lucide-react';

interface SidebarItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  roles?: string[];
  subItems?: SubItem[];
}

interface SubItem {
  id: string;
  label: string;
  testType?: string;
}

interface SidebarProps {
  userRole: string;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ userRole, activeTab, onTabChange }) => {
  const [testsDropdownOpen, setTestsDropdownOpen] = useState(false);

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
      id: 'notification-analytics',
      label: 'Notification Analytics',
      icon: <TrendingUp size={20} />,
      roles: ['master_admin'],
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
      id: 'student-hierarchy',
      label: 'Student Hierarchy',
      icon: <Users size={20} />,
      roles: ['college_admin'],
    },
    {
      id: 'reports',
      label: 'Reports',
      icon: <BarChart3 size={20} />,
      roles: ['college_admin', 'student'],
    },
    {
      id: 'assigned-tests',
      label: 'Assigned Tests',
      icon: <ClipboardList size={20} />,
      roles: ['college_admin'],
    },
    {
      id: 'tests',
      label: 'Tests',
      icon: <FileText size={20} />,
      roles: ['faculty'],
    },
    {
      id: 'test-reports',
      label: 'Test Reports',
      icon: <BarChart3 size={20} />,
      roles: ['faculty'],
    },
    {
      id: 'student-reports',
      label: 'Student Reports',
      icon: <ClipboardList size={20} />,
      roles: ['faculty'],
    },
    {
      id: 'my-tests',
      label: 'Tests',
      icon: <FileText size={20} />,
      roles: ['student'],
      subItems: [
        { id: 'practice-tests', label: 'Practice Tests', testType: 'Practice' },
        { id: 'assessment-tests', label: 'Assessment Tests', testType: 'Assessment' },
        { id: 'mock-tests', label: 'Mock Tests', testType: 'Mock Test' },
        { id: 'company-tests', label: 'Company Tests', testType: 'Specific Company Test' }
      ]
    },
    {
      id: 'performance',
      label: 'My Performance',
      icon: <Target size={20} />,
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

  const handleTestsClick = () => {
    if (userRole === 'student') {
      setTestsDropdownOpen(!testsDropdownOpen);
    } else {
      onTabChange('my-tests');
    }
  };

  const handleSubItemClick = (testType: string) => {
    // Navigate to my-tests tab with the specific test type filter
    onTabChange('my-tests');
    // Store the selected test type in sessionStorage for the dashboard to read
    sessionStorage.setItem('selectedTestType', testType);
    // Trigger a custom event that the dashboard can listen to
    window.dispatchEvent(new CustomEvent('testTypeChanged', { detail: { testType } }));
  };

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
          <div key={item.id}>
            {item.id === 'my-tests' && userRole === 'student' ? (
              <>
                <button
                  onClick={handleTestsClick}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-left transition-colors ${
                    activeTab === 'my-tests'
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-300 hover:text-white hover:bg-gray-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {item.icon}
                    {item.label}
                  </div>
                  {testsDropdownOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                </button>
                {testsDropdownOpen && item.subItems && (
                  <div className="ml-4 mt-1 space-y-1">
                    {item.subItems.map((subItem) => (
                      <button
                        key={subItem.id}
                        onClick={() => handleSubItemClick(subItem.testType || '')}
                        className="w-full flex items-center gap-2 px-4 py-2 rounded-lg text-left text-sm transition-colors text-gray-400 hover:text-white hover:bg-gray-800"
                      >
                        <div className="w-2 h-2 rounded-full bg-gray-600"></div>
                        {subItem.label}
                      </button>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <button
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
            )}
          </div>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;
