import { useState } from "react";
import { useLocation } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { FileText, Target, BookOpenCheck, ClipboardList, ChevronRight } from "lucide-react";

interface Test {
  id: number;
  name: string;
  testCode: string;
  questions: number;
  duration: number; // in minutes
  difficulty: "Easy" | "Medium" | "Hard";
  status: "Not Assigned" | "Assigned";
  category: string;
  company?: string;
}

const practiceTests: Test[] = [
  { id: 1, name: "Basic Arithmetic", testCode: "A123", questions: 60, duration: 60, difficulty: "Easy", status: "Not Assigned", category: "Arithmetic" },
  { id: 2, name: "Advanced Arithmetic", testCode: "A124", questions: 45, duration: 75, difficulty: "Hard", status: "Assigned", category: "Arithmetic" },
  { id: 3, name: "Logical Reasoning", testCode: "R125", questions: 50, duration: 60, difficulty: "Medium", status: "Not Assigned", category: "Reasoning" },
  { id: 4, name: "Verbal Ability", testCode: "V126", questions: 40, duration: 45, difficulty: "Easy", status: "Assigned", category: "Verbal" },
  { id: 5, name: "Java Programming", testCode: "T127", questions: 30, duration: 90, difficulty: "Hard", status: "Not Assigned", category: "Technical" },
  { id: 6, name: "Python Basics", testCode: "C128", questions: 35, duration: 60, difficulty: "Medium", status: "Not Assigned", category: "Coding" },
];

const assessmentTests: Test[] = [
  { id: 7, name: "Mid-term Math Assessment", testCode: "AM129", questions: 50, duration: 120, difficulty: "Medium", status: "Assigned", category: "Arithmetic" },
  { id: 8, name: "Reasoning Assessment", testCode: "RM130", questions: 40, duration: 90, difficulty: "Hard", status: "Not Assigned", category: "Reasoning" },
  { id: 9, name: "English Assessment", testCode: "EM131", questions: 35, duration: 60, difficulty: "Medium", status: "Not Assigned", category: "Verbal" },
  { id: 10, name: "Technical Assessment", testCode: "TM132", questions: 25, duration: 75, difficulty: "Hard", status: "Not Assigned", category: "Technical" },
  { id: 11, name: "Coding Assessment", testCode: "CM133", questions: 15, duration: 90, difficulty: "Hard", status: "Assigned", category: "Coding" },
];

const companyTests: Test[] = [
  { id: 12, name: "Infosys Aptitude Test", testCode: "INF134", questions: 60, duration: 90, difficulty: "Medium", status: "Not Assigned", category: "Aptitude", company: "Infosys" },
  { id: 13, name: "TCS CodeVita", testCode: "TCS135", questions: 20, duration: 120, difficulty: "Hard", status: "Assigned", category: "Coding", company: "TCS" },
  { id: 14, name: "Accenture Technical", testCode: "ACC136", questions: 45, duration: 75, difficulty: "Medium", status: "Not Assigned", category: "Technical", company: "Accenture" },
  { id: 15, name: "Wipro Programming", testCode: "WIP137", questions: 25, duration: 90, difficulty: "Hard", status: "Not Assigned", category: "Coding", company: "Wipro" },
  { id: 16, name: "Cognizant Reasoning", testCode: "COG138", questions: 50, duration: 60, difficulty: "Medium", status: "Not Assigned", category: "Reasoning", company: "Cognizant" },
];

const categories = ["Arithmetic", "Reasoning", "Verbal", "Technical", "Coding"];
const companies = ["Infosys", "TCS", "Accenture", "Wipro", "Cognizant"];

export default function ExamManagement() {
  const location = useLocation();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedCompany, setSelectedCompany] = useState<string | null>(null);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedTest, setSelectedTest] = useState<Test | null>(null);
  const [assignmentData, setAssignmentData] = useState({
    batches: [] as string[],
    branches: [] as string[],
    sections: [] as string[]
  });

  // Determine active section based on current route
  const getActiveSection = () => {
    const path = location.pathname;
    if (path.includes('practice')) return 'Practice';
    if (path.includes('assessments')) return 'Assessment';
    if (path.includes('mock')) return 'Mock';
    if (path.includes('company')) return 'Company';
    return 'Assessment'; // Default to Assessment for /exam-management
  };

  const activeSection = getActiveSection();

  const getTestsBySection = () => {
    if (activeSection === "Practice") return practiceTests;
    if (activeSection === "Assessment") return assessmentTests;
    if (activeSection === "Company") return companyTests;
    return [];
  };

  const getFilteredTests = () => {
    let tests = getTestsBySection();
    
    if (selectedCategory && activeSection !== "Company") {
      tests = tests.filter(test => test.category === selectedCategory);
    }
    
    if (selectedCompany && activeSection === "Company") {
      tests = tests.filter(test => test.company === selectedCompany);
    }
    
    return tests;
  };

  const handleAssign = (test: Test) => {
    setSelectedTest(test);
    setIsAssignModalOpen(true);
  };

  const handleAssignSubmit = () => {
    if (selectedTest) {
      // Update test status to "Assigned"
      const tests = getTestsBySection();
      const testIndex = tests.findIndex(t => t.id === selectedTest.id);
      if (testIndex !== -1) {
        tests[testIndex].status = "Assigned";
      }
    }
    setIsAssignModalOpen(false);
    setAssignmentData({ batches: [], branches: [], sections: [] });
  };

  return (
    <div className="p-6 space-y-6">
      {/* Current Section Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          {activeSection === 'Practice' && <BookOpenCheck className="w-8 h-8 text-primary" />}
          {activeSection === 'Assessment' && <FileText className="w-8 h-8 text-primary" />}
          {activeSection === 'Mock' && <ClipboardList className="w-8 h-8 text-primary" />}
          {activeSection === 'Company' && <Target className="w-8 h-8 text-primary" />}
          {activeSection} {activeSection === 'Company' ? 'Specific Tests' : activeSection === 'Practice' ? 'Section' : activeSection === 'Mock' ? 'Tests' : 'Section'}
        </h1>
        <p className="text-muted-foreground mt-2">
          {activeSection === 'Practice' && 'Practice tests for skill improvement'}
          {activeSection === 'Assessment' && 'Formal assessments and evaluations'}
          {activeSection === 'Mock' && 'Mock examinations for practice'}
          {activeSection === 'Company' && 'Company-specific assessments'}
        </p>
      </div>

      {/* Category Selection for Practice only */}
      {activeSection === "Practice" && !selectedCategory && (
        <Card>
          <CardHeader>
            <CardTitle>Practice Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {categories.map(category => (
                <Button
                  key={category}
                  variant="outline"
                  className="justify-between h-auto p-4"
                  onClick={() => setSelectedCategory(category)}
                >
                  <span>{category}</span>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Assessment Tests - Show directly without category selection */}
      {activeSection === "Assessment" && (
        <Card>
          <CardHeader>
            <CardTitle>Assessment Tests (Assigned by Master Admin)</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Test Name</TableHead>
                  <TableHead>Difficulty</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {assessmentTests.map(test => (
                  <TableRow key={test.id}>
                    <TableCell className="font-medium">
                      <div>
                        <div className="font-semibold">{test.name}</div>
                        <div className="text-sm text-muted-foreground">
                          Code: {test.testCode} | Questions: {test.questions} | Duration: {test.duration} min
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={test.difficulty === "Easy" ? "default" : 
                                test.difficulty === "Medium" ? "secondary" : "destructive"}
                      >
                        {test.difficulty}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={test.status === "Assigned" ? "default" : "outline"}>
                        {test.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button 
                        size="sm" 
                        onClick={() => handleAssign(test)}
                        disabled={test.status === "Assigned"}
                      >
                        Assign
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Company Selection */}
      {activeSection === "Company" && !selectedCompany && (
        <Card>
          <CardHeader>
            <CardTitle>Company List</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {companies.map(company => (
                <Button
                  key={company}
                  variant="outline"
                  className="justify-between h-auto p-4"
                  onClick={() => setSelectedCompany(company)}
                >
                  <span>{company}</span>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Mock Tests Message */}
      {activeSection === "Mock" && (
        <Card>
          <CardContent className="p-6">
            <div className="text-center py-8">
              <ClipboardList className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Mock Tests Found</h3>
              <p className="text-muted-foreground">Mock tests will be available soon.</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tests Table */}
      {(selectedCategory || selectedCompany) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>
                {activeSection} Tests 
                {selectedCategory && ` - ${selectedCategory}`}
                {selectedCompany && ` - ${selectedCompany}`}
              </span>
              <Button 
                variant="outline" 
                onClick={() => {
                  setSelectedCategory(null);
                  setSelectedCompany(null);
                }}
              >
                Back to {activeSection === "Company" ? "Companies" : "Categories"}
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Test Name</TableHead>
                  <TableHead>Difficulty</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {getFilteredTests().map(test => (
                  <TableRow key={test.id}>
                    <TableCell className="font-medium">
                      <div>
                        <div className="font-semibold">{test.name}</div>
                        <div className="text-sm text-muted-foreground">
                          Code: {test.testCode} | Questions: {test.questions} | Duration: {test.duration} min
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={test.difficulty === "Easy" ? "default" : 
                                test.difficulty === "Medium" ? "secondary" : "destructive"}
                      >
                        {test.difficulty}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={test.status === "Assigned" ? "default" : "outline"}>
                        {test.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button 
                        size="sm" 
                        onClick={() => handleAssign(test)}
                        disabled={test.status === "Assigned"}
                      >
                        Assign
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Assignment Modal */}
      <Dialog open={isAssignModalOpen} onOpenChange={setIsAssignModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Test: {selectedTest?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            <div>
              <Label className="text-base font-medium">Batches</Label>
              <p className="text-sm text-muted-foreground mb-3">Select multiple batches</p>
              <div className="grid grid-cols-2 gap-3">
                {["2025", "2026", "2027", "2028"].map((batch) => (
                  <div key={batch} className="flex items-center space-x-2">
                    <Checkbox
                      id={`batch-${batch}`}
                      checked={assignmentData.batches.includes(batch)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setAssignmentData({
                            ...assignmentData,
                            batches: [...assignmentData.batches, batch]
                          });
                        } else {
                          setAssignmentData({
                            ...assignmentData,
                            batches: assignmentData.batches.filter(b => b !== batch)
                          });
                        }
                      }}
                    />
                    <label htmlFor={`batch-${batch}`} className="text-sm font-medium">
                      {batch}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Label className="text-base font-medium">Branches</Label>
              <p className="text-sm text-muted-foreground mb-3">Select multiple branches</p>
              <div className="grid grid-cols-2 gap-3">
                {["CSE", "IT", "EEE", "MECH", "CIVIL"].map((branch) => (
                  <div key={branch} className="flex items-center space-x-2">
                    <Checkbox
                      id={`branch-${branch}`}
                      checked={assignmentData.branches.includes(branch)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setAssignmentData({
                            ...assignmentData,
                            branches: [...assignmentData.branches, branch]
                          });
                        } else {
                          setAssignmentData({
                            ...assignmentData,
                            branches: assignmentData.branches.filter(b => b !== branch)
                          });
                        }
                      }}
                    />
                    <label htmlFor={`branch-${branch}`} className="text-sm font-medium">
                      {branch}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Label className="text-base font-medium">Sections</Label>
              <p className="text-sm text-muted-foreground mb-3">Select multiple sections</p>
              <div className="grid grid-cols-4 gap-3">
                {["Section A", "Section B", "Section C", "Section D"].map((section) => (
                  <div key={section} className="flex items-center space-x-2">
                    <Checkbox
                      id={`section-${section}`}
                      checked={assignmentData.sections.includes(section)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setAssignmentData({
                            ...assignmentData,
                            sections: [...assignmentData.sections, section]
                          });
                        } else {
                          setAssignmentData({
                            ...assignmentData,
                            sections: assignmentData.sections.filter(s => s !== section)
                          });
                        }
                      }}
                    />
                    <label htmlFor={`section-${section}`} className="text-sm font-medium">
                      Section {section}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAssignModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAssignSubmit}>
              Assign Test
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}