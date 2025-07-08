import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import MainNavigation from "@/components/layout/MainNavigation";
import {
  Calendar,
  Plus,
  Filter,
  Download,
  Clock,
  User,
  Building,
  CheckCircle,
  Edit,
  Trash2,
} from "lucide-react";

export default function ShiftScheduling() {
  const { toast } = useToast();
  const [selectedWeek, setSelectedWeek] = useState(getWeekString(new Date()));
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedShift, setSelectedShift] = useState<any>(null);

  const [formData, setFormData] = useState({
    employee: "",
    role: "",
    date: "",
    startTime: "",
    endTime: "",
    department: "",
  });

  // Helper function to get week string
  function getWeekString(date: Date) {
    const startOfWeek = new Date(date);
    startOfWeek.setDate(date.getDate() - date.getDay()); // Start on Sunday
    return startOfWeek.toISOString().split("T")[0];
  }

  // Data (will come from respective services)
  const departments: { id: string; name: string }[] = [];
  const employees: { id: string; name: string; department: string }[] = [];
  const shifts: {
    id: number;
    employeeId: string;
    employeeName: string;
    role: string;
    department: string;
    date: string;
    startTime: string;
    endTime: string;
    published: boolean;
  }[] = [];

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const resetForm = () => {
    setFormData({
      employee: "",
      role: "",
      date: "",
      startTime: "",
      endTime: "",
      department: "",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.employee ||
      !formData.role ||
      !formData.date ||
      !formData.startTime ||
      !formData.endTime ||
      !formData.department
    ) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log("Creating shift:", formData);

      toast({
        title: "Success",
        description: "Shift created successfully.",
      });

      resetForm();
      setShowCreateDialog(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create shift. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleEditShift = (shift: any) => {
    setSelectedShift(shift);
    setFormData({
      employee: shift.employeeId,
      role: shift.role,
      date: shift.date,
      startTime: shift.startTime,
      endTime: shift.endTime,
      department: shift.department,
    });
    setShowEditDialog(true);
  };

  const handleUpdateShift = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      console.log("Updating shift:", { id: selectedShift.id, ...formData });

      toast({
        title: "Success",
        description: "Shift updated successfully.",
      });

      resetForm();
      setShowEditDialog(false);
      setSelectedShift(null);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update shift. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteShift = async (shiftId: number) => {
    try {
      console.log("Deleting shift:", shiftId);

      toast({
        title: "Success",
        description: "Shift deleted successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete shift. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleLoad = () => {
    console.log(
      "Loading shifts for week:",
      selectedWeek,
      "department:",
      selectedDepartment,
    );
    toast({
      title: "Schedule Loaded",
      description: `Loaded shifts for week of ${selectedWeek}`,
    });
  };

  const handlePublishSchedule = () => {
    const weekShifts = getWeekShifts();
    console.log(
      "Publishing schedule for week:",
      selectedWeek,
      "shifts count:",
      weekShifts.length,
    );

    toast({
      title: "Schedule Published",
      description: `Published ${weekShifts.length} shifts for the week.`,
    });
  };

  const handleExportPDF = () => {
    const weekShifts = getWeekShifts();
    console.log("Exporting PDF for week:", selectedWeek);

    toast({
      title: "Export Started",
      description: "PDF roster will be downloaded shortly.",
    });
  };

  const getWeekShifts = () => {
    const weekStart = new Date(selectedWeek);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);

    return shifts.filter((shift) => {
      const shiftDate = new Date(shift.date);
      const matchesWeek = shiftDate >= weekStart && shiftDate <= weekEnd;
      const matchesDepartment =
        !selectedDepartment ||
        selectedDepartment === "all" ||
        shift.department ===
          departments.find((d) => d.id === selectedDepartment)?.name;
      return matchesWeek && matchesDepartment;
    });
  };

  const getDayShifts = (dayOffset: number) => {
    const weekStart = new Date(selectedWeek);
    const targetDate = new Date(weekStart);
    targetDate.setDate(weekStart.getDate() + dayOffset);
    const dateString = targetDate.toISOString().split("T")[0];

    return getWeekShifts().filter((shift) => shift.date === dateString);
  };

  const getDayName = (dayOffset: number) => {
    const weekStart = new Date(selectedWeek);
    const targetDate = new Date(weekStart);
    targetDate.setDate(weekStart.getDate() + dayOffset);
    return targetDate.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  const weekShifts = getWeekShifts();
  const publishedCount = weekShifts.filter((shift) => shift.published).length;
  const unpublishedCount = weekShifts.length - publishedCount;

  return (
    <div className="min-h-screen bg-gray-50">
      <MainNavigation />

      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Shift Scheduling
            </h1>
            <p className="text-gray-600">
              Manage employee shifts and weekly schedules
            </p>
          </div>

          {/* Controls */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Schedule Controls
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                <div>
                  <Label htmlFor="week">Week Starting</Label>
                  <Input
                    id="week"
                    type="date"
                    value={selectedWeek}
                    onChange={(e) => setSelectedWeek(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="department">Department</Label>
                  <Select
                    value={selectedDepartment}
                    onValueChange={setSelectedDepartment}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All departments" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All departments</SelectItem>
                      {departments.map((dept) => (
                        <SelectItem key={dept.id} value={dept.id}>
                          {dept.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Button onClick={handleLoad} className="w-full">
                    <Calendar className="h-4 w-4 mr-2" />
                    Load
                  </Button>
                </div>
                <div>
                  <Dialog
                    open={showCreateDialog}
                    onOpenChange={setShowCreateDialog}
                  >
                    <DialogTrigger asChild>
                      <Button className="w-full">
                        <Plus className="h-4 w-4 mr-2" />
                        Create Shift
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle>Create Shift</DialogTitle>
                        <DialogDescription>
                          Add a new shift to the schedule
                        </DialogDescription>
                      </DialogHeader>
                      <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                          <Label htmlFor="employee">Employee *</Label>
                          <Select
                            value={formData.employee}
                            onValueChange={(value) =>
                              handleInputChange("employee", value)
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select employee" />
                            </SelectTrigger>
                            <SelectContent>
                              {employees.map((employee) => (
                                <SelectItem
                                  key={employee.id}
                                  value={employee.id}
                                >
                                  {employee.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="role">Role *</Label>
                          <Input
                            id="role"
                            value={formData.role}
                            onChange={(e) =>
                              handleInputChange("role", e.target.value)
                            }
                            placeholder="Enter role/position"
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="shift-date">Date *</Label>
                          <Input
                            id="shift-date"
                            type="date"
                            value={formData.date}
                            onChange={(e) =>
                              handleInputChange("date", e.target.value)
                            }
                            required
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <Label htmlFor="shift-start">Start Time *</Label>
                            <Input
                              id="shift-start"
                              type="time"
                              value={formData.startTime}
                              onChange={(e) =>
                                handleInputChange("startTime", e.target.value)
                              }
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="shift-end">End Time *</Label>
                            <Input
                              id="shift-end"
                              type="time"
                              value={formData.endTime}
                              onChange={(e) =>
                                handleInputChange("endTime", e.target.value)
                              }
                              required
                            />
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="dept">Department *</Label>
                          <Select
                            value={formData.department}
                            onValueChange={(value) =>
                              handleInputChange("department", value)
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select department" />
                            </SelectTrigger>
                            <SelectContent>
                              {departments.map((dept) => (
                                <SelectItem key={dept.id} value={dept.name}>
                                  {dept.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                              resetForm();
                              setShowCreateDialog(false);
                            }}
                            className="flex-1"
                          >
                            Cancel
                          </Button>
                          <Button type="submit" className="flex-1">
                            Create Shift
                          </Button>
                        </div>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Schedule Summary & Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Total Shifts
                    </p>
                    <p className="text-2xl font-bold">{weekShifts.length}</p>
                  </div>
                  <Clock className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Published
                    </p>
                    <p className="text-2xl font-bold text-green-600">
                      {publishedCount}
                    </p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Pending</p>
                    <p className="text-2xl font-bold text-yellow-600">
                      {unpublishedCount}
                    </p>
                  </div>
                  <Clock className="h-8 w-8 text-yellow-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 mb-6">
            <Button
              onClick={handlePublishSchedule}
              disabled={unpublishedCount === 0}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Publish Schedule
            </Button>
            <Button variant="outline" onClick={handleExportPDF}>
              <Download className="h-4 w-4 mr-2" />
              Export PDF
            </Button>
          </div>

          {/* Calendar Grid */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Weekly Schedule
              </CardTitle>
              <CardDescription>
                Week of {getDayName(0)} - {getDayName(6)}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-4">
                {[0, 1, 2, 3, 4, 5, 6].map((dayOffset) => {
                  const dayShifts = getDayShifts(dayOffset);
                  return (
                    <div
                      key={dayOffset}
                      className="border rounded-lg p-3 min-h-[200px]"
                    >
                      <h4 className="font-medium text-sm mb-3 text-center border-b pb-2">
                        {getDayName(dayOffset)}
                      </h4>
                      <div className="space-y-2">
                        {dayShifts.map((shift) => (
                          <div
                            key={shift.id}
                            className={`p-2 rounded text-xs cursor-pointer transition-colors ${
                              shift.published
                                ? "bg-blue-100 border border-blue-200 hover:bg-blue-150"
                                : "bg-yellow-100 border border-yellow-200 hover:bg-yellow-150"
                            }`}
                            onClick={() => handleEditShift(shift)}
                          >
                            <div className="font-medium truncate">
                              {shift.employeeName}
                            </div>
                            <div className="text-gray-600 truncate">
                              {shift.role}
                            </div>
                            <div className="text-gray-500">
                              {shift.startTime} - {shift.endTime}
                            </div>
                            {!shift.published && (
                              <Badge variant="outline" className="text-xs mt-1">
                                Draft
                              </Badge>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Edit Shift Dialog */}
          <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Edit Shift</DialogTitle>
                <DialogDescription>
                  Modify shift details or delete the shift
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleUpdateShift} className="space-y-4">
                <div>
                  <Label htmlFor="edit-employee">Employee *</Label>
                  <Select
                    value={formData.employee}
                    onValueChange={(value) =>
                      handleInputChange("employee", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select employee" />
                    </SelectTrigger>
                    <SelectContent>
                      {employees.map((employee) => (
                        <SelectItem key={employee.id} value={employee.id}>
                          {employee.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="edit-role">Role *</Label>
                  <Input
                    id="edit-role"
                    value={formData.role}
                    onChange={(e) => handleInputChange("role", e.target.value)}
                    placeholder="Enter role/position"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="edit-date">Date *</Label>
                  <Input
                    id="edit-date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => handleInputChange("date", e.target.value)}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label htmlFor="edit-start">Start Time *</Label>
                    <Input
                      id="edit-start"
                      type="time"
                      value={formData.startTime}
                      onChange={(e) =>
                        handleInputChange("startTime", e.target.value)
                      }
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-end">End Time *</Label>
                    <Input
                      id="edit-end"
                      type="time"
                      value={formData.endTime}
                      onChange={(e) =>
                        handleInputChange("endTime", e.target.value)
                      }
                      required
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="edit-dept">Department *</Label>
                  <Select
                    value={formData.department}
                    onValueChange={(value) =>
                      handleInputChange("department", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map((dept) => (
                        <SelectItem key={dept.id} value={dept.name}>
                          {dept.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-2">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        type="button"
                        variant="destructive"
                        className="flex-1"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Shift</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete this shift? This
                          action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => {
                            handleDeleteShift(selectedShift?.id);
                            setShowEditDialog(false);
                            setSelectedShift(null);
                            resetForm();
                          }}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      resetForm();
                      setShowEditDialog(false);
                      setSelectedShift(null);
                    }}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button type="submit" className="flex-1">
                    <Edit className="h-4 w-4 mr-2" />
                    Update
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
}
