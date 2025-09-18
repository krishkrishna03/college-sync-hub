import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Plus, Upload } from "lucide-react";

interface TestRequest {
  id: number;
  testName: string;
  subject: string;
  date: string;
  time: string;
  status: "Requested" | "Approved" | "Rejected";
}

export default function TestRequest() {
  const [testRequests, setTestRequests] = useState<TestRequest[]>([
    {
      id: 1,
      testName: "Advanced Data Structures",
      subject: "Technical",
      date: "2025-07-25",
      time: "10:00 AM",
      status: "Requested"
    },
    {
      id: 2,
      testName: "Verbal Reasoning Assessment",
      subject: "Verbal",
      date: "2025-07-28",
      time: "2:00 PM",
      status: "Approved"
    },
    {
      id: 3,
      testName: "Basic Arithmetic Test",
      subject: "Arithmetic",
      date: "2025-07-22",
      time: "11:00 AM",
      status: "Rejected"
    }
  ]);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newRequest, setNewRequest] = useState({
    contentDescription: "",
    testType: "",
    format: "",
    subject: "",
    numberOfQuestions: "",
    difficultyLevel: "",
    testDuration: ""
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const subjects = ["Arithmetic", "Reasoning", "Verbal", "Technical"];
  const testTypes = ["MCQ", "Paragraph"];
  const formats = ["png", "pdf", "excel", "word", "docx", "doc", "ppt", "csv", "jpg"];
  const difficultyLevels = ["Easy", "Medium", "Hard"];

  const handleCreateRequest = () => {
    if (newRequest.contentDescription && newRequest.testType && newRequest.subject && newRequest.numberOfQuestions && newRequest.difficultyLevel) {
      const newTestRequest: TestRequest = {
        id: Date.now(),
        testName: `${newRequest.subject} Test - ${newRequest.difficultyLevel}`,
        subject: newRequest.subject,
        date: new Date().toISOString().split('T')[0],
        time: "TBD",
        status: "Requested"
      };
      
      setTestRequests([...testRequests, newTestRequest]);
      setNewRequest({
        contentDescription: "",
        testType: "",
        format: "",
        subject: "",
        numberOfQuestions: "",
        difficultyLevel: "",
        testDuration: ""
      });
      setSelectedFile(null);
      setIsCreateModalOpen(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Approved": return "default";
      case "Rejected": return "destructive";
      default: return "secondary";
    }
  };

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Test Request</CardTitle>
            <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
              <DialogTrigger asChild>
                <Button className="ml-auto">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Request
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Create New Exam Request</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="contentDescription">Content Description *</Label>
                    <Textarea
                      id="contentDescription"
                      placeholder="Describe the exam content and topics to cover..."
                      value={newRequest.contentDescription}
                      onChange={(e) => setNewRequest({...newRequest, contentDescription: e.target.value})}
                      className="min-h-[100px]"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="testType">Test Type *</Label>
                      <Select value={newRequest.testType} onValueChange={(value) => setNewRequest({...newRequest, testType: value})}>
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
                      <Label htmlFor="format">Format</Label>
                      <Select value={newRequest.format} onValueChange={(value) => setNewRequest({...newRequest, format: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select format" />
                        </SelectTrigger>
                        <SelectContent>
                          {formats.map(format => (
                            <SelectItem key={format} value={format}>{format}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="fileUpload">File Upload</Label>
                    <Input
                      id="fileUpload"
                      type="file"
                      onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                      className="cursor-pointer"
                    />
                    <p className="text-sm text-muted-foreground mt-1">Upload any relevant material</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="subject">Subject *</Label>
                      <Select value={newRequest.subject} onValueChange={(value) => setNewRequest({...newRequest, subject: value})}>
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
                      <Label htmlFor="numberOfQuestions">Number of Questions *</Label>
                      <Input
                        id="numberOfQuestions"
                        type="number"
                        placeholder="e.g., 50"
                        value={newRequest.numberOfQuestions}
                        onChange={(e) => setNewRequest({...newRequest, numberOfQuestions: e.target.value})}
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="difficultyLevel">Difficulty Level *</Label>
                      <Select value={newRequest.difficultyLevel} onValueChange={(value) => setNewRequest({...newRequest, difficultyLevel: value})}>
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
                      <Label htmlFor="testDuration">Test Duration (minutes)</Label>
                      <Input
                        id="testDuration"
                        type="number"
                        placeholder="e.g., 60"
                        value={newRequest.testDuration}
                        onChange={(e) => setNewRequest({...newRequest, testDuration: e.target.value})}
                      />
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                    Back
                  </Button>
                  <Button onClick={handleCreateRequest}>
                    Request Test
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <Table className="border-collapse border border-border">
            <TableHeader>
              <TableRow className="border-b">
                <TableHead className="border-r">#</TableHead>
                <TableHead className="border-r">Test Name</TableHead>
                <TableHead className="border-r">Subject</TableHead>
                <TableHead className="border-r">Date</TableHead>
                <TableHead className="border-r">Time</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {testRequests.map((request, index) => (
                <TableRow key={request.id} className="border-b hover:bg-muted/50">
                  <TableCell className="border-r">{index + 1}</TableCell>
                  <TableCell className="border-r font-medium">{request.testName}</TableCell>
                  <TableCell className="border-r">{request.subject}</TableCell>
                  <TableCell className="border-r">{request.date}</TableCell>
                  <TableCell className="border-r">{request.time}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusColor(request.status)}>
                      {request.status}
                    </Badge>
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