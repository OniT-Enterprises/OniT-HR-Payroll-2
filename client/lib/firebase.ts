// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import {
  getFirestore,
  connectFirestoreEmulator,
  enableNetwork,
  disableNetwork,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

// Global Firebase status
let firebaseInitialized = false;
let firebaseError: string | null = null;
let networkEnabled = false;
let connectivityCheckInProgress = false;

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
export const isNetworkEnabled = () => networkEnabled;

// Network management functions
export const enableFirebaseNetwork = async (): Promise<boolean> => {
  if (!db || networkEnabled || connectivityCheckInProgress) {
    return networkEnabled;
  }

  connectivityCheckInProgress = true;
  try {
    await enableNetwork(db);
    networkEnabled = true;
    return true;
  } catch (error) {
    console.error("Failed to enable Firebase network:", error);
    return false;
  } finally {
    connectivityCheckInProgress = false;
  }
};

export const disableFirebaseNetwork = async (): Promise<boolean> => {
  if (!db || !networkEnabled) {
    return true;
  }

  try {
    await disableNetwork(db);
    networkEnabled = false;
    return true;
  } catch (error) {
    console.error("Failed to disable Firebase network:", error);
    return false;
  }
};

// Test Firebase connectivity
export const testFirebaseConnection = async (): Promise<boolean> => {
  if (!db) {
    console.warn("Firestore DB instance not available");
    return false;
  }

  // Prevent concurrent connectivity checks
  if (connectivityCheckInProgress) {
    return networkEnabled;
  }

  connectivityCheckInProgress = true;

  try {
    // Only enable network if not already enabled
    if (!networkEnabled) {
      await enableNetwork(db);
      networkEnabled = true;
    }
    return true;
  } catch (error) {
    console.error("Firebase connectivity test failed:", error);
    networkEnabled = false;
    return false;
  } finally {
    connectivityCheckInProgress = false;
  }
};

// Enhanced global error handler for Firebase network issues
if (typeof window !== "undefined") {
  // Handle unhandled promise rejections
  window.addEventListener("unhandledrejection", (event) => {
    const error = event.reason;

    // Check for various network-related errors
    const isNetworkError =
      error instanceof TypeError ||
      (error &&
        error.message &&
        (error.message.includes("Failed to fetch") ||
          error.message.includes("fetch") ||
          error.message.includes("network") ||
          error.message.includes("NetworkError") ||
          error.message.includes("Connection failed"))) ||
      (error &&
        error.code &&
        (error.code.includes("unavailable") ||
          error.code.includes("deadline-exceeded") ||
          error.code.includes("internal")));

    if (isNetworkError) {
      console.warn("🌐 Caught unhandled network/Firebase error:", error);

      // Prevent the error from propagating and crashing the app
      event.preventDefault();

      // Show user-friendly notification if possible (throttled)
      if (
        typeof window.lastToastTime === "undefined" ||
        Date.now() - window.lastToastTime > 10000
      ) {
        // Only show every 10 seconds
        window.lastToastTime = Date.now();

        if (typeof window.toast !== "undefined") {
          window.toast({
            title: "Connection Issue",
            description:
              "Network connectivity problems detected. Using offline mode.",
            variant: "destructive",
          });
        }
      }
    }
  });

  // Handle uncaught errors
  window.addEventListener("error", (event) => {
    const error = event.error;

    if (
      error instanceof TypeError &&
      error.message?.includes("Failed to fetch")
    ) {
      console.warn("🌐 Caught uncaught TypeError fetch error:", error);
      event.preventDefault();
    }
  });
}

// Export services (will be null if initialization failed)
export { db, auth, storage, analytics };
export default app;
