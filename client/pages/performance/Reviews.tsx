import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { useToast } from "@/hooks/use-toast";
import MainNavigation from "@/components/layout/MainNavigation";
import {
  Filter,
  Plus,
  Download,
  Eye,
  Calendar as CalendarIcon,
  Star,
  User,
  FileText,
} from "lucide-react";

export default function Reviews() {
  const { toast } = useToast();
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [formData, setFormData] = useState({
    employee: "",
    reviewPeriod: "",
    reviewer: "",
    score: 0,
    comments: "",
  });

  // Mock data
  const employees = [
    { id: "1", name: "Sarah Johnson" },
    { id: "2", name: "Michael Chen" },
    { id: "3", name: "Emily Rodriguez" },
    { id: "4", name: "James Miller" },
    { id: "5", name: "Jennifer Brown" },
    { id: "6", name: "David Wilson" },
    { id: "7", name: "Lisa Anderson" },
    { id: "8", name: "Robert Taylor" },
  ];

  const reviewPeriods = [
    { id: "q1-2025", name: "Q1 2025" },
    { id: "q4-2024", name: "Q4 2024" },
    { id: "q3-2024", name: "Q3 2024" },
    { id: "q2-2024", name: "Q2 2024" },
    { id: "q1-2024", name: "Q1 2024" },
  ];

  const reviewers = [
    { id: "1", name: "Sarah Johnson" },
    { id: "2", name: "Michael Chen" },
    { id: "3", name: "Emily Rodriguez" },
    { id: "4", name: "James Miller" },
    { id: "5", name: "Jennifer Brown" },
  ];

  // Mock performance reviews data
  const performanceReviews = [
    {
      id: 1,
      employeeId: "1",
      employeeName: "Sarah Johnson",
      reviewPeriod: "Q4 2024",
      reviewerId: "2",
      reviewerName: "Michael Chen",
      overallScore: 4.5,
      status: "Completed",
      completedDate: "2024-01-15",
    },
    {
      id: 2,
      employeeId: "3",
      employeeName: "Emily Rodriguez",
      reviewPeriod: "Q4 2024",
      reviewerId: "1",
      reviewerName: "Sarah Johnson",
      overallScore: 4.2,
      status: "Completed",
      completedDate: "2024-01-12",
    },
    {
      id: 3,
      employeeId: "4",
      employeeName: "James Miller",
      reviewPeriod: "Q1 2025",
      reviewerId: "2",
      reviewerName: "Michael Chen",
      overallScore: 0,
      status: "Scheduled",
      scheduledDate: "2024-02-15",
    },
    {
      id: 4,
      employeeId: "6",
      employeeName: "David Wilson",
      reviewPeriod: "Q4 2024",
      reviewerId: "1",
      reviewerName: "Sarah Johnson",
      overallScore: 3.8,
      status: "Overdue",
      dueDate: "2024-01-10",
    },
    {
      id: 5,
      employeeId: "7",
      employeeName: "Lisa Anderson",
      reviewPeriod: "Q1 2025",
      reviewerId: "5",
      reviewerName: "Jennifer Brown",
      overallScore: 0,
      status: "Scheduled",
      scheduledDate: "2024-02-20",
    },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Completed":
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
      case "Scheduled":
        return <Badge className="bg-blue-100 text-blue-800">Scheduled</Badge>;
      case "Overdue":
        return <Badge className="bg-red-100 text-red-800">Overdue</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const renderStarRating = (score: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= score
                ? "fill-yellow-400 text-yellow-400"
                : "text-gray-300"
            }`}
          />
        ))}
        <span className="ml-2 text-sm text-gray-600">
          {score > 0 ? score.toFixed(1) : "N/A"}
        </span>
      </div>
    );
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.employee ||
      !formData.reviewPeriod ||
      !formData.reviewer ||
      formData.score === 0
    ) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log("Creating performance review:", formData);

      toast({
        title: "Success",
        description: "Review saved successfully.",
      });

      setFormData({
        employee: "",
        reviewPeriod: "",
        reviewer: "",
        score: 0,
        comments: "",
      });
      setShowAddDialog(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save review. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleFilter = () => {
    console.log("Filtering reviews:", {
      fromDate,
      toDate,
      selectedEmployee: selectedEmployee === "all" ? "" : selectedEmployee,
    });
    toast({
      title: "Filter Applied",
      description: "Reviews filtered successfully.",
    });
  };

  const handleExportCSV = () => {
    const csvData = paginatedReviews.map((review) => ({
      Employee: review.employeeName,
      "Review Period": review.reviewPeriod,
      Reviewer: review.reviewerName,
      "Overall Score": review.overallScore || "N/A",
      Status: review.status,
    }));

    console.log("Exporting CSV data:", csvData);
    toast({
      title: "Export Started",
      description: "CSV file will be downloaded shortly.",
    });
  };

  const handleViewDetails = (reviewId: number) => {
    console.log("Viewing review details:", reviewId);
    toast({
      title: "View Details",
      description: "Opening review details...",
    });
  };

  const handleScheduleNext = (employeeId: string) => {
    console.log("Scheduling next review for employee:", employeeId);
    toast({
      title: "Schedule Next",
      description: "Opening schedule dialog...",
    });
  };

  // Filter and pagination
  const filteredReviews = performanceReviews.filter((review) => {
    if (selectedEmployee && selectedEmployee !== "all") {
      return review.employeeId === selectedEmployee;
    }
    return true;
  });

  const totalPages = Math.ceil(filteredReviews.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedReviews = filteredReviews.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <MainNavigation />

      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Reviews</h1>
            <p className="text-gray-600">
              Manage performance reviews and evaluations
            </p>
          </div>

          {/* Filters */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filters
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                <div>
                  <Label htmlFor="from-date">From Date</Label>
                  <Input
                    id="from-date"
                    type="date"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="to-date">To Date</Label>
                  <Input
                    id="to-date"
                    type="date"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="employee-filter">Employee</Label>
                  <Select
                    value={selectedEmployee}
                    onValueChange={setSelectedEmployee}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All employees" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All employees</SelectItem>
                      {employees.map((employee) => (
                        <SelectItem key={employee.id} value={employee.id}>
                          {employee.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Button onClick={handleFilter} className="w-full">
                    <Filter className="h-4 w-4 mr-2" />
                    Filter
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Reviews Table */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Performance Reviews
                  </CardTitle>
                  <CardDescription>
                    Showing {paginatedReviews.length} of{" "}
                    {filteredReviews.length} reviews
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={handleExportCSV}>
                    <Download className="h-4 w-4 mr-2" />
                    Export CSV
                  </Button>
                  <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Review
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle>Add Performance Review</DialogTitle>
                        <DialogDescription>
                          Create a new performance review
                        </DialogDescription>
                      </DialogHeader>
                      <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                          <Label htmlFor="employee">Employee *</Label>
                          <Select
                            value={formData.employee}
                            onValueChange={(value) =>
                              handleInputChange("employee", value)
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select employee" />
                            </SelectTrigger>
                            <SelectContent>
                              {employees.map((employee) => (
                                <SelectItem
                                  key={employee.id}
                                  value={employee.id}
                                >
                                  {employee.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="review-period">Review Period *</Label>
                          <Select
                            value={formData.reviewPeriod}
                            onValueChange={(value) =>
                              handleInputChange("reviewPeriod", value)
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select period" />
                            </SelectTrigger>
                            <SelectContent>
                              {reviewPeriods.map((period) => (
                                <SelectItem key={period.id} value={period.id}>
                                  {period.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="reviewer">Reviewer *</Label>
                          <Select
                            value={formData.reviewer}
                            onValueChange={(value) =>
                              handleInputChange("reviewer", value)
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select reviewer" />
                            </SelectTrigger>
                            <SelectContent>
                              {reviewers.map((reviewer) => (
                                <SelectItem
                                  key={reviewer.id}
                                  value={reviewer.id}
                                >
                                  {reviewer.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="score">Overall Score *</Label>
                          <div className="flex items-center gap-2 mt-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                type="button"
                                onClick={() => handleInputChange("score", star)}
                                className="p-1"
                              >
                                <Star
                                  className={`h-6 w-6 ${
                                    star <= formData.score
                                      ? "fill-yellow-400 text-yellow-400"
                                      : "text-gray-300 hover:text-yellow-300"
                                  }`}
                                />
                              </button>
                            ))}
                            <span className="ml-2 text-sm">
                              {formData.score > 0
                                ? `${formData.score}/5`
                                : "Select rating"}
                            </span>
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="comments">Comments</Label>
                          <Textarea
                            id="comments"
                            value={formData.comments}
                            onChange={(e) =>
                              handleInputChange("comments", e.target.value)
                            }
                            placeholder="Enter review comments..."
                            rows={3}
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setShowAddDialog(false)}
                            className="flex-1"
                          >
                            Cancel
                          </Button>
                          <Button type="submit" className="flex-1">
                            Save Review
                          </Button>
                        </div>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee Name</TableHead>
                    <TableHead>Review Period</TableHead>
                    <TableHead>Reviewer</TableHead>
                    <TableHead>Overall Score</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedReviews.map((review) => (
                    <TableRow key={review.id}>
                      <TableCell className="font-medium">
                        {review.employeeName}
                      </TableCell>
                      <TableCell>{review.reviewPeriod}</TableCell>
                      <TableCell>{review.reviewerName}</TableCell>
                      <TableCell>
                        {renderStarRating(review.overallScore)}
                      </TableCell>
                      <TableCell>{getStatusBadge(review.status)}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleViewDetails(review.id)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              handleScheduleNext(review.employeeId)
                            }
                          >
                            <CalendarIcon className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-4">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          onClick={() =>
                            setCurrentPage(Math.max(1, currentPage - 1))
                          }
                          className={
                            currentPage === 1
                              ? "pointer-events-none opacity-50"
                              : ""
                          }
                        />
                      </PaginationItem>
                      {[...Array(totalPages)].map((_, i) => (
                        <PaginationItem key={i + 1}>
                          <PaginationLink
                            onClick={() => setCurrentPage(i + 1)}
                            isActive={currentPage === i + 1}
                          >
                            {i + 1}
                          </PaginationLink>
                        </PaginationItem>
                      ))}
                      <PaginationItem>
                        <PaginationNext
                          onClick={() =>
                            setCurrentPage(
                              Math.min(totalPages, currentPage + 1),
                            )
                          }
                          className={
                            currentPage === totalPages
                              ? "pointer-events-none opacity-50"
                              : ""
                          }
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
