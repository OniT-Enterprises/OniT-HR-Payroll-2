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
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export interface Candidate {
  id?: string;
  name: string;
  email: string;
  phone: string;
  position: string;
  experience: string;
  score: number;
  status: "New" | "Under Review" | "Shortlisted" | "Rejected" | "Hired";
  appliedDate: string;
  resume: string;
  avatar: string;
  cvQuality: number;
  coverLetter: number;
  technicalSkills: number;
  interviewScore: number | null;
  totalScore: number;
  notes?: string;
  createdAt?: any;
  updatedAt?: any;
}

class CandidateService {
  private collection = collection(db, "candidates");

  async getAllCandidates(): Promise<Candidate[]> {
    try {
      const querySnapshot = await getDocs(
        query(this.collection, orderBy("createdAt", "desc")),
      );
      return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Candidate[];
    } catch (error) {
      console.error("Error getting candidates:", error);
      return [];
    }
  }

  async getCandidateById(id: string): Promise<Candidate | null> {
    try {
      const docSnap = await getDoc(doc(this.collection, id));
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as Candidate;
      }
      return null;
    } catch (error) {
      console.error("Error getting candidate:", error);
      return null;
    }
  }

  async addCandidate(candidate: Omit<Candidate, "id">): Promise<string | null> {
    try {
      const docRef = await addDoc(this.collection, {
        ...candidate,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      return docRef.id;
    } catch (error) {
      console.error("Error adding candidate:", error);
      return null;
    }
  }

  async updateCandidate(
    id: string,
    updates: Partial<Candidate>,
  ): Promise<boolean> {
    try {
      await updateDoc(doc(this.collection, id), {
        ...updates,
        updatedAt: serverTimestamp(),
      });
      return true;
    } catch (error) {
      console.error("Error updating candidate:", error);
      return false;
    }
  }

  async deleteCandidate(id: string): Promise<boolean> {
    try {
      await deleteDoc(doc(this.collection, id));
      return true;
    } catch (error) {
      console.error("Error deleting candidate:", error);
      return false;
    }
  }

  async getCandidatesByStatus(status: string): Promise<Candidate[]> {
    try {
      const q = query(
        this.collection,
        where("status", "==", status),
        orderBy("createdAt", "desc"),
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Candidate[];
    } catch (error) {
      console.error("Error getting candidates by status:", error);
      return [];
    }
  }

  async getCandidatesByPosition(position: string): Promise<Candidate[]> {
    try {
      const q = query(
        this.collection,
        where("position", "==", position),
        orderBy("createdAt", "desc"),
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Candidate[];
    } catch (error) {
      console.error("Error getting candidates by position:", error);
      return [];
    }
  }
}

export const candidateService = new CandidateService();
