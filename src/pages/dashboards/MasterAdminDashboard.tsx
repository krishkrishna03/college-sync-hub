import React, { useState, useEffect } from 'react';
import { Plus, Building, Users, GraduationCap, TrendingUp, CheckCircle, XCircle, Clock, FileText, BarChart3 } from 'lucide-react';
import apiService from '../../services/api';
import Modal from '../../components/UI/Modal';
import CollegeForm from '../../components/Forms/CollegeForm';
import TestForm from '../../components/Test/TestForm';
import TestCard from '../../components/Test/TestCard';
import TestAssignmentModal from '../../components/Test/TestAssignmentModal';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import NotificationForm from '../../components/Notifications/NotificationForm';

interface College {
  id: string;
  name: string;
  code: string;
  email: string;
  address: string;
  totalFaculty: number;
  totalStudents: number;
  adminInfo?: {
    name: string;
    email: string;
    hasLoggedIn: boolean;
    lastLogin?: string;
  };
  createdAt: string;
  isActive: boolean;
}

interface Test {
  _id: string;
  testName: string;
  testDescription: string;
  subject: string;
  numberOfQuestions: number;
  totalMarks: number;
  duration: number;
  startDateTime: string;
  endDateTime: string;
  createdAt: string;
}

interface AdminStats {
  totalColleges: number;
  totalFaculty: number;
  totalStudents: number;
  recentLogins: any[];
}

interface MasterAdminDashboardProps {
  activeTab: string;
}

const MasterAdminDashboard: React.FC<MasterAdminDashboardProps> = ({ activeTab }) => {
  const [colleges, setColleges] = useState<College[]>([]);
  const [tests, setTests] = useState<Test[]>([]);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [showCollegeForm, setShowCollegeForm] = useState(false);
  const [showTestForm, setShowTestForm] = useState(false);
  const [showNotificationForm, setShowNotificationForm] = useState(false);
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [selectedTest, setSelectedTest] = useState<Test | null>(null);
  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (activeTab === 'colleges' || activeTab === 'dashboard' || activeTab === 'stats') {
      loadData();
    } else if (activeTab === 'tests') {
      loadTests();
    }
  }, [activeTab]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [collegesData, statsData] = await Promise.all([
        apiService.getColleges(),
        apiService.getAdminStats()
      ]);
      setColleges(collegesData);
      setStats(statsData);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const loadTests = async () => {
    try {
      setLoading(true);
      const testsData = await apiService.getTests();
      setTests(testsData);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to load tests');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCollege = async (collegeData: any) => {
    try {
      setFormLoading(true);
      await apiService.createCollege(collegeData);
      setShowCollegeForm(false);
      loadData();
    } catch (error) {
      throw error;
    } finally {
      setFormLoading(false);
    }
  };

  const handleCreateTest = async (testData: any) => {
    try {
      setFormLoading(true);
      console.log('Creating test with data:', testData);
      await apiService.createTest(testData);
      setShowTestForm(false);
      loadTests();
    } catch (error) {
      console.error('Test creation error:', error);
      throw error;
    } finally {
      setFormLoading(false);
    }
  };

  const handleCreateNotification = async (formData: FormData) => {
    try {
      setFormLoading(true);
      await apiService.createNotificationWithFile(formData);
      setShowNotificationForm(false);
    } catch (error) {
      throw error;
    } finally {
      setFormLoading(false);
    }
  };

  const handleAssignTest = async (testId: string, collegeIds: string[]) => {
    try {
      await apiService.assignTestToColleges(testId, collegeIds);
      setShowAssignmentModal(false);
      setSelectedTest(null);
    } catch (error) {
      throw error;
    }
  };

  const handleViewTest = (testId: string) => {
    // Navigate to test details or open modal
    console.log('View test:', testId);
  };

  const handleAssignTestClick = (testId: string) => {
    const test = tests.find(t => t._id === testId);
    if (test) {
      setSelectedTest(test);
      setShowAssignmentModal(true);
    }
  };

  const toggleCollegeStatus = async (collegeId: string) => {
    try {
      await apiService.toggleCollegeStatus(collegeId);
      loadData();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to update status');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
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
          onClick={loadData}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  if (activeTab === 'stats' && stats) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <Building className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Colleges</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalColleges}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Faculty</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalFaculty}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <GraduationCap className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Students</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalStudents}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b">
            <h3 className="text-lg font-medium">Recent Login Activity</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    College
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Login
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {stats.recentLogins.map((login, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{login.name}</div>
                        <div className="text-sm text-gray-500">{login.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                        {login.role.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {login.collegeId?.name || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {login.lastLogin ? formatDate(login.lastLogin) : 'Never'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  if (activeTab === 'notifications') {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">Create Notification</h2>
          <button
            onClick={() => setShowNotificationForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Plus size={20} />
            Create Notification
          </button>
        </div>

        <Modal
          isOpen={showNotificationForm}
          onClose={() => setShowNotificationForm(false)}
          title="Create New Notification"
          size="lg"
        >
          <NotificationForm 
            onSubmit={handleCreateNotification} 
            loading={formLoading}
            onClose={() => setShowNotificationForm(false)}
          />
        </Modal>
      </div>
    );
  }

  if (activeTab === 'tests') {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">Test Management</h2>
          <button
            onClick={() => setShowTestForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Plus size={20} />
            Create Test
          </button>
        </div>

        <div className="grid gap-6">
          {tests.map((test) => (
            <TestCard
              key={test._id}
              test={test}
              onView={handleViewTest}
              onAssign={handleAssignTestClick}
            />
          ))}
        </div>

        {tests.length === 0 && !loading && (
          <div className="text-center py-12">
            <FileText className="mx-auto h-12 w-12 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No tests created yet</h3>
            <p className="text-gray-600 mb-4">Create your first test to get started</p>
            <button
              onClick={() => setShowTestForm(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Create Test
            </button>
          </div>
        )}

        <Modal
          isOpen={showTestForm}
          onClose={() => setShowTestForm(false)}
          title="Create New Test"
          size="xl"
        >
          <TestForm onSubmit={handleCreateTest} loading={formLoading} />
        </Modal>

        {selectedTest && (
          <Modal
            isOpen={showAssignmentModal}
            onClose={() => {
              setShowAssignmentModal(false);
              setSelectedTest(null);
            }}
            title="Assign Test to Colleges"
            size="lg"
          >
            <TestAssignmentModal
              testId={selectedTest._id}
              testName={selectedTest.testName}
              onClose={() => {
                setShowAssignmentModal(false);
                setSelectedTest(null);
              }}
              onAssign={handleAssignTest}
            />
          </Modal>
        )}
      </div>
    );
  }

  if (activeTab === 'colleges') {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">Colleges Management</h2>
          <button
            onClick={() => setShowCollegeForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Plus size={20} />
            Add College
          </button>
        </div>

        <div className="grid gap-6">
          {colleges.map((college) => (
            <div key={college.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-semibold text-gray-900">{college.name}</h3>
                    <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded">
                      {college.code}
                    </span>
                    <span className={`px-2 py-1 text-xs font-medium rounded ${
                      college.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {college.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  
                  <p className="text-gray-600 mb-2">{college.email}</p>
                  <p className="text-gray-600 text-sm mb-4">{college.address}</p>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="text-center p-3 bg-blue-50 rounded">
                      <p className="text-2xl font-bold text-blue-600">{college.totalFaculty}</p>
                      <p className="text-sm text-gray-600">Faculty</p>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded">
                      <p className="text-2xl font-bold text-green-600">{college.totalStudents}</p>
                      <p className="text-sm text-gray-600">Students</p>
                    </div>
                  </div>

                  {college.adminInfo && (
                    <div className="bg-gray-50 p-3 rounded">
                      <p className="text-sm text-gray-600">College Admin: {college.adminInfo.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        {college.adminInfo.hasLoggedIn ? (
                          <CheckCircle size={16} className="text-green-500" />
                        ) : (
                          <Clock size={16} className="text-orange-500" />
                        )}
                        <span className="text-xs text-gray-500">
                          {college.adminInfo.hasLoggedIn 
                            ? `Last login: ${college.adminInfo.lastLogin ? formatDate(college.adminInfo.lastLogin) : 'Unknown'}`
                            : 'Never logged in'
                          }
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => toggleCollegeStatus(college.id)}
                    className={`px-3 py-1 rounded text-sm ${
                      college.isActive
                        ? 'bg-red-100 text-red-700 hover:bg-red-200'
                        : 'bg-green-100 text-green-700 hover:bg-green-200'
                    }`}
                  >
                    {college.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                  <p className="text-xs text-gray-500">
                    Created: {formatDate(college.createdAt)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <Modal
          isOpen={showCollegeForm}
          onClose={() => setShowCollegeForm(false)}
          title="Create New College"
          size="md"
        >
          <CollegeForm onSubmit={handleCreateCollege} loading={formLoading} />
        </Modal>
      </div>
    );
  }

  // Default dashboard view
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {stats && (
          <>
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <Building className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Colleges</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalColleges}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Faculty</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalFaculty}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <GraduationCap className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Students</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalStudents}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <FileText className="h-8 w-8 text-orange-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Tests</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {tests.length}
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b">
            <h3 className="text-lg font-medium">Recent Colleges</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {colleges.slice(0, 5).map((college) => (
                <div key={college.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">{college.name}</h4>
                    <p className="text-sm text-gray-500">{college.email}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      {college.totalFaculty + college.totalStudents} users
                    </p>
                    <p className="text-xs text-gray-500">
                      Created {formatDate(college.createdAt)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b">
            <h3 className="text-lg font-medium">Quick Actions</h3>
          </div>
          <div className="p-6 space-y-3">
            <button
              onClick={() => setShowCollegeForm(true)}
              className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <Plus size={20} />
              Add New College
            </button>
            <button
              onClick={() => setShowTestForm(true)}
              className="w-full bg-green-600 text-white p-3 rounded-lg hover:bg-green-700 flex items-center gap-2"
            >
              <FileText size={20} />
              Create New Test
            </button>
          </div>
        </div>
      </div>

      <Modal
        isOpen={showCollegeForm}
        onClose={() => setShowCollegeForm(false)}
        title="Create New College"
        size="md"
      >
        <CollegeForm onSubmit={handleCreateCollege} loading={formLoading} />
      </Modal>

      <Modal
        isOpen={showTestForm}
        onClose={() => setShowTestForm(false)}
        title="Create New Test"
        size="xl"
      >
        <TestForm onSubmit={handleCreateTest} loading={formLoading} />
      </Modal>
    </div>
  );
};

export default MasterAdminDashboard;