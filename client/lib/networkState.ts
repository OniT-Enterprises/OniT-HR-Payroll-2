// Network state utility for proactive error handling
class NetworkState {
  private isOnline = navigator.onLine;
  private listeners: ((online: boolean) => void)[] = [];
  private lastNetworkCheck = 0;
  private networkCheckInterval = 30000; // 30 seconds

  constructor() {
    // Listen for online/offline events
    window.addEventListener("online", this.handleOnline);
    window.addEventListener("offline", this.handleOffline);

    // Initial network check
    this.checkNetworkStatus();
  }

  private handleOnline = () => {
    console.log("🌐 Network connection restored");
    this.isOnline = true;
    this.notifyListeners(true);
  };

  private handleOffline = () => {
    console.log("🚫 Network connection lost");
    this.isOnline = false;
    this.notifyListeners(false);
  };

  private notifyListeners(online: boolean) {
    this.listeners.forEach((listener) => {
      try {
        listener(online);
      } catch (error) {
        console.warn("Error in network state listener:", error);
      }
    });
  }

  private async checkNetworkStatus() {
    const now = Date.now();
    if (now - this.lastNetworkCheck < this.networkCheckInterval) {
      return this.isOnline;
    }

    this.lastNetworkCheck = now;

    try {
      // Quick check to a reliable endpoint
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);

      await fetch("https://www.google.com/favicon.ico", {
        method: "HEAD",
        mode: "no-cors",
        signal: controller.signal,
        cache: "no-cache",
      });

      clearTimeout(timeoutId);

      if (!this.isOnline) {
        this.handleOnline();
      }
      return true;
    } catch (error) {
      console.warn("Network check failed:", error);
      if (this.isOnline) {
        this.handleOffline();
      }
      return false;
    }
  }

  // Public methods
  public getNetworkStatus(): boolean {
    return this.isOnline;
  }

  public async isNetworkAvailable(): Promise<boolean> {
    return await this.checkNetworkStatus();
  }

  public addListener(callback: (online: boolean) => void): () => void {
    this.listeners.push(callback);

    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(callback);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  public cleanup() {
    window.removeEventListener("online", this.handleOnline);
    window.removeEventListener("offline", this.handleOffline);
    this.listeners = [];
  }
}

// Create singleton instance
export const networkState = new NetworkState();

// Convenience exports
export const isOnline = () => networkState.getNetworkStatus();
export const checkNetwork = () => networkState.isNetworkAvailable();
export const onNetworkChange = (callback: (online: boolean) => void) =>
  networkState.addListener(callback);
