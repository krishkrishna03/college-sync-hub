import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Plus, Search, Edit, Trash2, Eye } from "lucide-react";

interface Branch {
  id: number;
  batchYear: string;
  branchName: string;
  usersCount: number;
}

export default function Branches() {
  const [branches, setBranches] = useState<Branch[]>([
    { id: 1, batchYear: "2023-24", branchName: "Computer Science Engineering", usersCount: 120 },
    { id: 2, batchYear: "2023-24", branchName: "Electrical Engineering", usersCount: 80 },
    { id: 3, batchYear: "2022-23", branchName: "Mechanical Engineering", usersCount: 95 },
    { id: 4, batchYear: "2022-23", branchName: "Civil Engineering", usersCount: 75 },
  ]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBatchYear, setSelectedBatchYear] = useState<string>("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newBranch, setNewBranch] = useState({ batchYear: "", branchName: "" });

  const batchYears = ["2023-24", "2022-23", "2021-22"];

  const filteredBranches = branches.filter(branch => {
    const matchesSearch = branch.branchName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesBatchYear = !selectedBatchYear || selectedBatchYear === "all" || branch.batchYear === selectedBatchYear;
    return matchesSearch && matchesBatchYear;
  });

  const handleAddBranch = () => {
    if (newBranch.batchYear && newBranch.branchName.trim()) {
      setBranches([...branches, {
        id: Date.now(),
        ...newBranch,
        usersCount: 0
      }]);
      setNewBranch({ batchYear: "", branchName: "" });
      setIsAddModalOpen(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Branch Management
            <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Branch
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Branch</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="batchYear">Batch Year</Label>
                    <Select value={newBranch.batchYear} onValueChange={(value) => setNewBranch({...newBranch, batchYear: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select batch year" />
                      </SelectTrigger>
                      <SelectContent>
                        {batchYears.map(year => (
                          <SelectItem key={year} value={year}>{year}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="branchName">Branch Name</Label>
                    <Input
                      id="branchName"
                      placeholder="e.g., Computer Science Engineering"
                      value={newBranch.branchName}
                      onChange={(e) => setNewBranch({...newBranch, branchName: e.target.value})}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddBranch}>Add Branch</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4 mb-4">
            <div className="flex items-center space-x-2">
              <Search className="w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search branches..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>
            <Select value={selectedBatchYear} onValueChange={setSelectedBatchYear}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by batch year" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Batch Years</SelectItem>
                {batchYears.map(year => (
                  <SelectItem key={year} value={year}>{year}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>S.No</TableHead>
                <TableHead>Batch Year</TableHead>
                <TableHead>Branch Name</TableHead>
                <TableHead>Users Count</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredBranches.map((branch, index) => (
                <TableRow key={branch.id}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{branch.batchYear}</TableCell>
                  <TableCell className="font-medium">{branch.branchName}</TableCell>
                  <TableCell>{branch.usersCount}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Trash2 className="w-4 h-4" />
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