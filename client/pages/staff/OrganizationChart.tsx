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

interface OrgNode {
  id: string;
  name: string;
  title: string;
  department: string;
  employee?: Employee;
  children: OrgNode[];
  level: number;
  type: "executive" | "department-head" | "manager" | "individual";
}

export default function OrganizationChart() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [orgChart, setOrgChart] = useState<OrgNode[]>([]);
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
      buildExecutiveChart(employeesData, departmentsData);
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
      if (existingDepartments.length > 0) return;

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
        buildExecutiveChart(employees, updatedDepartments);
      }
    } catch (error) {
      console.error("Error migrating departments:", error);
    }
  };

  const buildExecutiveChart = useCallback(
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

      const chart: OrgNode[] = [];

      // 1. Find CEO/Top Executive
      const ceo = employeesData.find(
        (emp) =>
          emp.jobDetails.position.toLowerCase().includes("ceo") ||
          emp.jobDetails.position.toLowerCase().includes("chief executive") ||
          emp.jobDetails.position.toLowerCase().includes("president"),
      );

      if (ceo) {
        const ceoNode: OrgNode = {
          id: `exec-${ceo.id}`,
          name: `${ceo.personalInfo.firstName} ${ceo.personalInfo.lastName}`,
          title: ceo.jobDetails.position,
          department: "Executive",
          employee: ceo,
          children: [],
          level: 0,
          type: "executive",
        };

        // 2. Find C-Level executives (CTO, CFO, etc.)
        const cLevelExecs = employeesData.filter(
          (emp) =>
            emp.id !== ceo.id &&
            (emp.jobDetails.position.toLowerCase().includes("cto") ||
              emp.jobDetails.position.toLowerCase().includes("cfo") ||
              emp.jobDetails.position.toLowerCase().includes("coo") ||
              emp.jobDetails.position.toLowerCase().includes("chief")),
        );

        cLevelExecs.forEach((exec) => {
          const execNode: OrgNode = {
            id: `exec-${exec.id}`,
            name: `${exec.personalInfo.firstName} ${exec.personalInfo.lastName}`,
            title: exec.jobDetails.position,
            department: exec.jobDetails.department,
            employee: exec,
            children: [],
            level: 1,
            type: "executive",
          };
          ceoNode.children.push(execNode);
        });

        // 3. Find Department Heads/VPs
        const departmentHeads: OrgNode[] = [];
        departmentsData.forEach((dept) => {
          const deptEmployees = employeesByDept[dept.name] || [];

          // Find department head (excluding already assigned C-level)
          const head = deptEmployees.find(
            (emp) =>
              !cLevelExecs.some((exec) => exec.id === emp.id) &&
              emp.id !== ceo.id &&
              (emp.jobDetails.position.toLowerCase().includes("vp") ||
                emp.jobDetails.position
                  .toLowerCase()
                  .includes("vice president") ||
                emp.jobDetails.position.toLowerCase().includes("director") ||
                emp.jobDetails.position.toLowerCase().includes("head of")),
          );

          if (head) {
            const headNode: OrgNode = {
              id: `head-${head.id}`,
              name: `${head.personalInfo.firstName} ${head.personalInfo.lastName}`,
              title: head.jobDetails.position,
              department: dept.name,
              employee: head,
              children: [],
              level: 2,
              type: "department-head",
            };

            // 4. Find Managers under this department head
            const managers = deptEmployees.filter(
              (emp) =>
                emp.id !== head.id &&
                !cLevelExecs.some((exec) => exec.id === emp.id) &&
                emp.id !== ceo.id &&
                (emp.jobDetails.position.toLowerCase().includes("manager") ||
                  emp.jobDetails.position.toLowerCase().includes("lead") ||
                  emp.jobDetails.position
                    .toLowerCase()
                    .includes("supervisor") ||
                  emp.jobDetails.position.toLowerCase().includes("senior")),
            );

            managers.slice(0, 4).forEach((manager) => {
              // Limit to 4 direct reports like Apple
              const managerNode: OrgNode = {
                id: `mgr-${manager.id}`,
                name: `${manager.personalInfo.firstName} ${manager.personalInfo.lastName}`,
                title: manager.jobDetails.position,
                department: dept.name,
                employee: manager,
                children: [],
                level: 3,
                type: "manager",
              };
              headNode.children.push(managerNode);
            });

            departmentHeads.push(headNode);
          }
        });

        // Attach department heads to appropriate C-level exec or directly to CEO
        if (ceoNode.children.length > 0) {
          // Distribute department heads under C-level executives
          departmentHeads.forEach((head, index) => {
            const targetExec =
              ceoNode.children[index % ceoNode.children.length];
            targetExec.children.push(head);
          });
        } else {
          // No C-level execs, attach directly to CEO
          departmentHeads.forEach((head) => {
            ceoNode.children.push(head);
          });
        }

        chart.push(ceoNode);
      } else {
        // No CEO found, create department-based structure
        const sortedDepartments = departmentsData.sort(
          (a, b) =>
            (employeesByDept[b.name]?.length || 0) -
            (employeesByDept[a.name]?.length || 0),
        );

        sortedDepartments.slice(0, 5).forEach((dept) => {
          const deptEmployees = employeesByDept[dept.name] || [];
          const head = deptEmployees.find(
            (emp) =>
              emp.jobDetails.position.toLowerCase().includes("director") ||
              emp.jobDetails.position.toLowerCase().includes("manager") ||
              emp.jobDetails.position.toLowerCase().includes("head"),
          );

          if (head) {
            const headNode: OrgNode = {
              id: `head-${head.id}`,
              name: `${head.personalInfo.firstName} ${head.personalInfo.lastName}`,
              title: head.jobDetails.position,
              department: dept.name,
              employee: head,
              children: [],
              level: 0,
              type: "department-head",
            };

            const managers = deptEmployees.filter(
              (emp) =>
                emp.id !== head.id &&
                emp.jobDetails.position.toLowerCase().includes("manager"),
            );

            managers.slice(0, 3).forEach((manager) => {
              const managerNode: OrgNode = {
                id: `mgr-${manager.id}`,
                name: `${manager.personalInfo.firstName} ${manager.personalInfo.lastName}`,
                title: manager.jobDetails.position,
                department: dept.name,
                employee: manager,
                children: [],
                level: 1,
                type: "manager",
              };
              headNode.children.push(managerNode);
            });

            chart.push(headNode);
          }
        });
      }

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

  const renderExecutiveNode = (
    node: OrgNode,
    index: number,
    level: number = 0,
  ) => {
    const hasChildren = node.children.length > 0;
    const isTopLevel = level === 0;
    const isDepartmentHead = node.type === "department-head" && level >= 2;

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
            {level > 0 && !isTopLevel && (
              <div className="w-0.5 h-8 bg-blue-400 mb-2"></div>
            )}

            {/* Executive Box */}
            <div
              ref={provided.innerRef}
              {...provided.draggableProps}
              className={`relative ${
                snapshot.isDragging ? "rotate-1 shadow-2xl scale-105" : ""
              } transition-all duration-200`}
            >
              <Card
                className={`
                ${isTopLevel ? "w-72" : isDepartmentHead ? "w-64" : "w-56"} 
                border-2 
                ${
                  isTopLevel
                    ? "border-blue-300 bg-gradient-to-b from-blue-100 to-blue-50"
                    : isDepartmentHead
                      ? "border-gray-300 bg-gradient-to-b from-gray-50 to-white"
                      : "border-blue-200 bg-gradient-to-b from-blue-50 to-white"
                }
                shadow-lg hover:shadow-xl transition-all
              `}
              >
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
                    <Avatar
                      className={`${isTopLevel ? "h-20 w-20" : "h-16 w-16"} border-2 border-blue-300`}
                    >
                      <AvatarImage src="/placeholder.svg" alt={node.name} />
                      <AvatarFallback className="bg-blue-100 text-blue-700 font-semibold">
                        {node.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                  </div>

                  {/* Name */}
                  <h3
                    className={`font-bold ${isTopLevel ? "text-xl" : "text-lg"} text-gray-800 mb-1`}
                  >
                    {node.name}
                  </h3>

                  {/* Title */}
                  <p
                    className={`${isTopLevel ? "text-sm" : "text-xs"} font-medium text-blue-700 mb-2`}
                  >
                    {node.title}
                  </p>

                  {/* Department */}
                  {node.department !== "Executive" && (
                    <p className="text-xs text-gray-600 mb-2">
                      {node.department}
                    </p>
                  )}

                  {/* Team indicator for department heads */}
                  {isDepartmentHead && (
                    <Badge variant="secondary" className="text-xs">
                      {node.children.length} Direct Report
                      {node.children.length !== 1 ? "s" : ""}
                    </Badge>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Render children */}
            {hasChildren && (
              <>
                {/* Connecting line down */}
                <div className="w-0.5 h-8 bg-blue-400 mt-2"></div>

                {/* Horizontal connector for multiple children */}
                {node.children.length > 1 && (
                  <div className="relative">
                    <div
                      className="h-0.5 bg-blue-400"
                      style={{
                        width: `${(node.children.length - 1) * (isDepartmentHead ? 280 : 240)}px`,
                        marginLeft: `-${((node.children.length - 1) * (isDepartmentHead ? 280 : 240)) / 2}px`,
                      }}
                    ></div>
                  </div>
                )}

                <Droppable droppableId={`children-${node.id}`} type="executive">
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`flex ${isDepartmentHead ? "gap-8" : "gap-6"} mt-2`}
                    >
                      {node.children.map((child, childIndex) => (
                        <div key={child.id} className="relative">
                          {/* Vertical line to each child */}
                          {node.children.length > 1 && (
                            <div className="w-0.5 h-8 bg-blue-400 mx-auto -mt-2 mb-0"></div>
                          )}
                          {renderExecutiveNode(child, childIndex, level + 1)}
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
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <MainNavigation />

      <div className="p-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Company Organizational Chart
          </h1>
          <p className="text-lg text-gray-600">
            Executive Leadership & Management Structure
          </p>
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
          <div className="text-center py-16">
            <Database className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-semibold mb-2">No Organization Data</h3>
            <p className="text-muted-foreground mb-6">
              Add employees to see the organization chart
            </p>
            <Button onClick={() => (window.location.href = "/staff/add")}>
              <User className="mr-2 h-4 w-4" />
              Add First Employee
            </Button>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Stats */}
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
                        Leadership
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
                                .includes("lead") ||
                              emp.jobDetails.position
                                .toLowerCase()
                                .includes("chief"),
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
                        Hierarchy Levels
                      </p>
                      <p className="text-2xl font-bold text-orange-700">
                        {Math.max(
                          ...orgChart.map((node) =>
                            Math.max(
                              node.level,
                              ...node.children.map((child) =>
                                Math.max(
                                  child.level,
                                  ...child.children.map(
                                    (grandchild) => grandchild.level,
                                  ),
                                ),
                              ),
                            ),
                          ),
                        ) + 1 || 1}
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
                <Droppable droppableId="root" type="executive">
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className="flex justify-center min-w-max"
                    >
                      <div className="space-y-8">
                        {orgChart.map((node, index) =>
                          renderExecutiveNode(node, index, 0),
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
