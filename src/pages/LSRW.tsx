import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Edit, Eye, UserPlus, Headphones, Mic, BookOpen, PenTool, Clock, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface LSRWTest {
  id: string;
  title: string;
  description: string;
  level: "Easy" | "Intermediate" | "Advanced";
  duration: number;
  totalQuestions: number;
  skills: {
    listening: number;
    speaking: number;
    reading: number;
    writing: number;
  };
  assignedTo: string[];
  createdBy: string;
  createdDate: string;
}

const practiceTests: LSRWTest[] = [
  {
    id: "p1",
    title: "Basic Communication Skills",
    description: "Fundamental LSRW skills for beginners",
    level: "Easy",
    duration: 45,
    totalQuestions: 20,
    skills: { listening: 5, speaking: 5, reading: 5, writing: 5 },
    assignedTo: ["Batch A", "Batch B"],
    createdBy: "Admin",
    createdDate: "2024-01-15"
  },
  {
    id: "p2",
    title: "Everyday English Practice",
    description: "Common scenarios and daily communication",
    level: "Easy",
    duration: 60,
    totalQuestions: 24,
    skills: { listening: 6, speaking: 6, reading: 6, writing: 6 },
    assignedTo: ["Batch C"],
    createdBy: "Admin",
    createdDate: "2024-01-20"
  },
  {
    id: "p3",
    title: "Grammar Fundamentals",
    description: "Basic grammar and sentence formation",
    level: "Easy",
    duration: 40,
    totalQuestions: 16,
    skills: { listening: 4, speaking: 4, reading: 4, writing: 4 },
    assignedTo: [],
    createdBy: "Admin",
    createdDate: "2024-01-25"
  }
];

const assessmentTests: LSRWTest[] = [
  {
    id: "a1",
    title: "Professional Communication Assessment",
    description: "Advanced workplace communication skills",
    level: "Advanced",
    duration: 90,
    totalQuestions: 40,
    skills: { listening: 10, speaking: 10, reading: 10, writing: 10 },
    assignedTo: ["Batch A"],
    createdBy: "Admin",
    createdDate: "2024-01-10"
  },
  {
    id: "a2",
    title: "Academic English Evaluation",
    description: "Intermediate to advanced academic skills",
    level: "Intermediate",
    duration: 75,
    totalQuestions: 32,
    skills: { listening: 8, speaking: 8, reading: 8, writing: 8 },
    assignedTo: ["Batch B", "Batch D"],
    createdBy: "Admin",
    createdDate: "2024-01-18"
  },
  {
    id: "a3",
    title: "Business Communication Test",
    description: "Corporate level communication assessment",
    level: "Advanced",
    duration: 120,
    totalQuestions: 48,
    skills: { listening: 12, speaking: 12, reading: 12, writing: 12 },
    assignedTo: [],
    createdBy: "Admin",
    createdDate: "2024-01-22"
  }
];

const batches = ["2025", "2026", "2027", "2028"];
const branches = ["Computer Science", "Information Technology", "Electronics", "Mechanical"];
const sections = ["Section A", "Section B", "Section C", "Section D"];

export default function LSRW() {
  const { toast } = useToast();
  const [selectedTest, setSelectedTest] = useState<LSRWTest | null>(null);
  const [editTest, setEditTest] = useState<LSRWTest | null>(null);
  const [assignTest, setAssignTest] = useState<LSRWTest | null>(null);
  const [selectedBatches, setSelectedBatches] = useState<string[]>([]);
  const [selectedBranches, setSelectedBranches] = useState<string[]>([]);
  const [selectedSections, setSelectedSections] = useState<string[]>([]);
  const [editBatches, setEditBatches] = useState<string[]>([]);
  const [editBranches, setEditBranches] = useState<string[]>([]);
  const [editSections, setEditSections] = useState<string[]>([]);
  const [showSaveConfirmation, setShowSaveConfirmation] = useState(false);
  const [originalAssignments, setOriginalAssignments] = useState<string[]>([]);

  const handleEdit = (test: LSRWTest) => {
    setEditTest(test);
    setOriginalAssignments([...test.assignedTo]);
    setEditBatches(test.assignedTo.filter(item => batches.includes(item)));
    setEditBranches(test.assignedTo.filter(item => branches.includes(item)));
    setEditSections(test.assignedTo.filter(item => sections.includes(item)));
  };

  const handleView = (test: LSRWTest) => {
    setSelectedTest(test);
  };

  const handleAssign = (test: LSRWTest) => {
    setAssignTest(test);
    setSelectedBatches(test.assignedTo);
    setSelectedBranches([]);
    setSelectedSections([]);
  };

  const handleSaveChanges = () => {
    const newAssignments = [...editBatches, ...editBranches, ...editSections];
    if (originalAssignments.length > 0 && newAssignments.length > 0) {
      setShowSaveConfirmation(true);
    } else {
      saveAssignments(newAssignments);
    }
  };

  const saveAssignments = (assignments: string[], keepOriginal: boolean = false) => {
    if (editTest) {
      if (keepOriginal) {
        editTest.assignedTo = [...new Set([...originalAssignments, ...assignments])];
      } else {
        editTest.assignedTo = assignments;
      }
      toast({
        title: "Test Updated",
        description: "Test assignment has been updated successfully.",
      });
    }
    setEditTest(null);
    setEditBatches([]);
    setEditBranches([]);
    setEditSections([]);
    setShowSaveConfirmation(false);
    setOriginalAssignments([]);
  };

  const handleApplyAssignment = () => {
    if (assignTest) {
      const newAssignments = [...selectedBatches, ...selectedBranches, ...selectedSections];
      assignTest.assignedTo = newAssignments;
      toast({
        title: "Test Assigned",
        description: "Test has been successfully assigned.",
      });
    }
    setAssignTest(null);
    setSelectedBatches([]);
    setSelectedBranches([]);
    setSelectedSections([]);
  };

  const TestCard = ({ test, mode }: { test: LSRWTest; mode: string }) => (
    <Card className="min-w-[350px] max-w-[350px] hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/20">
      <CardHeader className="pb-4">
        <div className="flex justify-between items-start mb-3">
          <Badge 
            variant={test.level === "Easy" ? "secondary" : test.level === "Intermediate" ? "default" : "destructive"}
            className="text-xs font-medium px-3 py-1"
          >
            {test.level}
          </Badge>
          <Badge variant="outline" className="text-xs px-3 py-1">{mode}</Badge>
        </div>
        <CardTitle className="text-lg leading-tight mb-2">{test.title}</CardTitle>
        <p className="text-sm text-muted-foreground leading-relaxed">{test.description}</p>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg">
            <Clock className="w-4 h-4 text-primary" />
            <span className="font-medium">{test.duration} min</span>
          </div>
          <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg">
            <Users className="w-4 h-4 text-primary" />
            <span className="font-medium">{test.totalQuestions} questions</span>
          </div>
        </div>
        

        {test.assignedTo.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-semibold text-foreground">Assigned to:</p>
            <div className="flex flex-wrap gap-1.5">
              {test.assignedTo.map((item) => (
                <Badge key={item} variant="secondary" className="text-xs px-2 py-1 bg-primary/10 text-primary hover:bg-primary/20">
                  {item}
                </Badge>
              ))}
            </div>
          </div>
        )}

        <Separator className="my-4" />
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleEdit(test)}
            className="flex-1 hover:bg-primary hover:text-primary-foreground transition-colors"
          >
            <Edit className="w-4 h-4 mr-1" />
            Edit
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleView(test)}
            className="flex-1 hover:bg-secondary hover:text-secondary-foreground transition-colors"
          >
            <Eye className="w-4 h-4 mr-1" />
            View
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleAssign(test)}
            className="flex-1 hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            <UserPlus className="w-4 h-4 mr-1" />
            Assign
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">LSRW Skills</h1>
          <p className="text-muted-foreground">Listening, Speaking, Reading & Writing Tests</p>
        </div>
      </div>

      <Tabs defaultValue="practice" className="space-y-8">
        <div className="overflow-x-auto pb-2">
          <TabsList className="inline-flex h-14 items-center justify-center rounded-xl bg-muted/50 p-1.5 text-muted-foreground min-w-max border border-border/50">
            <TabsTrigger 
              value="practice" 
              className="flex items-center gap-3 px-8 py-3 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all duration-200"
            >
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <span className="font-medium">Practice Mode</span>
              </div>
              <Badge variant="secondary" className="ml-2 bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                Easy Level
              </Badge>
            </TabsTrigger>
            <TabsTrigger 
              value="assessment" 
              className="flex items-center gap-3 px-8 py-3 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all duration-200"
            >
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                <span className="font-medium">Assessment Mode</span>
              </div>
              <Badge variant="default" className="ml-2 bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                Intermediate & Advanced
              </Badge>
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="practice" className="mt-6">
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 rounded-xl p-6 border border-green-200 dark:border-green-800">
            <div className="overflow-x-auto">
              <div className="flex space-x-6 pb-4 min-w-max">
                {practiceTests.map((test) => (
                  <TestCard key={test.id} test={test} mode="Practice" />
                ))}
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="assessment" className="mt-6">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
            <div className="overflow-x-auto">
              <div className="flex space-x-6 pb-4 min-w-max">
                {assessmentTests.map((test) => (
                  <TestCard key={test.id} test={test} mode="Assessment" />
                ))}
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Edit Test Dialog */}
      <Dialog open={!!editTest} onOpenChange={() => setEditTest(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Test Assignment</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Modify the assignment for: <strong>{editTest?.title}</strong>
            </p>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Batches:</label>
                <div className="mt-2 space-y-2 max-h-32 overflow-y-auto">
                  {batches.map((batch) => (
                    <div key={batch} className="flex items-center space-x-2">
                      <Checkbox
                        id={`edit-batch-${batch}`}
                        checked={editBatches.includes(batch)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setEditBatches([...editBatches, batch]);
                          } else {
                            setEditBatches(editBatches.filter(b => b !== batch));
                          }
                        }}
                      />
                      <label htmlFor={`edit-batch-${batch}`} className="text-sm">{batch}</label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Branches:</label>
                <div className="mt-2 space-y-2 max-h-32 overflow-y-auto">
                  {branches.map((branch) => (
                    <div key={branch} className="flex items-center space-x-2">
                      <Checkbox
                        id={`edit-branch-${branch}`}
                        checked={editBranches.includes(branch)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setEditBranches([...editBranches, branch]);
                          } else {
                            setEditBranches(editBranches.filter(b => b !== branch));
                          }
                        }}
                      />
                      <label htmlFor={`edit-branch-${branch}`} className="text-sm">{branch}</label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Sections:</label>
                <div className="mt-2 space-y-2 max-h-32 overflow-y-auto">
                  {sections.map((section) => (
                    <div key={section} className="flex items-center space-x-2">
                      <Checkbox
                        id={`edit-section-${section}`}
                        checked={editSections.includes(section)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setEditSections([...editSections, section]);
                          } else {
                            setEditSections(editSections.filter(s => s !== section));
                          }
                        }}
                      />
                      <label htmlFor={`edit-section-${section}`} className="text-sm">{section}</label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSaveChanges} className="flex-1">Save Changes</Button>
              <Button variant="outline" onClick={() => setEditTest(null)} className="flex-1">
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Test Dialog */}
      <Dialog open={!!selectedTest} onOpenChange={() => setSelectedTest(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedTest?.title}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="font-medium">Level:</p>
                <Badge variant={selectedTest?.level === "Easy" ? "secondary" : "default"}>
                  {selectedTest?.level}
                </Badge>
              </div>
              <div>
                <p className="font-medium">Duration:</p>
                <p>{selectedTest?.duration} minutes</p>
              </div>
            </div>
            
            <div>
              <p className="font-medium mb-2">Skills Breakdown:</p>
              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center gap-2">
                  <Headphones className="w-4 h-4" />
                  <span>Listening: {selectedTest?.skills.listening} questions</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mic className="w-4 h-4" />
                  <span>Speaking: {selectedTest?.skills.speaking} questions</span>
                </div>
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  <span>Reading: {selectedTest?.skills.reading} questions</span>
                </div>
                <div className="flex items-center gap-2">
                  <PenTool className="w-4 h-4" />
                  <span>Writing: {selectedTest?.skills.writing} questions</span>
                </div>
              </div>
            </div>

            <div>
              <p className="font-medium">Sample Questions Preview:</p>
              <div className="mt-2 p-3 bg-muted rounded-md text-sm">
                <p>• Listening: Audio comprehension exercises</p>
                <p>• Speaking: Pronunciation and fluency tasks</p>
                <p>• Reading: Text comprehension and vocabulary</p>
                <p>• Writing: Essay and grammar exercises</p>
              </div>
            </div>

            <Button onClick={() => setSelectedTest(null)} className="w-full">
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Assign Test Dialog */}
      <Dialog open={!!assignTest} onOpenChange={() => setAssignTest(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Assign Test</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Assign <strong>{assignTest?.title}</strong> to:
            </p>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Batches:</label>
                <div className="mt-2 space-y-2 max-h-32 overflow-y-auto">
                  {batches.map((batch) => (
                    <div key={batch} className="flex items-center space-x-2">
                      <Checkbox
                        id={`batch-${batch}`}
                        checked={selectedBatches.includes(batch)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedBatches([...selectedBatches, batch]);
                          } else {
                            setSelectedBatches(selectedBatches.filter(b => b !== batch));
                          }
                        }}
                      />
                      <label htmlFor={`batch-${batch}`} className="text-sm">{batch}</label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Branches:</label>
                <div className="mt-2 space-y-2 max-h-32 overflow-y-auto">
                  {branches.map((branch) => (
                    <div key={branch} className="flex items-center space-x-2">
                      <Checkbox
                        id={`branch-${branch}`}
                        checked={selectedBranches.includes(branch)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedBranches([...selectedBranches, branch]);
                          } else {
                            setSelectedBranches(selectedBranches.filter(b => b !== branch));
                          }
                        }}
                      />
                      <label htmlFor={`branch-${branch}`} className="text-sm">{branch}</label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Sections:</label>
                <div className="mt-2 space-y-2 max-h-32 overflow-y-auto">
                  {sections.map((section) => (
                    <div key={section} className="flex items-center space-x-2">
                      <Checkbox
                        id={`section-${section}`}
                        checked={selectedSections.includes(section)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedSections([...selectedSections, section]);
                          } else {
                            setSelectedSections(selectedSections.filter(s => s !== section));
                          }
                        }}
                      />
                      <label htmlFor={`section-${section}`} className="text-sm">{section}</label>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleApplyAssignment} className="flex-1">
                Apply
              </Button>
              <Button variant="outline" onClick={() => setAssignTest(null)} className="flex-1">
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Save Confirmation Dialog */}
      <AlertDialog open={showSaveConfirmation} onOpenChange={setShowSaveConfirmation}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Save Assignment Changes</AlertDialogTitle>
            <AlertDialogDescription>
              This test is already assigned to some batches/streams/sections. Do you want to keep the existing assignments along with the new ones?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => saveAssignments([...editBatches, ...editBranches, ...editSections], false)}>
              No, Replace All
            </AlertDialogCancel>
            <AlertDialogAction onClick={() => saveAssignments([...editBatches, ...editBranches, ...editSections], true)}>
              Yes, Keep Both
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}