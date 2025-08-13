// Aggressive Firebase operation blocker
let firebaseBlocked = false;
let blockReason = "";

// Monitor for Firebase operations and block them if needed
export const initializeFirebaseBlocker = () => {
  if (typeof window === "undefined") return;

  // Check initial network state
  if (!navigator.onLine) {
    blockFirebase("Browser offline");
  }

  // Monitor network changes
  window.addEventListener("offline", () => {
    blockFirebase("Network went offline");
  });

  window.addEventListener("online", () => {
    console.log(
      "🌐 Network back online, but keeping Firebase blocked for safety",
    );
    // Don't automatically unblock - let services handle recovery
  });

  // Override Firebase-related objects if they exist
  setTimeout(() => {
    try {
      // If Firebase is loaded, add additional protection
      if (typeof window.firebase !== "undefined") {
        console.log("🔥 Firebase detected, adding additional protection");
        wrapFirebaseOperations();
      }
    } catch (error) {
      console.warn("Could not add Firebase protection:", error);
    }
  }, 1000);
};

export const blockFirebase = (reason: string) => {
  firebaseBlocked = true;
  blockReason = reason;
  console.warn(`🚫 Firebase blocked: ${reason}`);

  // Dispatch event so other parts of app can react
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("firebaseBlocked", {
        detail: { reason },
      }),
    );
  }
};

export const unblockFirebase = () => {
  firebaseBlocked = false;
  blockReason = "";
  console.log("✅ Firebase unblocked");
};

export const isFirebaseBlockedByMonitor = () => firebaseBlocked;
export const getBlockReason = () => blockReason;

// Wrap Firebase operations to prevent them when blocked
const wrapFirebaseOperations = () => {
  try {
    // This is a more aggressive approach - wrap common Firebase methods
    const blockOperation = (operationName: string) => {
      if (firebaseBlocked) {
        console.warn(
          `🚫 Firebase operation "${operationName}" blocked: ${blockReason}`,
        );
        throw new Error(`Firebase operation blocked: ${blockReason}`);
      }
    };

    // If firebase object exists, wrap its methods
    if (typeof window.firebase !== "undefined") {
      const firebase = window.firebase;

      // Wrap firestore operations
      if (firebase.firestore) {
        const originalFirestore = firebase.firestore;
        firebase.firestore = function (...args: any[]) {
          blockOperation("firestore()");
          return originalFirestore.apply(this, args);
        };
      }

      // Wrap auth operations
      if (firebase.auth) {
        const originalAuth = firebase.auth;
        firebase.auth = function (...args: any[]) {
          blockOperation("auth()");
          return originalAuth.apply(this, args);
        };
      }
    }
  } catch (error) {
    console.warn("Could not wrap Firebase operations:", error);
  }
};

// Initialize error monitoring
export const monitorForErrors = () => {
  if (typeof window === "undefined") return;

  // Count consecutive errors
  let errorCount = 0;
  let lastErrorTime = 0;

  const handleError = (error: any, source: string) => {
    const now = Date.now();

    // Reset count if enough time has passed
    if (now - lastErrorTime > 30000) {
      // 30 seconds
      errorCount = 0;
    }

    // Only consider it a relevant network error if it's Firebase-related
    const isFirebaseNetworkError =
      (error instanceof TypeError ||
        (error &&
          error.message &&
          (error.message.includes("Failed to fetch") ||
            error.message.includes("network") ||
            error.message.includes("fetch")))) &&
      (error.stack?.includes("firebase") ||
        error.stack?.includes("firestore") ||
        error.message?.includes("firebase") ||
        error.message?.includes("firestore") ||
        error.message?.includes("googleapis.com"));

    if (isFirebaseNetworkError) {
      errorCount++;
      lastErrorTime = now;

      console.warn(`🌐 Firebase network error #${errorCount} from ${source}:`, error);

      // Block Firebase after first Firebase-related network error
      if (!firebaseBlocked) {
        blockFirebase(`Firebase network error detected (${source})`);
      }
    }
  };

  // Monitor unhandled rejections
  window.addEventListener("unhandledrejection", (event) => {
    handleError(event.reason, "unhandledrejection");
    event.preventDefault(); // Always prevent crashes
  });

  // Monitor errors
  window.addEventListener("error", (event) => {
    handleError(event.error, "error");
    event.preventDefault(); // Always prevent crashes
  });
};

// Initialize everything
initializeFirebaseBlocker();
monitorForErrors();
