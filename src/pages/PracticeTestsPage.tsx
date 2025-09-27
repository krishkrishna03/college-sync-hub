import React, { useState, useEffect } from 'react';
import { Brain, Play, CheckCircle, Clock, FileText, Filter, Search } from 'lucide-react';
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

interface PracticeTestsPageProps {
  userRole: string;
}

const PracticeTestsPage: React.FC<PracticeTestsPageProps> = ({ userRole }) => {
  const [tests, setTests] = useState<Test[] | AssignedTest[]>([]);
  const [filteredTests, setFilteredTests] = useState<Test[] | AssignedTest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('all');
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  
  // Test interface states
  const [activeTest, setActiveTest] = useState<any>(null);
  const [testStartTime, setTestStartTime] = useState<Date | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [testResults, setTestResults] = useState<any>(null);
  const [showInstantResults, setShowInstantResults] = useState(false);
  const [instantResults, setInstantResults] = useState<any>(null);

  useEffect(() => {
    loadPracticeTests();
  }, [userRole]);

  useEffect(() => {
    filterTests();
  }, [tests, searchTerm, subjectFilter, difficultyFilter, statusFilter]);

  const loadPracticeTests = async () => {
    try {
      setLoading(true);
      let data;
      
      if (userRole === 'master_admin') {
        const allTests = await apiService.getTests();
        data = allTests.filter((test: Test) => test.testType === 'Practice');
      } else if (userRole === 'college_admin') {
        const assignedTests = await apiService.getAssignedTests();
        data = assignedTests.filter((assignment: any) => 
          assignment.testId.testType === 'Practice'
        );
      } else if (userRole === 'student') {
        const assignedTests = await apiService.getStudentAssignedTests();
        data = assignedTests.filter((assignment: AssignedTest) => 
          assignment.testId.testType === 'Practice'
        );
      } else if (userRole === 'faculty') {
        // Faculty can see practice tests assigned to their college
        const assignedTests = await apiService.getAssignedTests();
        data = assignedTests.filter((assignment: any) => 
          assignment.testId.testType === 'Practice'
        );
      }
      
      setTests(data || []);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to load practice tests');
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

    // Difficulty filter
    if (difficultyFilter !== 'all') {
      filtered = filtered.filter((item: any) => {
        const test = 'testId' in item ? item.testId : item;
        return test.difficulty === difficultyFilter;
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
      
      // Show instant feedback for practice tests
      if (response.instantFeedback) {
        setInstantResults(response);
        setShowInstantResults(true);
      }
      
      // Reload tests
      loadPracticeTests();
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

  const getDifficultyColor = (difficulty: string) => {
    const colors = {
      'Easy': 'bg-green-100 text-green-800',
      'Medium': 'bg-yellow-100 text-yellow-800',
      'Hard': 'bg-red-100 text-red-800'
    };
    return colors[difficulty as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  // Get unique values for filters
  const subjects = [...new Set(tests.map((item: any) => {
    const test = 'testId' in item ? item.testId : item;
    return test.subject;
  }))];

  const difficulties = [...new Set(tests.map((item: any) => {
    const test = 'testId' in item ? item.testId : item;
    return test.difficulty;
  }).filter(Boolean))];

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

  // Show instant results
  if (showInstantResults && instantResults) {
    return (
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Practice Complete!</h1>
            <p className="text-gray-600">Here's your instant feedback</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-blue-600">{instantResults.results.marksObtained}</div>
              <div className="text-sm text-gray-600">Marks Obtained</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-green-600">{instantResults.results.percentage.toFixed(1)}%</div>
              <div className="text-sm text-gray-600">Percentage</div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-purple-600">{instantResults.results.correctAnswers}</div>
              <div className="text-sm text-gray-600">Correct</div>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-orange-600">{instantResults.results.incorrectAnswers}</div>
              <div className="text-sm text-gray-600">Incorrect</div>
            </div>
          </div>

          <div className="text-center">
            <button
              onClick={() => {
                setShowInstantResults(false);
                setInstantResults(null);
              }}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-medium"
            >
              Back to Practice Tests
            </button>
          </div>
        </div>
      </div>
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
          onClick={loadPracticeTests}
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
          <Brain className="w-8 h-8 text-green-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Practice Tests</h1>
            <p className="text-gray-600">Topic-focused practice with instant feedback</p>
          </div>
        </div>
        <div className="text-sm text-gray-500">
          {filteredTests.length} test{filteredTests.length !== 1 ? 's' : ''} available
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search tests..."
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
            value={difficultyFilter}
            onChange={(e) => setDifficultyFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Difficulties</option>
            {difficulties.map(difficulty => (
              <option key={difficulty} value={difficulty}>{difficulty}</option>
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
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Practice
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${status.color}`}>
                      {status.text}
                    </span>
                    {test.difficulty && (
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(test.difficulty)}`}>
                        {test.difficulty}
                      </span>
                    )}
                  </div>
                  <p className="text-gray-600 text-sm mb-3">{test.testDescription}</p>
                  
                  {test.topics && test.topics.length > 0 && (
                    <div className="mb-3">
                      <p className="text-xs text-gray-500 mb-1">Topics:</p>
                      <div className="flex flex-wrap gap-1">
                        {test.topics.map((topic: string, index: number) => (
                          <span key={index} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
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
                          className="bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 flex items-center gap-2 text-sm"
                        >
                          <Play size={16} />
                          Start Practice
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
          <Brain className="mx-auto h-12 w-12 text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No practice tests found</h3>
          <p className="text-gray-600">
            {searchTerm || subjectFilter !== 'all' || difficultyFilter !== 'all' || statusFilter !== 'all'
              ? 'Try adjusting your filters'
              : 'Practice tests will appear here when assigned'
            }
          </p>
        </div>
      )}
    </div>
  );
};

export default PracticeTestsPage;