import React, { useState, useEffect } from 'react';
import { FileText, Users, TrendingUp, Award, Clock, Download, ArrowLeft } from 'lucide-react';
import apiService from '../../services/api';
import LoadingSpinner from '../UI/LoadingSpinner';

interface CollegeTestReportProps {
  testId: string;
  onBack: () => void;
}

const CollegeTestReport: React.FC<CollegeTestReportProps> = ({ testId, onBack }) => {
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadReport();
  }, [testId]);

  const loadReport = async () => {
    try {
      setLoading(true);
      const data = await apiService.getCollegeTestReport(testId);
      setReport(data);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to load report');
    } finally {
      setLoading(false);
    }
  };

  const downloadCSV = () => {
    if (!report) return;

    const headers = ['Student Name', 'ID Number', 'Branch', 'Batch', 'Section', 'Status', 'Marks Obtained', 'Total Marks', 'Percentage', 'Time Spent (min)'];
    const rows = report.students.map((student: any) => [
      student.name,
      student.idNumber,
      student.branch,
      student.batch,
      student.section,
      student.status,
      student.marksObtained,
      student.totalMarks,
      student.percentage.toFixed(2) + '%',
      Math.round(student.timeSpent / 60)
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((row: any[]) => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${report.test.testName}_report.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
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
          onClick={onBack}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Go Back
        </button>
      </div>
    );
  }

  if (!report) return null;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft size={20} />
          Back to Tests
        </button>
        <button
          onClick={downloadCSV}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          <Download size={18} />
          Download CSV
        </button>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{report.test.testName}</h2>
        <div className="flex flex-wrap gap-2 mb-4">
          <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
            {report.test.subject}
          </span>
          {report.test.testType && (
            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
              {report.test.testType}
            </span>
          )}
          {report.test.difficulty && (
            <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
              {report.test.difficulty}
            </span>
          )}
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
          <div>
            <span className="font-medium">Questions:</span> {report.test.numberOfQuestions}
          </div>
          <div>
            <span className="font-medium">Total Marks:</span> {report.test.totalMarks}
          </div>
          <div>
            <span className="font-medium">Duration:</span> {report.test.duration} min
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Assigned</p>
              <p className="text-3xl font-bold text-gray-900">{report.statistics.totalAssigned}</p>
            </div>
            <Users className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Completed</p>
              <p className="text-3xl font-bold text-gray-900">{report.statistics.totalCompleted}</p>
              <p className="text-xs text-gray-500">{report.statistics.completionRate}% completion</p>
            </div>
            <FileText className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Average Score</p>
              <p className="text-3xl font-bold text-gray-900">{report.statistics.averageScore}</p>
              <p className="text-xs text-gray-500">
                H: {report.statistics.highestScore} | L: {report.statistics.lowestScore}
              </p>
            </div>
            <TrendingUp className="h-8 w-8 text-purple-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Pass Rate</p>
              <p className="text-3xl font-bold text-gray-900">{report.statistics.passRate}%</p>
              <p className="text-xs text-gray-500">
                {report.statistics.passedStudents} / {report.statistics.totalCompleted} passed
              </p>
            </div>
            <Award className="h-8 w-8 text-orange-600" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b">
          <h3 className="text-lg font-medium">Student-wise Results</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Student
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Branch/Batch/Section
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Score
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Percentage
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Time Spent
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {report.students.map((student: any, index: number) => (
                <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{student.name}</div>
                      <div className="text-sm text-gray-500">{student.idNumber}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {student.branch} / {student.batch} / {student.section}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      student.status === 'Completed'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {student.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {student.marksObtained} / {student.totalMarks}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                        <div
                          className={`h-2 rounded-full ${
                            student.percentage >= 60 ? 'bg-green-500' :
                            student.percentage >= 40 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${Math.min(student.percentage, 100)}%` }}
                        />
                      </div>
                      <span className="text-sm text-gray-900">{student.percentage.toFixed(1)}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {Math.round(student.timeSpent / 60)} min
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CollegeTestReport;
