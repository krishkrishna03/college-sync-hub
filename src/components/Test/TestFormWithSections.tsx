import React, { useState } from 'react';
import { Plus, Upload, Eye, Trash2, FileText, Clock, Calendar, Hash, XCircle, Edit2 } from 'lucide-react';
import LoadingSpinner from '../UI/LoadingSpinner';
import SectionConfiguration from './SectionConfiguration';
import QuestionPreviewModal from './QuestionPreviewModal';
import apiService from '../../services/api';

interface Question {
  questionText: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  correctAnswer: 'A' | 'B' | 'C' | 'D';
  marks: number;
}

interface Section {
  sectionName: string;
  sectionDuration: number;
  numberOfQuestions: number;
  marksPerQuestion: number;
  questions: Question[];
}

interface TestFormData {
  testName: string;
  testDescription: string;
  subject: 'Verbal' | 'Reasoning' | 'Technical' | 'Arithmetic' | 'Communication';
  testType: 'Assessment' | 'Practice' | 'Assignment' | 'Mock Test' | 'Specific Company Test';
  companyName?: string;
  topics: string[];
  difficulty: 'Easy' | 'Medium' | 'Hard';
  numberOfQuestions: number;
  marksPerQuestion: number;
  duration: number;
  startDateTime: string;
  endDateTime: string;
  questions: Question[];
  hasSections?: boolean;
  sections?: Section[];
}

interface TestFormWithSectionsProps {
  onSubmit: (data: TestFormData) => Promise<void>;
  loading: boolean;
  initialData?: any;
}

const TestFormWithSections: React.FC<TestFormWithSectionsProps> = ({ onSubmit, loading, initialData }) => {
  const formatDateTimeLocal = (dateString: string) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const shouldShowSectionOption = (testType: string) => {
    return ['Assessment', 'Mock Test', 'Specific Company Test'].includes(testType);
  };

  const [formData, setFormData] = useState<TestFormData>({
    testName: initialData?.testName || '',
    testDescription: initialData?.testDescription || '',
    subject: initialData?.subject || 'Technical',
    testType: initialData?.testType || 'Assessment',
    companyName: initialData?.companyName || '',
    topics: initialData?.topics || [],
    difficulty: initialData?.difficulty || 'Medium',
    numberOfQuestions: initialData?.numberOfQuestions || 10,
    marksPerQuestion: initialData?.marksPerQuestion || 1,
    duration: initialData?.duration || 60,
    startDateTime: initialData?.startDateTime ? formatDateTimeLocal(initialData.startDateTime) : '',
    endDateTime: initialData?.endDateTime ? formatDateTimeLocal(initialData.endDateTime) : '',
    questions: initialData?.questions || [],
    hasSections: initialData?.hasSections || false,
    sections: initialData?.sections || []
  });

  const [currentQuestion, setCurrentQuestion] = useState<Question>({
    questionText: '',
    options: { A: '', B: '', C: '', D: '' },
    correctAnswer: 'A',
    marks: 1
  });

  const [activeSectionForQuestions, setActiveSectionForQuestions] = useState<number | null>(null);
  const [showQuestionForm, setShowQuestionForm] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [errors, setErrors] = useState<any>({});
  const [editingQuestionIndex, setEditingQuestionIndex] = useState<number | null>(null);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [uploadingSectionIndex, setUploadingSectionIndex] = useState<number | null>(null);
  const [fileUploadLoading, setFileUploadLoading] = useState(false);
  const [showSectionQuestionsPreview, setShowSectionQuestionsPreview] = useState(false);

  const subjects = ['Verbal', 'Reasoning', 'Technical', 'Arithmetic', 'Communication'];
  const testTypes = ['Assessment', 'Practice', 'Assignment', 'Mock Test', 'Specific Company Test'];
  const difficulties = ['Easy', 'Medium', 'Hard'];

  const topicOptions = {
    'Verbal': ['Vocabulary', 'Grammar', 'Reading Comprehension', 'Synonyms & Antonyms', 'Sentence Completion'],
    'Reasoning': ['Logical Reasoning', 'Analytical Reasoning', 'Verbal Reasoning', 'Non-Verbal Reasoning', 'Critical Thinking'],
    'Technical': ['Programming', 'Data Structures', 'Algorithms', 'Database', 'Networking', 'Operating Systems'],
    'Arithmetic': ['Basic Math', 'Algebra', 'Geometry', 'Statistics', 'Probability', 'Number Systems'],
    'Communication': ['Written Communication', 'Verbal Communication', 'Presentation Skills', 'Business Communication', 'Email Etiquette']
  };

  const handleTopicChange = (topic: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      topics: checked
        ? [...prev.topics, topic]
        : prev.topics.filter(t => t !== topic)
    }));
  };

  const handleSectionToggle = (enabled: boolean) => {
    setFormData(prev => ({
      ...prev,
      hasSections: enabled,
      sections: enabled ? (prev.sections?.length ? prev.sections : []) : [],
      questions: enabled ? [] : prev.questions
    }));
  };

  const handleTestTypeChange = (newTestType: any) => {
    const requiresSections = ['Assessment', 'Mock Test', 'Specific Company Test'].includes(newTestType);
    setFormData(prev => ({
      ...prev,
      testType: newTestType,
      subject: newTestType === 'Practice' ? prev.subject : 'Technical',
      topics: [],
      hasSections: requiresSections,
      sections: requiresSections ? (prev.sections?.length ? prev.sections : []) : [],
      questions: requiresSections ? [] : prev.questions
    }));
  };

  const handleSectionsChange = (sections: Section[]) => {
    setFormData(prev => ({
      ...prev,
      sections
    }));
  };

  const handleAddQuestionsToSection = (sectionIndex: number) => {
    setActiveSectionForQuestions(sectionIndex);
    setShowQuestionForm(true);
  };

  const handleFileUploadToSection = async (sectionIndex: number, file: File) => {
    setFileUploadLoading(true);
    setUploadingSectionIndex(sectionIndex);

    try {
      const response = await apiService.extractQuestionsFromFile(file);

      if (response.questions && response.questions.length > 0) {
        const section = formData.sections![sectionIndex];
        const remainingSlots = section.numberOfQuestions - section.questions.length;

        if (remainingSlots <= 0) {
          alert(`Section "${section.sectionName}" already has maximum questions`);
          setFileUploadLoading(false);
          setUploadingSectionIndex(null);
          return;
        }

        const questionsToAdd = response.questions.slice(0, remainingSlots).map((q: any) => ({
          ...q,
          marks: section.marksPerQuestion
        }));

        const updatedSections = [...formData.sections!];
        updatedSections[sectionIndex] = {
          ...section,
          questions: [...section.questions, ...questionsToAdd]
        };

        setFormData(prev => ({
          ...prev,
          sections: updatedSections
        }));

        alert(`Successfully added ${questionsToAdd.length} questions to section "${section.sectionName}"`);
      }
    } catch (error: any) {
      console.error('File upload error:', error);
      alert(error.message || 'Failed to upload file');
    } finally {
      setFileUploadLoading(false);
      setUploadingSectionIndex(null);
    }
  };

  const handleEditQuestion = (sectionIndex: number | null, questionIndex: number) => {
    let question: Question;

    if (sectionIndex !== null) {
      question = formData.sections![sectionIndex].questions[questionIndex];
    } else {
      question = formData.questions[questionIndex];
    }

    setEditingQuestion({ ...question });
    setEditingQuestionIndex(questionIndex);
    setActiveSectionForQuestions(sectionIndex);
  };

  const handleEditQuestionFromPreview = (questionIndex: number, updatedQuestion: Question) => {
    if (activeSectionForQuestions !== null) {
      const updatedSections = [...formData.sections!];
      updatedSections[activeSectionForQuestions].questions[questionIndex] = updatedQuestion;
      setFormData(prev => ({ ...prev, sections: updatedSections }));
    }
  };

  const handleDeleteQuestionFromPreview = (questionIndex: number) => {
    if (activeSectionForQuestions !== null) {
      removeQuestion(questionIndex, activeSectionForQuestions);
    }
  };

  const handleSaveEditedQuestion = () => {
    if (!editingQuestion || editingQuestionIndex === null) return;

    if (!validateEditedQuestion()) {
      alert('Please fill all question fields correctly');
      return;
    }

    if (activeSectionForQuestions !== null) {
      const updatedSections = [...formData.sections!];
      const section = updatedSections[activeSectionForQuestions];
      section.questions[editingQuestionIndex] = { ...editingQuestion, marks: section.marksPerQuestion };

      setFormData(prev => ({
        ...prev,
        sections: updatedSections
      }));
    } else {
      const updatedQuestions = [...formData.questions];
      updatedQuestions[editingQuestionIndex] = { ...editingQuestion, marks: formData.marksPerQuestion };

      setFormData(prev => ({
        ...prev,
        questions: updatedQuestions
      }));
    }

    setEditingQuestion(null);
    setEditingQuestionIndex(null);
    setActiveSectionForQuestions(null);
  };

  const handleCancelEdit = () => {
    setEditingQuestion(null);
    setEditingQuestionIndex(null);
    setActiveSectionForQuestions(null);
  };

  const validateEditedQuestion = (): boolean => {
    if (!editingQuestion) return false;

    return editingQuestion.questionText.trim() !== '' &&
           editingQuestion.options.A.trim() !== '' &&
           editingQuestion.options.B.trim() !== '' &&
           editingQuestion.options.C.trim() !== '' &&
           editingQuestion.options.D.trim() !== '' &&
           ['A', 'B', 'C', 'D'].includes(editingQuestion.correctAnswer);
  };

  const addQuestion = () => {
    if (!validateQuestion()) {
      alert('Please fill all question fields correctly');
      return;
    }

    if (formData.hasSections && activeSectionForQuestions !== null) {
      const section = formData.sections![activeSectionForQuestions];
      if (section.questions.length >= section.numberOfQuestions) {
        alert(`Maximum ${section.numberOfQuestions} questions allowed for this section`);
        return;
      }

      const updatedSections = [...formData.sections!];
      updatedSections[activeSectionForQuestions] = {
        ...section,
        questions: [...section.questions, { ...currentQuestion, marks: section.marksPerQuestion }]
      };

      setFormData(prev => ({
        ...prev,
        sections: updatedSections
      }));
    } else {
      if (formData.questions.length >= formData.numberOfQuestions) {
        alert(`Maximum ${formData.numberOfQuestions} questions allowed`);
        return;
      }

      setFormData(prev => ({
        ...prev,
        questions: [...prev.questions, { ...currentQuestion, marks: formData.marksPerQuestion }]
      }));
    }

    setCurrentQuestion({
      questionText: '',
      options: { A: '', B: '', C: '', D: '' },
      correctAnswer: 'A',
      marks: formData.marksPerQuestion
    });
  };

  const removeQuestion = (index: number, sectionIndex?: number) => {
    if (typeof sectionIndex === 'number') {
      const updatedSections = [...formData.sections!];
      updatedSections[sectionIndex] = {
        ...updatedSections[sectionIndex],
        questions: updatedSections[sectionIndex].questions.filter((_, i) => i !== index)
      };
      setFormData(prev => ({ ...prev, sections: updatedSections }));
    } else {
      setFormData(prev => ({
        ...prev,
        questions: prev.questions.filter((_, i) => i !== index)
      }));
    }
  };

  const validateQuestion = (): boolean => {
    return currentQuestion.questionText.trim() !== '' &&
           currentQuestion.options.A.trim() !== '' &&
           currentQuestion.options.B.trim() !== '' &&
           currentQuestion.options.C.trim() !== '' &&
           currentQuestion.options.D.trim() !== '' &&
           ['A', 'B', 'C', 'D'].includes(currentQuestion.correctAnswer);
  };

  const validateForm = (): boolean => {
    const newErrors: any = {};

    if (!formData.testName.trim()) newErrors.testName = 'Test name is required';
    if (!formData.testDescription.trim()) newErrors.testDescription = 'Description is required';
    if (!formData.startDateTime) newErrors.startDateTime = 'Start date is required';
    if (!formData.endDateTime) newErrors.endDateTime = 'End date is required';

    if (formData.startDateTime && formData.endDateTime) {
      if (new Date(formData.startDateTime) >= new Date(formData.endDateTime)) {
        newErrors.endDateTime = 'End date must be after start date';
      }
    }

    if (formData.testType === 'Specific Company Test' && !formData.companyName?.trim()) {
      newErrors.companyName = 'Company name is required for Specific Company tests';
    }

    if (formData.hasSections) {
      if (!formData.sections || formData.sections.length === 0) {
        newErrors.sections = 'At least one section is required';
      } else {
        for (let i = 0; i < formData.sections.length; i++) {
          const section = formData.sections[i];
          if (section.questions.length !== section.numberOfQuestions) {
            newErrors.sections = `Section "${section.sectionName}" needs exactly ${section.numberOfQuestions} questions`;
            break;
          }
        }
      }
    } else {
      if (formData.numberOfQuestions < 1) newErrors.numberOfQuestions = 'Must have at least 1 question';
      if (formData.marksPerQuestion < 1) newErrors.marksPerQuestion = 'Marks must be at least 1';
      if (formData.duration < 5) newErrors.duration = 'Duration must be at least 5 minutes';
      if (formData.questions.length !== formData.numberOfQuestions) {
        newErrors.questions = `You need exactly ${formData.numberOfQuestions} questions`;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const payload = {
        testName: formData.testName,
        testDescription: formData.testDescription,
        subject: formData.subject,
        testType: formData.testType,
        companyName: formData.companyName || null,
        topics: formData.topics,
        difficulty: formData.difficulty,
        hasSections: formData.hasSections,
        sections: formData.hasSections ? formData.sections : [],
        numberOfQuestions: formData.hasSections ? 0 : formData.numberOfQuestions,
        marksPerQuestion: formData.hasSections ? 0 : formData.marksPerQuestion,
        duration: formData.hasSections ? 0 : formData.duration,
        startDateTime: formData.startDateTime,
        endDateTime: formData.endDateTime,
        questions: formData.hasSections ? [] : formData.questions,
        sourceType: 'manual'
      };

      console.log('Submitting test with payload:', payload);
      await onSubmit(payload);

      setFormData({
        testName: '',
        testDescription: '',
        subject: 'Technical',
        testType: 'Assessment',
        companyName: '',
        topics: [],
        difficulty: 'Medium',
        numberOfQuestions: 10,
        marksPerQuestion: 1,
        duration: 60,
        startDateTime: '',
        endDateTime: '',
        questions: [],
        hasSections: false,
        sections: []
      });
      setErrors({});
    } catch (error) {
      console.error('Form submission error:', error);
      alert(`Test creation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white p-6 rounded-lg border">
        <h3 className="text-lg font-medium mb-4">Test Information</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FileText className="inline w-4 h-4 mr-1" />
              Test Name
            </label>
            <input
              type="text"
              value={formData.testName}
              onChange={(e) => setFormData(prev => ({ ...prev, testName: e.target.value }))}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                errors.testName ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter test name"
            />
            {errors.testName && <p className="mt-1 text-sm text-red-600">{errors.testName}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Test Type</label>
            <select
              value={formData.testType}
              onChange={(e) => handleTestTypeChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              {testTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          {formData.testType === 'Practice' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
              <select
                value={formData.subject}
                onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value as any }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                {subjects.map(subject => (
                  <option key={subject} value={subject}>{subject}</option>
                ))}
              </select>
            </div>
          )}

          {formData.testType === 'Specific Company Test' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Company Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.companyName || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, companyName: e.target.value }))}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                  errors.companyName ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter company name"
              />
              {errors.companyName && <p className="mt-1 text-sm text-red-600">{errors.companyName}</p>}
            </div>
          )}

          <div className="md:col-span-3">
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea
              value={formData.testDescription}
              onChange={(e) => setFormData(prev => ({ ...prev, testDescription: e.target.value }))}
              rows={3}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                errors.testDescription ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter test description"
            />
            {errors.testDescription && <p className="mt-1 text-sm text-red-600">{errors.testDescription}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty Level</label>
            <select
              value={formData.difficulty}
              onChange={(e) => setFormData(prev => ({ ...prev, difficulty: e.target.value as any }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              {difficulties.map(difficulty => (
                <option key={difficulty} value={difficulty}>{difficulty}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="inline w-4 h-4 mr-1" />
              Start Date & Time
            </label>
            <input
              type="datetime-local"
              value={formData.startDateTime}
              onChange={(e) => setFormData(prev => ({ ...prev, startDateTime: e.target.value }))}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                errors.startDateTime ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.startDateTime && <p className="mt-1 text-sm text-red-600">{errors.startDateTime}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">End Date & Time</label>
            <input
              type="datetime-local"
              value={formData.endDateTime}
              onChange={(e) => setFormData(prev => ({ ...prev, endDateTime: e.target.value }))}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                errors.endDateTime ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.endDateTime && <p className="mt-1 text-sm text-red-600">{errors.endDateTime}</p>}
          </div>
        </div>
      </div>

      {shouldShowSectionOption(formData.testType) && (
        <div className="bg-white p-6 rounded-lg border border-blue-300 bg-blue-50">
          <div className="mb-4">
            <h3 className="text-lg font-medium text-blue-900">Multi-Section Test Configuration</h3>
            <p className="text-sm text-blue-700">This test type requires multiple sections. Configure each section with its own duration, questions, and marks.</p>
          </div>

          <SectionConfiguration
            sections={formData.sections || []}
            onSectionsChange={handleSectionsChange}
            onAddQuestions={handleAddQuestionsToSection}
            onUploadFile={handleFileUploadToSection}
            uploadingSectionIndex={uploadingSectionIndex}
            fileUploadLoading={fileUploadLoading}
          />
          {errors.sections && <p className="mt-2 text-sm text-red-600">{errors.sections}</p>}
        </div>
      )}

      {!formData.hasSections && !shouldShowSectionOption(formData.testType) && (
        <div className="bg-white p-6 rounded-lg border">
          <h3 className="text-lg font-medium mb-4">Test Configuration</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Hash className="inline w-4 h-4 mr-1" />
                Number of Questions
              </label>
              <input
                type="number"
                min="1"
                max="100"
                value={formData.numberOfQuestions}
                onChange={(e) => setFormData(prev => ({ ...prev, numberOfQuestions: parseInt(e.target.value) || 0 }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Marks per Question</label>
              <input
                type="number"
                min="1"
                max="10"
                value={formData.marksPerQuestion}
                onChange={(e) => setFormData(prev => ({ ...prev, marksPerQuestion: parseInt(e.target.value) || 0 }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Clock className="inline w-4 h-4 mr-1" />
                Duration (minutes)
              </label>
              <input
                type="number"
                min="5"
                max="300"
                value={formData.duration}
                onChange={(e) => setFormData(prev => ({ ...prev, duration: parseInt(e.target.value) || 0 }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      )}

      {!formData.hasSections && !shouldShowSectionOption(formData.testType) && (
        <div className="bg-white p-6 rounded-lg border">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">
              Questions ({formData.questions.length}/{formData.numberOfQuestions})
            </h3>
            <div className="flex gap-2">
              <label className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 cursor-pointer flex items-center gap-1">
                <Upload size={14} />
                Upload JSON/CSV
                <input
                  type="file"
                  accept=".json,.csv"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setFileUploadLoading(true);
                      try {
                        const response = await apiService.extractQuestionsFromFile(file);
                        if (response.questions && response.questions.length > 0) {
                          const remainingSlots = formData.numberOfQuestions - formData.questions.length;
                          if (remainingSlots <= 0) {
                            alert('Test already has maximum questions');
                            return;
                          }
                          const questionsToAdd = response.questions.slice(0, remainingSlots).map((q: any) => ({
                            ...q,
                            marks: formData.marksPerQuestion
                          }));
                          setFormData(prev => ({
                            ...prev,
                            questions: [...prev.questions, ...questionsToAdd]
                          }));
                          alert(`Successfully added ${questionsToAdd.length} questions`);
                        }
                      } catch (error: any) {
                        console.error('File upload error:', error);
                        alert(error.message || 'Failed to upload file');
                      } finally {
                        setFileUploadLoading(false);
                        e.target.value = '';
                      }
                    }
                  }}
                  className="hidden"
                  disabled={fileUploadLoading}
                />
              </label>
              <button
                type="button"
                onClick={() => setShowQuestionForm(!showQuestionForm)}
                className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 flex items-center gap-1"
              >
                <Plus size={14} />
                Add Question
              </button>
            </div>
          </div>

          {fileUploadLoading && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-2">
                <LoadingSpinner size="sm" />
                <span className="text-sm text-blue-700">Uploading and processing file...</span>
              </div>
            </div>
          )}

          {showQuestionForm && (
            <div className="mb-6 p-4 border rounded-lg bg-gray-50">
              <h4 className="font-medium mb-3">Add Question</h4>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Question Text</label>
                  <textarea
                    value={currentQuestion.questionText}
                    onChange={(e) => setCurrentQuestion(prev => ({ ...prev, questionText: e.target.value }))}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter your question here..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {['A', 'B', 'C', 'D'].map((option) => (
                    <div key={option}>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Option {option}</label>
                      <input
                        type="text"
                        value={currentQuestion.options[option as keyof typeof currentQuestion.options]}
                        onChange={(e) => setCurrentQuestion(prev => ({
                          ...prev,
                          options: { ...prev.options, [option]: e.target.value }
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder={`Enter option ${option}`}
                      />
                    </div>
                  ))}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Correct Answer</label>
                  <select
                    value={currentQuestion.correctAnswer}
                    onChange={(e) => setCurrentQuestion(prev => ({ ...prev, correctAnswer: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="A">A</option>
                    <option value="B">B</option>
                    <option value="C">C</option>
                    <option value="D">D</option>
                  </select>
                </div>

                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowQuestionForm(false)}
                    className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={addQuestion}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Add Question
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-3">
            {formData.questions.map((question, index) => (
              <div key={index} className="p-4 border rounded-lg border-gray-200">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h4 className="font-medium mb-2">{index + 1}. {question.questionText}</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      {Object.entries(question.options).map(([key, value]) => (
                        <div
                          key={key}
                          className={`p-1 rounded ${
                            question.correctAnswer === key ? 'bg-green-100' : 'bg-gray-100'
                          }`}
                        >
                          <span className="font-medium">{key})</span> {value}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <button
                      type="button"
                      onClick={() => handleEditQuestion(null, index)}
                      className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                      title="Edit question"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeQuestion(index)}
                      className="p-1 text-red-600 hover:bg-red-50 rounded"
                      title="Delete question"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {editingQuestion !== null && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-medium mb-4">Edit Question</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Question Text</label>
                <textarea
                  value={editingQuestion.questionText}
                  onChange={(e) => setEditingQuestion(prev => prev ? ({ ...prev, questionText: e.target.value }) : null)}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your question here..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {['A', 'B', 'C', 'D'].map((option) => (
                  <div key={option}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Option {option}</label>
                    <input
                      type="text"
                      value={editingQuestion.options[option as keyof typeof editingQuestion.options]}
                      onChange={(e) => setEditingQuestion(prev => prev ? ({
                        ...prev,
                        options: { ...prev.options, [option]: e.target.value }
                      }) : null)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder={`Enter option ${option}`}
                    />
                  </div>
                ))}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Correct Answer</label>
                <select
                  value={editingQuestion.correctAnswer}
                  onChange={(e) => setEditingQuestion(prev => prev ? ({ ...prev, correctAnswer: e.target.value as any }) : null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="A">A</option>
                  <option value="B">B</option>
                  <option value="C">C</option>
                  <option value="D">D</option>
                </select>
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveEditedQuestion}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {formData.hasSections && activeSectionForQuestions !== null && showQuestionForm && (
        <div className="bg-white p-6 rounded-lg border">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">
              Add Questions to: {formData.sections![activeSectionForQuestions].sectionName}
            </h3>
            <div className="flex gap-2 items-center">
              {formData.sections![activeSectionForQuestions].questions.length > 0 && (
                <button
                  type="button"
                  onClick={() => setShowSectionQuestionsPreview(true)}
                  className="px-3 py-1 bg-purple-600 text-white rounded text-sm hover:bg-purple-700 flex items-center gap-1"
                >
                  <Eye size={14} />
                  Preview All ({formData.sections![activeSectionForQuestions].questions.length})
                </button>
              )}
              <label className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 cursor-pointer flex items-center gap-1">
                <Upload size={14} />
                Upload JSON/CSV
                <input
                  type="file"
                  accept=".json,.csv"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      handleFileUploadToSection(activeSectionForQuestions, file);
                      e.target.value = '';
                    }
                  }}
                  className="hidden"
                  disabled={fileUploadLoading}
                />
              </label>
              <button
                type="button"
                onClick={() => {
                  setShowQuestionForm(false);
                  setActiveSectionForQuestions(null);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <XCircle size={20} />
              </button>
            </div>
          </div>

          {fileUploadLoading && uploadingSectionIndex === activeSectionForQuestions && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-2">
                <LoadingSpinner size="sm" />
                <span className="text-sm text-blue-700">Uploading and processing file...</span>
              </div>
            </div>
          )}

          <div className="mb-6 p-4 border rounded-lg bg-gray-50">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Question Text</label>
                <textarea
                  value={currentQuestion.questionText}
                  onChange={(e) => setCurrentQuestion(prev => ({ ...prev, questionText: e.target.value }))}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your question here..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {['A', 'B', 'C', 'D'].map((option) => (
                  <div key={option}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Option {option}</label>
                    <input
                      type="text"
                      value={currentQuestion.options[option as keyof typeof currentQuestion.options]}
                      onChange={(e) => setCurrentQuestion(prev => ({
                        ...prev,
                        options: { ...prev.options, [option]: e.target.value }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder={`Enter option ${option}`}
                    />
                  </div>
                ))}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Correct Answer</label>
                <select
                  value={currentQuestion.correctAnswer}
                  onChange={(e) => setCurrentQuestion(prev => ({ ...prev, correctAnswer: e.target.value as any }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="A">A</option>
                  <option value="B">B</option>
                  <option value="C">C</option>
                  <option value="D">D</option>
                </select>
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowQuestionForm(false);
                    setActiveSectionForQuestions(null);
                  }}
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                >
                  Done
                </button>
                <button
                  type="button"
                  onClick={addQuestion}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Add Question
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-medium">Questions in this section ({formData.sections![activeSectionForQuestions].questions.length})</h4>
            {formData.sections![activeSectionForQuestions].questions.map((question, index) => (
              <div key={index} className="p-4 border rounded-lg border-gray-200">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h4 className="font-medium mb-2">{index + 1}. {question.questionText}</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      {Object.entries(question.options).map(([key, value]) => (
                        <div
                          key={key}
                          className={`p-1 rounded ${
                            question.correctAnswer === key ? 'bg-green-100' : 'bg-gray-100'
                          }`}
                        >
                          <span className="font-medium">{key})</span> {value}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <button
                      type="button"
                      onClick={() => handleEditQuestion(activeSectionForQuestions, index)}
                      className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                      title="Edit question"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeQuestion(index, activeSectionForQuestions)}
                      className="p-1 text-red-600 hover:bg-red-50 rounded"
                      title="Delete question"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex justify-end gap-4">
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
        >
          {loading ? <LoadingSpinner size="sm" /> : null}
          Create Test
        </button>
      </div>

      {showSectionQuestionsPreview && activeSectionForQuestions !== null && (
        <QuestionPreviewModal
          isOpen={true}
          onClose={() => setShowSectionQuestionsPreview(false)}
          questions={formData.sections![activeSectionForQuestions].questions}
          sectionName={formData.sections![activeSectionForQuestions].sectionName}
          onEditQuestion={handleEditQuestionFromPreview}
          onDeleteQuestion={handleDeleteQuestionFromPreview}
        />
      )}
    </form>
  );
};

export default TestFormWithSections;
