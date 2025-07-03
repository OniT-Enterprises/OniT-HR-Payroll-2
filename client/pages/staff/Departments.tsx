import React, { useState } from "react";
import { Button } from "@/components/ui/button";
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
import { useToast } from "@/hooks/use-toast";
import MainNavigation from "@/components/layout/MainNavigation";
import { Building, Plus, Edit, Trash2, Users } from "lucide-react";

export default function Departments() {
  const { toast } = useToast();
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingDept, setEditingDept] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    manager: "",
    description: "",
  });

  // Mock departments data
  const [departments, setDepartments] = useState([
    {
      id: "1",
      name: "Engineering",
      manager: "Sarah Johnson",
      managerId: "1",
      employeeCount: 15,
      description: "Software development and technical infrastructure",
    },
    {
      id: "2",
      name: "Marketing",
      manager: "Michael Chen",
      managerId: "2",
      employeeCount: 8,
      description: "Brand marketing and customer acquisition",
    },
    {
      id: "3",
      name: "Human Resources",
      manager: "Emily Rodriguez",
      managerId: "3",
      employeeCount: 4,
      description: "People operations and talent management",
    },
    {
      id: "4",
      name: "Sales",
      manager: "James Miller",
      managerId: "4",
      employeeCount: 12,
      description: "Revenue generation and customer relationships",
    },
    {
      id: "5",
      name: "Finance",
      manager: "Jennifer Brown",
      managerId: "5",
      employeeCount: 6,
      description: "Financial planning and accounting operations",
    },
    {
      id: "6",
      name: "Design",
      manager: "Lisa Thompson",
      managerId: "6",
      employeeCount: 5,
      description: "User experience and visual design",
    },
  ]);

  // Mock managers data
  const managers = [
    { id: "1", name: "Sarah Johnson" },
    { id: "2", name: "Michael Chen" },
    { id: "3", name: "Emily Rodriguez" },
    { id: "4", name: "James Miller" },
    { id: "5", name: "Jennifer Brown" },
    { id: "6", name: "Lisa Thompson" },
    { id: "7", name: "David Wilson" },
    { id: "8", name: "Maria Garcia" },
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Department name is required.",
        variant: "destructive",
      });
      return;
    }

    try {
      const managerName =
        managers.find((m) => m.id === formData.manager)?.name || "";

      if (editingDept) {
        // Update existing department
        setDepartments((prev) =>
          prev.map((dept) =>
            dept.id === editingDept.id
              ? {
                  ...dept,
                  name: formData.name,
                  manager: managerName,
                  managerId: formData.manager,
                  description: formData.description,
                }
              : dept,
          ),
        );
        toast({
          title: "Success",
          description: "Department updated successfully!",
        });
      } else {
        // Add new department
        const newDept = {
          id: Date.now().toString(),
          name: formData.name,
          manager: managerName,
          managerId: formData.manager,
          employeeCount: 0,
          description: formData.description,
        };
        setDepartments((prev) => [...prev, newDept]);
        toast({
          title: "Success",
          description: "Department added successfully!",
        });
      }

      // Reset form and close modal
      setFormData({ name: "", manager: "", description: "" });
      setShowAddModal(false);
      setEditingDept(null);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save department. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (department: any) => {
    setEditingDept(department);
    setFormData({
      name: department.name,
      manager: department.managerId,
      description: department.description,
    });
    setShowAddModal(true);
  };

  const handleDelete = (departmentId: string) => {
    if (window.confirm("Are you sure you want to delete this department?")) {
      setDepartments((prev) => prev.filter((dept) => dept.id !== departmentId));
      toast({
        title: "Success",
        description: "Department deleted successfully!",
      });
    }
  };

  const closeModal = () => {
    setShowAddModal(false);
    setEditingDept(null);
    setFormData({ name: "", manager: "", description: "" });
  };

  return (
    <div className="min-h-screen bg-background">
      <MainNavigation />

      <div className="p-6">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Building className="h-8 w-8 text-purple-400" />
            <div>
              <h2 className="text-3xl font-bold">Departments & Teams</h2>
              <p className="text-muted-foreground">
                Manage organizational structure and team leadership
              </p>
            </div>
          </div>
          <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Department
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingDept ? "Edit Department" : "Add Department"}
                </DialogTitle>
                <DialogDescription>
                  {editingDept
                    ? "Update department information"
                    : "Create a new department in your organization"}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Department Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    placeholder="Enter department name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="manager">Department Manager</Label>
                  <Select
                    value={formData.manager}
                    onValueChange={(value) =>
                      handleInputChange("manager", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a manager" />
                    </SelectTrigger>
                    <SelectContent>
                      {managers.map((manager) => (
                        <SelectItem key={manager.id} value={manager.id}>
                          {manager.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      handleInputChange("description", e.target.value)
                    }
                    placeholder="Brief description of the department"
                    rows={3}
                  />
                </div>
                <div className="flex justify-end gap-3">
                  <Button type="button" variant="outline" onClick={closeModal}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingDept ? "Update" : "Create"} Department
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Departments Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {departments.map((department) => (
            <Card
              key={department.id}
              className="hover:shadow-md transition-shadow"
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-xl">{department.name}</CardTitle>
                    <CardDescription className="mt-2">
                      {department.description}
                    </CardDescription>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(department)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(department.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    <strong>{department.employeeCount}</strong> employees
                  </span>
                </div>
                {department.manager && (
                  <div>
                    <div className="text-sm font-medium">
                      Department Manager
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {department.manager}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {departments.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <Building className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No Departments</h3>
              <p className="text-muted-foreground mb-4">
                Get started by creating your first department
              </p>
              <Button onClick={() => setShowAddModal(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Department
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
