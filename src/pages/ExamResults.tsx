import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { CheckCircle, XCircle, Clock, Target, TrendingUp, ArrowLeft, Download, Share } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ExamResult {
  examTitle: string;
  subject: string;
  totalQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
  unanswered: number;
  score: number;
  accuracy: number;
  timeTaken: number;
  duration: number;
  cutoffMarks: number;
  passed: boolean;
  rank?: number;
  totalParticipants?: number;
}

interface QuestionResult {
  questionText: string;
  options: string[];
  selectedAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  explanation?: string;
  timeTaken: number;
}

export default function ExamResults() {
  const { examId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [result, setResult] = useState<ExamResult | null>(null);
  const [questionResults, setQuestionResults] = useState<QuestionResult[]>([]);
  const [showDetailedResults, setShowDetailedResults] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchExamResults();
  }, [examId]);

  const fetchExamResults = async () => {
    try {
      setLoading(true);
      
      // Mock data - replace with actual API call
      const mockResult: ExamResult = {
        examTitle: "Data Structures Assessment",
        subject: "Technical",
        totalQuestions: 50,
        correctAnswers: 42,
        incorrectAnswers: 6,
        unanswered: 2,
        score: 84,
        accuracy: 87.5,
        timeTaken: 45,
        duration: 60,
        cutoffMarks: 60,
        passed: true,
        rank: 15,
        totalParticipants: 120
      };

      const mockQuestionResults: QuestionResult[] = Array.from({ length: 10 }, (_, index) => ({
        questionText: `Sample question ${index + 1} about data structures and algorithms?`,
        options: ["Option A", "Option B", "Option C", "Option D"],
        selectedAnswer: index % 4 === 0 ? "Option A" : index % 4 === 1 ? "Option B" : index % 4 === 2 ? "Option C" : "Option D",
        correctAnswer: "Option A",
        isCorrect: index % 4 === 0,
        explanation: `This is the explanation for question ${index + 1}`,
        timeTaken: Math.floor(Math.random() * 120) + 30
      }));

      setResult(mockResult);
      setQuestionResults(mockQuestionResults);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to fetch exam results: " + error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadReport = () => {
    // Generate and download PDF report
    toast({
      title: "Download Started",
      description: "Your detailed report is being generated..."
    });
  };

  const handleShareResults = () => {
    // Share results functionality
    toast({
      title: "Results Shared",
      description: "Your results have been shared with your instructor"
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading results...</p>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <XCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Results Not Found</h2>
            <p className="text-muted-foreground mb-4">
              Unable to load exam results. Please try again later.
            </p>
            <Button onClick={() => navigate('/student-dashboard')}>
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-background p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => navigate('/student-dashboard')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Exam Results</h1>
            <p className="text-muted-foreground">{result.examTitle}</p>
          </div>
        </div>

        {/* Result Summary */}
        <Card className={`border-l-4 ${result.passed ? 'border-l-success bg-success/5' : 'border-l-destructive bg-destructive/5'}`}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                {result.passed ? (
                  <CheckCircle className="w-6 h-6 text-success" />
                ) : (
                  <XCircle className="w-6 h-6 text-destructive" />
                )}
                {result.passed ? "Congratulations! You Passed" : "Better Luck Next Time"}
              </CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleDownloadReport}>
                  <Download className="w-4 h-4 mr-2" />
                  Download Report
                </Button>
                <Button variant="outline" onClick={handleShareResults}>
                  <Share className="w-4 h-4 mr-2" />
                  Share Results
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-1">{result.score}%</div>
                <p className="text-sm text-muted-foreground">Final Score</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-success mb-1">{result.accuracy}%</div>
                <p className="text-sm text-muted-foreground">Accuracy</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-warning mb-1">{result.timeTaken}m</div>
                <p className="text-sm text-muted-foreground">Time Taken</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-info mb-1">#{result.rank}</div>
                <p className="text-sm text-muted-foreground">Your Rank</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Detailed Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Performance Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Correct Answers</span>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-success">{result.correctAnswers}</span>
                    <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-success" 
                        style={{ width: `${(result.correctAnswers / result.totalQuestions) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm">Incorrect Answers</span>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-destructive">{result.incorrectAnswers}</span>
                    <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-destructive" 
                        style={{ width: `${(result.incorrectAnswers / result.totalQuestions) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm">Unanswered</span>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-muted-foreground">{result.unanswered}</span>
                    <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-muted-foreground" 
                        style={{ width: `${(result.unanswered / result.totalQuestions) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Cutoff Marks:</span>
                  <span className="font-medium">{result.cutoffMarks}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Your Score:</span>
                  <span className={`font-medium ${result.passed ? 'text-success' : 'text-destructive'}`}>
                    {result.score}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Result:</span>
                  <Badge variant={result.passed ? "default" : "destructive"}>
                    {result.passed ? "PASSED" : "FAILED"}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Performance Insights
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Time Efficiency</span>
                    <span>{Math.round((result.timeTaken / result.duration) * 100)}%</span>
                  </div>
                  <Progress value={(result.timeTaken / result.duration) * 100} className="h-2" />
                  <p className="text-xs text-muted-foreground mt-1">
                    You used {result.timeTaken} out of {result.duration} minutes
                  </p>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Accuracy Rate</span>
                    <span>{result.accuracy}%</span>
                  </div>
                  <Progress value={result.accuracy} className="h-2" />
                  <p className="text-xs text-muted-foreground mt-1">
                    {result.correctAnswers} correct out of {result.correctAnswers + result.incorrectAnswers} attempted
                  </p>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <h4 className="font-medium">Recommendations</h4>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  {result.accuracy < 80 && (
                    <li>• Focus on understanding core concepts</li>
                  )}
                  {result.timeTaken / result.duration > 0.9 && (
                    <li>• Practice time management techniques</li>
                  )}
                  {result.unanswered > 0 && (
                    <li>• Attempt all questions in future exams</li>
                  )}
                  <li>• Review incorrect answers for better understanding</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Question Analysis */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Question-wise Analysis
              <Button
                variant="outline"
                onClick={() => setShowDetailedResults(!showDetailedResults)}
              >
                {showDetailedResults ? "Hide Details" : "Show Details"}
              </Button>
            </CardTitle>
          </CardHeader>
          {showDetailedResults && (
            <CardContent>
              <div className="space-y-4">
                {questionResults.map((question, index) => (
                  <Card key={index} className={`border-l-4 ${question.isCorrect ? 'border-l-success' : 'border-l-destructive'}`}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <h4 className="font-medium">Question {index + 1}</h4>
                        <div className="flex items-center gap-2">
                          {question.isCorrect ? (
                            <CheckCircle className="w-5 h-5 text-success" />
                          ) : (
                            <XCircle className="w-5 h-5 text-destructive" />
                          )}
                          <Badge variant="outline" className="text-xs">
                            {question.timeTaken}s
                          </Badge>
                        </div>
                      </div>
                      
                      <p className="text-sm mb-3">{question.questionText}</p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3">
                        {question.options.map((option, optIndex) => (
                          <div
                            key={optIndex}
                            className={`p-2 rounded text-xs ${
                              option === question.correctAnswer
                                ? 'bg-success/10 text-success border border-success/20'
                                : option === question.selectedAnswer && !question.isCorrect
                                ? 'bg-destructive/10 text-destructive border border-destructive/20'
                                : 'bg-muted'
                            }`}
                          >
                            <span className="font-medium mr-2">{String.fromCharCode(65 + optIndex)}.</span>
                            {option}
                            {option === question.selectedAnswer && (
                              <span className="ml-2 text-xs">(Your Answer)</span>
                            )}
                            {option === question.correctAnswer && (
                              <span className="ml-2 text-xs">(Correct)</span>
                            )}
                          </div>
                        ))}
                      </div>
                      
                      {question.explanation && (
                        <div className="p-3 bg-info/10 rounded-lg">
                          <p className="text-sm text-info">
                            <strong>Explanation:</strong> {question.explanation}
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          )}
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-center gap-4">
          <Button onClick={() => navigate('/student-dashboard')} className="bg-primary hover:bg-primary/90">
            Back to Dashboard
          </Button>
          <Button variant="outline" onClick={() => navigate('/practice-tests')}>
            Take More Practice Tests
          </Button>
        </div>
      </div>
    </div>
  );
}