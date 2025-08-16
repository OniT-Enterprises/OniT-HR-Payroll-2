/**
 * Tenant-aware path helpers for Firestore collections
 * All business data must be accessed through these helpers to ensure tenant isolation
 */

export const paths = {
  // Tenant root
  tenants: () => `tenants`,

  // Tenant configuration
  settings: (tid: string) => `tenants/${tid}/settings/config`,
  members: (tid: string) => `tenants/${tid}/members`,
  member: (tid: string, uid: string) => `tenants/${tid}/members/${uid}`,

  // Core entities
  departments: (tid: string) => `tenants/${tid}/departments`,
  department: (tid: string, deptId: string) =>
    `tenants/${tid}/departments/${deptId}`,
  employees: (tid: string) => `tenants/${tid}/employees`,
  employee: (tid: string, empId: string) => `tenants/${tid}/employees/${empId}`,
  positions: (tid: string) => `tenants/${tid}/positions`,
  position: (tid: string, posId: string) => `tenants/${tid}/positions/${posId}`,

  // Hiring module
  jobs: (tid: string) => `tenants/${tid}/jobs`,
  job: (tid: string, jobId: string) => `tenants/${tid}/jobs/${jobId}`,
  candidates: (tid: string) => `tenants/${tid}/candidates`,
  candidate: (tid: string, candId: string) =>
    `tenants/${tid}/candidates/${candId}`,
  interviews: (tid: string) => `tenants/${tid}/interviews`,
  interview: (tid: string, intId: string) =>
    `tenants/${tid}/interviews/${intId}`,
  offers: (tid: string) => `tenants/${tid}/offers`,
  offer: (tid: string, offerId: string) => `tenants/${tid}/offers/${offerId}`,
  contracts: (tid: string) => `tenants/${tid}/contracts`,
  contract: (tid: string, contractId: string) =>
    `tenants/${tid}/contracts/${contractId}`,
  snapshots: (tid: string) => `tenants/${tid}/employmentSnapshots`,
  snapshot: (tid: string, snapId: string) =>
    `tenants/${tid}/employmentSnapshots/${snapId}`,

  // Time & Leave module
  rosters: (tid: string, ym: string) => `tenants/${tid}/rosters/${ym}/shifts`,
  roster: (tid: string, ym: string, shiftId: string) =>
    `tenants/${tid}/rosters/${ym}/shifts/${shiftId}`,
  timesheets: (tid: string) => `tenants/${tid}/timesheets`,
  timesheet: (tid: string, empId_weekIso: string) =>
    `tenants/${tid}/timesheets/${empId_weekIso}`,
  leavePolicies: (tid: string) => `tenants/${tid}/leavePolicies`,
  leavePolicy: (tid: string, policyId: string) =>
    `tenants/${tid}/leavePolicies/${policyId}`,
  leaveRequests: (tid: string) => `tenants/${tid}/leaveRequests`,
  leaveRequest: (tid: string, reqId: string) =>
    `tenants/${tid}/leaveRequests/${reqId}`,
  leaveBalances: (tid: string) => `tenants/${tid}/leaveBalances`,
  leaveBalance: (tid: string, empId_year: string) =>
    `tenants/${tid}/leaveBalances/${empId_year}`,

  // Performance module
  goals: (tid: string) => `tenants/${tid}/goals`,
  goal: (tid: string, goalId: string) => `tenants/${tid}/goals/${goalId}`,
  reviews: (tid: string) => `tenants/${tid}/reviews`,
  review: (tid: string, reviewId: string) =>
    `tenants/${tid}/reviews/${reviewId}`,
  trainings: (tid: string) => `tenants/${tid}/trainings`,
  training: (tid: string, trainingId: string) =>
    `tenants/${tid}/trainings/${trainingId}`,
  discipline: (tid: string) => `tenants/${tid}/discipline`,
  disciplineAction: (tid: string, actionId: string) =>
    `tenants/${tid}/discipline/${actionId}`,
  promotionSignals: (tid: string, year_q: string) =>
    `tenants/${tid}/promotionSignals/${year_q}`,
  promotionSignal: (tid: string, year_q: string, empId: string) =>
    `tenants/${tid}/promotionSignals/${year_q}/${empId}`,

  // Payroll module
  payrun: (tid: string, yyyymm: string) => `tenants/${tid}/payruns/${yyyymm}`,
  payslip: (tid: string, yyyymm: string, empId: string) =>
    `tenants/${tid}/payruns/${yyyymm}/payslips/${empId}`,
  payrunInputs: (tid: string, yyyymm: string) =>
    `tenants/${tid}/payrunInputs/${yyyymm}`,
  payrunInput: (tid: string, yyyymm: string, empId: string) =>
    `tenants/${tid}/payrunInputs/${yyyymm}/${empId}`,

  // Analytics
  analytics: (tid: string) => `tenants/${tid}/analytics`,
  analytic: (tid: string, docId: string) => `tenants/${tid}/analytics/${docId}`,

  // Reference data (global, read-only)
  reference: {
    taxTables: (year: string) => `reference/taxTables/${year}`,
    ssRates: (effectiveDate: string) => `reference/ssRates/${effectiveDate}`,
    holidays: (yyyymmdd: string) => `reference/holidays/${yyyymmdd}`,
  },
} as const;

// Type helpers for path validation
export type TenantId = string;
export type PathBuilder = typeof paths;

// Utility to validate tenant ID format (basic validation)
export const isValidTenantId = (tid: string): boolean => {
  return (
    typeof tid === "string" && tid.length > 0 && /^[a-zA-Z0-9_-]+$/.test(tid)
  );
};

// Helper to extract tenant ID from a tenant path
export const extractTenantId = (path: string): string | null => {
  const match = path.match(/^tenants\/([^\/]+)/);
  return match ? match[1] : null;
};
