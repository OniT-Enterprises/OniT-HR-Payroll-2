import React from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useFirebase } from "@/contexts/FirebaseContext";
import { AlertTriangle, Wifi, WifiOff, RefreshCw } from "lucide-react";

export default function OfflineStatusBanner() {
  const { isOnline, isConnected, error, retryConnection } = useFirebase();
  const [isRetrying, setIsRetrying] = React.useState(false);

  const handleRetry = async () => {
    setIsRetrying(true);
    try {
      await retryConnection();
    } finally {
      setIsRetrying(false);
    }
  };

  // Don't show banner if everything is working
  if (isOnline && isConnected && !error) {
    return null;
  }

  return (
    <Alert className="border-orange-200 bg-orange-50 mb-4">
      <AlertTriangle className="h-4 w-4 text-orange-600" />
      <AlertDescription className="flex items-center justify-between w-full">
        <div className="flex items-center gap-2">
          {!isOnline ? (
            <WifiOff className="h-4 w-4 text-red-500" />
          ) : (
            <Wifi className="h-4 w-4 text-orange-500" />
          )}
          <span className="text-orange-800">
            {!isOnline
              ? "You're offline. Some features may not work."
              : !isConnected
                ? "Connection to database lost. Using cached data when available."
                : error
                  ? `Database connection issue: ${error}`
                  : "Connectivity issues detected."}
          </span>
        </div>

        {isOnline && !isConnected && (
          <Button
            size="sm"
            variant="outline"
            onClick={handleRetry}
            disabled={isRetrying}
            className="ml-4 h-8 px-3 border-orange-300 text-orange-700 hover:bg-orange-100"
          >
            {isRetrying ? (
              <RefreshCw className="h-3 w-3 animate-spin" />
            ) : (
              "Retry"
            )}
          </Button>
        )}
      </AlertDescription>
    </Alert>
  );
}
