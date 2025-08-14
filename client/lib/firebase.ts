// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import {
  getFirestore,
  connectFirestoreEmulator,
  enableNetwork,
  disableNetwork,
} from "firebase/firestore";
import { getAuth, signInAnonymously } from "firebase/auth";
import { getStorage } from "firebase/storage";

// Import Firebase blocker for aggressive error prevention
import "./firebaseBlocker";

// Global Firebase status
let firebaseInitialized = false;
let firebaseError: string | null = null;
let networkEnabled = false;
let connectivityCheckInProgress = false;
let firebaseBlocked = false; // Flag to completely block Firebase operations

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

// Check network before even attempting Firebase initialization
const shouldInitializeFirebase = () => {
  // Don't initialize if offline
  if (!navigator.onLine) {
    console.warn("🌐 Browser offline, skipping Firebase initialization");
    firebaseError = "Offline - Firebase disabled";
    return false;
  }

  // Quick network test before Firebase initialization
  try {
    // Simple navigator.onLine check instead of fetch to avoid complications
    if (!navigator.onLine) {
      throw new Error("Browser reports offline");
    }
    // Don't do fetch test here to avoid potential circular issues
  } catch (error) {
    console.warn("🚫 Network test failed, skipping Firebase initialization");
    firebaseError = "Network issues - Firebase disabled";
    firebaseBlocked = true;
    return false;
  }

  return true;
};

try {
  if (!shouldInitializeFirebase()) {
    throw new Error("Firebase initialization skipped due to network issues");
  }

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
  firebaseBlocked = true;
}

// Aggressive fetch override to prevent Firebase operations when blocked
if (typeof window !== "undefined") {
  const originalFetch = window.fetch;

  window.fetch = function (
    input: RequestInfo | URL,
    init?: RequestInit,
  ): Promise<Response> {
    // Check if this looks like a Firebase request
    const url =
      typeof input === "string"
        ? input
        : input instanceof URL
          ? input.toString()
          : input.url;

    // Always allow data URLs and blob URLs - they're safe and local
    if (url && (url.startsWith("data:") || url.startsWith("blob:"))) {
      return originalFetch.apply(this, arguments);
    }

    const isFirebaseRequest =
      url &&
      (url.includes("firestore.googleapis.com") ||
        url.includes("firebase.googleapis.com") ||
        url.includes("firebaseapp.com") ||
        url.includes("google-analytics.com"));

    // If Firebase is blocked and this is a Firebase request, reject immediately
    if (firebaseBlocked && isFirebaseRequest) {
      console.warn("🚫 Firebase request blocked:", url);
      return Promise.reject(
        new Error("Firebase operations blocked due to network issues"),
      );
    }

    // If not online and this is any external request, be more careful
    if (
      !navigator.onLine &&
      url &&
      (url.startsWith("http://") || url.startsWith("https://"))
    ) {
      console.warn("🌐 External request blocked due to offline status:", url);
      return Promise.reject(new Error("Offline - external requests blocked"));
    }

    // Proceed with original fetch but add timeout for external requests
    if (url && (url.startsWith("http://") || url.startsWith("https://"))) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // Increased timeout

      const modifiedInit = {
        ...init,
        signal: init?.signal || controller.signal, // Respect existing signal
      };

      return originalFetch
        .call(this, input, modifiedInit)
        .finally(() => clearTimeout(timeoutId))
        .catch((error) => {
          if (error.name === "AbortError") {
            console.warn("🚫 Request timeout:", url);
            // Only block Firebase if this was a Firebase request that timed out
            if (isFirebaseRequest) {
              firebaseBlocked = true;
              console.warn("🚫 Firebase blocked due to timeout");
            }
            throw new Error("Request timeout");
          }
          // For non-Firebase requests, don't modify the error
          if (!isFirebaseRequest) {
            throw error;
          }
          // For Firebase requests, check if we should block
          if (error instanceof TypeError || error.message?.includes("Failed to fetch")) {
            firebaseBlocked = true;
            console.warn("🚫 Firebase blocked due to network error");
          }
          throw error;
        });
    }

    // For local/data URLs and relative URLs, proceed normally
    return originalFetch.apply(this, arguments);
  };
}

// Anonymous authentication for development
export const ensureAuthenticated = async (): Promise<boolean> => {
  if (!auth) {
    console.warn("Auth not initialized");
    return false;
  }

  try {
    // If user is already signed in, return true
    if (auth.currentUser) {
      return true;
    }

    // Sign in anonymously for development
    console.log("🔐 Signing in anonymously for development...");
    await signInAnonymously(auth);
    console.log("✅ Anonymous authentication successful");
    return true;
  } catch (error) {
    console.error("❌ Anonymous authentication failed:", error);
    return false;
  }
};

// Export Firebase status checking functions
export const isFirebaseReady = () => firebaseInitialized && !firebaseBlocked;
export const getFirebaseError = () => firebaseError;
export const isNetworkEnabled = () => networkEnabled && !firebaseBlocked;
export const isFirebaseBlocked = () => firebaseBlocked;
export const blockFirebase = () => {
  firebaseBlocked = true;
  networkEnabled = false;
  console.warn("🚫 Firebase operations blocked due to network issues");
};
export const unblockFirebase = () => {
  firebaseBlocked = false;
  console.log("✅ Firebase operations unblocked");
};

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

// Test Firebase connectivity with enhanced error handling
export const testFirebaseConnection = async (): Promise<boolean> => {
  if (!db) {
    console.warn("Firestore DB instance not available");
    return false;
  }

  // Prevent concurrent connectivity checks
  if (connectivityCheckInProgress) {
    console.log(
      "🔄 Connection test already in progress, returning current state",
    );
    return networkEnabled;
  }

  connectivityCheckInProgress = true;

  try {
    // Quick network check first
    if (!navigator.onLine) {
      console.warn("🌐 Browser reports offline, skipping Firebase test");
      networkEnabled = false;
      return false;
    }

    // Only enable network if not already enabled
    if (!networkEnabled) {
      // Wrap enableNetwork with timeout and error handling
      await Promise.race([
        enableNetwork(db).catch((error) => {
          if (
            error instanceof TypeError ||
            error.message?.includes("Failed to fetch")
          ) {
            throw new Error("Network error during Firebase enable");
          }
          throw error;
        }),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Firebase enable timeout")), 3000),
        ),
      ]);

      networkEnabled = true;
      console.log("✅ Firebase network enabled successfully");
    }
    return true;
  } catch (error) {
    console.warn("🚫 Firebase connectivity test failed:", error);

    // Handle specific error types
    if (
      error instanceof TypeError ||
      error.message?.includes("Failed to fetch")
    ) {
      console.warn("🌐 Network error detected in Firebase test");
    } else if (error.message?.includes("timeout")) {
      console.warn("⏱️ Firebase connection timeout");
    } else {
      console.warn("❓ Unknown Firebase error:", error);
    }

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

    // Check for various network-related errors, but be more specific
    const isFirebaseNetworkError =
      error &&
      error.message &&
      (error.message.includes("firestore") ||
        error.message.includes("firebase") ||
        error.message.includes("googleapis.com")) &&
      (error instanceof TypeError ||
        error.message.includes("Failed to fetch") ||
        error.message.includes("NetworkError") ||
        error.message.includes("Connection failed"));

    const isFirebaseCodeError =
      error &&
      error.code &&
      (error.code.includes("unavailable") ||
        error.code.includes("deadline-exceeded") ||
        error.code.includes("internal"));

    if (isFirebaseNetworkError || isFirebaseCodeError) {
      console.warn("🌐 Caught unhandled Firebase network error:", error);

      // Block Firebase operations to prevent further errors
      firebaseBlocked = true;
      networkEnabled = false;
      console.warn("🚫 Firebase operations blocked due to network issues");

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

    // Only block Firebase for Firebase-related fetch errors
    if (
      error instanceof TypeError &&
      error.message?.includes("Failed to fetch") &&
      (error.stack?.includes("firebase") ||
        error.stack?.includes("firestore") ||
        error.stack?.includes("googleapis.com"))
    ) {
      console.warn("🌐 Caught uncaught Firebase TypeError fetch error:", error);

      // Block Firebase operations
      firebaseBlocked = true;
      networkEnabled = false;
      console.warn("🚫 Firebase blocked due to TypeError");

      event.preventDefault();
    }
  });
}

// Export services (will be null if initialization failed)
export { db, auth, storage, analytics };
export default app;
