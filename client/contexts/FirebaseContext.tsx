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
  testFirebaseConnection,
} from "@/lib/firebase";

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

      // Wrap Firebase connection test with additional error handling
      let connected = false;
      try {
        connected = await Promise.race([
          testFirebaseConnection(),
          new Promise<boolean>((_, reject) =>
            setTimeout(() => reject(new Error("Connection timeout")), 5000),
          ),
        ]);
      } catch (connectionError) {
        console.warn("🔥 Firebase connection test failed:", connectionError);

        // Check for specific TypeError cases
        if (
          connectionError instanceof TypeError ||
          connectionError.message?.includes("Failed to fetch") ||
          connectionError.message?.includes("fetch")
        ) {
          console.warn("🌐 Network fetch error detected, using offline mode");
          connected = false;
        } else {
          console.warn("🚫 Other connection error:", connectionError);
          connected = false;
        }
      }

      setIsConnected(connected);
      setIsUsingMockData(!connected);

      if (!connected) {
        setError("Using demo data - Firebase connection unavailable");
      } else {
        setError(null);
        console.log("✅ Firebase connection established");
      }
    } catch (err) {
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
    // Check initial connection
    checkConnection();

    // Listen for online/offline events
    const handleOnline = () => {
      setIsOnline(true);
      checkConnection();
    };

    const handleOffline = () => {
      setIsOnline(false);
      setIsConnected(false);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Periodic connection check
    const interval = setInterval(checkConnection, 120000); // Check every 2 minutes (reduced to prevent assertion errors)

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      clearInterval(interval);
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
