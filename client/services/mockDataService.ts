import { Employee } from "./employeeService";

// Mock employee data for offline/fallback mode
const mockEmployees: Employee[] = [
  {
    id: "mock-1",
    personalInfo: {
      firstName: "Sarah",
      lastName: "Johnson",
      email: "sarah.johnson@company.com",
      phone: "+670 123 4567",
      phoneApp: "+670 123 4567",
      appEligible: true,
      address: "123 Main St, Dili",
      dateOfBirth: "1990-05-15",
      socialSecurityNumber: "123456789",
      emergencyContactName: "John Johnson",
      emergencyContactPhone: "+670 987 6543",
    },
    jobDetails: {
      employeeId: "EMP001",
      department: "Engineering",
      position: "Senior Developer",
      hireDate: "2023-01-15",
      employmentType: "Full-time",
      workLocation: "Office",
      manager: "Tech Lead",
    },
    compensation: {
      monthlySalary: 1500,
      annualLeaveDays: 25,
      benefitsPackage: "Standard",
    },
    documents: {
      employeeIdCard: { number: "EMP001", expiryDate: "", required: true },
      socialSecurityNumber: {
        number: "123456789",
        expiryDate: "2030-12-31",
        required: true,
      },
      electoralCard: {
        number: "EC123456",
        expiryDate: "2029-06-15",
        required: false,
      },
      idCard: { number: "ID987654", expiryDate: "2028-03-20", required: true },
      passport: {
        number: "P123456789",
        expiryDate: "2030-01-15",
        required: false,
      },
      workContract: { fileUrl: "", uploadDate: "2023-01-15T00:00:00Z" },
      nationality: "Timor-Leste",
      workingVisaResidency: { number: "", expiryDate: "", fileUrl: "" },
    },
    status: "active",
    createdAt: new Date("2023-01-15"),
    updatedAt: new Date("2023-01-15"),
  },
  {
    id: "mock-2",
    personalInfo: {
      firstName: "Michael",
      lastName: "Chen",
      email: "michael.chen@company.com",
      phone: "+670 234 5678",
      phoneApp: "+670 234 5678",
      appEligible: true,
      address: "456 Oak Ave, Dili",
      dateOfBirth: "1988-03-22",
      socialSecurityNumber: "987654321",
      emergencyContactName: "Linda Chen",
      emergencyContactPhone: "+670 876 5432",
    },
    jobDetails: {
      employeeId: "EMP002",
      department: "Marketing",
      position: "Marketing Manager",
      hireDate: "2023-02-01",
      employmentType: "Full-time",
      workLocation: "Remote",
      manager: "Marketing Director",
    },
    compensation: {
      monthlySalary: 1200,
      annualLeaveDays: 25,
      benefitsPackage: "Premium",
    },
    documents: {
      employeeIdCard: { number: "EMP002", expiryDate: "", required: true },
      socialSecurityNumber: {
        number: "987654321",
        expiryDate: "2030-12-31",
        required: true,
      },
      electoralCard: {
        number: "EC654321",
        expiryDate: "2029-06-15",
        required: false,
      },
      idCard: { number: "ID456789", expiryDate: "2028-03-20", required: true },
      passport: {
        number: "P987654321",
        expiryDate: "2030-01-15",
        required: false,
      },
      workContract: { fileUrl: "", uploadDate: "2023-02-01T00:00:00Z" },
      nationality: "Timor-Leste",
      workingVisaResidency: { number: "", expiryDate: "", fileUrl: "" },
    },
    status: "active",
    createdAt: new Date("2023-02-01"),
    updatedAt: new Date("2023-02-01"),
  },
];

export class MockDataService {
  private static instance: MockDataService;
  private employees: Employee[] = [...mockEmployees];

  static getInstance(): MockDataService {
    if (!MockDataService.instance) {
      MockDataService.instance = new MockDataService();
    }
    return MockDataService.instance;
  }

  async getAllEmployees(): Promise<Employee[]> {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 500));
    return [...this.employees];
  }

  async getEmployeeById(id: string): Promise<Employee | null> {
    await new Promise((resolve) => setTimeout(resolve, 200));
    return this.employees.find((emp) => emp.id === id) || null;
  }

  async addEmployee(employee: Omit<Employee, "id">): Promise<string> {
    await new Promise((resolve) => setTimeout(resolve, 300));

    const newEmployee: Employee = {
      ...employee,
      id: `mock-${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.employees.push(newEmployee);

    // Save to localStorage for persistence
    this.saveToLocalStorage();

    return newEmployee.id;
  }

  async updateEmployee(
    id: string,
    updates: Partial<Employee>,
  ): Promise<boolean> {
    await new Promise((resolve) => setTimeout(resolve, 300));

    const index = this.employees.findIndex((emp) => emp.id === id);
    if (index === -1) return false;

    this.employees[index] = {
      ...this.employees[index],
      ...updates,
      updatedAt: new Date(),
    };

    this.saveToLocalStorage();
    return true;
  }

  async deleteEmployee(id: string): Promise<boolean> {
    await new Promise((resolve) => setTimeout(resolve, 200));

    const index = this.employees.findIndex((emp) => emp.id === id);
    if (index === -1) return false;

    this.employees.splice(index, 1);
    this.saveToLocalStorage();
    return true;
  }

  private saveToLocalStorage(): void {
    try {
      localStorage.setItem("mockEmployees", JSON.stringify(this.employees));
    } catch (error) {
      console.warn("Failed to save mock data to localStorage:", error);
    }
  }

  private loadFromLocalStorage(): void {
    try {
      const stored = localStorage.getItem("mockEmployees");
      if (stored) {
        this.employees = JSON.parse(stored);
      }
    } catch (error) {
      console.warn("Failed to load mock data from localStorage:", error);
    }
  }

  constructor() {
    this.loadFromLocalStorage();
  }
}

export const mockDataService = MockDataService.getInstance();
