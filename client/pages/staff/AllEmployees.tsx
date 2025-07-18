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

  // Filter states
  const [departmentFilter, setDepartmentFilter] = useState<string>("all");
  const [positionFilter, setPositionFilter] = useState<string>("all");
  const [employmentTypeFilter, setEmploymentTypeFilter] =
    useState<string>("all");
  const [workLocationFilter, setWorkLocationFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [minSalary, setMinSalary] = useState<string>("");
  const [maxSalary, setMaxSalary] = useState<string>("");
  const [showFilters, setShowFilters] = useState(false);
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
  }, [
    employees,
    searchTerm,
    departmentFilter,
    positionFilter,
    employmentTypeFilter,
    workLocationFilter,
    statusFilter,
    minSalary,
    maxSalary,
  ]);

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
      // Search filter
      const matchesSearch =
        !searchTerm ||
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

      // Department filter
      const matchesDepartment =
        !departmentFilter ||
        departmentFilter === "all" ||
        employee.jobDetails.department === departmentFilter;

      // Position filter
      const matchesPosition =
        !positionFilter ||
        positionFilter === "all" ||
        employee.jobDetails.position === positionFilter;

      // Employment type filter
      const matchesEmploymentType =
        !employmentTypeFilter ||
        employmentTypeFilter === "all" ||
        employee.jobDetails.employmentType === employmentTypeFilter;

      // Work location filter
      const matchesWorkLocation =
        !workLocationFilter ||
        workLocationFilter === "all" ||
        employee.jobDetails.workLocation === workLocationFilter;

      // Status filter
      const matchesStatus =
        !statusFilter ||
        statusFilter === "all" ||
        employee.status === statusFilter;

      // Salary range filter
      const salary =
        employee.compensation.monthlySalary ||
        Math.round((employee.compensation as any).annualSalary / 12) ||
        0;
      const matchesMinSalary = !minSalary || salary >= parseInt(minSalary);
      const matchesMaxSalary = !maxSalary || salary <= parseInt(maxSalary);

      return (
        matchesSearch &&
        matchesDepartment &&
        matchesPosition &&
        matchesEmploymentType &&
        matchesWorkLocation &&
        matchesStatus &&
        matchesMinSalary &&
        matchesMaxSalary
      );
    });

    setFilteredEmployees(filtered);
    setCurrentPage(1); // Reset to first page when filtering
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm("");
    setDepartmentFilter("all");
    setPositionFilter("all");
    setEmploymentTypeFilter("all");
    setWorkLocationFilter("all");
    setStatusFilter("all");
    setMinSalary("");
    setMaxSalary("");
  };

  // Get unique values for filter options
  const getUniqueValues = (field: keyof Employee | string) => {
    const values = new Set<string>();
    employees.forEach((employee) => {
      let value: string;
      switch (field) {
        case "department":
          value = employee.jobDetails.department;
          break;
        case "position":
          value = employee.jobDetails.position;
          break;
        case "employmentType":
          value = employee.jobDetails.employmentType;
          break;
        case "workLocation":
          value = employee.jobDetails.workLocation;
          break;
        case "status":
          value = employee.status;
          break;
        default:
          return;
      }
      if (value) values.add(value);
    });
    return Array.from(values).sort();
  };

  // Check if any filters are active
  const hasActiveFilters =
    (departmentFilter && departmentFilter !== "all") ||
    (positionFilter && positionFilter !== "all") ||
    (employmentTypeFilter && employmentTypeFilter !== "all") ||
    (workLocationFilter && workLocationFilter !== "all") ||
    (statusFilter && statusFilter !== "all") ||
    minSalary ||
    maxSalary;

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
                  <p className="text-2xl font-bold">
                    {
                      new Set(employees.map((emp) => emp.jobDetails.department))
                        .size
                    }
                  </p>
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
            <Button
              variant={showFilters ? "default" : "outline"}
              onClick={() => setShowFilters(!showFilters)}
              className={hasActiveFilters ? "bg-blue-100 border-blue-300" : ""}
            >
              <Filter className="mr-2 h-4 w-4" />
              Filters{" "}
              {hasActiveFilters &&
                `(${
                  Object.values({
                    departmentFilter:
                      departmentFilter !== "all" ? departmentFilter : null,
                    positionFilter:
                      positionFilter !== "all" ? positionFilter : null,
                    employmentTypeFilter:
                      employmentTypeFilter !== "all"
                        ? employmentTypeFilter
                        : null,
                    workLocationFilter:
                      workLocationFilter !== "all" ? workLocationFilter : null,
                    statusFilter: statusFilter !== "all" ? statusFilter : null,
                    minSalary,
                    maxSalary,
                  }).filter(Boolean).length
                })`}
            </Button>
          </div>

          <div className="flex items-center gap-3 w-full lg:w-auto">
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                Clear Filters
              </Button>
            )}
            <Button variant="outline" onClick={handleExport}>
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>

            <Button onClick={() => navigate("/staff/add")}>
              <Plus className="mr-2 h-4 w-4" />
              Add Employee
            </Button>
          </div>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">Filter Employees</CardTitle>
              <CardDescription>
                Use filters to narrow down the employee list
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Department Filter */}
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Department
                  </label>
                  <Select
                    value={departmentFilter}
                    onValueChange={setDepartmentFilter}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All departments" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All departments</SelectItem>
                      {getUniqueValues("department").map((dept) => (
                        <SelectItem key={dept} value={dept}>
                          {dept}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Position Filter */}
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Position
                  </label>
                  <Select
                    value={positionFilter}
                    onValueChange={setPositionFilter}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All positions" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All positions</SelectItem>
                      {getUniqueValues("position").map((position) => (
                        <SelectItem key={position} value={position}>
                          {position}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Employment Type Filter */}
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Employment Type
                  </label>
                  <Select
                    value={employmentTypeFilter}
                    onValueChange={setEmploymentTypeFilter}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All types</SelectItem>
                      {getUniqueValues("employmentType").map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Work Location Filter */}
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Work Location
                  </label>
                  <Select
                    value={workLocationFilter}
                    onValueChange={setWorkLocationFilter}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All locations" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All locations</SelectItem>
                      {getUniqueValues("workLocation").map((location) => (
                        <SelectItem key={location} value={location}>
                          {location}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Status Filter */}
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Status
                  </label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All statuses</SelectItem>
                      {getUniqueValues("status").map((status) => (
                        <SelectItem key={status} value={status}>
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Salary Range */}
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Min Salary
                  </label>
                  <Input
                    type="number"
                    placeholder="Min monthly salary"
                    value={minSalary}
                    onChange={(e) => setMinSalary(e.target.value)}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Max Salary
                  </label>
                  <Input
                    type="number"
                    placeholder="Max monthly salary"
                    value={maxSalary}
                    onChange={(e) => setMaxSalary(e.target.value)}
                  />
                </div>

                {/* Clear Filters Button */}
                <div className="flex items-end">
                  <Button
                    variant="outline"
                    onClick={clearFilters}
                    disabled={!hasActiveFilters}
                    className="w-full"
                  >
                    Clear All Filters
                  </Button>
                </div>
              </div>

              {/* Filter Summary */}
              {hasActiveFilters && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Active Filters:</strong> {filteredEmployees.length}{" "}
                    of {employees.length} employees shown
                  </p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {departmentFilter && departmentFilter !== "all" && (
                      <Badge variant="secondary" className="text-xs">
                        Department: {departmentFilter}
                      </Badge>
                    )}
                    {positionFilter && positionFilter !== "all" && (
                      <Badge variant="secondary" className="text-xs">
                        Position: {positionFilter}
                      </Badge>
                    )}
                    {employmentTypeFilter && employmentTypeFilter !== "all" && (
                      <Badge variant="secondary" className="text-xs">
                        Type: {employmentTypeFilter}
                      </Badge>
                    )}
                    {workLocationFilter && workLocationFilter !== "all" && (
                      <Badge variant="secondary" className="text-xs">
                        Location: {workLocationFilter}
                      </Badge>
                    )}
                    {statusFilter && statusFilter !== "all" && (
                      <Badge variant="secondary" className="text-xs">
                        Status: {statusFilter}
                      </Badge>
                    )}
                    {(minSalary || maxSalary) && (
                      <Badge variant="secondary" className="text-xs">
                        Salary: {minSalary ? `$${minSalary}+` : ""}
                        {minSalary && maxSalary ? " - " : ""}
                        {maxSalary ? `$${maxSalary}` : ""}
                      </Badge>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

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
                        <Filter
                          className="h-3 w-3 text-muted-foreground cursor-pointer hover:text-foreground"
                          onClick={() => setShowFilters(!showFilters)}
                        />
                      </div>
                    </th>
                    <th className="text-left p-3 font-medium">
                      <div className="flex items-center gap-1">
                        Department
                        <Filter
                          className={`h-3 w-3 cursor-pointer hover:text-foreground ${
                            departmentFilter
                              ? "text-blue-600"
                              : "text-muted-foreground"
                          }`}
                          onClick={() => setShowFilters(!showFilters)}
                        />
                      </div>
                    </th>
                    <th className="text-left p-3 font-medium">
                      <div className="flex items-center gap-1">
                        Position
                        <Filter
                          className={`h-3 w-3 cursor-pointer hover:text-foreground ${
                            positionFilter
                              ? "text-blue-600"
                              : "text-muted-foreground"
                          }`}
                          onClick={() => setShowFilters(!showFilters)}
                        />
                      </div>
                    </th>
                    <th className="text-left p-3 font-medium">Contact</th>
                    <th className="text-left p-3 font-medium">
                      <div className="flex items-center gap-1">
                        Hire Date
                        <Filter
                          className="h-3 w-3 text-muted-foreground cursor-pointer hover:text-foreground"
                          onClick={() => setShowFilters(!showFilters)}
                        />
                      </div>
                    </th>
                    <th className="text-left p-3 font-medium">
                      <div className="flex items-center gap-1">
                        MonthlySalary
                        <Filter
                          className={`h-3 w-3 cursor-pointer hover:text-foreground ${
                            minSalary || maxSalary
                              ? "text-blue-600"
                              : "text-muted-foreground"
                          }`}
                          onClick={() => setShowFilters(!showFilters)}
                        />
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
                            <div title={employee.personalInfo.email}>
                              <Mail className="h-4 w-4 text-blue-600 cursor-pointer hover:bg-blue-50 rounded" />
                            </div>
                          </div>

                          {/* Phone */}
                          <div className="flex items-center justify-center p-1">
                            <div
                              title={employee.personalInfo.phone || "No phone"}
                            >
                              <Phone className="h-4 w-4 text-green-600 cursor-pointer hover:bg-green-50 rounded" />
                            </div>
                          </div>

                          {/* Emergency Contact */}
                          <div className="flex items-center justify-center p-1">
                            <div
                              title={
                                employee.personalInfo.emergencyContactName
                                  ? `Emergency: ${employee.personalInfo.emergencyContactName}`
                                  : "No emergency contact"
                              }
                            >
                              <Cross className="h-4 w-4 text-red-600 cursor-pointer hover:bg-red-50 rounded" />
                            </div>
                          </div>

                          {/* Mobile App */}
                          <div className="flex items-center justify-center p-1">
                            <div
                              title={
                                (employee.personalInfo as any).phoneApp
                                  ? `App: ${(employee.personalInfo as any).phoneApp}`
                                  : "No app phone"
                              }
                            >
                              <Smartphone className="h-4 w-4 text-purple-600 cursor-pointer hover:bg-purple-50 rounded" />
                            </div>
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
                        <div>
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
                          <div className="text-xs text-muted-foreground mt-1">
                            {employee.compensation.benefitsPackage} Benefits
                          </div>
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
                        {searchTerm
                          ? "No employees match your search."
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
