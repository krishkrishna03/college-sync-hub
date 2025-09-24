import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Eye, Download, TrendingUp, Target, CheckCircle, XCircle, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, BarChart, Bar } from "recharts";

interface TestResult {
  id: string;
  testTitle: string;
  subject: string;
  testType: string;
  difficulty: string;
  score: number;
  accuracy: number;
  timeTaken: number;
  totalQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
  unanswered: number;
  cutoffMarks: number;
  passed: boolean;
  submittedAt: Date;
  rank?: number;
  totalParticipants?: number;
}

const mockResults: TestResult[] = [
  {
    id: "1",
    testTitle: "Programming Fundamentals",
    subject: "Technical",
    testType: "Practice",
    difficulty: "Easy",
    score: 85,
    accuracy: 87.5,
    timeTaken: 55,
    totalQuestions: 40,
    correctAnswers: 35,
    incorrectAnswers: 4,
    unanswered: 1,
    cutoffMarks: 50,
    passed: true,
    submittedAt: new Date("2024-03-18"),
    rank: 12,
    totalParticipants: 85
  },
  {
    id: "2",
    testTitle: "Verbal Ability Practice",
    subject: "Verbal",
    testType: "Practice",
    difficulty: "Easy",
    score: 92,
    accuracy: 94.3,
    timeTaken: 38,
    totalQuestions: 35,
    correctAnswers: 33,
    incorrectAnswers: 2,
    unanswered: 0,
    cutoffMarks: 60,
    passed: true,
    submittedAt: new Date("2024-03-16"),
    rank: 3,
    totalParticipants: 45
  },
  {
    id: "3",
    testTitle: "Basic Arithmetic",
    subject: "Arithmetic",
    testType: "Practice",
    difficulty: "Easy",
    score: 78,
    accuracy: 81.2,
    timeTaken: 42,
    totalQuestions: 30,
    correctAnswers: 24,
    incorrectAnswers: 5,
    unanswered: 1,
    cutoffMarks: 40,
    passed: true,
    submittedAt: new Date("2024-03-14"),
    rank: 18,
    totalParticipants: 52
  }
];

const performanceData = [
  { test: "Test 1", score: 78, accuracy: 81 },
  { test: "Test 2", score: 92, accuracy: 94 },
  { test: "Test 3", score: 85, accuracy: 88 },
];

const subjectPerformance = [
  { subject: "Technical", avgScore: 85, tests: 1 },
  { subject: "Verbal", avgScore: 92, tests: 1 },
  { subject: "Arithmetic", avgScore: 78, tests: 1 },
];

export default function TestResults() {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [results, setResults] = useState<TestResult[]>(mockResults);
  const [loading, setLoading] = useState(false);
  const [subjectFilter, setSubjectFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  const filteredResults = results.filter(result => {
    const matchesSubject = subjectFilter === "all" || result.subject === subjectFilter;
    const matchesType = typeFilter === "all" || result.testType === typeFilter;
    return matchesSubject && matchesType;
  });

  const handleViewDetails = (resultId: string) => {
    navigate(`/exam-results/${resultId}`);
  };

  const handleDownloadReport = (result: TestResult) => {
    // Generate and download individual test report
    const csvContent = [
      "Test Details,Value",
      `Test Name,${result.testTitle}`,
      `Subject,${result.subject}`,
      `Score,${result.score}%`,
      `Accuracy,${result.accuracy}%`,
      `Time Taken,${result.timeTaken} minutes`,
      `Correct Answers,${result.correctAnswers}`,
      `Incorrect Answers,${result.incorrectAnswers}`,
      `Unanswered,${result.unanswered}`,
      `Rank,${result.rank}/${result.totalParticipants}`,
      `Status,${result.passed ? 'PASSED' : 'FAILED'}`,
      `Submitted At,${result.submittedAt.toLocaleString()}`
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${result.testTitle}_Report.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const calculateOverallStats = () => {
    const totalTests = results.length;
    const passedTests = results.filter(r => r.passed).length;
    const averageScore = results.reduce((sum, r) => sum + r.score, 0) / totalTests;
    const averageAccuracy = results.reduce((sum, r) => sum + r.accuracy, 0) / totalTests;
    
    return {
      totalTests,
      passedTests,
      averageScore: Math.round(averageScore * 10) / 10,
      averageAccuracy: Math.round(averageAccuracy * 10) / 10,
      passRate: Math.round((passedTests / totalTests) * 100)
    };
  };

  const stats = calculateOverallStats();

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Test Results</h1>
        <p className="text-muted-foreground">View your test performance and detailed results</p>
      </div>

      {/* Overall Performance Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Target className="w-8 h-8 mx-auto text-primary mb-2" />
            <p className="text-2xl font-bold">{stats.totalTests}</p>
            <p className="text-sm text-muted-foreground">Total Tests</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <CheckCircle className="w-8 h-8 mx-auto text-success mb-2" />
            <p className="text-2xl font-bold">{stats.passedTests}</p>
            <p className="text-sm text-muted-foreground">Passed</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <TrendingUp className="w-8 h-8 mx-auto text-primary mb-2" />
            <p className="text-2xl font-bold">{stats.averageScore}%</p>
            <p className="text-sm text-muted-foreground">Avg Score</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Target className="w-8 h-8 mx-auto text-warning mb-2" />
            <p className="text-2xl font-bold">{stats.averageAccuracy}%</p>
            <p className="text-sm text-muted-foreground">Avg Accuracy</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <CheckCircle className="w-8 h-8 mx-auto text-success mb-2" />
            <p className="text-2xl font-bold">{stats.passRate}%</p>
            <p className="text-sm text-muted-foreground">Pass Rate</p>
          </CardContent>
        </Card>
      </div>

      {/* Performance Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Score Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{
              score: { label: "Score", color: "#3b82f6" },
              accuracy: { label: "Accuracy", color: "#10b981" }
            }}>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="test" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line type="monotone" dataKey="score" stroke="#3b82f6" strokeWidth={2} />
                  <Line type="monotone" dataKey="accuracy" stroke="#10b981" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Subject-wise Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{
              avgScore: { label: "Average Score", color: "#f59e0b" }
            }}>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={subjectPerformance}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="subject" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="avgScore" fill="#f59e0b" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <Select value={subjectFilter} onValueChange={setSubjectFilter}>
          <SelectTrigger className="w-full md:w-48">
            <SelectValue placeholder="All Subjects" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Subjects</SelectItem>
            <SelectItem value="Technical">Technical</SelectItem>
            <SelectItem value="Verbal">Verbal</SelectItem>
            <SelectItem value="Arithmetic">Arithmetic</SelectItem>
            <SelectItem value="Reasoning">Reasoning</SelectItem>
          </SelectContent>
        </Select>

        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-full md:w-48">
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="Practice">Practice</SelectItem>
            <SelectItem value="Assessment">Assessment</SelectItem>
            <SelectItem value="Mock Test">Mock Test</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Results Table */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Test Results</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Test Details</TableHead>
                <TableHead>Performance</TableHead>
                <TableHead>Accuracy</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Rank</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredResults.map((result) => (
                <TableRow key={result.id} className="hover:bg-accent/50">
                  <TableCell>
                    <div className="space-y-1">
                      <p className="font-medium">{result.testTitle}</p>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">{result.subject}</Badge>
                        <Badge variant="outline" className="text-xs">{result.testType}</Badge>
                        <Badge variant={
                          result.difficulty === "Easy" ? "secondary" : 
                          result.difficulty === "Medium" ? "default" : "destructive"
                        } className="text-xs">
                          {result.difficulty}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {result.totalQuestions} questions • Cutoff: {result.cutoffMarks}%
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{result.score}%</span>
                        <span className={`text-xs ${result.passed ? 'text-success' : 'text-destructive'}`}>
                          {result.passed ? 'PASSED' : 'FAILED'}
                        </span>
                      </div>
                      <Progress value={result.score} className="h-2" />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{result.correctAnswers} correct</span>
                        <span>{result.incorrectAnswers} wrong</span>
                        <span>{result.unanswered} unanswered</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-center">
                      <p className="text-lg font-bold text-primary">{result.accuracy}%</p>
                      <p className="text-xs text-muted-foreground">Accuracy</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-warning" />
                      <span className="font-medium">{result.timeTaken}m</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {result.rank && result.totalParticipants ? (
                      <div className="text-center">
                        <p className="font-bold text-primary">#{result.rank}</p>
                        <p className="text-xs text-muted-foreground">of {result.totalParticipants}</p>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {result.passed ? (
                        <CheckCircle className="w-4 h-4 text-success" />
                      ) : (
                        <XCircle className="w-4 h-4 text-destructive" />
                      )}
                      <Badge variant={result.passed ? "default" : "destructive"}>
                        {result.passed ? "Passed" : "Failed"}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleViewDetails(result.id)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDownloadReport(result)}
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}