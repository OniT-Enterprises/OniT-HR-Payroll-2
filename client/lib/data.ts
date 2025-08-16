/**
 * Tenant-aware data layer with typed functions and React Query hooks
 * All data operations are scoped to the current tenant
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
  limit as firestoreLimit,
  serverTimestamp,
  DocumentData,
  QueryConstraint 
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { paths } from '@/lib/paths';
import { useTenant } from '@/contexts/TenantContext';
import { 
  Department, 
  Employee, 
  Position, 
  Job, 
  Candidate,
  Contract,
  ListEmployeesOptions,
  ListJobsOptions,
  ListShiftsOptions
} from '@/types/tenant';

// Query key factories for consistent caching
export const queryKeys = {
  tenant: (tid: string) => ['tenant', tid] as const,
  departments: (tid: string) => ['departments', tid] as const,
  department: (tid: string, id: string) => ['department', tid, id] as const,
  employees: (tid: string, filters?: ListEmployeesOptions) => 
    ['employees', tid, filters] as const,
  employee: (tid: string, id: string) => ['employee', tid, id] as const,
  positions: (tid: string) => ['positions', tid] as const,
  position: (tid: string, id: string) => ['position', tid, id] as const,
  jobs: (tid: string, filters?: ListJobsOptions) => 
    ['jobs', tid, filters] as const,
  job: (tid: string, id: string) => ['job', tid, id] as const,
  candidates: (tid: string, jobId?: string) => 
    ['candidates', tid, jobId] as const,
  candidate: (tid: string, id: string) => ['candidate', tid, id] as const,
} as const;

// Error handling
class TenantDataError extends Error {
  constructor(message: string, public code?: string, public originalError?: any) {
    super(message);
    this.name = 'TenantDataError';
  }
}

// Helper to ensure database is available
const ensureDatabase = () => {
  if (!db) {
    throw new TenantDataError('Database not available', 'DB_UNAVAILABLE');
  }
  return db;
};

// Helper to check if operation should proceed
const canProceedWithFirebaseOperation = (): boolean => {
  try {
    const { getFirebaseStatus } = require('./firebaseManager');
    const status = getFirebaseStatus();

    // Don't proceed if Firebase is in offline mode or terminated
    if (status.error?.includes('terminated') || status.error?.includes('offline')) {
      console.warn('🚫 Skipping Firebase operation - client offline or terminated');
      return false;
    }

    return true;
  } catch (error) {
    // If we can't check status, assume we can proceed
    return true;
  }
};

// Generic document operations
const getDocument = async <T extends DocumentData>(path: string): Promise<T | null> => {
  const database = ensureDatabase();
  try {
    const docSnap = await getDoc(doc(database, path));
    return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } as T : null;
  } catch (error) {
    throw new TenantDataError(`Failed to get document: ${path}`, 'GET_FAILED', error);
  }
};

const getCollection = async <T extends DocumentData>(
  path: string, 
  constraints: QueryConstraint[] = []
): Promise<T[]> => {
  const database = ensureDatabase();
  try {
    const q = constraints.length > 0 
      ? query(collection(database, path), ...constraints)
      : collection(database, path);
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as T));
  } catch (error) {
    throw new TenantDataError(`Failed to get collection: ${path}`, 'QUERY_FAILED', error);
  }
};

// =============================================================================
// DEPARTMENT OPERATIONS
// =============================================================================

export const listDepartments = async (tid: string): Promise<Department[]> => {
  return getCollection<Department>(
    paths.departments(tid), 
    [orderBy('name', 'asc')]
  );
};

export const getDepartment = async (tid: string, departmentId: string): Promise<Department | null> => {
  return getDocument<Department>(paths.department(tid, departmentId));
};

export const createDepartment = async (tid: string, department: Omit<Department, 'id'>): Promise<string> => {
  const database = ensureDatabase();
  try {
    const docRef = await addDoc(collection(database, paths.departments(tid)), {
      ...department,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    throw new TenantDataError('Failed to create department', 'CREATE_FAILED', error);
  }
};

export const updateDepartment = async (
  tid: string, 
  departmentId: string, 
  updates: Partial<Department>
): Promise<void> => {
  const database = ensureDatabase();
  try {
    await updateDoc(doc(database, paths.department(tid, departmentId)), {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    throw new TenantDataError('Failed to update department', 'UPDATE_FAILED', error);
  }
};

export const deleteDepartment = async (tid: string, departmentId: string): Promise<void> => {
  const database = ensureDatabase();
  try {
    await deleteDoc(doc(database, paths.department(tid, departmentId)));
  } catch (error) {
    throw new TenantDataError('Failed to delete department', 'DELETE_FAILED', error);
  }
};

// =============================================================================
// EMPLOYEE OPERATIONS
// =============================================================================

export const listEmployees = async (
  tid: string, 
  options: ListEmployeesOptions = {}
): Promise<Employee[]> => {
  const constraints: QueryConstraint[] = [orderBy('personalInfo.lastName', 'asc')];
  
  if (options.departmentId) {
    constraints.unshift(where('departmentId', '==', options.departmentId));
  }
  
  if (options.status) {
    constraints.unshift(where('status', '==', options.status));
  }
  
  if (options.managerId) {
    constraints.unshift(where('managerId', '==', options.managerId));
  }
  
  if (options.limit) {
    constraints.push(firestoreLimit(options.limit));
  }
  
  return getCollection<Employee>(paths.employees(tid), constraints);
};

export const getEmployee = async (tid: string, employeeId: string): Promise<Employee | null> => {
  return getDocument<Employee>(paths.employee(tid, employeeId));
};

export const createEmployee = async (tid: string, employee: Omit<Employee, 'id'>): Promise<string> => {
  const database = ensureDatabase();
  try {
    const docRef = await addDoc(collection(database, paths.employees(tid)), {
      ...employee,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    throw new TenantDataError('Failed to create employee', 'CREATE_FAILED', error);
  }
};

export const updateEmployee = async (
  tid: string, 
  employeeId: string, 
  updates: Partial<Employee>
): Promise<void> => {
  const database = ensureDatabase();
  try {
    await updateDoc(doc(database, paths.employee(tid, employeeId)), {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    throw new TenantDataError('Failed to update employee', 'UPDATE_FAILED', error);
  }
};

export const deleteEmployee = async (tid: string, employeeId: string): Promise<void> => {
  const database = ensureDatabase();
  try {
    await deleteDoc(doc(database, paths.employee(tid, employeeId)));
  } catch (error) {
    throw new TenantDataError('Failed to delete employee', 'DELETE_FAILED', error);
  }
};

// Helper function to get employees by department
export const getEmployeesByDepartment = async (
  tid: string, 
  departmentId: string
): Promise<Employee[]> => {
  return listEmployees(tid, { departmentId });
};

// =============================================================================
// POSITION OPERATIONS
// =============================================================================

export const listPositions = async (tid: string): Promise<Position[]> => {
  return getCollection<Position>(
    paths.positions(tid), 
    [orderBy('title', 'asc')]
  );
};

export const getPosition = async (tid: string, positionId: string): Promise<Position | null> => {
  return getDocument<Position>(paths.position(tid, positionId));
};

export const createPosition = async (tid: string, position: Omit<Position, 'id'>): Promise<string> => {
  const database = ensureDatabase();
  try {
    const docRef = await addDoc(collection(database, paths.positions(tid)), {
      ...position,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    throw new TenantDataError('Failed to create position', 'CREATE_FAILED', error);
  }
};

// =============================================================================
// JOB OPERATIONS
// =============================================================================

export const listJobs = async (
  tid: string, 
  options: ListJobsOptions = {}
): Promise<Job[]> => {
  const constraints: QueryConstraint[] = [orderBy('createdAt', 'desc')];
  
  if (options.departmentId) {
    constraints.unshift(where('departmentId', '==', options.departmentId));
  }
  
  if (options.status) {
    constraints.unshift(where('status', '==', options.status));
  }
  
  if (options.hiringManagerId) {
    constraints.unshift(where('hiringManagerId', '==', options.hiringManagerId));
  }
  
  if (options.limit) {
    constraints.push(firestoreLimit(options.limit));
  }
  
  return getCollection<Job>(paths.jobs(tid), constraints);
};

export const getJob = async (tid: string, jobId: string): Promise<Job | null> => {
  return getDocument<Job>(paths.job(tid, jobId));
};

export const createJob = async (tid: string, job: Omit<Job, 'id'>): Promise<string> => {
  const database = ensureDatabase();
  try {
    const docRef = await addDoc(collection(database, paths.jobs(tid)), {
      ...job,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    throw new TenantDataError('Failed to create job', 'CREATE_FAILED', error);
  }
};

export const updateJob = async (
  tid: string, 
  jobId: string, 
  updates: Partial<Job>
): Promise<void> => {
  const database = ensureDatabase();
  try {
    await updateDoc(doc(database, paths.job(tid, jobId)), {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    throw new TenantDataError('Failed to update job', 'UPDATE_FAILED', error);
  }
};

// =============================================================================
// CANDIDATE OPERATIONS
// =============================================================================

export const listCandidates = async (tid: string, jobId?: string): Promise<Candidate[]> => {
  const constraints: QueryConstraint[] = [orderBy('appliedDate', 'desc')];
  
  if (jobId) {
    constraints.unshift(where('jobId', '==', jobId));
  }
  
  return getCollection<Candidate>(paths.candidates(tid), constraints);
};

export const getCandidate = async (tid: string, candidateId: string): Promise<Candidate | null> => {
  return getDocument<Candidate>(paths.candidate(tid, candidateId));
};

export const createCandidate = async (tid: string, candidate: Omit<Candidate, 'id'>): Promise<string> => {
  const database = ensureDatabase();
  try {
    const docRef = await addDoc(collection(database, paths.candidates(tid)), {
      ...candidate,
      appliedDate: serverTimestamp(),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    throw new TenantDataError('Failed to create candidate', 'CREATE_FAILED', error);
  }
};

// =============================================================================
// REACT QUERY HOOKS
// =============================================================================

// Department hooks
export const useDepartments = (tid?: string) => {
  return useQuery({
    queryKey: queryKeys.departments(tid!),
    queryFn: () => listDepartments(tid!),
    enabled: !!tid,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useDepartment = (tid?: string, departmentId?: string) => {
  return useQuery({
    queryKey: queryKeys.department(tid!, departmentId!),
    queryFn: () => getDepartment(tid!, departmentId!),
    enabled: !!tid && !!departmentId,
  });
};

export const useCreateDepartment = (tid?: string) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (department: Omit<Department, 'id'>) => createDepartment(tid!, department),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.departments(tid!) });
    },
  });
};

// Employee hooks
export const useEmployees = (tid?: string, options?: ListEmployeesOptions) => {
  return useQuery({
    queryKey: queryKeys.employees(tid!, options),
    queryFn: () => listEmployees(tid!, options),
    enabled: !!tid,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useEmployee = (tid?: string, employeeId?: string) => {
  return useQuery({
    queryKey: queryKeys.employee(tid!, employeeId!),
    queryFn: () => getEmployee(tid!, employeeId!),
    enabled: !!tid && !!employeeId,
  });
};

export const useEmployeesByDepartment = (tid?: string, departmentId?: string) => {
  return useQuery({
    queryKey: queryKeys.employees(tid!, { departmentId }),
    queryFn: () => getEmployeesByDepartment(tid!, departmentId!),
    enabled: !!tid && !!departmentId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useCreateEmployee = (tid?: string) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (employee: Omit<Employee, 'id'>) => createEmployee(tid!, employee),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.employees(tid!) });
    },
  });
};

// Position hooks
export const usePositions = (tid?: string) => {
  return useQuery({
    queryKey: queryKeys.positions(tid!),
    queryFn: () => listPositions(tid!),
    enabled: !!tid,
    staleTime: 10 * 60 * 1000, // 10 minutes (positions change less frequently)
  });
};

export const usePosition = (tid?: string, positionId?: string) => {
  return useQuery({
    queryKey: queryKeys.position(tid!, positionId!),
    queryFn: () => getPosition(tid!, positionId!),
    enabled: !!tid && !!positionId,
  });
};

// Job hooks
export const useJobs = (tid?: string, options?: ListJobsOptions) => {
  return useQuery({
    queryKey: queryKeys.jobs(tid!, options),
    queryFn: () => listJobs(tid!, options),
    enabled: !!tid,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useJob = (tid?: string, jobId?: string) => {
  return useQuery({
    queryKey: queryKeys.job(tid!, jobId!),
    queryFn: () => getJob(tid!, jobId!),
    enabled: !!tid && !!jobId,
  });
};

export const useCreateJob = (tid?: string) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (job: Omit<Job, 'id'>) => createJob(tid!, job),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.jobs(tid!) });
    },
  });
};

// Candidate hooks
export const useCandidates = (tid?: string, jobId?: string) => {
  return useQuery({
    queryKey: queryKeys.candidates(tid!, jobId),
    queryFn: () => listCandidates(tid!, jobId),
    enabled: !!tid,
    staleTime: 1 * 60 * 1000, // 1 minute
  });
};

export const useCandidate = (tid?: string, candidateId?: string) => {
  return useQuery({
    queryKey: queryKeys.candidate(tid!, candidateId!),
    queryFn: () => getCandidate(tid!, candidateId!),
    enabled: !!tid && !!candidateId,
  });
};

// =============================================================================
// CONVENIENCE HOOKS WITH TENANT CONTEXT
// =============================================================================

// Hooks that automatically use the current tenant from context
export const useTenantDepartments = () => {
  const { session } = useTenant();
  return useDepartments(session?.tid);
};

export const useTenantEmployees = (options?: ListEmployeesOptions) => {
  const { session } = useTenant();
  return useEmployees(session?.tid, options);
};

export const useTenantJobs = (options?: ListJobsOptions) => {
  const { session } = useTenant();
  return useJobs(session?.tid, options);
};

export const useTenantPositions = () => {
  const { session } = useTenant();
  return usePositions(session?.tid);
};

export const useTenantCreateJob = () => {
  const { session } = useTenant();
  return useCreateJob(session?.tid);
};

export const useTenantCreateEmployee = () => {
  const { session } = useTenant();
  return useCreateEmployee(session?.tid);
};

export const useTenantCreateDepartment = () => {
  const { session } = useTenant();
  return useCreateDepartment(session?.tid);
};
