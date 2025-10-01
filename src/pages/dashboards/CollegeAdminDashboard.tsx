import React, { useState, useEffect } from 'react';
import { Plus, Users, GraduationCap, CheckCircle, Clock, FileText, Send, Eye,Upload, Bell } from 'lucide-react';
import apiService from '../../services/api';
import Modal from '../../components/UI/Modal';
import UserForm from '../../components/Forms/UserForm';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import NotificationForm from '../../components/Notifications/NotificationForm';
import NotificationsPage from '../../components/Notifications/NotificationsPage';
import TestTabs from '../../components/Test/TestTabs';
import BulkUploadForm from '../../components/Forms/BulkUploadForm';

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

interface TestAssignment {
  _id: string;
  testId: {
    _id: string;
    testName: string;
    testDescription: string;
    subject: string;
    testType?: string;
    difficulty?: string;
    numberOfQuestions: number;
    totalMarks: number;
    duration: number;
    startDateTime: string;
    endDateTime: string;
  };
  assignedBy: {
    name: string;
    email: string;
  };
  status: 'pending' | 'accepted' | 'rejected';
  assignedAt: string;
}

interface CollegeAdminDashboardProps {
  activeTab: string;
}

const CollegeAdminDashboard: React.FC<CollegeAdminDashboardProps> = ({ activeTab }) => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [faculty, setFaculty] = useState<User[]>([]);
  const [students, setStudents] = useState<User[]>([]);
  const [assignedTests, setAssignedTests] = useState<TestAssignment[]>([]);
  const [activeTestType, setActiveTestType] = useState('all');
  const [activeSubject, setActiveSubject] = useState('all');
  const [showUserForm, setShowUserForm] = useState(false);
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const [showStudentAssignment, setShowStudentAssignment] = useState(false);
  const [showNotificationForm, setShowNotificationForm] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<TestAssignment | null>(null);
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
    } else if (activeTab === 'assigned-tests') {
      loadAssignedTests();
    }
  }, [activeTab, activeTestType, activeSubject]);

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

  const loadAssignedTests = async () => {
    try {
      setLoading(true);
      const data = await apiService.getAssignedTests(
        activeTestType === 'all' ? undefined : activeTestType,
        activeSubject === 'all' ? undefined : activeSubject
      );
      setAssignedTests(data);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to load assigned tests');
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

  const handleBulkUpload = async (file: File, role: string) => {
    try {
      setFormLoading(true);
      const formData = new FormData();
      formData.append('excel', file);
      formData.append('role', role);
      
      const response = await fetch('/api/college/users/bulk-upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });
      
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || 'Upload failed');
      }
      
      // Reload data
      loadDashboardData();
      if (role === 'faculty') {
        loadFaculty();
      } else {
        loadStudents();
      }
      
      return result;
    } catch (error) {
      throw error;
    } finally {
      setFormLoading(false);
    }
  };
  const handleTestAssignmentStatus = async (assignmentId: string, status: 'accepted' | 'rejected') => {
    try {
      await apiService.updateTestAssignmentStatus(assignmentId, status);
      loadAssignedTests();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to update test status');
    }
  };

  const handleAssignToStudents = async (assignmentId: string, filters: any) => {
    try {
      await apiService.assignTestToStudents(assignmentId, filters);
      setShowStudentAssignment(false);
      setSelectedAssignment(null);
      loadAssignedTests();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to assign test to students');
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

  const openBulkUpload = (role: 'faculty' | 'student') => {
    setDefaultRole(role);
    setShowBulkUpload(true);
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

  if (activeTab === 'assigned-tests') {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">Assigned Tests</h2>
        </div>

        <TestTabs
          activeTestType={activeTestType}
          activeSubject={activeSubject}
          onTestTypeChange={setActiveTestType}
          onSubjectChange={setActiveSubject}
        />

        <div className="grid gap-6">
          {Array.isArray(assignedTests) && assignedTests.length > 0 ? assignedTests.map((assignment) => (
            <div key={assignment._id} className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {assignment.testId.testName}
                    </h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      assignment.status === 'accepted' ? 'bg-green-100 text-green-800' :
                      assignment.status === 'rejected' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {assignment.status}
                    </span>
                    {assignment.testId.testType && (
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {assignment.testId.testType}
                      </span>
                    )}
                    {assignment.testId.difficulty && (
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        assignment.testId.difficulty === 'Easy' ? 'bg-green-100 text-green-800' :
                        assignment.testId.difficulty === 'Hard' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {assignment.testId.difficulty}
                      </span>
                    )}
                  </div>
                  <p className="text-gray-600 text-sm mb-2">{assignment.testId.testDescription}</p>
                  <p className="text-sm text-gray-500">
                    Assigned by: {assignment.assignedBy.name} on {formatDate(assignment.assignedAt)}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div className="text-center p-2 bg-gray-50 rounded">
                  <p className="text-xs text-gray-600">Subject</p>
                  <p className="font-semibold">{assignment.testId.subject}</p>
                </div>
                <div className="text-center p-2 bg-gray-50 rounded">
                  <p className="text-xs text-gray-600">Questions</p>
                  <p className="font-semibold">{assignment.testId.numberOfQuestions}</p>
                </div>
                <div className="text-center p-2 bg-gray-50 rounded">
                  <p className="text-xs text-gray-600">Duration</p>
                  <p className="font-semibold">{assignment.testId.duration} min</p>
                </div>
                <div className="text-center p-2 bg-gray-50 rounded">
                  <p className="text-xs text-gray-600">Total Marks</p>
                  <p className="font-semibold">{assignment.testId.totalMarks}</p>
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="text-sm text-gray-600 mb-3">
                  <p><strong>Start:</strong> {new Date(assignment.testId.startDateTime).toLocaleString()}</p>
                  <p><strong>End:</strong> {new Date(assignment.testId.endDateTime).toLocaleString()}</p>
                </div>

                <div className="flex gap-2">
                  {assignment.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleTestAssignmentStatus(assignment._id, 'accepted')}
                        className="bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 text-sm"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => handleTestAssignmentStatus(assignment._id, 'rejected')}
                        className="bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 text-sm"
                      >
                        Reject
                      </button>
                    </>
                  )}
                  {assignment.status === 'accepted' && (
                    <button
                      onClick={() => {
                        setSelectedAssignment(assignment);
                        setShowStudentAssignment(true);
                      }}
                      className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 flex items-center gap-2 text-sm"
                    >
                      <Send size={16} />
                      Assign to Students
                    </button>
                  )}
                </div>
              </div>
            </div>
          )) : null}
        </div>

        {(!Array.isArray(assignedTests) || assignedTests.length === 0) && !loading && (
          <div className="text-center py-12">
            <FileText className="mx-auto h-12 w-12 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No tests assigned yet</h3>
            <p className="text-gray-600">Tests assigned by Master Admin will appear here</p>
          </div>
        )}

        {/* Student Assignment Modal */}
        {selectedAssignment && (
          <Modal
            isOpen={showStudentAssignment}
            onClose={() => {
              setShowStudentAssignment(false);
              setSelectedAssignment(null);
            }}
            title="Assign Test to Students"
            size="lg"
          >
            <StudentAssignmentForm
              assignment={selectedAssignment}
              students={students}
              onAssign={handleAssignToStudents}
              onClose={() => {
                setShowStudentAssignment(false);
                setSelectedAssignment(null);
              }}
            />
          </Modal>
        )}
      </div>
    );
  }

  if (activeTab === 'notifications') {
    return <NotificationsPage />;
  }

  const renderUserTable = (users: User[], userType: string) => (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b flex justify-between items-center">
        <h3 className="text-lg font-medium">{userType}</h3>
        <div className="flex gap-2">
          <button
            onClick={() => openBulkUpload(userType.toLowerCase().slice(0, -1) as 'faculty' | 'student')}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2 text-sm"
          >
            <Upload size={16} />
            Bulk Upload
          </button>
          <button
            onClick={() => openUserForm(userType.toLowerCase().slice(0, -1) as 'faculty' | 'student')}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Plus size={16} />
            Add {userType.slice(0, -1)}
          </button>
        </div>
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
            {Array.isArray(users) && users.length > 0 ? users.map((user) => (
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
            )) : null}
          </tbody>
        </table>
      </div>

      {(!Array.isArray(users) || users.length === 0) && (
        <div className="text-center py-12 text-gray-500">
          <p>No {userType.toLowerCase()} found</p>
          <div className="mt-2 space-x-2">
            <button
              onClick={() => openBulkUpload(userType.toLowerCase().slice(0, -1) as 'faculty' | 'student')}
              className="text-green-600 hover:text-green-800"
            >
              Bulk upload {userType.toLowerCase()}
            </button>
            <span className="text-gray-400">or</span>
            <button
              onClick={() => openUserForm(userType.toLowerCase().slice(0, -1) as 'faculty' | 'student')}
              className="text-blue-600 hover:text-blue-800"
            >
              Add manually
            </button>
          </div>
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
    
        <Modal
          isOpen={showBulkUpload}
          onClose={() => setShowBulkUpload(false)}
          title="Bulk Upload Faculty"
          size="lg"
        >
          <BulkUploadForm 
            role="faculty"
            onSubmit={handleBulkUpload} 
            loading={formLoading}
            onClose={() => setShowBulkUpload(false)}
          />
        </Modal>
         </div>
    );
  }
         

  if (activeTab === 'students') {
    return (
      <>
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
  </>
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
        <Modal
          isOpen={showBulkUpload}
          onClose={() => setShowBulkUpload(false)}
          title="Bulk Upload Students"
          size="lg"
        >
          <BulkUploadForm 
            role="student"
            onSubmit={handleBulkUpload} 
            loading={formLoading}
            onClose={() => setShowBulkUpload(false)}
          />
        </Modal>
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
                <button
                  onClick={() => setShowNotificationForm(true)}
                  className="bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 text-sm"
                >
                  <Bell size={16} />
                  Send Notification
                </button>
              </div>
              <div className="p-6 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => openUserForm('faculty')}
                    className="bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 flex items-center gap-2 text-sm"
                  >
                    <Plus size={16} />
                    Add Faculty
                  </button>
                  <button
                    onClick={() => openBulkUpload('faculty')}
                    className="bg-green-600 text-white p-3 rounded-lg hover:bg-green-700 flex items-center gap-2 text-sm"
                  >
                    <Upload size={16} />
                    Bulk Faculty
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => openUserForm('student')}
                    className="bg-purple-600 text-white p-3 rounded-lg hover:bg-purple-700 flex items-center gap-2 text-sm"
                  >
                    <Plus size={16} />
                    Add Student
                  </button>
                  <button
                    onClick={() => openBulkUpload('student')}
                    className="bg-orange-600 text-white p-3 rounded-lg hover:bg-orange-700 flex items-center gap-2 text-sm"
                  >
                    <Upload size={16} />
                    Bulk Students
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b">
                <h3 className="text-lg font-medium">Recent Additions</h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {Array.isArray(dashboardData.recentUsers) && dashboardData.recentUsers.length > 0 ? dashboardData.recentUsers.slice(0, 5).map((user) => (
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
                  )) : (
                    <div className="text-center text-gray-500 py-4">
                      <p className="text-sm">No recent users</p>
                    </div>
                  )}
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
   
      <Modal
        isOpen={showBulkUpload}
        onClose={() => setShowBulkUpload(false)}
        title={`Bulk Upload ${defaultRole === 'faculty' ? 'Faculty' : 'Students'}`}
        size="lg"
      >
        <BulkUploadForm 
          role={defaultRole}
          onSubmit={handleBulkUpload} 
          loading={formLoading}
          onClose={() => setShowBulkUpload(false)}
        />
      </Modal>
       </div>
  );
};

// Student Assignment Form Component
interface StudentAssignmentFormProps {
  assignment: TestAssignment;
  students: User[];
  onAssign: (assignmentId: string, filters: any) => Promise<void>;
  onClose: () => void;
}

const StudentAssignmentForm: React.FC<StudentAssignmentFormProps> = ({
  assignment,
  students,
  onAssign,
  onClose
}) => {
  const [filters, setFilters] = useState({
    branches: [] as string[],
    batches: [] as string[],
    sections: [] as string[],
    specificStudents: [] as string[]
  });
  const [assigning, setAssigning] = useState(false);

  // Get unique values for filters
  const uniqueBranches = [...new Set(students.map(s => s.branch))];
  const uniqueBatches = [...new Set(students.map(s => s.batch))];
  const uniqueSections = [...new Set(students.map(s => s.section))];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setAssigning(true);
      await onAssign(assignment._id, filters);
    } finally {
      setAssigning(false);
    }
  };

  const handleFilterChange = (type: string, value: string, checked: boolean) => {
    setFilters(prev => ({
      ...prev,
      [type]: checked
        ? [...prev[type as keyof typeof prev], value]
        : prev[type as keyof typeof prev].filter(item => item !== value)
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Assign Test: {assignment.testId.testName}
        </h3>
        <p className="text-sm text-gray-600">
          Select students by branch, batch, section, or choose specific students
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <h4 className="font-medium text-gray-700 mb-2">Branches</h4>
          <div className="space-y-2">
            {uniqueBranches.map(branch => (
              <label key={branch} className="flex items-center">
                <input
                  type="checkbox"
                  checked={filters.branches.includes(branch)}
                  onChange={(e) => handleFilterChange('branches', branch, e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">{branch}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <h4 className="font-medium text-gray-700 mb-2">Batches</h4>
          <div className="space-y-2">
            {uniqueBatches.map(batch => (
              <label key={batch} className="flex items-center">
                <input
                  type="checkbox"
                  checked={filters.batches.includes(batch)}
                  onChange={(e) => handleFilterChange('batches', batch, e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">{batch}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <h4 className="font-medium text-gray-700 mb-2">Sections</h4>
          <div className="space-y-2">
            {uniqueSections.map(section => (
              <label key={section} className="flex items-center">
                <input
                  type="checkbox"
                  checked={filters.sections.includes(section)}
                  onChange={(e) => handleFilterChange('sections', section, e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">{section}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
          disabled={assigning}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={assigning}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
        >
          {assigning ? (
            <>
              <LoadingSpinner size="sm" />
              Assigning...
            </>
          ) : (
            <>
              <Send size={16} />
              Assign Test
            </>
          )}
        </button>
      </div>
    </form>
  );
};

export default CollegeAdminDashboard;
