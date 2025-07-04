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
    annualSalary: number;
    annualLeaveDays: number;
    benefitsPackage: string;
  };
  documents: {
    socialSecurityNumber: { number: string; expiryDate: string };
    electoralCard: { number: string; expiryDate: string };
    idCard: { number: string; expiryDate: string };
    passport: { number: string; expiryDate: string };
  };
  status: "active" | "inactive" | "terminated";
  createdAt?: any;
  updatedAt?: any;
}

class EmployeeService {
  private collection = collection(db, "employees");

  async getAllEmployees(): Promise<Employee[]> {
    try {
      const querySnapshot = await getDocs(
        query(this.collection, orderBy("createdAt", "desc")),
      );
      return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Employee[];
    } catch (error) {
      console.error("Error getting employees:", error);
      return [];
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
