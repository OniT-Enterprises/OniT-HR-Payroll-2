import { db, auth, isFirebaseReady, isFirebaseBlocked, getFirebaseError, tryAuthentication } from "./firebase";
import { collection, getDocs, query, limit } from "firebase/firestore";

export interface FirebaseDiagnostics {
  firebaseInitialized: boolean;
  databaseAvailable: boolean;
  authAvailable: boolean;
  isAuthenticated: boolean;
  authMethod: string | null;
  isBlocked: boolean;
  error: string | null;
  connectionTest: boolean;
  employeeCollectionExists: boolean;
  departmentCollectionExists: boolean;
  employeeCount: number;
  departmentCount: number;
  recommendations: string[];
}

export async function runFirebaseDiagnostics(): Promise<FirebaseDiagnostics> {
  const diagnostics: FirebaseDiagnostics = {
    firebaseInitialized: false,
    databaseAvailable: false,
    authAvailable: false,
    isAuthenticated: false,
    authMethod: null,
    isBlocked: false,
    error: null,
    connectionTest: false,
    employeeCollectionExists: false,
    departmentCollectionExists: false,
    employeeCount: 0,
    departmentCount: 0,
    recommendations: [],
  };

  // Check Firebase initialization
  diagnostics.firebaseInitialized = isFirebaseReady();
  diagnostics.isBlocked = isFirebaseBlocked();
  diagnostics.error = getFirebaseError();
  diagnostics.databaseAvailable = !!db;

  if (!diagnostics.firebaseInitialized) {
    diagnostics.recommendations.push("Firebase is not properly initialized");
    return diagnostics;
  }

  if (diagnostics.isBlocked) {
    diagnostics.recommendations.push("Firebase is blocked - click 'Test Firebase' to unblock");
    return diagnostics;
  }

  if (!diagnostics.databaseAvailable) {
    diagnostics.recommendations.push("Firestore database is not available");
    return diagnostics;
  }

  // Test connection and collections
  try {
    // Test employee collection
    const employeeCollection = collection(db, "employees");
    const employeeSnapshot = await getDocs(query(employeeCollection, limit(1)));
    diagnostics.employeeCollectionExists = true;
    
    // Get full count
    const allEmployees = await getDocs(employeeCollection);
    diagnostics.employeeCount = allEmployees.docs.length;

    console.log(`✅ Employee collection: ${diagnostics.employeeCount} documents`);
  } catch (error) {
    console.warn("❌ Employee collection error:", error);
    diagnostics.recommendations.push(`Employee collection error: ${error.message}`);
  }

  try {
    // Test department collection
    const departmentCollection = collection(db, "departments");
    const departmentSnapshot = await getDocs(query(departmentCollection, limit(1)));
    diagnostics.departmentCollectionExists = true;
    
    // Get full count
    const allDepartments = await getDocs(departmentCollection);
    diagnostics.departmentCount = allDepartments.docs.length;

    console.log(`✅ Department collection: ${diagnostics.departmentCount} documents`);
  } catch (error) {
    console.warn("❌ Department collection error:", error);
    diagnostics.recommendations.push(`Department collection error: ${error.message}`);
  }

  // Overall connection test
  diagnostics.connectionTest = diagnostics.employeeCollectionExists || diagnostics.departmentCollectionExists;

  // Generate recommendations
  if (diagnostics.connectionTest) {
    diagnostics.recommendations.push("✅ Firebase is connected and working");
    
    if (diagnostics.employeeCount === 0) {
      diagnostics.recommendations.push("⚠️ No employees found in Firebase - add some employees or check your data");
    }
    
    if (diagnostics.departmentCount === 0) {
      diagnostics.recommendations.push("⚠️ No departments found in Firebase - they will be auto-created from employee data");
    }
  } else {
    diagnostics.recommendations.push("❌ Cannot connect to Firebase collections");
  }

  return diagnostics;
}

export function logFirebaseDiagnostics(diagnostics: FirebaseDiagnostics): void {
  console.log("🔥 Firebase Diagnostics Report:");
  console.log("================================");
  console.log(`Firebase Initialized: ${diagnostics.firebaseInitialized}`);
  console.log(`Database Available: ${diagnostics.databaseAvailable}`);
  console.log(`Is Blocked: ${diagnostics.isBlocked}`);
  console.log(`Connection Test: ${diagnostics.connectionTest}`);
  console.log(`Employee Collection: ${diagnostics.employeeCollectionExists} (${diagnostics.employeeCount} docs)`);
  console.log(`Department Collection: ${diagnostics.departmentCollectionExists} (${diagnostics.departmentCount} docs)`);
  console.log(`Error: ${diagnostics.error || 'None'}`);
  console.log("Recommendations:");
  diagnostics.recommendations.forEach((rec, index) => {
    console.log(`  ${index + 1}. ${rec}`);
  });
  console.log("================================");
}
