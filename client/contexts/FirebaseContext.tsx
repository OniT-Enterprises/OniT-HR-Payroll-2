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
      if (!isFirebaseReady()) {
        setError(getFirebaseError());
        setIsConnected(false);
        setIsUsingMockData(true);
        return;
      }

      const connected = await testFirebaseConnection();
      setIsConnected(connected);
      setIsUsingMockData(!connected);

      if (!connected) {
        setError("Unable to connect to Firebase services - using demo data");
      } else {
        setError(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown Firebase error");
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
