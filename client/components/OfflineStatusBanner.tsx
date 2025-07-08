import React from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useFirebase } from "@/contexts/FirebaseContext";
import { AlertTriangle, Wifi, WifiOff, RefreshCw } from "lucide-react";

export default function OfflineStatusBanner() {
  const { isOnline, isConnected, error, isUsingMockData, retryConnection } =
    useFirebase();
  const [isRetrying, setIsRetrying] = React.useState(false);

  const handleRetry = async () => {
    setIsRetrying(true);
    try {
      await retryConnection();
    } finally {
      setIsRetrying(false);
    }
  };

  // Don't show banner if everything is working normally
  if (isOnline && isConnected && !error && !isUsingMockData) {
    return null;
  }

  return (
    <Alert
      className={`mb-4 ${isUsingMockData ? "border-blue-200 bg-blue-50" : "border-orange-200 bg-orange-50"}`}
    >
      <AlertTriangle
        className={`h-4 w-4 ${isUsingMockData ? "text-blue-600" : "text-orange-600"}`}
      />
      <AlertDescription className="flex items-center justify-between w-full">
        <div className="flex items-center gap-2">
          {!isOnline ? (
            <WifiOff className="h-4 w-4 text-red-500" />
          ) : (
            <Wifi
              className={`h-4 w-4 ${isUsingMockData ? "text-blue-500" : "text-orange-500"}`}
            />
          )}
          <span
            className={isUsingMockData ? "text-blue-800" : "text-orange-800"}
          >
            {!isOnline
              ? "You're offline. Using demo data for testing."
              : isUsingMockData
                ? "🚀 Demo Mode: Using sample data. Your changes will be saved locally."
                : !isConnected
                  ? "Connection to database lost. Using cached data when available."
                  : error
                    ? `Database connection issue: ${error}`
                    : "Connectivity issues detected."}
          </span>
        </div>

        {isOnline && (!isConnected || isUsingMockData) && (
          <Button
            size="sm"
            variant="outline"
            onClick={handleRetry}
            disabled={isRetrying}
            className={`ml-4 h-8 px-3 ${
              isUsingMockData
                ? "border-blue-300 text-blue-700 hover:bg-blue-100"
                : "border-orange-300 text-orange-700 hover:bg-orange-100"
            }`}
          >
            {isRetrying ? (
              <RefreshCw className="h-3 w-3 animate-spin" />
            ) : isUsingMockData ? (
              "Connect to Database"
            ) : (
              "Retry"
            )}
          </Button>
        )}
      </AlertDescription>
    </Alert>
  );
}
