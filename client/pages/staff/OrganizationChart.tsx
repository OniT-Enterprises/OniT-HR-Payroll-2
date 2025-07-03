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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import MainNavigation from "@/components/layout/MainNavigation";
import {
  Building,
  ChevronDown,
  ChevronRight,
  Users,
  Crown,
  User,
  Grip,
} from "lucide-react";

export default function OrganizationChart() {
  const [expandedDepts, setExpandedDepts] = useState<string[]>([]);

  // Mock organizational data
  const organizationData = {
    ceo: {
      id: "ceo",
      name: "John CEO",
      title: "Chief Executive Officer",
      email: "john.ceo@company.com",
      profilePhoto: "/placeholder.svg",
    },
    departments: [
      {
        id: "engineering",
        name: "Engineering",
        color: "bg-blue-100 border-blue-300 text-blue-800",
        manager: {
          id: "1",
          name: "Sarah Johnson",
          title: "VP of Engineering",
          email: "sarah.johnson@company.com",
          profilePhoto: "/placeholder.svg",
        },
        employees: [
          {
            id: "e1",
            name: "Michael Chen",
            title: "Senior Software Engineer",
            email: "michael.chen@company.com",
          },
          {
            id: "e2",
            name: "David Wilson",
            title: "DevOps Engineer",
            email: "david.wilson@company.com",
          },
          {
            id: "e3",
            name: "Lisa Thompson",
            title: "Frontend Developer",
            email: "lisa.thompson@company.com",
          },
          {
            id: "e4",
            name: "Robert Taylor",
            title: "Backend Developer",
            email: "robert.taylor@company.com",
          },
        ],
      },
      {
        id: "marketing",
        name: "Marketing",
        color: "bg-green-100 border-green-300 text-green-800",
        manager: {
          id: "2",
          name: "Emily Rodriguez",
          title: "Marketing Director",
          email: "emily.rodriguez@company.com",
          profilePhoto: "/placeholder.svg",
        },
        employees: [
          {
            id: "m1",
            name: "James Miller",
            title: "Content Manager",
            email: "james.miller@company.com",
          },
          {
            id: "m2",
            name: "Maria Garcia",
            title: "Social Media Specialist",
            email: "maria.garcia@company.com",
          },
          {
            id: "m3",
            name: "Jennifer Brown",
            title: "SEO Specialist",
            email: "jennifer.brown@company.com",
          },
        ],
      },
      {
        id: "sales",
        name: "Sales",
        color: "bg-purple-100 border-purple-300 text-purple-800",
        manager: {
          id: "3",
          name: "Kevin Lee",
          title: "Sales Director",
          email: "kevin.lee@company.com",
          profilePhoto: "/placeholder.svg",
        },
        employees: [
          {
            id: "s1",
            name: "Amanda White",
            title: "Senior Sales Rep",
            email: "amanda.white@company.com",
          },
          {
            id: "s2",
            name: "Christopher Davis",
            title: "Sales Rep",
            email: "christopher.davis@company.com",
          },
          {
            id: "s3",
            name: "Patricia Johnson",
            title: "Business Development",
            email: "patricia.johnson@company.com",
          },
          {
            id: "s4",
            name: "Mark Anderson",
            title: "Account Manager",
            email: "mark.anderson@company.com",
          },
        ],
      },
      {
        id: "hr",
        name: "Human Resources",
        color: "bg-orange-100 border-orange-300 text-orange-800",
        manager: {
          id: "4",
          name: "Sandra Wilson",
          title: "HR Director",
          email: "sandra.wilson@company.com",
          profilePhoto: "/placeholder.svg",
        },
        employees: [
          {
            id: "h1",
            name: "Daniel Brown",
            title: "HR Specialist",
            email: "daniel.brown@company.com",
          },
          {
            id: "h2",
            name: "Rachel Green",
            title: "Recruiter",
            email: "rachel.green@company.com",
          },
        ],
      },
      {
        id: "finance",
        name: "Finance",
        color: "bg-yellow-100 border-yellow-300 text-yellow-800",
        manager: {
          id: "5",
          name: "Thomas Miller",
          title: "CFO",
          email: "thomas.miller@company.com",
          profilePhoto: "/placeholder.svg",
        },
        employees: [
          {
            id: "f1",
            name: "Linda Davis",
            title: "Senior Accountant",
            email: "linda.davis@company.com",
          },
          {
            id: "f2",
            name: "Brian Wilson",
            title: "Financial Analyst",
            email: "brian.wilson@company.com",
          },
          {
            id: "f3",
            name: "Susan Taylor",
            title: "Payroll Specialist",
            email: "susan.taylor@company.com",
          },
        ],
      },
    ],
  };

  const toggleDepartment = (deptId: string) => {
    setExpandedDepts((prev) =>
      prev.includes(deptId)
        ? prev.filter((id) => id !== deptId)
        : [...prev, deptId],
    );
  };

  const getTotalEmployees = () => {
    return organizationData.departments.reduce(
      (total, dept) => total + dept.employees.length + 1, // +1 for manager
      1, // +1 for CEO
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <MainNavigation />

      <div className="p-6">
        <div className="flex items-center gap-3 mb-8">
          <Building className="h-8 w-8 text-purple-400" />
          <div>
            <h2 className="text-3xl font-bold">Company Structure</h2>
            <p className="text-muted-foreground">
              Interactive organizational chart with {getTotalEmployees()}{" "}
              employees across {organizationData.departments.length} departments
            </p>
          </div>
        </div>

        {/* Legend */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Department Legend</CardTitle>
            <CardDescription>
              Click on departments to expand and view team members
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {organizationData.departments.map((dept) => (
                <Badge key={dept.id} className={dept.color} variant="outline">
                  {dept.name}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Organization Chart */}
        <div className="space-y-6">
          {/* CEO Level */}
          <div className="flex justify-center">
            <Card className="w-80 border-2 border-yellow-400 bg-yellow-50">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage
                      src={organizationData.ceo.profilePhoto}
                      alt={organizationData.ceo.name}
                    />
                    <AvatarFallback>
                      {organizationData.ceo.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Crown className="h-4 w-4 text-yellow-600" />
                      <span className="font-semibold">
                        {organizationData.ceo.name}
                      </span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {organizationData.ceo.title}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {organizationData.ceo.email}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Connection Line */}
          <div className="flex justify-center">
            <div className="w-px h-8 bg-border"></div>
          </div>

          {/* Departments Level */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {organizationData.departments.map((department) => {
              const isExpanded = expandedDepts.includes(department.id);
              return (
                <div key={department.id} className="space-y-2">
                  <Collapsible>
                    <CollapsibleTrigger asChild>
                      <Card
                        className={`cursor-pointer transition-all hover:shadow-md border-2 ${department.color}`}
                        onClick={() => toggleDepartment(department.id)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <Grip className="h-4 w-4 text-muted-foreground" />
                              <h3 className="font-semibold">
                                {department.name}
                              </h3>
                            </div>
                            {isExpanded ? (
                              <ChevronDown className="h-4 w-4" />
                            ) : (
                              <ChevronRight className="h-4 w-4" />
                            )}
                          </div>

                          {/* Department Manager */}
                          <div className="flex items-center gap-3 mb-2">
                            <Avatar className="h-8 w-8">
                              <AvatarImage
                                src={department.manager.profilePhoto}
                                alt={department.manager.name}
                              />
                              <AvatarFallback>
                                {department.manager.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="flex items-center gap-1">
                                <Crown className="h-3 w-3" />
                                <span className="text-sm font-medium">
                                  {department.manager.name}
                                </span>
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {department.manager.title}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Users className="h-3 w-3" />
                            <span>
                              {department.employees.length + 1} team members
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    </CollapsibleTrigger>

                    <CollapsibleContent className="space-y-2 mt-2">
                      {isExpanded &&
                        department.employees.map((employee) => (
                          <Card
                            key={employee.id}
                            className="ml-4 border-l-4"
                            style={{
                              borderLeftColor: department.color.includes("blue")
                                ? "#3b82f6"
                                : department.color.includes("green")
                                  ? "#10b981"
                                  : department.color.includes("purple")
                                    ? "#8b5cf6"
                                    : department.color.includes("orange")
                                      ? "#f97316"
                                      : "#eab308",
                            }}
                          >
                            <CardContent className="p-3">
                              <div className="flex items-center gap-3">
                                <Avatar className="h-6 w-6">
                                  <AvatarFallback className="text-xs">
                                    {employee.name
                                      .split(" ")
                                      .map((n) => n[0])
                                      .join("")}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                  <div className="flex items-center gap-1">
                                    <User className="h-3 w-3 text-muted-foreground" />
                                    <span className="text-sm font-medium">
                                      {employee.name}
                                    </span>
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    {employee.title}
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                    </CollapsibleContent>
                  </Collapsible>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Actions */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Manage your organizational structure
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <Button variant="outline" className="h-auto p-4 flex-col gap-2">
                <Users className="h-5 w-5" />
                <span>Add Employee</span>
              </Button>
              <Button variant="outline" className="h-auto p-4 flex-col gap-2">
                <Building className="h-5 w-5" />
                <span>Create Department</span>
              </Button>
              <Button variant="outline" className="h-auto p-4 flex-col gap-2">
                <Crown className="h-5 w-5" />
                <span>Assign Managers</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
