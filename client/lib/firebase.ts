// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

// Global Firebase status
let firebaseInitialized = false;
let firebaseError: string | null = null;

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDVdpT-32mvHyfJi03eHVN4IkZtnFVh3xs",
  authDomain: "onit-payroll.firebaseapp.com",
  projectId: "onit-payroll",
  storageBucket: "onit-payroll.firebasestorage.app",
  messagingSenderId: "797230079174",
  appId: "1:797230079174:web:c95536b46c82eea6300bc7",
  measurementId: "G-G2SP080W34",
};

// Initialize Firebase with error handling
let app: any = null;
let db: any = null;
let auth: any = null;
let storage: any = null;
let analytics: any = null;

try {
  app = initializeApp(firebaseConfig);

  // Initialize Firebase services with error handling
  try {
    db = getFirestore(app);
    firebaseInitialized = true;
    console.log("✅ Firebase Firestore initialized successfully");
  } catch (error) {
    console.error("❌ Failed to initialize Firestore:", error);
    firebaseError = "Failed to initialize Firestore";
  }

  try {
    auth = getAuth(app);
  } catch (error) {
    console.error("❌ Failed to initialize Auth:", error);
  }

  try {
    storage = getStorage(app);
  } catch (error) {
    console.error("❌ Failed to initialize Storage:", error);
  }

  try {
    analytics = typeof window !== "undefined" ? getAnalytics(app) : null;
  } catch (error) {
    console.warn("⚠️ Analytics not available:", error);
  }
} catch (error) {
  console.error("❌ Failed to initialize Firebase:", error);
  firebaseError = `Firebase initialization failed: ${error}`;
}

// Export Firebase status checking functions
export const isFirebaseReady = () => firebaseInitialized;
export const getFirebaseError = () => firebaseError;

// Test Firebase connectivity
export const testFirebaseConnection = async (): Promise<boolean> => {
  if (!db) return false;

  try {
    // Simple connectivity test
    await db._delegate._databaseId;
    return true;
  } catch (error) {
    console.error("Firebase connectivity test failed:", error);
    return false;
  }
};

// Export services (will be null if initialization failed)
export { db, auth, storage, analytics };
export default app;
