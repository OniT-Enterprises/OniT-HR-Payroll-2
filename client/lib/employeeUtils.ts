import { type Employee } from "@/services/employeeService";

export interface ProfileCompleteness {
  isComplete: boolean;
  completionPercentage: number;
  missingFields: string[];
  requiredDocuments: {
    field: string;
    missing: boolean;
    required: boolean;
  }[];
}

export function getProfileCompleteness(
  employee: Employee,
): ProfileCompleteness {
  const missingFields: string[] = [];
  const requiredDocuments = [];

  // Required personal information
  if (!employee.personalInfo.firstName) missingFields.push("First Name");
  if (!employee.personalInfo.lastName) missingFields.push("Last Name");
  if (!employee.personalInfo.email) missingFields.push("Email");
  if (!employee.personalInfo.phone) missingFields.push("Phone Number");

  // Required job information
  if (!employee.jobDetails.department) missingFields.push("Department");
  if (!employee.jobDetails.position) missingFields.push("Position");
  if (!employee.jobDetails.hireDate) missingFields.push("Hire Date");
  if (!employee.jobDetails.employeeId) missingFields.push("Employee ID");

  // Required compensation
  if (
    !employee.compensation.annualSalary ||
    employee.compensation.annualSalary === 0
  ) {
    missingFields.push("Annual Salary");
  }

  // Document requirements (these might be configurable per company)
  const documentRequirements = [
    {
      field: "Social Security Number",
      value: employee.documents.socialSecurityNumber.number,
      required: true, // This would come from company settings
    },
    {
      field: "ID Card",
      value: employee.documents.idCard.number,
      required: true,
    },
    {
      field: "Electoral Card",
      value: employee.documents.electoralCard.number,
      required: false, // Example: not required for all employees
    },
    {
      field: "Passport",
      value: employee.documents.passport.number,
      required: false,
    },
  ];

  // Check required documents
  documentRequirements.forEach((doc) => {
    requiredDocuments.push({
      field: doc.field,
      missing: !doc.value && doc.required,
      required: doc.required,
    });

    if (!doc.value && doc.required) {
      missingFields.push(doc.field);
    }
  });

  // Emergency contact (recommended but not required)
  if (!employee.personalInfo.emergencyContactName) {
    missingFields.push("Emergency Contact Name");
  }

  // Calculate completion percentage
  const totalRequiredFields = 12; // Based on the fields we're checking
  const completedFields = totalRequiredFields - missingFields.length;
  const completionPercentage = Math.round(
    (completedFields / totalRequiredFields) * 100,
  );

  return {
    isComplete: missingFields.length === 0,
    completionPercentage,
    missingFields,
    requiredDocuments,
  };
}

export function getIncompleteEmployees(employees: Employee[]): Employee[] {
  return employees.filter((employee) => {
    const completeness = getProfileCompleteness(employee);
    return !completeness.isComplete;
  });
}

export function getCompletionStatusColor(completionPercentage: number): string {
  if (completionPercentage >= 90) return "text-green-600";
  if (completionPercentage >= 70) return "text-yellow-600";
  return "text-red-600";
}

export function getCompletionStatusIcon(
  completionPercentage: number,
): "complete" | "incomplete" {
  return completionPercentage >= 90 ? "complete" : "incomplete";
}
