import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import {
  isFirebaseReady,
  getFirebaseError,
} from "@/lib/firebase";
import { testFirebaseConnection, getFirebaseStatus } from "@/lib/firebaseManager";

interface FirebaseContextType {
  isOnline: boolean;
  isConnected: boolean;
  error: string | null;
  isUsingMockData: boolean;
  retryConnection: () => Promise<void>;
}

const FirebaseContext = createContext<FirebaseContextType | undefined>(
  undefined,
);

export const useFirebase = () => {
  const context = useContext(FirebaseContext);
  if (context === undefined) {
    throw new Error("useFirebase must be used within a FirebaseProvider");
  }
  return context;
};

interface FirebaseProviderProps {
  children: ReactNode;
}

export const FirebaseProvider: React.FC<FirebaseProviderProps> = ({
  children,
}) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isUsingMockData, setIsUsingMockData] = useState(false);

  const checkConnection = async () => {
    try {
      // Check network first
      if (!navigator.onLine) {
        console.warn("🌐 No network connection detected");
        setError("No internet connection");
        setIsConnected(false);
        setIsUsingMockData(true);
        return;
      }

      if (!isFirebaseReady()) {
        console.warn("⚠️ Firebase not ready");
        setError(getFirebaseError() || "Firebase not initialized");
        setIsConnected(false);
        setIsUsingMockData(true);
        return;
      }

      // Use the safe connection manager
      let connected = false;
      try {
        connected = await testFirebaseConnection();
      } catch (connectionError: any) {
        console.warn("🔥 Firebase connection test failed:", connectionError);

        // Handle specific Firebase internal errors gracefully
        if (connectionError.message?.includes('INTERNAL ASSERTION FAILED')) {
          console.warn("🚨 Firebase internal error detected - using fallback mode");
          setError("Firebase experiencing internal issues - using demo data");
        } else if (
          connectionError instanceof TypeError ||
          connectionError.message?.includes("Failed to fetch") ||
          connectionError.message?.includes("fetch")
        ) {
          console.warn("🌐 Network fetch error detected, using offline mode");
          setError("Network error - using demo data");
        } else {
          console.warn("🚫 Other connection error:", connectionError);
          setError("Connection failed - using demo data");
        }
        connected = false;
      }

      setIsConnected(connected);
      setIsUsingMockData(!connected);

      if (!connected) {
        // Error message is already set above based on the specific error type
      } else {
        setError(null);
        console.log("✅ Firebase connection established");
      }
    } catch (err: any) {
      console.error("❌ Critical error in checkConnection:", err);

      // Ensure we always set safe fallback state
      setError("Connection check failed - using demo data");
      setIsConnected(false);
      setIsUsingMockData(true);
    }
  };

  const retryConnection = async () => {
    setError(null);
    await checkConnection();
  };

  useEffect(() => {
    let debounceTimer: NodeJS.Timeout | null = null;

    // Debounced connection check to prevent rapid successive calls
    const debouncedCheckConnection = () => {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
      debounceTimer = setTimeout(checkConnection, 1000); // 1 second debounce
    };

    // Check initial connection
    checkConnection();

    // Listen for online/offline events
    const handleOnline = () => {
      setIsOnline(true);
      debouncedCheckConnection(); // Use debounced version
    };

    const handleOffline = () => {
      setIsOnline(false);
      setIsConnected(false);
      setIsUsingMockData(true);
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Periodic connection check - increased interval to reduce load
    const interval = setInterval(debouncedCheckConnection, 300000); // Check every 5 minutes

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      clearInterval(interval);
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
    };
  }, []);

  const value: FirebaseContextType = {
    isOnline,
    isConnected,
    error,
    isUsingMockData,
    retryConnection,
  };

  return (
    <FirebaseContext.Provider value={value}>
      {children}
    </FirebaseContext.Provider>
  );
};
