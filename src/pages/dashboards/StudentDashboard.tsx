import React, { useState, useEffect } from 'react';
import { Users, BookOpen, Building, User, GraduationCap, FileText, Clock, Play, CheckCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import apiService from '../../services/api';
import StudentTestInterface from '../../components/Test/StudentTestInterface';
import TestResults from '../../components/Test/TestResults';
import LoadingSpinner from '../../components/UI/LoadingSpinner';

interface College {
  name: string;
  code: string;
  address: string;
}

interface Colleague {
  _id: string;
  name: string;
  email: string;
  branch: string;
  batch: string;
  section: string;
}

interface DashboardData {
  college: College;
  colleagues: Colleague[];
}

interface AssignedTest {
  _id: string;
  testId: {
    _id: string;
    testName: string;
    testDescription: string;
    subject: string;
    numberOfQuestions: number;
    totalMarks: number;
    duration: number;
    startDateTime: string;
    endDateTime: string;
  };
  hasAttempted: boolean;
  attempt?: any;
}

interface StudentDashboardProps {
  activeTab: string;
}

const StudentDashboard: React.FC<StudentDashboardProps> = ({ activeTab }) => {
  const { state } = useAuth();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [assignedTests, setAssignedTests] = useState<AssignedTest[]>([]);
  const [activeTest, setActiveTest] = useState<any>(null);
  const [testStartTime, setTestStartTime] = useState<Date | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [testResults, setTestResults] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (activeTab === 'dashboard' || activeTab === 'profile') {
      loadDashboardData();
    } else if (activeTab === 'my-tests') {
      loadAssignedTests();
    }
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const data = await apiService.getCollegeDashboard();
      setDashboardData(data);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const loadAssignedTests = async () => {
    try {
      setLoading(true);
      const data = await apiService.getStudentAssignedTests();
      setAssignedTests(data);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to load assigned tests');
    } finally {
      setLoading(false);
    }
  };

  const handleStartTest = async (testId: string) => {
    try {
      const response = await apiService.startTest(testId);
      setActiveTest(response.test);
      setTestStartTime(new Date(response.startTime));
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to start test');
    }
  };

  const handleSubmitTest = async (answers: any[], timeSpent: number) => {
    if (!activeTest || !testStartTime) return;

    try {
      const response = await apiService.submitTest(activeTest._id, answers, testStartTime, timeSpent);
      setActiveTest(null);
      setTestStartTime(null);
      
      // Show results
      const results = await apiService.getTestResults(activeTest._id);
      setTestResults(results);
      setShowResults(true);
      
      // Reload assigned tests
      loadAssignedTests();
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to submit test');
    }
  };

  const handleViewResults = async (testId: string) => {
    try {
      const results = await apiService.getTestResults(testId);
      setTestResults(results);
      setShowResults(true);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to load results');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isTestActive = (test: AssignedTest) => {
    const now = new Date();
    const start = new Date(test.testId.startDateTime);
    const end = new Date(test.testId.endDateTime);
    return now >= start && now <= end;
  };

  const getTestStatus = (test: AssignedTest) => {
    if (test.hasAttempted) return { text: 'Completed', color: 'bg-green-100 text-green-800' };
    
    const now = new Date();
    const start = new Date(test.testId.startDateTime);
    const end = new Date(test.testId.endDateTime);
    
    if (now < start) return { text: 'Upcoming', color: 'bg-yellow-100 text-yellow-800' };
    if (now > end) return { text: 'Expired', color: 'bg-red-100 text-red-800' };
    return { text: 'Available', color: 'bg-blue-100 text-blue-800' };
  };

  // Show test interface if test is active
  if (activeTest && testStartTime) {
    return (
      <StudentTestInterface
        test={activeTest}
        startTime={testStartTime}
        onSubmit={handleSubmitTest}
        onExit={() => {
          setActiveTest(null);
          setTestStartTime(null);
        }}
      />
    );
  }

  // Show test results
  if (showResults && testResults) {
    return (
      <TestResults
        results={testResults}
        onClose={() => {
          setShowResults(false);
          setTestResults(null);
        }}
      />
    );
  }

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
          onClick={loadDashboardData}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!dashboardData) {
    return <div>No data available</div>;
  }

  if (activeTab === 'my-tests') {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">My Tests</h2>
        </div>

        <div className="grid gap-6">
          {assignedTests.map((test) => {
            const status = getTestStatus(test);
            return (
              <div key={test._id} className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {test.testId.testName}
                      </h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${status.color}`}>
                        {status.text}
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm mb-2">{test.testId.testDescription}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="text-center p-2 bg-gray-50 rounded">
                    <p className="text-xs text-gray-600">Subject</p>
                    <p className="font-semibold">{test.testId.subject}</p>
                  </div>
                  <div className="text-center p-2 bg-gray-50 rounded">
                    <p className="text-xs text-gray-600">Questions</p>
                    <p className="font-semibold">{test.testId.numberOfQuestions}</p>
                  </div>
                  <div className="text-center p-2 bg-gray-50 rounded">
                    <p className="text-xs text-gray-600">Duration</p>
                    <p className="font-semibold">{test.testId.duration} min</p>
                  </div>
                  <div className="text-center p-2 bg-gray-50 rounded">
                    <p className="text-xs text-gray-600">Total Marks</p>
                    <p className="font-semibold">{test.testId.totalMarks}</p>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="text-sm text-gray-600 mb-3">
                    <p><strong>Available:</strong> {formatDate(test.testId.startDateTime)} - {formatDate(test.testId.endDateTime)}</p>
                  </div>

                  <div className="flex gap-2">
                    {test.hasAttempted ? (
                      <button
                        onClick={() => handleViewResults(test.testId._id)}
                        className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 flex items-center gap-2 text-sm"
                      >
                        <CheckCircle size={16} />
                        View Results
                      </button>
                    ) : isTestActive(test) ? (
                      <button
                        onClick={() => handleStartTest(test.testId._id)}
                        className="bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 flex items-center gap-2 text-sm"
                      >
                        <Play size={16} />
                        Start Test
                      </button>
                    ) : (
                      <button
                        disabled
                        className="bg-gray-400 text-white py-2 px-4 rounded-lg cursor-not-allowed flex items-center gap-2 text-sm"
                      >
                        <Clock size={16} />
                        {status.text}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {assignedTests.length === 0 && !loading && (
          <div className="text-center py-12">
            <FileText className="mx-auto h-12 w-12 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No tests assigned yet</h3>
            <p className="text-gray-600">Tests assigned by your college will appear here</p>
          </div>
        )}
      </div>
    );
  }

  if (activeTab === 'profile') {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Student Profile</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Full Name</label>
              <p className="mt-1 text-lg text-gray-900">{state.user?.name}</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <p className="mt-1 text-gray-900">{state.user?.email}</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Role</label>
              <p className="mt-1 text-gray-900">Student</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">College</label>
              <p className="mt-1 text-gray-900">{dashboardData.college.name}</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">College Code</label>
              <p className="mt-1 text-gray-900">{dashboardData.college.code}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Default dashboard view
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Welcome, {state.user?.name}!</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center">
              <Building className="h-8 w-8 text-blue-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">College</p>
                <p className="text-lg font-bold text-gray-900">{dashboardData.college.name}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center">
              <BookOpen className="h-8 w-8 text-green-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Code</p>
                <p className="text-lg font-bold text-gray-900">{dashboardData.college.code}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-purple-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Assigned Tests</p>
                <p className="text-lg font-bold text-gray-900">{assignedTests.length}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b">
          <h3 className="text-lg font-medium">College Information</h3>
        </div>
        <div className="p-6">
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">College Name</label>
              <p className="mt-1 text-gray-900">{dashboardData.college.name}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">College Code</label>
              <p className="mt-1 text-gray-900">{dashboardData.college.code}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Address</label>
              <p className="mt-1 text-gray-900">{dashboardData.college.address}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b">
          <h3 className="text-lg font-medium">Fellow Students</h3>
        </div>
        <div className="p-6">
          <div className="grid gap-4">
            {dashboardData.colleagues.map((colleague) => (
              <div key={colleague._id} className="flex items-center p-4 border rounded-lg">
                <div className="flex-shrink-0">
                  <User className="h-8 w-8 text-gray-400" />
                </div>
                <div className="ml-4 flex-1">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">{colleague.name}</h4>
                      <p className="text-sm text-gray-500">{colleague.email}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Branch</p>
                      <p className="text-sm text-gray-900">{colleague.branch}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Batch</p>
                      <p className="text-sm text-gray-900">{colleague.batch}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Section</p>
                      <p className="text-sm text-gray-900">{colleague.section}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {dashboardData.colleagues.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <GraduationCap className="mx-auto h-12 w-12 text-gray-300" />
              <p className="mt-2">No other students in your college yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;