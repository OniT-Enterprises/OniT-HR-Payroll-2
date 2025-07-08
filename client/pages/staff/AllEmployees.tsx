import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Alert } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import MainNavigation from "@/components/layout/MainNavigation";
import { employeeService, type Employee } from "@/services/employeeService";
import EmployeeProfileView from "@/components/EmployeeProfileView";
import ContactInfoPopover from "@/components/ContactInfoPopover";
import IncompleteProfilesDialog from "@/components/IncompleteProfilesDialog";
import {
  getProfileCompleteness,
  getIncompleteEmployees,
  getCompletionStatusIcon,
} from "@/lib/employeeUtils";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import {
  Users,
  Search,
  Filter,
  Download,
  Mail,
  Phone,
  Smartphone,
  Cross,
  MapPin,
  Calendar,
  Briefcase,
  DollarSign,
  Building,
  Eye,
  Edit,
  Trash2,
  Plus,
  AlertTriangle,
} from "lucide-react";

export default function AllEmployees() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(
    null,
  );
  const [showProfileView, setShowProfileView] = useState(false);
  const [showIncompleteProfiles, setShowIncompleteProfiles] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Monitor network status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setConnectionError(null);
      // Try to reload data when coming back online
      if (employees.length === 0) {
        loadEmployees();
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      setConnectionError(
        "You're currently offline. Some features may not work.",
      );
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [employees.length]);

  // Load employees from Firebase
  useEffect(() => {
    loadEmployees();
  }, []);

  // Filter employees when search term or filters change
  useEffect(() => {
    filterEmployees();
  }, [employees, searchTerm]);

  const loadEmployees = async () => {
    try {
      setLoading(true);
      setConnectionError(null);
      const employeesData = await employeeService.getAllEmployees();
      setEmployees(employeesData);
    } catch (error) {
      console.error("Error loading employees:", error);

      // Show specific error message from the service
      const errorMessage =
        error instanceof Error ? error.message : "Failed to load employees";
      setConnectionError(errorMessage);

      toast({
        title: "Connection Error",
        description: errorMessage,
        variant: "destructive",
        duration: 8000, // Show longer for network errors
      });

      // Set empty employees array to show empty state instead of loading forever
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  };

  const filterEmployees = () => {
    let filtered = employees.filter((employee) => {
      const matchesSearch =
        employee.personalInfo.firstName
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        employee.personalInfo.lastName
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        employee.personalInfo.email
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        employee.jobDetails.employeeId
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        employee.jobDetails.department
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        employee.jobDetails.position
          .toLowerCase()
          .includes(searchTerm.toLowerCase());

      return matchesSearch;
    });

    setFilteredEmployees(filtered);
    setCurrentPage(1); // Reset to first page when filtering
  };

  const handleSearch = () => {
    filterEmployees();
  };

  const handleExport = () => {
    // Create CSV content
    const headers = [
      "Employee ID",
      "First Name",
      "Last Name",
      "Email",
      "Phone",
      "Department",
      "Position",
      "Hire Date",
      "Employment Type",
      "Work Location",
      "Monthly Salary",
    ];

    const csvContent = [
      headers.join(","),
      ...filteredEmployees.map((emp) =>
        [
          emp.jobDetails.employeeId,
          emp.personalInfo.firstName,
          emp.personalInfo.lastName,
          emp.personalInfo.email,
          emp.personalInfo.phone,
          emp.jobDetails.department,
          emp.jobDetails.position,
          emp.jobDetails.hireDate,
          emp.jobDetails.employmentType,
          emp.jobDetails.workLocation,
          emp.compensation.monthlySalary ||
            Math.round((emp.compensation as any).annualSalary / 12) ||
            0,
        ].join(","),
      ),
    ].join("\n");

    // Download CSV
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `employees_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: "Export Complete",
      description: `Exported ${filteredEmployees.length} employees to CSV`,
    });
  };

  // Get unique departments for filter
  const departments = Array.from(
    new Set(employees.map((emp) => emp.jobDetails.department)),
  ).sort();

  // Pagination
  const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedEmployees = filteredEmployees.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  const formatSalary = (monthlySalary: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(monthlySalary);
  };

  const handleViewEmployee = (employee: Employee) => {
    setSelectedEmployee(employee);
    setShowProfileView(true);
  };

  const handleEditEmployee = (employee: Employee) => {
    // Navigate to edit employee page with employee ID
    navigate(`/staff/add?edit=${employee.id}`);
  };

  const handleDeleteEmployee = async (employee: Employee) => {
    // Navigate to offboarding page
    navigate(`/hiring/offboarding?employee=${employee.id}`);
  };

  const incompleteEmployees = getIncompleteEmployees(employees);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <MainNavigation />
        <div className="p-6">
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            <span className="ml-3">Loading employees...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <MainNavigation />

      <div className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <Users className="h-8 w-8 text-purple-600" />
          <div>
            <h1 className="text-3xl font-bold">All Employees</h1>
            <p className="text-muted-foreground">
              Manage and view all employee information
            </p>
          </div>
        </div>

        {/* Connection Status */}
        {(connectionError || !isOnline) && (
          <Alert className="mb-6" variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <div className="flex items-center justify-between w-full">
              <div>
                <h4 className="font-medium">Connection Issue</h4>
                <p className="text-sm">
                  {!isOnline ? "You're currently offline" : connectionError}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={loadEmployees}
                disabled={loading}
              >
                {loading ? "Retrying..." : "Retry"}
              </Button>
            </div>
          </Alert>
        )}

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Total Employees
                  </p>
                  <p className="text-2xl font-bold">{employees.length}</p>
                </div>
                <Users className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Active Employees
                  </p>
                  <p className="text-2xl font-bold">
                    {employees.filter((emp) => emp.status === "active").length}
                  </p>
                </div>
                <Building className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Departments
                  </p>
                  <p className="text-2xl font-bold">{departments.length}</p>
                </div>
                <Briefcase className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
          <Card
            className="cursor-pointer hover:bg-muted/50 transition-colors"
            onClick={() => setShowIncompleteProfiles(true)}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Incomplete Profiles
                  </p>
                  <p className="text-2xl font-bold text-orange-600">
                    {incompleteEmployees.length}
                  </p>
                </div>
                <AlertTriangle className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Controls */}
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-4 w-full lg:w-auto">
            <div className="relative flex-1 lg:w-64">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search employees..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
            </div>
            <Button onClick={handleSearch}>Search</Button>
          </div>

          <div className="flex items-center gap-3 w-full lg:w-auto">
            <Button variant="outline" onClick={handleExport}>
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>

            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Employee
            </Button>
          </div>
        </div>

        {/* Employees Table */}
        <Card>
          <CardHeader>
            <CardTitle>Employee Directory</CardTitle>
            <CardDescription>
              Complete list of all employees with details
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 font-medium">
                      <div className="flex items-center gap-1">
                        Employee
                        <Filter className="h-3 w-3 text-muted-foreground cursor-pointer hover:text-foreground" />
                      </div>
                    </th>
                    <th className="text-left p-3 font-medium">
                      <div className="flex items-center gap-1">
                        Department
                        <Filter className="h-3 w-3 text-muted-foreground cursor-pointer hover:text-foreground" />
                      </div>
                    </th>
                    <th className="text-left p-3 font-medium">
                      <div className="flex items-center gap-1">
                        Position
                        <Filter className="h-3 w-3 text-muted-foreground cursor-pointer hover:text-foreground" />
                      </div>
                    </th>
                    <th className="text-left p-3 font-medium">Contact</th>
                    <th className="text-left p-3 font-medium">
                      <div className="flex items-center gap-1">
                        Hire Date
                        <Filter className="h-3 w-3 text-muted-foreground cursor-pointer hover:text-foreground" />
                      </div>
                    </th>
                    <th className="text-left p-3 font-medium">
                      <div className="flex items-center gap-1">
                        Monthly Salary
                        <Filter className="h-3 w-3 text-muted-foreground cursor-pointer hover:text-foreground" />
                      </div>
                    </th>
                    <th className="text-center p-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedEmployees.map((employee) => (
                    <tr
                      key={employee.id}
                      className="border-b hover:bg-muted/50 transition-colors"
                    >
                      <td className="p-3">
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage
                              src="/placeholder.svg"
                              alt={employee.personalInfo.firstName}
                            />
                            <AvatarFallback>
                              {employee.personalInfo.firstName[0]}
                              {employee.personalInfo.lastName[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="font-semibold">
                              {employee.personalInfo.firstName}{" "}
                              {employee.personalInfo.lastName}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              ID: {employee.jobDetails.employeeId}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="p-3 max-w-[100px]">
                        <div className="flex items-center gap-2">
                          <Building className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          <span className="text-sm leading-tight break-words">
                            {employee.jobDetails.department
                              .split(" ")
                              .map((word, index, array) => (
                                <span key={index}>
                                  {word}
                                  {index < array.length - 1 && <br />}
                                </span>
                              ))}
                          </span>
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <Briefcase className="h-4 w-4 text-muted-foreground" />
                          <span>{employee.jobDetails.position}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <MapPin className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">
                            {employee.jobDetails.workLocation}
                          </span>
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="grid grid-cols-2 gap-1 w-fit">
                          {/* Email */}
                          <div className="flex items-center justify-center p-1">
                            <Mail
                              className="h-4 w-4 text-blue-600 cursor-pointer hover:bg-blue-50 rounded"
                              title={employee.personalInfo.email}
                            />
                          </div>

                          {/* Phone */}
                          <div className="flex items-center justify-center p-1">
                            <Phone
                              className="h-4 w-4 text-green-600 cursor-pointer hover:bg-green-50 rounded"
                              title={employee.personalInfo.phone || "No phone"}
                            />
                          </div>

                          {/* Emergency Contact */}
                          <div className="flex items-center justify-center p-1">
                            <Cross
                              className="h-4 w-4 text-red-600 cursor-pointer hover:bg-red-50 rounded"
                              title={
                                employee.personalInfo.emergencyContactName
                                  ? `Emergency: ${employee.personalInfo.emergencyContactName}`
                                  : "No emergency contact"
                              }
                            />
                          </div>

                          {/* Mobile App */}
                          <div className="flex items-center justify-center p-1">
                            <Smartphone
                              className="h-4 w-4 text-purple-600 cursor-pointer hover:bg-purple-50 rounded"
                              title={
                                (employee.personalInfo as any).phoneApp
                                  ? `App: ${(employee.personalInfo as any).phoneApp}`
                                  : "No app phone"
                              }
                            />
                          </div>
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span>{employee.jobDetails.hireDate}</span>
                        </div>
                        <Badge variant="outline" className="mt-1">
                          {employee.jobDetails.employmentType}
                        </Badge>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-muted-foreground" />
                          <span className="font-semibold">
                            {formatSalary(
                              employee.compensation.monthlySalary ||
                                Math.round(
                                  (employee.compensation as any).annualSalary /
                                    12,
                                ) ||
                                0,
                            )}
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {employee.compensation.benefitsPackage} Benefits
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center justify-center gap-2">
                          {(() => {
                            const completeness =
                              getProfileCompleteness(employee);
                            const isComplete =
                              getCompletionStatusIcon(
                                completeness.completionPercentage,
                              ) === "complete";
                            return (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleViewEmployee(employee)}
                                className={
                                  isComplete
                                    ? "text-green-600 hover:text-green-700"
                                    : "text-red-600 hover:text-red-700"
                                }
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            );
                          })()}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditEmployee(employee)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-700"
                            onClick={() => handleDeleteEmployee(employee)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Empty State */}
              {paginatedEmployees.length === 0 && !loading && (
                <div className="text-center py-12">
                  {connectionError ? (
                    <>
                      <AlertTriangle className="h-16 w-16 mx-auto mb-4 text-red-400" />
                      <h3 className="text-lg font-semibold mb-2">
                        Connection Problem
                      </h3>
                      <p className="text-muted-foreground mb-4">
                        Unable to load employee data. Please check your
                        connection.
                      </p>
                      <Button onClick={loadEmployees} disabled={loading}>
                        <Users className="mr-2 h-4 w-4" />
                        Retry Loading
                      </Button>
                    </>
                  ) : (
                    <>
                      <Users className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                      <h3 className="text-lg font-semibold mb-2">
                        No Employees Found
                      </h3>
                      <p className="text-muted-foreground mb-4">
                        {searchTerm || departmentFilter !== "all"
                          ? "No employees match your current filters."
                          : "Start by adding your first employee to the system."}
                      </p>
                      <Button onClick={() => navigate("/staff/add")}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add First Employee
                      </Button>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-muted-foreground">
                  Showing {startIndex + 1} to{" "}
                  {Math.min(
                    startIndex + itemsPerPage,
                    filteredEmployees.length,
                  )}{" "}
                  of {filteredEmployees.length} employees
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(1, prev - 1))
                    }
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  <span className="text-sm">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                    }
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Employee Profile View Dialog */}
        <EmployeeProfileView
          employee={selectedEmployee}
          open={showProfileView}
          onOpenChange={setShowProfileView}
        />

        {/* Incomplete Profiles Dialog */}
        <IncompleteProfilesDialog
          employees={employees}
          open={showIncompleteProfiles}
          onOpenChange={setShowIncompleteProfiles}
          onEditEmployee={handleEditEmployee}
        />
      </div>
    </div>
  );
}
