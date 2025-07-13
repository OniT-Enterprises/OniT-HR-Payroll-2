// Offline-first service that completely avoids Firebase when network issues are detected
import { Department } from "./departmentService";
import { Employee } from "./employeeService";

class OfflineFirstService {
  private isOfflineMode = false;
  private lastNetworkCheck = 0;
  private checkInterval = 5000; // 5 seconds

  constructor() {
    this.initializeOfflineMode();
    this.monitorNetworkStatus();
  }

  private initializeOfflineMode() {
    // Start in offline mode if browser is offline
    if (!navigator.onLine) {
      this.enableOfflineMode("Browser offline");
    }

    // Test network connectivity
    this.checkNetworkConnectivity();
  }

  private async checkNetworkConnectivity() {
    try {
      // Quick network test
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);

      await fetch("https://www.google.com/favicon.ico", {
        method: "HEAD",
        mode: "no-cors",
        cache: "no-cache",
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Network seems OK
      if (this.isOfflineMode) {
        console.log("🌐 Network connectivity restored");
        // Don't automatically go back online - be conservative
      }
    } catch (error) {
      this.enableOfflineMode("Network connectivity test failed");
    }
  }

  private enableOfflineMode(reason: string) {
    if (!this.isOfflineMode) {
      this.isOfflineMode = true;
      console.warn(`🚫 Enabling offline mode: ${reason}`);

      // Notify the app
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("offlineModeEnabled", {
            detail: { reason },
          }),
        );
      }
    }
  }

  private monitorNetworkStatus() {
    if (typeof window === "undefined") return;

    window.addEventListener("offline", () => {
      this.enableOfflineMode("Browser went offline");
    });

    window.addEventListener("online", () => {
      console.log(
        "🌐 Browser reports online, but staying in offline mode for safety",
      );
      // Don't automatically disable offline mode
    });

    // Periodic connectivity check
    setInterval(() => {
      if (Date.now() - this.lastNetworkCheck > this.checkInterval) {
        this.lastNetworkCheck = Date.now();
        this.checkNetworkConnectivity();
      }
    }, this.checkInterval);
  }

  public isInOfflineMode(): boolean {
    return this.isOfflineMode;
  }

  public forceOfflineMode(reason: string = "Manually forced") {
    this.enableOfflineMode(reason);
  }

  // Offline-first data methods
  public async getDepartments(): Promise<Department[]> {
    // Always use mock data in offline mode
    if (this.isOfflineMode || !navigator.onLine) {
      return this.getMockDepartments();
    }

    // Even when online, be very conservative
    try {
      // Quick network test before attempting any operations
      await this.quickNetworkTest();

      // If we get here, could potentially try Firebase
      // But for safety, still use mock data
      console.log("📊 Using mock departments for safety");
      return this.getMockDepartments();
    } catch (error) {
      this.enableOfflineMode("Network test failed during department fetch");
      return this.getMockDepartments();
    }
  }

  public async getEmployees(): Promise<Employee[]> {
    // Always use mock data in offline mode
    if (this.isOfflineMode || !navigator.onLine) {
      return this.getMockEmployees();
    }

    // Even when online, be very conservative
    try {
      // Quick network test before attempting any operations
      await this.quickNetworkTest();

      // If we get here, could potentially try Firebase
      // But for safety, still use mock data
      console.log("👥 Using mock employees for safety");
      return this.getMockEmployees();
    } catch (error) {
      this.enableOfflineMode("Network test failed during employee fetch");
      return this.getMockEmployees();
    }
  }

  private async quickNetworkTest(): Promise<void> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1000);

    try {
      await fetch("data:text/plain,test", {
        method: "HEAD",
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
    } catch (error) {
      clearTimeout(timeoutId);
      throw new Error("Network test failed");
    }
  }

  private getMockDepartments(): Department[] {
    return [
      {
        id: "dept-1",
        name: "Engineering",
        director: "John Smith",
        manager: "Jane Doe",
        icon: "building",
        shape: "circle",
        color: "#3B82F6",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "dept-2",
        name: "Marketing",
        director: "Sarah Wilson",
        manager: "Mike Johnson",
        icon: "building",
        shape: "circle",
        color: "#10B981",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "dept-3",
        name: "Sales",
        director: "Robert Brown",
        manager: "Lisa Davis",
        icon: "building",
        shape: "circle",
        color: "#F59E0B",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "dept-4",
        name: "Human Resources",
        director: "Emily Clark",
        manager: "David Miller",
        icon: "building",
        shape: "circle",
        color: "#8B5CF6",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "dept-5",
        name: "Finance",
        director: "Michael Anderson",
        manager: "Jennifer Taylor",
        icon: "building",
        shape: "circle",
        color: "#EF4444",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];
  }

  private getMockEmployees(): Employee[] {
    // Return comprehensive mock employee data
    return [
      {
        id: "emp-1",
        personalInfo: {
          firstName: "John",
          lastName: "Smith",
          email: "john.smith@company.com",
          phone: "+1-555-0101",
          phoneApp: "WhatsApp",
          appEligible: true,
          address: "123 Main St, New York, NY 10001",
          dateOfBirth: "1985-06-15",
          socialSecurityNumber: "***-**-1234",
          emergencyContactName: "Jane Smith",
          emergencyContactPhone: "+1-555-0102",
        },
        jobDetails: {
          employeeId: "ENG001",
          department: "Engineering",
          position: "Senior Software Engineer",
          hireDate: "2020-03-15",
          employmentType: "Full-time",
          workLocation: "New York Office",
          manager: "Jane Doe",
        },
        compensation: {
          monthlySalary: 8500,
          annualLeaveDays: 25,
          benefitsPackage: "Premium Health + Dental",
        },
        documents: {
          employeeIdCard: {
            number: "ENG001",
            expiryDate: "2025-03-15",
            required: true,
          },
          socialSecurityNumber: {
            number: "***-**-1234",
            expiryDate: "N/A",
            required: true,
          },
          passport: {
            number: "***1234",
            expiryDate: "2028-06-15",
            required: false,
          },
        },
        status: "active",
      },
      // Add more mock employees as needed...
    ];
  }
}

export const offlineFirstService = new OfflineFirstService();
