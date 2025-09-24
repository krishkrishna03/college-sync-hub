import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Play, Eye, Clock, Target, CheckCircle, AlertCircle, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

interface AssignedTest {
  id: string;
  title: string;
  subject: string;
  testType: string;
  difficulty: string;
  duration: number;
  totalQuestions: number;
  cutoffMarks: number;
  startDate: Date;
  endDate: Date;
  startTime: string;
  endTime: string;
  status: "not-started" | "in-progress" | "completed" | "expired";
  score?: number;
  accuracy?: number;
  timeTaken?: number;
  submittedAt?: Date;
}

export default function MyTests() {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [assignedTests, setAssignedTests] = useState<AssignedTest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTest, setSelectedTest] = useState<AssignedTest | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  useEffect(() => {
    fetchAssignedTests();
  }, []);

  const fetchAssignedTests = async () => {
    try {
      setLoading(true);
      
      // Mock assigned tests data
      const mockTests: AssignedTest[] = [
        {
          id: "1",
          title: "Data Structures Assessment",
          subject: "Technical",
          testType: "Assessment",
          difficulty: "Medium",
          duration: 90,
          totalQuestions: 50,
          cutoffMarks: 60,
          startDate: new Date("2024-03-20"),
          endDate: new Date("2024-03-25"),
          startTime: "10:00",
          endTime: "11:30",
          status: "not-started"
        },
        {
          id: "2",
          title: "Programming Fundamentals",
          subject: "Technical",
          testType: "Practice",
          difficulty: "Easy",
          duration: 60,
          totalQuestions: 40,
          cutoffMarks: 50,
          startDate: new Date("2024-03-15"),
          endDate: new Date("2024-03-20"),
          startTime: "14:00",
          endTime: "15:00",
          status: "completed",
          score: 85,
          accuracy: 87.5,
          timeTaken: 55,
          submittedAt: new Date("2024-03-18")
        },
        {
          id: "3",
          title: "Logical Reasoning Test",
          subject: "Reasoning",
          testType: "Assessment",
          difficulty: "Hard",
          duration: 75,
          totalQuestions: 45,
          cutoffMarks: 65,
          startDate: new Date("2024-03-25"),
          endDate: new Date("2024-03-30"),
          startTime: "09:00",
          endTime: "10:15",
          status: "not-started"
        },
        {
          id: "4",
          title: "Basic Arithmetic",
          subject: "Arithmetic",
          testType: "Practice",
          difficulty: "Easy",
          duration: 45,
          totalQuestions: 30,
          cutoffMarks: 40,
          startDate: new Date("2024-03-10"),
          endDate: new Date("2024-03-15"),
          startTime: "11:00",
          endTime: "11:45",
          status: "expired"
        }
      ];
      
      setAssignedTests(mockTests);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to fetch assigned tests: " + error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStartTest = (testId: string) => {
    navigate(`/take-test/${testId}`);
  };

  const handleViewDetails = (test: AssignedTest) => {
    setSelectedTest(test);
    setIsDetailsModalOpen(true);
  };

  const handleViewResults = (testId: string) => {
    navigate(`/exam-results/${testId}`);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-4 h-4 text-success" />;
      case "in-progress":
        return <Clock className="w-4 h-4 text-warning" />;
      case "expired":
        return <AlertCircle className="w-4 h-4 text-destructive" />;
      default:
        return <Target className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "default";
      case "in-progress": return "secondary";
      case "expired": return "destructive";
      default: return "outline";
    }
  };

  const isTestAvailable = (test: AssignedTest) => {
    const now = new Date();
    const testStart = new Date(test.startDate);
    const testEnd = new Date(test.endDate);
    
    // Set time for start and end dates
    const [startHour, startMinute] = test.startTime.split(':').map(Number);
    const [endHour, endMinute] = test.endTime.split(':').map(Number);
    
    testStart.setHours(startHour, startMinute);
    testEnd.setHours(endHour, endMinute);
    
    return now >= testStart && now <= testEnd;
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading your tests...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">My Assigned Tests</h1>
        <p className="text-muted-foreground">View and attempt your assigned tests</p>
      </div>

      {/* Test Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Target className="w-8 h-8 mx-auto text-primary mb-2" />
            <p className="text-2xl font-bold">{assignedTests.filter(t => t.status === "not-started").length}</p>
            <p className="text-sm text-muted-foreground">Not Started</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Clock className="w-8 h-8 mx-auto text-warning mb-2" />
            <p className="text-2xl font-bold">{assignedTests.filter(t => t.status === "in-progress").length}</p>
            <p className="text-sm text-muted-foreground">In Progress</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <CheckCircle className="w-8 h-8 mx-auto text-success mb-2" />
            <p className="text-2xl font-bold">{assignedTests.filter(t => t.status === "completed").length}</p>
            <p className="text-sm text-muted-foreground">Completed</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <AlertCircle className="w-8 h-8 mx-auto text-destructive mb-2" />
            <p className="text-2xl font-bold">{assignedTests.filter(t => t.status === "expired").length}</p>
            <p className="text-sm text-muted-foreground">Expired</p>
          </CardContent>
        </Card>
      </div>

      {/* Tests Table */}
      <Card>
        <CardHeader>
          <CardTitle>Assigned Tests</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Test Details</TableHead>
                <TableHead>Schedule</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Score</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {assignedTests.map((test) => (
                <TableRow key={test.id} className="hover:bg-accent/50">
                  <TableCell>
                    <div className="space-y-1">
                      <p className="font-medium">{test.title}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Badge variant="outline" className="text-xs">{test.subject}</Badge>
                        <Badge variant="outline" className="text-xs">{test.testType}</Badge>
                        <Badge variant={
                          test.difficulty === "Easy" ? "secondary" : 
                          test.difficulty === "Medium" ? "default" : "destructive"
                        } className="text-xs">
                          {test.difficulty}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {test.totalQuestions} questions • {test.duration} minutes
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div className="flex items-center gap-1 mb-1">
                        <Calendar className="w-3 h-3" />
                        <span>{test.startDate.toLocaleDateString()} - {test.endDate.toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{test.startTime} - {test.endTime}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {test.status === "completed" && test.score ? (
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span>Score:</span>
                          <span className="font-medium">{test.score}%</span>
                        </div>
                        <Progress value={test.score} className="h-2" />
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(test.status)}
                      <Badge variant={getStatusColor(test.status)}>
                        {test.status.replace("-", " ")}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    {test.score ? (
                      <div className="text-sm">
                        <p className="font-medium">{test.score}%</p>
                        <p className="text-muted-foreground">Accuracy: {test.accuracy}%</p>
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {test.status === "not-started" && isTestAvailable(test) && (
                        <Button
                          size="sm"
                          onClick={() => handleStartTest(test.id)}
                          className="bg-success hover:bg-success/90"
                        >
                          <Play className="w-4 h-4 mr-1" />
                          Start
                        </Button>
                      )}
                      {test.status === "completed" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleViewResults(test.id)}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          Results
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleViewDetails(test)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Test Details Modal */}
      <Dialog open={isDetailsModalOpen} onOpenChange={setIsDetailsModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Test Details</DialogTitle>
          </DialogHeader>
          {selectedTest && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Test Title</p>
                  <p className="font-semibold">{selectedTest.title}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Subject</p>
                  <Badge variant="outline">{selectedTest.subject}</Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Type</p>
                  <Badge variant="secondary">{selectedTest.testType}</Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Difficulty</p>
                  <Badge variant={
                    selectedTest.difficulty === "Easy" ? "secondary" : 
                    selectedTest.difficulty === "Medium" ? "default" : "destructive"
                  }>
                    {selectedTest.difficulty}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Duration</p>
                  <p className="font-semibold">{selectedTest.duration} minutes</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Questions</p>
                  <p className="font-semibold">{selectedTest.totalQuestions}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Cutoff Marks</p>
                  <p className="font-semibold">{selectedTest.cutoffMarks}%</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Status</p>
                  <Badge variant={getStatusColor(selectedTest.status)}>
                    {selectedTest.status.replace("-", " ")}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Available From</p>
                  <p className="font-semibold">
                    {selectedTest.startDate.toLocaleDateString()} at {selectedTest.startTime}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Available Until</p>
                  <p className="font-semibold">
                    {selectedTest.endDate.toLocaleDateString()} at {selectedTest.endTime}
                  </p>
                </div>
              </div>

              {selectedTest.status === "completed" && (
                <div className="p-4 bg-success/10 rounded-lg">
                  <h4 className="font-medium mb-2">Test Results</h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">Score</p>
                      <p className="text-2xl font-bold text-success">{selectedTest.score}%</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">Accuracy</p>
                      <p className="text-2xl font-bold text-primary">{selectedTest.accuracy}%</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">Time Taken</p>
                      <p className="text-2xl font-bold text-warning">{selectedTest.timeTaken}m</p>
                    </div>
                  </div>
                  <div className="mt-3">
                    <p className="text-sm text-muted-foreground">
                      Submitted on: {selectedTest.submittedAt?.toLocaleDateString()} at {selectedTest.submittedAt?.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              )}

              {selectedTest.status === "not-started" && isTestAvailable(selectedTest) && (
                <div className="flex justify-center pt-4">
                  <Button onClick={() => handleStartTest(selectedTest.id)} className="bg-success hover:bg-success/90">
                    <Play className="w-4 h-4 mr-2" />
                    Start Test Now
                  </Button>
                </div>
              )}

              {selectedTest.status === "not-started" && !isTestAvailable(selectedTest) && (
                <div className="p-4 bg-warning/10 rounded-lg text-center">
                  <AlertCircle className="w-8 h-8 mx-auto text-warning mb-2" />
                  <p className="text-sm text-warning">
                    This test is not yet available or has expired.
                  </p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}