/**
 * Tenant-aware data access layer
 * All functions require a tenant ID and use the tenant-aware path helpers
 */

import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  QueryConstraint,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { paths } from "@/lib/paths";
import {
  Department,
  Employee,
  Position,
  Job,
  Candidate,
  Interview,
  Offer,
  Contract,
  EmploymentSnapshot,
  Shift,
  Timesheet,
  LeaveRequest,
  LeaveBalance,
  Goal,
  Review,
  TenantConfig,
  TenantMember,
  CreateJobRequest,
  CreateOfferRequest,
  CreateShiftRequest,
} from "@/types/tenant";

// ============================================================================
// ERROR HANDLING
// ============================================================================

export class TenantDataError extends Error {
  constructor(
    message: string,
    public tenantId: string,
    public operation: string,
    public originalError?: Error,
  ) {
    super(message);
    this.name = "TenantDataError";
  }
}

const handleFirestoreError = (
  error: Error,
  tenantId: string,
  operation: string,
): never => {
  console.error(
    `Firestore error in ${operation} for tenant ${tenantId}:`,
    error,
  );
  throw new TenantDataError(
    `Failed to ${operation}: ${error.message}`,
    tenantId,
    operation,
    error,
  );
};

// ============================================================================
// TENANT CONFIGURATION
// ============================================================================

export async function getTenantConfig(
  tenantId: string,
): Promise<TenantConfig | null> {
  try {
    const docRef = doc(db, paths.settings(tenantId));
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return null;
    }

    const data = docSnap.data();
    return {
      ...data,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
    } as TenantConfig;
  } catch (error) {
    handleFirestoreError(error as Error, tenantId, "get tenant config");
  }
}

export async function updateTenantConfig(
  tenantId: string,
  config: Partial<TenantConfig>,
): Promise<void> {
  try {
    const docRef = doc(db, paths.settings(tenantId));
    await updateDoc(docRef, {
      ...config,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error as Error, tenantId, "update tenant config");
  }
}

// ============================================================================
// MEMBERS
// ============================================================================

export async function getTenantMember(
  tenantId: string,
  uid: string,
): Promise<TenantMember | null> {
  try {
    const docRef = doc(db, paths.member(tenantId, uid));
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return null;
    }

    const data = docSnap.data();
    return {
      id: docSnap.id,
      ...data,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
    } as TenantMember;
  } catch (error) {
    handleFirestoreError(error as Error, tenantId, "get tenant member");
  }
}

export async function listTenantMembers(
  tenantId: string,
): Promise<TenantMember[]> {
  try {
    const colRef = collection(db, paths.members(tenantId));
    const snapshot = await getDocs(
      query(colRef, orderBy("role"), orderBy("createdAt")),
    );

    return snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      } as TenantMember;
    });
  } catch (error) {
    handleFirestoreError(error as Error, tenantId, "list tenant members");
  }
}

// ============================================================================
// DEPARTMENTS
// ============================================================================

export async function listDepartments(tenantId: string): Promise<Department[]> {
  try {
    const colRef = collection(db, paths.departments(tenantId));
    const snapshot = await getDocs(query(colRef, orderBy("name")));

    return snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      } as Department;
    });
  } catch (error) {
    handleFirestoreError(error as Error, tenantId, "list departments");
  }
}

export async function getDepartment(
  tenantId: string,
  deptId: string,
): Promise<Department | null> {
  try {
    const docRef = doc(db, paths.department(tenantId, deptId));
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return null;
    }

    const data = docSnap.data();
    return {
      id: docSnap.id,
      ...data,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
    } as Department;
  } catch (error) {
    handleFirestoreError(error as Error, tenantId, "get department");
  }
}

export async function createDepartment(
  tenantId: string,
  department: Omit<Department, "id" | "createdAt" | "updatedAt">,
): Promise<string> {
  try {
    const colRef = collection(db, paths.departments(tenantId));
    const docRef = await addDoc(colRef, {
      ...department,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error as Error, tenantId, "create department");
  }
}

// ============================================================================
// EMPLOYEES
// ============================================================================

export interface ListEmployeesOptions {
  departmentId?: string;
  status?: "active" | "inactive" | "terminated";
  managerId?: string;
  limit?: number;
}

export async function listEmployees(
  tenantId: string,
  options: ListEmployeesOptions = {},
): Promise<Employee[]> {
  try {
    const colRef = collection(db, paths.employees(tenantId));
    const constraints: QueryConstraint[] = [];

    if (options.departmentId) {
      constraints.push(where("departmentId", "==", options.departmentId));
    }

    if (options.status) {
      constraints.push(where("status", "==", options.status));
    }

    if (options.managerId) {
      constraints.push(where("managerId", "==", options.managerId));
    }

    constraints.push(orderBy("displayName"));

    if (options.limit) {
      constraints.push(limit(options.limit));
    }

    const snapshot = await getDocs(query(colRef, ...constraints));

    return snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      } as Employee;
    });
  } catch (error) {
    handleFirestoreError(error as Error, tenantId, "list employees");
  }
}

export async function getEmployee(
  tenantId: string,
  empId: string,
): Promise<Employee | null> {
  try {
    const docRef = doc(db, paths.employee(tenantId, empId));
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return null;
    }

    const data = docSnap.data();
    return {
      id: docSnap.id,
      ...data,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
    } as Employee;
  } catch (error) {
    handleFirestoreError(error as Error, tenantId, "get employee");
  }
}

export async function createEmployee(
  tenantId: string,
  employee: Omit<Employee, "id" | "createdAt" | "updatedAt">,
): Promise<string> {
  try {
    const colRef = collection(db, paths.employees(tenantId));
    const docRef = await addDoc(colRef, {
      ...employee,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error as Error, tenantId, "create employee");
  }
}

// ============================================================================
// POSITIONS
// ============================================================================

export async function listPositions(tenantId: string): Promise<Position[]> {
  try {
    const colRef = collection(db, paths.positions(tenantId));
    const snapshot = await getDocs(query(colRef, orderBy("title")));

    return snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      } as Position;
    });
  } catch (error) {
    handleFirestoreError(error as Error, tenantId, "list positions");
  }
}

// ============================================================================
// JOBS (HIRING MODULE)
// ============================================================================

export async function listJobs(
  tenantId: string,
  departmentId?: string,
): Promise<Job[]> {
  try {
    const colRef = collection(db, paths.jobs(tenantId));
    const constraints: QueryConstraint[] = [];

    if (departmentId) {
      constraints.push(where("departmentId", "==", departmentId));
    }

    constraints.push(orderBy("createdAt", "desc"));

    const snapshot = await getDocs(query(colRef, ...constraints));

    return snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      } as Job;
    });
  } catch (error) {
    handleFirestoreError(error as Error, tenantId, "list jobs");
  }
}

export async function createJob(
  tenantId: string,
  jobData: CreateJobRequest,
): Promise<string> {
  try {
    // Validate that hiring manager belongs to the selected department
    const hiringManager = await getEmployee(tenantId, jobData.hiringManagerId);
    if (!hiringManager) {
      throw new Error("Hiring manager not found");
    }

    if (hiringManager.departmentId !== jobData.departmentId) {
      throw new Error("Hiring manager must belong to the selected department");
    }

    // Validate approver if specific mode
    if (jobData.approverMode === "specific" && !jobData.approverId) {
      throw new Error("Approver ID is required for specific approver mode");
    }

    if (
      jobData.approverMode === "department" &&
      !jobData.approverDepartmentId
    ) {
      throw new Error(
        "Approver department ID is required for department approver mode",
      );
    }

    const colRef = collection(db, paths.jobs(tenantId));
    const docRef = await addDoc(colRef, {
      ...jobData,
      status: "draft",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return docRef.id;
  } catch (error) {
    handleFirestoreError(error as Error, tenantId, "create job");
  }
}

// ============================================================================
// CANDIDATES
// ============================================================================

export async function listCandidates(
  tenantId: string,
  jobId?: string,
): Promise<Candidate[]> {
  try {
    const colRef = collection(db, paths.candidates(tenantId));
    const constraints: QueryConstraint[] = [];

    if (jobId) {
      constraints.push(where("jobId", "==", jobId));
    }

    constraints.push(orderBy("createdAt", "desc"));

    const snapshot = await getDocs(query(colRef, ...constraints));

    return snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      } as Candidate;
    });
  } catch (error) {
    handleFirestoreError(error as Error, tenantId, "list candidates");
  }
}

// ============================================================================
// SHIFTS (TIME & LEAVE MODULE)
// ============================================================================

export interface ListShiftsOptions {
  employeeId?: string;
  dateRange?: {
    start: string; // YYYY-MM-DD
    end: string; // YYYY-MM-DD
  };
  limit?: number;
}

export async function listShifts(
  tenantId: string,
  yearMonth: string, // YYYY-MM
  options: ListShiftsOptions = {},
): Promise<Shift[]> {
  try {
    const colRef = collection(db, paths.rosters(tenantId, yearMonth));
    const constraints: QueryConstraint[] = [];

    if (options.employeeId) {
      constraints.push(where("employeeId", "==", options.employeeId));
    }

    if (options.dateRange) {
      constraints.push(where("date", ">=", options.dateRange.start));
      constraints.push(where("date", "<=", options.dateRange.end));
    }

    constraints.push(orderBy("date"), orderBy("start"));

    if (options.limit) {
      constraints.push(limit(options.limit));
    }

    const snapshot = await getDocs(query(colRef, ...constraints));

    return snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      } as Shift;
    });
  } catch (error) {
    handleFirestoreError(error as Error, tenantId, "list shifts");
  }
}

// ============================================================================
// TIMESHEETS
// ============================================================================

export async function getTimesheet(
  tenantId: string,
  empId: string,
  weekIso: string,
): Promise<Timesheet | null> {
  try {
    const docId = `${empId}_${weekIso}`;
    const docRef = doc(db, paths.timesheet(tenantId, docId));
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return null;
    }

    const data = docSnap.data();
    return {
      id: docSnap.id,
      ...data,
      computedAt: data.computedAt?.toDate() || new Date(),
    } as Timesheet;
  } catch (error) {
    handleFirestoreError(error as Error, tenantId, "get timesheet");
  }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Generates a time-based unique ID (ULID-like)
 * Used for consistent document IDs across the system
 */
export function generateULID(): string {
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substring(2, 15);
  return `${timestamp}${randomPart}`.toUpperCase();
}

/**
 * Gets the ISO week string for a given date
 * Format: YYYY-Www (e.g., "2024-W15")
 */
export function getISOWeek(date: Date): string {
  const year = date.getFullYear();
  const start = new Date(year, 0, 1);
  const days = Math.floor(
    (date.getTime() - start.getTime()) / (24 * 60 * 60 * 1000),
  );
  const week = Math.ceil((days + start.getDay() + 1) / 7);
  return `${year}-W${week.toString().padStart(2, "0")}`;
}

/**
 * Gets the year-month string for roster organization
 * Format: YYYY-MM
 */
export function getYearMonth(date: Date): string {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  return `${year}-${month}`;
}
