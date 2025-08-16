/**
 * Auto-initialize Firebase offline mode to prevent assertion errors
 * This module automatically enables offline mode when imported
 */

import { enableFirebaseOfflineMode } from './firebaseOfflineMode';

console.log('🔧 Auto-initializing Firebase offline mode to prevent assertion errors...');

// Enable offline mode immediately to prevent any watch stream issues
enableFirebaseOfflineMode().then(() => {
  console.log('✅ Firebase offline mode auto-enabled successfully');
}).catch((error) => {
  console.warn('⚠️ Failed to auto-enable offline mode:', error);
});

// Export for explicit imports if needed
export { enableFirebaseOfflineMode };
