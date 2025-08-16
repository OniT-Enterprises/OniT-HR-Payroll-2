import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { User } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import { paths } from "@/lib/paths";
import {
  TenantContext,
  TenantConfig,
  TenantMember,
  ModuleName,
  UserRole,
  CustomClaims,
} from "@/types/tenant";

interface TenantProviderState {
  currentTenant: TenantContext | null;
  availableTenants: string[];
  loading: boolean;
  error: string | null;
  switchTenant: (tenantId: string) => Promise<void>;
  refreshTenant: () => Promise<void>;
}

const TenantContext = createContext<TenantProviderState | undefined>(undefined);

export function useTenant() {
  const context = useContext(TenantContext);
  if (context === undefined) {
    throw new Error("useTenant must be used within a TenantProvider");
  }
  return context;
}

interface TenantProviderProps {
  children: ReactNode;
}

// Default permissions based on role
const getDefaultPermissions = (role: UserRole, modules?: ModuleName[]) => {
  const hasModule = (module: ModuleName) =>
    !modules || modules.includes(module);

  return {
    canRead: (module: ModuleName): boolean => {
      if (!hasModule(module)) return false;

      switch (role) {
        case "owner":
        case "hr-admin":
          return true;
        case "manager":
          return [
            "staff",
            "hiring",
            "timeleave",
            "performance",
            "reports",
          ].includes(module);
        case "viewer":
          return ["staff", "reports"].includes(module);
        default:
          return false;
      }
    },

    canWrite: (module: ModuleName): boolean => {
      if (!hasModule(module)) return false;

      switch (role) {
        case "owner":
        case "hr-admin":
          return true;
        case "manager":
          return ["hiring", "timeleave", "performance"].includes(module);
        case "viewer":
          return false;
        default:
          return false;
      }
    },

    canManageDepartment: (departmentId: string): boolean => {
      // TODO: Implement department-specific permissions based on employee's managerId
      return role === "owner" || role === "hr-admin";
    },

    canManageEmployee: (employeeId: string): boolean => {
      // TODO: Implement employee-specific permissions based on reporting hierarchy
      return role === "owner" || role === "hr-admin";
    },
  };
};

export function TenantProvider({ children }: TenantProviderProps) {
  const [currentTenant, setCurrentTenant] = useState<TenantContext | null>(
    null,
  );
  const [availableTenants, setAvailableTenants] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadTenantData = async (
    tenantId: string,
    user: User,
  ): Promise<TenantContext> => {
    try {
      // Load tenant config
      const configDoc = await getDoc(doc(db, paths.settings(tenantId)));
      if (!configDoc.exists()) {
        throw new Error(`Tenant configuration not found for ${tenantId}`);
      }

      const config = {
        id: configDoc.id,
        ...configDoc.data(),
        createdAt: configDoc.data().createdAt?.toDate() || new Date(),
        updatedAt: configDoc.data().updatedAt?.toDate() || new Date(),
      } as TenantConfig;

      // Load member data
      const memberDoc = await getDoc(doc(db, paths.member(tenantId, user.uid)));
      if (!memberDoc.exists()) {
        throw new Error(`User is not a member of tenant ${tenantId}`);
      }

      const member = {
        id: memberDoc.id,
        ...memberDoc.data(),
        createdAt: memberDoc.data().createdAt?.toDate() || new Date(),
        updatedAt: memberDoc.data().updatedAt?.toDate() || new Date(),
      } as TenantMember;

      const permissions = getDefaultPermissions(member.role, member.modules);

      return {
        tenantId,
        config,
        member,
        permissions,
      };
    } catch (err) {
      console.error("Error loading tenant data:", err);
      throw new Error(
        `Failed to load tenant data: ${err instanceof Error ? err.message : "Unknown error"}`,
      );
    }
  };

  const getAvailableTenants = async (user: User): Promise<string[]> => {
    try {
      // Get tenants from custom claims
      const tokenResult = await user.getIdTokenResult();
      const customClaims = tokenResult.claims as CustomClaims;

      return customClaims.tenants || [];
    } catch (err) {
      console.error("Error getting available tenants:", err);
      return [];
    }
  };

  const switchTenant = async (tenantId: string): Promise<void> => {
    if (!auth.currentUser) {
      throw new Error("No authenticated user");
    }

    setLoading(true);
    setError(null);

    try {
      const tenantData = await loadTenantData(tenantId, auth.currentUser);
      setCurrentTenant(tenantData);

      // Store current tenant in localStorage for persistence
      localStorage.setItem("currentTenantId", tenantId);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to switch tenant";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const refreshTenant = async (): Promise<void> => {
    if (!currentTenant || !auth.currentUser) return;

    try {
      const tenantData = await loadTenantData(
        currentTenant.tenantId,
        auth.currentUser,
      );
      setCurrentTenant(tenantData);
    } catch (err) {
      console.error("Error refreshing tenant data:", err);
      setError(
        err instanceof Error ? err.message : "Failed to refresh tenant data",
      );
    }
  };

  // Initialize tenant context on auth state change
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      setLoading(true);
      setError(null);

      if (!user) {
        setCurrentTenant(null);
        setAvailableTenants([]);
        setLoading(false);
        return;
      }

      try {
        // Get available tenants
        const tenants = await getAvailableTenants(user);
        setAvailableTenants(tenants);

        if (tenants.length === 0) {
          setError("No accessible tenants found");
          setLoading(false);
          return;
        }

        // Try to restore previous tenant or use first available
        const savedTenantId = localStorage.getItem("currentTenantId");
        const targetTenantId =
          savedTenantId && tenants.includes(savedTenantId)
            ? savedTenantId
            : tenants[0];

        const tenantData = await loadTenantData(targetTenantId, user);
        setCurrentTenant(tenantData);
        localStorage.setItem("currentTenantId", targetTenantId);
      } catch (err) {
        console.error("Error initializing tenant context:", err);
        setError(
          err instanceof Error
            ? err.message
            : "Failed to initialize tenant context",
        );
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  const value: TenantProviderState = {
    currentTenant,
    availableTenants,
    loading,
    error,
    switchTenant,
    refreshTenant,
  };

  return (
    <TenantContext.Provider value={value}>{children}</TenantContext.Provider>
  );
}

// Helper hook to ensure tenant is available
export function useRequiredTenant(): TenantContext {
  const { currentTenant, loading, error } = useTenant();

  if (loading) {
    throw new Error("Tenant context is still loading");
  }

  if (error) {
    throw new Error(`Tenant context error: ${error}`);
  }

  if (!currentTenant) {
    throw new Error("No tenant selected");
  }

  return currentTenant;
}

// Helper hook to get current tenant ID
export function useTenantId(): string {
  const tenant = useRequiredTenant();
  return tenant.tenantId;
}
