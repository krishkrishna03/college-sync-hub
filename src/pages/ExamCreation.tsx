import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, ArrowRight, Plus, Trash2, Save, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { examsAPI } from "@/lib/api";

interface Question {
  id: string;
  questionText: string;
  options: string[];
  correctAnswer: string;
  explanation?: string;
  marks: number;
}

interface ExamData {
  title: string;
  description: string;
  testType: string;
  subject: string;
  skills: string[];
  numberOfQuestions: number;
  difficultyLevel: string;
  duration: number;
  instructions: string;
  questions: Question[];
}

const testTypes = ["Practice", "Assessment", "Mock Test", "Company Specific"];
const subjects = ["Technical", "Logical", "Reasoning", "Verbal", "Coding", "Other"];
const skills = ["Problem Solving", "Critical Thinking", "Communication", "Programming", "Mathematics", "Analytics"];
const difficultyLevels = ["Easy", "Medium", "Hard"];

export default function ExamCreation() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [examData, setExamData] = useState<ExamData>({
    title: "",
    description: "",
    testType: "",
    subject: "",
    skills: [],
    numberOfQuestions: 0,
    difficultyLevel: "",
    duration: 0,
    instructions: "",
    questions: []
  });

  const [currentQuestion, setCurrentQuestion] = useState<Question>({
    id: "",
    questionText: "",
    options: ["", "", "", ""],
    correctAnswer: "",
    explanation: "",
    marks: 1
  });

  const handleSkillToggle = (skill: string) => {
    setExamData(prev => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter(s => s !== skill)
        : [...prev.skills, skill]
    }));
  };

  const handleAddQuestion = () => {
    if (!currentQuestion.questionText || currentQuestion.options.some(opt => !opt.trim()) || !currentQuestion.correctAnswer) {
      toast({
        title: "Error",
        description: "Please fill all question fields",
        variant: "destructive"
      });
      return;
    }

    const newQuestion: Question = {
      ...currentQuestion,
      id: Date.now().toString()
    };

    setExamData(prev => ({
      ...prev,
      questions: [...prev.questions, newQuestion]
    }));

    setCurrentQuestion({
      id: "",
      questionText: "",
      options: ["", "", "", ""],
      correctAnswer: "",
      explanation: "",
      marks: 1
    });

    toast({
      title: "Question Added",
      description: "Question has been added successfully"
    });
  };

  const handleRemoveQuestion = (questionId: string) => {
    setExamData(prev => ({
      ...prev,
      questions: prev.questions.filter(q => q.id !== questionId)
    }));
  };

  const handleSaveExam = async () => {
    try {
      // Mock exam creation - in real app, this would call the API
      const newExam = {
        id: Date.now().toString(),
        ...examData,
        createdBy: "Master Admin",
        createdAt: new Date().toISOString(),
        isActive: true
      };
      
      toast({
        title: "Exam Created",
        description: `Exam "${examData.title}" has been created successfully with ${examData.questions.length} questions`
      });
      navigate('/admin');
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to create exam: " + error.message,
        variant: "destructive"
      });
    }
  };

  const nextStep = () => {
    if (currentStep === 1) {
      if (!examData.title || !examData.testType || !examData.subject || !examData.difficultyLevel) {
        toast({
          title: "Error",
          description: "Please fill all required fields",
          variant: "destructive"
        });
        return;
      }
    }
    setCurrentStep(prev => Math.min(prev + 1, 3));
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={() => navigate('/admin')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Create New Exam</h1>
          <p className="text-muted-foreground">Multi-step exam creation process</p>
        </div>
      </div>

      {/* Progress Steps */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className={`flex items-center gap-2 ${currentStep >= 1 ? 'text-primary' : 'text-muted-foreground'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 1 ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                1
              </div>
              <span className="font-medium">Exam Details</span>
            </div>
            <div className={`flex items-center gap-2 ${currentStep >= 2 ? 'text-primary' : 'text-muted-foreground'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 2 ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                2
              </div>
              <span className="font-medium">Questions & Answers</span>
            </div>
            <div className={`flex items-center gap-2 ${currentStep >= 3 ? 'text-primary' : 'text-muted-foreground'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 3 ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                3
              </div>
              <span className="font-medium">Overview</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Step 1: Exam Details */}
      {currentStep === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Step 1: Exam Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="title">Exam Title *</Label>
                <Input
                  id="title"
                  placeholder="Enter exam title"
                  value={examData.title}
                  onChange={(e) => setExamData({...examData, title: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="testType">Test Type *</Label>
                <Select value={examData.testType} onValueChange={(value) => setExamData({...examData, testType: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select test type" />
                  </SelectTrigger>
                  <SelectContent>
                    {testTypes.map(type => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="subject">Subject *</Label>
                <Select value={examData.subject} onValueChange={(value) => setExamData({...examData, subject: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select subject" />
                  </SelectTrigger>
                  <SelectContent>
                    {subjects.map(subject => (
                      <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="difficultyLevel">Difficulty Level *</Label>
                <Select value={examData.difficultyLevel} onValueChange={(value) => setExamData({...examData, difficultyLevel: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select difficulty" />
                  </SelectTrigger>
                  <SelectContent>
                    {difficultyLevels.map(level => (
                      <SelectItem key={level} value={level}>{level}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="numberOfQuestions">Number of Questions</Label>
                <Input
                  id="numberOfQuestions"
                  type="number"
                  placeholder="e.g., 50"
                  value={examData.numberOfQuestions || ""}
                  onChange={(e) => setExamData({...examData, numberOfQuestions: parseInt(e.target.value) || 0})}
                />
              </div>
              <div>
                <Label htmlFor="duration">Duration (minutes)</Label>
                <Input
                  id="duration"
                  type="number"
                  placeholder="e.g., 60"
                  value={examData.duration || ""}
                  onChange={(e) => setExamData({...examData, duration: parseInt(e.target.value) || 0})}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Enter exam description"
                value={examData.description}
                onChange={(e) => setExamData({...examData, description: e.target.value})}
                rows={3}
              />
            </div>

            <div>
              <Label>Skills Assessed</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
                {skills.map(skill => (
                  <div key={skill} className="flex items-center space-x-2">
                    <Checkbox
                      id={skill}
                      checked={examData.skills.includes(skill)}
                      onCheckedChange={() => handleSkillToggle(skill)}
                    />
                    <Label htmlFor={skill} className="text-sm">{skill}</Label>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="instructions">Instructions</Label>
              <Textarea
                id="instructions"
                placeholder="Enter exam instructions"
                value={examData.instructions}
                onChange={(e) => setExamData({...examData, instructions: e.target.value})}
                rows={4}
              />
            </div>

            <div className="flex justify-end">
              <Button onClick={nextStep}>
                Next Step
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Questions & Answers */}
      {currentStep === 2 && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Step 2: Questions & Answers</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Add Question Form */}
              <div className="space-y-4 p-4 border rounded-lg">
                <h3 className="font-semibold">Add New Question</h3>
                <div>
                  <Label htmlFor="questionText">Question Text</Label>
                  <Textarea
                    id="questionText"
                    placeholder="Enter your question"
                    value={currentQuestion.questionText}
                    onChange={(e) => setCurrentQuestion({...currentQuestion, questionText: e.target.value})}
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {currentQuestion.options.map((option, index) => (
                    <div key={index}>
                      <Label htmlFor={`option${index + 1}`}>Option {index + 1}</Label>
                      <Input
                        id={`option${index + 1}`}
                        placeholder={`Enter option ${index + 1}`}
                        value={option}
                        onChange={(e) => {
                          const newOptions = [...currentQuestion.options];
                          newOptions[index] = e.target.value;
                          setCurrentQuestion({...currentQuestion, options: newOptions});
                        }}
                      />
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="correctAnswer">Correct Answer</Label>
                    <Select 
                      value={currentQuestion.correctAnswer} 
                      onValueChange={(value) => setCurrentQuestion({...currentQuestion, correctAnswer: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select correct answer" />
                      </SelectTrigger>
                      <SelectContent>
                        {currentQuestion.options.map((option, index) => (
                          <SelectItem key={index} value={option} disabled={!option.trim()}>
                            Option {index + 1}: {option || "Empty"}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="marks">Marks</Label>
                    <Input
                      id="marks"
                      type="number"
                      placeholder="1"
                      value={currentQuestion.marks}
                      onChange={(e) => setCurrentQuestion({...currentQuestion, marks: parseInt(e.target.value) || 1})}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="explanation">Explanation (Optional)</Label>
                  <Textarea
                    id="explanation"
                    placeholder="Explain the correct answer"
                    value={currentQuestion.explanation}
                    onChange={(e) => setCurrentQuestion({...currentQuestion, explanation: e.target.value})}
                    rows={2}
                  />
                </div>

                <Button onClick={handleAddQuestion} className="w-full">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Question
                </Button>
              </div>

              {/* Questions List */}
              {examData.questions.length > 0 && (
                <div className="space-y-4">
                  <h3 className="font-semibold">Added Questions ({examData.questions.length})</h3>
                  {examData.questions.map((question, index) => (
                    <Card key={question.id} className="border-l-4 border-l-primary">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h4 className="font-medium mb-2">Question {index + 1}</h4>
                            <p className="text-sm mb-3">{question.questionText}</p>
                            <div className="grid grid-cols-2 gap-2 mb-2">
                              {question.options.map((option, optIndex) => (
                                <div key={optIndex} className={`text-xs p-2 rounded ${option === question.correctAnswer ? 'bg-success/10 text-success' : 'bg-muted'}`}>
                                  {String.fromCharCode(65 + optIndex)}. {option}
                                </div>
                              ))}
                            </div>
                            <Badge variant="outline" className="text-xs">
                              Marks: {question.marks}
                            </Badge>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRemoveQuestion(question.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              <div className="flex justify-between">
                <Button variant="outline" onClick={prevStep}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Previous
                </Button>
                <Button onClick={nextStep} disabled={examData.questions.length === 0}>
                  Next Step
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Step 3: Overview */}
      {currentStep === 3 && (
        <Card>
          <CardHeader>
            <CardTitle>Step 3: Overview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="font-semibold">Exam Details</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Title:</span>
                    <span className="font-medium">{examData.title}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Type:</span>
                    <Badge variant="outline">{examData.testType}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subject:</span>
                    <Badge variant="secondary">{examData.subject}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Difficulty:</span>
                    <Badge variant={examData.difficultyLevel === "Easy" ? "secondary" : examData.difficultyLevel === "Medium" ? "default" : "destructive"}>
                      {examData.difficultyLevel}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Duration:</span>
                    <span className="font-medium">{examData.duration} minutes</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Questions:</span>
                    <span className="font-medium">{examData.questions.length}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold">Skills Assessed</h3>
                <div className="flex flex-wrap gap-2">
                  {examData.skills.map(skill => (
                    <Badge key={skill} variant="outline">{skill}</Badge>
                  ))}
                </div>

                <h3 className="font-semibold">Description</h3>
                <p className="text-sm text-muted-foreground">{examData.description}</p>

                <h3 className="font-semibold">Instructions</h3>
                <p className="text-sm text-muted-foreground">{examData.instructions}</p>
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <h3 className="font-semibold">Questions Preview</h3>
              <div className="max-h-64 overflow-y-auto space-y-2">
                {examData.questions.map((question, index) => (
                  <div key={question.id} className="p-3 border rounded-lg">
                    <p className="font-medium text-sm">Q{index + 1}: {question.questionText}</p>
                    <div className="grid grid-cols-2 gap-1 mt-2">
                      {question.options.map((option, optIndex) => (
                        <p key={optIndex} className={`text-xs p-1 rounded ${option === question.correctAnswer ? 'bg-success/10 text-success' : 'text-muted-foreground'}`}>
                          {String.fromCharCode(65 + optIndex)}. {option}
                        </p>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={prevStep}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => navigate('/admin')}>
                  Cancel
                </Button>
                <Button onClick={handleSaveExam} className="bg-success hover:bg-success/90">
                  <Save className="w-4 h-4 mr-2" />
                  Create Exam
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}