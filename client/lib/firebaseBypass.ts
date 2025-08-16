import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "./firebase";

// Bypass authentication by directly accessing Firestore
// This will only work if Firestore rules allow unauthenticated access
export async function testDirectFirestoreAccess() {
  if (!db) {
    throw new Error("Firestore not initialized");
  }

  try {
    console.log("🔍 Testing direct Firestore access (no auth)...");
    
    // Test employees collection
    const employeeCollection = collection(db, "employees");
    const employeeSnapshot = await getDocs(query(employeeCollection, orderBy("createdAt", "desc")));
    const employeeCount = employeeSnapshot.docs.length;
    
    console.log(`✅ Direct access to employees: ${employeeCount} documents`);
    
    // Test departments collection  
    const departmentCollection = collection(db, "departments");
    const departmentSnapshot = await getDocs(query(departmentCollection, orderBy("name", "asc")));
    const departmentCount = departmentSnapshot.docs.length;
    
    console.log(`✅ Direct access to departments: ${departmentCount} documents`);
    
    return {
      success: true,
      employeeCount,
      departmentCount,
      message: `Found ${employeeCount} employees and ${departmentCount} departments`
    };
    
  } catch (error) {
    console.error("❌ Direct Firestore access failed:", error);
    
    if (error.code === 'permission-denied') {
      return {
        success: false,
        error: 'permission-denied',
        message: 'Firestore rules require authentication. Please enable Anonymous Auth in Firebase Console.'
      };
    }
    
    return {
      success: false,
      error: error.code || 'unknown',
      message: error.message || 'Unknown error'
    };
  }
}

export async function getEmployeesDirectly() {
  if (!db) return [];
  
  try {
    const employeeCollection = collection(db, "employees");
    const snapshot = await getDocs(query(employeeCollection, orderBy("createdAt", "desc")));
    
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date(),
    }));
  } catch (error) {
    console.warn("Direct employee access failed:", error);
    throw error;
  }
}

export async function getDepartmentsDirectly() {
  if (!db) return [];
  
  try {
    const departmentCollection = collection(db, "departments");
    const snapshot = await getDocs(query(departmentCollection, orderBy("name", "asc")));
    
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date(),
    }));
  } catch (error) {
    console.warn("Direct department access failed:", error);
    throw error;
  }
}
