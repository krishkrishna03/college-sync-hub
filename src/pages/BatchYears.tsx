import { useState } from "react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Edit, Trash2, Eye, ChevronDown, ChevronUp, FileText, MoreHorizontal } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { batchesAPI } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface Branch {
  id: number;
  name: string;
  batchCount: number;
  userCount: number;
}

interface BatchYear {
  id: number;
  year: string;
  branches: Branch[];
  isExpanded: boolean;
}

export default function BatchYears() {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [batchYears, setBatchYears] = useState<BatchYear[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState("10");
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddBatchModalOpen, setIsAddBatchModalOpen] = useState(false);
  const [isAddBranchModalOpen, setIsAddBranchModalOpen] = useState(false);
  const [newBatchYear, setNewBatchYear] = useState("");
  const [newBranch, setNewBranch] = useState({
    batchYear: "",
    name: "",
    batchCount: 0,
    userCount: 0
  });
  const [isEditBranchModalOpen, setIsEditBranchModalOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<{id: number, name: string, batchId: number} | null>(null);

  // Fetch batches on component mount
  useEffect(() => {
    fetchBatches();
  }, []);

  const fetchBatches = async () => {
    try {
      setLoading(true);
      const response = await batchesAPI.getAll();
      const formattedBatches = response.batches.map((batch: any) => ({
        id: batch._id,
        year: batch.year,
        isExpanded: false,
        branches: batch.branches.map((branch: any) => ({
          id: branch._id,
          name: branch.name,
          batchCount: branch.sections?.length || 0,
          userCount: branch.totalStudents || 0
        }))
      }));
      setBatchYears(formattedBatches);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to fetch batches: " + error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredBatchYears = batchYears.filter(batch =>
    batch.year.toLowerCase().includes(searchTerm.toLowerCase()) ||
    batch.branches.some(branch => 
      branch.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const totalPages = Math.ceil(filteredBatchYears.length / parseInt(entriesPerPage));
  const startIndex = (currentPage - 1) * parseInt(entriesPerPage);
  const paginatedBatchYears = filteredBatchYears.slice(startIndex, startIndex + parseInt(entriesPerPage));

  const toggleExpand = (batchId: number) => {
    setBatchYears(prev => prev.map(batch =>
      batch.id === batchId ? { ...batch, isExpanded: !batch.isExpanded } : batch
    ));
  };

  const handleAddBatchYear = async () => {
    if (newBatchYear.trim()) {
      try {
        await batchesAPI.create({ year: newBatchYear });
        fetchBatches();
        toast({
          title: "Batch Created",
          description: `Batch year ${newBatchYear} has been created successfully`
        });
        setNewBatchYear("");
        setIsAddBatchModalOpen(false);
      } catch (error: any) {
        toast({
          title: "Error",
          description: "Failed to create batch: " + error.message,
          variant: "destructive"
        });
      }
    }
  };

  const handleAddBranch = async () => {
    if (newBranch.batchYear && newBranch.name.trim()) {
      try {
        const batch = batchYears.find(b => b.year === newBranch.batchYear);
        if (batch) {
          await batchesAPI.addBranch(batch.id.toString(), {
            name: newBranch.name,
            sections: []
          });
          fetchBatches();
          toast({
            title: "Branch Added",
            description: `Branch ${newBranch.name} has been added successfully`
          });
          setNewBranch({ batchYear: "", name: "", batchCount: 0, userCount: 0 });
          setIsAddBranchModalOpen(false);
        }
      } catch (error: any) {
        toast({
          title: "Error",
          description: "Failed to add branch: " + error.message,
          variant: "destructive"
        });
      }
    }
  };

  const handleDeleteBatch = async (batchId: number) => {
    try {
      await batchesAPI.delete(batchId.toString());
      fetchBatches();
      toast({
        title: "Batch Deleted",
        description: "Batch has been deleted successfully"
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to delete batch: " + error.message,
        variant: "destructive"
      });
    }
  };

  const handleDeleteBranch = async (batchId: number, branchId: number) => {
    try {
      await batchesAPI.deleteBranch(batchId.toString(), branchId.toString());
      fetchBatches();
      toast({
        title: "Branch Deleted",
        description: "Branch has been deleted successfully"
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to delete branch: " + error.message,
        variant: "destructive"
      });
    }
  };

  const handleEditBranch = (batchId: number, branchId: number, branchName: string) => {
    setEditingBranch({ id: branchId, name: branchName, batchId });
    setIsEditBranchModalOpen(true);
  };

  const handleSaveEditBranch = async () => {
    if (editingBranch && editingBranch.name.trim()) {
      try {
        await batchesAPI.updateBranch(
          editingBranch.batchId.toString(),
          editingBranch.id.toString(),
          { name: editingBranch.name }
        );
        fetchBatches();
        toast({
          title: "Branch Updated",
          description: "Branch has been updated successfully"
        });
        setEditingBranch(null);
        setIsEditBranchModalOpen(false);
      } catch (error: any) {
        toast({
          title: "Error",
          description: "Failed to update branch: " + error.message,
          variant: "destructive"
        });
      }
    }
  };

  const handleReports = (batchYear: string) => {
    // Navigate to performance reports with batch year context
    navigate(`/reports?batch=${batchYear}`);
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading batches...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Batch & Branch Management</h1>
        <div className="flex gap-2">
          <Dialog open={isAddBatchModalOpen} onOpenChange={setIsAddBatchModalOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Batch Year
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Batch Year</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="batchYear">Batch Year</Label>
                  <Input
                    id="batchYear"
                    placeholder="e.g., 2028"
                    value={newBatchYear}
                    onChange={(e) => setNewBatchYear(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddBatchModalOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddBatchYear}>Submit</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={isAddBranchModalOpen} onOpenChange={setIsAddBranchModalOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
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
                  <Label htmlFor="selectBatchYear">Select Batch Year</Label>
                  <Select value={newBranch.batchYear} onValueChange={(value) => setNewBranch(prev => ({ ...prev, batchYear: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select batch year" />
                    </SelectTrigger>
                    <SelectContent>
                      {batchYears.map(batch => (
                        <SelectItem key={batch.id} value={batch.year}>{batch.year}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="branchName">Branch Name</Label>
                  <Input
                    id="branchName"
                    placeholder="e.g., CSE"
                    value={newBranch.name}
                    onChange={(e) => setNewBranch(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="batchCount">Batch Count</Label>
                  <Input
                    id="batchCount"
                    type="number"
                    placeholder="0"
                    value={newBranch.batchCount}
                    onChange={(e) => setNewBranch(prev => ({ ...prev, batchCount: parseInt(e.target.value) || 0 }))}
                  />
                </div>
                <div>
                  <Label htmlFor="userCount">User Count</Label>
                  <Input
                    id="userCount"
                    type="number"
                    placeholder="0"
                    value={newBranch.userCount}
                    onChange={(e) => setNewBranch(prev => ({ ...prev, userCount: parseInt(e.target.value) || 0 }))}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddBranchModalOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddBranch}>Submit</Button>
              </DialogFooter>
            </DialogContent>
            </Dialog>

          {/* Edit Branch Modal */}
          <Dialog open={isEditBranchModalOpen} onOpenChange={setIsEditBranchModalOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Branch</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="editBranchName">Branch Name</Label>
                  <Input
                    id="editBranchName"
                    placeholder="e.g., CSE"
                    value={editingBranch?.name || ""}
                    onChange={(e) => setEditingBranch(prev => prev ? { ...prev, name: e.target.value } : null)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsEditBranchModalOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSaveEditBranch}>Save Changes</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Control Panel */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Label htmlFor="entries">Show Entries:</Label>
              <Select value={entriesPerPage} onValueChange={setEntriesPerPage}>
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="40">40</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Label htmlFor="search">Search:</Label>
              <Input
                id="search"
                placeholder="Filter by batch year or branch name"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64"
              />
            </div>
          </div>

          {/* Main Table Display */}
          <div className="space-y-2">
            {paginatedBatchYears.map((batchYear) => (
              <Collapsible key={batchYear.id} open={batchYear.isExpanded} onOpenChange={() => toggleExpand(batchYear.id)}>
                <div className="border rounded-lg">
                  <CollapsibleTrigger asChild>
                    <div className="flex items-center justify-between p-4 hover:bg-muted/50 cursor-pointer">
                      <div className="flex items-center gap-4">
                        {batchYear.isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        <span className="font-semibold text-lg">Batch Year: {batchYear.year}</span>
                        <Badge variant="secondary">{batchYear.branches.length} Branches</Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" onClick={(e) => e.stopPropagation()}>
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem>
                              <Edit className="w-4 h-4 mr-2" />
                              Edit Batch
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDeleteBatch(batchYear.id)} className="text-destructive">
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete Batch
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </CollapsibleTrigger>
                  
                  <CollapsibleContent>
                    <div className="border-t">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Branch Name</TableHead>
                            <TableHead>Section Count</TableHead>
                            <TableHead>User Count</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {batchYear.branches.map((branch) => (
                            <TableRow key={branch.id}>
                              <TableCell className="font-medium">{branch.name}</TableCell>
                              <TableCell>{branch.batchCount}</TableCell>
                              <TableCell>{branch.userCount}</TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => handleEditBranch(batchYear.id, branch.id, branch.name)}
                                  >
                                    <Edit className="w-4 h-4" />
                                  </Button>
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => handleDeleteBranch(batchYear.id, branch.id)}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                          {batchYear.branches.length === 0 && (
                            <TableRow>
                              <TableCell colSpan={4} className="text-center text-muted-foreground">
                                No branches found for this batch year
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </CollapsibleContent>
                </div>
              </Collapsible>
            ))}
          </div>

          {/* Pagination Controls */}
          <div className="flex items-center justify-between mt-6">
            <div className="text-sm text-muted-foreground">
              Showing {startIndex + 1} to {Math.min(startIndex + parseInt(entriesPerPage), filteredBatchYears.length)} of {filteredBatchYears.length} entries
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <Button
                  key={page}
                  variant={currentPage === page ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </Button>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}