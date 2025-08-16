/**
 * React Query hooks for tenant-aware data access
 * All hooks include tenant ID in query keys for proper isolation
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTenantId } from "@/contexts/TenantContext";
import * as dataLayer from "@/lib/data";
import {
  Department,
  Employee,
  Position,
  Job,
  Candidate,
  Shift,
  Timesheet,
  TenantConfig,
  TenantMember,
  CreateJobRequest,
  ListEmployeesOptions,
  ListShiftsOptions,
} from "@/types/tenant";

// ============================================================================
// QUERY KEY FACTORIES
// ============================================================================

export const tenantKeys = {
  all: ["tenant"] as const,
  tenant: (tid: string) => ["tenant", tid] as const,
  config: (tid: string) => ["tenant", tid, "config"] as const,
  members: (tid: string) => ["tenant", tid, "members"] as const,
  member: (tid: string, uid: string) =>
    ["tenant", tid, "members", uid] as const,

  // Core entities
  departments: (tid: string) => ["tenant", tid, "departments"] as const,
  department: (tid: string, deptId: string) =>
    ["tenant", tid, "departments", deptId] as const,
  employees: (tid: string, options?: ListEmployeesOptions) =>
    ["tenant", tid, "employees", options] as const,
  employee: (tid: string, empId: string) =>
    ["tenant", tid, "employees", empId] as const,
  positions: (tid: string) => ["tenant", tid, "positions"] as const,

  // Hiring
  jobs: (tid: string, deptId?: string) =>
    ["tenant", tid, "jobs", deptId] as const,
  candidates: (tid: string, jobId?: string) =>
    ["tenant", tid, "candidates", jobId] as const,

  // Time & Leave
  shifts: (tid: string, ym: string, options?: ListShiftsOptions) =>
    ["tenant", tid, "shifts", ym, options] as const,
  timesheet: (tid: string, empId: string, weekIso: string) =>
    ["tenant", tid, "timesheets", empId, weekIso] as const,
};

// ============================================================================
// CONFIGURATION HOOKS
// ============================================================================

export function useTenantConfig() {
  const tenantId = useTenantId();

  return useQuery({
    queryKey: tenantKeys.config(tenantId),
    queryFn: () => dataLayer.getTenantConfig(tenantId),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useUpdateTenantConfig() {
  const queryClient = useQueryClient();
  const tenantId = useTenantId();

  return useMutation({
    mutationFn: (config: Partial<TenantConfig>) =>
      dataLayer.updateTenantConfig(tenantId, config),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tenantKeys.config(tenantId) });
    },
  });
}

// ============================================================================
// MEMBER HOOKS
// ============================================================================

export function useTenantMembers() {
  const tenantId = useTenantId();

  return useQuery({
    queryKey: tenantKeys.members(tenantId),
    queryFn: () => dataLayer.listTenantMembers(tenantId),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

export function useTenantMember(uid: string) {
  const tenantId = useTenantId();

  return useQuery({
    queryKey: tenantKeys.member(tenantId, uid),
    queryFn: () => dataLayer.getTenantMember(tenantId, uid),
    enabled: !!uid,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// ============================================================================
// DEPARTMENT HOOKS
// ============================================================================

export function useDepartments() {
  const tenantId = useTenantId();

  return useQuery({
    queryKey: tenantKeys.departments(tenantId),
    queryFn: () => dataLayer.listDepartments(tenantId),
    staleTime: 10 * 60 * 1000, // 10 minutes - departments don't change often
  });
}

export function useDepartment(deptId: string) {
  const tenantId = useTenantId();

  return useQuery({
    queryKey: tenantKeys.department(tenantId, deptId),
    queryFn: () => dataLayer.getDepartment(tenantId, deptId),
    enabled: !!deptId,
    staleTime: 10 * 60 * 1000,
  });
}

export function useCreateDepartment() {
  const queryClient = useQueryClient();
  const tenantId = useTenantId();

  return useMutation({
    mutationFn: (
      department: Omit<Department, "id" | "createdAt" | "updatedAt">,
    ) => dataLayer.createDepartment(tenantId, department),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: tenantKeys.departments(tenantId),
      });
    },
  });
}

// ============================================================================
// EMPLOYEE HOOKS
// ============================================================================

export function useEmployees(options: ListEmployeesOptions = {}) {
  const tenantId = useTenantId();

  return useQuery({
    queryKey: tenantKeys.employees(tenantId, options),
    queryFn: () => dataLayer.listEmployees(tenantId, options),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useEmployeesByDepartment(departmentId: string) {
  return useEmployees({ departmentId });
}

export function useEmployee(empId: string) {
  const tenantId = useTenantId();

  return useQuery({
    queryKey: tenantKeys.employee(tenantId, empId),
    queryFn: () => dataLayer.getEmployee(tenantId, empId),
    enabled: !!empId,
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateEmployee() {
  const queryClient = useQueryClient();
  const tenantId = useTenantId();

  return useMutation({
    mutationFn: (employee: Omit<Employee, "id" | "createdAt" | "updatedAt">) =>
      dataLayer.createEmployee(tenantId, employee),
    onSuccess: () => {
      // Invalidate all employee queries
      queryClient.invalidateQueries({
        queryKey: tenantKeys.employees(tenantId),
      });
    },
  });
}

// ============================================================================
// POSITION HOOKS
// ============================================================================

export function usePositions() {
  const tenantId = useTenantId();

  return useQuery({
    queryKey: tenantKeys.positions(tenantId),
    queryFn: () => dataLayer.listPositions(tenantId),
    staleTime: 15 * 60 * 1000, // 15 minutes - positions change rarely
  });
}

// ============================================================================
// JOB HOOKS (HIRING MODULE)
// ============================================================================

export function useJobs(departmentId?: string) {
  const tenantId = useTenantId();

  return useQuery({
    queryKey: tenantKeys.jobs(tenantId, departmentId),
    queryFn: () => dataLayer.listJobs(tenantId, departmentId),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

export function useCreateJob() {
  const queryClient = useQueryClient();
  const tenantId = useTenantId();

  return useMutation({
    mutationFn: (jobData: CreateJobRequest) =>
      dataLayer.createJob(tenantId, jobData),
    onSuccess: () => {
      // Invalidate all job queries
      queryClient.invalidateQueries({ queryKey: tenantKeys.jobs(tenantId) });
    },
  });
}

// ============================================================================
// CANDIDATE HOOKS
// ============================================================================

export function useCandidates(jobId?: string) {
  const tenantId = useTenantId();

  return useQuery({
    queryKey: tenantKeys.candidates(tenantId, jobId),
    queryFn: () => dataLayer.listCandidates(tenantId, jobId),
    staleTime: 1 * 60 * 1000, // 1 minute - candidates change frequently
  });
}

// ============================================================================
// SHIFT HOOKS (TIME & LEAVE MODULE)
// ============================================================================

export function useShifts(yearMonth: string, options: ListShiftsOptions = {}) {
  const tenantId = useTenantId();

  return useQuery({
    queryKey: tenantKeys.shifts(tenantId, yearMonth, options),
    queryFn: () => dataLayer.listShifts(tenantId, yearMonth, options),
    enabled: !!yearMonth,
    staleTime: 30 * 1000, // 30 seconds - shifts are real-time
  });
}

// ============================================================================
// TIMESHEET HOOKS
// ============================================================================

export function useTimesheet(empId: string, weekIso: string) {
  const tenantId = useTenantId();

  return useQuery({
    queryKey: tenantKeys.timesheet(tenantId, empId, weekIso),
    queryFn: () => dataLayer.getTimesheet(tenantId, empId, weekIso),
    enabled: !!empId && !!weekIso,
    staleTime: 60 * 1000, // 1 minute
  });
}

// ============================================================================
// UTILITY HOOKS
// ============================================================================

/**
 * Hook to invalidate all tenant data when switching tenants
 */
export function useInvalidateAllTenantData() {
  const queryClient = useQueryClient();

  return (tenantId: string) => {
    queryClient.invalidateQueries({ queryKey: tenantKeys.tenant(tenantId) });
  };
}

/**
 * Hook to prefetch commonly used data
 */
export function usePrefetchTenantData() {
  const queryClient = useQueryClient();
  const tenantId = useTenantId();

  return () => {
    // Prefetch departments (used in many dropdowns)
    queryClient.prefetchQuery({
      queryKey: tenantKeys.departments(tenantId),
      queryFn: () => dataLayer.listDepartments(tenantId),
      staleTime: 10 * 60 * 1000,
    });

    // Prefetch positions (used in hiring and employee management)
    queryClient.prefetchQuery({
      queryKey: tenantKeys.positions(tenantId),
      queryFn: () => dataLayer.listPositions(tenantId),
      staleTime: 15 * 60 * 1000,
    });
  };
}

/**
 * Hook that provides optimistic updates for common operations
 */
export function useOptimisticUpdates() {
  const queryClient = useQueryClient();
  const tenantId = useTenantId();

  return {
    updateEmployee: (empId: string, updates: Partial<Employee>) => {
      queryClient.setQueryData(
        tenantKeys.employee(tenantId, empId),
        (old: Employee | undefined) =>
          old ? { ...old, ...updates } : undefined,
      );
    },

    updateJob: (jobId: string, updates: Partial<Job>) => {
      queryClient.setQueryData(
        tenantKeys.jobs(tenantId),
        (old: Job[] | undefined) =>
          old?.map((job) => (job.id === jobId ? { ...job, ...updates } : job)),
      );
    },
  };
}
