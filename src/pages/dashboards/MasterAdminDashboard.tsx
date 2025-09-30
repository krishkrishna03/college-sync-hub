import React, { useState, useEffect } from 'react';
import { Plus, Building, Users, GraduationCap, TrendingUp, CheckCircle, Clock, FileText, BarChart3, AlertCircle, BookOpen, Activity, Search, Filter, Eye, CreditCard as Edit, Trash2, Settings } from 'lucide-react';
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

interface RecentLogin {
  name: string;
  email: string;
  role: string;
  lastLogin?: string;
  collegeId?: {
    name: string;
  };
}

interface AdminStats {
  totalColleges: number;
  totalFaculty: number;
  totalStudents: number;
  recentLogins: RecentLogin[];
}

interface DashboardStats {
  totalColleges: number;
  totalStudents: number;
  activeExams: number;
  completedTests: number;
  pendingActions: {
    aiTestRequests: number;
    newCollegeApplications: number;
    testsCompletedToday: number;
  };
  platformGrowth: {
    collegeGrowth: number;
    studentEnrollment: number;
    testCompletionRate: number;
  };
  recentActivity: Array<{
    id: string;
    type: string;
    description: string;
    timestamp: string;
    college?: string;
  }>;
}

interface TestFormData {
  testName: string;
  testDescription: string;
  subject: 'Verbal' | 'Reasoning' | 'Technical' | 'Arithmetic' | 'Communication';
  testType: 'Assessment' | 'Practice' | 'Assignment';
  topics: string[];
  difficulty: 'Easy' | 'Medium' | 'Hard';
  numberOfQuestions: number;
  marksPerQuestion: number;
  duration: number;
  startDateTime: string;
  endDateTime: string;
  questions: Array<{
    questionText: string;
    options: {
      A: string;
      B: string;
      C: string;
      D: string;
    };
    correctAnswer: 'A' | 'B' | 'C' | 'D';
    marks: number;
  }>;
}

interface MasterAdminDashboardProps {
  activeTab: string;
}

const MasterAdminDashboard: React.FC<MasterAdminDashboardProps> = ({ activeTab }) => {
  const [colleges, setColleges] = useState<College[]>([]);
  const [tests, setTests] = useState<Test[]>([]);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [showCollegeForm, setShowCollegeForm] = useState(false);
  const [showTestForm, setShowTestForm] = useState(false);
  const [showNotificationForm, setShowNotificationForm] = useState(false);
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [selectedTest, setSelectedTest] = useState<Test | null>(null);
  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedCollege, setExpandedCollege] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingCollege, setEditingCollege] = useState<College | null>(null);
  const [showEditForm, setShowEditForm] = useState(false);

  useEffect(() => {
    if (activeTab === 'colleges' || activeTab === 'college-management' || activeTab === 'dashboard' || activeTab === 'stats') {
      loadData();
      loadDashboardStats();
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

  const loadDashboardStats = async () => {
    try {
      const response = await apiService.getDashboardStats();
      setDashboardStats(response);
    } catch (error) {
      console.error('Failed to load dashboard stats:', error);
      // Set default values if API fails
      setDashboardStats({
        totalColleges: 0,
        totalStudents: 0,
        activeExams: 0,
        completedTests: 0,
        pendingActions: {
          aiTestRequests: 0,
          newCollegeApplications: 0,
          testsCompletedToday: 0
        },
        platformGrowth: {
          collegeGrowth: 0,
          studentEnrollment: 0,
          testCompletionRate: 0
        },
        recentActivity: []
      });
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

  const handleCreateCollege = async (collegeData: {
    name: string;
    code: string;
    email: string;
    address: string;
  }) => {
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

  const handleCreateTest = async (formData: TestFormData) => {
    try {
      setFormLoading(true);
      
      console.log('Creating test with data:', formData);
      await apiService.createTest(formData);
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

  const handleEditCollege = (college: College) => {
    setEditingCollege(college);
    setShowEditForm(true);
  };

  const handleUpdateCollege = async (collegeData: {
    name: string;
    code: string;
    email: string;
    address: string;
  }) => {
    try {
      setFormLoading(true);
      console.log('Updating college with data:', collegeData);
      // Add API call for updating college when available
      // await apiService.updateCollege(editingCollege?.id, collegeData);
      setShowEditForm(false);
      setEditingCollege(null);
      loadData();
    } catch (error) {
      throw error;
    } finally {
      setFormLoading(false);
    }
  };

  const handleManageAdmin = (college: College) => {
    // Open admin management modal or navigate to admin management page
    console.log('Manage admin for college:', college.name);
    // This could open a modal to reset admin password, change admin details, etc.
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

  // College Management view
  if (activeTab === 'college-management') {
    const filteredColleges = colleges.filter(college =>
      college.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      college.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      college.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Building className="h-8 w-8" />
              College Management
            </h1>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowCollegeForm(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <Plus size={20} />
              Add College
            </button>
            <button className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center gap-2">
              <Trash2 size={20} />
              Delete College
            </button>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="flex gap-4 items-center">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search colleges by name, code, or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            <Filter size={20} />
            Filter
          </button>
        </div>

        {/* College Cards */}
        <div className="grid gap-6">
          {filteredColleges.map((college) => (
            <div key={college.id} className="bg-white rounded-lg shadow border">
              {/* College Card Header */}
              <div className="p-6">
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
                    
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Building className="h-4 w-4" />
                        <span>{college.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Users className="h-4 w-4" />
                        <span>{college.address}</span>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-4 gap-4">
                      <div className="text-center p-3 bg-blue-50 rounded">
                        <p className="text-2xl font-bold text-blue-600">{college.totalStudents}</p>
                        <p className="text-sm text-gray-600">Students</p>
                      </div>
                      <div className="text-center p-3 bg-green-50 rounded">
                        <p className="text-2xl font-bold text-green-600">{college.totalFaculty}</p>
                        <p className="text-sm text-gray-600">Batches</p>
                      </div>
                      <div className="text-center p-3 bg-purple-50 rounded">
                        <p className="text-2xl font-bold text-purple-600">0</p>
                        <p className="text-sm text-gray-600">Tests</p>
                      </div>
                      <div className="text-center p-3 bg-orange-50 rounded">
                        <p className="text-2xl font-bold text-orange-600">0</p>
                        <p className="text-sm text-gray-600">Tests</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => setExpandedCollege(expandedCollege === college.id ? null : college.id)}
                    className="flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                  >
                    <Eye size={16} />
                    View
                  </button>
                  <button 
                    onClick={() => handleEditCollege(college)}
                    className="flex items-center gap-2 px-3 py-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                  >
                    <Edit size={16} />
                    Edit
                  </button>
                  <button 
                    onClick={() => handleManageAdmin(college)}
                    className="flex items-center gap-2 px-3 py-2 bg-green-100 text-green-700 rounded hover:bg-green-200"
                  >
                    <Settings size={16} />
                    Admin
                  </button>
                </div>
              </div>

              {/* Expanded Details */}
              {expandedCollege === college.id && (
                <div className="border-t bg-gray-50">
                  <div className="p-6">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="text-lg font-semibold text-gray-900">
                        {college.name} - Detailed View
                      </h4>
                      <button
                        onClick={() => setExpandedCollege(null)}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        Close
                      </button>
                    </div>

                    {/* Tabs */}
                    <div className="flex border-b mb-6">
                      <button className="px-4 py-2 border-b-2 border-blue-500 text-blue-600 font-medium">
                        <Building className="inline h-4 w-4 mr-2" />
                        Batches
                      </button>
                      <button className="px-4 py-2 text-gray-500 hover:text-gray-700">
                        <Users className="inline h-4 w-4 mr-2" />
                        Streams
                      </button>
                      <button className="px-4 py-2 text-gray-500 hover:text-gray-700">
                        <FileText className="inline h-4 w-4 mr-2" />
                        Test Assignments
                      </button>
                      <button className="px-4 py-2 text-gray-500 hover:text-gray-700">
                        <Settings className="inline h-4 w-4 mr-2" />
                        Features
                      </button>
                    </div>

                    {/* Batch Content */}
                    <div className="grid grid-cols-3 gap-6">
                      <div className="bg-white p-4 rounded-lg border">
                        <div className="flex items-center justify-between mb-2">
                          <h5 className="font-medium text-gray-900">Batch 2024</h5>
                          <Eye className="h-4 w-4 text-gray-400" />
                        </div>
                        <p className="text-sm text-gray-600 mb-2">3 Streams</p>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-blue-600">1240</p>
                          <p className="text-sm text-gray-600">Total Students</p>
                        </div>
                      </div>

                      <div className="bg-white p-4 rounded-lg border">
                        <div className="flex items-center justify-between mb-2">
                          <h5 className="font-medium text-gray-900">Batch 2025</h5>
                          <Eye className="h-4 w-4 text-gray-400" />
                        </div>
                        <p className="text-sm text-gray-600 mb-2">2 Streams</p>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-blue-600">980</p>
                          <p className="text-sm text-gray-600">Total Students</p>
                        </div>
                      </div>

                      <div className="bg-white p-4 rounded-lg border">
                        <div className="flex items-center justify-between mb-2">
                          <h5 className="font-medium text-gray-900">Batch 2026</h5>
                          <Eye className="h-4 w-4 text-gray-400" />
                        </div>
                        <p className="text-sm text-gray-600 mb-2">2 Streams</p>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-blue-600">650</p>
                          <p className="text-sm text-gray-600">Total Students</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Modals */}
        <Modal
          isOpen={showCollegeForm}
          onClose={() => setShowCollegeForm(false)}
          title="Create New College"
          size="md"
        >
          <CollegeForm onSubmit={handleCreateCollege} loading={formLoading} />
        </Modal>

        <Modal
          isOpen={showEditForm}
          onClose={() => {
            setShowEditForm(false);
            setEditingCollege(null);
          }}
          title="Edit College"
          size="md"
        >
          <CollegeForm 
            onSubmit={handleUpdateCollege} 
            loading={formLoading}
            initialData={editingCollege ? {
              name: editingCollege.name,
              code: editingCollege.code,
              email: editingCollege.email,
              address: editingCollege.address
            } : undefined}
          />
        </Modal>
      </div>
    );
  }

  // Default dashboard view - Main Dashboard like in the image
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Last updated: {new Date().toLocaleString()}</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-600">Welcome, Master</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Colleges</p>
              <p className="text-2xl font-bold text-gray-900">{dashboardStats?.totalColleges || stats?.totalColleges || 15}</p>
              <p className="text-xs text-green-600 mt-1">+17% from last month</p>
            </div>
            <Building className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Students</p>
              <p className="text-2xl font-bold text-gray-900">{dashboardStats?.totalStudents || stats?.totalStudents || 3000}</p>
              <p className="text-xs text-green-600 mt-1">+8% from last month</p>
            </div>
            <Users className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Exams</p>
              <p className="text-2xl font-bold text-gray-900">{dashboardStats?.activeExams || 12}</p>
              <p className="text-xs text-red-600 mt-1">-5% from last month</p>
            </div>
            <BookOpen className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Completed Tests</p>
              <p className="text-2xl font-bold text-gray-900">{dashboardStats?.completedTests || 240}</p>
              <p className="text-xs text-green-600 mt-1">+15% from last month</p>
            </div>
            <BarChart3 className="h-8 w-8 text-blue-600" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Actions */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-gray-600" />
              <h3 className="text-lg font-medium">Pending Actions</h3>
            </div>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg">
              <div className="flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-orange-600" />
                <div>
                  <p className="font-medium text-gray-900">AI Test Requests</p>
                  <p className="text-sm text-gray-600">{dashboardStats?.pendingActions?.aiTestRequests || 8} pending approval</p>
                </div>
              </div>
              <div className="bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-xs font-medium">
                Urgent
              </div>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Building className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="font-medium text-gray-900">New College Applications</p>
                  <p className="text-sm text-gray-600">{dashboardStats?.pendingActions?.newCollegeApplications || 3} this month</p>
                </div>
              </div>
              <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                Review
              </button>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div>
                  <p className="font-medium text-gray-900">Tests Completed Today</p>
                  <p className="text-sm text-gray-600">{dashboardStats?.pendingActions?.testsCompletedToday || 47} tests completed</p>
                </div>
              </div>
              <div className="text-green-600 text-sm font-medium">
                ✓ Done
              </div>
            </div>
          </div>
        </div>

        {/* Platform Growth */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-gray-600" />
              <h3 className="text-lg font-medium">Platform Growth</h3>
            </div>
          </div>
          <div className="p-6 space-y-6">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">College Growth</span>
                <span className="text-sm font-medium text-green-600">+{dashboardStats?.platformGrowth?.collegeGrowth || 12}% this month</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-600 h-2 rounded-full" style={{ width: `${dashboardStats?.platformGrowth?.collegeGrowth || 85}%` }}></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">Student Enrollment</span>
                <span className="text-sm font-medium text-blue-600">+{dashboardStats?.platformGrowth?.studentEnrollment || 8}% this month</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${dashboardStats?.platformGrowth?.studentEnrollment || 70}%` }}></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">Test Completion Rate</span>
                <span className="text-sm font-medium text-purple-600">+{dashboardStats?.platformGrowth?.testCompletionRate || 15}% this month</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-purple-600 h-2 rounded-full" style={{ width: `${dashboardStats?.platformGrowth?.testCompletionRate || 92}%` }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Platform Activity */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-gray-600" />
            <h3 className="text-lg font-medium">Recent Platform Activity</h3>
          </div>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {(dashboardStats?.recentActivity?.length ? dashboardStats.recentActivity : [
              {
                id: '1',
                type: 'college_registered',
                description: 'New college registered',
                timestamp: '2 hours ago',
                college: 'Chennai Institute of Technology joined the platform'
              },
              {
                id: '2',
                type: 'test_completed',
                description: 'Test completed',
                timestamp: '3 hours ago',
                college: 'Mathematics Test completed by 45 students'
              },
              {
                id: '3',
                type: 'admin_login',
                description: 'Admin login',
                timestamp: '5 hours ago',
                college: 'College admin logged in for the first time'
              }
            ]).map((activity) => (
              <div key={activity.id} className="flex items-start gap-4 p-4 border-l-4 border-blue-500 bg-blue-50">
                <div className="flex-shrink-0">
                  <Building className="h-5 w-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{activity.description}</p>
                  <p className="text-sm text-gray-600">{activity.college}</p>
                  <p className="text-xs text-gray-500 mt-1">{activity.timestamp}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modals */}
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
