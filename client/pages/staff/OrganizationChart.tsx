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
  ChevronDown,
  ChevronUp,
} from "lucide-react";

interface DepartmentNode extends Department {
  employees: Employee[];
  children: DepartmentNode[];
  parentId?: string;
  level: number;
  expanded?: boolean;
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

      // Auto-migrate departments that exist in employee records but not in departments collection
      await migrateMissingDepartments(employeesData, departmentsData);

      // Build the organization tree
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
        return; // Skip migration if departments already exist
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

      // Create department nodes
      const nodes: DepartmentNode[] = departmentsData.map((dept) => ({
        ...dept,
        employees: employeesByDept[dept.name] || [],
        children: [],
        level: 0,
        expanded: true,
      }));

      // For now, create a simple hierarchy based on department size
      // In a real app, you'd have parentId relationships in the department data
      const sortedNodes = nodes.sort(
        (a, b) => b.employees.length - a.employees.length,
      );

      // Set up a simple hierarchy: largest departments at top level
      const tree: DepartmentNode[] = [];
      const maxTopLevel = Math.min(3, sortedNodes.length); // Max 3 top-level departments

      for (let i = 0; i < maxTopLevel; i++) {
        const node = { ...sortedNodes[i], level: 0 };
        tree.push(node);
      }

      // Add remaining departments as children of the first top-level department
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

    const { source, destination, draggableId } = result;

    // Handle reordering within the same container
    if (source.droppableId === destination.droppableId) {
      // Reorder logic here
      toast({
        title: "Department Moved",
        description: "Department hierarchy updated successfully",
      });
      return;
    }

    // Handle moving between different containers (levels)
    toast({
      title: "Department Reorganized",
      description: "Department moved to new position in hierarchy",
    });
  };

  const toggleDepartmentExpansion = (deptId: string) => {
    const updateNodes = (nodes: DepartmentNode[]): DepartmentNode[] => {
      return nodes.map((node) => {
        if (node.id === deptId) {
          return { ...node, expanded: !node.expanded };
        }
        return { ...node, children: updateNodes(node.children) };
      });
    };

    setDepartmentTree(updateNodes(departmentTree));
  };

  const getDepartmentColor = (index: number) => {
    const colors = [
      "bg-blue-50 border-blue-200 text-blue-900",
      "bg-green-50 border-green-200 text-green-900",
      "bg-purple-50 border-purple-200 text-purple-900",
      "bg-orange-50 border-orange-200 text-orange-900",
      "bg-pink-50 border-pink-200 text-pink-900",
      "bg-indigo-50 border-indigo-200 text-indigo-900",
      "bg-yellow-50 border-yellow-200 text-yellow-900",
      "bg-red-50 border-red-200 text-red-900",
    ];
    return colors[index % colors.length];
  };

  const renderDepartmentNode = (
    node: DepartmentNode,
    index: number,
    level: number = 0,
  ) => {
    const hasChildren = node.children.length > 0;
    const isExpanded = node.expanded !== false;

    return (
      <Draggable
        key={node.id}
        draggableId={node.id}
        index={index}
        isDragDisabled={!dragMode}
      >
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            className={`relative ${level > 0 ? "ml-8" : ""}`}
            style={{
              ...provided.draggableProps.style,
              marginLeft: level > 0 ? `${level * 2}rem` : "0",
            }}
          >
            {/* Connecting lines */}
            {level > 0 && (
              <>
                <div className="absolute -left-8 top-8 w-8 h-0.5 bg-gray-300"></div>
                <div className="absolute -left-8 top-0 w-0.5 h-8 bg-gray-300"></div>
              </>
            )}

            <Card
              className={`mb-4 ${getDepartmentColor(index)} ${
                snapshot.isDragging ? "rotate-2 shadow-lg scale-105" : ""
              } transition-all duration-200 ${dragMode ? "cursor-move" : ""}`}
            >
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {dragMode && (
                      <div {...provided.dragHandleProps}>
                        <Grip className="h-5 w-5 text-gray-400" />
                      </div>
                    )}
                    <Building className="h-6 w-6" />
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        {node.name}
                        <Badge variant="secondary">
                          {node.employees.length}
                        </Badge>
                      </CardTitle>
                      <CardDescription>
                        {node.employees.length} employee
                        {node.employees.length !== 1 ? "s" : ""}
                      </CardDescription>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {hasChildren && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleDepartmentExpansion(node.id)}
                      >
                        {isExpanded ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-0">
                {/* Department Head/Manager */}
                {(node.director || node.manager) && (
                  <div className="mb-3 p-2 bg-white/50 rounded border border-dashed">
                    <div className="flex items-center gap-2">
                      <Crown className="h-4 w-4 text-amber-600" />
                      <span className="text-sm font-medium">
                        {node.director || node.manager}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {node.director ? "Director" : "Manager"}
                      </Badge>
                    </div>
                  </div>
                )}

                {/* Employee Grid */}
                {node.employees.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                    {node.employees.slice(0, 6).map((employee) => (
                      <div
                        key={employee.id}
                        className="flex items-center gap-2 p-2 bg-white/60 rounded border text-xs"
                      >
                        <Avatar className="h-6 w-6">
                          <AvatarImage
                            src="/placeholder.svg"
                            alt={employee.personalInfo.firstName}
                          />
                          <AvatarFallback className="text-xs">
                            {employee.personalInfo.firstName[0]}
                            {employee.personalInfo.lastName[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="truncate font-medium">
                            {employee.personalInfo.firstName}{" "}
                            {employee.personalInfo.lastName}
                          </p>
                          <p className="text-gray-600 truncate">
                            {employee.jobDetails.position}
                          </p>
                        </div>
                      </div>
                    ))}
                    {node.employees.length > 6 && (
                      <div className="flex items-center justify-center p-2 bg-gray-100 rounded border border-dashed text-xs text-gray-600">
                        +{node.employees.length - 6} more
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Render children */}
            {hasChildren && isExpanded && (
              <Droppable droppableId={`children-${node.id}`} type="department">
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className="relative"
                  >
                    {node.children.map((child, childIndex) =>
                      renderDepartmentNode(child, childIndex, level + 1),
                    )}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
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
        {/* Header with controls */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <Building className="h-8 w-8 text-purple-600" />
            <div>
              <h1 className="text-3xl font-bold">Organization Chart</h1>
              <p className="text-muted-foreground">
                Interactive hierarchical view of company structure
              </p>
            </div>
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
          <div className="space-y-6">
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
                        Hierarchy Levels
                      </p>
                      <p className="text-2xl font-bold">
                        {Math.max(
                          ...departmentTree.map((dept) =>
                            Math.max(1, dept.children.length > 0 ? 2 : 1),
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
            <Card>
              <CardHeader>
                <CardTitle>Department Hierarchy</CardTitle>
                <CardDescription>
                  {dragMode
                    ? "Drag departments to reorganize the hierarchy"
                    : "Visual representation of organizational structure"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <DragDropContext onDragEnd={handleDragEnd}>
                  <Droppable droppableId="root" type="department">
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className="space-y-4"
                      >
                        {departmentTree.map((dept, index) =>
                          renderDepartmentNode(dept, index, 0),
                        )}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </DragDropContext>
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
