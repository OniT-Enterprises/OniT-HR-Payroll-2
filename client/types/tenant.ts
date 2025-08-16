/**
 * TypeScript types for multi-tenant HR & Payroll system
 */

// ============================================================================
// TENANT & RBAC TYPES
// ============================================================================

export type UserRole = "owner" | "hr-admin" | "manager" | "viewer";

export type ModuleName =
  | "hiring"
  | "staff"
  | "timeleave"
  | "performance"
  | "payroll"
  | "reports";

export interface TenantMember {
  id: string;
  role: UserRole;
  modules?: ModuleName[]; // Optional module allowlist (defaults to role-based access)
  createdAt: Date;
  updatedAt: Date;
}

export interface TenantConfig {
  name: string;
  branding?: {
    logo?: string;
    primaryColor?: string;
    secondaryColor?: string;
  };
  features?: {
    timesheetApproval?: boolean;
    overtimeCalculation?: boolean;
    leaveAccrual?: boolean;
    performanceReviews?: boolean;
  };
  payrollPolicy?: {
    payPeriod: "weekly" | "biweekly" | "monthly";
    overtimeThreshold: number; // hours per week
    overtimeMultiplier: number; // e.g., 1.5
    timezone: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface TenantContext {
  tenantId: string;
  config: TenantConfig;
  member: TenantMember;
  permissions: {
    canRead: (module: ModuleName) => boolean;
    canWrite: (module: ModuleName) => boolean;
    canManageDepartment: (departmentId: string) => boolean;
    canManageEmployee: (employeeId: string) => boolean;
  };
}

// ============================================================================
// CORE ENTITY TYPES
// ============================================================================

export interface Department {
  id: string;
  name: string;
  managerId?: string; // Employee ID of department manager
  createdAt: Date;
  updatedAt: Date;
}

export interface Employee {
  id: string;
  displayName: string;
  email?: string;
  departmentId: string;
  managerId?: string;
  status: "active" | "inactive" | "terminated";
  createdAt: Date;
  updatedAt: Date;
}

export interface Position {
  id: string;
  title: string;
  grade?: string;
  baseMonthlyUSD: number;
  leaveDaysPerYear: number;
  departmentId?: string;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// HIRING MODULE TYPES
// ============================================================================

export type JobStatus = "draft" | "open" | "closed";
export type JobApproverMode = "department" | "specific";

export interface Job {
  id: string;
  title: string;
  description?: string;
  departmentId: string;
  hiringManagerId: string; // Must belong to the department
  approverMode: JobApproverMode;
  approverDepartmentId?: string; // Required if approverMode === 'department'
  approverId?: string; // Required if approverMode === 'specific'
  status: JobStatus;
  createdAt: Date;
  updatedAt: Date;
}

export type CandidateStage =
  | "applied"
  | "screening"
  | "interview"
  | "offer"
  | "hired"
  | "rejected";

export interface Candidate {
  id: string;
  jobId: string;
  name: string;
  email?: string;
  phone?: string;
  stage: CandidateStage;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Interview {
  id: string;
  candidateId: string;
  when: Date;
  panel: string[]; // Array of employee IDs
  notes?: string;
  outcome?: "pass" | "fail" | "pending";
  createdAt: Date;
  updatedAt: Date;
}

export type OfferStatus = "draft" | "sent" | "accepted" | "declined";

export interface Offer {
  id: string;
  candidateId: string;
  positionId: string;
  terms: {
    startDate: Date;
    baseMonthlyUSD: number;
    weeklyHours: number;
    overtimeRate?: number;
  };
  status: OfferStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface Contract {
  id: string;
  employeeId: string;
  positionId: string;
  startDate: Date;
  endDate?: Date;
  weeklyHours: number;
  overtimeRate: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface EmploymentSnapshot {
  id: string; // Format: {employeeId}_{asOf_YYYYMMDD}
  employeeId: string;
  position: Position;
  contract: Contract;
  asOf: Date; // Effective date of this snapshot
  createdAt: Date; // When this snapshot was created (immutable)
}

// ============================================================================
// TIME & LEAVE MODULE TYPES
// ============================================================================

export interface Shift {
  id: string;
  employeeId: string;
  date: string; // Format: YYYY-MM-DD
  start: string; // Format: HH:MM
  end: string; // Format: HH:MM
  role?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Timesheet {
  id: string; // Format: {empId}_{weekIso}
  empId: string;
  weekIso: string; // ISO week format: YYYY-Www
  regularHours: number;
  overtimeHours: number;
  paidLeaveHours: number;
  unpaidLeaveHours: number;
  sundays: number; // Number of Sundays worked (for special rates)
  computedAt: Date;
}

export type LeaveType =
  | "vacation"
  | "sick"
  | "personal"
  | "maternity"
  | "paternity"
  | "unpaid";
export type LeaveStatus = "pending" | "approved" | "rejected";

export interface LeaveRequest {
  id: string;
  empId: string;
  type: LeaveType;
  from: Date;
  to: Date;
  hours?: number; // Total hours requested
  reason?: string;
  status: LeaveStatus;
  approvedBy?: string;
  approvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface LeaveBalance {
  id: string; // Format: {empId}_{year}
  empId: string;
  year: number;
  openingDays: number;
  movements: LeaveMovement[];
  computedBalance: number;
  updatedAt: Date;
}

export interface LeaveMovement {
  type: "accrual" | "usage" | "adjustment";
  days: number; // Positive for accrual/adjustment up, negative for usage/adjustment down
  reason: string;
  at: Date;
}

// ============================================================================
// PERFORMANCE MODULE TYPES
// ============================================================================

export interface Goal {
  id: string;
  empId: string;
  title: string;
  description?: string;
  targetDate: Date;
  status: "draft" | "active" | "completed" | "cancelled";
  progress: number; // 0-100
  createdAt: Date;
  updatedAt: Date;
}

export interface Review {
  id: string;
  empId: string;
  reviewerId: string;
  period: string; // e.g., "2024-Q1"
  overallRating: number; // 1-5
  goals: string[]; // Goal IDs
  feedback?: string;
  status: "draft" | "submitted" | "approved";
  createdAt: Date;
  updatedAt: Date;
}

export interface PromotionSignal {
  id: string; // Format: {year}_{quarter}_{empId}
  empId: string;
  score: number; // 0-100
  recommended: "promote" | "bonus" | "none";
  explain: string;
  createdAt: Date;
}

// ============================================================================
// PAYROLL MODULE TYPES
// ============================================================================

export interface PayrunInput {
  id: string; // Format: {yyyymm}_{empId}
  empId: string;
  month: string; // Format: YYYY-MM
  snapshot: EmploymentSnapshot;
  timesheetTotals: {
    regularHours: number;
    overtimeHours: number;
    paidLeaveHours: number;
    unpaidLeaveHours: number;
  };
  computedAt: Date;
}

export interface Payslip {
  id: string; // Format: {yyyymm}_{empId}
  empId: string;
  month: string; // Format: YYYY-MM
  gross: {
    regular: number;
    overtime: number;
    paidLeave: number;
    total: number;
  };
  deductions: {
    tax: number;
    socialSecurity: number;
    medicare: number;
    other: number;
    total: number;
  };
  net: number;
  locked: boolean; // Payslips become immutable when locked
  createdAt: Date;
  lockedAt?: Date;
}

// ============================================================================
// FIREBASE AUTH CUSTOM CLAIMS
// ============================================================================

export interface CustomClaims {
  tenants: string[]; // Array of tenant IDs the user has access to
  role?: UserRole; // Optional global role
}

// ============================================================================
// API REQUEST/RESPONSE TYPES
// ============================================================================

export interface CreateJobRequest {
  title: string;
  description?: string;
  departmentId: string;
  hiringManagerId: string;
  approverMode: JobApproverMode;
  approverDepartmentId?: string;
  approverId?: string;
}

export interface CreateOfferRequest {
  candidateId: string;
  positionId: string;
  terms: {
    startDate: string; // ISO date string
    baseMonthlyUSD: number;
    weeklyHours: number;
    overtimeRate?: number;
  };
}

export interface CreateShiftRequest {
  employeeId: string;
  date: string; // YYYY-MM-DD
  start: string; // HH:MM
  end: string; // HH:MM
  role?: string;
}

export interface ApproveLeaveRequest {
  requestId: string;
  approved: boolean;
  note?: string;
}
