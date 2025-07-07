import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  departmentService,
  type Department,
  type DepartmentInput,
} from "@/services/departmentService";
import { employeeService, type Employee } from "@/services/employeeService";
import {
  departmentIcons,
  departmentColors,
  departmentShapes,
  type DepartmentIcon,
} from "@/lib/departmentIcons";
import {
  Building,
  Plus,
  Edit,
  Trash2,
  Users,
  User,
  Save,
  X,
  Palette,
  Shapes,
  ChevronDown,
  Check,
} from "lucide-react";

interface DepartmentManagerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "add" | "edit";
  onDepartmentChange?: () => void;
}

export default function DepartmentManager({
  open,
  onOpenChange,
  mode,
  onDepartmentChange,
}: DepartmentManagerProps) {
  const { toast } = useToast();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingDept, setEditingDept] = useState<Department | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  const [formData, setFormData] = useState<DepartmentInput>({
    name: "",
    director: "",
    manager: "",
    description: "",
  });

  useEffect(() => {
    if (open) {
      loadData();
      if (mode === "add") {
        setShowAddForm(true);
        resetForm();
      }
    }
  }, [open, mode]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [deptData, empData] = await Promise.all([
        departmentService.getAllDepartments(),
        employeeService.getAllEmployees(),
      ]);
      setDepartments(deptData);
      setEmployees(empData);
    } catch (error) {
      console.error("Error loading data:", error);
      toast({
        title: "Error",
        description: "Failed to load departments",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      director: "none",
      manager: "none",
      description: "",
    });
    setEditingDept(null);
  };

  const handleInputChange = (field: keyof DepartmentInput, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast({
        title: "Error",
        description: "Department name is required",
        variant: "destructive",
      });
      return;
    }

    try {
      // Convert 'none' values to empty strings for storage
      const dataToSave = {
        ...formData,
        director: formData.director === "none" ? "" : formData.director,
        manager: formData.manager === "none" ? "" : formData.manager,
      };

      if (editingDept) {
        await departmentService.updateDepartment(editingDept.id, dataToSave);
        toast({
          title: "Success",
          description: "Department updated successfully",
        });
      } else {
        await departmentService.addDepartment(dataToSave);
        toast({
          title: "Success",
          description: "Department added successfully",
        });
      }

      resetForm();
      setShowAddForm(false);
      loadData();
      onDepartmentChange?.();
    } catch (error) {
      console.error("Error saving department:", error);
      toast({
        title: "Error",
        description: "Failed to save department",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (department: Department) => {
    setEditingDept(department);
    setFormData({
      name: department.name,
      director: department.director || "none",
      manager: department.manager || "none",
      description: department.description || "",
    });
    setShowAddForm(true);
  };

  const handleDelete = async (department: Department) => {
    const empInDept = employees.filter(
      (emp) => emp.jobDetails.department === department.name,
    );

    if (empInDept.length > 0) {
      toast({
        title: "Cannot Delete",
        description: `Cannot delete department with ${empInDept.length} employees. Move employees first.`,
        variant: "destructive",
      });
      return;
    }

    try {
      await departmentService.deleteDepartment(department.id);
      toast({
        title: "Success",
        description: "Department deleted successfully",
      });
      loadData();
      onDepartmentChange?.();
    } catch (error) {
      console.error("Error deleting department:", error);
      toast({
        title: "Error",
        description: "Failed to delete department",
        variant: "destructive",
      });
    }
  };

  const getDepartmentStats = (deptName: string) => {
    const deptEmployees = employees.filter(
      (emp) => emp.jobDetails.department === deptName,
    );
    const monthlyPayroll = deptEmployees.reduce(
      (sum, emp) => sum + emp.compensation.annualSalary / 12,
      0,
    );

    return {
      employeeCount: deptEmployees.length,
      monthlyPayroll,
      employees: deptEmployees,
    };
  };

  if (loading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-auto">
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            <span className="ml-3">Loading departments...</span>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            {mode === "add" ? "Add Department" : "Manage Departments"}
          </DialogTitle>
          <DialogDescription>
            {mode === "add"
              ? "Create a new department"
              : "Add, edit, and organize your company departments"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Add/Edit Form */}
          {showAddForm && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {editingDept ? (
                    <Edit className="h-4 w-4" />
                  ) : (
                    <Plus className="h-4 w-4" />
                  )}
                  {editingDept ? "Edit Department" : "Add New Department"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="deptName">Department Name *</Label>
                  <Input
                    id="deptName"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    placeholder="e.g., Engineering, Marketing"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="deptDirector">Director</Label>
                    <Select
                      value={formData.director}
                      onValueChange={(value) =>
                        handleInputChange("director", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select director" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No Director</SelectItem>
                        {employees
                          .filter((emp) => emp.status === "active")
                          .map((employee) => (
                            <SelectItem
                              key={employee.id}
                              value={`${employee.personalInfo.firstName} ${employee.personalInfo.lastName}`}
                            >
                              {employee.personalInfo.firstName}{" "}
                              {employee.personalInfo.lastName}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="deptManager">Manager</Label>
                    <Select
                      value={formData.manager}
                      onValueChange={(value) =>
                        handleInputChange("manager", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select manager" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No Manager</SelectItem>
                        {employees
                          .filter((emp) => emp.status === "active")
                          .map((employee) => (
                            <SelectItem
                              key={employee.id}
                              value={`${employee.personalInfo.firstName} ${employee.personalInfo.lastName}`}
                            >
                              {employee.personalInfo.firstName}{" "}
                              {employee.personalInfo.lastName}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="deptDescription">Description</Label>
                  <Textarea
                    id="deptDescription"
                    value={formData.description}
                    onChange={(e) =>
                      handleInputChange("description", e.target.value)
                    }
                    placeholder="Brief description of the department"
                    rows={3}
                  />
                </div>

                <div className="flex gap-2">
                  <Button onClick={handleSave} className="flex-1">
                    <Save className="mr-2 h-4 w-4" />
                    {editingDept ? "Update" : "Add"} Department
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowAddForm(false);
                      resetForm();
                    }}
                  >
                    <X className="mr-2 h-4 w-4" />
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Add Department Button (for edit mode) */}
          {mode === "edit" && !showAddForm && (
            <Button
              onClick={() => {
                setShowAddForm(true);
                resetForm();
              }}
              className="w-full"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add New Department
            </Button>
          )}

          {/* Existing Departments */}
          {departments.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-4">
                Current Departments ({departments.length})
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                {departments.map((department) => {
                  const stats = getDepartmentStats(department.name);
                  return (
                    <Card key={department.id}>
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="flex items-center gap-2 text-lg">
                              <Building className="h-4 w-4" />
                              {department.name}
                            </CardTitle>
                            {department.description && (
                              <CardDescription>
                                {department.description}
                              </CardDescription>
                            )}
                          </div>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(department)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(department)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {department.director && (
                          <div className="flex items-center gap-2 text-sm">
                            <User className="h-4 w-4 text-blue-500" />
                            <span className="text-muted-foreground">
                              Director:
                            </span>
                            <span className="font-medium">
                              {department.director}
                            </span>
                          </div>
                        )}
                        {department.manager && (
                          <div className="flex items-center gap-2 text-sm">
                            <User className="h-4 w-4 text-green-500" />
                            <span className="text-muted-foreground">
                              Manager:
                            </span>
                            <span className="font-medium">
                              {department.manager}
                            </span>
                          </div>
                        )}
                        <div className="flex items-center gap-2 text-sm">
                          <Users className="h-4 w-4 text-purple-500" />
                          <span className="text-muted-foreground">Staff:</span>
                          <Badge variant="secondary">
                            {stats.employeeCount}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Users className="h-4 w-4 text-orange-500" />
                          <span className="text-muted-foreground">
                            Monthly Payroll:
                          </span>
                          <span className="font-medium">
                            {new Intl.NumberFormat("en-US", {
                              style: "currency",
                              currency: "USD",
                            }).format(stats.monthlyPayroll)}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {departments.length === 0 && (
            <div className="text-center py-8">
              <Building className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-semibold mb-2">No Departments</h3>
              <p className="text-muted-foreground mb-4">
                Create your first department to get started
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
