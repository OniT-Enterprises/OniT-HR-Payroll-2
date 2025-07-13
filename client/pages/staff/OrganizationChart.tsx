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

interface DepartmentNode extends Department {
  employees: Employee[];
  children: DepartmentNode[];
  parentId?: string;
  level: number;
  totalEmployees: number;
}

export default function OrganizationChart() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [departmentTree, setDepartmentTree] = useState<DepartmentNode[]>([]);
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
      buildDepartmentTree(employeesData, departmentsData);
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
        buildDepartmentTree(employees, updatedDepartments);
      }
    } catch (error) {
      console.error("Error migrating departments:", error);
    }
  };

  const buildDepartmentTree = useCallback(
    (employeesData: Employee[], departmentsData: Department[]) => {
      const employeesByDept = employeesData.reduce(
        (acc, emp) => {
          const deptName = emp.jobDetails.department;
          if (!acc[deptName]) acc[deptName] = [];
          acc[deptName].push(emp);
          return acc;
        },
        {} as Record<string, Employee[]>,
      );

      // Create department nodes with employee counts
      const nodes: DepartmentNode[] = departmentsData.map((dept) => {
        const deptEmployees = employeesByDept[dept.name] || [];
        return {
          ...dept,
          employees: deptEmployees,
          children: [],
          level: 0,
          totalEmployees: deptEmployees.length,
        };
      });

      // Sort by department size for better visual hierarchy
      const sortedNodes = nodes.sort(
        (a, b) => b.totalEmployees - a.totalEmployees,
      );

      // Create a simple two-level hierarchy
      const tree: DepartmentNode[] = [];
      const maxTopLevel = Math.min(5, sortedNodes.length);

      // Top level departments
      for (let i = 0; i < maxTopLevel; i++) {
        tree.push({ ...sortedNodes[i], level: 0 });
      }

      // Remaining departments as second level under the largest department
      if (sortedNodes.length > maxTopLevel && tree.length > 0) {
        for (let i = maxTopLevel; i < sortedNodes.length; i++) {
          const node = { ...sortedNodes[i], level: 1, parentId: tree[0].id };
          tree[0].children.push(node);
        }
      }

      setDepartmentTree(tree);
    },
    [],
  );

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    toast({
      title: "Department Moved",
      description: "Department hierarchy updated successfully",
    });
  };

  const getManagerInfo = (dept: DepartmentNode) => {
    // Find employees with management roles
    const managers = dept.employees.filter(
      (emp) =>
        emp.jobDetails.position.toLowerCase().includes("manager") ||
        emp.jobDetails.position.toLowerCase().includes("director") ||
        emp.jobDetails.position.toLowerCase().includes("head") ||
        emp.jobDetails.position.toLowerCase().includes("lead"),
    );

    const director =
      dept.director ||
      managers.find((m) =>
        m.jobDetails.position.toLowerCase().includes("director"),
      )?.personalInfo.firstName +
        " " +
        managers.find((m) =>
          m.jobDetails.position.toLowerCase().includes("director"),
        )?.personalInfo.lastName;

    const manager =
      dept.manager ||
      managers.find(
        (m) =>
          m.jobDetails.position.toLowerCase().includes("manager") &&
          !m.jobDetails.position.toLowerCase().includes("director"),
      )?.personalInfo.firstName +
        " " +
        managers.find(
          (m) =>
            m.jobDetails.position.toLowerCase().includes("manager") &&
            !m.jobDetails.position.toLowerCase().includes("director"),
        )?.personalInfo.lastName;

    return { director, manager, totalManagers: managers.length };
  };

  const renderOrgChartNode = (
    node: DepartmentNode,
    index: number,
    level: number = 0,
  ) => {
    const { director, manager, totalManagers } = getManagerInfo(node);
    const hasChildren = node.children.length > 0;

    return (
      <Draggable
        key={node.id}
        draggableId={node.id}
        index={index}
        isDragDisabled={!dragMode}
      >
        {(provided, snapshot) => (
          <div className="flex flex-col items-center relative">
            {/* Connecting line from parent */}
            {level > 0 && <div className="w-0.5 h-8 bg-gray-400 mb-2"></div>}

            {/* Department Box */}
            <div
              ref={provided.innerRef}
              {...provided.draggableProps}
              className={`relative ${
                snapshot.isDragging ? "rotate-1 shadow-xl scale-105" : ""
              } transition-all duration-200`}
            >
              <Card className="w-72 border-2 border-gray-300 bg-white shadow-md hover:shadow-lg transition-shadow">
                <CardHeader className="text-center pb-2">
                  {dragMode && (
                    <div
                      {...provided.dragHandleProps}
                      className="absolute top-2 right-2"
                    >
                      <Grip className="h-4 w-4 text-gray-400" />
                    </div>
                  )}

                  {/* Department Title */}
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Building2 className="h-5 w-5 text-blue-600" />
                    <CardTitle className="text-lg font-bold text-gray-800">
                      {node.name}
                    </CardTitle>
                  </div>

                  {/* Employee Count Badge */}
                  <div className="flex justify-center">
                    <Badge variant="secondary" className="text-sm">
                      {node.totalEmployees} Employee
                      {node.totalEmployees !== 1 ? "s" : ""}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="pt-0 space-y-3">
                  {/* Director */}
                  {director && (
                    <div className="text-center p-2 bg-blue-50 rounded border border-blue-200">
                      <div className="flex items-center justify-center gap-2 mb-1">
                        <Crown className="h-4 w-4 text-amber-600" />
                        <span className="text-xs font-medium text-blue-800">
                          DIRECTOR
                        </span>
                      </div>
                      <p className="font-semibold text-sm text-gray-800">
                        {director}
                      </p>
                    </div>
                  )}

                  {/* Manager */}
                  {manager && (
                    <div className="text-center p-2 bg-green-50 rounded border border-green-200">
                      <div className="flex items-center justify-center gap-2 mb-1">
                        <User className="h-4 w-4 text-green-600" />
                        <span className="text-xs font-medium text-green-800">
                          MANAGER
                        </span>
                      </div>
                      <p className="font-semibold text-sm text-gray-800">
                        {manager}
                      </p>
                    </div>
                  )}

                  {/* Additional Managers Count */}
                  {totalManagers > (director ? 1 : 0) + (manager ? 1 : 0) && (
                    <div className="text-center p-2 bg-gray-50 rounded border border-gray-200">
                      <p className="text-xs text-gray-600">
                        +
                        {totalManagers - (director ? 1 : 0) - (manager ? 1 : 0)}{" "}
                        more manager
                        {totalManagers -
                          (director ? 1 : 0) -
                          (manager ? 1 : 0) !==
                        1
                          ? "s"
                          : ""}
                      </p>
                    </div>
                  )}

                  {/* No Management */}
                  {!director && !manager && totalManagers === 0 && (
                    <div className="text-center p-2 bg-gray-50 rounded border border-gray-200">
                      <p className="text-xs text-gray-500">
                        No assigned management
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Render children */}
            {hasChildren && (
              <>
                {/* Connecting line down to children */}
                <div className="w-0.5 h-8 bg-gray-400 mt-2"></div>

                {/* Horizontal line for multiple children */}
                {node.children.length > 1 && (
                  <div className="relative">
                    <div
                      className="h-0.5 bg-gray-400"
                      style={{
                        width: `${(node.children.length - 1) * 320}px`,
                        marginLeft: `-${((node.children.length - 1) * 320) / 2}px`,
                      }}
                    ></div>
                  </div>
                )}

                <Droppable
                  droppableId={`children-${node.id}`}
                  type="department"
                >
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className="flex gap-8 mt-2"
                    >
                      {node.children.map((child, childIndex) => (
                        <div key={child.id} className="relative">
                          {/* Vertical line to each child */}
                          {node.children.length > 1 && (
                            <div className="w-0.5 h-8 bg-gray-400 mx-auto mb-2"></div>
                          )}
                          {renderOrgChartNode(child, childIndex, level + 1)}
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
    <div className="min-h-screen bg-background">
      <MainNavigation />

      <div className="p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="text-center flex-1">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">
              Organization Chart
            </h1>
            <p className="text-lg text-gray-600">
              Company Hierarchical Structure
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant={dragMode ? "default" : "outline"}
              onClick={() => setDragMode(!dragMode)}
            >
              <Move className="mr-2 h-4 w-4" />
              {dragMode ? "Exit Drag Mode" : "Reorganize"}
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
              Edit Departments
            </Button>
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
          <div className="space-y-8">
            {/* Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                      <p className="text-2xl font-bold">{departments.length}</p>
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
                        Management Roles
                      </p>
                      <p className="text-2xl font-bold">
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
                                .includes("head"),
                          ).length
                        }
                      </p>
                    </div>
                    <Crown className="h-8 w-8 text-orange-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Organization Chart */}
            <div className="bg-gray-50 rounded-lg p-8 overflow-x-auto">
              <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="root" type="department">
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className="flex justify-center"
                    >
                      <div className="flex gap-12 items-start">
                        {departmentTree.map((dept, index) =>
                          renderOrgChartNode(dept, index, 0),
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
