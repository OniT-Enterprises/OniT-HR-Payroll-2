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
  tryAuthentication,
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
    console.log("🏢 Loading departments from Firebase first, then fallback");

    // Check cache first but with shorter expiry for departments
    const cachedDepartments = this.getCachedDepartments();
    if (cachedDepartments.length > 0) {
      console.log("✅ Using cached department data");
      // Try Firebase refresh in background
      this.refreshFirebaseData();
      return cachedDepartments;
    }

    // Try Firebase if available
    if (this.isFirebaseAvailable()) {
      try {
        console.log("🔥 Attempting to load departments from Firebase...");

        const collection = this.getCollection();
        if (!collection) {
          throw new Error("Collection not available");
        }

        const querySnapshot = await getDocs(
          query(collection, orderBy("name", "asc")),
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

        console.log(`✅ Successfully got ${departments.length} departments from Firebase`);
        // Cache successful results
        this.cacheDepartments(departments);
        return departments;
      } catch (error) {
        console.warn("🚫 Firebase failed for departments:", error);
      }
    } else {
      console.log("🚫 Firebase not available for departments");
    }

    // Fallback to mock data
    console.log(`📋 Using ${this.getMockDepartments().length} mock departments as fallback`);
    return this.getMockDepartments();
  }

  private async refreshFirebaseData(): Promise<void> {
    // Background refresh - don't block UI
    if (!this.isFirebaseAvailable()) return;

    try {
      const collection = this.getCollection();
      if (!collection) return;

      const querySnapshot = await getDocs(
        query(collection, orderBy("name", "asc")),
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

      this.cacheDepartments(departments);
      console.log(`🔄 Background refresh: ${departments.length} departments updated`);
    } catch (error) {
      console.warn("Background refresh failed:", error);
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
    // Try Firebase if available
    if (this.isFirebaseAvailable()) {
      try {
        const collection = this.getCollection();
        if (collection) {
          const now = Timestamp.now();
          const docRef = await addDoc(collection, {
            ...departmentData,
            createdAt: now,
            updatedAt: now,
          });
          console.log("✅ Department added successfully to Firebase");
          return docRef.id;
        }
      } catch (error) {
        console.warn("🚫 Firebase failed for addDepartment:", error);
      }
    }

    // Fallback: simulate adding to mock data (for development)
    const mockId = `mock-dept-${Date.now()}`;
    console.log("📋 Simulated department add (mock data mode):", departmentData.name);
    return mockId;
  }

  async updateDepartment(
    id: string,
    updates: Partial<DepartmentInput>,
  ): Promise<void> {
    // Try Firebase if available
    if (this.isFirebaseAvailable() && db) {
      try {
        const departmentRef = doc(db, "departments", id);
        await updateDoc(departmentRef, {
          ...updates,
          updatedAt: Timestamp.now(),
        });
        console.log("✅ Department updated successfully in Firebase");
        return;
      } catch (error) {
        console.warn("🚫 Firebase failed for updateDepartment:", error);
      }
    }

    // Fallback: simulate update (for development)
    console.log("📋 Simulated department update (mock data mode):", id, updates);
  }

  async deleteDepartment(id: string): Promise<void> {
    // Try Firebase if available
    if (this.isFirebaseAvailable() && db) {
      try {
        const departmentRef = doc(db, "departments", id);
        await deleteDoc(departmentRef);
        console.log("✅ Department deleted successfully from Firebase");
        return;
      } catch (error) {
        console.warn("🚫 Firebase failed for deleteDepartment:", error);
      }
    }

    // Fallback: simulate delete (for development)
    console.log("��� Simulated department delete (mock data mode):", id);
  }
}

export const departmentService = new DepartmentService();
