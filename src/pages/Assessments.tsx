import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Eye, ChevronLeft, ChevronRight, Search } from "lucide-react";
import { StudentReportModal } from "@/components/StudentReportModal";

const mockTests = [
  {
    id: "ASS001",
    name: "Data Structures Assessment",
    assignedDate: "2024-01-15",
    batch: "2025",
    assignedBranches: ["CSE-A", "CSE-B", "IT-A"],
    attempts: 45,
    totalStudents: 50
  },
  {
    id: "ASS002", 
    name: "Programming Fundamentals",
    assignedDate: "2024-01-20",
    batch: "2026",
    assignedBranches: ["EEE-A", "CSE-B"],
    attempts: 32,
    totalStudents: 35
  },
  {
    id: "ASS003",
    name: "Database Management Systems",
    assignedDate: "2024-01-25",
    batch: "2025",
    assignedBranches: ["IT-A", "CSE-A"],
    attempts: 28,
    totalStudents: 30
  }
];

export default function Assessments() {
  const [showEntries, setShowEntries] = useState("10");
  const [selectedBatch, setSelectedBatch] = useState("all");
  const [selectedStream, setSelectedStream] = useState("all");
  const [selectedSection, setSelectedSection] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [selectedTest, setSelectedTest] = useState<any>(null);

  const handleViewReport = (testId: string) => {
    const test = mockTests.find(t => t.id === testId);
    setSelectedTest(test);
    setIsReportModalOpen(true);
  };

  // Filter tests based on search query, batch, stream, and section
  const filteredTests = mockTests.filter(test => {
    const matchesSearch = searchQuery === "" || 
      test.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      test.name.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesBatch = selectedBatch === "all" || test.batch === selectedBatch;
    
    const matchesStream = selectedStream === "all" || 
      test.assignedBranches.some(branch => branch.startsWith(selectedStream));
    
    const matchesSection = selectedSection === "all" || 
      test.assignedBranches.some(branch => branch.endsWith(`-${selectedSection}`));
    
    return matchesSearch && matchesBatch && matchesStream && matchesSection;
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Assessments</h1>
          <p className="text-muted-foreground">Manage and view assessment reports</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Assessment Tests</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search Filter */}
          <div className="flex items-center space-x-2 mb-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                type="text"
                placeholder="Search by Test ID or Test Name"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Control Panel */}
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">Show</span>
              <Select value={showEntries} onValueChange={setShowEntries}>
                <SelectTrigger className="w-[70px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
              <span className="text-sm text-muted-foreground">entries</span>
            </div>

            <div className="flex items-center space-x-2">
              <Select value={selectedBatch} onValueChange={setSelectedBatch}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Batch" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Batches</SelectItem>
                  <SelectItem value="2025">2025</SelectItem>
                  <SelectItem value="2026">2026</SelectItem>
                  <SelectItem value="2027">2027</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedStream} onValueChange={setSelectedStream}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Stream" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Streams</SelectItem>
                  <SelectItem value="CSE">CSE</SelectItem>
                  <SelectItem value="IT">IT</SelectItem>
                  <SelectItem value="EEE">EEE</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedSection} onValueChange={setSelectedSection}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Section" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sections</SelectItem>
                  <SelectItem value="A">A</SelectItem>
                  <SelectItem value="B">B</SelectItem>
                  <SelectItem value="C">C</SelectItem>
                  <SelectItem value="D">D</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Table */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Test ID</TableHead>
                <TableHead>Test Name</TableHead>
                <TableHead>Assigned Date</TableHead>
                <TableHead>Batch</TableHead>
                <TableHead>Assigned Branches</TableHead>
                <TableHead>Attempts</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTests.map((test) => (
                <TableRow key={test.id}>
                  <TableCell className="font-medium">{test.id}</TableCell>
                  <TableCell>{test.name}</TableCell>
                  <TableCell>{test.assignedDate}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{test.batch}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {test.assignedBranches.map((branch) => (
                        <Badge key={branch} variant="secondary" className="text-xs">
                          {branch}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="font-medium">{test.attempts}</span>
                    <span className="text-muted-foreground">/{test.totalStudents}</span>
                  </TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleViewReport(test.id)}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      View Report
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Pagination */}
          <div className="flex justify-between items-center pt-4">
            <p className="text-sm text-muted-foreground">
              Showing 1 to {filteredTests.length} of {filteredTests.length} entries
            </p>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </Button>
              <Badge variant="outline">{currentPage}</Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(currentPage + 1)}
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Student Report Modal */}
      {selectedTest && (
        <StudentReportModal
          isOpen={isReportModalOpen}
          onClose={() => setIsReportModalOpen(false)}
          testId={selectedTest.id}
          testName={selectedTest.name}
          selectedBatch={selectedBatch}
          selectedSection={selectedSection}
        />
      )}
    </div>
  );
}