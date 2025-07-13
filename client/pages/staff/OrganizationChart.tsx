import React, { useState, useEffect, useCallback } from "react";
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
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";
import {
  Building,
  Users,
  Crown,
  User,
  Grip,
  Database,
  Plus,
  Edit,
  Move,
  Building2,
} from "lucide-react";

interface LeadershipNode {
  id: string;
  name: string;
  title: string;
  department: string;
  employee?: Employee;
  children: LeadershipNode[];
  level: number;
  employeeCount: number;
}

export default function OrganizationChart() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [orgChart, setOrgChart] = useState<LeadershipNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDepartmentManager, setShowDepartmentManager] = useState(false);
  const [managerMode, setManagerMode] = useState<"add" | "edit">("edit");
  const [dragMode, setDragMode] = useState(false);
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

      await migrateMissingDepartments(employeesData, departmentsData);
      buildLeadershipChart(employeesData, departmentsData);
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
      if (existingDepartments.length > 0) {
        return;
      }

      const employeeDepartments = [
        ...new Set(employees.map((emp) => emp.jobDetails.department)),
      ];

      const validDepartments = employeeDepartments.filter(
        (deptName) => deptName && deptName.trim(),
      );

      if (validDepartments.length > 0 && existingDepartments.length === 0) {
        for (const deptName of validDepartments) {
          await departmentService.addDepartment({
            name: deptName,
            icon: "building",
            shape: "circle",
            color: "#3B82F6",
          });
        }

        const updatedDepartments = await departmentService.getAllDepartments();
        setDepartments(updatedDepartments);
        buildLeadershipChart(employees, updatedDepartments);
      }
    } catch (error) {
      console.error("Error migrating departments:", error);
    }
  };

  const buildLeadershipChart = useCallback(
    (employeesData: Employee[], departmentsData: Department[]) => {
      // Group employees by department
      const employeesByDept = employeesData.reduce(
        (acc, emp) => {
          const deptName = emp.jobDetails.department;
          if (!acc[deptName]) acc[deptName] = [];
          acc[deptName].push(emp);
          return acc;
        },
        {} as Record<string, Employee[]>,
      );

      const chart: LeadershipNode[] = [];

      // Find CEO/Top Executive (look for titles containing CEO, President, etc.)
      const topExecutive = employeesData.find(
        (emp) =>
          emp.jobDetails.position.toLowerCase().includes("ceo") ||
          emp.jobDetails.position.toLowerCase().includes("president") ||
          emp.jobDetails.position.toLowerCase().includes("chief executive"),
      );

      if (topExecutive) {
        const ceoNode: LeadershipNode = {
          id: `leader-${topExecutive.id}`,
          name: `${topExecutive.personalInfo.firstName} ${topExecutive.personalInfo.lastName}`,
          title: topExecutive.jobDetails.position,
          department: "Executive",
          employee: topExecutive,
          children: [],
          level: 0,
          employeeCount: employeesData.length,
        };
        chart.push(ceoNode);
      }

      // Build department leadership hierarchy
      const sortedDepartments = departmentsData.sort(
        (a, b) =>
          (employeesByDept[b.name]?.length || 0) -
          (employeesByDept[a.name]?.length || 0),
      );

      sortedDepartments.forEach((dept, index) => {
        const deptEmployees = employeesByDept[dept.name] || [];

        // Find department head (Director, VP, etc.)
        const departmentHead =
          deptEmployees.find(
            (emp) =>
              emp.jobDetails.position.toLowerCase().includes("director") ||
              emp.jobDetails.position.toLowerCase().includes("head") ||
              emp.jobDetails.position.toLowerCase().includes("vp") ||
              emp.jobDetails.position.toLowerCase().includes("vice president"),
          ) ||
          deptEmployees.find((emp) =>
            emp.jobDetails.position.toLowerCase().includes("manager"),
          );

        if (departmentHead) {
          const deptNode: LeadershipNode = {
            id: `leader-${departmentHead.id}`,
            name: `${departmentHead.personalInfo.firstName} ${departmentHead.personalInfo.lastName}`,
            title: departmentHead.jobDetails.position,
            department: dept.name,
            employee: departmentHead,
            children: [],
            level: 1,
            employeeCount: deptEmployees.length,
          };

          // Find managers under this department head
          const managers = deptEmployees.filter(
            (emp) =>
              emp.id !== departmentHead.id &&
              (emp.jobDetails.position.toLowerCase().includes("manager") ||
                emp.jobDetails.position.toLowerCase().includes("lead") ||
                emp.jobDetails.position.toLowerCase().includes("supervisor")),
          );

          managers.forEach((manager) => {
            const managerNode: LeadershipNode = {
              id: `leader-${manager.id}`,
              name: `${manager.personalInfo.firstName} ${manager.personalInfo.lastName}`,
              title: manager.jobDetails.position,
              department: dept.name,
              employee: manager,
              children: [],
              level: 2,
              employeeCount: Math.max(
                1,
                Math.floor(
                  (deptEmployees.length - managers.length - 1) /
                    Math.max(1, managers.length),
                ),
              ),
            };
            deptNode.children.push(managerNode);
          });

          // If no specific managers found but department has multiple employees,
          // create generic manager nodes
          if (managers.length === 0 && deptEmployees.length > 3) {
            const sampleEmployees = deptEmployees
              .filter((emp) => emp.id !== departmentHead.id)
              .slice(0, 2);

            sampleEmployees.forEach((emp) => {
              const empNode: LeadershipNode = {
                id: `leader-${emp.id}`,
                name: `${emp.personalInfo.firstName} ${emp.personalInfo.lastName}`,
                title: emp.jobDetails.position,
                department: dept.name,
                employee: emp,
                children: [],
                level: 2,
                employeeCount: Math.floor(deptEmployees.length / 3),
              };
              deptNode.children.push(empNode);
            });
          }

          // Add to CEO's children if CEO exists, otherwise add to chart
          if (chart.length > 0 && chart[0].level === 0) {
            chart[0].children.push(deptNode);
          } else {
            chart.push(deptNode);
          }
        }
      });

      setOrgChart(chart);
    },
    [],
  );

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    toast({
      title: "Position Updated",
      description: "Leadership position moved successfully",
    });
  };

  const renderLeadershipNode = (
    node: LeadershipNode,
    index: number,
    level: number = 0,
  ) => {
    const hasChildren = node.children.length > 0;

    return (
      <Draggable
        key={node.id}
        draggableId={node.id}
        index={index}
        isDragDisabled={!dragMode}
      >
        {(provided, snapshot) => (
          <div className="flex flex-col items-center">
            {/* Connecting line from parent */}
            {level > 0 && <div className="w-0.5 h-12 bg-blue-300 mb-4"></div>}

            {/* Leadership Box */}
            <div
              ref={provided.innerRef}
              {...provided.draggableProps}
              className={`relative ${
                snapshot.isDragging ? "rotate-1 shadow-2xl scale-105" : ""
              } transition-all duration-200`}
            >
              <Card className="w-64 border-2 border-blue-200 bg-gradient-to-b from-blue-50 to-white shadow-lg hover:shadow-xl transition-all">
                <CardContent className="p-4 text-center">
                  {dragMode && (
                    <div
                      {...provided.dragHandleProps}
                      className="absolute top-2 right-2"
                    >
                      <Grip className="h-4 w-4 text-gray-400" />
                    </div>
                  )}

                  {/* Avatar */}
                  <div className="flex justify-center mb-3">
                    <Avatar className="h-16 w-16 border-2 border-blue-300">
                      <AvatarImage src="/placeholder.svg" alt={node.name} />
                      <AvatarFallback className="bg-blue-100 text-blue-700 font-semibold text-lg">
                        {node.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                  </div>

                  {/* Name */}
                  <h3 className="font-bold text-lg text-gray-800 mb-1">
                    {node.name}
                  </h3>

                  {/* Title */}
                  <p className="text-sm font-medium text-blue-700 mb-2">
                    {node.title}
                  </p>

                  {/* Department */}
                  <p className="text-xs text-gray-600 mb-2">
                    {node.department}
                  </p>

                  {/* Employee Count */}
                  <div className="flex justify-center">
                    <Badge variant="secondary" className="text-xs">
                      {node.employeeCount} Team Member
                      {node.employeeCount !== 1 ? "s" : ""}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Render children */}
            {hasChildren && (
              <>
                {/* Connecting line down to children */}
                <div className="w-0.5 h-12 bg-blue-300 mt-4"></div>

                {/* Horizontal line for multiple children */}
                {node.children.length > 1 && (
                  <div className="relative mb-4">
                    <div
                      className="h-0.5 bg-blue-300"
                      style={{
                        width: `${(node.children.length - 1) * 280}px`,
                        marginLeft: `-${((node.children.length - 1) * 280) / 2}px`,
                      }}
                    ></div>
                  </div>
                )}

                <Droppable
                  droppableId={`children-${node.id}`}
                  type="leadership"
                >
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className="flex gap-8"
                    >
                      {node.children.map((child, childIndex) => (
                        <div key={child.id} className="relative">
                          {/* Vertical line to each child */}
                          {node.children.length > 1 && (
                            <div className="w-0.5 h-12 bg-blue-300 mx-auto -mt-4 mb-0"></div>
                          )}
                          {renderLeadershipNode(child, childIndex, level + 1)}
                        </div>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </>
            )}
          </div>
        )}
      </Draggable>
    );
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
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <MainNavigation />

      <div className="p-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Organizational Chart
          </h1>
          <p className="text-lg text-gray-600">Company Leadership Structure</p>
        </div>

        {/* Controls */}
        <div className="flex justify-center items-center gap-4 mb-8">
          <Button
            variant={dragMode ? "default" : "outline"}
            onClick={() => setDragMode(!dragMode)}
          >
            <Move className="mr-2 h-4 w-4" />
            {dragMode ? "Exit Reorganize" : "Reorganize"}
          </Button>
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
            Manage
          </Button>
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
          <div className="space-y-8">
            {/* Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
              <Card className="border-blue-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        Total Employees
                      </p>
                      <p className="text-2xl font-bold text-blue-700">
                        {employees.length}
                      </p>
                    </div>
                    <Users className="h-8 w-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>
              <Card className="border-green-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        Departments
                      </p>
                      <p className="text-2xl font-bold text-green-700">
                        {departments.length}
                      </p>
                    </div>
                    <Building className="h-8 w-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>
              <Card className="border-purple-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        Leadership Roles
                      </p>
                      <p className="text-2xl font-bold text-purple-700">
                        {
                          employees.filter(
                            (emp) =>
                              emp.jobDetails.position
                                .toLowerCase()
                                .includes("manager") ||
                              emp.jobDetails.position
                                .toLowerCase()
                                .includes("director") ||
                              emp.jobDetails.position
                                .toLowerCase()
                                .includes("head") ||
                              emp.jobDetails.position
                                .toLowerCase()
                                .includes("lead"),
                          ).length
                        }
                      </p>
                    </div>
                    <Crown className="h-8 w-8 text-purple-500" />
                  </div>
                </CardContent>
              </Card>
              <Card className="border-orange-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        Org Levels
                      </p>
                      <p className="text-2xl font-bold text-orange-700">
                        {Math.max(
                          ...orgChart.map((node) =>
                            node.children.length > 0
                              ? Math.max(
                                  ...node.children.map((child) => child.level),
                                ) + 1
                              : node.level + 1,
                          ),
                        ) || 1}
                      </p>
                    </div>
                    <Building2 className="h-8 w-8 text-orange-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Organization Chart */}
            <div className="bg-white rounded-lg shadow-lg p-8 mx-auto overflow-x-auto">
              <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="root" type="leadership">
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className="flex justify-center min-w-max"
                    >
                      <div className="flex gap-16 items-start">
                        {orgChart.map((node, index) =>
                          renderLeadershipNode(node, index, 0),
                        )}
                      </div>
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
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
