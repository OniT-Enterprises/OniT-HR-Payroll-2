import React from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/localAuth";
import { useFirebase } from "@/contexts/FirebaseContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  UserPlus,
  Users,
  Clock,
  TrendingUp,
  Calculator,
  BarChart3,
  Briefcase,
  Calendar,
  UserCog,
  Building,
  Building2,
  Heart,
  Target,
  Award,
  Shield,
  FileText,
  CreditCard,
  DollarSign,
  PieChart,
  Settings,
  Activity,
  Cog,
} from "lucide-react";

const modules = [
  {
    title: "Hiring",
    path: "/hiring",
    icon: UserPlus,
    color: "text-green-400",
    bgColor: "bg-green-950/40",
    borderColor: "border-green-400",
    subMenu: [
      { title: "Create Job", icon: Briefcase, path: "/hiring/create-job" },
      { title: "Selection", icon: Users, path: "/hiring/candidates" },
      { title: "Onboarding", icon: UserPlus, path: "/hiring/onboarding" },
      { title: "Offboarding", icon: UserCog, path: "/hiring/offboarding" },
    ],
  },
  {
    title: "Staff",
    path: "/staff",
    icon: Users,
    color: "text-blue-400",
    bgColor: "bg-blue-950/40",
    borderColor: "border-blue-400",
    subMenu: [
      { title: "Departments", icon: Building, path: "/staff/departments" },
      { title: "All Staff", icon: Users, path: "/staff/employees" },
      {
        title: "Organisation\nChart",
        icon: Building2,
        path: "/staff/org-chart",
      },
    ],
  },
  {
    title: "Time & Leave",
    path: "/time-leave",
    icon: Clock,
    color: "text-purple-400",
    bgColor: "bg-purple-950/40",
    borderColor: "border-purple-400",
    subMenu: [
      { title: "Attendance", icon: Calendar, path: "/time-leave/attendance" },
      { title: "Shifts", icon: Calendar, path: "/time-leave/scheduling" },
      { title: "Leave Requests", icon: Heart, path: "/time-leave/requests" },
    ],
  },
  {
    title: "Performance",
    path: "/performance",
    icon: TrendingUp,
    color: "text-orange-400",
    bgColor: "bg-orange-950/40",
    borderColor: "border-orange-400",
    subMenu: [
      {
        title: "Disciplinary",
        icon: Shield,
        path: "/performance/disciplinary",
      },
      { title: "Reviews", icon: Award, path: "/performance/reviews" },
      { title: "Targets", icon: Target, path: "/performance/goals" },
      { title: "Training", icon: Award, path: "/performance/training" },
    ],
  },
  {
    title: "Payroll",
    path: "/payroll",
    icon: Calculator,
    color: "text-yellow-400",
    bgColor: "bg-yellow-950/40",
    borderColor: "border-yellow-400",
    subMenu: [
      { title: "Create Payroll", icon: Calculator, path: "/payroll/run" },
      {
        title: "Benefits &\nDeductions",
        icon: DollarSign,
        path: "/payroll/deductions",
      },
      { title: "Setup", icon: Settings, path: "/payroll/setup" },
    ],
  },
  {
    title: "Reports",
    path: "/reports",
    icon: BarChart3,
    color: "text-pink-400",
    bgColor: "bg-pink-950/40",
    borderColor: "border-pink-400",
    subMenu: [
      {
        title: "Department\nReports",
        icon: Building,
        path: "/reports/departments",
      },
      { title: "Staff\nReports", icon: Users, path: "/reports/employees" },
      { title: "Payroll\nReports", icon: Calculator, path: "/reports/payroll" },
      { title: "Setup\nReports", icon: Settings, path: "/reports/setup" },
    ],
  },
];

export default function HotDogStyleNavigation() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = getCurrentUser();
  const currentPath = location.pathname;
  const { isConnected } = useFirebase();

  // Find the currently active module
  const currentMainModule = modules.find(
    (module) =>
      currentPath === module.path || currentPath.startsWith(`${module.path}/`),
  );

  const handleNavigate = (path: string) => {
    navigate(path);
  };

  return (
    <nav className="bg-gray-900 border-b border-gray-700 px-4 sm:px-6 lg:px-8 sticky top-0 z-50">
      <div className="flex justify-between h-20">
        {/* Logo */}
        <div className="flex items-center mr-11">
          <div className="flex-shrink-0 flex items-center">
            <img
              src="https://cdn.builder.io/api/v1/image/assets%2F460f188acad442d387e4846176efeb72%2F1cd62202d1d04226be6dc6ced94436eb?format=webp&width=800"
              alt="ONIT Logo"
              className="h-8 w-auto cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => navigate("/")}
            />
          </div>
        </div>

        {/* Hot Dog Navigation Items */}
        <div
          className="hidden md:flex md:flex-1 md:gap-2"
          style={{ margin: "0 16px 0 24px", padding: "0 8px" }}
        >
          {modules.map((module) => {
            const IconComponent = module.icon;
            const isActive =
              currentPath === module.path ||
              currentPath.startsWith(`${module.path}/`);

            return (
              <div
                key={module.path}
                className={`flex-1 flex items-center justify-center h-16 my-2 rounded-lg border-2 transition-all duration-200 ${
                  isActive
                    ? `${module.bgColor} ${module.borderColor} border-opacity-100`
                    : `border-gray-600 border-opacity-50 hover:border-opacity-80 hover:${module.borderColor} hover:bg-gray-800`
                }`}
              >
                {isActive ? (
                  // Show submenu items horizontally
                  <div className="flex items-center justify-center gap-3 w-full px-2">
                    {module.subMenu.map((subItem) => {
                      const SubIconComponent = subItem.icon;
                      const isSubActive = currentPath === subItem.path;

                      return (
                        <Link
                          key={subItem.path}
                          to={subItem.path}
                          className={`flex flex-col items-center p-1 rounded transition-colors ${
                            isSubActive
                              ? `${module.color} bg-gray-700`
                              : "text-gray-300 hover:text-white hover:bg-gray-700"
                          }`}
                        >
                          <SubIconComponent className="h-4 w-4" />
                          <span className="text-xs mt-1 text-center leading-tight whitespace-pre-line">
                            {subItem.title}
                          </span>
                        </Link>
                      );
                    })}
                  </div>
                ) : (
                  // Show regular module button
                  <Link
                    to={module.path}
                    className={`flex items-center gap-2 px-3 py-2 rounded transition-colors hover:bg-gray-700/50 ${module.color} w-full justify-center`}
                  >
                    <IconComponent className="h-5 w-5 flex-shrink-0" />
                    <span className="font-medium whitespace-nowrap">
                      {module.title}
                    </span>
                  </Link>
                )}
              </div>
            );
          })}
        </div>

        {/* Right side - User info and settings */}
        <div className="flex items-center gap-3">
          {/* User Avatar with Gear Hint */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="relative p-0 h-10 w-10 rounded-full hover:bg-gray-700 group"
                title={user ? `${user.name} - Click for settings` : "User menu"}
              >
                {/* Gear wheel hint - visible on hover */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-50 transition-opacity duration-300">
                  <Cog className="h-10 w-10 text-gray-400 animate-spin-slow" />
                </div>

                {/* User Avatar */}
                <Avatar className="h-8 w-8 relative z-10">
                  <AvatarFallback className={`${isConnected ? 'bg-green-600' : 'bg-red-600'} text-white text-sm font-medium`}>
                    {user
                      ? user.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()
                      : "U"}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-72 bg-gray-900 border-gray-700"
              align="end"
              sideOffset={5}
            >
              {user && (
                <>
                  <DropdownMenuItem className="text-gray-300 flex-col items-start pointer-events-none">
                    <div className="flex items-center gap-2 w-full">
                      <div className="flex items-center gap-2">
                        <div className={`h-8 w-8 ${isConnected ? 'bg-green-600' : 'bg-red-600'} rounded-full flex items-center justify-center`}>
                          <span className="text-white text-sm font-medium">
                            {user.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <div className="font-medium">{user.name}</div>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-xs ml-auto">
                        {user.role}
                      </Badge>
                    </div>
                  </DropdownMenuItem>

                  {/* Database Connection Status */}
                  <div className="px-2 py-2">
                    <div className={`${isConnected ? 'bg-green-600' : 'bg-red-600'} rounded-md px-3 py-2 flex items-center justify-center`}>
                      <span className="text-white text-xs font-medium">
                        {isConnected ? 'Connected to Database' : 'Not Connected to Database'}
                      </span>
                    </div>
                  </div>

                  <DropdownMenuSeparator className="bg-gray-700" />
                </>
              )}
              <DropdownMenuItem
                className="text-gray-300 hover:text-white hover:bg-gray-700 cursor-pointer"
                onClick={() => handleNavigate("/settings")}
              >
                <Settings className="mr-2 h-4 w-4" />
                Settings & Profile
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-gray-700" />
              <DropdownMenuItem
                className="text-red-400 hover:text-red-300 hover:bg-gray-700 cursor-pointer"
                onClick={() => {
                  // Handle sign out
                  const { signOutLocal } = require("@/lib/localAuth");
                  signOutLocal();
                  window.location.reload();
                }}
              >
                <Activity className="mr-2 h-4 w-4" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  );
}
