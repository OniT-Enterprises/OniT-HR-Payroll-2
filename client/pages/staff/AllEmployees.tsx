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
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import MainNavigation from "@/components/layout/MainNavigation";
import {
  Users,
  Search,
  Plus,
  Download,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function AllEmployees() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Mock employee data
  const employees = [
    {
      id: 1,
      profilePhoto: "/placeholder.svg",
      fullName: "Sarah Johnson",
      jobTitle: "Senior Software Engineer",
      department: "Engineering",
      startDate: "2020-03-15",
      status: "Active",
      email: "sarah.johnson@company.com",
    },
    {
      id: 2,
      profilePhoto: "/placeholder.svg",
      fullName: "Michael Chen",
      jobTitle: "Marketing Manager",
      department: "Marketing",
      startDate: "2019-08-22",
      status: "Active",
      email: "michael.chen@company.com",
    },
    {
      id: 3,
      profilePhoto: "/placeholder.svg",
      fullName: "Emily Rodriguez",
      jobTitle: "HR Specialist",
      department: "Human Resources",
      startDate: "2021-01-10",
      status: "On Leave",
      email: "emily.rodriguez@company.com",
    },
    {
      id: 4,
      profilePhoto: "/placeholder.svg",
      fullName: "David Wilson",
      jobTitle: "Data Analyst",
      department: "Analytics",
      startDate: "2020-11-05",
      status: "Active",
      email: "david.wilson@company.com",
    },
    {
      id: 5,
      profilePhoto: "/placeholder.svg",
      fullName: "Lisa Thompson",
      jobTitle: "UX Designer",
      department: "Design",
      startDate: "2021-06-14",
      status: "Active",
      email: "lisa.thompson@company.com",
    },
    {
      id: 6,
      profilePhoto: "/placeholder.svg",
      fullName: "James Miller",
      jobTitle: "Finance Director",
      department: "Finance",
      startDate: "2018-04-01",
      status: "Active",
      email: "james.miller@company.com",
    },
    {
      id: 7,
      profilePhoto: "/placeholder.svg",
      fullName: "Maria Garcia",
      jobTitle: "Sales Representative",
      department: "Sales",
      startDate: "2022-02-28",
      status: "Active",
      email: "maria.garcia@company.com",
    },
    {
      id: 8,
      profilePhoto: "/placeholder.svg",
      fullName: "Robert Taylor",
      jobTitle: "DevOps Engineer",
      department: "Engineering",
      startDate: "2021-09-12",
      status: "Archived",
      email: "robert.taylor@company.com",
    },
    {
      id: 9,
      profilePhoto: "/placeholder.svg",
      fullName: "Jennifer Brown",
      jobTitle: "Product Manager",
      department: "Product",
      startDate: "2020-07-20",
      status: "Active",
      email: "jennifer.brown@company.com",
    },
    {
      id: 10,
      profilePhoto: "/placeholder.svg",
      fullName: "Kevin Lee",
      jobTitle: "Customer Support Lead",
      department: "Support",
      startDate: "2021-12-03",
      status: "Active",
      email: "kevin.lee@company.com",
    },
    {
      id: 11,
      profilePhoto: "/placeholder.svg",
      fullName: "Amanda White",
      jobTitle: "Legal Counsel",
      department: "Legal",
      startDate: "2019-10-15",
      status: "Active",
      email: "amanda.white@company.com",
    },
    {
      id: 12,
      profilePhoto: "/placeholder.svg",
      fullName: "Christopher Davis",
      jobTitle: "IT Administrator",
      department: "IT",
      startDate: "2020-01-08",
      status: "On Leave",
      email: "christopher.davis@company.com",
    },
  ];

  // Filter employees based on search term
  const filteredEmployees = employees.filter(
    (employee) =>
      employee.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.department.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  // Pagination logic
  const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentEmployees = filteredEmployees.slice(startIndex, endIndex);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-800";
      case "On Leave":
        return "bg-yellow-100 text-yellow-800";
      case "Archived":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const exportToCSV = () => {
    const headers = [
      "Full Name",
      "Job Title",
      "Department",
      "Start Date",
      "Status",
      "Email",
    ];
    const csvContent = [
      headers.join(","),
      ...filteredEmployees.map((emp) =>
        [
          emp.fullName,
          emp.jobTitle,
          emp.department,
          emp.startDate,
          emp.status,
          emp.email,
        ].join(","),
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "employees.csv";
    a.click();
  };

  return (
    <div className="min-h-screen bg-background">
      <MainNavigation />

      <div className="p-6">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Users className="h-8 w-8 text-purple-400" />
            <div>
              <h1 className="text-3xl font-bold">All Employees</h1>
              <p className="text-muted-foreground">
                Manage your team members and their information
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={exportToCSV}>
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
            <Button onClick={() => navigate("/staff/add")}>
              <Plus className="mr-2 h-4 w-4" />
              New Employee
            </Button>
          </div>
        </div>

        {/* Search Bar */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, or department..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </CardContent>
        </Card>

        {/* Employee Table */}
        <Card>
          <CardHeader>
            <CardTitle>Employee Directory</CardTitle>
            <CardDescription>
              {filteredEmployees.length} employees found
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Job Title</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentEmployees.map((employee) => (
                  <TableRow key={employee.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage
                            src={employee.profilePhoto}
                            alt={employee.fullName}
                          />
                          <AvatarFallback>
                            {employee.fullName
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{employee.fullName}</div>
                          <div className="text-sm text-muted-foreground">
                            {employee.email}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{employee.jobTitle}</TableCell>
                    <TableCell>{employee.department}</TableCell>
                    <TableCell>{formatDate(employee.startDate)}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(employee.status)}>
                        {employee.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* Pagination */}
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-muted-foreground">
                Showing {startIndex + 1} to{" "}
                {Math.min(endIndex, filteredEmployees.length)} of{" "}
                {filteredEmployees.length} employees
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <span className="text-sm">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
