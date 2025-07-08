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

  const checkConnection = async () => {
    try {
      if (!isFirebaseReady()) {
        setError(getFirebaseError());
        setIsConnected(false);
        return;
      }

      const connected = await testFirebaseConnection();
      setIsConnected(connected);

      if (!connected) {
        setError("Unable to connect to Firebase services");
      } else {
        setError(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown Firebase error");
      setIsConnected(false);
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
    const interval = setInterval(checkConnection, 30000); // Check every 30 seconds

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
    retryConnection,
  };

  return (
    <FirebaseContext.Provider value={value}>
      {children}
    </FirebaseContext.Provider>
  );
};
