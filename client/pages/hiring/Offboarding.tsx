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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
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
import MainNavigation from "@/components/layout/MainNavigation";
import {
  UserMinus,
  Calendar,
  FileText,
  Mail,
  Key,
  CreditCard,
  Building,
  CheckCircle,
  AlertTriangle,
  Clock,
  DollarSign,
  Shield,
  Archive,
  Download,
} from "lucide-react";

export default function Offboarding() {
  const [selectedEmployee, setSelectedEmployee] = useState<string>("");
  const [offboardingType, setOffboardingType] = useState<string>("");
  const [checklist, setChecklist] = useState({
    accessRevoked: false,
    equipmentReturned: false,
    documentsSigned: false,
    knowledgeTransfer: false,
    finalPayCalculated: false,
    benefitsCancelled: false,
    exitInterview: false,
    referenceLetter: false,
  });

  // Mock employee data
  const employees = [
    {
      id: 1,
      name: "John Smith",
      department: "Engineering",
      position: "Senior Developer",
      email: "john.smith@company.com",
      startDate: "2020-03-15",
      status: "Active",
    },
    {
      id: 2,
      name: "Sarah Wilson",
      department: "Marketing",
      position: "Marketing Manager",
      email: "sarah.wilson@company.com",
      startDate: "2019-08-22",
      status: "Active",
    },
    {
      id: 3,
      name: "Mike Johnson",
      department: "HR",
      position: "HR Specialist",
      email: "mike.johnson@company.com",
      startDate: "2021-01-10",
      status: "Notice Period",
    },
  ];

  // Mock offboarding cases
  const offboardingCases = [
    {
      id: 1,
      employeeName: "David Brown",
      department: "Sales",
      reason: "Resignation",
      lastWorkingDay: "2024-02-28",
      status: "In Progress",
      completedSteps: 5,
      totalSteps: 8,
    },
    {
      id: 2,
      employeeName: "Lisa Chen",
      department: "Finance",
      reason: "Redundancy",
      lastWorkingDay: "2024-02-15",
      status: "Completed",
      completedSteps: 8,
      totalSteps: 8,
    },
  ];

  const handleChecklistUpdate = (item: string) => {
    setChecklist((prev) => ({
      ...prev,
      [item]: !prev[item],
    }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed":
        return "bg-green-100 text-green-800";
      case "In Progress":
        return "bg-yellow-100 text-yellow-800";
      case "Pending":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getReasonColor = (reason: string) => {
    switch (reason) {
      case "Resignation":
        return "bg-blue-100 text-blue-800";
      case "Redundancy":
        return "bg-orange-100 text-orange-800";
      case "Termination":
        return "bg-red-100 text-red-800";
      case "Retirement":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <MainNavigation />

      <div className="p-6">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <UserMinus className="h-8 w-8 text-green-400" />
            <div>
              <h1 className="text-3xl font-bold">Employee Offboarding</h1>
              <p className="text-muted-foreground">
                Manage employee departures and exit processes
              </p>
            </div>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <UserMinus className="mr-2 h-4 w-4" />
                Start Offboarding Process
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Initiate Employee Offboarding</DialogTitle>
                <DialogDescription>
                  Start the offboarding process for a departing employee
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="employee">Select Employee</Label>
                  <Select
                    value={selectedEmployee}
                    onValueChange={setSelectedEmployee}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose an employee..." />
                    </SelectTrigger>
                    <SelectContent>
                      {employees.map((employee) => (
                        <SelectItem
                          key={employee.id}
                          value={employee.id.toString()}
                        >
                          {employee.name} - {employee.department}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reason">Departure Reason</Label>
                  <Select
                    value={offboardingType}
                    onValueChange={setOffboardingType}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select reason..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="resignation">Resignation</SelectItem>
                      <SelectItem value="redundancy">Redundancy</SelectItem>
                      <SelectItem value="termination">Termination</SelectItem>
                      <SelectItem value="retirement">Retirement</SelectItem>
                      <SelectItem value="contract-end">Contract End</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="lastDay">Last Working Day</Label>
                    <Input id="lastDay" type="date" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="noticeDate">Notice Date</Label>
                    <Input id="noticeDate" type="date" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Additional Notes</Label>
                  <Textarea
                    id="notes"
                    placeholder="Any special instructions or notes..."
                  />
                </div>
                <div className="flex justify-end gap-3">
                  <Button variant="outline">Cancel</Button>
                  <Button>Start Offboarding</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          {/* Statistics */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Active Offboardings
                  </p>
                  <p className="text-2xl font-bold">3</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Completed This Month
                  </p>
                  <p className="text-2xl font-bold">8</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Pending Actions
                  </p>
                  <p className="text-2xl font-bold">5</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Active Offboarding Cases */}
          <Card>
            <CardHeader>
              <CardTitle>Active Offboarding Cases</CardTitle>
              <CardDescription>
                Employees currently in the offboarding process
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {offboardingCases.map((case_) => (
                  <div key={case_.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-semibold">{case_.employeeName}</h4>
                        <p className="text-sm text-muted-foreground">
                          {case_.department}
                        </p>
                      </div>
                      <Badge className={getStatusColor(case_.status)}>
                        {case_.status}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progress:</span>
                        <span>
                          {case_.completedSteps}/{case_.totalSteps} completed
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full"
                          style={{
                            width: `${(case_.completedSteps / case_.totalSteps) * 100}%`,
                          }}
                        ></div>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <Badge className={getReasonColor(case_.reason)}>
                          {case_.reason}
                        </Badge>
                        <span className="text-muted-foreground">
                          Last day: {case_.lastWorkingDay}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-3">
                      <Button size="sm" variant="outline">
                        View Details
                      </Button>
                      <Button size="sm">Continue Process</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Offboarding Checklist */}
          <Card>
            <CardHeader>
              <CardTitle>Offboarding Checklist</CardTitle>
              <CardDescription>
                Standard items to complete for employee departures
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  {
                    id: "accessRevoked",
                    label: "Revoke System Access",
                    icon: <Key className="h-4 w-4" />,
                  },
                  {
                    id: "equipmentReturned",
                    label: "Equipment Return",
                    icon: <Building className="h-4 w-4" />,
                  },
                  {
                    id: "documentsSigned",
                    label: "Exit Documents Signed",
                    icon: <FileText className="h-4 w-4" />,
                  },
                  {
                    id: "knowledgeTransfer",
                    label: "Knowledge Transfer",
                    icon: <Archive className="h-4 w-4" />,
                  },
                  {
                    id: "finalPayCalculated",
                    label: "Final Pay Calculated",
                    icon: <DollarSign className="h-4 w-4" />,
                  },
                  {
                    id: "benefitsCancelled",
                    label: "Benefits Cancelled",
                    icon: <CreditCard className="h-4 w-4" />,
                  },
                  {
                    id: "exitInterview",
                    label: "Exit Interview Completed",
                    icon: <Mail className="h-4 w-4" />,
                  },
                  {
                    id: "referenceLetter",
                    label: "Reference Letter Prepared",
                    icon: <Download className="h-4 w-4" />,
                  },
                ].map((item) => (
                  <div key={item.id} className="flex items-center space-x-3">
                    <Checkbox
                      id={item.id}
                      checked={checklist[item.id]}
                      onCheckedChange={() => handleChecklistUpdate(item.id)}
                    />
                    <div className="flex items-center gap-2">
                      {item.icon}
                      <label htmlFor={item.id} className="text-sm font-medium">
                        {item.label}
                      </label>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6">
                <Button className="w-full">Save Checklist Progress</Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Exit Interview Form */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Exit Interview Questions
            </CardTitle>
            <CardDescription>
              Standard questions for departing employees
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="satisfaction">Overall Job Satisfaction</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Rate satisfaction..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="very-satisfied">
                        Very Satisfied
                      </SelectItem>
                      <SelectItem value="satisfied">Satisfied</SelectItem>
                      <SelectItem value="neutral">Neutral</SelectItem>
                      <SelectItem value="dissatisfied">Dissatisfied</SelectItem>
                      <SelectItem value="very-dissatisfied">
                        Very Dissatisfied
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reason">Primary Reason for Leaving</Label>
                  <Textarea
                    id="reason"
                    placeholder="Please explain your primary reason for leaving..."
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="improvements">
                    Suggestions for Improvement
                  </Label>
                  <Textarea
                    id="improvements"
                    placeholder="What could the company do better?"
                    rows={3}
                  />
                </div>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="manager">Manager Relationship</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Rate manager relationship..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="excellent">Excellent</SelectItem>
                      <SelectItem value="good">Good</SelectItem>
                      <SelectItem value="average">Average</SelectItem>
                      <SelectItem value="poor">Poor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="recommend">Would Recommend Company</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Would you recommend us?" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="yes">Yes, definitely</SelectItem>
                      <SelectItem value="maybe">Maybe</SelectItem>
                      <SelectItem value="no">No</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="additional">Additional Comments</Label>
                  <Textarea
                    id="additional"
                    placeholder="Any other feedback or comments..."
                    rows={3}
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <Button variant="outline">Save Draft</Button>
              <Button>Complete Exit Interview</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
