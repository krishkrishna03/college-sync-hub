import { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { ExamTaking } from "@/components/ExamTaking";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { CheckCircle, Clock, Target, AlertTriangle, Play, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Question {
  id: string;
  questionText: string;
  options: string[];
  correctAnswer: string;
  explanation?: string;
  marks: number;
}

interface TestData {
  id: string;
  title: string;
  subject: string;
  testType: string;
  difficulty: string;
  duration: number;
  totalQuestions: number;
  cutoffMarks: number;
  instructions: string;
  questions: Question[];
}

export default function TakeTest() {
  const { testId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  
  const [testData, setTestData] = useState<TestData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showInstructions, setShowInstructions] = useState(true);
  const [isStarted, setIsStarted] = useState(false);
  
  const mode = searchParams.get('mode') || 'exam'; // 'practice' or 'exam'

  useEffect(() => {
    fetchTestData();
  }, [testId]);

  const fetchTestData = async () => {
    try {
      setLoading(true);
      
      // Mock test data
      const mockTest: TestData = {
        id: testId || "1",
        title: "Data Structures Assessment",
        subject: "Technical",
        testType: "Assessment",
        difficulty: "Medium",
        duration: 90,
        totalQuestions: 10, // Reduced for demo
        cutoffMarks: 60,
        instructions: `
          1. This test contains ${10} multiple-choice questions.
          2. Each question carries 1 mark.
          3. There is no negative marking.
          4. You have ${90} minutes to complete the test.
          5. Once you start, you cannot pause the test.
          6. Make sure you have a stable internet connection.
          7. Do not refresh the page during the test.
          8. Click 'Submit' when you're done or time runs out.
        `,
        questions: Array.from({ length: 10 }, (_, index) => ({
          id: `q${index + 1}`,
          questionText: `What is the time complexity of searching in a balanced binary search tree? (Question ${index + 1})`,
          options: [
            "O(1)",
            "O(log n)",
            "O(n)",
            "O(n log n)"
          ],
          correctAnswer: "O(log n)",
          explanation: "In a balanced BST, the height is log n, so search operations take O(log n) time.",
          marks: 1
        }))
      };
      
      setTestData(mockTest);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load test: " + error.message,
        variant: "destructive"
      });
      navigate('/student-dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleStartTest = () => {
    setShowInstructions(false);
    setIsStarted(true);
  };

  const handleSubmitTest = async (answers: any[], timeTaken: number) => {
    try {
      // Calculate score
      let correctAnswers = 0;
      answers.forEach((answer, index) => {
        if (testData?.questions[index]?.correctAnswer === answer.selectedAnswer) {
          correctAnswers++;
        }
      });

      const score = (correctAnswers / (testData?.totalQuestions || 1)) * 100;
      const accuracy = answers.length > 0 ? (correctAnswers / answers.length) * 100 : 0;
      const passed = score >= (testData?.cutoffMarks || 0);

      toast({
        title: "Test Submitted",
        description: `Your test has been submitted successfully. Score: ${Math.round(score)}%`,
        variant: passed ? "default" : "destructive"
      });

      // Navigate to results page
      navigate(`/exam-results/${testId}`, {
        state: {
          score: Math.round(score),
          accuracy: Math.round(accuracy * 10) / 10,
          timeTaken,
          correctAnswers,
          totalQuestions: testData?.totalQuestions || 0,
          passed
        }
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to submit test: " + error.message,
        variant: "destructive"
      });
    }
  };

  const handleExitTest = () => {
    navigate(mode === 'practice' ? '/practice-tests' : '/assigned-tests');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading test...</p>
        </div>
      </div>
    );
  }

  if (!testData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <AlertTriangle className="w-16 h-16 text-destructive mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Test Not Found</h2>
            <p className="text-muted-foreground mb-4">
              The requested test could not be found or is no longer available.
            </p>
            <Button onClick={() => navigate('/student-dashboard')}>
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isStarted) {
    return (
      <ExamTaking
        examId={testData.id}
        examTitle={testData.title}
        duration={testData.duration}
        questions={testData.questions}
        onSubmit={handleSubmitTest}
        onExit={handleExitTest}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-background p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={handleExitTest}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Test Instructions</h1>
            <p className="text-muted-foreground">{testData.title}</p>
          </div>
        </div>

        {/* Test Overview */}
        <Card className="border-l-4 border-l-primary">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-6 h-6 text-primary" />
              {testData.title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-primary/10 rounded-lg">
                <Clock className="w-6 h-6 mx-auto text-primary mb-1" />
                <p className="text-lg font-bold">{testData.duration}</p>
                <p className="text-sm text-muted-foreground">Minutes</p>
              </div>
              <div className="text-center p-3 bg-success/10 rounded-lg">
                <Target className="w-6 h-6 mx-auto text-success mb-1" />
                <p className="text-lg font-bold">{testData.totalQuestions}</p>
                <p className="text-sm text-muted-foreground">Questions</p>
              </div>
              <div className="text-center p-3 bg-warning/10 rounded-lg">
                <CheckCircle className="w-6 h-6 mx-auto text-warning mb-1" />
                <p className="text-lg font-bold">{testData.cutoffMarks}%</p>
                <p className="text-sm text-muted-foreground">Cutoff</p>
              </div>
              <div className="text-center p-3 bg-info/10 rounded-lg">
                <Badge variant="outline" className="mb-2">{testData.difficulty}</Badge>
                <p className="text-sm text-muted-foreground">Difficulty</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-warning" />
              Important Instructions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none">
              <pre className="whitespace-pre-wrap text-sm leading-relaxed">
                {testData.instructions}
              </pre>
            </div>
          </CardContent>
        </Card>

        {/* Test Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Test Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subject:</span>
                <Badge variant="outline">{testData.subject}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Type:</span>
                <Badge variant="secondary">{testData.testType}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Marks:</span>
                <span className="font-medium">{testData.totalQuestions}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Passing Marks:</span>
                <span className="font-medium">{testData.cutoffMarks}%</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Before You Start</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="w-4 h-4 text-success" />
                <span>Ensure stable internet connection</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="w-4 h-4 text-success" />
                <span>Close all other applications</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="w-4 h-4 text-success" />
                <span>Find a quiet environment</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="w-4 h-4 text-success" />
                <span>Have pen and paper ready</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Start Test Button */}
        <div className="text-center">
          <Dialog open={showInstructions} onOpenChange={setShowInstructions}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Confirm Test Start</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-warning">
                  <AlertTriangle className="w-5 h-5" />
                  <span className="font-medium">Important Notice</span>
                </div>
                <div className="space-y-2 text-sm">
                  <p>• Once you start the test, the timer will begin immediately</p>
                  <p>• You cannot pause or restart the test</p>
                  <p>• Make sure you have {testData.duration} minutes available</p>
                  <p>• Your progress will be automatically saved</p>
                </div>
                <div className="p-3 bg-primary/10 rounded-lg">
                  <p className="text-sm font-medium">
                    Test: {testData.title} • Duration: {testData.duration} minutes • Questions: {testData.totalQuestions}
                  </p>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={handleExitTest}>
                  Cancel
                </Button>
                <Button onClick={handleStartTest} className="bg-success hover:bg-success/90">
                  <Play className="w-4 h-4 mr-2" />
                  Start Test
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          
          <Button 
            size="lg" 
            className="bg-gradient-to-r from-success to-success/80 hover:from-success/90 hover:to-success/70 text-lg px-8 py-4"
            onClick={() => setShowInstructions(true)}
          >
            <Play className="w-5 h-5 mr-2" />
            Start {mode === 'practice' ? 'Practice' : 'Test'}
          </Button>
        </div>
      </div>
    </div>
  );
}