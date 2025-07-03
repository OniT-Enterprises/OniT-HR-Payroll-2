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
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { useToast } from "@/hooks/use-toast";
import MainNavigation from "@/components/layout/MainNavigation";
import { Calendar, Filter, Plus, Download, Clock, User } from "lucide-react";

export default function TimeTracking() {
  const { toast } = useToast();
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const [formData, setFormData] = useState({
    employee: "",
    date: "",
    project: "",
    startTime: "",
    endTime: "",
  });

  // Mock data for employees (would come from Firestore)
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

  // Mock time entries data (would come from Firestore with filtering)
  const timeEntries = [
    {
      id: 1,
      employeeId: "1",
      employeeName: "Sarah Johnson",
      date: "2024-01-15",
      project: "Website Redesign",
      startTime: "09:00",
      endTime: "17:30",
      totalHours: 8.5,
      status: "Approved",
    },
    {
      id: 2,
      employeeId: "2",
      employeeName: "Michael Chen",
      date: "2024-01-15",
      project: "Mobile App Development",
      startTime: "09:15",
      endTime: "18:00",
      totalHours: 8.75,
      status: "Pending",
    },
    {
      id: 3,
      employeeId: "1",
      employeeName: "Sarah Johnson",
      date: "2024-01-14",
      project: "Database Optimization",
      startTime: "08:30",
      endTime: "17:00",
      totalHours: 8.5,
      status: "Approved",
    },
    {
      id: 4,
      employeeId: "3",
      employeeName: "Emily Rodriguez",
      date: "2024-01-14",
      project: "Marketing Campaign",
      startTime: "10:00",
      endTime: "19:00",
      totalHours: 9.0,
      status: "Rejected",
    },
    {
      id: 5,
      employeeId: "4",
      employeeName: "James Miller",
      date: "2024-01-13",
      project: "Client Consultation",
      startTime: "09:00",
      endTime: "17:30",
      totalHours: 8.5,
      status: "Pending",
    },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Approved":
        return <Badge className="bg-green-100 text-green-800">Approved</Badge>;
      case "Pending":
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case "Rejected":
        return <Badge className="bg-red-100 text-red-800">Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const calculateTotalHours = (startTime: string, endTime: string) => {
    if (!startTime || !endTime) return 0;
    const start = new Date(`2000-01-01 ${startTime}`);
    const end = new Date(`2000-01-01 ${endTime}`);
    const diff = end.getTime() - start.getTime();
    return Math.round((diff / (1000 * 60 * 60)) * 100) / 100;
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => {
      const updated = { ...prev, [field]: value };

      // Auto-calculate total hours when start/end time changes
      if (field === "startTime" || field === "endTime") {
        const totalHours = calculateTotalHours(
          field === "startTime" ? value : updated.startTime,
          field === "endTime" ? value : updated.endTime,
        );
        // You could store totalHours in state if needed
      }

      return updated;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.employee ||
      !formData.date ||
      !formData.project ||
      !formData.startTime ||
      !formData.endTime
    ) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    try {
      // This would write to Firestore in production
      console.log("Creating time entry:", formData);

      toast({
        title: "Success",
        description: "Time entry added successfully.",
      });

      setFormData({
        employee: "",
        date: "",
        project: "",
        startTime: "",
        endTime: "",
      });
      setShowAddDialog(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add time entry. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleFilter = () => {
    // In production, this would trigger a Firestore query with the date range and employee filter
    console.log("Filtering time entries:", {
      startDate,
      endDate,
      selectedEmployee,
    });
    toast({
      title: "Filter Applied",
      description: `Filtering entries from ${startDate} to ${endDate}`,
    });
  };

  const handleExportCSV = () => {
    // In production, this would export the filtered data to CSV
    const csvData = timeEntries.map((entry) => ({
      Employee: entry.employeeName,
      Date: entry.date,
      Project: entry.project,
      "Start Time": entry.startTime,
      "End Time": entry.endTime,
      "Total Hours": entry.totalHours,
      Status: entry.status,
    }));

    console.log("Exporting CSV data:", csvData);
    toast({
      title: "Export Started",
      description: "CSV file will be downloaded shortly.",
    });
  };

  // Pagination
  const totalPages = Math.ceil(timeEntries.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedEntries = timeEntries.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <MainNavigation />

      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Time Tracking
            </h1>
            <p className="text-gray-600">
              Track and manage employee time entries
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
                  <Label htmlFor="start-date">Start Date</Label>
                  <Input
                    id="start-date"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="end-date">End Date</Label>
                  <Input
                    id="end-date"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
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
                      <SelectItem value="">All employees</SelectItem>
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

          {/* Time Entries Table */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Time Entries
                  </CardTitle>
                  <CardDescription>
                    Showing {paginatedEntries.length} of {timeEntries.length}{" "}
                    entries
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
                        Add Time Entry
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle>Add Time Entry</DialogTitle>
                        <DialogDescription>
                          Create a new time entry for an employee
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
                          <Label htmlFor="entry-date">Date *</Label>
                          <Input
                            id="entry-date"
                            type="date"
                            value={formData.date}
                            onChange={(e) =>
                              handleInputChange("date", e.target.value)
                            }
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="project">Project/Task *</Label>
                          <Input
                            id="project"
                            value={formData.project}
                            onChange={(e) =>
                              handleInputChange("project", e.target.value)
                            }
                            placeholder="Enter project or task name"
                            required
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <Label htmlFor="start-time">Start Time *</Label>
                            <Input
                              id="start-time"
                              type="time"
                              value={formData.startTime}
                              onChange={(e) =>
                                handleInputChange("startTime", e.target.value)
                              }
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="end-time">End Time *</Label>
                            <Input
                              id="end-time"
                              type="time"
                              value={formData.endTime}
                              onChange={(e) =>
                                handleInputChange("endTime", e.target.value)
                              }
                              required
                            />
                          </div>
                        </div>
                        {formData.startTime && formData.endTime && (
                          <div className="text-sm text-gray-600">
                            Total Hours:{" "}
                            {calculateTotalHours(
                              formData.startTime,
                              formData.endTime,
                            )}
                          </div>
                        )}
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
                            Add Entry
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
                    <TableHead>Date</TableHead>
                    <TableHead>Project/Task</TableHead>
                    <TableHead>Start Time</TableHead>
                    <TableHead>End Time</TableHead>
                    <TableHead>Total Hours</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedEntries.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell className="font-medium">
                        {entry.employeeName}
                      </TableCell>
                      <TableCell>{entry.date}</TableCell>
                      <TableCell>{entry.project}</TableCell>
                      <TableCell>{entry.startTime}</TableCell>
                      <TableCell>{entry.endTime}</TableCell>
                      <TableCell>{entry.totalHours}h</TableCell>
                      <TableCell>{getStatusBadge(entry.status)}</TableCell>
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
