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
import { db } from "@/lib/firebase";

export interface Department {
  id: string;
  name: string;
  director?: string;
  manager?: string;
  description?: string;
  budget?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface DepartmentInput {
  name: string;
  director?: string;
  manager?: string;
  description?: string;
  budget?: number;
}

class DepartmentService {
  private collection = collection(db, "departments");

  async getAllDepartments(): Promise<Department[]> {
    try {
      const q = query(this.collection, orderBy("name", "asc"));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        } as Department;
      });
    } catch (error) {
      console.error("Error fetching departments:", error);
      throw error;
    }
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
