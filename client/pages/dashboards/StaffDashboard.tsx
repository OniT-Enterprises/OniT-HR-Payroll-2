import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import MainNavigation from "@/components/layout/MainNavigation";
import {
  Users,
  UserCheck,
  UserX,
  Building,
  TrendingUp,
  Calendar,
  Award,
  Briefcase,
} from "lucide-react";

export default function StaffDashboard() {
  return (
    <div className="min-h-screen bg-gray-50">
      <MainNavigation />

      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-4">
              <Users className="h-8 w-8 text-cyan-400" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Staff Dashboard
                </h1>
                <p className="text-gray-600">
                  Overview of employee management and organization
                </p>
              </div>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Total Employees
                    </p>
                    <p className="text-2xl font-bold">156</p>
                    <p className="text-xs text-green-600">+5 this month</p>
                  </div>
                  <Users className="h-8 w-8 text-cyan-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Active Employees
                    </p>
                    <p className="text-2xl font-bold">148</p>
                    <p className="text-xs text-blue-600">94.9% active rate</p>
                  </div>
                  <UserCheck className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Departments
                    </p>
                    <p className="text-2xl font-bold">8</p>
                    <p className="text-xs text-purple-600">
                      Across all divisions
                    </p>
                  </div>
                  <Building className="h-8 w-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      On Leave
                    </p>
                    <p className="text-2xl font-bold">8</p>
                    <p className="text-xs text-orange-600">5.1% of workforce</p>
                  </div>
                  <Calendar className="h-8 w-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Department Overview & Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Department Breakdown</CardTitle>
                <CardDescription>
                  Employee distribution by department
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <div>
                        <p className="text-sm font-medium">Engineering</p>
                        <p className="text-xs text-gray-600">
                          Software Development
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold">45</p>
                      <p className="text-xs text-gray-600">28.8%</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <div>
                        <p className="text-sm font-medium">Sales</p>
                        <p className="text-xs text-gray-600">
                          Revenue Generation
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold">32</p>
                      <p className="text-xs text-gray-600">20.5%</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                      <div>
                        <p className="text-sm font-medium">Marketing</p>
                        <p className="text-xs text-gray-600">Brand & Growth</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold">24</p>
                      <p className="text-xs text-gray-600">15.4%</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                      <div>
                        <p className="text-sm font-medium">Operations</p>
                        <p className="text-xs text-gray-600">Support & Admin</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold">18</p>
                      <p className="text-xs text-gray-600">11.5%</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
                      <div>
                        <p className="text-sm font-medium">Other Departments</p>
                        <p className="text-xs text-gray-600">
                          HR, Finance, Legal
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold">37</p>
                      <p className="text-xs text-gray-600">23.8%</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Staff Activity</CardTitle>
                <CardDescription>
                  Latest employee management updates
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                    <UserCheck className="h-5 w-5 text-green-600" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">New Employee Added</p>
                      <p className="text-xs text-gray-600">
                        Jessica Wong joined Engineering team
                      </p>
                    </div>
                    <Badge className="bg-green-100 text-green-800">New</Badge>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                    <TrendingUp className="h-5 w-5 text-blue-600" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Promotion Updated</p>
                      <p className="text-xs text-gray-600">
                        Mike Chen promoted to Senior Developer
                      </p>
                    </div>
                    <Badge className="bg-blue-100 text-blue-800">
                      Promoted
                    </Badge>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                    <Building className="h-5 w-5 text-purple-600" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Department Transfer</p>
                      <p className="text-xs text-gray-600">
                        Sarah Miller moved to Product team
                      </p>
                    </div>
                    <Badge className="bg-purple-100 text-purple-800">
                      Transfer
                    </Badge>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
                    <Calendar className="h-5 w-5 text-orange-600" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Leave Request</p>
                      <p className="text-xs text-gray-600">
                        3 employees on vacation this week
                      </p>
                    </div>
                    <Badge className="bg-orange-100 text-orange-800">
                      Leave
                    </Badge>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-red-50 rounded-lg">
                    <UserX className="h-5 w-5 text-red-600" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Employee Departure</p>
                      <p className="text-xs text-gray-600">
                        John Davis completed offboarding
                      </p>
                    </div>
                    <Badge className="bg-red-100 text-red-800">Departed</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
