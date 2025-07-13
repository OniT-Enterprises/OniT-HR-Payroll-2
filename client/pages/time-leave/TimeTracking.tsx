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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import MainNavigation from "@/components/layout/MainNavigation";
import {
  Calendar,
  Filter,
  Plus,
  Download,
  Clock,
  User,
  Target,
  Users,
  CheckSquare,
  BarChart3,
  TrendingUp,
  AlertCircle,
  ChevronRight,
  Edit,
  Trash2,
  UserPlus,
  PlayCircle,
  PauseCircle,
  CheckCircle,
  XCircle,
  Bell,
  MessageSquare,
  FileText,
  Award,
  Calendar as CalendarIcon,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
} from "lucide-react";

// Types for our task management system
interface Goal {
  id: string;
  title: string;
  description: string;
  department: string;
  priority: "high" | "medium" | "low";
  status: "active" | "completed" | "paused";
  progress: number;
  startDate: string;
  endDate: string;
  createdBy: string;
  assignedTeams: string[];
}

interface Team {
  id: string;
  name: string;
  department: string;
  leader: string;
  members: string[];
  invitedMembers: {
    id: string;
    name: string;
    department: string;
    status: "pending" | "accepted" | "declined";
  }[];
  goals: string[];
  activeJobs: number;
}

interface Job {
  id: string;
  title: string;
  description: string;
  teamId: string;
  goalId?: string;
  priority: "high" | "medium" | "low";
  status: "planning" | "active" | "completed" | "paused";
  progress: number;
  startDate: string;
  endDate: string;
  tasks: string[];
}

interface Task {
  id: string;
  title: string;
  description: string;
  assigneeId: string;
  jobId?: string;
  priority: "high" | "medium" | "low";
  status: "todo" | "inprogress" | "review" | "completed";
  startDate: string;
  dueDate: string;
  estimatedHours: number;
  actualHours?: number;
  tags: string[];
}

export default function TimeTracking() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [dialogType, setDialogType] = useState<
    "goal" | "team" | "job" | "task" | "timeEntry"
  >("timeEntry");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const [formData, setFormData] = useState({
    employee: "",
    date: "",
    project: "",
    startTime: "",
    endTime: "",
  });

  const [goalFormData, setGoalFormData] = useState({
    title: "",
    description: "",
    department: "",
    priority: "medium" as const,
    startDate: "",
    endDate: "",
  });

  const [teamFormData, setTeamFormData] = useState({
    name: "",
    department: "",
    leader: "",
    members: [] as string[],
  });

  const [jobFormData, setJobFormData] = useState({
    title: "",
    description: "",
    teamId: "",
    goalId: "",
    priority: "medium" as const,
    startDate: "",
    endDate: "",
  });

  const [taskFormData, setTaskFormData] = useState({
    title: "",
    description: "",
    assigneeId: "",
    jobId: "",
    priority: "medium" as const,
    startDate: "",
    dueDate: "",
    estimatedHours: 0,
    tags: [] as string[],
  });

  // Mock data - in production, these would come from Firebase services
  const employees: {
    id: string;
    name: string;
    department: string;
    role: string;
  }[] = [
    {
      id: "1",
      name: "John Smith",
      department: "Engineering",
      role: "Director",
    },
    {
      id: "2",
      name: "Sarah Johnson",
      department: "Marketing",
      role: "Manager",
    },
    {
      id: "3",
      name: "Mike Davis",
      department: "Engineering",
      role: "Senior Developer",
    },
    { id: "4", name: "Emily Brown", department: "Sales", role: "Manager" },
    {
      id: "5",
      name: "Alex Wilson",
      department: "Engineering",
      role: "Developer",
    },
  ];

  const departments = ["Engineering", "Marketing", "Sales", "HR", "Finance"];

  const goals: Goal[] = [
    {
      id: "1",
      title: "Q4 Product Launch",
      description: "Launch new mobile application with core features",
      department: "Engineering",
      priority: "high",
      status: "active",
      progress: 65,
      startDate: "2024-10-01",
      endDate: "2024-12-31",
      createdBy: "1",
      assignedTeams: ["1", "2"],
    },
    {
      id: "2",
      title: "Customer Acquisition Campaign",
      description: "Increase customer base by 30% through targeted marketing",
      department: "Marketing",
      priority: "high",
      status: "active",
      progress: 40,
      startDate: "2024-11-01",
      endDate: "2024-12-15",
      createdBy: "2",
      assignedTeams: ["3"],
    },
  ];

  const teams: Team[] = [
    {
      id: "1",
      name: "Mobile Development Team",
      department: "Engineering",
      leader: "1",
      members: ["1", "3", "5"],
      invitedMembers: [
        {
          id: "2",
          name: "Sarah Johnson",
          department: "Marketing",
          status: "pending",
        },
      ],
      goals: ["1"],
      activeJobs: 3,
    },
    {
      id: "2",
      name: "Backend Team",
      department: "Engineering",
      leader: "3",
      members: ["3", "5"],
      invitedMembers: [],
      goals: ["1"],
      activeJobs: 2,
    },
    {
      id: "3",
      name: "Growth Marketing Team",
      department: "Marketing",
      leader: "2",
      members: ["2"],
      invitedMembers: [],
      goals: ["2"],
      activeJobs: 4,
    },
  ];

  const jobs: Job[] = [
    {
      id: "1",
      title: "Mobile App UI Development",
      description: "Develop user interface for mobile application",
      teamId: "1",
      goalId: "1",
      priority: "high",
      status: "active",
      progress: 70,
      startDate: "2024-10-15",
      endDate: "2024-11-30",
      tasks: ["1", "2"],
    },
    {
      id: "2",
      title: "API Integration",
      description: "Integrate backend APIs with mobile app",
      teamId: "2",
      goalId: "1",
      priority: "high",
      status: "active",
      progress: 45,
      startDate: "2024-10-20",
      endDate: "2024-12-01",
      tasks: ["3", "4"],
    },
  ];

  const tasks: Task[] = [
    {
      id: "1",
      title: "Design login screen",
      description: "Create responsive login screen with validation",
      assigneeId: "5",
      jobId: "1",
      priority: "high",
      status: "completed",
      startDate: "2024-10-15",
      dueDate: "2024-10-20",
      estimatedHours: 16,
      actualHours: 14,
      tags: ["UI", "Authentication"],
    },
    {
      id: "2",
      title: "Implement navigation",
      description: "Set up app navigation structure",
      assigneeId: "3",
      jobId: "1",
      priority: "medium",
      status: "inprogress",
      startDate: "2024-10-18",
      dueDate: "2024-10-25",
      estimatedHours: 12,
      tags: ["Navigation", "UI"],
    },
    {
      id: "3",
      title: "Setup authentication API",
      description: "Implement user authentication endpoints",
      assigneeId: "3",
      jobId: "2",
      priority: "high",
      status: "review",
      startDate: "2024-10-20",
      dueDate: "2024-10-27",
      estimatedHours: 20,
      tags: ["API", "Authentication"],
    },
  ];

  const timeEntries: {
    id: number;
    employeeId: string;
    employeeName: string;
    date: string;
    project: string;
    startTime: string;
    endTime: string;
    totalHours: number;
    status: string;
    taskId?: string;
  }[] = [
    {
      id: 1,
      employeeId: "5",
      employeeName: "Alex Wilson",
      date: "2024-10-20",
      project: "Login Screen Design",
      startTime: "09:00",
      endTime: "17:00",
      totalHours: 8,
      status: "Approved",
      taskId: "1",
    },
    {
      id: 2,
      employeeId: "3",
      employeeName: "Mike Davis",
      date: "2024-10-21",
      project: "Navigation Implementation",
      startTime: "09:30",
      endTime: "17:30",
      totalHours: 8,
      status: "Pending",
      taskId: "2",
    },
  ];

  const getStatusBadge = (
    status: string,
    type: "time" | "task" | "job" | "goal" = "time",
  ) => {
    const statusConfig = {
      time: {
        Approved: "bg-green-100 text-green-800",
        Pending: "bg-yellow-100 text-yellow-800",
        Rejected: "bg-red-100 text-red-800",
      },
      task: {
        todo: "bg-gray-100 text-gray-800",
        inprogress: "bg-blue-100 text-blue-800",
        review: "bg-purple-100 text-purple-800",
        completed: "bg-green-100 text-green-800",
      },
      job: {
        planning: "bg-gray-100 text-gray-800",
        active: "bg-blue-100 text-blue-800",
        completed: "bg-green-100 text-green-800",
        paused: "bg-yellow-100 text-yellow-800",
      },
      goal: {
        active: "bg-blue-100 text-blue-800",
        completed: "bg-green-100 text-green-800",
        paused: "bg-yellow-100 text-yellow-800",
      },
    };

    const config = statusConfig[type];
    const className = config[status as keyof typeof config];
    return (
      <Badge className={className || "bg-gray-100 text-gray-800"}>
        {status}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: "high" | "medium" | "low") => {
    const priorityConfig = {
      high: "bg-red-100 text-red-800",
      medium: "bg-yellow-100 text-yellow-800",
      low: "bg-green-100 text-green-800",
    };
    return <Badge className={priorityConfig[priority]}>{priority}</Badge>;
  };

  const calculateTotalHours = (startTime: string, endTime: string) => {
    if (!startTime || !endTime) return 0;
    const start = new Date(`2000-01-01 ${startTime}`);
    const end = new Date(`2000-01-01 ${endTime}`);
    const diff = end.getTime() - start.getTime();
    return Math.round((diff / (1000 * 60 * 60)) * 100) / 100;
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => {
      const updated = { ...prev, [field]: value };

      // Auto-calculate total hours when start/end time changes
      if (field === "startTime" || field === "endTime") {
        const totalHours = calculateTotalHours(
          field === "startTime" ? value : updated.startTime,
          field === "endTime" ? value : updated.endTime,
        );
        // You could store totalHours in state if needed
      }

      return updated;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (dialogType === "timeEntry") {
        if (
          !formData.employee ||
          !formData.date ||
          !formData.project ||
          !formData.startTime ||
          !formData.endTime
        ) {
          toast({
            title: "Validation Error",
            description: "Please fill in all required fields.",
            variant: "destructive",
          });
          return;
        }

        console.log("Creating time entry:", formData);
        toast({
          title: "Success",
          description: "Time entry added successfully.",
        });

        setFormData({
          employee: "",
          date: "",
          project: "",
          startTime: "",
          endTime: "",
        });
      } else if (dialogType === "goal") {
        if (
          !goalFormData.title ||
          !goalFormData.department ||
          !goalFormData.startDate ||
          !goalFormData.endDate
        ) {
          toast({
            title: "Validation Error",
            description: "Please fill in all required fields.",
            variant: "destructive",
          });
          return;
        }
        console.log("Creating goal:", goalFormData);
        toast({
          title: "Success",
          description: "Department goal created successfully.",
        });
        setGoalFormData({
          title: "",
          description: "",
          department: "",
          priority: "medium",
          startDate: "",
          endDate: "",
        });
      } else if (dialogType === "team") {
        if (
          !teamFormData.name ||
          !teamFormData.department ||
          !teamFormData.leader
        ) {
          toast({
            title: "Validation Error",
            description: "Please fill in all required fields.",
            variant: "destructive",
          });
          return;
        }
        console.log("Creating team:", teamFormData);
        toast({ title: "Success", description: "Team created successfully." });
        setTeamFormData({ name: "", department: "", leader: "", members: [] });
      } else if (dialogType === "job") {
        if (
          !jobFormData.title ||
          !jobFormData.teamId ||
          !jobFormData.startDate ||
          !jobFormData.endDate
        ) {
          toast({
            title: "Validation Error",
            description: "Please fill in all required fields.",
            variant: "destructive",
          });
          return;
        }
        console.log("Creating job:", jobFormData);
        toast({ title: "Success", description: "Job created successfully." });
        setJobFormData({
          title: "",
          description: "",
          teamId: "",
          goalId: "",
          priority: "medium",
          startDate: "",
          endDate: "",
        });
      } else if (dialogType === "task") {
        if (
          !taskFormData.title ||
          !taskFormData.assigneeId ||
          !taskFormData.dueDate
        ) {
          toast({
            title: "Validation Error",
            description: "Please fill in all required fields.",
            variant: "destructive",
          });
          return;
        }
        console.log("Creating task:", taskFormData);
        toast({ title: "Success", description: "Task assigned successfully." });
        setTaskFormData({
          title: "",
          description: "",
          assigneeId: "",
          jobId: "",
          priority: "medium",
          startDate: "",
          dueDate: "",
          estimatedHours: 0,
          tags: [],
        });
      }

      setShowAddDialog(false);
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to create ${dialogType}. Please try again.`,
        variant: "destructive",
      });
    }
  };

  const openDialog = (type: typeof dialogType) => {
    setDialogType(type);
    setShowAddDialog(true);
  };

  const getDashboardStats = () => {
    return {
      totalGoals: goals.length,
      activeGoals: goals.filter((g) => g.status === "active").length,
      totalTeams: teams.length,
      totalJobs: jobs.length,
      activeJobs: jobs.filter((j) => j.status === "active").length,
      totalTasks: tasks.length,
      completedTasks: tasks.filter((t) => t.status === "completed").length,
      overdueTasks: tasks.filter(
        (t) => new Date(t.dueDate) < new Date() && t.status !== "completed",
      ).length,
      totalHours: timeEntries.reduce((sum, entry) => sum + entry.totalHours, 0),
    };
  };

  const stats = getDashboardStats();

  // Notification system
  const notifications = [
    {
      id: 1,
      type: "invite",
      message: "Sarah Johnson invited you to join Growth Marketing Team",
      time: "2h ago",
      read: false,
    },
    {
      id: 2,
      type: "deadline",
      message: 'Task "Setup authentication API" is due tomorrow',
      time: "4h ago",
      read: false,
    },
    {
      id: 3,
      type: "approval",
      message: "Time entry for 8 hours approved by John Smith",
      time: "1d ago",
      read: true,
    },
    {
      id: 4,
      type: "goal",
      message: "Q4 Product Launch goal updated - now 65% complete",
      time: "2d ago",
      read: true,
    },
  ];

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "invite":
        return <UserPlus className="h-4 w-4 text-blue-600" />;
      case "deadline":
        return <AlertCircle className="h-4 w-4 text-orange-600" />;
      case "approval":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "goal":
        return <Target className="h-4 w-4 text-purple-600" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const getProductivityTrend = () => {
    // Mock productivity data
    const thisWeek = 42;
    const lastWeek = 38;
    const change = ((thisWeek - lastWeek) / lastWeek) * 100;
    return {
      current: thisWeek,
      previous: lastWeek,
      change: Math.round(change),
    };
  };

  const productivity = getProductivityTrend();

  const handleFilter = () => {
    // In production, this would trigger a Firestore query with the date range and employee filter
    console.log("Filtering time entries:", {
      startDate,
      endDate,
      selectedEmployee: selectedEmployee === "all" ? "" : selectedEmployee,
    });
    toast({
      title: "Filter Applied",
      description: `Filtering entries from ${startDate} to ${endDate}`,
    });
  };

  const handleExportCSV = () => {
    // In production, this would export the filtered data to CSV
    const csvData = timeEntries.map((entry) => ({
      Employee: entry.employeeName,
      Date: entry.date,
      Project: entry.project,
      "Start Time": entry.startTime,
      "End Time": entry.endTime,
      "Total Hours": entry.totalHours,
      Status: entry.status,
    }));

    console.log("Exporting CSV data:", csvData);
    toast({
      title: "Export Started",
      description: "CSV file will be downloaded shortly.",
    });
  };

  // Pagination
  const totalPages = Math.ceil(timeEntries.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedEntries = timeEntries.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Goals</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.activeGoals}/{stats.totalGoals}
            </div>
            <p className="text-xs text-muted-foreground">
              Department objectives
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Teams</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTeams}</div>
            <p className="text-xs text-muted-foreground">
              {stats.activeJobs} active jobs
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Task Completion
            </CardTitle>
            <CheckSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.completedTasks}/{stats.totalTasks}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.overdueTasks} overdue
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Hours</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalHours}h</div>
            <p className="text-xs text-muted-foreground">This period</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Goals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {goals.slice(0, 3).map((goal) => (
                <div
                  key={goal.id}
                  className="flex items-center justify-between"
                >
                  <div className="space-y-1">
                    <p className="font-medium">{goal.title}</p>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(goal.status, "goal")}
                      {getPriorityBadge(goal.priority)}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">
                      {goal.progress}%
                    </p>
                    <Progress value={goal.progress} className="w-20" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {tasks.slice(0, 3).map((task) => {
                const assignee = employees.find(
                  (e) => e.id === task.assigneeId,
                );
                return (
                  <div
                    key={task.id}
                    className="flex items-center justify-between"
                  >
                    <div className="space-y-1">
                      <p className="font-medium">{task.title}</p>
                      <div className="flex items-center gap-2">
                        <p className="text-sm text-muted-foreground">
                          {assignee?.name}
                        </p>
                        {getStatusBadge(task.status, "task")}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">
                        Due: {new Date(task.dueDate).toLocaleDateString()}
                      </p>
                      {getPriorityBadge(task.priority)}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <MainNavigation />

      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Task Management & Time Tracking
              </h1>
              <p className="text-gray-600">
                Manage department goals, team projects, and individual tasks
              </p>
            </div>
            <Button
              onClick={() => openDialog("goal")}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              Summary Dashboard
            </Button>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
              <TabsTrigger value="goals">Goals</TabsTrigger>
              <TabsTrigger value="teams">Teams & Jobs</TabsTrigger>
              <TabsTrigger value="tasks">Tasks</TabsTrigger>
              <TabsTrigger value="time">Time Tracking</TabsTrigger>
            </TabsList>

            <TabsContent value="dashboard" className="mt-6">
              {renderDashboard()}
            </TabsContent>

            <TabsContent value="goals" className="mt-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Target className="h-5 w-5" />
                        Department Goals
                      </CardTitle>
                      <CardDescription>
                        Strategic objectives for departments with timelines
                      </CardDescription>
                    </div>
                    <Button onClick={() => openDialog("goal")}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Goal
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {goals.map((goal) => (
                      <Card key={goal.id}>
                        <CardContent className="pt-6">
                          <div className="flex items-start justify-between">
                            <div className="space-y-2 flex-1">
                              <div className="flex items-center gap-2">
                                <h3 className="font-semibold">{goal.title}</h3>
                                {getStatusBadge(goal.status, "goal")}
                                {getPriorityBadge(goal.priority)}
                              </div>
                              <p className="text-sm text-gray-600">
                                {goal.description}
                              </p>
                              <div className="flex items-center gap-4 text-sm text-gray-500">
                                <span>Department: {goal.department}</span>
                                <span>
                                  Timeline: {goal.startDate} to {goal.endDate}
                                </span>
                                <span>Teams: {goal.assignedTeams.length}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Progress
                                  value={goal.progress}
                                  className="flex-1"
                                />
                                <span className="text-sm font-medium">
                                  {goal.progress}%
                                </span>
                              </div>
                            </div>
                            <div className="flex gap-2 ml-4">
                              <Button variant="outline" size="sm">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="outline" size="sm">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="teams" className="mt-6">
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <Users className="h-5 w-5" />
                          Teams
                        </CardTitle>
                        <CardDescription>
                          Cross-departmental teams and their jobs
                        </CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => openDialog("team")}
                          variant="outline"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add Team
                        </Button>
                        <Button onClick={() => openDialog("job")}>
                          <Plus className="h-4 w-4 mr-2" />
                          Add Job
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {teams.map((team) => {
                        const leader = employees.find(
                          (e) => e.id === team.leader,
                        );
                        const teamJobs = jobs.filter(
                          (j) => j.teamId === team.id,
                        );
                        return (
                          <Card key={team.id}>
                            <CardContent className="pt-6">
                              <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                  <h3 className="font-semibold">{team.name}</h3>
                                  <Badge variant="outline">
                                    {team.department}
                                  </Badge>
                                </div>
                                <div className="text-sm text-gray-600">
                                  <p>Leader: {leader?.name}</p>
                                  <p>Members: {team.members.length}</p>
                                  <p>Active Jobs: {team.activeJobs}</p>
                                </div>
                                {team.invitedMembers.length > 0 && (
                                  <div className="space-y-1">
                                    <p className="text-sm font-medium">
                                      Pending Invitations:
                                    </p>
                                    {team.invitedMembers.map((invite) => (
                                      <div
                                        key={invite.id}
                                        className="flex items-center justify-between text-sm"
                                      >
                                        <span>
                                          {invite.name} ({invite.department})
                                        </span>
                                        <Badge className="bg-yellow-100 text-yellow-800">
                                          {invite.status}
                                        </Badge>
                                      </div>
                                    ))}
                                  </div>
                                )}
                                <div className="flex gap-2">
                                  <Button variant="outline" size="sm">
                                    <UserPlus className="h-4 w-4 mr-1" />
                                    Invite
                                  </Button>
                                  <Button variant="outline" size="sm">
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Active Jobs</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {jobs.map((job) => {
                        const team = teams.find((t) => t.id === job.teamId);
                        const goal = goals.find((g) => g.id === job.goalId);
                        return (
                          <Card key={job.id}>
                            <CardContent className="pt-6">
                              <div className="flex items-start justify-between">
                                <div className="space-y-2 flex-1">
                                  <div className="flex items-center gap-2">
                                    <h3 className="font-semibold">
                                      {job.title}
                                    </h3>
                                    {getStatusBadge(job.status, "job")}
                                    {getPriorityBadge(job.priority)}
                                  </div>
                                  <p className="text-sm text-gray-600">
                                    {job.description}
                                  </p>
                                  <div className="flex items-center gap-4 text-sm text-gray-500">
                                    <span>Team: {team?.name}</span>
                                    {goal && <span>Goal: {goal.title}</span>}
                                    <span>
                                      Timeline: {job.startDate} to {job.endDate}
                                    </span>
                                    <span>Tasks: {job.tasks.length}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Progress
                                      value={job.progress}
                                      className="flex-1"
                                    />
                                    <span className="text-sm font-medium">
                                      {job.progress}%
                                    </span>
                                  </div>
                                </div>
                                <div className="flex gap-2 ml-4">
                                  <Button variant="outline" size="sm">
                                    {job.status === "active" ? (
                                      <PauseCircle className="h-4 w-4" />
                                    ) : (
                                      <PlayCircle className="h-4 w-4" />
                                    )}
                                  </Button>
                                  <Button variant="outline" size="sm">
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="tasks" className="mt-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <CheckSquare className="h-5 w-5" />
                        Individual Tasks
                      </CardTitle>
                      <CardDescription>
                        Task assignments with deadlines and progress tracking
                      </CardDescription>
                    </div>
                    <Button onClick={() => openDialog("task")}>
                      <Plus className="h-4 w-4 mr-2" />
                      Assign Task
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Task</TableHead>
                        <TableHead>Assignee</TableHead>
                        <TableHead>Job</TableHead>
                        <TableHead>Priority</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Due Date</TableHead>
                        <TableHead>Hours</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {tasks.map((task) => {
                        const assignee = employees.find(
                          (e) => e.id === task.assigneeId,
                        );
                        const job = jobs.find((j) => j.id === task.jobId);
                        const isOverdue =
                          new Date(task.dueDate) < new Date() &&
                          task.status !== "completed";
                        return (
                          <TableRow key={task.id}>
                            <TableCell>
                              <div>
                                <p className="font-medium">{task.title}</p>
                                <p className="text-sm text-gray-500">
                                  {task.description}
                                </p>
                                {task.tags.length > 0 && (
                                  <div className="flex gap-1 mt-1">
                                    {task.tags.map((tag) => (
                                      <Badge
                                        key={tag}
                                        variant="outline"
                                        className="text-xs"
                                      >
                                        {tag}
                                      </Badge>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>{assignee?.name}</TableCell>
                            <TableCell>
                              {job?.title || "Individual Task"}
                            </TableCell>
                            <TableCell>
                              {getPriorityBadge(task.priority)}
                            </TableCell>
                            <TableCell>
                              {getStatusBadge(task.status, "task")}
                            </TableCell>
                            <TableCell>
                              <div
                                className={`flex items-center gap-1 ${isOverdue ? "text-red-600" : ""}`}
                              >
                                {isOverdue && (
                                  <AlertCircle className="h-4 w-4" />
                                )}
                                {new Date(task.dueDate).toLocaleDateString()}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">
                                <p>
                                  {task.actualHours || 0}h /{" "}
                                  {task.estimatedHours}h
                                </p>
                                {task.estimatedHours > 0 && (
                                  <Progress
                                    value={
                                      ((task.actualHours || 0) /
                                        task.estimatedHours) *
                                      100
                                    }
                                    className="w-16 h-2"
                                  />
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-1">
                                <Button variant="outline" size="sm">
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button variant="outline" size="sm">
                                  {task.status === "completed" ? (
                                    <XCircle className="h-4 w-4" />
                                  ) : (
                                    <CheckCircle className="h-4 w-4" />
                                  )}
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="time" className="mt-6">
              {/* Filters */}
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Filter className="h-5 w-5" />
                    Filters
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                    <div>
                      <Label htmlFor="start-date">Start Date</Label>
                      <Input
                        id="start-date"
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="end-date">End Date</Label>
                      <Input
                        id="end-date"
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="department-filter">Department</Label>
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
                            <SelectItem key={dept} value={dept}>
                              {dept}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="employee-filter">Employee</Label>
                      <Select
                        value={selectedEmployee}
                        onValueChange={setSelectedEmployee}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="All employees" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All employees</SelectItem>
                          {employees.map((employee) => (
                            <SelectItem key={employee.id} value={employee.id}>
                              {employee.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Button onClick={handleFilter} className="w-full">
                        <Filter className="h-4 w-4 mr-2" />
                        Filter
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Time Entries Table */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Clock className="h-5 w-5" />
                        Time Entries
                      </CardTitle>
                      <CardDescription>
                        Showing {paginatedEntries.length} of{" "}
                        {timeEntries.length} entries
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={handleExportCSV}>
                        <Download className="h-4 w-4 mr-2" />
                        Export CSV
                      </Button>
                      <Button onClick={() => openDialog("timeEntry")}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Time Entry
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Employee Name</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Project/Task</TableHead>
                        <TableHead>Start Time</TableHead>
                        <TableHead>End Time</TableHead>
                        <TableHead>Total Hours</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Linked Task</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedEntries.map((entry) => {
                        const linkedTask = entry.taskId
                          ? tasks.find((t) => t.id === entry.taskId)
                          : null;
                        return (
                          <TableRow key={entry.id}>
                            <TableCell className="font-medium">
                              {entry.employeeName}
                            </TableCell>
                            <TableCell>{entry.date}</TableCell>
                            <TableCell>{entry.project}</TableCell>
                            <TableCell>{entry.startTime}</TableCell>
                            <TableCell>{entry.endTime}</TableCell>
                            <TableCell>{entry.totalHours}h</TableCell>
                            <TableCell>
                              {getStatusBadge(entry.status, "time")}
                            </TableCell>
                            <TableCell>
                              {linkedTask ? (
                                <div className="flex items-center gap-1">
                                  <ChevronRight className="h-4 w-4" />
                                  <span className="text-sm">
                                    {linkedTask.title}
                                  </span>
                                </div>
                              ) : (
                                <span className="text-gray-400">-</span>
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="mt-4">
                      <Pagination>
                        <PaginationContent>
                          <PaginationItem>
                            <PaginationPrevious
                              onClick={() =>
                                setCurrentPage(Math.max(1, currentPage - 1))
                              }
                              className={
                                currentPage === 1
                                  ? "pointer-events-none opacity-50"
                                  : ""
                              }
                            />
                          </PaginationItem>
                          {[...Array(totalPages)].map((_, i) => (
                            <PaginationItem key={i + 1}>
                              <PaginationLink
                                onClick={() => setCurrentPage(i + 1)}
                                isActive={currentPage === i + 1}
                              >
                                {i + 1}
                              </PaginationLink>
                            </PaginationItem>
                          ))}
                          <PaginationItem>
                            <PaginationNext
                              onClick={() =>
                                setCurrentPage(
                                  Math.min(totalPages, currentPage + 1),
                                )
                              }
                              className={
                                currentPage === totalPages
                                  ? "pointer-events-none opacity-50"
                                  : ""
                              }
                            />
                          </PaginationItem>
                        </PaginationContent>
                      </Pagination>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Universal Dialog for all forms */}
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogContent
              className={
                dialogType === "goal" || dialogType === "job"
                  ? "max-w-2xl"
                  : "max-w-md"
              }
            >
              <DialogHeader>
                <DialogTitle>
                  {dialogType === "goal" && "Create Department Goal"}
                  {dialogType === "team" && "Create Team"}
                  {dialogType === "job" && "Create Job"}
                  {dialogType === "task" && "Assign Task"}
                  {dialogType === "timeEntry" && "Add Time Entry"}
                </DialogTitle>
                <DialogDescription>
                  {dialogType === "goal" &&
                    "Set strategic objectives for your department with timeline and success metrics"}
                  {dialogType === "team" &&
                    "Build cross-departmental teams and invite members from other departments"}
                  {dialogType === "job" &&
                    "Create project jobs for teams to work on towards department goals"}
                  {dialogType === "task" &&
                    "Assign individual tasks to staff members with deadlines and priorities"}
                  {dialogType === "timeEntry" &&
                    "Create a new time entry for an employee"}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                {dialogType === "goal" && (
                  <>
                    <div>
                      <Label htmlFor="goal-title">Goal Title *</Label>
                      <Input
                        id="goal-title"
                        value={goalFormData.title}
                        onChange={(e) =>
                          setGoalFormData((prev) => ({
                            ...prev,
                            title: e.target.value,
                          }))
                        }
                        placeholder="e.g., Launch Q4 Product Release"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="goal-description">Description</Label>
                      <Textarea
                        id="goal-description"
                        value={goalFormData.description}
                        onChange={(e) =>
                          setGoalFormData((prev) => ({
                            ...prev,
                            description: e.target.value,
                          }))
                        }
                        placeholder="Detailed description of the goal and success criteria"
                        rows={3}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="goal-department">Department *</Label>
                        <Select
                          value={goalFormData.department}
                          onValueChange={(value) =>
                            setGoalFormData((prev) => ({
                              ...prev,
                              department: value,
                            }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select department" />
                          </SelectTrigger>
                          <SelectContent>
                            {departments.map((dept) => (
                              <SelectItem key={dept} value={dept}>
                                {dept}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="goal-priority">Priority</Label>
                        <Select
                          value={goalFormData.priority}
                          onValueChange={(value) =>
                            setGoalFormData((prev) => ({
                              ...prev,
                              priority: value as "high" | "medium" | "low",
                            }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="high">High</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="low">Low</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="goal-start">Start Date *</Label>
                        <Input
                          id="goal-start"
                          type="date"
                          value={goalFormData.startDate}
                          onChange={(e) =>
                            setGoalFormData((prev) => ({
                              ...prev,
                              startDate: e.target.value,
                            }))
                          }
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="goal-end">End Date *</Label>
                        <Input
                          id="goal-end"
                          type="date"
                          value={goalFormData.endDate}
                          onChange={(e) =>
                            setGoalFormData((prev) => ({
                              ...prev,
                              endDate: e.target.value,
                            }))
                          }
                          required
                        />
                      </div>
                    </div>
                  </>
                )}

                {dialogType === "team" && (
                  <>
                    <div>
                      <Label htmlFor="team-name">Team Name *</Label>
                      <Input
                        id="team-name"
                        value={teamFormData.name}
                        onChange={(e) =>
                          setTeamFormData((prev) => ({
                            ...prev,
                            name: e.target.value,
                          }))
                        }
                        placeholder="e.g., Mobile Development Team"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="team-department">Department *</Label>
                        <Select
                          value={teamFormData.department}
                          onValueChange={(value) =>
                            setTeamFormData((prev) => ({
                              ...prev,
                              department: value,
                            }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select department" />
                          </SelectTrigger>
                          <SelectContent>
                            {departments.map((dept) => (
                              <SelectItem key={dept} value={dept}>
                                {dept}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="team-leader">Team Leader *</Label>
                        <Select
                          value={teamFormData.leader}
                          onValueChange={(value) =>
                            setTeamFormData((prev) => ({
                              ...prev,
                              leader: value,
                            }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select leader" />
                          </SelectTrigger>
                          <SelectContent>
                            {employees
                              .filter(
                                (e) =>
                                  e.role.includes("Director") ||
                                  e.role.includes("Manager"),
                              )
                              .map((employee) => (
                                <SelectItem
                                  key={employee.id}
                                  value={employee.id}
                                >
                                  {employee.name} ({employee.role})
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </>
                )}

                {dialogType === "job" && (
                  <>
                    <div>
                      <Label htmlFor="job-title">Job Title *</Label>
                      <Input
                        id="job-title"
                        value={jobFormData.title}
                        onChange={(e) =>
                          setJobFormData((prev) => ({
                            ...prev,
                            title: e.target.value,
                          }))
                        }
                        placeholder="e.g., Mobile App UI Development"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="job-description">Description</Label>
                      <Textarea
                        id="job-description"
                        value={jobFormData.description}
                        onChange={(e) =>
                          setJobFormData((prev) => ({
                            ...prev,
                            description: e.target.value,
                          }))
                        }
                        placeholder="Detailed description of the job and deliverables"
                        rows={3}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="job-team">Assigned Team *</Label>
                        <Select
                          value={jobFormData.teamId}
                          onValueChange={(value) =>
                            setJobFormData((prev) => ({
                              ...prev,
                              teamId: value,
                            }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select team" />
                          </SelectTrigger>
                          <SelectContent>
                            {teams.map((team) => (
                              <SelectItem key={team.id} value={team.id}>
                                {team.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="job-goal">
                          Related Goal (Optional)
                        </Label>
                        <Select
                          value={jobFormData.goalId}
                          onValueChange={(value) =>
                            setJobFormData((prev) => ({
                              ...prev,
                              goalId: value,
                            }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select goal" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="">No goal</SelectItem>
                            {goals.map((goal) => (
                              <SelectItem key={goal.id} value={goal.id}>
                                {goal.title}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="job-priority">Priority</Label>
                        <Select
                          value={jobFormData.priority}
                          onValueChange={(value) =>
                            setJobFormData((prev) => ({
                              ...prev,
                              priority: value as "high" | "medium" | "low",
                            }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="high">High</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="low">Low</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="job-start">Start Date *</Label>
                        <Input
                          id="job-start"
                          type="date"
                          value={jobFormData.startDate}
                          onChange={(e) =>
                            setJobFormData((prev) => ({
                              ...prev,
                              startDate: e.target.value,
                            }))
                          }
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="job-end">End Date *</Label>
                        <Input
                          id="job-end"
                          type="date"
                          value={jobFormData.endDate}
                          onChange={(e) =>
                            setJobFormData((prev) => ({
                              ...prev,
                              endDate: e.target.value,
                            }))
                          }
                          required
                        />
                      </div>
                    </div>
                  </>
                )}

                {dialogType === "task" && (
                  <>
                    <div>
                      <Label htmlFor="task-title">Task Title *</Label>
                      <Input
                        id="task-title"
                        value={taskFormData.title}
                        onChange={(e) =>
                          setTaskFormData((prev) => ({
                            ...prev,
                            title: e.target.value,
                          }))
                        }
                        placeholder="e.g., Design login screen"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="task-description">Description</Label>
                      <Textarea
                        id="task-description"
                        value={taskFormData.description}
                        onChange={(e) =>
                          setTaskFormData((prev) => ({
                            ...prev,
                            description: e.target.value,
                          }))
                        }
                        placeholder="Detailed description of the task"
                        rows={2}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="task-assignee">Assignee *</Label>
                        <Select
                          value={taskFormData.assigneeId}
                          onValueChange={(value) =>
                            setTaskFormData((prev) => ({
                              ...prev,
                              assigneeId: value,
                            }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select employee" />
                          </SelectTrigger>
                          <SelectContent>
                            {employees.map((employee) => (
                              <SelectItem key={employee.id} value={employee.id}>
                                {employee.name} ({employee.department})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="task-job">Related Job (Optional)</Label>
                        <Select
                          value={taskFormData.jobId}
                          onValueChange={(value) =>
                            setTaskFormData((prev) => ({
                              ...prev,
                              jobId: value,
                            }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select job" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="">Individual task</SelectItem>
                            {jobs.map((job) => (
                              <SelectItem key={job.id} value={job.id}>
                                {job.title}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="task-priority">Priority</Label>
                        <Select
                          value={taskFormData.priority}
                          onValueChange={(value) =>
                            setTaskFormData((prev) => ({
                              ...prev,
                              priority: value as "high" | "medium" | "low",
                            }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="high">High</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="low">Low</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="task-start">Start Date</Label>
                        <Input
                          id="task-start"
                          type="date"
                          value={taskFormData.startDate}
                          onChange={(e) =>
                            setTaskFormData((prev) => ({
                              ...prev,
                              startDate: e.target.value,
                            }))
                          }
                        />
                      </div>
                      <div>
                        <Label htmlFor="task-due">Due Date *</Label>
                        <Input
                          id="task-due"
                          type="date"
                          value={taskFormData.dueDate}
                          onChange={(e) =>
                            setTaskFormData((prev) => ({
                              ...prev,
                              dueDate: e.target.value,
                            }))
                          }
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="task-hours">Estimated Hours</Label>
                      <Input
                        id="task-hours"
                        type="number"
                        value={taskFormData.estimatedHours}
                        onChange={(e) =>
                          setTaskFormData((prev) => ({
                            ...prev,
                            estimatedHours: Number(e.target.value),
                          }))
                        }
                        placeholder="0"
                        min="0"
                        step="0.5"
                      />
                    </div>
                  </>
                )}

                {dialogType === "timeEntry" && (
                  <>
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
                            <SelectItem key={employee.id} value={employee.id}>
                              {employee.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="entry-date">Date *</Label>
                      <Input
                        id="entry-date"
                        type="date"
                        value={formData.date}
                        onChange={(e) =>
                          handleInputChange("date", e.target.value)
                        }
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="project">Project/Task *</Label>
                      <Input
                        id="project"
                        value={formData.project}
                        onChange={(e) =>
                          handleInputChange("project", e.target.value)
                        }
                        placeholder="Enter project or task name"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label htmlFor="start-time">Start Time *</Label>
                        <Input
                          id="start-time"
                          type="time"
                          value={formData.startTime}
                          onChange={(e) =>
                            handleInputChange("startTime", e.target.value)
                          }
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="end-time">End Time *</Label>
                        <Input
                          id="end-time"
                          type="time"
                          value={formData.endTime}
                          onChange={(e) =>
                            handleInputChange("endTime", e.target.value)
                          }
                          required
                        />
                      </div>
                    </div>
                    {formData.startTime && formData.endTime && (
                      <div className="text-sm text-gray-600">
                        Total Hours:{" "}
                        {calculateTotalHours(
                          formData.startTime,
                          formData.endTime,
                        )}
                      </div>
                    )}
                  </>
                )}

                <div className="flex gap-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowAddDialog(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button type="submit" className="flex-1">
                    {dialogType === "goal" && "Create Goal"}
                    {dialogType === "team" && "Create Team"}
                    {dialogType === "job" && "Create Job"}
                    {dialogType === "task" && "Assign Task"}
                    {dialogType === "timeEntry" && "Add Entry"}
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
