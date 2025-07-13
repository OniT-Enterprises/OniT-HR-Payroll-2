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
  avatar?: string;
}

interface DepartmentSection {
  id: string;
  name: string;
  head: OrgNode;
  members: OrgNode[];
}

export default function OrganizationChart() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [executives, setExecutives] = useState<OrgNode[]>([]);
  const [departmentSections, setDepartmentSections] = useState<
    DepartmentSection[]
  >([]);
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
      buildAppleStyleChart(employeesData, departmentsData);
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
        buildAppleStyleChart(employees, updatedDepartments);
      }
    } catch (error) {
      console.error("Error migrating departments:", error);
    }
  };

  const buildAppleStyleChart = useCallback(
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

      // 1. Build Executive Chain (vertical)
      const execChain: OrgNode[] = [];

      // Find CEO
      const ceo = employeesData.find(
        (emp) =>
          emp.jobDetails.position.toLowerCase().includes("ceo") ||
          emp.jobDetails.position.toLowerCase().includes("chief executive") ||
          emp.jobDetails.position.toLowerCase().includes("president"),
      );

      if (ceo) {
        execChain.push({
          id: `exec-${ceo.id}`,
          name: `${ceo.personalInfo.firstName} ${ceo.personalInfo.lastName}`,
          title: ceo.jobDetails.position,
          department: "Executive",
          employee: ceo,
        });
      }

      // Find CFO
      const cfo = employeesData.find(
        (emp) =>
          emp.id !== ceo?.id &&
          (emp.jobDetails.position.toLowerCase().includes("cfo") ||
            emp.jobDetails.position.toLowerCase().includes("chief financial")),
      );

      if (cfo) {
        execChain.push({
          id: `exec-${cfo.id}`,
          name: `${cfo.personalInfo.firstName} ${cfo.personalInfo.lastName}`,
          title: cfo.jobDetails.position,
          department: "Finance",
          employee: cfo,
        });
      }

      // Find COO or other C-level
      const coo = employeesData.find(
        (emp) =>
          emp.id !== ceo?.id &&
          emp.id !== cfo?.id &&
          (emp.jobDetails.position.toLowerCase().includes("coo") ||
            emp.jobDetails.position.toLowerCase().includes("chief operating") ||
            emp.jobDetails.position.toLowerCase().includes("cto") ||
            emp.jobDetails.position.toLowerCase().includes("chief technology")),
      );

      if (coo) {
        execChain.push({
          id: `exec-${coo.id}`,
          name: `${coo.personalInfo.firstName} ${coo.personalInfo.lastName}`,
          title: coo.jobDetails.position,
          department: coo.jobDetails.department,
          employee: coo,
        });
      }

      setExecutives(execChain);

      // 2. Build Department Sections (horizontal row + members grid)
      const deptSections: DepartmentSection[] = [];
      const usedEmployeeIds = new Set(
        execChain.map((exec) => exec.employee?.id).filter(Boolean),
      );

      departmentsData.slice(0, 5).forEach((dept) => {
        const deptEmployees = employeesByDept[dept.name] || [];

        // Find department head (excluding executives)
        const head = deptEmployees.find(
          (emp) =>
            !usedEmployeeIds.has(emp.id) &&
            (emp.jobDetails.position.toLowerCase().includes("director") ||
              emp.jobDetails.position.toLowerCase().includes("vp") ||
              emp.jobDetails.position
                .toLowerCase()
                .includes("vice president") ||
              emp.jobDetails.position.toLowerCase().includes("head of") ||
              emp.jobDetails.position.toLowerCase().includes("manager")),
        );

        if (head) {
          usedEmployeeIds.add(head.id);

          const headNode: OrgNode = {
            id: `head-${head.id}`,
            name: `${head.personalInfo.firstName} ${head.personalInfo.lastName}`,
            title: head.jobDetails.position,
            department: dept.name,
            employee: head,
          };

          // Find team members (excluding head and executives)
          const members = deptEmployees
            .filter((emp) => !usedEmployeeIds.has(emp.id))
            .slice(0, 6) // Limit to 6 like Apple chart
            .map((emp) => ({
              id: `member-${emp.id}`,
              name: `${emp.personalInfo.firstName} ${emp.personalInfo.lastName}`,
              title: emp.jobDetails.position,
              department: dept.name,
              employee: emp,
            }));

          deptSections.push({
            id: dept.id,
            name: dept.name,
            head: headNode,
            members,
          });
        }
      });

      setDepartmentSections(deptSections);
    },
    [],
  );

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    toast({
      title: "Position Updated",
      description: "Organization structure updated successfully",
    });
  };

  const renderPersonCard = (
    person: OrgNode,
    size: "large" | "medium" | "small" = "medium",
  ) => {
    const sizeClasses = {
      large: "w-56 h-32",
      medium: "w-48 h-28",
      small: "w-40 h-24",
    };

    const avatarSizes = {
      large: "h-12 w-12",
      medium: "h-10 w-10",
      small: "h-8 w-8",
    };

    const textSizes = {
      large: { name: "text-sm", title: "text-xs" },
      medium: { name: "text-sm", title: "text-xs" },
      small: { name: "text-xs", title: "text-xs" },
    };

    return (
      <Card
        className={`${sizeClasses[size]} border-2 border-blue-200 bg-gradient-to-b from-blue-50 to-white shadow-md hover:shadow-lg transition-all`}
      >
        <CardContent className="p-3 text-center h-full flex flex-col justify-center">
          {/* Avatar */}
          <div className="flex justify-center mb-2">
            <Avatar className={`${avatarSizes[size]} border border-blue-300`}>
              <AvatarImage src="/placeholder.svg" alt={person.name} />
              <AvatarFallback className="bg-blue-100 text-blue-700 font-semibold text-xs">
                {person.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
          </div>

          {/* Name */}
          <h3
            className={`font-semibold ${textSizes[size].name} text-gray-800 mb-1 leading-tight`}
          >
            {person.name}
          </h3>

          {/* Title */}
          <p className={`${textSizes[size].title} text-blue-700 leading-tight`}>
            {person.title}
          </p>
        </CardContent>
      </Card>
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
            Executive Leadership & Department Structure
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
                        Executives
                      </p>
                      <p className="text-2xl font-bold text-purple-700">
                        {executives.length}
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
                        Department Heads
                      </p>
                      <p className="text-2xl font-bold text-orange-700">
                        {departmentSections.length}
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
                <div className="flex flex-col items-center space-y-8">
                  {/* Executive Chain (Vertical) */}
                  {executives.length > 0 && (
                    <div className="flex flex-col items-center space-y-4">
                      {executives.map((exec, index) => (
                        <Draggable
                          key={exec.id}
                          draggableId={exec.id}
                          index={index}
                          isDragDisabled={!dragMode}
                        >
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              className={`relative ${
                                snapshot.isDragging
                                  ? "rotate-1 shadow-2xl scale-105"
                                  : ""
                              } transition-all duration-200`}
                            >
                              {dragMode && (
                                <div
                                  {...provided.dragHandleProps}
                                  className="absolute top-2 right-2 z-10"
                                >
                                  <Grip className="h-4 w-4 text-gray-400" />
                                </div>
                              )}

                              {/* Executive Card - Larger */}
                              <Card className="w-64 h-36 border-2 border-blue-300 bg-gradient-to-b from-blue-100 to-blue-50 shadow-lg">
                                <CardContent className="p-4 text-center h-full flex flex-col justify-center">
                                  <div className="flex justify-center mb-3">
                                    <Avatar className="h-14 w-14 border-2 border-blue-400">
                                      <AvatarImage
                                        src="/placeholder.svg"
                                        alt={exec.name}
                                      />
                                      <AvatarFallback className="bg-blue-200 text-blue-800 font-bold">
                                        {exec.name
                                          .split(" ")
                                          .map((n) => n[0])
                                          .join("")}
                                      </AvatarFallback>
                                    </Avatar>
                                  </div>
                                  <h3 className="font-bold text-lg text-gray-800 mb-1">
                                    {exec.name}
                                  </h3>
                                  <p className="text-sm font-medium text-blue-800">
                                    {exec.title}
                                  </p>
                                  {exec.department !== "Executive" && (
                                    <p className="text-xs text-gray-600 mt-1">
                                      {exec.department}
                                    </p>
                                  )}
                                </CardContent>
                              </Card>

                              {/* Connecting line to next executive */}
                              {index < executives.length - 1 && (
                                <div className="w-0.5 h-6 bg-blue-400 mx-auto"></div>
                              )}
                            </div>
                          )}
                        </Draggable>
                      ))}

                      {/* Line to department heads */}
                      <div className="w-0.5 h-8 bg-blue-400"></div>
                    </div>
                  )}

                  {/* Department Heads Row (Horizontal) */}
                  {departmentSections.length > 0 && (
                    <>
                      {/* Horizontal connector line */}
                      <div
                        className="h-0.5 bg-blue-400"
                        style={{
                          width: `${(departmentSections.length - 1) * 200}px`,
                        }}
                      ></div>

                      <Droppable
                        droppableId="department-heads"
                        type="department-head"
                      >
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                            className="flex gap-8"
                          >
                            {departmentSections.map((section, index) => (
                              <Draggable
                                key={section.head.id}
                                draggableId={section.head.id}
                                index={index}
                                isDragDisabled={!dragMode}
                              >
                                {(provided, snapshot) => (
                                  <div
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    className="flex flex-col items-center space-y-4"
                                  >
                                    {/* Vertical line from horizontal connector */}
                                    <div className="w-0.5 h-6 bg-blue-400"></div>

                                    {/* Department Head */}
                                    <div
                                      className={`relative ${
                                        snapshot.isDragging
                                          ? "rotate-1 shadow-2xl scale-105"
                                          : ""
                                      } transition-all duration-200`}
                                    >
                                      {dragMode && (
                                        <div
                                          {...provided.dragHandleProps}
                                          className="absolute top-1 right-1 z-10"
                                        >
                                          <Grip className="h-3 w-3 text-gray-400" />
                                        </div>
                                      )}

                                      {/* Department Head Card */}
                                      <Card className="w-44 h-32 border-2 border-gray-300 bg-gradient-to-b from-gray-50 to-white shadow-md">
                                        <CardContent className="p-3 text-center h-full flex flex-col justify-center">
                                          <div className="mb-1">
                                            <Badge
                                              variant="outline"
                                              className="text-xs mb-2"
                                            >
                                              {section.name}
                                            </Badge>
                                          </div>
                                          <div className="flex justify-center mb-2">
                                            <Avatar className="h-10 w-10 border border-gray-400">
                                              <AvatarImage
                                                src="/placeholder.svg"
                                                alt={section.head.name}
                                              />
                                              <AvatarFallback className="bg-gray-100 text-gray-700 font-semibold text-xs">
                                                {section.head.name
                                                  .split(" ")
                                                  .map((n) => n[0])
                                                  .join("")}
                                              </AvatarFallback>
                                            </Avatar>
                                          </div>
                                          <h3 className="font-semibold text-sm text-gray-800 mb-1 leading-tight">
                                            {section.head.name}
                                          </h3>
                                          <p className="text-xs text-gray-600 leading-tight">
                                            {section.head.title}
                                          </p>
                                        </CardContent>
                                      </Card>
                                    </div>

                                    {/* Department Members Grid */}
                                    {section.members.length > 0 && (
                                      <>
                                        <div className="w-0.5 h-4 bg-blue-300"></div>
                                        <div className="grid grid-cols-2 gap-3 max-w-xs">
                                          {section.members.map((member) => (
                                            <div key={member.id}>
                                              {renderPersonCard(
                                                member,
                                                "small",
                                              )}
                                            </div>
                                          ))}
                                        </div>
                                      </>
                                    )}
                                  </div>
                                )}
                              </Draggable>
                            ))}
                            {provided.placeholder}
                          </div>
                        )}
                      </Droppable>
                    </>
                  )}
                </div>
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
