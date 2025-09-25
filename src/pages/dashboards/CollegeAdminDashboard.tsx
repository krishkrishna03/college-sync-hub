import React, { useState, useEffect } from 'react';
import { Plus, Users, GraduationCap, CheckCircle, Clock, CreditCard as Edit } from 'lucide-react';
import apiService from '../../services/api';
import Modal from '../../components/UI/Modal';
import UserForm from '../../components/Forms/UserForm';
import LoadingSpinner from '../../components/UI/LoadingSpinner';

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  idNumber: string;
  branch: string;
  batch: string;
  section: string;
  phoneNumber?: string;
  hasLoggedIn: boolean;
  lastLogin?: string;
  createdAt: string;
  isActive: boolean;
}

interface DashboardData {
  totalFaculty: number;
  totalStudents: number;
  recentUsers: User[];
  loginStats: {
    hasLoggedIn: number;
    neverLoggedIn: number;
  };
}

interface CollegeAdminDashboardProps {
  activeTab: string;
}

const CollegeAdminDashboard: React.FC<CollegeAdminDashboardProps> = ({ activeTab }) => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [faculty, setFaculty] = useState<User[]>([]);
  const [students, setStudents] = useState<User[]>([]);
  const [showUserForm, setShowUserForm] = useState(false);
  const [defaultRole, setDefaultRole] = useState<'faculty' | 'student'>('student');
  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData();
    if (activeTab === 'faculty') {
      loadFaculty();
    } else if (activeTab === 'students') {
      loadStudents();
    }
  }, [activeTab]);

  const loadDashboardData = async () => {
    try {
      const data = await apiService.getCollegeDashboard();
      setDashboardData(data);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to load dashboard data');
    }
  };

  const loadFaculty = async () => {
    try {
      setLoading(true);
      const data = await apiService.getCollegeUsers('faculty');
      setFaculty(data);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to load faculty');
    } finally {
      setLoading(false);
    }
  };

  const loadStudents = async () => {
    try {
      setLoading(true);
      const data = await apiService.getCollegeUsers('student');
      setStudents(data);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (userData: any) => {
    try {
      setFormLoading(true);
      await apiService.createUser(userData);
      setShowUserForm(false);
      
      // Reload data
      loadDashboardData();
      if (userData.role === 'faculty') {
        loadFaculty();
      } else {
        loadStudents();
      }
    } catch (error) {
      throw error;
    } finally {
      setFormLoading(false);
    }
  };

  const toggleUserStatus = async (userId: string, currentRole: string) => {
    try {
      await apiService.toggleUserStatus(userId);
      
      // Reload data
      loadDashboardData();
      if (currentRole === 'faculty') {
        loadFaculty();
      } else {
        loadStudents();
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to update user status');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const openUserForm = (role: 'faculty' | 'student') => {
    setDefaultRole(role);
    setShowUserForm(true);
  };

  if (loading && !dashboardData) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-600 py-12">
        <p>{error}</p>
        <button 
          onClick={() => {
            setError(null);
            loadDashboardData();
          }}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  const renderUserTable = (users: User[], userType: string) => (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b flex justify-between items-center">
        <h3 className="text-lg font-medium">{userType}</h3>
        <button
          onClick={() => openUserForm(userType.toLowerCase() as 'faculty' | 'student')}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus size={16} />
          Add {userType.slice(0, -1)}
        </button>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ID Number
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Branch
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Batch
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Section
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Login Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user._id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{user.name}</div>
                    <div className="text-sm text-gray-500">{user.email}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {user.idNumber}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {user.branch}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {user.batch}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {user.section}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    {user.hasLoggedIn ? (
                      <>
                        <CheckCircle size={16} className="text-green-500" />
                        <span className="text-sm text-gray-500">
                          {user.lastLogin ? formatDate(user.lastLogin) : 'Recently'}
                        </span>
                      </>
                    ) : (
                      <>
                        <Clock size={16} className="text-orange-500" />
                        <span className="text-sm text-gray-500">Never</span>
                      </>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => toggleUserStatus(user._id, user.role)}
                    className={`px-3 py-1 rounded text-xs ${
                      user.isActive
                        ? 'bg-red-100 text-red-700 hover:bg-red-200'
                        : 'bg-green-100 text-green-700 hover:bg-green-200'
                    }`}
                  >
                    {user.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {users.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <p>No {userType.toLowerCase()} found</p>
          <button
            onClick={() => openUserForm(userType.toLowerCase().slice(0, -1) as 'faculty' | 'student')}
            className="mt-2 text-blue-600 hover:text-blue-800"
          >
            Add the first {userType.toLowerCase().slice(0, -1)}
          </button>
        </div>
      )}
    </div>
  );

  if (activeTab === 'faculty') {
    return (
      <div className="space-y-6">
        {renderUserTable(faculty, 'Faculty')}
        
        <Modal
          isOpen={showUserForm}
          onClose={() => setShowUserForm(false)}
          title="Create New Faculty"
          size="lg"
        >
          <UserForm 
            onSubmit={handleCreateUser} 
            loading={formLoading}
            defaultRole="faculty"
          />
        </Modal>
      </div>
    );
  }

  if (activeTab === 'students') {
    return (
      <div className="space-y-6">
        {renderUserTable(students, 'Students')}
        
        <Modal
          isOpen={showUserForm}
          onClose={() => setShowUserForm(false)}
          title="Create New Student"
          size="lg"
        >
          <UserForm 
            onSubmit={handleCreateUser} 
            loading={formLoading}
            defaultRole="student"
          />
        </Modal>
      </div>
    );
  }

  // Default dashboard view
  return (
    <div className="space-y-6">
      {dashboardData && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Faculty</p>
                  <p className="text-2xl font-bold text-gray-900">{dashboardData.totalFaculty}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <GraduationCap className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Students</p>
                  <p className="text-2xl font-bold text-gray-900">{dashboardData.totalStudents}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <CheckCircle className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active Users</p>
                  <p className="text-2xl font-bold text-gray-900">{dashboardData.loginStats.hasLoggedIn}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <Clock className="h-8 w-8 text-orange-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-gray-900">{dashboardData.loginStats.neverLoggedIn}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b flex justify-between items-center">
                <h3 className="text-lg font-medium">Quick Actions</h3>
              </div>
              <div className="p-6 space-y-3">
                <button
                  onClick={() => openUserForm('faculty')}
                  className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 flex items-center gap-2"
                >
                  <Plus size={20} />
                  Add Faculty Member
                </button>
                <button
                  onClick={() => openUserForm('student')}
                  className="w-full bg-green-600 text-white p-3 rounded-lg hover:bg-green-700 flex items-center gap-2"
                >
                  <Plus size={20} />
                  Add Student
                </button>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b">
                <h3 className="text-lg font-medium">Recent Additions</h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {dashboardData.recentUsers.slice(0, 5).map((user) => (
                    <div key={user._id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <h4 className="font-medium text-gray-900">{user.name}</h4>
                        <p className="text-sm text-gray-500">{user.role} - {user.branch}</p>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-2">
                          {user.hasLoggedIn ? (
                            <CheckCircle size={16} className="text-green-500" />
                          ) : (
                            <Clock size={16} className="text-orange-500" />
                          )}
                        </div>
                        <p className="text-xs text-gray-500">
                          Added {formatDate(user.createdAt)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      <Modal
        isOpen={showUserForm}
        onClose={() => setShowUserForm(false)}
        title={`Create New ${defaultRole === 'faculty' ? 'Faculty' : 'Student'}`}
        size="lg"
      >
        <UserForm 
          onSubmit={handleCreateUser} 
          loading={formLoading}
          defaultRole={defaultRole}
        />
      </Modal>
    </div>
  );
};

export default CollegeAdminDashboard;