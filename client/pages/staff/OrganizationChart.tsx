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
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import MainNavigation from "@/components/layout/MainNavigation";
import { employeeService, type Employee } from "@/services/employeeService";
import {
  departmentService,
  type Department,
} from "@/services/departmentService";
import DepartmentManager from "@/components/DepartmentManager";
import { useToast } from "@/hooks/use-toast";
import {
  Building,
  ChevronDown,
  ChevronRight,
  Users,
  Crown,
  User,
  Grip,
  Database,
  AlertCircle,
  Plus,
  Edit,
} from "lucide-react";

export default function OrganizationChart() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedDepts, setExpandedDepts] = useState<string[]>([]);
  const [showDepartmentManager, setShowDepartmentManager] = useState(false);
  const [managerMode, setManagerMode] = useState<"add" | "edit">("edit");
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [employeesData, departmentsData] = await Promise.all([
        employeeService.getAllEmployees(),
        departmentService.getAllDepartments(),
      ]);
      setEmployees(employeesData);
      setDepartments(departmentsData);

      // Auto-migrate departments that exist in employee records but not in departments collection
      await migrateMissingDepartments(employeesData, departmentsData);

      // Auto-expand all managed departments
      setExpandedDepts(departmentsData.map((dept) => dept.name));
    } catch (error) {
      console.error("Error loading data:", error);
      toast({
        title: "Error",
        description: "Failed to load data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const migrateMissingDepartments = async (
    employees: Employee[],
    existingDepartments: Department[],
  ) => {
    try {
      // Get unique department names from employees
      const employeeDepartments = [
        ...new Set(employees.map((emp) => emp.jobDetails.department)),
      ];

      // Get existing department names
      const existingDeptNames = existingDepartments.map((dept) => dept.name);

      // Find departments that exist in employee records but not in departments collection
      const missingDepartments = employeeDepartments.filter(
        (deptName) => deptName && !existingDeptNames.includes(deptName),
      );

      // Create missing departments
      for (const deptName of missingDepartments) {
        await departmentService.addDepartment({
          name: deptName,
          description: `Auto-migrated department from existing employee records`,
        });
      }

      // If we created any departments, reload the data
      if (missingDepartments.length > 0) {
        const updatedDepartments = await departmentService.getAllDepartments();
        setDepartments(updatedDepartments);
        setExpandedDepts(updatedDepartments.map((dept) => dept.name));
      }
    } catch (error) {
      console.error("Error migrating departments:", error);
    }
  };

  // Group employees by managed departments only
  const departmentGroups = departments.reduce(
    (acc, department) => {
      const deptEmployees = employees.filter(
        (emp) => emp.jobDetails.department === department.name,
      );
      acc[department.name] = deptEmployees;
      return acc;
    },
    {} as Record<string, Employee[]>,
  );

  const toggleDepartment = (deptName: string) => {
    setExpandedDepts((prev) =>
      prev.includes(deptName)
        ? prev.filter((d) => d !== deptName)
        : [...prev, deptName],
    );
  };

  const getDepartmentColor = (index: number) => {
    const colors = [
      "bg-blue-100 border-blue-300 text-blue-800",
      "bg-green-100 border-green-300 text-green-800",
      "bg-purple-100 border-purple-300 text-purple-800",
      "bg-orange-100 border-orange-300 text-orange-800",
      "bg-pink-100 border-pink-300 text-pink-800",
      "bg-indigo-100 border-indigo-300 text-indigo-800",
      "bg-yellow-100 border-yellow-300 text-yellow-800",
      "bg-red-100 border-red-300 text-red-800",
    ];
    return colors[index % colors.length];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <MainNavigation />
        <div className="p-6">
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            <span className="ml-3">Loading organization chart...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <MainNavigation />

      <div className="p-6">
        {/* Department Management Buttons */}
        <div className="flex justify-end gap-2 mb-4">
          <Button
            variant="outline"
            onClick={() => {
              setManagerMode("add");
              setShowDepartmentManager(true);
            }}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Department
          </Button>
          <Button
            onClick={() => {
              setManagerMode("edit");
              setShowDepartmentManager(true);
            }}
          >
            <Edit className="mr-2 h-4 w-4" />
            Edit Departments
          </Button>
        </div>

        <div className="flex items-center gap-3 mb-6">
          <Building className="h-8 w-8 text-purple-600" />
          <div>
            <h1 className="text-3xl font-bold">Organization Chart</h1>
            <p className="text-muted-foreground">
              Visual representation of company structure and departments
            </p>
          </div>
        </div>

        {employees.length === 0 ? (
          /* Empty State */
          <div className="text-center py-16">
            <Database className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-semibold mb-2">No Organization Data</h3>
            <p className="text-muted-foreground mb-6">
              Add employees to your database to see the organization chart
            </p>
            <Button onClick={() => (window.location.href = "/staff/add")}>
              <User className="mr-2 h-4 w-4" />
              Add First Employee
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
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
                        Departments
                      </p>
                      <p className="text-2xl font-bold">
                        {Object.keys(departmentGroups).length}
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
                        Active Employees
                      </p>
                      <p className="text-2xl font-bold">
                        {
                          employees.filter((emp) => emp.status === "active")
                            .length
                        }
                      </p>
                    </div>
                    <User className="h-8 w-8 text-purple-500" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Largest Department
                      </p>
                      <p className="text-2xl font-bold">
                        {Math.max(
                          ...Object.values(departmentGroups).map(
                            (arr) => arr.length,
                          ),
                        )}
                      </p>
                    </div>
                    <Crown className="h-8 w-8 text-orange-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Organization Chart */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Department Structure</CardTitle>
                  <CardDescription>
                    Employees organized by department ({employees.length} total)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.entries(departmentGroups)
                      .sort(([, a], [, b]) => b.length - a.length)
                      .map(([departmentName, deptEmployees], index) => (
                        <Collapsible
                          key={departmentName}
                          open={expandedDepts.includes(departmentName)}
                          onOpenChange={() => toggleDepartment(departmentName)}
                        >
                          <Card
                            className={`border-2 ${getDepartmentColor(index)}`}
                          >
                            <CollapsibleTrigger asChild>
                              <CardHeader className="cursor-pointer hover:bg-opacity-80 transition-colors">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    <Building className="h-5 w-5" />
                                    <div>
                                      <CardTitle className="text-lg">
                                        {departmentName}
                                      </CardTitle>
                                      <CardDescription>
                                        {deptEmployees.length} employee
                                        {deptEmployees.length !== 1 ? "s" : ""}
                                      </CardDescription>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Badge variant="secondary">
                                      {deptEmployees.length}
                                    </Badge>
                                    {expandedDepts.includes(departmentName) ? (
                                      <ChevronDown className="h-4 w-4" />
                                    ) : (
                                      <ChevronRight className="h-4 w-4" />
                                    )}
                                  </div>
                                </div>
                              </CardHeader>
                            </CollapsibleTrigger>
                            <CollapsibleContent>
                              <CardContent className="pt-0">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                  {deptEmployees.map((employee) => (
                                    <Card
                                      key={employee.id}
                                      className="border border-gray-200"
                                    >
                                      <CardContent className="p-4">
                                        <div className="flex items-center gap-3">
                                          <Avatar>
                                            <AvatarImage
                                              src="/placeholder.svg"
                                              alt={
                                                employee.personalInfo.firstName
                                              }
                                            />
                                            <AvatarFallback>
                                              {
                                                employee.personalInfo
                                                  .firstName[0]
                                              }
                                              {
                                                employee.personalInfo
                                                  .lastName[0]
                                              }
                                            </AvatarFallback>
                                          </Avatar>
                                          <div className="flex-1 min-w-0">
                                            <h4 className="font-semibold text-sm truncate">
                                              {employee.personalInfo.firstName}{" "}
                                              {employee.personalInfo.lastName}
                                            </h4>
                                            <p className="text-xs text-muted-foreground truncate">
                                              {employee.jobDetails.position}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                              ID:{" "}
                                              {employee.jobDetails.employeeId}
                                            </p>
                                            <div className="flex items-center gap-1 mt-1">
                                              <Badge
                                                variant={
                                                  employee.status === "active"
                                                    ? "default"
                                                    : "secondary"
                                                }
                                                className="text-xs"
                                              >
                                                {employee.status}
                                              </Badge>
                                              <Badge
                                                variant="outline"
                                                className="text-xs"
                                              >
                                                {
                                                  employee.jobDetails
                                                    .workLocation
                                                }
                                              </Badge>
                                            </div>
                                          </div>
                                        </div>
                                      </CardContent>
                                    </Card>
                                  ))}
                                </div>
                              </CardContent>
                            </CollapsibleContent>
                          </Card>
                        </Collapsible>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Department Manager Dialog */}
        <DepartmentManager
          open={showDepartmentManager}
          onOpenChange={setShowDepartmentManager}
          mode={managerMode}
          onDepartmentChange={loadData}
        />
      </div>
    </div>
  );
}
