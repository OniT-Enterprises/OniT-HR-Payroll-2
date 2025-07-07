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
} from "lucide-react";

export default function Departments() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
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

  // Group employees by department
  const departmentGroups = employees.reduce(
    (acc, employee) => {
      const dept = employee.jobDetails.department;
      if (!acc[dept]) {
        acc[dept] = [];
      }
      acc[dept].push(employee);
      return acc;
    },
    {} as Record<string, Employee[]>,
  );

  // Calculate department statistics
  const departmentStats = Object.entries(departmentGroups).map(
    ([name, deptEmployees]) => {
      const activeCount = deptEmployees.filter(
        (emp) => emp.status === "active",
      ).length;
      const inactiveCount = deptEmployees.filter(
        (emp) => emp.status === "inactive",
      ).length;
      const averageSalary =
        deptEmployees.reduce(
          (sum, emp) => sum + emp.compensation.annualSalary,
          0,
        ) / deptEmployees.length;

      return {
        name,
        totalEmployees: deptEmployees.length,
        activeEmployees: activeCount,
        inactiveEmployees: inactiveCount,
        averageSalary: Math.round(averageSalary),
        employees: deptEmployees,
      };
    },
  );

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

  const formatSalary = (salary: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(salary);
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

            {/* Departments Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {departmentStats.map((dept, index) => {
                const departmentData = departments.find(
                  (d) => d.name === dept.name,
                );
                const monthlyPayroll = dept.employees.reduce(
                  (sum, emp) => sum + emp.compensation.annualSalary / 12,
                  0,
                );

                return (
                  <Card
                    key={dept.name}
                    className={`${getDepartmentColor(index)} border-2`}
                  >
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            <Building className="h-5 w-5" />
                            {dept.name}
                          </CardTitle>
                          <CardDescription>
                            {dept.totalEmployees} employee
                            {dept.totalEmployees !== 1 ? "s" : ""}
                          </CardDescription>
                        </div>
                        <Badge variant="secondary">{dept.totalEmployees}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {/* Director */}
                        {departmentData?.director && (
                          <div className="flex items-center gap-2 text-sm">
                            <Crown className="h-4 w-4 text-blue-500" />
                            <span className="text-muted-foreground">
                              Director:
                            </span>
                            <span className="font-medium">
                              {departmentData.director}
                            </span>
                          </div>
                        )}

                        {/* Manager */}
                        {departmentData?.manager && (
                          <div className="flex items-center gap-2 text-sm">
                            <User className="h-4 w-4 text-green-500" />
                            <span className="text-muted-foreground">
                              Manager:
                            </span>
                            <span className="font-medium">
                              {departmentData.manager}
                            </span>
                          </div>
                        )}

                        {/* Staff Count */}
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            Staff in Department
                          </span>
                          <Badge className="bg-purple-100 text-purple-800">
                            {dept.totalEmployees}
                          </Badge>
                        </div>

                        {/* Monthly Payroll */}
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground flex items-center gap-1">
                            <DollarSign className="h-4 w-4" />
                            Monthly Payroll
                          </span>
                          <span className="text-sm font-medium">
                            {formatSalary(monthlyPayroll)}
                          </span>
                        </div>

                        {/* Employee Status */}
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">
                            Active
                          </span>
                          <Badge className="bg-green-100 text-green-800">
                            {dept.activeEmployees}
                          </Badge>
                        </div>
                        {dept.inactiveEmployees > 0 && (
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">
                              Inactive
                            </span>
                            <Badge className="bg-gray-100 text-gray-800">
                              {dept.inactiveEmployees}
                            </Badge>
                          </div>
                        )}

                        {/* Recent Employees */}
                        <div>
                          <p className="text-sm font-medium mb-2">
                            Recent Employees
                          </p>
                          <div className="flex -space-x-2">
                            {dept.employees.slice(0, 5).map((employee) => (
                              <Avatar
                                key={employee.id}
                                className="border-2 border-white w-8 h-8"
                              >
                                <AvatarImage
                                  src="/placeholder.svg"
                                  alt={employee.personalInfo.firstName}
                                />
                                <AvatarFallback className="text-xs">
                                  {employee.personalInfo.firstName[0]}
                                  {employee.personalInfo.lastName[0]}
                                </AvatarFallback>
                              </Avatar>
                            ))}
                            {dept.employees.length > 5 && (
                              <div className="w-8 h-8 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center">
                                <span className="text-xs text-gray-600">
                                  +{dept.employees.length - 5}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Department Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Department Summary</CardTitle>
                <CardDescription>
                  Complete overview of all departments in your organization
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
                          Total Employees
                        </th>
                        <th className="text-center p-3 font-medium">Active</th>
                        <th className="text-center p-3 font-medium">
                          Avg Salary
                        </th>
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
                              <Building className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium">{dept.name}</span>
                            </div>
                          </td>
                          <td className="p-3 text-center">
                            <Badge variant="secondary">
                              {dept.totalEmployees}
                            </Badge>
                          </td>
                          <td className="p-3 text-center">
                            <Badge className="bg-green-100 text-green-800">
                              {dept.activeEmployees}
                            </Badge>
                          </td>
                          <td className="p-3 text-center">
                            <span className="font-medium">
                              {dept.averageSalary > 0
                                ? formatSalary(dept.averageSalary)
                                : "N/A"}
                            </span>
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
      </div>
    </div>
  );
}
