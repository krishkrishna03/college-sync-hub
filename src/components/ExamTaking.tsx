import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Clock, CheckCircle, AlertTriangle, Flag } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Question {
  id: string;
  questionText: string;
  options: string[];
  correctAnswer: string;
  explanation?: string;
  marks: number;
}

interface ExamTakingProps {
  examId: string;
  examTitle: string;
  duration: number;
  questions: Question[];
  onSubmit: (answers: any[], timeTaken: number) => void;
  onExit: () => void;
}

export function ExamTaking({ examId, examTitle, duration, questions, onSubmit, onExit }: ExamTakingProps) {
  const { toast } = useToast();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<{ [key: number]: string }>({});
  const [timeLeft, setTimeLeft] = useState(duration * 60); // Convert to seconds
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [flaggedQuestions, setFlaggedQuestions] = useState<Set<number>>(new Set());

  // Timer effect
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

  const handleAnswerChange = (questionIndex: number, answer: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionIndex]: answer
    }));
  };

  const handleQuestionNavigation = (index: number) => {
    setCurrentQuestionIndex(index);
  };

  const handleFlagQuestion = (index: number) => {
    setFlaggedQuestions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  const handleSubmit = () => {
    const timeTaken = (duration * 60) - timeLeft;
    const formattedAnswers = questions.map((question, index) => ({
      questionIndex: index,
      selectedAnswer: answers[index] || "",
      timeTaken: Math.floor(timeTaken / questions.length) // Average time per question
    }));

    onSubmit(formattedAnswers, Math.floor(timeTaken / 60)); // Convert back to minutes
  };

  const handleAutoSubmit = () => {
    toast({
      title: "Time's Up!",
      description: "Your exam has been automatically submitted.",
      variant: "destructive"
    });
    handleSubmit();
  };

  const getQuestionStatus = (index: number) => {
    if (answers[index]) return "answered";
    if (flaggedQuestions.has(index)) return "flagged";
    return "not-visited";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "answered": return "bg-success text-success-foreground";
      case "flagged": return "bg-warning text-warning-foreground";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const currentQuestion = questions[currentQuestionIndex];
  const answeredCount = Object.keys(answers).length;
  const progressPercentage = (answeredCount / questions.length) * 100;

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl">{examTitle}</CardTitle>
                <p className="text-muted-foreground">Question {currentQuestionIndex + 1} of {questions.length}</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-destructive" />
                  <span className={`text-lg font-mono ${timeLeft < 300 ? 'text-destructive' : 'text-foreground'}`}>
                    {formatTime(timeLeft)}
                  </span>
                </div>
                <Button variant="outline" onClick={() => setIsSubmitModalOpen(true)}>
                  Submit Exam
                </Button>
                <Button variant="outline" onClick={onExit}>
                  Exit
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Question Panel */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Question {currentQuestionIndex + 1}</CardTitle>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleFlagQuestion(currentQuestionIndex)}
                      className={flaggedQuestions.has(currentQuestionIndex) ? "bg-warning text-warning-foreground" : ""}
                    >
                      <Flag className="w-4 h-4 mr-1" />
                      {flaggedQuestions.has(currentQuestionIndex) ? "Unflag" : "Flag"}
                    </Button>
                    <Badge variant="outline">
                      {currentQuestion?.marks} mark{currentQuestion?.marks !== 1 ? 's' : ''}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-lg leading-relaxed">
                  {currentQuestion?.questionText}
                </div>

                <RadioGroup
                  value={answers[currentQuestionIndex] || ""}
                  onValueChange={(value) => handleAnswerChange(currentQuestionIndex, value)}
                  className="space-y-3"
                >
                  {currentQuestion?.options.map((option, index) => (
                    <div key={index} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-accent/50 transition-colors">
                      <RadioGroupItem value={option} id={`option-${index}`} />
                      <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                        <span className="font-medium mr-2">{String.fromCharCode(65 + index)}.</span>
                        {option}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>

                {/* Navigation */}
                <div className="flex justify-between pt-6">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
                    disabled={currentQuestionIndex === 0}
                  >
                    Previous
                  </Button>
                  <Button
                    onClick={() => setCurrentQuestionIndex(prev => Math.min(questions.length - 1, prev + 1))}
                    disabled={currentQuestionIndex === questions.length - 1}
                  >
                    Next
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Question Navigator */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Progress</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Answered: {answeredCount}/{questions.length}</span>
                    <span>{Math.round(progressPercentage)}%</span>
                  </div>
                  <Progress value={progressPercentage} className="h-2" />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-3 h-3 bg-success rounded"></div>
                    <span>Answered ({answeredCount})</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-3 h-3 bg-warning rounded"></div>
                    <span>Flagged ({flaggedQuestions.size})</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-3 h-3 bg-muted rounded"></div>
                    <span>Not Visited ({questions.length - answeredCount - flaggedQuestions.size})</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Question Navigator</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-5 gap-2">
                  {questions.map((_, index) => {
                    const status = getQuestionStatus(index);
                    return (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        className={`h-10 w-10 p-0 ${getStatusColor(status)} ${
                          index === currentQuestionIndex ? 'ring-2 ring-primary' : ''
                        }`}
                        onClick={() => handleQuestionNavigation(index)}
                      >
                        {index + 1}
                      </Button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Button 
              className="w-full bg-success hover:bg-success/90" 
              onClick={() => setIsSubmitModalOpen(true)}
            >
              Submit Exam
            </Button>
          </div>
        </div>

        {/* Submit Confirmation Modal */}
        <Dialog open={isSubmitModalOpen} onOpenChange={setIsSubmitModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Submit Exam</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-warning">
                <AlertTriangle className="w-5 h-5" />
                <span className="font-medium">Are you sure you want to submit?</span>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Total Questions:</span>
                  <span className="font-medium">{questions.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Answered:</span>
                  <span className="font-medium text-success">{answeredCount}</span>
                </div>
                <div className="flex justify-between">
                  <span>Unanswered:</span>
                  <span className="font-medium text-destructive">{questions.length - answeredCount}</span>
                </div>
                <div className="flex justify-between">
                  <span>Time Remaining:</span>
                  <span className="font-medium">{formatTime(timeLeft)}</span>
                </div>
              </div>

              {questions.length - answeredCount > 0 && (
                <div className="p-3 bg-warning/10 rounded-lg">
                  <p className="text-sm text-warning">
                    You have {questions.length - answeredCount} unanswered questions. 
                    These will be marked as incorrect.
                  </p>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsSubmitModalOpen(false)}>
                Continue Exam
              </Button>
              <Button onClick={handleSubmit} className="bg-success hover:bg-success/90">
                <CheckCircle className="w-4 h-4 mr-2" />
                Submit Final Answers
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}