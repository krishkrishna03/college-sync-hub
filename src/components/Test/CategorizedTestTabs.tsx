import React, { useState } from 'react';
import { FileText, BookOpen, Brain, Building, MessageSquare, Calculator } from 'lucide-react';

interface CategorizedTestTabsProps {
  onFilterChange: (testType: string, subject: string) => void;
  testCounts?: {
    assessment: { [subject: string]: number };
    practice: { [subject: string]: number };
    mockTest: { [subject: string]: number };
    company: { [subject: string]: number };
  };
  loading?: boolean;
}

const CategorizedTestTabs: React.FC<CategorizedTestTabsProps> = ({
  onFilterChange,
  testCounts,
  loading = false
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('assessment');
  const [activeSubject, setActiveSubject] = useState<string>('all');

  const categories = [
    { id: 'assessment', label: 'Assessment', icon: FileText, color: 'blue' },
    { id: 'practice', label: 'Practice', icon: BookOpen, color: 'green' },
    { id: 'mockTest', label: 'Mock Test', icon: Brain, color: 'orange' },
    { id: 'company', label: 'Specific Company', icon: Building, color: 'red' }
  ];

  const subjects = [
    { id: 'all', label: 'All Subjects', icon: BookOpen },
    { id: 'Verbal', label: 'Verbal', icon: MessageSquare },
    { id: 'Reasoning', label: 'Reasoning', icon: Brain },
    { id: 'Technical', label: 'Technical', icon: FileText },
    { id: 'Arithmetic', label: 'Arithmetic', icon: Calculator },
    { id: 'Communication', label: 'Communication', icon: MessageSquare }
  ];

  const handleCategoryChange = (categoryId: string) => {
    setActiveCategory(categoryId);
    setActiveSubject('all');

    const testTypeMap: { [key: string]: string } = {
      'assessment': 'Assessment',
      'practice': 'Practice',
      'mockTest': 'Mock Test',
      'company': 'Specific Company Test'
    };

    onFilterChange(testTypeMap[categoryId], 'all');
  };

  const handleSubjectChange = (subjectId: string) => {
    setActiveSubject(subjectId);

    const testTypeMap: { [key: string]: string } = {
      'assessment': 'Assessment',
      'practice': 'Practice',
      'mockTest': 'Mock Test',
      'company': 'Specific Company Test'
    };

    onFilterChange(testTypeMap[activeCategory], subjectId === 'all' ? 'all' : subjectId);
  };

  const getSubjectCount = (subject: string) => {
    if (!testCounts) return 0;
    const categoryKey = activeCategory as keyof typeof testCounts;
    const categoryData = testCounts[categoryKey];
    if (!categoryData) return 0;

    if (subject === 'all') {
      return Object.values(categoryData).reduce((sum, count) => sum + count, 0);
    }
    return categoryData[subject] || 0;
  };

  const getCategoryColor = (colorName: string, isActive: boolean) => {
    const colors: { [key: string]: { bg: string, text: string, active: string } } = {
      blue: {
        bg: isActive ? 'bg-blue-500' : 'bg-blue-100',
        text: isActive ? 'text-white' : 'text-blue-700',
        active: 'hover:bg-blue-200'
      },
      green: {
        bg: isActive ? 'bg-green-500' : 'bg-green-100',
        text: isActive ? 'text-white' : 'text-green-700',
        active: 'hover:bg-green-200'
      },
      orange: {
        bg: isActive ? 'bg-orange-500' : 'bg-orange-100',
        text: isActive ? 'text-white' : 'text-orange-700',
        active: 'hover:bg-orange-200'
      },
      red: {
        bg: isActive ? 'bg-red-500' : 'bg-red-100',
        text: isActive ? 'text-white' : 'text-red-700',
        active: 'hover:bg-red-200'
      }
    };
    return colors[colorName];
  };

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Test Categories</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {categories.map((category) => {
            const Icon = category.icon;
            const isActive = activeCategory === category.id;
            const colorScheme = getCategoryColor(category.color, isActive);

            return (
              <button
                key={category.id}
                onClick={() => handleCategoryChange(category.id)}
                disabled={loading}
                className={`${colorScheme.bg} ${colorScheme.text} ${!isActive && colorScheme.active}
                  p-4 rounded-lg transition-all duration-200 transform
                  ${isActive ? 'shadow-lg scale-105' : 'shadow hover:shadow-md'}
                  ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                  flex flex-col items-center gap-2`}
              >
                <Icon size={24} />
                <span className="font-semibold text-sm">{category.label}</span>
                {testCounts && (
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    isActive ? 'bg-white bg-opacity-30' : 'bg-white bg-opacity-50'
                  }`}>
                    {getSubjectCount('all')} tests
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Filter by Subject
          <span className="text-sm font-normal text-gray-500 ml-2">
            ({categories.find(c => c.id === activeCategory)?.label})
          </span>
        </h3>

        <div className="flex flex-wrap gap-2">
          {subjects.map((subject) => {
            const Icon = subject.icon;
            const isActive = activeSubject === subject.id;
            const count = getSubjectCount(subject.id);

            return (
              <button
                key={subject.id}
                onClick={() => handleSubjectChange(subject.id)}
                disabled={loading}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
                  ${isActive
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md transform scale-105'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200 hover:shadow-sm'
                  }
                  ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                `}
              >
                <Icon size={16} />
                {subject.label}
                {testCounts && (
                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                    isActive ? 'bg-white text-blue-600' : 'bg-gray-300 text-gray-700'
                  }`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CategorizedTestTabs;
