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
import { db, isFirebaseReady, getFirebaseError } from "@/lib/firebase";

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
  private collection = collection(db, "departments");
  private cacheKey = "departments_cache";

  async getAllDepartments(): Promise<Department[]> {
    // Check network connectivity first
    if (!navigator.onLine) {
      console.warn("🌐 No internet connection, using mock departments");
      return this.getMockDepartments();
    }

    // Check if Firebase is ready
    if (!isFirebaseReady() || !db) {
      const error = getFirebaseError();
      console.warn("⚠️ Firebase not ready, using mock departments:", error);
      return this.getMockDepartments();
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
        query(this.collection, orderBy("name", "asc")),
      );

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
    try {
      const now = Timestamp.now();
      const docRef = await addDoc(this.collection, {
        ...departmentData,
        createdAt: now,
        updatedAt: now,
      });
      return docRef.id;
    } catch (error) {
      console.error("Error adding department:", error);
      throw error;
    }
  }

  async updateDepartment(
    id: string,
    updates: Partial<DepartmentInput>,
  ): Promise<void> {
    try {
      const departmentRef = doc(db, "departments", id);
      await updateDoc(departmentRef, {
        ...updates,
        updatedAt: Timestamp.now(),
      });
    } catch (error) {
      console.error("Error updating department:", error);
      throw error;
    }
  }

  async deleteDepartment(id: string): Promise<void> {
    try {
      const departmentRef = doc(db, "departments", id);
      await deleteDoc(departmentRef);
    } catch (error) {
      console.error("Error deleting department:", error);
      throw error;
    }
  }
}

export const departmentService = new DepartmentService();
