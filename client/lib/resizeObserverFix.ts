// ResizeObserver error suppression and loop prevention
// This fixes the "ResizeObserver loop completed with undelivered notifications" warning

// Global error handler for ResizeObserver warnings
if (typeof window !== 'undefined') {
  // Store original ResizeObserver
  const OriginalResizeObserver = window.ResizeObserver;

  // Create a wrapper that handles loops gracefully
  const ResizeObserverWithLoopProtection = class extends OriginalResizeObserver {
    private static readonly MAX_CONSECUTIVE_CALLS = 50;
    private consecutiveCalls = 0;
    private lastCallTime = 0;
    private timeoutId: NodeJS.Timeout | null = null;

    constructor(callback: ResizeObserverCallback) {
      // Wrap the callback with loop protection
      const wrappedCallback: ResizeObserverCallback = (entries, observer) => {
        const now = Date.now();
        
        // Reset counter if enough time has passed
        if (now - this.lastCallTime > 100) {
          this.consecutiveCalls = 0;
        }
        
        this.consecutiveCalls++;
        this.lastCallTime = now;

        // If we're getting too many consecutive calls, debounce them
        if (this.consecutiveCalls > ResizeObserverWithLoopProtection.MAX_CONSECUTIVE_CALLS) {
          if (this.timeoutId) {
            clearTimeout(this.timeoutId);
          }
          
          this.timeoutId = setTimeout(() => {
            try {
              callback(entries, observer);
            } catch (error) {
              // Silently handle ResizeObserver errors
              console.debug('ResizeObserver callback error (suppressed):', error);
            }
            this.consecutiveCalls = 0;
          }, 50);
          return;
        }

        try {
          callback(entries, observer);
        } catch (error) {
          // Silently handle ResizeObserver errors
          console.debug('ResizeObserver callback error (suppressed):', error);
        }
      };

      super(wrappedCallback);
    }
  };

  // Replace the global ResizeObserver
  window.ResizeObserver = ResizeObserverWithLoopProtection;

  // Suppress ResizeObserver errors in the error handler
  const originalErrorHandler = window.onerror;
  window.onerror = (message, source, lineno, colno, error) => {
    // Suppress ResizeObserver loop warnings
    if (
      typeof message === 'string' &&
      message.includes('ResizeObserver loop completed with undelivered notifications')
    ) {
      console.debug('ResizeObserver loop warning suppressed');
      return true; // Prevent the error from being shown
    }

    // Call original error handler for other errors
    if (originalErrorHandler) {
      return originalErrorHandler.call(window, message, source, lineno, colno, error);
    }
    
    return false;
  };

  // Also handle unhandled promise rejections related to ResizeObserver
  const originalRejectionHandler = window.onunhandledrejection;
  window.onunhandledrejection = (event) => {
    const error = event.reason;
    
    if (
      error &&
      typeof error.message === 'string' &&
      error.message.includes('ResizeObserver')
    ) {
      console.debug('ResizeObserver promise rejection suppressed:', error.message);
      event.preventDefault();
      return;
    }

    // Call original handler for other rejections
    if (originalRejectionHandler) {
      originalRejectionHandler.call(window, event);
    }
  };

  // Additional protection for console warnings
  const originalConsoleError = console.error;
  console.error = (...args) => {
    const message = args.join(' ');
    
    // Suppress ResizeObserver loop warnings in console
    if (message.includes('ResizeObserver loop completed')) {
      console.debug('ResizeObserver warning suppressed from console');
      return;
    }
    
    originalConsoleError.apply(console, args);
  };

  // Log that the fix is active
  console.debug('✅ ResizeObserver loop protection enabled');
}

// Additional utility for components that might trigger ResizeObserver loops
export const debounceResize = (callback: () => void, delay: number = 100) => {
  let timeoutId: NodeJS.Timeout;
  
  return () => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(callback, delay);
  };
};

// Hook for safe ResizeObserver usage in React components
export const useSafeResizeObserver = (
  targetRef: React.RefObject<Element>,
  callback: ResizeObserverCallback,
  options?: ResizeObserverOptions
) => {
  React.useEffect(() => {
    const element = targetRef.current;
    if (!element) return;

    // Create observer with built-in protection
    const observer = new ResizeObserver(callback);
    
    try {
      observer.observe(element, options);
    } catch (error) {
      console.debug('ResizeObserver observe error (suppressed):', error);
    }

    return () => {
      try {
        observer.disconnect();
      } catch (error) {
        console.debug('ResizeObserver disconnect error (suppressed):', error);
      }
    };
  }, [targetRef, callback, options]);
};

// React import for the hook
import React from 'react';

export default {
  debounceResize,
  useSafeResizeObserver,
};
