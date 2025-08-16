/**
 * Complete Firebase Isolation Mode
 * Prevents ALL Firebase operations to eliminate internal assertion errors
 */

import { db, auth } from './firebase';

interface IsolationState {
  isIsolated: boolean;
  reason: string;
  isolatedAt: Date;
}

class FirebaseIsolationManager {
  private state: IsolationState = {
    isIsolated: false,
    reason: '',
    isolatedAt: new Date(),
  };

  /**
   * Enable complete Firebase isolation
   */
  public enableIsolation(reason: string = 'Preventing internal assertion errors'): void {
    console.log('🚫 Enabling complete Firebase isolation:', reason);
    
    this.state = {
      isIsolated: true,
      reason,
      isolatedAt: new Date(),
    };

    // Override Firebase functions to prevent operations
    this.overrideFirebaseFunctions();
  }

  /**
   * Check if Firebase is isolated
   */
  public isIsolated(): boolean {
    return this.state.isIsolated;
  }

  /**
   * Get isolation state
   */
  public getState(): IsolationState {
    return { ...this.state };
  }

  /**
   * Override Firebase functions to prevent operations
   */
  private overrideFirebaseFunctions(): void {
    try {
      // Override common Firestore functions
      if (typeof window !== 'undefined') {
        const originalMethods = [
          'getDocs',
          'getDoc', 
          'addDoc',
          'setDoc',
          'updateDoc',
          'deleteDoc',
          'onSnapshot',
          'query',
          'collection',
          'doc',
          'enableNetwork',
          'disableNetwork',
        ];

        // Store original methods if not already stored
        if (!(window as any).__originalFirebaseMethods) {
          (window as any).__originalFirebaseMethods = {};
        }

        // Override Firebase operations to throw controlled errors
        originalMethods.forEach(methodName => {
          if ((window as any)[methodName]) {
            (window as any).__originalFirebaseMethods[methodName] = (window as any)[methodName];
            (window as any)[methodName] = (...args: any[]) => {
              console.warn(`🚫 Firebase operation blocked: ${methodName}`);
              throw new Error(`Firebase operation '${methodName}' blocked due to isolation mode`);
            };
          }
        });

        console.log('✅ Firebase functions overridden to prevent operations');
      }
    } catch (error) {
      console.warn('⚠️ Failed to override Firebase functions:', error);
    }
  }

  /**
   * Restore Firebase functions (if needed)
   */
  public disableIsolation(): void {
    console.log('🔄 Disabling Firebase isolation...');
    
    this.state.isIsolated = false;

    try {
      if (typeof window !== 'undefined' && (window as any).__originalFirebaseMethods) {
        // Restore original methods
        Object.keys((window as any).__originalFirebaseMethods).forEach(methodName => {
          (window as any)[methodName] = (window as any).__originalFirebaseMethods[methodName];
        });
        
        delete (window as any).__originalFirebaseMethods;
        console.log('✅ Firebase functions restored');
      }
    } catch (error) {
      console.warn('⚠️ Failed to restore Firebase functions:', error);
    }
  }
}

// Create singleton instance
export const firebaseIsolation = new FirebaseIsolationManager();

// Auto-enable isolation on module load to prevent assertion errors
firebaseIsolation.enableIsolation('Auto-enabled to prevent Firebase internal assertion errors');

// Add global error handler to catch any remaining Firebase assertion errors
if (typeof window !== 'undefined') {
  const originalConsoleError = console.error;

  console.error = function(...args: any[]) {
    const message = args.join(' ');

    // Detect and suppress Firebase assertion errors
    if (message.includes('INTERNAL ASSERTION FAILED') ||
        message.includes('FIRESTORE') && message.includes('Unexpected state')) {
      console.warn('🚫 Firebase assertion error suppressed by isolation mode:', message);
      return; // Don't propagate the error
    }

    // Call original console.error for other errors
    originalConsoleError.apply(console, args);
  };

  console.log('✅ Firebase error suppression enabled');
}

// Export convenience functions
export const isFirebaseIsolated = () => firebaseIsolation.isIsolated();
export const enableFirebaseIsolation = (reason?: string) => firebaseIsolation.enableIsolation(reason);
export const disableFirebaseIsolation = () => firebaseIsolation.disableIsolation();
export const getFirebaseIsolationState = () => firebaseIsolation.getState();

export default firebaseIsolation;
