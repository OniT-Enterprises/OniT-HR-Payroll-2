import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { type Employee } from "@/services/employeeService";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Briefcase,
  DollarSign,
  Building,
  FileText,
  Shield,
  CreditCard,
  Globe,
  Users,
  X,
} from "lucide-react";

interface EmployeeProfileViewProps {
  employee: Employee | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function EmployeeProfileView({
  employee,
  open,
  onOpenChange,
}: EmployeeProfileViewProps) {
  if (!employee) return null;

  const formatSalary = (annualSalary: number) => {
    const monthlySalary = annualSalary / 12;
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(monthlySalary);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "inactive":
        return "bg-yellow-100 text-yellow-800";
      case "terminated":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <Avatar className="w-12 h-12">
              <AvatarImage
                src="/placeholder.svg"
                alt={employee.personalInfo.firstName}
              />
              <AvatarFallback>
                {employee.personalInfo.firstName[0]}
                {employee.personalInfo.lastName[0]}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-2xl font-bold">
                {employee.personalInfo.firstName}{" "}
                {employee.personalInfo.lastName}
              </h2>
              <p className="text-muted-foreground">
                {employee.jobDetails.position} • ID:{" "}
                {employee.jobDetails.employeeId}
              </p>
            </div>
            <div className="ml-auto">
              <Badge className={getStatusColor(employee.status)}>
                {employee.status.charAt(0).toUpperCase() +
                  employee.status.slice(1)}
              </Badge>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="grid lg:grid-cols-3 gap-6 mt-6">
          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="font-medium">{employee.personalInfo.email}</p>
                  <p className="text-sm text-muted-foreground">Email</p>
                </div>
              </div>
              {employee.personalInfo.phone && (
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{employee.personalInfo.phone}</p>
                    <p className="text-sm text-muted-foreground">Phone</p>
                  </div>
                </div>
              )}
              {employee.personalInfo.emergencyContactName && (
                <div className="flex items-center gap-3">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium">
                      {employee.personalInfo.emergencyContactName}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Emergency Contact
                    </p>
                    {employee.personalInfo.emergencyContactPhone && (
                      <p className="text-sm text-muted-foreground">
                        {employee.personalInfo.emergencyContactPhone}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Job Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                Job Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Building className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="font-medium">
                    {employee.jobDetails.department}
                  </p>
                  <p className="text-sm text-muted-foreground">Department</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Briefcase className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="font-medium">{employee.jobDetails.position}</p>
                  <p className="text-sm text-muted-foreground">Position</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="font-medium">{employee.jobDetails.hireDate}</p>
                  <p className="text-sm text-muted-foreground">Hire Date</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="font-medium">
                    {employee.jobDetails.workLocation}
                  </p>
                  <p className="text-sm text-muted-foreground">Work Location</p>
                </div>
              </div>
              <Badge variant="outline">
                {employee.jobDetails.employmentType}
              </Badge>
              {employee.jobDetails.manager && (
                <div className="flex items-center gap-3">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{employee.jobDetails.manager}</p>
                    <p className="text-sm text-muted-foreground">Manager</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Compensation */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Compensation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="font-medium text-lg">
                    {formatSalary(employee.compensation.annualSalary)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Monthly Salary
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="font-medium">
                    {employee.compensation.annualLeaveDays} days
                  </p>
                  <p className="text-sm text-muted-foreground">Annual Leave</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Shield className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="font-medium">
                    {employee.compensation.benefitsPackage}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Benefits Package
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Documents - Full Width */}
          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Documents & Identification
              </CardTitle>
              <CardDescription>
                Employee identification documents with expiry tracking
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Social Security Number */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Social Security Number</span>
                  </div>
                  {employee.documents.socialSecurityNumber.number ? (
                    <div>
                      <p className="text-sm">
                        {employee.documents.socialSecurityNumber.number}
                      </p>
                      {employee.documents.socialSecurityNumber.expiryDate && (
                        <div className="mt-1">
                          {(() => {
                            const status = getExpiryStatus(
                              employee.documents.socialSecurityNumber
                                .expiryDate,
                            );
                            return status ? (
                              <Badge
                                variant={status.variant}
                                className="text-xs"
                              >
                                {status.message}
                              </Badge>
                            ) : null;
                          })()}
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Not provided
                    </p>
                  )}
                </div>

                {/* Electoral Card */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Electoral Card</span>
                  </div>
                  {employee.documents.electoralCard.number ? (
                    <div>
                      <p className="text-sm">
                        {employee.documents.electoralCard.number}
                      </p>
                      {employee.documents.electoralCard.expiryDate && (
                        <div className="mt-1">
                          {(() => {
                            const status = getExpiryStatus(
                              employee.documents.electoralCard.expiryDate,
                            );
                            return status ? (
                              <Badge
                                variant={status.variant}
                                className="text-xs"
                              >
                                {status.message}
                              </Badge>
                            ) : null;
                          })()}
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Not provided
                    </p>
                  )}
                </div>

                {/* ID Card */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">ID Card</span>
                  </div>
                  {employee.documents.idCard.number ? (
                    <div>
                      <p className="text-sm">
                        {employee.documents.idCard.number}
                      </p>
                      {employee.documents.idCard.expiryDate && (
                        <div className="mt-1">
                          {(() => {
                            const status = getExpiryStatus(
                              employee.documents.idCard.expiryDate,
                            );
                            return status ? (
                              <Badge
                                variant={status.variant}
                                className="text-xs"
                              >
                                {status.message}
                              </Badge>
                            ) : null;
                          })()}
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Not provided
                    </p>
                  )}
                </div>

                {/* Passport */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Passport</span>
                  </div>
                  {employee.documents.passport.number ? (
                    <div>
                      <p className="text-sm">
                        {employee.documents.passport.number}
                      </p>
                      {employee.documents.passport.expiryDate && (
                        <div className="mt-1">
                          {(() => {
                            const status = getExpiryStatus(
                              employee.documents.passport.expiryDate,
                            );
                            return status ? (
                              <Badge
                                variant={status.variant}
                                className="text-xs"
                              >
                                {status.message}
                              </Badge>
                            ) : null;
                          })()}
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Not provided
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
