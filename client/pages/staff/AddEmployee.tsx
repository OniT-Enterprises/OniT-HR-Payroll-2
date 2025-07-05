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
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import MainNavigation from "@/components/layout/MainNavigation";
import { employeeService, type Employee } from "@/services/employeeService";
import CSVColumnMapper from "@/components/CSVColumnMapper";
import {
  UserPlus,
  Upload,
  Save,
  ArrowLeft,
  CreditCard,
  DollarSign,
  Calendar,
  AlertTriangle,
  FileDown,
  FileUp,
  Info,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function AddEmployee() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    profilePhoto: null,
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    emergencyContactName: "",
    emergencyContactPhone: "",
    department: "",
    jobTitle: "",
    manager: "",
    startDate: "",
    employmentType: "Full-time",
    status: "Active",
    salary: "",
    leaveDays: "",
    benefits: "",
  });

  const [documents, setDocuments] = useState([
    { id: 1, type: "Social Security Number", number: "", expiryDate: "" },
    { id: 2, type: "Electoral Card Number", number: "", expiryDate: "" },
    { id: 3, type: "ID Card", number: "", expiryDate: "" },
    { id: 4, type: "Passport", number: "", expiryDate: "" },
  ]);

  const [showImportDialog, setShowImportDialog] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Mock data for dropdowns (would come from Firestore)
  const departments = [
    { id: "eng", name: "Engineering" },
    { id: "marketing", name: "Marketing" },
    { id: "hr", name: "Human Resources" },
    { id: "sales", name: "Sales" },
    { id: "finance", name: "Finance" },
    { id: "design", name: "Design" },
    { id: "product", name: "Product" },
    { id: "support", name: "Customer Support" },
  ];

  const managers = [
    { id: "1", name: "Sarah Johnson" },
    { id: "2", name: "Michael Chen" },
    { id: "3", name: "Emily Rodriguez" },
    { id: "4", name: "James Miller" },
    { id: "5", name: "Jennifer Brown" },
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleDocumentChange = (id: number, field: string, value: string) => {
    setDocuments((prev) =>
      prev.map((doc) => (doc.id === id ? { ...doc, [field]: value } : doc)),
    );
  };

  const getExpiryStatus = (expiryDate: string) => {
    if (!expiryDate) return null;

    const today = new Date();
    const expiry = new Date(expiryDate);
    const timeDiff = expiry.getTime() - today.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));

    if (daysDiff < 0) {
      return {
        status: "expired",
        message: "Expired",
        variant: "destructive" as const,
      };
    } else if (daysDiff <= 28) {
      return {
        status: "expiring",
        message: `Expires in ${daysDiff} days`,
        variant: "destructive" as const,
      };
    } else if (daysDiff <= 60) {
      return {
        status: "warning",
        message: `Expires in ${daysDiff} days`,
        variant: "secondary" as const,
      };
    }
    return { status: "valid", message: "Valid", variant: "default" as const };
  };

  const downloadTemplate = () => {
    const headers = [
      "firstName",
      "lastName",
      "email",
      "phone",
      "emergencyContactName",
      "emergencyContactPhone",
      "department",
      "jobTitle",
      "manager",
      "startDate",
      "employmentType",
      "salary",
      "leaveDays",
      "benefits",
      "socialSecurityNumber",
      "socialSecurityExpiry",
      "electoralCardNumber",
      "electoralCardExpiry",
      "idCardNumber",
      "idCardExpiry",
      "passportNumber",
      "passportExpiry",
    ];

    const sampleData = [
      "John",
      "Doe",
      "john.doe@company.com",
      "+1234567890",
      "Jane Doe",
      "+1987654321",
      "eng",
      "Software Engineer",
      "1",
      "2024-02-01",
      "Full-time",
      "75000",
      "25",
      "standard",
      "123-45-6789",
      "2030-12-31",
      "EC123456789",
      "2029-06-15",
      "ID987654321",
      "2028-03-20",
      "P123456789",
      "2030-01-15",
    ];

    const csvContent = [headers, sampleData]
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "employee_import_template.csv";
    link.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: "Template Downloaded",
      description: "Employee import template has been downloaded successfully.",
    });
  };

  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImportFile(file);
    }
  };

  const processCSVImport = async () => {
    if (!importFile) {
      toast({
        title: "No File Selected",
        description: "Please select a CSV file to import.",
        variant: "destructive",
      });
      return;
    }

    try {
      const text = await importFile.text();
      const lines = text.split("\n");
      const headers = lines[0]
        .split(",")
        .map((header) => header.replace(/"/g, "").trim());

      if (lines.length < 2) {
        toast({
          title: "Empty File",
          description:
            "The CSV file appears to be empty or contains only headers.",
          variant: "destructive",
        });
        return;
      }

      // Process first data row (for demo - in production you'd handle multiple rows)
      const dataRow = lines[1]
        .split(",")
        .map((cell) => cell.replace(/"/g, "").trim());

      const employeeData: any = {};
      headers.forEach((header, index) => {
        employeeData[header] = dataRow[index] || "";
      });

      // Map CSV data to form data
      setFormData({
        profilePhoto: null,
        firstName: employeeData.firstName || "",
        lastName: employeeData.lastName || "",
        email: employeeData.email || "",
        phone: employeeData.phone || "",
        emergencyContactName: employeeData.emergencyContactName || "",
        emergencyContactPhone: employeeData.emergencyContactPhone || "",
        department: employeeData.department || "",
        jobTitle: employeeData.jobTitle || "",
        manager: employeeData.manager || "",
        startDate: employeeData.startDate || "",
        employmentType: employeeData.employmentType || "Full-time",
        status: "Active",
        salary: employeeData.salary || "",
        leaveDays: employeeData.leaveDays || "",
        benefits: employeeData.benefits || "",
      });

      // Map documents data
      setDocuments([
        {
          id: 1,
          type: "Social Security Number",
          number: employeeData.socialSecurityNumber || "",
          expiryDate: employeeData.socialSecurityExpiry || "",
        },
        {
          id: 2,
          type: "Electoral Card Number",
          number: employeeData.electoralCardNumber || "",
          expiryDate: employeeData.electoralCardExpiry || "",
        },
        {
          id: 3,
          type: "ID Card",
          number: employeeData.idCardNumber || "",
          expiryDate: employeeData.idCardExpiry || "",
        },
        {
          id: 4,
          type: "Passport",
          number: employeeData.passportNumber || "",
          expiryDate: employeeData.passportExpiry || "",
        },
      ]);

      setShowImportDialog(false);
      setImportFile(null);

      toast({
        title: "Import Successful",
        description: `Employee data imported successfully. Please review and save.`,
      });
    } catch (error) {
      toast({
        title: "Import Failed",
        description:
          "Failed to process CSV file. Please check the file format.",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isSubmitting) return; // Prevent double submission

    // Basic validation
    if (
      !formData.firstName ||
      !formData.lastName ||
      !formData.email ||
      !formData.department ||
      !formData.jobTitle
    ) {
      toast({
        title: "Validation Error",
        description:
          "Please fill in all required fields (First Name, Last Name, Email, Department, Job Title).",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Generate employee ID
      const currentDate = new Date();
      const employeeId = `EMP${Math.floor(Math.random() * 900) + 100}`;

      // Create employee object in the format expected by Firebase
      const newEmployee: Omit<Employee, "id"> = {
        personalInfo: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          address: "", // Could be added to form later
          dateOfBirth: "", // Could be added to form later
          socialSecurityNumber: documents[0]?.number || "",
          emergencyContactName: formData.emergencyContactName,
          emergencyContactPhone: formData.emergencyContactPhone,
        },
        jobDetails: {
          employeeId: employeeId,
          department: formData.department,
          position: formData.jobTitle,
          hireDate:
            formData.startDate || currentDate.toISOString().split("T")[0],
          employmentType: formData.employmentType,
          workLocation: "Office", // Default value
          manager: formData.manager,
        },
        compensation: {
          annualSalary: parseInt(formData.salary) || 0,
          annualLeaveDays: parseInt(formData.leaveDays) || 25,
          benefitsPackage: formData.benefits || "Standard",
        },
        documents: {
          socialSecurityNumber: {
            number: documents[0]?.number || "",
            expiryDate: documents[0]?.expiryDate || "",
          },
          electoralCard: {
            number: documents[1]?.number || "",
            expiryDate: documents[1]?.expiryDate || "",
          },
          idCard: {
            number: documents[2]?.number || "",
            expiryDate: documents[2]?.expiryDate || "",
          },
          passport: {
            number: documents[3]?.number || "",
            expiryDate: documents[3]?.expiryDate || "",
          },
        },
        status: formData.status === "Active" ? "active" : "inactive",
      };

      // Save to Firebase
      const employeeId_returned =
        await employeeService.addEmployee(newEmployee);

      if (employeeId_returned) {
        toast({
          title: "Success",
          description: `Employee ${formData.firstName} ${formData.lastName} added successfully!`,
        });

        // Navigate back to All Employees
        navigate("/staff/employees");
      } else {
        throw new Error("Failed to save employee");
      }
    } catch (error) {
      console.error("Error adding employee:", error);
      toast({
        title: "Error",
        description: "Failed to add employee. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <MainNavigation />

      <div className="p-6">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/staff/employees")}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <UserPlus className="h-8 w-8 text-purple-400" />
            <div>
              <h2 className="text-3xl font-bold">New Employee Profile</h2>
              <p className="text-muted-foreground">
                Add a new team member to your organization
              </p>
            </div>
          </div>

          {/* CSV Import Options */}
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={downloadTemplate}>
              <FileDown className="mr-2 h-4 w-4" />
              Download Template
            </Button>

            <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
              <DialogTrigger asChild>
                <Button type="button" variant="outline">
                  <FileUp className="mr-2 h-4 w-4" />
                  Import CSV
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Import Employee Data</DialogTitle>
                  <DialogDescription>
                    Upload a CSV file with employee information. Download the
                    template first for the correct format.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="csvFile">CSV File</Label>
                    <Input
                      id="csvFile"
                      type="file"
                      accept=".csv"
                      onChange={handleFileImport}
                      className="mt-1"
                    />
                  </div>
                  {importFile && (
                    <div className="text-sm text-muted-foreground">
                      Selected: {importFile.name}
                    </div>
                  )}
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setShowImportDialog(false);
                        setImportFile(null);
                      }}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="button"
                      onClick={processCSVImport}
                      className="flex-1"
                    >
                      Import Data
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Profile Photo */}
            <Card>
              <CardHeader>
                <CardTitle>Profile Photo</CardTitle>
                <CardDescription>
                  Upload a profile picture for the employee
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center gap-4">
                  <div className="w-32 h-32 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center">
                    <Upload className="h-8 w-8 text-gray-400" />
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    id="profilePhoto"
                  />
                  <label htmlFor="profilePhoto">
                    <Button type="button" variant="outline" asChild>
                      <span>Upload Photo</span>
                    </Button>
                  </label>
                </div>
              </CardContent>
            </Card>

            {/* Personal Information */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>
                  Basic information about the employee
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) =>
                        handleInputChange("firstName", e.target.value)
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) =>
                        handleInputChange("lastName", e.target.value)
                      }
                      required
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        handleInputChange("email", e.target.value)
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) =>
                        handleInputChange("phone", e.target.value)
                      }
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="emergencyContactName">
                        Emergency Contact Name
                      </Label>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="max-w-xs">
                              Person to contact in case of emergency, medical
                              situation, or urgent workplace incident involving
                              this employee.
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <Input
                      id="emergencyContactName"
                      value={formData.emergencyContactName}
                      onChange={(e) =>
                        handleInputChange(
                          "emergencyContactName",
                          e.target.value,
                        )
                      }
                      placeholder="Enter contact name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="emergencyContactPhone">
                      Emergency Contact Phone
                    </Label>
                    <Input
                      id="emergencyContactPhone"
                      type="tel"
                      value={formData.emergencyContactPhone}
                      onChange={(e) =>
                        handleInputChange(
                          "emergencyContactPhone",
                          e.target.value,
                        )
                      }
                      placeholder="Enter contact phone number"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Job Information */}
            <Card className="lg:col-span-3">
              <CardHeader>
                <CardTitle>Job Information</CardTitle>
                <CardDescription>Role and department details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="department">Department *</Label>
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
                          <SelectItem key={dept.id} value={dept.id}>
                            {dept.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="jobTitle">Job Title *</Label>
                    <Input
                      id="jobTitle"
                      value={formData.jobTitle}
                      onChange={(e) =>
                        handleInputChange("jobTitle", e.target.value)
                      }
                      required
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="manager">Manager</Label>
                    <Select
                      value={formData.manager}
                      onValueChange={(value) =>
                        handleInputChange("manager", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select manager" />
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
                    <Label htmlFor="startDate">Start Date *</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={formData.startDate}
                      onChange={(e) =>
                        handleInputChange("startDate", e.target.value)
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="employmentType">Employment Type</Label>
                    <Select
                      value={formData.employmentType}
                      onValueChange={(value) =>
                        handleInputChange("employmentType", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Full-time">Full-time</SelectItem>
                        <SelectItem value="Part-time">Part-time</SelectItem>
                        <SelectItem value="Contractor">Contractor</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value) =>
                        handleInputChange("status", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Active">Active</SelectItem>
                        <SelectItem value="On Leave">On Leave</SelectItem>
                        <SelectItem value="Archived">Archived</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Documents Section */}
            <Card className="lg:col-span-3">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Documents & Identification
                </CardTitle>
                <CardDescription>
                  Employee identification documents with expiry tracking
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Document Type</TableHead>
                      <TableHead>Number/ID</TableHead>
                      <TableHead>Expiry Date</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {documents.map((document) => {
                      const expiryStatus = getExpiryStatus(document.expiryDate);
                      return (
                        <TableRow key={document.id}>
                          <TableCell className="font-medium">
                            {document.type}
                          </TableCell>
                          <TableCell>
                            <Input
                              value={document.number}
                              onChange={(e) =>
                                handleDocumentChange(
                                  document.id,
                                  "number",
                                  e.target.value,
                                )
                              }
                              placeholder="Enter number"
                              className="max-w-xs"
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="date"
                              value={document.expiryDate}
                              onChange={(e) =>
                                handleDocumentChange(
                                  document.id,
                                  "expiryDate",
                                  e.target.value,
                                )
                              }
                              className="max-w-xs"
                            />
                          </TableCell>
                          <TableCell>
                            {expiryStatus && (
                              <Badge variant={expiryStatus.variant}>
                                {expiryStatus.status === "expiring" && (
                                  <AlertTriangle className="h-3 w-3 mr-1" />
                                )}
                                {expiryStatus.message}
                              </Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>

                {/* Show expiry warnings */}
                {documents.some((doc) => {
                  const status = getExpiryStatus(doc.expiryDate);
                  return (
                    status &&
                    (status.status === "expired" ||
                      status.status === "expiring")
                  );
                }) && (
                  <Alert className="mt-4">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      Some documents are expired or expiring soon. Please ensure
                      all employee documents are up to date.
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>

            {/* Salary & Benefits Section */}
            <Card className="lg:col-span-3">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Compensation & Benefits
                </CardTitle>
                <CardDescription>
                  Salary, leave allowance, and benefits information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="salary">Annual Salary</Label>
                    <Input
                      id="salary"
                      type="number"
                      value={formData.salary}
                      onChange={(e) =>
                        handleInputChange("salary", e.target.value)
                      }
                      placeholder="e.g., 75000"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="leaveDays">Annual Leave Days</Label>
                    <Input
                      id="leaveDays"
                      type="number"
                      value={formData.leaveDays}
                      onChange={(e) =>
                        handleInputChange("leaveDays", e.target.value)
                      }
                      placeholder="e.g., 25"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="benefits">Benefits Package</Label>
                    <Select
                      value={formData.benefits}
                      onValueChange={(value) =>
                        handleInputChange("benefits", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select benefits package" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="basic">Basic Package</SelectItem>
                        <SelectItem value="standard">
                          Standard Package
                        </SelectItem>
                        <SelectItem value="premium">Premium Package</SelectItem>
                        <SelectItem value="executive">
                          Executive Package
                        </SelectItem>
                        <SelectItem value="custom">Custom Package</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 mt-8">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/staff/employees")}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              <Save className="mr-2 h-4 w-4" />
              {isSubmitting ? "Saving..." : "Save Employee"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
