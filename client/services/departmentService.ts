import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  Timestamp,
} from "firebase/firestore";
import {
  db,
  isFirebaseReady,
  getFirebaseError,
  isFirebaseBlocked,
} from "@/lib/firebase";
import { isOnline, checkNetwork } from "@/lib/networkState";

export interface Department {
  id: string;
  name: string;
  director?: string;
  manager?: string;
  icon?: string;
  shape?: "circle" | "square" | "hexagon" | "diamond";
  color?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface DepartmentInput {
  name: string;
  director?: string;
  manager?: string;
  icon?: string;
  shape?: "circle" | "square" | "hexagon" | "diamond";
  color?: string;
}

class DepartmentService {
  private cacheKey = "departments_cache";

  private getCollection() {
    if (!db || !isFirebaseReady()) {
      throw new Error("Firebase not ready");
    }
    try {
      return collection(db, "departments");
    } catch (error) {
      // Catch any collection access errors
      if (
        error instanceof TypeError ||
        error.message?.includes("Failed to fetch")
      ) {
        throw new Error("Network error - Firebase collection not accessible");
      }
      throw error;
    }
  }

  async getAllDepartments(): Promise<Department[]> {
    // Check network connectivity first using our utility
    if (!isOnline()) {
      console.warn("🌐 No internet connection, using mock departments");
      return this.getMockDepartments();
    }

    // Additional network check for more reliability
    const networkAvailable = await checkNetwork();
    if (!networkAvailable) {
      console.warn("🌐 Network check failed, using mock departments");
      return this.getMockDepartments();
    }

    // Check if Firebase is ready
    if (!isFirebaseReady() || !db) {
      const error = getFirebaseError();
      console.warn("⚠️ Firebase not ready, using mock departments:", error);
      return this.getMockDepartments();
    }

    // Quick connectivity test to Firebase
    try {
      await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error("Firebase connectivity test timeout"));
        }, 1000);

        // Try to access Firebase - this will throw TypeError if network issues
        if (typeof db.app === "undefined") {
          clearTimeout(timeout);
          reject(new Error("Firebase app not accessible"));
          return;
        }

        clearTimeout(timeout);
        resolve(true);
      });
    } catch (error) {
      console.warn("⚠️ Firebase quick connectivity test failed:", error);
      if (
        error instanceof TypeError ||
        error.message?.includes("Failed to fetch")
      ) {
        return this.getMockDepartments();
      }
    }

    // Check cache first
    const cachedDepartments = this.getCachedDepartments();
    if (cachedDepartments.length > 0) {
      console.log("✅ Using cached department data");
      return cachedDepartments;
    }

    try {
      console.log("🔍 Attempting to load departments from Firebase...");

      // Add timeout for quick fallback
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(
          () => reject(new Error("Request timeout after 3 seconds")),
          3000,
        ),
      );

      const queryPromise = getDocs(
        query(this.getCollection(), orderBy("name", "asc")),
      ).catch((error) => {
        // Immediately catch TypeError and network errors
        if (
          error instanceof TypeError ||
          error.message?.includes("Failed to fetch")
        ) {
          console.warn(
            "🌐 Network error detected during query, falling back to mock data",
          );
          throw new Error("Network error - using fallback data");
        }
        throw error;
      });

      const querySnapshot = (await Promise.race([
        queryPromise,
        timeoutPromise,
      ])) as any;

      const departments = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        } as Department;
      });

      // Cache successful results
      this.cacheDepartments(departments);
      console.log("✅ Successfully loaded departments from Firebase");
      return departments;
    } catch (error) {
      console.error("❌ Error getting departments from Firebase:", error);
      console.error("Error type:", typeof error);
      console.error("Error name:", error?.constructor?.name);

      // Any Firebase error - immediately fallback to mock data
      console.warn(
        "⚠️ Firebase operation failed, using mock departments:",
        error.message || error,
      );
      return this.getMockDepartments();
    }
  }

  private getCachedDepartments(): Department[] {
    try {
      const cached = localStorage.getItem(this.cacheKey);
      if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        // Use cache for 5 minutes
        if (Date.now() - timestamp < 5 * 60 * 1000) {
          return data;
        }
      }
    } catch (error) {
      console.warn("Error reading department cache:", error);
    }
    return [];
  }

  private cacheDepartments(departments: Department[]): void {
    try {
      localStorage.setItem(
        this.cacheKey,
        JSON.stringify({
          data: departments,
          timestamp: Date.now(),
        }),
      );
    } catch (error) {
      console.warn("Error caching departments:", error);
    }
  }

  private getMockDepartments(): Department[] {
    return [
      {
        id: "dept-1",
        name: "Engineering",
        director: "John Smith",
        manager: "Jane Doe",
        icon: "building",
        shape: "circle",
        color: "#3B82F6",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "dept-2",
        name: "Marketing",
        director: "Sarah Wilson",
        manager: "Mike Johnson",
        icon: "building",
        shape: "circle",
        color: "#10B981",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "dept-3",
        name: "Sales",
        director: "Robert Brown",
        manager: "Lisa Davis",
        icon: "building",
        shape: "circle",
        color: "#F59E0B",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "dept-4",
        name: "Human Resources",
        director: "Emily Clark",
        manager: "David Miller",
        icon: "building",
        shape: "circle",
        color: "#8B5CF6",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "dept-5",
        name: "Finance",
        director: "Michael Anderson",
        manager: "Jennifer Taylor",
        icon: "building",
        shape: "circle",
        color: "#EF4444",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];
  }

  async addDepartment(departmentData: DepartmentInput): Promise<string> {
    // Check if Firebase is ready
    if (!isFirebaseReady() || !db) {
      console.warn("⚠️ Firebase not ready, cannot add department");
      throw new Error("Unable to add department - Firebase not available");
    }

    try {
      const now = Timestamp.now();
      const docRef = await addDoc(this.getCollection(), {
        ...departmentData,
        createdAt: now,
        updatedAt: now,
      });
      console.log("✅ Department added successfully");
      return docRef.id;
    } catch (error) {
      console.error("❌ Error adding department:", error);
      if (
        error instanceof TypeError ||
        error.message?.includes("Failed to fetch")
      ) {
        throw new Error(
          "Network error - unable to add department. Please check your connection.",
        );
      }
      throw new Error(`Failed to add department: ${error.message || error}`);
    }
  }

  async updateDepartment(
    id: string,
    updates: Partial<DepartmentInput>,
  ): Promise<void> {
    // Check if Firebase is ready
    if (!isFirebaseReady() || !db) {
      console.warn("⚠️ Firebase not ready, cannot update department");
      throw new Error("Unable to update department - Firebase not available");
    }

    try {
      const departmentRef = doc(db, "departments", id);
      await updateDoc(departmentRef, {
        ...updates,
        updatedAt: Timestamp.now(),
      });
      console.log("✅ Department updated successfully");
    } catch (error) {
      console.error("❌ Error updating department:", error);
      if (
        error instanceof TypeError ||
        error.message?.includes("Failed to fetch")
      ) {
        throw new Error(
          "Network error - unable to update department. Please check your connection.",
        );
      }
      throw new Error(`Failed to update department: ${error.message || error}`);
    }
  }

  async deleteDepartment(id: string): Promise<void> {
    // Check if Firebase is ready
    if (!isFirebaseReady() || !db) {
      console.warn("⚠️ Firebase not ready, cannot delete department");
      throw new Error("Unable to delete department - Firebase not available");
    }

    try {
      const departmentRef = doc(db, "departments", id);
      await deleteDoc(departmentRef);
      console.log("✅ Department deleted successfully");
    } catch (error) {
      console.error("❌ Error deleting department:", error);
      if (
        error instanceof TypeError ||
        error.message?.includes("Failed to fetch")
      ) {
        throw new Error(
          "Network error - unable to delete department. Please check your connection.",
        );
      }
      throw new Error(`Failed to delete department: ${error.message || error}`);
    }
  }
}

export const departmentService = new DepartmentService();
