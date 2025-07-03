import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Building,
  Settings,
  Users,
  UserPlus,
  BarChart3,
  Calculator,
  FileText,
  Calendar,
  Clock,
  TrendingUp,
  Briefcase,
  Cog,
  UserCog,
  Building2,
  DollarSign,
  PieChart,
  Activity,
  Shield,
  ChevronDown,
} from "lucide-react";

export default function MainNavigation() {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const navigationItems = [
    {
      id: "setup",
      label: "Setup",
      icon: <Cog className="h-5 w-5" />,
      color: "text-blue-400",
      items: [
        {
          label: "Company Details",
          icon: <Building2 className="h-4 w-4" />,
          path: "/setup/company",
        },
        {
          label: "Departments",
          icon: <Building className="h-4 w-4" />,
          path: "/setup/departments",
        },
        {
          label: "Payment Structure",
          icon: <DollarSign className="h-4 w-4" />,
          path: "/setup/payments",
        },
        {
          label: "User Management",
          icon: <UserCog className="h-4 w-4" />,
          path: "/setup/users",
        },
      ],
    },
    {
      id: "hiring",
      label: "Hiring",
      icon: <UserPlus className="h-5 w-5" />,
      color: "text-green-400",
      items: [
        {
          label: "Create Job",
          icon: <Briefcase className="h-4 w-4" />,
          path: "/hiring/create-job",
        },
        {
          label: "Candidate Selection",
          icon: <Users className="h-4 w-4" />,
          path: "/hiring/candidates",
        },
        {
          label: "Interviews",
          icon: <Calendar className="h-4 w-4" />,
          path: "/hiring/interviews",
        },
        {
          label: "Onboarding",
          icon: <UserPlus className="h-4 w-4" />,
          path: "/hiring/onboarding",
        },
      ],
    },
    {
      id: "staff",
      label: "Staff",
      icon: <Users className="h-5 w-5" />,
      color: "text-purple-400",
      items: [
        {
          label: "All Employees",
          icon: <Users className="h-4 w-4" />,
          path: "/staff/employees",
        },
        {
          label: "Add Employee",
          icon: <UserPlus className="h-4 w-4" />,
          path: "/staff/add",
        },
        {
          label: "Departments",
          icon: <Building className="h-4 w-4" />,
          path: "/staff/departments",
        },
        {
          label: "Organization Chart",
          icon: <BarChart3 className="h-4 w-4" />,
          path: "/staff/org-chart",
        },
      ],
    },
    {
      id: "performance",
      label: "Performance",
      icon: <TrendingUp className="h-5 w-5" />,
      color: "text-orange-400",
      items: [
        {
          label: "Time Tracking",
          icon: <Clock className="h-4 w-4" />,
          path: "/performance/time",
        },
        {
          label: "Attendance",
          icon: <Calendar className="h-4 w-4" />,
          path: "/performance/attendance",
        },
        {
          label: "Reviews",
          icon: <FileText className="h-4 w-4" />,
          path: "/performance/reviews",
        },
        {
          label: "Disciplinary",
          icon: <Shield className="h-4 w-4" />,
          path: "/performance/disciplinary",
        },
      ],
    },
    {
      id: "payroll",
      label: "Payroll",
      icon: <Calculator className="h-5 w-5" />,
      color: "text-emerald-400",
      items: [
        {
          label: "Run Payroll",
          icon: <Calculator className="h-4 w-4" />,
          path: "/payroll/run",
        },
        {
          label: "Payroll History",
          icon: <FileText className="h-4 w-4" />,
          path: "/payroll/history",
        },
        {
          label: "Tax Reports",
          icon: <PieChart className="h-4 w-4" />,
          path: "/payroll/taxes",
        },
        {
          label: "Bank Transfers",
          icon: <DollarSign className="h-4 w-4" />,
          path: "/payroll/transfers",
        },
      ],
    },
    {
      id: "reports",
      label: "Reports",
      icon: <FileText className="h-5 w-5" />,
      color: "text-pink-400",
      items: [
        {
          label: "Payroll Reports",
          icon: <Calculator className="h-4 w-4" />,
          path: "/reports/payroll",
        },
        {
          label: "Employee Reports",
          icon: <Users className="h-4 w-4" />,
          path: "/reports/employees",
        },
        {
          label: "Attendance Reports",
          icon: <Clock className="h-4 w-4" />,
          path: "/reports/attendance",
        },
        {
          label: "Custom Reports",
          icon: <BarChart3 className="h-4 w-4" />,
          path: "/reports/custom",
        },
      ],
    },
  ];

  const handleDropdownClick = (itemId: string) => {
    setActiveDropdown(activeDropdown === itemId ? null : itemId);
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    setActiveDropdown(null);
  };

  const isActiveModule = (moduleId: string) => {
    return location.pathname.startsWith(`/${moduleId}`);
  };

  return (
    <nav className="bg-gray-900 border-b border-gray-800 h-14 flex items-center justify-between px-4">
      {/* Logo */}
      <div className="flex items-center">
        <Button
          variant="ghost"
          className="flex items-center gap-2 hover:bg-gray-800 text-white p-2"
          onClick={() => navigate("/dashboard")}
        >
          <div className="flex h-8 w-8 items-center justify-center rounded bg-primary">
            <Building className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-lg font-semibold">PayrollHR</span>
        </Button>
      </div>

      {/* Main Navigation */}
      <div className="flex items-center gap-1">
        {navigationItems.map((item) => (
          <DropdownMenu
            key={item.id}
            open={activeDropdown === item.id}
            onOpenChange={(open) => setActiveDropdown(open ? item.id : null)}
          >
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className={`flex items-center gap-2 px-3 py-2 h-10 hover:bg-gray-800 transition-colors ${
                  isActiveModule(item.id)
                    ? "bg-gray-800 text-white"
                    : "text-gray-300 hover:text-white"
                }`}
                onClick={() => handleDropdownClick(item.id)}
              >
                <span className={item.color}>{item.icon}</span>
                <span className="text-sm font-medium">{item.label}</span>
                <ChevronDown className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-56 bg-gray-900 border-gray-700"
              align="start"
              sideOffset={5}
            >
              {item.items.map((subItem, index) => (
                <DropdownMenuItem
                  key={index}
                  className="flex items-center gap-3 px-3 py-2 text-gray-300 hover:bg-gray-800 hover:text-white cursor-pointer"
                  onClick={() => handleNavigation(subItem.path)}
                >
                  <span className={item.color}>{subItem.icon}</span>
                  <span>{subItem.label}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        ))}
      </div>

      {/* Right Side - User Menu */}
      <div className="flex items-center gap-3">
        {/* User Avatar */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="p-0 h-8 w-8 rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                  JD
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-56 bg-gray-900 border-gray-700"
            align="end"
            sideOffset={5}
          >
            <DropdownMenuItem className="flex items-center gap-3 px-3 py-2 text-gray-300 hover:bg-gray-800 hover:text-white cursor-pointer">
              <Users className="h-4 w-4" />
              <span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="flex items-center gap-3 px-3 py-2 text-gray-300 hover:bg-gray-800 hover:text-white cursor-pointer">
              <Settings className="h-4 w-4" />
              <span>Account Settings</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-gray-700" />
            <DropdownMenuItem className="flex items-center gap-3 px-3 py-2 text-gray-300 hover:bg-gray-800 hover:text-white cursor-pointer">
              <Activity className="h-4 w-4" />
              <span>Sign Out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Settings */}
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-gray-400 hover:text-white hover:bg-gray-800"
          onClick={() => navigate("/settings")}
        >
          <Settings className="h-5 w-5" />
        </Button>
      </div>
    </nav>
  );
}
