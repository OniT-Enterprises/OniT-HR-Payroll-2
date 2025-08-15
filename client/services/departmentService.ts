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
import { safeFirestoreQuery } from "@/lib/firebaseProxy";

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
    return db ? collection(db, "departments") : null;
  }

  private isFirebaseAvailable(): boolean {
    return !!(db && this.getCollection() && isFirebaseReady() && !isFirebaseBlocked());
  }

  async getAllDepartments(): Promise<Department[]> {
    // Check if Firebase is blocked due to previous errors
    if (isFirebaseBlocked()) {
      console.warn("🚫 Firebase blocked, using mock departments");
      return this.getMockDepartments();
    }

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

    // Use safe Firebase operation wrapper
    return await safeFirestoreQuery(
      async () => {
        console.log("🔍 Attempting to load departments from Firebase...");

        const querySnapshot = await getDocs(
          query(this.getCollection(), orderBy("name", "asc")),
        );

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
        return departments;
      },
      this.getMockDepartments(),
      "Load departments",
    );
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
