import React, { useState} from 'react';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/Layout/Navbar';
import Sidebar from '../components/Layout/Sidebar';
import Modal from '../components/UI/Modal';
import LoadingSpinner from '../components/UI/LoadingSpinner';

// Dashboard components
import MasterAdminDashboard from './dashboards/MasterAdminDashboard';
import CollegeAdminDashboard from './dashboards/CollegeAdminDashboard';
import FacultyDashboard from './dashboards/FacultyDashboard';
import StudentDashboard from './dashboards/StudentDashboard';

// Profile component
import ProfileModal from '../components/Profile/ProfileModal';
import NotificationsList from '../components/Notifications/NotificationsList';
import ProfilePage from '../components/Profile/ProfilePage';

const Dashboard: React.FC = () => {
  const { state } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showProfile, setShowProfile] = useState(false);

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