import React, { useState } from "react";
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
    <div>
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
        <div className="flex-1 flex items-center justify-center px-8">
          <div className="flex items-center gap-2 w-full max-w-7xl">
            {navigationItems.map((item) => {
              const isActive =
                isActiveModule(item.id) || activeDropdown === item.id;
              const isExpanded = activeDropdown === item.id;

              // Define exact colors to match the image
              const getModuleColors = (moduleId: string) => {
                switch (moduleId) {
                  case "hiring":
                    return { border: "#4ade80", bg: "#22c55e" }; // Green
                  case "staff":
                    return { border: "#06b6d4", bg: "#0891b2" }; // Cyan/Teal
                  case "performance":
                    return { border: "#f97316", bg: "#ea580c" }; // Orange
                  case "payroll":
                    return { border: "#10b981", bg: "#059669" }; // Emerald
                  case "reports":
                    return { border: "#ec4899", bg: "#db2777" }; // Pink
                  default:
                    return { border: "#6b7280", bg: "#4b5563" };
                }
              };

              const colors = getModuleColors(item.id);
              const isAnyExpanded = activeDropdown !== null;

              if (isExpanded) {
                // Show expanded module with sub-items INSIDE the button
                return (
                  <div
                    key={item.id}
                    className="flex flex-col border-2 rounded-md p-2 transition-all"
                    style={{
                      borderColor: colors.border,
                      backgroundColor: "rgba(55, 65, 81, 0.8)",
                      flex: "2.5",
                    }}
                  >
                    {/* Main module header */}
                    <Button
                      variant="ghost"
                      className="flex items-center justify-center gap-2 px-3 py-2 h-10 text-white hover:bg-transparent"
                      onClick={() => handleDropdownClick(item.id)}
                    >
                      <span className={item.color}>{item.icon}</span>
                      <span className="text-sm font-medium">{item.label}</span>
                      <ChevronDown className="h-3 w-3 rotate-180 transition-transform" />
                    </Button>

                    {/* Sub-items INSIDE the button */}
                    <div className="grid grid-cols-2 gap-1 mt-2">
                      {item.items.map((subItem, index) => {
                        const isActiveSubItem =
                          location.pathname === subItem.path;
                        return (
                          <Button
                            key={index}
                            variant="ghost"
                            className={`flex items-center gap-1 px-2 py-1 h-8 rounded text-xs transition-all ${
                              isActiveSubItem
                                ? "text-white"
                                : "text-gray-300 hover:text-white hover:bg-gray-700"
                            }`}
                            style={{
                              backgroundColor: isActiveSubItem
                                ? colors.bg
                                : "transparent",
                            }}
                            onClick={() => handleNavigation(subItem.path)}
                          >
                            <span className={item.color}>{subItem.icon}</span>
                            <span className="font-medium text-center flex-1">
                              {subItem.label}
                            </span>
                          </Button>
                        );
                      })}
                    </div>
                  </div>
                );
              } else {
                // Show collapsed module
                return (
                  <Button
                    key={item.id}
                    variant="ghost"
                    className={`flex items-center justify-center gap-2 px-3 py-2 h-10 border-2 rounded-md transition-all ${
                      isActive
                        ? "text-white"
                        : "text-gray-300 hover:text-white border-gray-600 hover:border-gray-500"
                    }`}
                    style={{
                      borderColor: isActive ? colors.border : "#6b7280",
                      backgroundColor: isActive
                        ? "rgba(55, 65, 81, 0.8)"
                        : "transparent",
                      flex: isAnyExpanded ? "1" : "1",
                    }}
                    onClick={() => handleDropdownClick(item.id)}
                  >
                    <span className={item.color}>{item.icon}</span>
                    <span
                      className={`text-sm font-medium ${isAnyExpanded ? "hidden lg:block" : ""}`}
                    >
                      {item.label}
                    </span>
                    <ChevronDown className="h-3 w-3 transition-transform" />
                  </Button>
                );
              }
            })}
          </div>
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
              <DropdownMenuItem
                className="flex items-center gap-3 px-3 py-2 text-gray-300 hover:bg-gray-800 hover:text-white cursor-pointer"
                onClick={() => handleNavigation("/setup/company")}
              >
                <Building2 className="h-4 w-4 text-blue-400" />
                <span>Company Details</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="flex items-center gap-3 px-3 py-2 text-gray-300 hover:bg-gray-800 hover:text-white cursor-pointer"
                onClick={() => handleNavigation("/setup/departments")}
              >
                <Building className="h-4 w-4 text-blue-400" />
                <span>Departments</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="flex items-center gap-3 px-3 py-2 text-gray-300 hover:bg-gray-800 hover:text-white cursor-pointer"
                onClick={() => handleNavigation("/setup/payments")}
              >
                <DollarSign className="h-4 w-4 text-blue-400" />
                <span>Payment Structure</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="flex items-center gap-3 px-3 py-2 text-gray-300 hover:bg-gray-800 hover:text-white cursor-pointer"
                onClick={() => handleNavigation("/setup/users")}
              >
                <UserCog className="h-4 w-4 text-blue-400" />
                <span>User Management</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-gray-700" />
              <DropdownMenuItem className="flex items-center gap-3 px-3 py-2 text-gray-300 hover:bg-gray-800 hover:text-white cursor-pointer">
                <Users className="h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="flex items-center gap-3 px-3 py-2 text-gray-300 hover:bg-gray-800 hover:text-white cursor-pointer"
                onClick={() => navigate("/settings")}
              >
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
    </div>
  );
}
