import React from 'react';
import { Clock, Calendar, FileText, Users, Eye, Send } from 'lucide-react';

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

interface TestCardProps {
  test: Test;
  onView: (testId: string) => void;
  onAssign: (testId: string) => void;
  showActions?: boolean;
}

const TestCard: React.FC<TestCardProps> = ({ test, onView, onAssign, showActions = true }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getSubjectColor = (subject: string) => {
    const colors = {
      'Verbal': 'bg-blue-100 text-blue-800',
      'Reasoning': 'bg-green-100 text-green-800',
      'Technical': 'bg-purple-100 text-purple-800',
      'Arithmetic': 'bg-orange-100 text-orange-800',
      'Communication': 'bg-pink-100 text-pink-800'
    };
    return colors[subject as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const isActive = () => {
    const now = new Date();
    const start = new Date(test.startDateTime);
    const end = new Date(test.endDateTime);
    return now >= start && now <= end;
  };

  const getStatus = () => {
    const now = new Date();
    const start = new Date(test.startDateTime);
    const end = new Date(test.endDateTime);
    
    if (now < start) return { text: 'Upcoming', color: 'bg-yellow-100 text-yellow-800' };
    if (now > end) return { text: 'Ended', color: 'bg-red-100 text-red-800' };
    return { text: 'Active', color: 'bg-green-100 text-green-800' };
  };

  const status = getStatus();

  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-lg font-semibold text-gray-900">{test.testName}</h3>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSubjectColor(test.subject)}`}>
              {test.subject}
            </span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${status.color}`}>
              {status.text}
            </span>
          </div>
          <p className="text-gray-600 text-sm mb-3">{test.testDescription}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <div className="text-center p-2 bg-gray-50 rounded">
          <FileText className="w-5 h-5 mx-auto mb-1 text-gray-600" />
          <p className="text-xs text-gray-600">Questions</p>
          <p className="font-semibold">{test.numberOfQuestions}</p>
        </div>
        <div className="text-center p-2 bg-gray-50 rounded">
          <Users className="w-5 h-5 mx-auto mb-1 text-gray-600" />
          <p className="text-xs text-gray-600">Total Marks</p>
          <p className="font-semibold">{test.totalMarks}</p>
        </div>
        <div className="text-center p-2 bg-gray-50 rounded">
          <Clock className="w-5 h-5 mx-auto mb-1 text-gray-600" />
          <p className="text-xs text-gray-600">Duration</p>
          <p className="font-semibold">{test.duration} min</p>
        </div>
        <div className="text-center p-2 bg-gray-50 rounded">
          <Calendar className="w-5 h-5 mx-auto mb-1 text-gray-600" />
          <p className="text-xs text-gray-600">Created</p>
          <p className="font-semibold text-xs">{formatDate(test.createdAt)}</p>
        </div>
      </div>

      <div className="border-t pt-4">
        <div className="text-sm text-gray-600 mb-3">
          <p><strong>Start:</strong> {formatDate(test.startDateTime)}</p>
          <p><strong>End:</strong> {formatDate(test.endDateTime)}</p>
        </div>

        {showActions && (
          <div className="flex gap-2">
            <button
              onClick={() => onView(test._id)}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2 text-sm"
            >
              <Eye size={16} />
              View
            </button>
            <button
              onClick={() => onAssign(test._id)}
              className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 flex items-center justify-center gap-2 text-sm"
            >
              <Send size={16} />
              Assign
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TestCard;