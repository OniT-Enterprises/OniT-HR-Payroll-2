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
} from "firebase/firestore";
import { db, isFirebaseReady, getFirebaseError } from "@/lib/firebase";
import { mockDataService } from "./mockDataService";

export interface Employee {
  id?: string;
  personalInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    phoneApp: string;
    appEligible: boolean;
    address: string;
    dateOfBirth: string;
    socialSecurityNumber: string;
    emergencyContactName: string;
    emergencyContactPhone: string;
  };
  jobDetails: {
    employeeId: string;
    department: string;
    position: string;
    hireDate: string;
    employmentType: string;
    workLocation: string;
    manager: string;
  };
  compensation: {
    monthlySalary: number;
    annualLeaveDays: number;
    benefitsPackage: string;
  };
  documents: {
    employeeIdCard: { number: string; expiryDate: string; required: boolean };
    socialSecurityNumber: {
      number: string;
      expiryDate: string;
      required: boolean;
    };
    electoralCard: { number: string; expiryDate: string; required: boolean };
    idCard: { number: string; expiryDate: string; required: boolean };
    passport: { number: string; expiryDate: string; required: boolean };
    workContract: { fileUrl: string; uploadDate: string };
    nationality: string;
    workingVisaResidency: {
      number: string;
      expiryDate: string;
      fileUrl: string;
    };
  };
  status: "active" | "inactive" | "terminated";
  createdAt?: any;
  updatedAt?: any;
}

class EmployeeService {
  private collection = collection(db, "employees");

  private async testConnection(): Promise<void> {
    try {
      // Try to read a simple query to test connectivity
      const testQuery = query(this.collection, limit(1));
      await getDocs(testQuery);
    } catch (error) {
      console.error("Firebase connection test failed:", error);
      throw new Error(
        "Unable to connect to database. Please check your internet connection.",
      );
    }
  }

  private cacheEmployees(employees: Employee[]): void {
    try {
      localStorage.setItem(
        "cachedEmployees",
        JSON.stringify({
          data: employees,
          timestamp: Date.now(),
        }),
      );
    } catch (error) {
      console.warn("Failed to cache employees:", error);
    }
  }

  private getOfflineEmployees(): Employee[] {
    try {
      const cached = localStorage.getItem("cachedEmployees");
      if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        // Use cached data if it's less than 1 hour old
        if (Date.now() - timestamp < 3600000) {
          return data;
        }
      }
    } catch (error) {
      console.warn("Failed to retrieve cached employees:", error);
    }
    return [];
  }

  async getAllEmployees(): Promise<Employee[]> {
    // First check network connectivity
    if (!navigator.onLine) {
      console.warn("🚫 No internet connection, using mock data");
      return await mockDataService.getAllEmployees();
    }

    // Check if Firebase is properly initialized
    if (!isFirebaseReady() || !db) {
      const error = getFirebaseError();
      console.warn(
        "Firebase not ready, trying cached data and mock fallback:",
        error,
      );

      // Try cached data first
      const cachedEmployees = this.getOfflineEmployees();
      if (cachedEmployees.length > 0) {
        return cachedEmployees;
      }

      // Fall back to mock data for development/demo
      console.warn("Using mock data - Firebase unavailable");
      return await mockDataService.getAllEmployees();
    }

    // Quick network test before attempting Firebase operations
    try {
      // Test if we can reach a simple endpoint
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);

      await fetch("https://www.google.com/favicon.ico", {
        method: "HEAD",
        mode: "no-cors",
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
    } catch (networkError) {
      console.warn("🌐 Network connectivity test failed, using mock data");
      return await mockDataService.getAllEmployees();
    }

    try {
      console.log("🔍 Attempting to load employees from Firebase...");

      // Add timeout with shorter duration for better UX
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(
          () => reject(new Error("Request timeout after 10 seconds")),
          10000,
        ),
      );

      const queryPromise = getDocs(
        query(this.collection, orderBy("createdAt", "desc")),
      );

      const querySnapshot = (await Promise.race([
        queryPromise,
        timeoutPromise,
      ])) as any;

      const employees = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Employee[];

      // Cache successful results
      this.cacheEmployees(employees);

      return employees;
    } catch (error) {
      console.error("❌ Error getting employees from Firebase:", error);
      console.error("Error type:", typeof error);
      console.error("Error name:", error?.constructor?.name);

      // Any Firebase error - immediately fallback to mock data
      console.warn(
        "⚠️ Firebase operation failed, using mock data:",
        error.message || error,
      );
      return await mockDataService.getAllEmployees();

      // Handle permission errors
      if (error.code?.includes("permission-denied")) {
        throw new Error("❌ Access denied. Please check your authentication.");
      }

      // Handle quota errors
      if (error.code?.includes("quota-exceeded")) {
        throw new Error(
          "⚠️ Service temporarily unavailable. Please try again later.",
        );
      }

      // Generic error fallback
      throw new Error(
        "⚠️ Unable to load employee data. Please refresh the page and try again.",
      );
    }
  }

  async getEmployeeById(id: string): Promise<Employee | null> {
    try {
      const docSnap = await getDoc(doc(this.collection, id));
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as Employee;
      }
      return null;
    } catch (error) {
      console.error("Error getting employee:", error);
      return null;
    }
  }

  async addEmployee(employee: Omit<Employee, "id">): Promise<string | null> {
    // Check if Firebase is properly initialized
    if (!isFirebaseReady() || !db) {
      const error = getFirebaseError();
      console.warn(
        "Firebase not ready, using mock service for adding employee:",
        error,
      );

      // Use mock service when Firebase is unavailable
      try {
        const id = await mockDataService.addEmployee(employee);
        return id;
      } catch (mockError) {
        console.error("Mock service also failed:", mockError);
        throw new Error(
          "Unable to add employee: Both Firebase and local storage are unavailable.",
        );
      }
    }

    try {
      const docRef = await addDoc(this.collection, {
        ...employee,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      return docRef.id;
    } catch (error) {
      console.error("Error adding employee to Firebase:", error);

      if (error.message?.includes("Failed to fetch")) {
        console.warn("Firebase failed, trying mock service fallback");
        try {
          const id = await mockDataService.addEmployee(employee);
          return id;
        } catch (mockError) {
          console.error("Mock service also failed:", mockError);
          throw new Error(
            "Failed to add employee: Connection issues and local storage unavailable. Please try again later.",
          );
        }
      }

      return null;
    }
  }

  async updateEmployee(
    id: string,
    updates: Partial<Employee>,
  ): Promise<boolean> {
    try {
      await updateDoc(doc(this.collection, id), {
        ...updates,
        updatedAt: serverTimestamp(),
      });
      return true;
    } catch (error) {
      console.error("Error updating employee:", error);
      return false;
    }
  }

  async deleteEmployee(id: string): Promise<boolean> {
    try {
      await deleteDoc(doc(this.collection, id));
      return true;
    } catch (error) {
      console.error("Error deleting employee:", error);
      return false;
    }
  }

  async getEmployeesByDepartment(department: string): Promise<Employee[]> {
    try {
      const q = query(
        this.collection,
        where("jobDetails.department", "==", department),
        orderBy("createdAt", "desc"),
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Employee[];
    } catch (error) {
      console.error("Error getting employees by department:", error);
      return [];
    }
  }

  async searchEmployees(searchTerm: string): Promise<Employee[]> {
    try {
      // Note: Firestore doesn't support full-text search natively
      // This is a simple search by first name, last name, or email
      const employees = await this.getAllEmployees();
      return employees.filter(
        (emp) =>
          emp.personalInfo.firstName
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          emp.personalInfo.lastName
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          emp.personalInfo.email
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          emp.jobDetails.employeeId
            .toLowerCase()
            .includes(searchTerm.toLowerCase()),
      );
    } catch (error) {
      console.error("Error searching employees:", error);
      return [];
    }
  }
}

export const employeeService = new EmployeeService();
