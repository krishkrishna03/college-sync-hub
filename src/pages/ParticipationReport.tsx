import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Download, X, User, Calendar, Award, BookOpen, Target, TrendingUp, AlertTriangle, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function ParticipationReport() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const studentId = searchParams.get('student') || '1';

  // Mock student data - in real app, fetch based on studentId
  const studentData = {
    id: studentId,
    name: "Alice Johnson",
    registrationId: "CS2024001",
    course: "Computer Science Engineering",
    batch: "2024-A",
    section: "A",
    branch: "Computer Science",
    contactNumber: "+91 98765 43210",
    email: "alice.johnson@college.edu",
    collegeName: "PlantechX College",
    academicTerm: "Semester 1, 2024-25",
    reportIssueDate: "2025-01-15",
    enrollmentDate: "2024-08-15",
    lastActivity: "2025-01-14",
    profilePhoto: "/api/placeholder/120/120"
  };

  const performanceMetrics = {
    modulesAccessed: 8,
    totalExams: 15,
    practiceSessions: 45,
    attendancePercentage: 87,
    timeSpentHours: 142,
    avgScore: 85.5
  };

  const sectionPerformance = [
    { section: "Aptitude", accuracy: 88, avgTime: "2:45 min", attempts: 12, difficulty: "Medium", status: "Completed" },
    { section: "Reasoning", accuracy: 92, avgTime: "3:20 min", attempts: 15, difficulty: "Advanced", status: "Completed" },
    { section: "Verbal", accuracy: 76, avgTime: "4:10 min", attempts: 8, difficulty: "Beginner", status: "In Progress" },
    { section: "Quantitative", accuracy: 84, avgTime: "5:30 min", attempts: 10, difficulty: "Medium", status: "Completed" },
    { section: "Technical", accuracy: 90, avgTime: "6:15 min", attempts: 7, difficulty: "Advanced", status: "Completed" }
  ];

  const swotAnalysis = {
    strengths: ["Strong analytical skills", "Quick problem solving", "Consistent performance"],
    weaknesses: ["Time management in verbal section", "Needs improvement in grammar", "Speed in calculations"],
    opportunities: ["Advanced technical courses", "Leadership programs", "Internship placements"],
    threats: ["Competitive environment", "Time constraints", "Exam pressure"]
  };

  const assignments = [
    { title: "Aptitude Assessment", submittedOn: "2025-01-10", status: "Submitted", score: 87, certified: true },
    { title: "Logical Reasoning Test", submittedOn: "2025-01-08", status: "Submitted", score: 92, certified: true },
    { title: "Verbal Ability Test", submittedOn: "2025-01-05", status: "Pending", score: 0, certified: false },
    { title: "Technical Assessment", submittedOn: "2025-01-12", status: "Submitted", score: 90, certified: true }
  ];

  const completionSummary = {
    totalEnrolledCourses: 5,
    completedAssignments: 12,
    certificationsEarned: 3,
    overallGrade: "A",
    mentorComments: "Excellent performance with consistent improvement. Focus on time management for verbal sections.",
    nextSteps: "Enroll in advanced technical modules and practice more verbal aptitude tests."
  };

  const handleDownload = () => {
    // Simulate PDF generation and download
    console.log("Downloading participation report...");
  };

  const handleClose = () => {
    navigate('/students');
  };

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Header Controls */}
      <div className="flex justify-between items-center mb-6">
        <Button variant="outline" onClick={() => navigate('/students')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Students
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleDownload}>
            <Download className="w-4 h-4 mr-2" />
            Download Report
          </Button>
        </div>
      </div>
            {/* 1. Cover Section */}
            <Card className="bg-gradient-to-r from-primary/10 to-primary/5">
              <CardContent className="p-8">
                <div className="text-center space-y-4">
                  <div className="flex justify-center">
                    <img src="/src/assets/plantech-logo.png" alt="PlantechX" className="h-16" />
                  </div>
                  <h1 className="text-3xl font-bold text-foreground">Academic Performance Report</h1>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 text-sm">
                    <div>
                      <p className="text-muted-foreground">Student Name</p>
                      <p className="font-semibold">{studentData.name}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Registration ID</p>
                      <p className="font-semibold">{studentData.registrationId}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Course</p>
                      <p className="font-semibold">{studentData.course}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Academic Term</p>
                      <p className="font-semibold">{studentData.academicTerm}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Batch</p>
                      <p className="font-semibold">{studentData.batch}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Section</p>
                      <p className="font-semibold">{studentData.section}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Report Date</p>
                      <p className="font-semibold">{studentData.reportIssueDate}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 2. Student Profile Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Student Profile
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row gap-6">
                  <Avatar className="w-24 h-24">
                    <AvatarImage src={studentData.profilePhoto} />
                    <AvatarFallback className="text-lg">
                      {studentData.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
                    <div>
                      <p className="text-sm text-muted-foreground">Full Name</p>
                      <p className="font-semibold">{studentData.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Registration ID</p>
                      <p className="font-semibold">{studentData.registrationId}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">College</p>
                      <p className="font-semibold">{studentData.collegeName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Branch</p>
                      <p className="font-semibold">{studentData.branch}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Contact</p>
                      <p className="font-semibold">{studentData.contactNumber}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Email</p>
                      <p className="font-semibold">{studentData.email}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 3. Exam & Practice Overview */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <BookOpen className="w-8 h-8 mx-auto text-primary mb-2" />
                  <p className="text-2xl font-bold">{performanceMetrics.modulesAccessed}</p>
                  <p className="text-sm text-muted-foreground">Modules Accessed</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <Target className="w-8 h-8 mx-auto text-primary mb-2" />
                  <p className="text-2xl font-bold">{performanceMetrics.totalExams}</p>
                  <p className="text-sm text-muted-foreground">Total Exams</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <TrendingUp className="w-8 h-8 mx-auto text-primary mb-2" />
                  <p className="text-2xl font-bold">{performanceMetrics.practiceSessions}</p>
                  <p className="text-sm text-muted-foreground">Practice Sessions</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <Calendar className="w-8 h-8 mx-auto text-primary mb-2" />
                  <p className="text-2xl font-bold">{performanceMetrics.attendancePercentage}%</p>
                  <p className="text-sm text-muted-foreground">Attendance</p>
                </CardContent>
              </Card>
            </div>

            {/* 4. Section-Wise Performance */}
            <Card>
              <CardHeader>
                <CardTitle>Section-Wise Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>S.No</TableHead>
                      <TableHead>Section/Module</TableHead>
                      <TableHead>Accuracy (%)</TableHead>
                      <TableHead>Avg. Time</TableHead>
                      <TableHead>Attempts</TableHead>
                      <TableHead>Difficulty</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sectionPerformance.map((section, index) => (
                      <TableRow key={index}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell className="font-medium">{section.section}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {section.accuracy}%
                            <Progress value={section.accuracy} className="w-16 h-2" />
                          </div>
                        </TableCell>
                        <TableCell>{section.avgTime}</TableCell>
                        <TableCell>{section.attempts}</TableCell>
                        <TableCell>
                          <Badge variant={section.difficulty === "Advanced" ? "default" : section.difficulty === "Medium" ? "secondary" : "outline"}>
                            {section.difficulty}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={section.status === "Completed" ? "default" : "secondary"}>
                            {section.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* 5. SWOT Analysis */}
            <Card>
              <CardHeader>
                <CardTitle>SWOT Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="border-success/20 bg-success/5">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm flex items-center gap-2 text-success">
                        <CheckCircle className="w-4 h-4" />
                        Strengths
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <ul className="text-sm space-y-1">
                        {swotAnalysis.strengths.map((item, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <span className="text-success">•</span>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                  
                  <Card className="border-destructive/20 bg-destructive/5">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm flex items-center gap-2 text-destructive">
                        <AlertTriangle className="w-4 h-4" />
                        Weaknesses
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <ul className="text-sm space-y-1">
                        {swotAnalysis.weaknesses.map((item, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <span className="text-destructive">•</span>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                  
                  <Card className="border-primary/20 bg-primary/5">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm flex items-center gap-2 text-primary">
                        <TrendingUp className="w-4 h-4" />
                        Opportunities
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <ul className="text-sm space-y-1">
                        {swotAnalysis.opportunities.map((item, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <span className="text-primary">•</span>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                  
                  <Card className="border-warning/20 bg-warning/5">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm flex items-center gap-2 text-warning">
                        <AlertTriangle className="w-4 h-4" />
                        Threats
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <ul className="text-sm space-y-1">
                        {swotAnalysis.threats.map((item, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <span className="text-warning">•</span>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>

            {/* 6. Recommendations */}
            <Card className="border-info/20 bg-info/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-info">
                  <Target className="w-5 h-5" />
                  Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-sm mb-2">Suggested Focus Areas</h4>
                    <ul className="text-sm space-y-1 ml-4">
                      <li>• LSRW Speaking practice</li>
                      <li>• Time management strategies</li>
                      <li>• Advanced quantitative techniques</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm mb-2">Suggested Question Sets</h4>
                    <ul className="text-sm space-y-1 ml-4">
                      <li>• Verbal Aptitude - Grammar section</li>
                      <li>• Speed Mathematics</li>
                      <li>• Advanced Logical Reasoning</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm mb-2">Weekly Study Strategy</h4>
                    <p className="text-sm">Dedicate 2 hours daily for practice, focus on weak areas on weekdays and comprehensive tests on weekends.</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 7. Assignments & Certifications */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-5 h-5" />
                  Assignments & Certifications
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Assignment Title</TableHead>
                      <TableHead>Submitted On</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Score (%)</TableHead>
                      <TableHead>Certified</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {assignments.map((assignment, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{assignment.title}</TableCell>
                        <TableCell>{assignment.submittedOn}</TableCell>
                        <TableCell>
                          <Badge variant={assignment.status === "Submitted" ? "default" : "secondary"}>
                            {assignment.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {assignment.score > 0 ? `${assignment.score}%` : "-"}
                        </TableCell>
                        <TableCell>
                          {assignment.certified ? (
                            <CheckCircle className="w-5 h-5 text-success" />
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* 8. Completion Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <p className="text-2xl font-bold text-primary">{completionSummary.totalEnrolledCourses}</p>
                  <p className="text-sm text-muted-foreground">Total Courses</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <p className="text-2xl font-bold text-primary">{completionSummary.completedAssignments}</p>
                  <p className="text-sm text-muted-foreground">Completed Assignments</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <p className="text-2xl font-bold text-primary">{completionSummary.certificationsEarned}</p>
                  <p className="text-sm text-muted-foreground">Certifications</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <p className="text-2xl font-bold text-primary">{performanceMetrics.avgScore}%</p>
                  <p className="text-sm text-muted-foreground">Avg. Score</p>
                </CardContent>
              </Card>
            </div>

            {/* 9. Final Evaluation */}
            <Card className="border-success/20 bg-success/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-success">
                  <Award className="w-5 h-5" />
                  Final Evaluation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-medium">Overall Grade:</span>
                    <Badge variant="default" className="text-lg px-3 py-1 bg-success text-success-foreground">
                      {completionSummary.overallGrade}
                    </Badge>
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm mb-2">Mentor Comments</h4>
                    <p className="text-sm bg-background p-3 rounded border">{completionSummary.mentorComments}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm mb-2">Suggested Next Steps</h4>
                    <p className="text-sm bg-background p-3 rounded border">{completionSummary.nextSteps}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 10. Signatures Section */}
            <Card>
              <CardHeader>
                <CardTitle>Signatures</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center space-y-2">
                    <div className="border-t border-muted-foreground w-32 mx-auto"></div>
                    <p className="text-sm font-medium">Student Signature</p>
                    <p className="text-xs text-muted-foreground">{studentData.name}</p>
                  </div>
                  <div className="text-center space-y-2">
                    <div className="border-t border-muted-foreground w-32 mx-auto"></div>
                    <p className="text-sm font-medium">Mentor Signature</p>
                    <p className="text-xs text-muted-foreground">Academic Mentor</p>
                  </div>
                  <div className="text-center space-y-2">
                    <div className="border-t border-muted-foreground w-32 mx-auto"></div>
                    <p className="text-sm font-medium">Admin Signature</p>
                    <p className="text-xs text-muted-foreground">College Administrator</p>
                  </div>
                </div>
                <div className="text-center mt-6">
                  <p className="text-sm text-muted-foreground">Report Issue Date: {studentData.reportIssueDate}</p>
                </div>
              </CardContent>
            </Card>
    </div>
  );
}