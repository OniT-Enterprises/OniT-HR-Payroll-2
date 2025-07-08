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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  Users,
  Database,
  AlertCircle,
  User,
  Plus,
  Edit,
  DollarSign,
  Crown,
  Eye,
} from "lucide-react";

export default function Departments() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDepartmentManager, setShowDepartmentManager] = useState(false);
  const [managerMode, setManagerMode] = useState<"add" | "edit">("edit");
  const [selectedDepartment, setSelectedDepartment] = useState<any>(null);
  const [showDepartmentEmployees, setShowDepartmentEmployees] = useState(false);
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
      // Only run migration on initial load, not during updates
      if (existingDepartments.length > 0) {
        return; // Skip migration if departments already exist
      }

      // Get unique department names from employees
      const employeeDepartments = [
        ...new Set(employees.map((emp) => emp.jobDetails.department)),
      ];

      // Filter out empty department names
      const validDepartments = employeeDepartments.filter(
        (deptName) => deptName && deptName.trim(),
      );

      // Create missing departments only if we have employees but no departments
      if (validDepartments.length > 0 && existingDepartments.length === 0) {
        for (const deptName of validDepartments) {
          await departmentService.addDepartment({
            name: deptName,
            icon: "building",
            shape: "circle",
            color: "#3B82F6",
          });
        }

        // Reload the data after initial migration
        const updatedDepartments = await departmentService.getAllDepartments();
        setDepartments(updatedDepartments);

        toast({
          title: "Departments Migrated",
          description: `Auto-created ${validDepartments.length} departments from existing employee records`,
        });
      }
    } catch (error) {
      console.error("Error migrating departments:", error);
    }
  };

  // Calculate department statistics using only managed departments
  const departmentStats = departments.map((department) => {
    const deptEmployees = employees.filter(
      (emp) => emp.jobDetails.department === department.name,
    );

    const activeCount = deptEmployees.filter(
      (emp) => emp.status === "active",
    ).length;
    const inactiveCount = deptEmployees.filter(
      (emp) => emp.status === "inactive",
    ).length;
    const averageMonthlySalary =
      deptEmployees.length > 0
        ? deptEmployees.reduce(
            (sum, emp) =>
              sum +
              (emp.compensation.monthlySalary ||
                Math.round((emp.compensation as any).annualSalary / 12) ||
                0),
            0,
          ) / deptEmployees.length
        : 0;

    return {
      name: department.name,
      totalEmployees: deptEmployees.length,
      activeEmployees: activeCount,
      inactiveEmployees: inactiveCount,
      averageSalary: Math.round(averageMonthlySalary),
      employees: deptEmployees,
      department, // Include the full department object
    };
  });

  // Sort departments by employee count
  departmentStats.sort((a, b) => b.totalEmployees - a.totalEmployees);

  const getDepartmentColor = (index: number) => {
    const colors = [
      "bg-blue-50 border-blue-200",
      "bg-green-50 border-green-200",
      "bg-purple-50 border-purple-200",
      "bg-orange-50 border-orange-200",
      "bg-pink-50 border-pink-200",
      "bg-indigo-50 border-indigo-200",
      "bg-yellow-50 border-yellow-200",
      "bg-red-50 border-red-200",
    ];
    return colors[index % colors.length];
  };

  const formatSalary = (monthlySalary: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(monthlySalary);
  };

  const handleViewDepartmentEmployees = (dept: any) => {
    setSelectedDepartment(dept);
    setShowDepartmentEmployees(true);
  };

  const handleEditDepartment = (department: Department) => {
    setManagerMode("edit");
    setShowDepartmentManager(true);
  };

  const handleViewEmployee = (employee: Employee) => {
    // Open employee profile in new tab
    window.open(`/staff/employees?view=${employee.id}`, "_blank");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <MainNavigation />
        <div className="p-6">
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            <span className="ml-3">Loading departments...</span>
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
            <h1 className="text-3xl font-bold">Departments</h1>
            <p className="text-muted-foreground">
              Overview of all departments and their employees
            </p>
          </div>
        </div>

        {employees.length === 0 ? (
          /* Empty State */
          <div className="text-center py-16">
            <Database className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-semibold mb-2">No Department Data</h3>
            <p className="text-muted-foreground mb-6">
              Add employees to your database to see department information
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
                        Total Departments
                      </p>
                      <p className="text-2xl font-bold">
                        {departmentStats.length}
                      </p>
                    </div>
                    <Building className="h-8 w-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Total Employees
                      </p>
                      <p className="text-2xl font-bold">{employees.length}</p>
                    </div>
                    <Users className="h-8 w-8 text-green-500" />
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
                        {departmentStats.length > 0
                          ? departmentStats[0].totalEmployees
                          : 0}
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
                        Average per Dept
                      </p>
                      <p className="text-2xl font-bold">
                        {departmentStats.length > 0
                          ? Math.round(
                              employees.length / departmentStats.length,
                            )
                          : 0}
                      </p>
                    </div>
                    <Database className="h-8 w-8 text-orange-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Department Directory */}
            <Card>
              <CardHeader>
                <CardTitle>Department Directory</CardTitle>
                <CardDescription>
                  Manage departments and view employee assignments
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-3 font-medium">
                          Department
                        </th>
                        <th className="text-center p-3 font-medium">
                          Director
                        </th>
                        <th className="text-center p-3 font-medium">Manager</th>
                        <th className="text-center p-3 font-medium">
                          Total Employees
                        </th>
                        <th className="text-center p-3 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {departmentStats.map((dept) => (
                        <tr
                          key={dept.name}
                          className="border-b hover:bg-muted/50"
                        >
                          <td className="p-3">
                            <div className="flex items-center gap-2">
                              <div
                                className="w-4 h-4 rounded-full border"
                                style={{
                                  backgroundColor:
                                    dept.department?.color || "#3B82F6",
                                }}
                              />
                              <Building className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium">{dept.name}</span>
                            </div>
                          </td>
                          <td className="p-3 text-center">
                            {dept.department?.director ? (
                              <Badge
                                variant="outline"
                                className="text-blue-600"
                              >
                                {dept.department.director}
                              </Badge>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </td>
                          <td className="p-3 text-center">
                            {dept.department?.manager ? (
                              <Badge
                                variant="outline"
                                className="text-green-600"
                              >
                                {dept.department.manager}
                              </Badge>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </td>
                          <td className="p-3 text-center">
                            <Badge
                              variant="secondary"
                              className="cursor-pointer hover:bg-blue-100 hover:text-blue-800 transition-colors"
                              onClick={() =>
                                handleViewDepartmentEmployees(dept)
                              }
                            >
                              {dept.totalEmployees}
                            </Badge>
                          </td>
                          <td className="p-3">
                            <div className="flex items-center justify-center gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  handleEditDepartment(dept.department)
                                }
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
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
