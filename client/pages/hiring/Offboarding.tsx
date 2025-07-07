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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import MainNavigation from "@/components/layout/MainNavigation";
import { employeeService, type Employee } from "@/services/employeeService";
import { useToast } from "@/hooks/use-toast";
import {
  UserMinus,
  Calendar,
  FileText,
  Mail,
  Key,
  CreditCard,
  Building,
  CheckCircle,
  AlertTriangle,
  Clock,
  DollarSign,
  Shield,
  Archive,
  Download,
  Filter,
  Database,
  Users,
  User,
  Search,
} from "lucide-react";

export default function Offboarding() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEmployee, setSelectedEmployee] = useState<string>("");
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [offboardingType, setOffboardingType] = useState<string>("");
  const [showDialog, setShowDialog] = useState(false);
  const { toast } = useToast();

  const [checklist, setChecklist] = useState({
    accessRevoked: false,
    equipmentReturned: false,
    documentsSigned: false,
    knowledgeTransfer: false,
    finalPayCalculated: false,
    benefitsCancelled: false,
    exitInterview: false,
    referenceLetter: false,
  });

  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    try {
      setLoading(true);
      const employeesData = await employeeService.getAllEmployees();
      setEmployees(employeesData);
    } catch (error) {
      console.error("Error loading employees:", error);
      toast({
        title: "Error",
        description: "Failed to load employee data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Filter employees based on department and search
  const filteredEmployees = employees.filter((employee) => {
    const matchesDepartment =
      selectedDepartment === "all" ||
      employee.jobDetails.department === selectedDepartment;

    const matchesSearch =
      searchTerm === "" ||
      employee.personalInfo.firstName
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      employee.personalInfo.lastName
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      employee.jobDetails.employeeId
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      employee.jobDetails.position
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

    // Only show active employees for offboarding
    return employee.status === "active" && matchesDepartment && matchesSearch;
  });

  // Get unique departments for filter
  const departments = Array.from(
    new Set(employees.map((emp) => emp.jobDetails.department)),
  ).sort();

  const activeEmployees = employees.filter((emp) => emp.status === "active");

  const handleChecklistUpdate = (item: string) => {
    setChecklist((prev) => ({
      ...prev,
      [item]: !prev[item],
    }));
  };

  const handleStartOffboarding = () => {
    if (!selectedEmployee) {
      toast({
        title: "Validation Error",
        description: "Please select an employee to start offboarding",
        variant: "destructive",
      });
      return;
    }

    // Here you would normally save the offboarding case to Firebase
    toast({
      title: "Offboarding Started",
      description: "Employee offboarding process has been initiated",
    });

    setShowDialog(false);
    setSelectedEmployee("");
    setOffboardingType("");
    setSelectedDepartment("all");
    setSearchTerm("");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <MainNavigation />
        <div className="p-6">
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
            <span className="ml-3">Loading offboarding data...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <MainNavigation />

      <div className="p-6">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <UserMinus className="h-8 w-8 text-green-400" />
            <div>
              <h1 className="text-3xl font-bold">Employee Offboarding</h1>
              <p className="text-muted-foreground">
                Manage employee departures and exit processes
              </p>
            </div>
          </div>

          {activeEmployees.length > 0 ? (
            <Dialog open={showDialog} onOpenChange={setShowDialog}>
              <DialogTrigger asChild>
                <Button>
                  <UserMinus className="mr-2 h-4 w-4" />
                  Start Offboarding Process
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Initiate Employee Offboarding</DialogTitle>
                  <DialogDescription>
                    Start the offboarding process for a departing employee
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  {/* Department Filter */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="department">Filter by Department</Label>
                      <Select
                        value={selectedDepartment}
                        onValueChange={setSelectedDepartment}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="All departments" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Departments</SelectItem>
                          {departments.map((dept) => (
                            <SelectItem key={dept} value={dept}>
                              {dept}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="search">Search Employee</Label>
                      <div className="relative">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="search"
                          placeholder="Name or ID..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Employee Selection */}
                  <div className="space-y-2">
                    <Label htmlFor="employee">
                      Select Employee ({filteredEmployees.length} available)
                    </Label>
                    <Select
                      value={selectedEmployee}
                      onValueChange={setSelectedEmployee}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Choose an employee..." />
                      </SelectTrigger>
                      <SelectContent>
                        {filteredEmployees.length === 0 ? (
                          <div className="p-4 text-center text-gray-500">
                            {searchTerm || selectedDepartment !== "all"
                              ? "No employees match your filters"
                              : "No active employees available"}
                          </div>
                        ) : (
                          filteredEmployees.map((employee) => (
                            <SelectItem
                              key={employee.id}
                              value={employee.id || ""}
                            >
                              <div className="flex items-center gap-2">
                                <span>
                                  {employee.personalInfo.firstName}{" "}
                                  {employee.personalInfo.lastName}
                                </span>
                                <span className="text-sm text-gray-500">
                                  - {employee.jobDetails.department}
                                </span>
                                <Badge variant="outline" className="text-xs">
                                  {employee.jobDetails.employeeId}
                                </Badge>
                              </div>
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Selected Employee Details */}
                  {selectedEmployee && (
                    <div className="p-4 bg-blue-50 rounded-lg">
                      {(() => {
                        const employee = employees.find(
                          (emp) => emp.id === selectedEmployee,
                        );
                        if (!employee) return null;
                        return (
                          <div className="space-y-2">
                            <h4 className="font-medium">
                              Selected Employee Details:
                            </h4>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="text-gray-600">Name:</span>
                                <p className="font-medium">
                                  {employee.personalInfo.firstName}{" "}
                                  {employee.personalInfo.lastName}
                                </p>
                              </div>
                              <div>
                                <span className="text-gray-600">Position:</span>
                                <p className="font-medium">
                                  {employee.jobDetails.position}
                                </p>
                              </div>
                              <div>
                                <span className="text-gray-600">
                                  Department:
                                </span>
                                <p className="font-medium">
                                  {employee.jobDetails.department}
                                </p>
                              </div>
                              <div>
                                <span className="text-gray-600">
                                  Employee ID:
                                </span>
                                <p className="font-medium">
                                  {employee.jobDetails.employeeId}
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="reason">Departure Reason</Label>
                    <Select
                      value={offboardingType}
                      onValueChange={setOffboardingType}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select reason..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="resignation">Resignation</SelectItem>
                        <SelectItem value="redundancy">Redundancy</SelectItem>
                        <SelectItem value="termination">Termination</SelectItem>
                        <SelectItem value="retirement">Retirement</SelectItem>
                        <SelectItem value="contract-end">
                          Contract End
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="lastDay">Last Working Day</Label>
                      <Input id="lastDay" type="date" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="noticeDate">Notice Date</Label>
                      <Input id="noticeDate" type="date" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="notes">Additional Notes</Label>
                    <Textarea
                      id="notes"
                      placeholder="Any special instructions or notes..."
                    />
                  </div>
                  <div className="flex justify-end gap-3">
                    <Button
                      variant="outline"
                      onClick={() => setShowDialog(false)}
                    >
                      Cancel
                    </Button>
                    <Button onClick={handleStartOffboarding}>
                      Start Offboarding
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          ) : (
            <Button disabled>
              <UserMinus className="mr-2 h-4 w-4" />
              No Active Employees
            </Button>
          )}
        </div>

        {employees.length === 0 ? (
          /* Empty State */
          <div className="text-center py-16">
            <UserMinus className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-semibold mb-2">No Employee Data</h3>
            <p className="text-muted-foreground mb-6">
              Add employees to your database to manage offboarding processes
            </p>
            <Button onClick={() => (window.location.href = "/staff/add")}>
              <User className="mr-2 h-4 w-4" />
              Add Employees First
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Statistics */}
            <div className="grid lg:grid-cols-4 gap-4 mb-8">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Total Employees
                      </p>
                      <p className="text-2xl font-bold">{employees.length}</p>
                      <p className="text-xs text-blue-600">In database</p>
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
                        {activeEmployees.length}
                      </p>
                      <p className="text-xs text-green-600">
                        Available to offboard
                      </p>
                    </div>
                    <CheckCircle className="h-8 w-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Offboarding Cases
                      </p>
                      <p className="text-2xl font-bold">0</p>
                      <p className="text-xs text-gray-600">No active cases</p>
                    </div>
                    <Clock className="h-8 w-8 text-orange-500" />
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
                      <p className="text-xs text-purple-600">With employees</p>
                    </div>
                    <Building className="h-8 w-8 text-purple-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
              {/* Available Employees */}
              <Card>
                <CardHeader>
                  <CardTitle>Active Employees by Department</CardTitle>
                  <CardDescription>
                    {activeEmployees.length} employees available for offboarding
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {activeEmployees.length === 0 ? (
                    <div className="text-center py-8">
                      <Database className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p className="text-sm text-gray-600">
                        No active employees
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {departments.map((dept) => {
                        const deptEmployees = activeEmployees.filter(
                          (emp) => emp.jobDetails.department === dept,
                        );
                        if (deptEmployees.length === 0) return null;

                        return (
                          <div key={dept} className="border rounded-lg p-4">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-2">
                                <Building className="h-4 w-4" />
                                <span className="font-medium">{dept}</span>
                              </div>
                              <Badge variant="secondary">
                                {deptEmployees.length} employees
                              </Badge>
                            </div>
                            <div className="grid grid-cols-1 gap-2">
                              {deptEmployees.slice(0, 3).map((employee) => (
                                <div
                                  key={employee.id}
                                  className="flex items-center gap-3 p-2 bg-gray-50 rounded"
                                >
                                  <Avatar className="w-8 h-8">
                                    <AvatarImage src="/placeholder.svg" />
                                    <AvatarFallback className="text-xs">
                                      {employee.personalInfo.firstName[0]}
                                      {employee.personalInfo.lastName[0]}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium truncate">
                                      {employee.personalInfo.firstName}{" "}
                                      {employee.personalInfo.lastName}
                                    </p>
                                    <p className="text-xs text-gray-500 truncate">
                                      {employee.jobDetails.position}
                                    </p>
                                  </div>
                                  <Badge variant="outline" className="text-xs">
                                    {employee.jobDetails.employeeId}
                                  </Badge>
                                </div>
                              ))}
                              {deptEmployees.length > 3 && (
                                <div className="text-center py-2">
                                  <span className="text-xs text-gray-500">
                                    +{deptEmployees.length - 3} more employees
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Offboarding Checklist */}
              <Card>
                <CardHeader>
                  <CardTitle>Offboarding Checklist</CardTitle>
                  <CardDescription>
                    Standard items to complete for employee departures
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      {
                        id: "accessRevoked",
                        label: "Revoke System Access",
                        icon: <Key className="h-4 w-4" />,
                      },
                      {
                        id: "equipmentReturned",
                        label: "Equipment Return",
                        icon: <Building className="h-4 w-4" />,
                      },
                      {
                        id: "documentsSigned",
                        label: "Exit Documents Signed",
                        icon: <FileText className="h-4 w-4" />,
                      },
                      {
                        id: "knowledgeTransfer",
                        label: "Knowledge Transfer",
                        icon: <Archive className="h-4 w-4" />,
                      },
                      {
                        id: "finalPayCalculated",
                        label: "Final Pay Calculated",
                        icon: <DollarSign className="h-4 w-4" />,
                      },
                      {
                        id: "benefitsCancelled",
                        label: "Benefits Cancelled",
                        icon: <CreditCard className="h-4 w-4" />,
                      },
                      {
                        id: "exitInterview",
                        label: "Exit Interview Completed",
                        icon: <Mail className="h-4 w-4" />,
                      },
                      {
                        id: "referenceLetter",
                        label: "Reference Letter Prepared",
                        icon: <Download className="h-4 w-4" />,
                      },
                    ].map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center space-x-3"
                      >
                        <Checkbox
                          id={item.id}
                          checked={checklist[item.id]}
                          onCheckedChange={() => handleChecklistUpdate(item.id)}
                        />
                        <div className="flex items-center gap-2">
                          {item.icon}
                          <label
                            htmlFor={item.id}
                            className="text-sm font-medium"
                          >
                            {item.label}
                          </label>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-6">
                    <Button className="w-full">Save Checklist Progress</Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Exit Interview Form */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Exit Interview Questions
                </CardTitle>
                <CardDescription>
                  Standard questions for departing employees
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="satisfaction">
                        Overall Job Satisfaction
                      </Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Rate satisfaction..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="very-satisfied">
                            Very Satisfied
                          </SelectItem>
                          <SelectItem value="satisfied">Satisfied</SelectItem>
                          <SelectItem value="neutral">Neutral</SelectItem>
                          <SelectItem value="dissatisfied">
                            Dissatisfied
                          </SelectItem>
                          <SelectItem value="very-dissatisfied">
                            Very Dissatisfied
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="reason">Primary Reason for Leaving</Label>
                      <Textarea
                        id="reason"
                        placeholder="Please explain your primary reason for leaving..."
                        rows={3}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="improvements">
                        Suggestions for Improvement
                      </Label>
                      <Textarea
                        id="improvements"
                        placeholder="What could the company do better?"
                        rows={3}
                      />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="manager">Manager Relationship</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Rate manager relationship..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="excellent">Excellent</SelectItem>
                          <SelectItem value="good">Good</SelectItem>
                          <SelectItem value="average">Average</SelectItem>
                          <SelectItem value="poor">Poor</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="recommend">Would Recommend Company</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Would you recommend us?" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="yes">Yes, definitely</SelectItem>
                          <SelectItem value="maybe">Maybe</SelectItem>
                          <SelectItem value="no">No</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="additional">Additional Comments</Label>
                      <Textarea
                        id="additional"
                        placeholder="Any other feedback or comments..."
                        rows={3}
                      />
                    </div>
                  </div>
                </div>
                <div className="flex justify-end gap-3 mt-6">
                  <Button variant="outline">Save Draft</Button>
                  <Button>Complete Exit Interview</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
