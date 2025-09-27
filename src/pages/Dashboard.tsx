import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/Layout/Navbar';
import Sidebar from '../components/Layout/Sidebar';
import Modal from '../components/UI/Modal';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import apiService from '../services/api';

// Dashboard components
import MasterAdminDashboard from './dashboards/MasterAdminDashboard';
import CollegeAdminDashboard from './dashboards/CollegeAdminDashboard';
import FacultyDashboard from './dashboards/FacultyDashboard';
import StudentDashboard from './dashboards/StudentDashboard';

// Profile component
import ProfileModal from '../components/Profile/ProfileModal';
import NotificationsList from '../components/Notifications/NotificationsList';
import ProfilePage from '../components/Profile/ProfilePage';
import PracticeTestsPage from './PracticeTestsPage';
import AssessmentsPage from './AssessmentsPage';

const Dashboard: React.FC = () => {
  const { state } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showProfile, setShowProfile] = useState(false);
  const [testCounts, setTestCounts] = useState({ practiceTests: 0, assessments: 0 });
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  useEffect(() => {
    loadSidebarData();
  }, []);

  const loadSidebarData = async () => {
    try {
      // Load test counts based on user role
      if (state.user?.role === 'student') {
        const assignedTests = await apiService.getStudentAssignedTests();
        const practiceCount = assignedTests.filter((test: any) => 
          test.testId.testType === 'Practice' && !test.hasAttempted
        ).length;
        const assessmentCount = assignedTests.filter((test: any) => 
          ['Assessment', 'Assignment'].includes(test.testId.testType) && !test.hasAttempted
        ).length;
        setTestCounts({ practiceTests: practiceCount, assessments: assessmentCount });
      } else if (state.user?.role === 'college_admin') {
        const assignedTests = await apiService.getAssignedTests();
        const practiceCount = assignedTests.filter((test: any) => 
          test.testId.testType === 'Practice'
        ).length;
        const assessmentCount = assignedTests.filter((test: any) => 
          ['Assessment', 'Assignment'].includes(test.testId.testType)
        ).length;
        setTestCounts({ practiceTests: practiceCount, assessments: assessmentCount });
      } else if (state.user?.role === 'master_admin') {
        const tests = await apiService.getTests();
        const practiceCount = tests.filter((test: any) => test.testType === 'Practice').length;
        const assessmentCount = tests.filter((test: any) => 
          ['Assessment', 'Assignment'].includes(test.testType)
        ).length;
        setTestCounts({ practiceTests: practiceCount, assessments: assessmentCount });
      }

      // Load notification count
      const notificationData = await apiService.getMyNotifications(1, 1);
      setUnreadNotifications(notificationData.unreadCount);
    } catch (error) {
      console.error('Failed to load sidebar data:', error);
    }
  };
  if (!state.user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const getDashboardTitle = () => {
    const roleTitles = {
      master_admin: 'Master Admin Dashboard',
      college_admin: 'College Admin Dashboard',
      faculty: 'Faculty Dashboard',
      student: 'Student Dashboard',
    };
    return roleTitles[state.user.role];
  };

  const renderDashboardContent = () => {
    // Handle notifications tab for all roles
    if (activeTab === 'notifications') {
      return <NotificationsList />;
    }
    
    // Handle profile tab for all roles
    if (activeTab === 'profile') {
      return <ProfilePage />;
    }
    
    // Handle practice tests tab for all roles
    if (activeTab === 'practice-tests') {
      return <PracticeTestsPage userRole={state.user.role} />;
    }
    
    // Handle assessments tab for all roles
    if (activeTab === 'assessments') {
      return <AssessmentsPage userRole={state.user.role} />;
    }
    
    switch (state.user.role) {
      case 'master_admin':
        return <MasterAdminDashboard activeTab={activeTab} />;
      case 'college_admin':
        return <CollegeAdminDashboard activeTab={activeTab} />;
      case 'faculty':
        return <FacultyDashboard activeTab={activeTab} />;
      case 'student':
        return <StudentDashboard activeTab={activeTab} />;
      default:
        return <div>Unknown role</div>;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar
        userRole={state.user.role}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        testCounts={testCounts}
        unreadNotifications={unreadNotifications}
      />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar
          title={getDashboardTitle()}
          onProfileClick={() => setShowProfile(true)}
        />
        
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-6">
          {renderDashboardContent()}
        </main>
      </div>

      <Modal
        isOpen={showProfile}
        onClose={() => setShowProfile(false)}
        title="Profile"
        size="md"
      >
        <ProfileModal onClose={() => setShowProfile(false)} />
      </Modal>
    </div>
  );
};

export default Dashboard;