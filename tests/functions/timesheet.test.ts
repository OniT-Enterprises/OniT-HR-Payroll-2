/**
 * Unit Tests: Timesheet Computation Functions
 *
 * Tests the timesheet computation logic including overtime calculation
 * and leave hours integration.
 */

import { describe, test, expect, beforeEach, jest } from "@jest/globals";

// Mock Firestore admin
const mockFirestore = {
  collection: jest.fn(),
  doc: jest.fn(),
  batch: jest.fn(),
};

const mockCollection = {
  where: jest.fn(),
  orderBy: jest.fn(),
  limit: jest.fn(),
  get: jest.fn(),
};

const mockDoc = {
  get: jest.fn(),
  set: jest.fn(),
  update: jest.fn(),
  ref: {},
};

const mockBatch = {
  set: jest.fn(),
  update: jest.fn(),
  commit: jest.fn(),
};

// Mock the Firebase Admin modules
jest.mock("firebase-admin/firestore", () => ({
  getFirestore: () => mockFirestore,
  FieldValue: {
    serverTimestamp: () => ({ _methodName: "FieldValue.serverTimestamp" }),
    arrayUnion: (value: any) => ({
      _methodName: "FieldValue.arrayUnion",
      _elements: [value],
    }),
    increment: (value: number) => ({
      _methodName: "FieldValue.increment",
      _operand: value,
    }),
  },
}));

jest.mock("firebase-admin/auth", () => ({
  getAuth: () => ({
    getUser: jest.fn(),
  }),
}));

// Import the function under test
import { recomputeWeekTotals } from "../../functions/src/timeleave";

// Test data
const TENANT_ID = "test-tenant";
const EMPLOYEE_ID = "emp-123";
const WEEK_ISO = "2024-W03";

// Helper function to create mock shift data
function createMockShift(
  date: string,
  start: string,
  end: string,
  hours?: number,
) {
  return {
    employeeId: EMPLOYEE_ID,
    date,
    start,
    end,
    hours: hours || calculateHours(start, end),
  };
}

// Helper function to calculate hours (matches the function logic)
function calculateHours(startTime: string, endTime: string): number {
  const parseTimeToMinutes = (timeStr: string): number => {
    const [hours, minutes] = timeStr.split(":").map(Number);
    return hours * 60 + minutes;
  };

  const minutesToHours = (minutes: number): number => {
    return minutes / 60;
  };

  const startMinutes = parseTimeToMinutes(startTime);
  let endMinutes = parseTimeToMinutes(endTime);

  // Handle overnight shifts
  if (endMinutes < startMinutes) {
    endMinutes += 24 * 60; // Add 24 hours
  }

  return minutesToHours(endMinutes - startMinutes);
}

describe("Timesheet Computation", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Setup default mock behaviors
    mockFirestore.collection.mockReturnValue(mockCollection);
    mockFirestore.doc.mockReturnValue(mockDoc);
    mockFirestore.batch.mockReturnValue(mockBatch);
    mockCollection.where.mockReturnValue(mockCollection);
    mockCollection.orderBy.mockReturnValue(mockCollection);
    mockCollection.limit.mockReturnValue(mockCollection);
    mockBatch.commit.mockResolvedValue(undefined);
  });

  describe("Regular Hours Calculation", () => {
    test("calculates regular hours correctly when under overtime threshold", async () => {
      // Mock shifts totaling 32 hours (under 40-hour threshold)
      const shifts = [
        createMockShift("2024-01-15", "09:00", "17:00"), // 8 hours
        createMockShift("2024-01-16", "09:00", "17:00"), // 8 hours
        createMockShift("2024-01-17", "09:00", "17:00"), // 8 hours
        createMockShift("2024-01-18", "09:00", "17:00"), // 8 hours
      ];

      // Mock Firestore responses
      mockCollection.get.mockResolvedValueOnce({
        docs: shifts.map((shift) => ({ data: () => shift })),
      });

      // Mock no leave requests
      mockCollection.get.mockResolvedValueOnce({ docs: [] });

      // Mock tenant config (40-hour overtime threshold)
      mockDoc.get.mockResolvedValueOnce({
        exists: true,
        data: () => ({
          payrollPolicy: { overtimeThreshold: 40 },
        }),
      });

      // Mock timesheet set operation
      mockDoc.set.mockResolvedValueOnce(undefined);

      await recomputeWeekTotals(TENANT_ID, EMPLOYEE_ID, WEEK_ISO);

      // Verify timesheet data
      expect(mockDoc.set).toHaveBeenCalledWith(
        expect.objectContaining({
          empId: EMPLOYEE_ID,
          weekIso: WEEK_ISO,
          regularHours: 32,
          overtimeHours: 0,
          paidLeaveHours: 0,
          unpaidLeaveHours: 0,
          sundays: 0,
        }),
        { merge: true },
      );
    });

    test("calculates overtime correctly when over threshold", async () => {
      // Mock shifts totaling 50 hours (10 hours overtime)
      const shifts = [
        createMockShift("2024-01-15", "08:00", "18:00"), // 10 hours
        createMockShift("2024-01-16", "08:00", "18:00"), // 10 hours
        createMockShift("2024-01-17", "08:00", "18:00"), // 10 hours
        createMockShift("2024-01-18", "08:00", "18:00"), // 10 hours
        createMockShift("2024-01-19", "08:00", "18:00"), // 10 hours
      ];

      // Mock Firestore responses
      mockCollection.get.mockResolvedValueOnce({
        docs: shifts.map((shift) => ({ data: () => shift })),
      });

      // Mock no leave requests
      mockCollection.get.mockResolvedValueOnce({ docs: [] });

      // Mock tenant config (40-hour overtime threshold)
      mockDoc.get.mockResolvedValueOnce({
        exists: true,
        data: () => ({
          payrollPolicy: { overtimeThreshold: 40 },
        }),
      });

      mockDoc.set.mockResolvedValueOnce(undefined);

      await recomputeWeekTotals(TENANT_ID, EMPLOYEE_ID, WEEK_ISO);

      expect(mockDoc.set).toHaveBeenCalledWith(
        expect.objectContaining({
          regularHours: 40,
          overtimeHours: 10,
        }),
        { merge: true },
      );
    });

    test("handles custom overtime threshold from tenant config", async () => {
      // Mock 45 hours of work with 44-hour threshold
      const shifts = [
        createMockShift("2024-01-15", "08:00", "17:00"), // 9 hours
        createMockShift("2024-01-16", "08:00", "17:00"), // 9 hours
        createMockShift("2024-01-17", "08:00", "17:00"), // 9 hours
        createMockShift("2024-01-18", "08:00", "17:00"), // 9 hours
        createMockShift("2024-01-19", "08:00", "17:00"), // 9 hours
      ];

      mockCollection.get.mockResolvedValueOnce({
        docs: shifts.map((shift) => ({ data: () => shift })),
      });

      mockCollection.get.mockResolvedValueOnce({ docs: [] });

      // Mock tenant config with 44-hour threshold
      mockDoc.get.mockResolvedValueOnce({
        exists: true,
        data: () => ({
          payrollPolicy: { overtimeThreshold: 44 },
        }),
      });

      mockDoc.set.mockResolvedValueOnce(undefined);

      await recomputeWeekTotals(TENANT_ID, EMPLOYEE_ID, WEEK_ISO);

      expect(mockDoc.set).toHaveBeenCalledWith(
        expect.objectContaining({
          regularHours: 44,
          overtimeHours: 1,
        }),
        { merge: true },
      );
    });

    test("defaults to 40-hour threshold when tenant config missing", async () => {
      const shifts = [
        createMockShift("2024-01-15", "08:00", "20:00"), // 12 hours
        createMockShift("2024-01-16", "08:00", "20:00"), // 12 hours
        createMockShift("2024-01-17", "08:00", "20:00"), // 12 hours
        createMockShift("2024-01-18", "08:00", "20:00"), // 12 hours
      ]; // 48 total hours

      mockCollection.get.mockResolvedValueOnce({
        docs: shifts.map((shift) => ({ data: () => shift })),
      });

      mockCollection.get.mockResolvedValueOnce({ docs: [] });

      // Mock missing tenant config
      mockDoc.get.mockResolvedValueOnce({
        exists: false,
      });

      mockDoc.set.mockResolvedValueOnce(undefined);

      await recomputeWeekTotals(TENANT_ID, EMPLOYEE_ID, WEEK_ISO);

      expect(mockDoc.set).toHaveBeenCalledWith(
        expect.objectContaining({
          regularHours: 40,
          overtimeHours: 8,
        }),
        { merge: true },
      );
    });
  });

  describe("Leave Hours Integration", () => {
    test("calculates paid leave hours correctly", async () => {
      // Mock leave request that overlaps with the week
      const leaveStart = new Date("2024-01-16");
      const leaveEnd = new Date("2024-01-17");

      const leaveRequest = {
        empId: EMPLOYEE_ID,
        type: "vacation", // Paid leave type
        status: "approved",
        from: { toDate: () => leaveStart },
        to: { toDate: () => leaveEnd },
        hours: 16, // 2 days × 8 hours
      };

      // Mock no shifts
      mockCollection.get.mockResolvedValueOnce({ docs: [] });

      // Mock leave request
      mockCollection.get.mockResolvedValueOnce({
        docs: [{ data: () => leaveRequest }],
      });

      mockDoc.get.mockResolvedValueOnce({
        exists: true,
        data: () => ({ payrollPolicy: { overtimeThreshold: 40 } }),
      });

      mockDoc.set.mockResolvedValueOnce(undefined);

      await recomputeWeekTotals(TENANT_ID, EMPLOYEE_ID, WEEK_ISO);

      expect(mockDoc.set).toHaveBeenCalledWith(
        expect.objectContaining({
          paidLeaveHours: expect.toBeCloseTo(16, 1),
          unpaidLeaveHours: 0,
        }),
        { merge: true },
      );
    });

    test("calculates unpaid leave hours correctly", async () => {
      const leaveStart = new Date("2024-01-15");
      const leaveEnd = new Date("2024-01-15");

      const leaveRequest = {
        empId: EMPLOYEE_ID,
        type: "unpaid", // Unpaid leave type
        status: "approved",
        from: { toDate: () => leaveStart },
        to: { toDate: () => leaveEnd },
        hours: 8,
      };

      mockCollection.get.mockResolvedValueOnce({ docs: [] });
      mockCollection.get.mockResolvedValueOnce({
        docs: [{ data: () => leaveRequest }],
      });

      mockDoc.get.mockResolvedValueOnce({
        exists: true,
        data: () => ({ payrollPolicy: { overtimeThreshold: 40 } }),
      });

      mockDoc.set.mockResolvedValueOnce(undefined);

      await recomputeWeekTotals(TENANT_ID, EMPLOYEE_ID, WEEK_ISO);

      expect(mockDoc.set).toHaveBeenCalledWith(
        expect.objectContaining({
          paidLeaveHours: 0,
          unpaidLeaveHours: expect.toBeCloseTo(8, 1),
        }),
        { merge: true },
      );
    });

    test("handles partial week leave overlap", async () => {
      // Leave that starts before the week and ends in the middle
      const leaveStart = new Date("2024-01-10"); // Before week starts
      const leaveEnd = new Date("2024-01-16"); // Middle of week

      const leaveRequest = {
        empId: EMPLOYEE_ID,
        type: "sick",
        status: "approved",
        from: { toDate: () => leaveStart },
        to: { toDate: () => leaveEnd },
        hours: 56, // 7 days × 8 hours
      };

      mockCollection.get.mockResolvedValueOnce({ docs: [] });
      mockCollection.get.mockResolvedValueOnce({
        docs: [{ data: () => leaveRequest }],
      });

      mockDoc.get.mockResolvedValueOnce({
        exists: true,
        data: () => ({ payrollPolicy: { overtimeThreshold: 40 } }),
      });

      mockDoc.set.mockResolvedValueOnce(undefined);

      await recomputeWeekTotals(TENANT_ID, EMPLOYEE_ID, WEEK_ISO);

      // Should only count the portion that overlaps with the week
      // Week runs Jan 15-21, so overlap is Jan 15-16 = 2 days
      expect(mockDoc.set).toHaveBeenCalledWith(
        expect.objectContaining({
          paidLeaveHours: expect.toBeCloseTo(16, 1), // 2 days × 8 hours
        }),
        { merge: true },
      );
    });
  });

  describe("Sunday Hours Tracking", () => {
    test("counts Sunday hours separately", async () => {
      // Create shifts with one on Sunday (Jan 21, 2024 is a Sunday)
      const shifts = [
        createMockShift("2024-01-15", "09:00", "17:00"), // Monday
        createMockShift("2024-01-16", "09:00", "17:00"), // Tuesday
        createMockShift("2024-01-21", "09:00", "13:00"), // Sunday - 4 hours
      ];

      mockCollection.get.mockResolvedValueOnce({
        docs: shifts.map((shift) => ({ data: () => shift })),
      });

      mockCollection.get.mockResolvedValueOnce({ docs: [] });

      mockDoc.get.mockResolvedValueOnce({
        exists: true,
        data: () => ({ payrollPolicy: { overtimeThreshold: 40 } }),
      });

      mockDoc.set.mockResolvedValueOnce(undefined);

      await recomputeWeekTotals(TENANT_ID, EMPLOYEE_ID, WEEK_ISO);

      expect(mockDoc.set).toHaveBeenCalledWith(
        expect.objectContaining({
          sundays: 1, // One Sunday worked
        }),
        { merge: true },
      );
    });

    test("counts multiple Sundays correctly", async () => {
      // This would happen if the week calculation spans multiple weeks
      // or in edge cases - just test the logic works
      const shifts = [
        createMockShift("2024-01-14", "09:00", "17:00"), // Sunday
        createMockShift("2024-01-21", "09:00", "17:00"), // Sunday
      ];

      mockCollection.get.mockResolvedValueOnce({
        docs: shifts.map((shift) => ({ data: () => shift })),
      });

      mockCollection.get.mockResolvedValueOnce({ docs: [] });
      mockDoc.get.mockResolvedValueOnce({
        exists: true,
        data: () => ({ payrollPolicy: { overtimeThreshold: 40 } }),
      });

      mockDoc.set.mockResolvedValueOnce(undefined);

      await recomputeWeekTotals(TENANT_ID, EMPLOYEE_ID, WEEK_ISO);

      expect(mockDoc.set).toHaveBeenCalledWith(
        expect.objectContaining({
          sundays: 2,
        }),
        { merge: true },
      );
    });
  });

  describe("Edge Cases and Error Handling", () => {
    test("handles no shifts gracefully", async () => {
      mockCollection.get.mockResolvedValueOnce({ docs: [] }); // No shifts
      mockCollection.get.mockResolvedValueOnce({ docs: [] }); // No leave
      mockDoc.get.mockResolvedValueOnce({
        exists: true,
        data: () => ({ payrollPolicy: { overtimeThreshold: 40 } }),
      });

      mockDoc.set.mockResolvedValueOnce(undefined);

      await recomputeWeekTotals(TENANT_ID, EMPLOYEE_ID, WEEK_ISO);

      expect(mockDoc.set).toHaveBeenCalledWith(
        expect.objectContaining({
          regularHours: 0,
          overtimeHours: 0,
          paidLeaveHours: 0,
          unpaidLeaveHours: 0,
          sundays: 0,
        }),
        { merge: true },
      );
    });

    test("handles overnight shifts correctly", async () => {
      const shifts = [
        createMockShift("2024-01-15", "22:00", "06:00"), // 8-hour night shift
      ];

      mockCollection.get.mockResolvedValueOnce({
        docs: shifts.map((shift) => ({ data: () => shift })),
      });

      mockCollection.get.mockResolvedValueOnce({ docs: [] });
      mockDoc.get.mockResolvedValueOnce({
        exists: true,
        data: () => ({ payrollPolicy: { overtimeThreshold: 40 } }),
      });

      mockDoc.set.mockResolvedValueOnce(undefined);

      await recomputeWeekTotals(TENANT_ID, EMPLOYEE_ID, WEEK_ISO);

      expect(mockDoc.set).toHaveBeenCalledWith(
        expect.objectContaining({
          regularHours: 8, // Should correctly calculate 8 hours for overnight shift
        }),
        { merge: true },
      );
    });

    test("handles weeks spanning multiple months", async () => {
      // This tests the logic for weeks that cross month boundaries
      // The function should query multiple roster collections

      // Mock shifts from different months
      mockCollection.get
        .mockResolvedValueOnce({
          docs: [
            { data: () => createMockShift("2024-01-30", "09:00", "17:00") },
          ],
        })
        .mockResolvedValueOnce({
          docs: [
            { data: () => createMockShift("2024-02-01", "09:00", "17:00") },
          ],
        });

      mockCollection.get.mockResolvedValueOnce({ docs: [] }); // Leave requests
      mockDoc.get.mockResolvedValueOnce({
        exists: true,
        data: () => ({ payrollPolicy: { overtimeThreshold: 40 } }),
      });

      mockDoc.set.mockResolvedValueOnce(undefined);

      // Use a week that spans January-February
      await recomputeWeekTotals(TENANT_ID, EMPLOYEE_ID, "2024-W05");

      expect(mockDoc.set).toHaveBeenCalledWith(
        expect.objectContaining({
          regularHours: 16, // Both shifts should be counted
        }),
        { merge: true },
      );
    });
  });

  describe("Complex Scenarios", () => {
    test("handles combination of work hours, overtime, and leave", async () => {
      // 36 hours of work + 8 hours paid leave = 44 total, 4 hours overtime
      const shifts = [
        createMockShift("2024-01-15", "08:00", "20:00"), // 12 hours
        createMockShift("2024-01-16", "08:00", "20:00"), // 12 hours
        createMockShift("2024-01-17", "08:00", "20:00"), // 12 hours
        // Jan 18 - leave day
        createMockShift("2024-01-19", "08:00", "12:00"), // 4 hours (short day)
        createMockShift("2024-01-21", "10:00", "14:00"), // 4 hours Sunday
      ];

      const leaveRequest = {
        empId: EMPLOYEE_ID,
        type: "vacation",
        status: "approved",
        from: { toDate: () => new Date("2024-01-18") },
        to: { toDate: () => new Date("2024-01-18") },
        hours: 8,
      };

      mockCollection.get.mockResolvedValueOnce({
        docs: shifts.map((shift) => ({ data: () => shift })),
      });

      mockCollection.get.mockResolvedValueOnce({
        docs: [{ data: () => leaveRequest }],
      });

      mockDoc.get.mockResolvedValueOnce({
        exists: true,
        data: () => ({ payrollPolicy: { overtimeThreshold: 40 } }),
      });

      mockDoc.set.mockResolvedValueOnce(undefined);

      await recomputeWeekTotals(TENANT_ID, EMPLOYEE_ID, WEEK_ISO);

      expect(mockDoc.set).toHaveBeenCalledWith(
        expect.objectContaining({
          regularHours: 40, // 40 hours regular
          overtimeHours: 4, // 4 hours overtime (44 total work - 40)
          paidLeaveHours: 8, // 8 hours vacation
          unpaidLeaveHours: 0, // No unpaid leave
          sundays: 1, // One Sunday worked
        }),
        { merge: true },
      );
    });
  });
});
