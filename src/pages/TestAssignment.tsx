import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Plus, Search, Calendar as CalendarIcon, Clock, Users, Target } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface Test {
  id: string;
  title: string;
  subject: string;
  testType: string;
  difficulty: string;
  duration: number;
  totalQuestions: number;
  isAssigned: boolean;
}

interface TestAssignment {
  id: string;
  testId: string;
  testTitle: string;
  startDate: Date;
  endDate: Date;
  startTime: string;
  endTime: string;
  batches: string[];
  branches: string[];
  sections: string[];
  assignedStudents: number;
  createdAt: Date;
}

const mockTests: Test[] = [
  {
    id: "1",
    title: "Data Structures Assessment",
    subject: "Technical",
    testType: "Assessment",
    difficulty: "Medium",
    duration: 90,
    totalQuestions: 50,
    isAssigned: false
  },
  {
    id: "2",
    title: "Programming Fundamentals",
    subject: "Technical",
    testType: "Practice",
    difficulty: "Easy",
    duration: 60,
    totalQuestions: 40,
    isAssigned: true
  },
  {
    id: "3",
    title: "Logical Reasoning Test",
    subject: "Reasoning",
    testType: "Assessment",
    difficulty: "Hard",
    duration: 75,
    totalQuestions: 45,
    isAssigned: false
  }
];

export default function TestAssignment() {
  const { toast } = useToast();
  const [tests, setTests] = useState<Test[]>(mockTests);
  const [assignments, setAssignments] = useState<TestAssignment[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedTest, setSelectedTest] = useState<Test | null>(null);
  const [assignmentData, setAssignmentData] = useState({
    startDate: new Date(),
    endDate: new Date(),
    startTime: "",
    endTime: "",
    batches: [] as string[],
    branches: [] as string[],
    sections: [] as string[]
  });

  const batches = ["2025", "2026", "2027", "2028"];
  const branches = ["CSE", "IT", "EEE", "MECH", "CIVIL"];
  const sections = ["A", "B", "C", "D"];

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      // Mock assignments data
      const mockAssignments: TestAssignment[] = [
        {
          id: "1",
          testId: "2",
          testTitle: "Programming Fundamentals",
          startDate: new Date("2024-03-20"),
          endDate: new Date("2024-03-25"),
          startTime: "10:00",
          endTime: "11:00",
          batches: ["2025"],
          branches: ["CSE"],
          sections: ["A", "B"],
          assignedStudents: 85,
          createdAt: new Date("2024-03-15")
        }
      ];
      setAssignments(mockAssignments);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to fetch assignments: " + error.message,
        variant: "destructive"
      });
    }
  };

  const handleAssignTest = async () => {
    if (!selectedTest || !assignmentData.startDate || !assignmentData.endDate || 
        !assignmentData.startTime || !assignmentData.endTime ||
        assignmentData.batches.length === 0) {
      toast({
        title: "Error",
        description: "Please fill all required fields and select at least one batch",
        variant: "destructive"
      });
      return;
    }

    try {
      const newAssignment: TestAssignment = {
        id: Date.now().toString(),
        testId: selectedTest.id,
        testTitle: selectedTest.title,
        startDate: assignmentData.startDate,
        endDate: assignmentData.endDate,
        startTime: assignmentData.startTime,
        endTime: assignmentData.endTime,
        batches: assignmentData.batches,
        branches: assignmentData.branches,
        sections: assignmentData.sections,
        assignedStudents: calculateAssignedStudents(),
        createdAt: new Date()
      };

      setAssignments(prev => [newAssignment, ...prev]);
      
      // Mark test as assigned
      setTests(prev => prev.map(test => 
        test.id === selectedTest.id ? { ...test, isAssigned: true } : test
      ));

      toast({
        title: "Test Assigned",
        description: `${selectedTest.title} has been assigned successfully to ${newAssignment.assignedStudents} students`
      });

      resetAssignmentForm();
      setIsAssignModalOpen(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to assign test: " + error.message,
        variant: "destructive"
      });
    }
  };

  const calculateAssignedStudents = () => {
    // Mock calculation - in real app, this would query the database
    const studentsPerBatch = 60;
    const studentsPerBranch = 30;
    const studentsPerSection = 25;
    
    let total = 0;
    total += assignmentData.batches.length * studentsPerBatch;
    total += assignmentData.branches.length * studentsPerBranch;
    total += assignmentData.sections.length * studentsPerSection;
    
    return Math.min(total, 150); // Cap at reasonable number
  };

  const resetAssignmentForm = () => {
    setAssignmentData({
      startDate: new Date(),
      endDate: new Date(),
      startTime: "",
      endTime: "",
      batches: [],
      branches: [],
      sections: []
    });
    setSelectedTest(null);
  };

  const handleBatchToggle = (batch: string) => {
    setAssignmentData(prev => ({
      ...prev,
      batches: prev.batches.includes(batch)
        ? prev.batches.filter(b => b !== batch)
        : [...prev.batches, batch]
    }));
  };

  const handleBranchToggle = (branch: string) => {
    setAssignmentData(prev => ({
      ...prev,
      branches: prev.branches.includes(branch)
        ? prev.branches.filter(b => b !== branch)
        : [...prev.branches, branch]
    }));
  };

  const handleSectionToggle = (section: string) => {
    setAssignmentData(prev => ({
      ...prev,
      sections: prev.sections.includes(section)
        ? prev.sections.filter(s => s !== section)
        : [...prev.sections, section]
    }));
  };

  const filteredTests = tests.filter(test => {
    const matchesSearch = test.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         test.subject.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSubject = subjectFilter === "all" || test.subject === subjectFilter;
    const matchesType = typeFilter === "all" || test.testType === typeFilter;
    return matchesSearch && matchesSubject && matchesType;
  });

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Test Assignment</h1>
          <p className="text-muted-foreground">Assign tests to students with scheduling</p>
        </div>
      </div>

      {/* Available Tests */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Available Tests for Assignment
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search tests..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={subjectFilter} onValueChange={setSubjectFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Subject" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Subjects</SelectItem>
                <SelectItem value="Technical">Technical</SelectItem>
                <SelectItem value="Reasoning">Reasoning</SelectItem>
                <SelectItem value="Verbal">Verbal</SelectItem>
                <SelectItem value="Arithmetic">Arithmetic</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="Practice">Practice</SelectItem>
                <SelectItem value="Assessment">Assessment</SelectItem>
                <SelectItem value="Mock Test">Mock Test</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Tests Table */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Test Name</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Difficulty</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Questions</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTests.map((test) => (
                <TableRow key={test.id} className="hover:bg-accent/50">
                  <TableCell className="font-medium">{test.title}</TableCell>
                  <TableCell>{test.subject}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{test.testType}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={
                      test.difficulty === "Easy" ? "secondary" : 
                      test.difficulty === "Medium" ? "default" : "destructive"
                    }>
                      {test.difficulty}
                    </Badge>
                  </TableCell>
                  <TableCell>{test.duration} min</TableCell>
                  <TableCell>{test.totalQuestions}</TableCell>
                  <TableCell>
                    <Badge variant={test.isAssigned ? "default" : "outline"}>
                      {test.isAssigned ? "Assigned" : "Available"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Dialog open={isAssignModalOpen && selectedTest?.id === test.id} onOpenChange={(open) => {
                      if (!open) {
                        setIsAssignModalOpen(false);
                        setSelectedTest(null);
                        resetAssignmentForm();
                      }
                    }}>
                      <DialogTrigger asChild>
                        <Button
                          size="sm"
                          onClick={() => {
                            setSelectedTest(test);
                            setIsAssignModalOpen(true);
                          }}
                          disabled={test.isAssigned}
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          Assign
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-3xl">
                        <DialogHeader>
                          <DialogTitle>Assign Test: {test.title}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-6">
                          {/* Date and Time Selection */}
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label>Start Date *</Label>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <Button
                                    variant="outline"
                                    className={cn(
                                      "w-full justify-start text-left font-normal",
                                      !assignmentData.startDate && "text-muted-foreground"
                                    )}
                                  >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {assignmentData.startDate ? format(assignmentData.startDate, "PPP") : "Pick a date"}
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                  <Calendar
                                    mode="single"
                                    selected={assignmentData.startDate}
                                    onSelect={(date) => setAssignmentData({...assignmentData, startDate: date || new Date()})}
                                    initialFocus
                                  />
                                </PopoverContent>
                              </Popover>
                            </div>
                            <div>
                              <Label>End Date *</Label>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <Button
                                    variant="outline"
                                    className={cn(
                                      "w-full justify-start text-left font-normal",
                                      !assignmentData.endDate && "text-muted-foreground"
                                    )}
                                  >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {assignmentData.endDate ? format(assignmentData.endDate, "PPP") : "Pick a date"}
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                  <Calendar
                                    mode="single"
                                    selected={assignmentData.endDate}
                                    onSelect={(date) => setAssignmentData({...assignmentData, endDate: date || new Date()})}
                                    initialFocus
                                  />
                                </PopoverContent>
                              </Popover>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="startTime">Start Time *</Label>
                              <Input
                                id="startTime"
                                type="time"
                                value={assignmentData.startTime}
                                onChange={(e) => setAssignmentData({...assignmentData, startTime: e.target.value})}
                              />
                            </div>
                            <div>
                              <Label htmlFor="endTime">End Time *</Label>
                              <Input
                                id="endTime"
                                type="time"
                                value={assignmentData.endTime}
                                onChange={(e) => setAssignmentData({...assignmentData, endTime: e.target.value})}
                              />
                            </div>
                          </div>

                          {/* Target Selection */}
                          <div className="space-y-4">
                            <div>
                              <Label className="text-base font-medium">Batches *</Label>
                              <div className="grid grid-cols-4 gap-3 mt-2">
                                {batches.map((batch) => (
                                  <div key={batch} className="flex items-center space-x-2">
                                    <Checkbox
                                      id={`batch-${batch}`}
                                      checked={assignmentData.batches.includes(batch)}
                                      onCheckedChange={() => handleBatchToggle(batch)}
                                    />
                                    <Label htmlFor={`batch-${batch}`} className="text-sm">
                                      {batch}
                                    </Label>
                                  </div>
                                ))}
                              </div>
                            </div>

                            <div>
                              <Label className="text-base font-medium">Branches (Optional)</Label>
                              <div className="grid grid-cols-5 gap-3 mt-2">
                                {branches.map((branch) => (
                                  <div key={branch} className="flex items-center space-x-2">
                                    <Checkbox
                                      id={`branch-${branch}`}
                                      checked={assignmentData.branches.includes(branch)}
                                      onCheckedChange={() => handleBranchToggle(branch)}
                                    />
                                    <Label htmlFor={`branch-${branch}`} className="text-sm">
                                      {branch}
                                    </Label>
                                  </div>
                                ))}
                              </div>
                            </div>

                            <div>
                              <Label className="text-base font-medium">Sections (Optional)</Label>
                              <div className="grid grid-cols-4 gap-3 mt-2">
                                {sections.map((section) => (
                                  <div key={section} className="flex items-center space-x-2">
                                    <Checkbox
                                      id={`section-${section}`}
                                      checked={assignmentData.sections.includes(section)}
                                      onCheckedChange={() => handleSectionToggle(section)}
                                    />
                                    <Label htmlFor={`section-${section}`} className="text-sm">
                                      Section {section}
                                    </Label>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>

                          {/* Assignment Preview */}
                          <div className="p-4 bg-muted/50 rounded-lg">
                            <h4 className="font-medium mb-2">Assignment Preview</h4>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="text-muted-foreground">Test:</span>
                                <span className="ml-2 font-medium">{test.title}</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Duration:</span>
                                <span className="ml-2 font-medium">{test.duration} minutes</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Schedule:</span>
                                <span className="ml-2 font-medium">
                                  {assignmentData.startDate ? format(assignmentData.startDate, "MMM dd") : "Not set"} - 
                                  {assignmentData.endDate ? format(assignmentData.endDate, "MMM dd") : "Not set"}
                                </span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Time:</span>
                                <span className="ml-2 font-medium">
                                  {assignmentData.startTime || "Not set"} - {assignmentData.endTime || "Not set"}
                                </span>
                              </div>
                              <div className="col-span-2">
                                <span className="text-muted-foreground">Estimated Students:</span>
                                <span className="ml-2 font-medium text-primary">{calculateAssignedStudents()}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setIsAssignModalOpen(false)}>
                            Cancel
                          </Button>
                          <Button onClick={handleAssignTest}>
                            <Target className="w-4 h-4 mr-2" />
                            Assign Test
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Current Assignments */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Current Test Assignments
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Test Name</TableHead>
                <TableHead>Schedule</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Target Groups</TableHead>
                <TableHead>Assigned Students</TableHead>
                <TableHead>Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {assignments.map((assignment) => (
                <TableRow key={assignment.id} className="hover:bg-accent/50">
                  <TableCell className="font-medium">{assignment.testTitle}</TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <p>{format(assignment.startDate, "MMM dd")} - {format(assignment.endDate, "MMM dd")}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <p>{assignment.startTime} - {assignment.endTime}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      {assignment.batches.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          <span className="text-xs text-muted-foreground">Batches:</span>
                          {assignment.batches.map(batch => (
                            <Badge key={batch} variant="secondary" className="text-xs">
                              {batch}
                            </Badge>
                          ))}
                        </div>
                      )}
                      {assignment.branches.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          <span className="text-xs text-muted-foreground">Branches:</span>
                          {assignment.branches.map(branch => (
                            <Badge key={branch} variant="outline" className="text-xs">
                              {branch}
                            </Badge>
                          ))}
                        </div>
                      )}
                      {assignment.sections.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          <span className="text-xs text-muted-foreground">Sections:</span>
                          {assignment.sections.map(section => (
                            <Badge key={section} variant="outline" className="text-xs">
                              {section}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-primary" />
                      <span className="font-medium">{assignment.assignedStudents}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {format(assignment.createdAt, "MMM dd, yyyy")}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {assignments.length === 0 && (
            <div className="text-center py-8">
              <Clock className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Test Assignments</h3>
              <p className="text-muted-foreground">Start by assigning tests to students from the available tests above.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}