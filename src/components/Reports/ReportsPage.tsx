import React, { useState, useEffect } from 'react';
import { BarChart3, Users, TrendingUp, Download, Filter, Calendar, BookOpen, GraduationCap } from 'lucide-react';
import apiService from '../../services/api';
import LoadingSpinner from '../UI/LoadingSpinner';
import ExportButton from '../Dashboard/ExportButton';

interface ReportsPageProps {
  userRole: string;
}

interface FilterOptions {
  batch: string;
  branch: string;
  section: string;
}

interface ReportData {
  students: any[];
  performance: any[];
  attempts: any[];
  summary: {
    totalStudents: number;
    totalAttempts: number;
    averagePercentage: number;
  };
  sectionPerformance?: any[];
}

const ReportsPage: React.FC<ReportsPageProps> = ({ userRole }) => {
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [filters, setFilters] = useState<FilterOptions>({
    batch: 'all',
    branch: 'all',
    section: 'all'
  });
  const [filterOptions, setFilterOptions] = useState({
    batches: [] as string[],
    branches: [] as string[],
    sections: [] as string[]
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadFilterOptions();
  }, []);

  useEffect(() => {
    loadReportData();
  }, [filters]);

  const loadFilterOptions = async () => {
    try {
      const hierarchyData = await apiService.getCollegeHierarchy();
      const hierarchy = hierarchyData.hierarchy;
      
      const batches = Object.keys(hierarchy);
      const branches = new Set<string>();
      const sections = new Set<string>();
      
      Object.values(hierarchy).forEach((batchData: any) => {
        Object.keys(batchData).forEach(branch => {
          branches.add(branch);
          Object.keys(batchData[branch]).forEach(section => {
            sections.add(section);
          });
        });
      });
      
      setFilterOptions({
        batches,
        branches: Array.from(branches),
        sections: Array.from(sections)
      });
    } catch (error) {
      console.error('Failed to load filter options:', error);
    }
  };

  const loadReportData = async () => {
    try {
      setLoading(true);
      
      let data;
      if (userRole === 'college_admin') {
        data = await apiService.getHierarchicalReports(
          filters.batch === 'all' ? undefined : filters.batch,
          filters.branch === 'all' ? undefined : filters.branch,
          filters.section === 'all' ? undefined : filters.section
        );
      } else if (userRole === 'faculty') {
        data = await apiService.getFacultyHierarchicalReports(
          filters.batch === 'all' ? undefined : filters.batch,
          filters.section === 'all' ? undefined : filters.section
        );
      }
      
      setReportData(data);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to load report data');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: keyof FilterOptions, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({ batch: 'all', branch: 'all', section: 'all' });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getPerformanceColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
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
          onClick={loadReportData}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Performance Reports</h2>
          <p className="text-gray-600">
            {userRole === 'college_admin' ? 'College-wide' : 'Branch-specific'} student performance analysis
          </p>
        </div>
        {reportData && (
          <ExportButton 
            data={reportData} 
            filename={`performance-report-${new Date().toISOString().split('T')[0]}`}
            title="Performance Report"
          />
        )}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center gap-4 mb-4">
          <Filter className="h-5 w-5 text-gray-600" />
          <h3 className="text-lg font-medium">Report Filters</h3>
          <button
            onClick={clearFilters}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            Clear All
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Batch</label>
            <select
              value={filters.batch}
              onChange={(e) => handleFilterChange('batch', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Batches</option>
              {filterOptions.batches.map(batch => (
                <option key={batch} value={batch}>{batch}</option>
              ))}
            </select>
          </div>

          {userRole === 'college_admin' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Branch</label>
              <select
                value={filters.branch}
                onChange={(e) => handleFilterChange('branch', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Branches</option>
                {filterOptions.branches.map(branch => (
                  <option key={branch} value={branch}>{branch}</option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Section</label>
            <select
              value={filters.section}
              onChange={(e) => handleFilterChange('section', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Sections</option>
              {filterOptions.sections.map(section => (
                <option key={section} value={section}>{section}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {reportData && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Students</p>
                  <p className="text-2xl font-bold text-gray-900">{reportData.summary.totalStudents}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <BarChart3 className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Attempts</p>
                  <p className="text-2xl font-bold text-gray-900">{reportData.summary.totalAttempts}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <TrendingUp className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Average Performance</p>
                  <p className={`text-2xl font-bold ${getPerformanceColor(reportData.summary.averagePercentage)}`}>
                    {reportData.summary.averagePercentage.toFixed(1)}%
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Performance Table */}
          {reportData.performance.length > 0 && (
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b">
                <h3 className="text-lg font-medium">Student Performance</h3>
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
                        Total Attempts
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Average Score
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total Marks
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {reportData.performance.map((perf: any) => (
                      <tr key={perf.student._id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{perf.student.name}</div>
                            <div className="text-sm text-gray-500">{perf.student.email}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {perf.student.branch} / {perf.student.batch} / {perf.student.section}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {perf.totalAttempts}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`text-sm font-medium ${getPerformanceColor(perf.averagePercentage)}`}>
                            {perf.averagePercentage.toFixed(1)}%
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {perf.marksObtained} / {perf.totalMarks}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Section Performance for Faculty */}
          {userRole === 'faculty' && reportData.sectionPerformance && reportData.sectionPerformance.length > 0 && (
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b">
                <h3 className="text-lg font-medium">Section-wise Performance</h3>
              </div>
              <div className="p-6">
                <div className="grid gap-4">
                  {reportData.sectionPerformance.map((section: any) => (
                    <div key={section.section} className="border rounded-lg p-4">
                      <div className="flex justify-between items-center mb-3">
                        <h4 className="font-medium text-gray-900">Section {section.section}</h4>
                        <span className={`text-lg font-bold ${getPerformanceColor(section.averagePercentage)}`}>
                          {section.averagePercentage.toFixed(1)}%
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">Students</p>
                          <p className="font-medium">{section.studentsCount}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Attempts</p>
                          <p className="font-medium">{section.totalAttempts}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Total Marks</p>
                          <p className="font-medium">{section.marksObtained} / {section.totalMarks}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Recent Test Attempts */}
          {reportData.attempts.length > 0 && (
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b">
                <h3 className="text-lg font-medium">Recent Test Attempts</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Student
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Test
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Score
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {reportData.attempts.slice(0, 10).map((attempt: any) => (
                      <tr key={attempt._id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{attempt.studentId.name}</div>
                            <div className="text-sm text-gray-500">
                              {attempt.studentId.branch} / {attempt.studentId.batch} / {attempt.studentId.section}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{attempt.testId.testName}</div>
                            <div className="text-sm text-gray-500">{attempt.testId.subject}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm">
                            <span className={`font-medium ${getPerformanceColor(attempt.percentage)}`}>
                              {attempt.percentage.toFixed(1)}%
                            </span>
                            <div className="text-gray-500">
                              {attempt.marksObtained} / {attempt.totalMarks}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(attempt.createdAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {!reportData && !loading && (
        <div className="text-center py-12">
          <BarChart3 className="mx-auto h-12 w-12 text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No data available</h3>
          <p className="text-gray-600">No test attempts found for the selected filters</p>
        </div>
      )}
    </div>
  );
};

export default ReportsPage;