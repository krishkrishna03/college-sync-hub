import { useState } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, AlertTriangle, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface BulkUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (file: File) => void;
}

interface BulkResultsModalProps {
  isOpen: boolean;
  onClose: () => void;
  results: {
    totalRecords: number;
    accountsCreated: number;
    duplicatesFound: number;
    errors: number;
    duplicatesList?: string[];
    facultyData: Array<{
      name: string;
      email: string;
      facultyId: string;
      branch: string;
      mobile: string;
      tempPassword?: string;
    }>;
  };
  onReview: () => void;
  onSendInvitations: () => void;
}

export function BulkUploadModal({ isOpen, onClose, onUpload }: BulkUploadModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { toast } = useToast();

  const handleUpload = () => {
    if (!selectedFile) {
      toast({
        title: "No file selected",
        description: "Please select a file to upload",
        variant: "destructive"
      });
      return;
    }

    onUpload(selectedFile);
    setSelectedFile(null);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Bulk Upload Faculty</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="file">Choose CSV/Excel File</Label>
            <Input
              id="file"
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
              className="mt-2"
            />
            <p className="text-sm text-muted-foreground mt-2">
              File should contain: Name, Email, Faculty ID, Mobile, Branch
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleUpload} disabled={!selectedFile}>
            Upload
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function BulkResultsModal({ isOpen, onClose, results, onReview, onSendInvitations }: BulkResultsModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Bulk Upload Results</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Summary Stats */}
          <div className="grid grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-primary">{results.totalRecords}</div>
                <div className="text-sm text-muted-foreground">Total Records</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-600">{results.accountsCreated}</div>
                <div className="text-sm text-muted-foreground">Accounts Created</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-yellow-600">{results.duplicatesFound}</div>
                <div className="text-sm text-muted-foreground">Duplicates Found</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-red-600">{results.errors}</div>
                <div className="text-sm text-muted-foreground">Errors</div>
              </CardContent>
            </Card>
          </div>

          {/* Faculty Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                Successfully Created Faculty Accounts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-60 overflow-y-auto">
                {results.facultyData.map((faculty, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="grid grid-cols-2 gap-4 flex-1">
                      <div>
                        <p className="font-medium">{faculty.name}</p>
                        <p className="text-sm text-muted-foreground">{faculty.email}</p>
                      </div>
                      <div>
                        <p className="text-sm">Faculty ID: {faculty.facultyId}</p>
                        <p className="text-sm">Branch: {faculty.branch}</p>
                        <p className="text-sm">Mobile: {faculty.mobile}</p>
                      </div>
                    </div>
                    <Badge variant="secondary" className="ml-4">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Created
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Duplicates Warning */}
          {results.duplicatesFound > 0 && (
            <Card className="border-yellow-200 bg-yellow-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-yellow-800">
                  <AlertTriangle className="w-5 h-5" />
                  Duplicate Entries Found
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-yellow-700">
                  {results.duplicatesFound} duplicate faculty records were found. 
                  Please review your file and remove duplicates before proceeding.
                </p>
                {results.duplicatesList && results.duplicatesList.length > 0 && (
                  <div className="mt-3">
                    <p className="text-sm font-medium text-yellow-800 mb-2">Duplicate emails:</p>
                    <div className="max-h-32 overflow-y-auto">
                      {results.duplicatesList.map((email, index) => (
                        <p key={index} className="text-xs text-yellow-700">• {email}</p>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        <DialogFooter className="flex justify-between">
          <div className="flex gap-2">
            <Button variant="outline" onClick={onReview}>
              Review File
            </Button>
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
          <div className="flex gap-2">
            {results.accountsCreated > 0 && (
              <Button onClick={onSendInvitations} className="bg-green-600 hover:bg-green-700">
                <Download className="w-4 h-4 mr-2" />
                Send Invitations & Download CSV
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}