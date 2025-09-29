import React, { useState, useEffect } from 'react';
import { Clock, AlertCircle, CheckCircle, Send } from 'lucide-react';
import LoadingSpinner from '../UI/LoadingSpinner';

interface Question {
  _id: string;
  questionText: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  marks: number;
}

interface Test {
  _id: string;
  testName: string;
  testDescription: string;
  subject: string;
  testType?: string;
  numberOfQuestions: number;
  totalMarks: number;
  duration: number;
  questions: Question[];
}

interface StudentTestInterfaceProps {
  test: Test;
  startTime: Date;
  onSubmit: (answers: any[], timeSpent: number) => Promise<void>;
  onExit: () => void;
}

const StudentTestInterface: React.FC<StudentTestInterfaceProps> = ({
  test,
  startTime,
  onSubmit,
  onExit
}) => {
  const [answers, setAnswers] = useState<{ [questionId: string]: string }>({});
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [timeLeft, setTimeLeft] = useState(test.duration * 60); // in seconds
  const [submitting, setSubmitting] = useState(false);
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);
  const [showInstantFeedback, setShowInstantFeedback] = useState(false);
  const [currentFeedback, setCurrentFeedback] = useState<any>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswerChange = (questionId: string, answer: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
    
    // For Practice tests, show instant feedback
    if (test.testType === 'Practice') {
      const question = test.questions.find(q => q._id === questionId);
      if (question) {
        const isCorrect = question.correctAnswer === answer;
        setCurrentFeedback({
          questionId,
          selectedAnswer: answer,
          correctAnswer: question.correctAnswer,
          isCorrect,
          explanation: `The correct answer is ${question.correctAnswer}: ${question.options[question.correctAnswer]}`
        });
        setShowInstantFeedback(true);
        
        // Auto-hide feedback after 3 seconds
        setTimeout(() => {
          setShowInstantFeedback(false);
        }, 3000);
      }
    }
  };

  const getAnsweredCount = () => {
    return Object.keys(answers).length;
  };

  const handleAutoSubmit = async () => {
    if (submitting) return;
    await handleSubmit(true);
  };

  const handleSubmit = async (isAutoSubmit = false) => {
    if (submitting) return;

    const unansweredCount = test.numberOfQuestions - getAnsweredCount();
    
    if (!isAutoSubmit && unansweredCount > 0) {
      const confirmMessage = `You have ${unansweredCount} unanswered questions. Are you sure you want to submit?`;
      if (!window.confirm(confirmMessage)) {
        return;
      }
    }

    try {
      setSubmitting(true);
      
      const submissionAnswers = test.questions.map(question => ({
        questionId: question._id,
        selectedAnswer: answers[question._id] || 'A', // Default to A if not answered
        timeSpent: 0 // Could track per question if needed
      }));

      const timeSpent = Math.floor((Date.now() - startTime.getTime()) / 1000 / 60); // in minutes
      
      await onSubmit(submissionAnswers, timeSpent);
    } catch (error) {
      console.error('Submit error:', error);
      alert('Failed to submit test. Please try again.');
      setSubmitting(false);
    }
  };

  const getTimeColor = () => {
    if (timeLeft <= 300) return 'text-red-600'; // Last 5 minutes
    if (timeLeft <= 600) return 'text-orange-600'; // Last 10 minutes
    return 'text-green-600';
  };

  const handleNextQuestion = () => {
    if (currentQuestion < test.numberOfQuestions - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setShowInstantFeedback(false);
    }
  };
  const currentQ = test.questions[currentQuestion];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-xl font-bold text-gray-900">{test.testName}</h1>
              <p className="text-sm text-gray-600">
                {test.subject} • {test.testType || 'Assessment'} • {test.totalMarks} marks
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <div className={`flex items-center gap-2 ${getTimeColor()}`}>
                <Clock size={20} />
                <span className="font-mono text-lg font-bold">{formatTime(timeLeft)}</span>
              </div>
              
              <div className="text-sm text-gray-600">
                {getAnsweredCount()}/{test.numberOfQuestions} answered
              </div>
              
              <button
                onClick={() => setShowConfirmSubmit(true)}
                disabled={submitting}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
              >
                <Send size={16} />
                Submit Test
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Question Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-4 sticky top-24">
              <h3 className="font-medium text-gray-900 mb-3">Questions</h3>
              <div className="grid grid-cols-5 lg:grid-cols-4 gap-2">
                {test.questions.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentQuestion(index)}
                    className={`w-8 h-8 rounded text-sm font-medium ${
                      currentQuestion === index
                        ? 'bg-blue-600 text-white'
                        : answers[test.questions[index]._id]
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>
              
              <div className="mt-4 space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-100 rounded"></div>
                  <span>Answered ({getAnsweredCount()})</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-gray-100 rounded"></div>
                  <span>Not Answered ({test.numberOfQuestions - getAnsweredCount()})</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-blue-600 rounded"></div>
                  <span>Current</span>
                </div>
              </div>
              
              {test.testType === 'Practice' && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-xs text-blue-800 font-medium">Practice Mode</p>
                  <p className="text-xs text-blue-600">Get instant feedback after each answer!</p>
                </div>
              )}
            </div>
          </div>

          {/* Question Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <h2 className="text-lg font-medium">
                    Question {currentQuestion + 1} of {test.numberOfQuestions}
                  </h2>
                  <span className="text-sm text-gray-600">
                    {currentQ.marks} mark{currentQ.marks !== 1 ? 's' : ''}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${((currentQuestion + 1) / test.numberOfQuestions) * 100}%` }}
                  ></div>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-lg text-gray-900 mb-4 leading-relaxed">
                  {currentQ.questionText}
                </h3>

                <div className="space-y-3">
                  {Object.entries(currentQ.options).map(([key, value]) => (
                    <label
                      key={key}
                      className={`flex items-start gap-3 p-4 border rounded-lg cursor-pointer transition-colors ${
                        answers[currentQ._id] === key
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <input
                        type="radio"
                        name={`question-${currentQ._id}`}
                        value={key}
                        checked={answers[currentQ._id] === key}
                        onChange={(e) => handleAnswerChange(currentQ._id, e.target.value)}
                        className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500"
                      />
                      <div className="flex-1">
                        <span className="font-medium text-gray-900">{key})</span>
                        <span className="ml-2 text-gray-700">{value}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Instant Feedback for Practice Tests */}
              {test.testType === 'Practice' && showInstantFeedback && currentFeedback && (
                <div className={`mb-6 p-4 rounded-lg border-l-4 ${
                  currentFeedback.isCorrect 
                    ? 'bg-green-50 border-green-400' 
                    : 'bg-red-50 border-red-400'
                }`}>
                  <div className="flex items-center gap-2 mb-2">
                    {currentFeedback.isCorrect ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-600" />
                    )}
                    <span className={`font-medium ${
                      currentFeedback.isCorrect ? 'text-green-800' : 'text-red-800'
                    }`}>
                      {currentFeedback.isCorrect ? 'Correct!' : 'Incorrect'}
                    </span>
                  </div>
                  <p className={`text-sm ${
                    currentFeedback.isCorrect ? 'text-green-700' : 'text-red-700'
                  }`}>
                    {currentFeedback.explanation}
                  </p>
                </div>
              )}
              {/* Navigation Buttons */}
              <div className="flex justify-between">
                <button
                  onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
                  disabled={currentQuestion === 0}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                
                <div className="flex gap-2">
                  {currentQuestion < test.numberOfQuestions - 1 ? (
                    <button
                      onClick={handleNextQuestion}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Next
                    </button>
                  ) : (
                    <button
                      onClick={() => setShowConfirmSubmit(true)}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
                    >
                      <Send size={16} />
                      Submit Test
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Submit Confirmation Modal */}
      {showConfirmSubmit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle className="text-orange-500" size={24} />
              <h3 className="text-lg font-medium">Confirm Submission</h3>
            </div>
            
            <div className="mb-6">
              <p className="text-gray-600 mb-3">
                Are you sure you want to submit your test?
              </p>
              <div className="bg-gray-50 p-3 rounded">
                <p className="text-sm">
                  <strong>Answered:</strong> {getAnsweredCount()}/{test.numberOfQuestions} questions
                </p>
                <p className="text-sm">
                  <strong>Time Remaining:</strong> {formatTime(timeLeft)}
                </p>
                {test.testType && (
                  <p className="text-sm">
                    <strong>Test Type:</strong> {test.testType}
                  </p>
                )}
              </div>
              <p className="text-sm text-red-600 mt-2">
                ⚠️ You cannot change your answers after submission.
              </p>
            </div>
            
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowConfirmSubmit(false)}
                disabled={submitting}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
              >
                Continue Test
              </button>
              <button
                onClick={() => handleSubmit()}
                disabled={submitting}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
              >
                {submitting ? (
                  <>
                    <LoadingSpinner size="sm" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <CheckCircle size={16} />
                    Submit Now
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentTestInterface;