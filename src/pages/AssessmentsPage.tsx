import React, { useState, useEffect } from 'react';
import { Target, Play, CheckCircle, Clock, FileText, Filter, Search, Award } from 'lucide-react';
import apiService from '../services/api';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import StudentTestInterface from '../components/Test/StudentTestInterface';
import TestResults from '../components/Test/TestResults';

interface Test {
  _id: string;
  testName: string;
  testDescription: string;
  subject: string;
  testType: string;
  topics?: string[];
  difficulty?: string;
  numberOfQuestions: number;
  totalMarks: number;
  duration: number;
  startDateTime: string;
  endDateTime: string;
  createdAt: string;
}

interface AssignedTest {
  _id: string;
  testId: Test;
  hasAttempted: boolean;
  attempt?: any;
}

interface AssessmentsPageProps {
  userRole: string;
}

const AssessmentsPage: React.FC<AssessmentsPageProps> = ({ userRole }) => {
  const [tests, setTests] = useState<Test[] | AssignedTest[]>([]);
  const [filteredTests, setFilteredTests] = useState<Test[] | AssignedTest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  
  // Test interface states
  const [activeTest, setActiveTest] = useState<any>(null);
  const [testStartTime, setTestStartTime] = useState<Date | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [testResults, setTestResults] = useState<any>(null);

  useEffect(() => {
    loadAssessments();
  }, [userRole]);

  useEffect(() => {
    filterTests();
  }, [tests, searchTerm, subjectFilter, typeFilter, statusFilter]);

  const loadAssessments = async () => {
    try {
      setLoading(true);
      let data;
      
      if (userRole === 'master_admin') {
        const allTests = await apiService.getTests();
        data = allTests.filter((test: Test) => 
          ['Assessment', 'Assignment'].includes(test.testType)
        );
      } else if (userRole === 'college_admin') {
        const assignedTests = await apiService.getAssignedTests();
        data = assignedTests.filter((assignment: any) => 
          ['Assessment', 'Assignment'].includes(assignment.testId.testType)
        );
      } else if (userRole === 'student') {
        const assignedTests = await apiService.getStudentAssignedTests();
        data = assignedTests.filter((assignment: AssignedTest) => 
          ['Assessment', 'Assignment'].includes(assignment.testId.testType)
        );
      } else if (userRole === 'faculty') {
        // Faculty can see assessments assigned to their college
        const assignedTests = await apiService.getAssignedTests();
        data = assignedTests.filter((assignment: any) => 
          ['Assessment', 'Assignment'].includes(assignment.testId.testType)
        );
      }
      
      setTests(data || []);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to load assessments');
    } finally {
      setLoading(false);
    }
  };

  const filterTests = () => {
    let filtered = [...tests];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter((item: any) => {
        const test = 'testId' in item ? item.testId : item;
        return test.testName.toLowerCase().includes(searchTerm.toLowerCase()) ||
               test.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
               (test.topics && test.topics.some((topic: string) => 
                 topic.toLowerCase().includes(searchTerm.toLowerCase())
               ));
      });
    }

    // Subject filter
    if (subjectFilter !== 'all') {
      filtered = filtered.filter((item: any) => {
        const test = 'testId' in item ? item.testId : item;
        return test.subject === subjectFilter;
      });
    }

    // Type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter((item: any) => {
        const test = 'testId' in item ? item.testId : item;
        return test.testType === typeFilter;
      });
    }

    // Status filter (for students)
    if (statusFilter !== 'all' && userRole === 'student') {
      filtered = filtered.filter((item: any) => {
        if (statusFilter === 'completed') return item.hasAttempted;
        if (statusFilter === 'pending') return !item.hasAttempted;
        return true;
      });
    }

    setFilteredTests(filtered);
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
      
      // Show results for assessments/assignments
      const results = await apiService.getTestResults(activeTest._id);
      setTestResults(results);
      setShowResults(true);
      
      // Reload tests
      loadAssessments();
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

  const isTestActive = (test: Test) => {
    const now = new Date();
    const start = new Date(test.startDateTime);
    const end = new Date(test.endDateTime);
    return now >= start && now <= end;
  };

  const getTestStatus = (test: Test, hasAttempted?: boolean) => {
    if (hasAttempted) return { text: 'Completed', color: 'bg-green-100 text-green-800' };
    
    const now = new Date();
    const start = new Date(test.startDateTime);
    const end = new Date(test.endDateTime);
    
    if (now < start) return { text: 'Upcoming', color: 'bg-yellow-100 text-yellow-800' };
    if (now > end) return { text: 'Expired', color: 'bg-red-100 text-red-800' };
    return { text: 'Available', color: 'bg-blue-100 text-blue-800' };
  };

  const getTestTypeColor = (testType: string) => {
    const colors = {
      'Assessment': 'bg-blue-100 text-blue-800',
      'Assignment': 'bg-purple-100 text-purple-800'
    };
    return colors[testType as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getTestTypeIcon = (testType: string) => {
    if (testType === 'Assignment') return <Award size={16} />;
    return <Target size={16} />;
  };

  // Get unique values for filters
  const subjects = [...new Set(tests.map((item: any) => {
    const test = 'testId' in item ? item.testId : item;
    return test.subject;
  }))];

  const testTypes = [...new Set(tests.map((item: any) => {
    const test = 'testId' in item ? item.testId : item;
    return test.testType;
  }))];

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
          onClick={loadAssessments}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Target className="w-8 h-8 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Assessments</h1>
            <p className="text-gray-600">Comprehensive evaluations and assignments</p>
          </div>
        </div>
        <div className="text-sm text-gray-500">
          {filteredTests.length} assessment{filteredTests.length !== 1 ? 's' : ''} available
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search assessments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <select
            value={subjectFilter}
            onChange={(e) => setSubjectFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Subjects</option>
            {subjects.map(subject => (
              <option key={subject} value={subject}>{subject}</option>
            ))}
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Types</option>
            {testTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>

          {userRole === 'student' && (
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
            </select>
          )}
        </div>
      </div>

      {/* Tests Grid */}
      <div className="grid gap-6">
        {filteredTests.map((item: any) => {
          const test = 'testId' in item ? item.testId : item;
          const hasAttempted = 'hasAttempted' in item ? item.hasAttempted : false;
          const status = getTestStatus(test, hasAttempted);

          return (
            <div key={test._id} className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{test.testName}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getTestTypeColor(test.testType)}`}>
                      {getTestTypeIcon(test.testType)}
                      {test.testType}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${status.color}`}>
                      {status.text}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm mb-3">{test.testDescription}</p>
                  
                  {test.topics && test.topics.length > 0 && (
                    <div className="mb-3">
                      <p className="text-xs text-gray-500 mb-1">Topics Covered:</p>
                      <div className="flex flex-wrap gap-1">
                        {test.topics.map((topic: string, index: number) => (
                          <span key={index} className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded">
                            {topic}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div className="text-center p-2 bg-gray-50 rounded">
                  <p className="text-xs text-gray-600">Subject</p>
                  <p className="font-semibold">{test.subject}</p>
                </div>
                <div className="text-center p-2 bg-gray-50 rounded">
                  <p className="text-xs text-gray-600">Questions</p>
                  <p className="font-semibold">{test.numberOfQuestions}</p>
                </div>
                <div className="text-center p-2 bg-gray-50 rounded">
                  <p className="text-xs text-gray-600">Duration</p>
                  <p className="font-semibold">{test.duration} min</p>
                </div>
                <div className="text-center p-2 bg-gray-50 rounded">
                  <p className="text-xs text-gray-600">Total Marks</p>
                  <p className="font-semibold">{test.totalMarks}</p>
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="text-sm text-gray-600 mb-3">
                  <p><strong>Available:</strong> {formatDate(test.startDateTime)} - {formatDate(test.endDateTime)}</p>
                </div>

                <div className="flex gap-2">
                  {userRole === 'student' && (
                    <>
                      {hasAttempted ? (
                        <button
                          onClick={() => handleViewResults(test._id)}
                          className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 flex items-center gap-2 text-sm"
                        >
                          <CheckCircle size={16} />
                          View Results
                        </button>
                      ) : isTestActive(test) ? (
                        <button
                          onClick={() => handleStartTest(test._id)}
                          className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 flex items-center gap-2 text-sm"
                        >
                          <Play size={16} />
                          Start {test.testType}
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
                    </>
                  )}
                  
                  {userRole !== 'student' && (
                    <div className="text-sm text-gray-500">
                      Created: {formatDate(test.createdAt)}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredTests.length === 0 && !loading && (
        <div className="text-center py-12">
          <Target className="mx-auto h-12 w-12 text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No assessments found</h3>
          <p className="text-gray-600">
            {searchTerm || subjectFilter !== 'all' || typeFilter !== 'all' || statusFilter !== 'all'
              ? 'Try adjusting your filters'
              : 'Assessments will appear here when assigned'
            }
          </p>
        </div>
      )}
    </div>
  );
};

export default AssessmentsPage;