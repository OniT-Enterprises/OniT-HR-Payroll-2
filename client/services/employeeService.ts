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
import { db } from "@/lib/firebase";

export interface Employee {
  id?: string;
  personalInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
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

  async getAllEmployees(): Promise<Employee[]> {
    try {
      // Add timeout and retry logic
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Request timeout")), 10000),
      );

      const queryPromise = getDocs(
        query(this.collection, orderBy("createdAt", "desc")),
      );

      const querySnapshot = (await Promise.race([
        queryPromise,
        timeoutPromise,
      ])) as any;

      return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Employee[];
    } catch (error) {
      console.error("Error getting employees:", error);

      // Handle different types of errors
      if (
        error.message?.includes("fetch") ||
        error.message?.includes("Failed to fetch") ||
        error.message?.includes("network") ||
        error.message?.includes("timeout") ||
        error.code?.includes("unavailable") ||
        error.code?.includes("resource-exhausted") ||
        error.code?.includes("deadline-exceeded")
      ) {
        throw new Error(
          "🔄 Connection issue detected. Please check your internet connection and try again.",
        );
      }

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
    try {
      const docRef = await addDoc(this.collection, {
        ...employee,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      return docRef.id;
    } catch (error) {
      console.error("Error adding employee:", error);
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
