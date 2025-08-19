#!/bin/bash

# Script to update all pages to use Header component instead of MainNavigation

# List of files to update
files=(
  "client/pages/staff/AddEmployee.tsx"
  "client/pages/staff/Departments.tsx"
  "client/pages/staff/OrganizationChart.tsx"
  "client/pages/hiring/Interviews.tsx"
  "client/pages/hiring/Onboarding.tsx"
  "client/pages/hiring/Offboarding.tsx"
  "client/pages/hiring/CreateJobTenant.tsx"
  "client/pages/time-leave/TimeTracking.tsx"
  "client/pages/time-leave/Attendance.tsx"
  "client/pages/time-leave/LeaveRequests.tsx"
  "client/pages/time-leave/ShiftScheduling.tsx"
  "client/pages/performance/Reviews.tsx"
  "client/pages/performance/Goals.tsx"
  "client/pages/performance/GoalsOKRs.tsx"
  "client/pages/performance/TrainingCertifications.tsx"
  "client/pages/performance/Disciplinary.tsx"
  "client/pages/payroll/RunPayroll.tsx"
  "client/pages/payroll/PayrollHistory.tsx"
  "client/pages/payroll/TaxReports.tsx"
  "client/pages/payroll/BankTransfers.tsx"
  "client/pages/reports/EmployeeReports.tsx"
  "client/pages/reports/PayrollReports.tsx"
  "client/pages/reports/AttendanceReports.tsx"
  "client/pages/reports/CustomReports.tsx"
)

for file in "${files[@]}"; do
  if [ -f "$file" ]; then
    echo "Updating $file..."
    # Replace import statement
    sed -i 's/import MainNavigation from "@\/components\/layout\/MainNavigation";/import Header from "@\/components\/layout\/Header";/g' "$file"
    # Replace component usage
    sed -i 's/<MainNavigation \/>/<Header \/>/g' "$file"
    echo "Updated $file"
  else
    echo "File not found: $file"
  fi
done

echo "All files updated successfully!"
