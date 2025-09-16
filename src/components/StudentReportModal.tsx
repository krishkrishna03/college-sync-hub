import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Download, ChevronLeft, ChevronRight } from "lucide-react";

interface StudentReport {
  id: string;
  name: string;
  registrationNumber: string;
  cutoffMarks: number;
  marksAttained: number;
  accuracyPercentage: number;
  status: "qualified" | "disqualified";
  branch: string;
  section: string;
}

interface StudentReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  testId: string;
  testName: string;
  selectedBatch: string;
  selectedSection: string;
}

const mockStudentReports: StudentReport[] = [
  {
    id: "1",
    name: "John Smith",
    registrationNumber: "21CSE001",
    cutoffMarks: 60,
    marksAttained: 85,
    accuracyPercentage: 92.5,
    status: "qualified",
    branch: "CSE",
    section: "A"
  },
  {
    id: "2", 
    name: "Sarah Johnson",
    registrationNumber: "21CSE002",
    cutoffMarks: 60,
    marksAttained: 45,
    accuracyPercentage: 68.2,
    status: "disqualified",
    branch: "CSE",
    section: "A"
  },
  {
    id: "3",
    name: "Mike Wilson",
    registrationNumber: "21IT001",
    cutoffMarks: 60,
    marksAttained: 78,
    accuracyPercentage: 87.3,
    status: "qualified",
    branch: "IT",
    section: "A"
  },
  {
    id: "4",
    name: "Emily Davis",
    registrationNumber: "21EEE001",
    cutoffMarks: 60,
    marksAttained: 92,
    accuracyPercentage: 96.8,
    status: "qualified",
    branch: "EEE",
    section: "A"
  }
];

export function StudentReportModal({ isOpen, onClose, testId, testName, selectedBatch, selectedSection }: StudentReportModalProps) {
  const [showEntries, setShowEntries] = useState("10");
  const [currentPage, setCurrentPage] = useState(1);

  const filteredReports = mockStudentReports.filter(report => {
    if (selectedSection !== "all" && selectedSection !== `${report.branch}-${report.section}`) {
      return false;
    }
    return true;
  });

  const handleDownloadReport = () => {
    const csvContent = [
      ["Name", "Registration Number", "Cutoff Marks", "Marks Attained", "Accuracy %", "Status"].join(","),
      ...filteredReports.map(report => [
        report.name,
        report.registrationNumber,
        report.cutoffMarks,
        report.marksAttained,
        report.accuracyPercentage,
        report.status
      ].join(","))
    ].join("\n");
    
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${testName}_Report_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Student Report - {testName}</span>
            <Button onClick={handleDownloadReport} size="sm">
              <Download className="w-4 h-4 mr-2" />
              Download Report
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Control Panel */}
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <span className="text-sm">Show</span>
              <Select value={showEntries} onValueChange={setShowEntries}>
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="30">30</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
              <span className="text-sm">entries</span>
            </div>

            <div className="text-sm text-muted-foreground">
              Filtered by: Batch {selectedBatch}, Section {selectedSection}
            </div>
          </div>

          {/* Table */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Registration Number</TableHead>
                <TableHead>Cutoff Marks</TableHead>
                <TableHead>Marks Attained</TableHead>
                <TableHead>Accuracy %</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredReports.map((report) => (
                <TableRow key={report.id}>
                  <TableCell className="font-medium">{report.name}</TableCell>
                  <TableCell>{report.registrationNumber}</TableCell>
                  <TableCell>{report.cutoffMarks}</TableCell>
                  <TableCell className="font-medium">{report.marksAttained}</TableCell>
                  <TableCell>{report.accuracyPercentage}%</TableCell>
                  <TableCell>
                    <Badge 
                      variant={report.status === "qualified" ? "default" : "destructive"}
                    >
                      {report.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Pagination */}
          <div className="flex justify-between items-center pt-4">
            <p className="text-sm text-muted-foreground">
              Showing 1 to {filteredReports.length} of {filteredReports.length} entries
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
        </div>
      </DialogContent>
    </Dialog>
  );
}