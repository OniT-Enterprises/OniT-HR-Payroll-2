/**
 * Test Setup File
 *
 * Global setup and configuration for Jest tests
 */

// Increase timeout for integration tests
jest.setTimeout(30000);

// Mock console.log/warn/error in tests to reduce noise
const originalConsole = global.console;

beforeAll(() => {
  global.console = {
    ...originalConsole,
    log: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
    debug: jest.fn(),
  };
});

afterAll(() => {
  global.console = originalConsole;
});

// Global test utilities
global.testUtils = {
  // Helper to create mock Firestore timestamp
  createTimestamp: (date: Date = new Date()) => ({
    toDate: () => date,
    seconds: Math.floor(date.getTime() / 1000),
    nanoseconds: (date.getTime() % 1000) * 1000000,
  }),

  // Helper to create mock auth user
  createMockUser: (uid: string, tenants: string[] = []) => ({
    uid,
    customClaims: { tenants },
  }),

  // Helper to create date ranges
  createDateRange: (start: string, end: string) => ({
    start: new Date(start),
    end: new Date(end),
  }),
};

// Type definitions for global test utilities
declare global {
  var testUtils: {
    createTimestamp: (date?: Date) => any;
    createMockUser: (uid: string, tenants?: string[]) => any;
    createDateRange: (start: string, end: string) => { start: Date; end: Date };
  };
}

export {};
