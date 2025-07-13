// Firebase operation proxy that completely blocks operations when network issues are detected
import {
  db,
  isFirebaseReady,
  isFirebaseBlocked,
  blockFirebase,
} from "./firebase";

// Create a proxy for Firebase operations that blocks them when needed
export const safeFirebaseOperation = async <T>(
  operation: () => Promise<T>,
  fallback: () => T | Promise<T>,
  operationName: string = "Firebase operation",
): Promise<T> => {
  try {
    // Check if Firebase is blocked
    if (isFirebaseBlocked()) {
      console.warn(`🚫 ${operationName} blocked, using fallback`);
      return await fallback();
    }

    // Check if Firebase is ready
    if (!isFirebaseReady() || !db) {
      console.warn(
        `⚠️ Firebase not ready for ${operationName}, using fallback`,
      );
      return await fallback();
    }

    // Check network connectivity
    if (!navigator.onLine) {
      console.warn(`🌐 No network for ${operationName}, using fallback`);
      return await fallback();
    }

    // Wrap the operation with timeout and error handling
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error(`${operationName} timeout`)), 5000),
    );

    const result = await Promise.race([operation(), timeoutPromise]);

    console.log(`✅ ${operationName} completed successfully`);
    return result;
  } catch (error) {
    console.error(`❌ ${operationName} failed:`, error);

    // Check for network-related errors and block Firebase
    if (
      error instanceof TypeError ||
      error.message?.includes("Failed to fetch") ||
      error.message?.includes("network") ||
      error.message?.includes("timeout")
    ) {
      console.warn(`🚫 Network error detected, blocking Firebase operations`);
      blockFirebase();
    }

    // Always use fallback on error
    console.warn(`⚠️ Using fallback for ${operationName}`);
    return await fallback();
  }
};

// Specific wrapper for Firestore queries
export const safeFirestoreQuery = async <T>(
  queryOperation: () => Promise<T>,
  fallbackData: T,
  queryName: string = "Firestore query",
): Promise<T> => {
  return safeFirebaseOperation(queryOperation, () => fallbackData, queryName);
};

// Network status monitor that can unblock Firebase when network recovers
let networkRecoveryTimer: NodeJS.Timeout | null = null;

export const monitorNetworkRecovery = () => {
  if (typeof window !== "undefined") {
    window.addEventListener("online", () => {
      console.log(
        "🌐 Network recovered, Firebase may be unblocked after verification",
      );

      // Clear any existing timer
      if (networkRecoveryTimer) {
        clearTimeout(networkRecoveryTimer);
      }

      // Wait a bit and then test if Firebase is working
      networkRecoveryTimer = setTimeout(async () => {
        try {
          // Simple test to see if network is actually working
          await fetch("https://www.google.com/favicon.ico", {
            method: "HEAD",
            mode: "no-cors",
            cache: "no-cache",
          });

          // Network seems ok, could potentially unblock Firebase here
          // But we'll leave it blocked for safety and let it recover naturally
          console.log("✅ Network connectivity verified");
        } catch (error) {
          console.warn("🚫 Network test failed, keeping Firebase blocked");
        }
      }, 3000);
    });
  }
};

// Initialize network monitoring
monitorNetworkRecovery();
