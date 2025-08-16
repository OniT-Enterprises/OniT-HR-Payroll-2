import { db, auth, tryAuthentication } from "./firebase";
import { collection, getDocs, query, limit } from "firebase/firestore";

export async function simpleFirebaseTest() {
  console.log("🔥 Running simple Firebase connectivity test...");

  const results = {
    initialized: !!db,
    authAvailable: !!auth,
    authenticated: false,
    authMethod: null as string | null,
    employeeCount: 0,
    departmentCount: 0,
    errors: [] as string[],
    success: false,
  };

  // Check basic initialization
  if (!results.initialized) {
    results.errors.push("Firebase not initialized");
    return results;
  }

  if (!results.authAvailable) {
    results.errors.push("Firebase Auth not available");
    return results;
  }

  // Try authentication
  try {
    const authResult = await tryAuthentication();
    results.authenticated = authResult;

    if (auth.currentUser) {
      results.authMethod = auth.currentUser.isAnonymous
        ? "anonymous"
        : "authenticated";
    }
  } catch (authError) {
    results.errors.push(`Auth error: ${authError.message}`);
  }

  // Test Firestore access
  try {
    // Test employees collection
    const employeeCollection = collection(db, "employees");
    const employeeSnapshot = await getDocs(query(employeeCollection, limit(5)));
    results.employeeCount = employeeSnapshot.size;

    console.log(
      `✅ Employee collection accessible: ${results.employeeCount} docs (sample)`,
    );
  } catch (error) {
    results.errors.push(`Employee collection: ${error.code || error.message}`);
  }

  try {
    // Test departments collection
    const departmentCollection = collection(db, "departments");
    const departmentSnapshot = await getDocs(
      query(departmentCollection, limit(5)),
    );
    results.departmentCount = departmentSnapshot.size;

    console.log(
      `✅ Department collection accessible: ${results.departmentCount} docs (sample)`,
    );
  } catch (error) {
    results.errors.push(
      `Department collection: ${error.code || error.message}`,
    );
  }

  // Determine overall success
  results.success =
    results.errors.length === 0 &&
    (results.employeeCount > 0 || results.departmentCount > 0);

  return results;
}
