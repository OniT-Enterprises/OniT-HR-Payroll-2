import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from 'firebase/auth';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { paths } from '@/lib/paths';
import { 
  TenantConfig, 
  TenantMember, 
  TenantSession, 
  TenantRole, 
  ModulePermission,
  CustomClaims,
  DEFAULT_ROLE_PERMISSIONS,
  hasModulePermission 
} from '@/types/tenant';

interface TenantContextType {
  // Current session
  session: TenantSession | null;
  loading: boolean;
  error: string | null;
  
  // Available tenants for current user
  availableTenants: Array<{ id: string; name: string; role: TenantRole }>;
  
  // Tenant switching
  switchTenant: (tid: string) => Promise<void>;
  
  // Permission helpers
  hasModule: (module: ModulePermission) => boolean;
  canWrite: () => boolean;
  canManage: () => boolean;
  
  // Refresh functions
  refreshSession: () => Promise<void>;
  refreshTenants: () => Promise<void>;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export function useTenant() {
  const context = useContext(TenantContext);
  if (context === undefined) {
    throw new Error('useTenant must be used within a TenantProvider');
  }
  return context;
}

interface TenantProviderProps {
  children: ReactNode;
}

export function TenantProvider({ children }: TenantProviderProps) {
  const [session, setSession] = useState<TenantSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [availableTenants, setAvailableTenants] = useState<Array<{ id: string; name: string; role: TenantRole }>>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Get current user and custom claims
  const getCurrentUserAndClaims = async (): Promise<{ user: User | null; claims: CustomClaims | null }> => {
    if (!auth?.currentUser) {
      return { user: null, claims: null };
    }

    try {
      const idTokenResult = await auth.currentUser.getIdTokenResult();
      const claims = idTokenResult.claims as CustomClaims;
      return { user: auth.currentUser, claims };
    } catch (error) {
      console.error('Failed to get user claims:', error);
      return { user: auth.currentUser, claims: null };
    }
  };

  // Load available tenants for current user
  const loadAvailableTenants = async (user: User): Promise<Array<{ id: string; name: string; role: TenantRole }>> => {
    if (!db) {
      console.warn('Database not available');
      return [];
    }

    try {
      // Method 1: Try to get tenants from custom claims first
      const { claims } = await getCurrentUserAndClaims();
      if (claims?.tenants && Array.isArray(claims.tenants)) {
        const tenantPromises = claims.tenants.map(async (tid: string) => {
          try {
            // Get tenant config
            const tenantDoc = await getDoc(doc(db, paths.tenant(tid)));
            const memberDoc = await getDoc(doc(db, paths.member(tid, user.uid)));
            
            if (tenantDoc.exists() && memberDoc.exists()) {
              const tenantData = tenantDoc.data() as TenantConfig;
              const memberData = memberDoc.data() as TenantMember;
              
              return {
                id: tid,
                name: tenantData.name || tid,
                role: memberData.role
              };
            }
            return null;
          } catch (error) {
            console.warn(`Failed to load tenant ${tid}:`, error);
            return null;
          }
        });

        const tenants = (await Promise.all(tenantPromises)).filter(Boolean) as Array<{ id: string; name: string; role: TenantRole }>;
        if (tenants.length > 0) {
          return tenants;
        }
      }

      // Method 2: Fallback - discover tenants by checking member collections
      // This is less efficient but works when custom claims aren't set yet
      console.log('Discovering tenants by checking memberships...');
      
      // Note: This requires a composite index on members collection
      // For now, we'll return empty array and rely on proper tenant provisioning
      return [];
      
    } catch (error) {
      console.error('Failed to load available tenants:', error);
      return [];
    }
  };

  // Load tenant session data
  const loadTenantSession = async (tid: string, user: User): Promise<TenantSession | null> => {
    if (!db) {
      console.warn('Database not available');
      return null;
    }

    try {
      // Load tenant config and member data in parallel
      const [tenantDoc, memberDoc] = await Promise.all([
        getDoc(doc(db, paths.tenant(tid))),
        getDoc(doc(db, paths.member(tid, user.uid)))
      ]);

      if (!tenantDoc.exists()) {
        throw new Error(`Tenant ${tid} not found`);
      }

      if (!memberDoc.exists()) {
        throw new Error(`User is not a member of tenant ${tid}`);
      }

      const config = { id: tid, ...tenantDoc.data() } as TenantConfig;
      const member = memberDoc.data() as TenantMember;

      // Determine modules based on role and explicit permissions
      const defaultModules = DEFAULT_ROLE_PERMISSIONS[member.role] || [];
      const modules = member.modules || defaultModules;

      return {
        tid,
        role: member.role,
        modules,
        config,
        member
      };
    } catch (error) {
      console.error(`Failed to load tenant session for ${tid}:`, error);
      throw error;
    }
  };

  // Switch to a different tenant
  const switchTenant = async (tid: string) => {
    if (!currentUser) {
      throw new Error('No authenticated user');
    }

    try {
      setLoading(true);
      setError(null);

      const newSession = await loadTenantSession(tid, currentUser);
      if (newSession) {
        setSession(newSession);
        // Store current tenant in localStorage for persistence
        localStorage.setItem('currentTenantId', tid);
      }
    } catch (error: any) {
      console.error('Failed to switch tenant:', error);
      setError(error.message || 'Failed to switch tenant');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Refresh current session
  const refreshSession = async () => {
    if (!session || !currentUser) return;

    try {
      const refreshedSession = await loadTenantSession(session.tid, currentUser);
      if (refreshedSession) {
        setSession(refreshedSession);
      }
    } catch (error) {
      console.error('Failed to refresh session:', error);
      setError('Failed to refresh session');
    }
  };

  // Refresh available tenants
  const refreshTenants = async () => {
    if (!currentUser) return;

    try {
      const tenants = await loadAvailableTenants(currentUser);
      setAvailableTenants(tenants);
    } catch (error) {
      console.error('Failed to refresh tenants:', error);
    }
  };

  // Initialize tenant session (auth state listener disabled to prevent watch stream errors)
  useEffect(() => {
    console.log('🔧 TenantProvider initializing (auth listener disabled to prevent Firebase assertion errors)');

    // Set initial state - user will need to manually authenticate or we'll use mock mode
    setCurrentUser(null);
    setSession(null);
    setAvailableTenants([]);
    setLoading(false);
    setError('Authentication disabled to prevent Firebase errors. Using demo mode.');

    // For now, we'll use a mock tenant session to allow the app to function
    const mockSession: TenantSession = {
      tid: 'demo-tenant',
      role: 'owner',
      modules: ['hiring', 'staff', 'timeleave', 'performance', 'payroll', 'reports'],
      config: {
        id: 'demo-tenant',
        name: 'Demo Company',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      member: {
        uid: 'demo-user',
        role: 'owner',
        modules: ['hiring', 'staff', 'timeleave', 'performance', 'payroll', 'reports'],
        email: 'demo@example.com',
        displayName: 'Demo User',
        joinedAt: new Date(),
        lastActiveAt: new Date(),
      },
    };

    setSession(mockSession);
    setLoading(false);

    console.log('✅ TenantProvider initialized with demo session');

    return () => {
      // No cleanup needed since no listeners are created
    };
  }, []);

  // Permission helpers
  const hasModule = (module: ModulePermission): boolean => {
    if (!session) return false;
    return hasModulePermission(session.role, session.modules, module);
  };

  const canWrite = (): boolean => {
    if (!session) return false;
    return session.role === 'owner' || session.role === 'hr-admin';
  };

  const canManage = (): boolean => {
    if (!session) return false;
    return session.role === 'owner' || session.role === 'hr-admin';
  };

  const value: TenantContextType = {
    session,
    loading,
    error,
    availableTenants,
    switchTenant,
    hasModule,
    canWrite,
    canManage,
    refreshSession,
    refreshTenants,
  };

  return (
    <TenantContext.Provider value={value}>
      {children}
    </TenantContext.Provider>
  );
}
