import { Employee } from "./employeeService";

// Realistic data pools
const firstNames = [
  "James",
  "Mary",
  "John",
  "Patricia",
  "Robert",
  "Jennifer",
  "Michael",
  "Linda",
  "David",
  "Elizabeth",
  "William",
  "Barbara",
  "Richard",
  "Susan",
  "Joseph",
  "Jessica",
  "Thomas",
  "Sarah",
  "Christopher",
  "Karen",
  "Charles",
  "Nancy",
  "Daniel",
  "Lisa",
  "Matthew",
  "Betty",
  "Anthony",
  "Dorothy",
  "Mark",
  "Sandra",
  "Donald",
  "Donna",
  "Steven",
  "Carol",
  "Paul",
  "Ruth",
  "Andrew",
  "Sharon",
  "Joshua",
  "Michelle",
  "Kenneth",
  "Laura",
  "Kevin",
  "Sarah",
  "Brian",
  "Kimberly",
  "George",
  "Deborah",
  "Timothy",
  "Dorothy",
  "Ronald",
  "Lisa",
  "Jason",
  "Nancy",
  "Edward",
  "Karen",
  "Jeffrey",
  "Betty",
  "Ryan",
  "Helen",
  "Jacob",
  "Sandra",
  "Gary",
  "Donna",
  "Nicholas",
  "Carol",
  "Eric",
  "Ruth",
  "Jonathan",
  "Sharon",
  "Stephen",
  "Michelle",
  "Larry",
  "Laura",
  "Justin",
  "Sarah",
  "Scott",
  "Kimberly",
  "Brandon",
  "Deborah",
  "Benjamin",
  "Dorothy",
  "Samuel",
  "Lisa",
  "Gregory",
  "Nancy",
  "Alexander",
  "Karen",
];

const lastNames = [
  "Smith",
  "Johnson",
  "Williams",
  "Brown",
  "Jones",
  "Garcia",
  "Miller",
  "Davis",
  "Rodriguez",
  "Martinez",
  "Hernandez",
  "Lopez",
  "Gonzalez",
  "Wilson",
  "Anderson",
  "Thomas",
  "Taylor",
  "Moore",
  "Jackson",
  "Martin",
  "Lee",
  "Perez",
  "Thompson",
  "White",
  "Harris",
  "Sanchez",
  "Clark",
  "Ramirez",
  "Lewis",
  "Robinson",
  "Walker",
  "Young",
  "Allen",
  "King",
  "Wright",
  "Scott",
  "Torres",
  "Nguyen",
  "Hill",
  "Flores",
  "Green",
  "Adams",
  "Nelson",
  "Baker",
  "Hall",
  "Rivera",
  "Campbell",
  "Mitchell",
  "Carter",
  "Roberts",
  "Gomez",
  "Phillips",
  "Evans",
  "Turner",
  "Diaz",
  "Parker",
  "Cruz",
  "Edwards",
  "Collins",
  "Reyes",
  "Stewart",
  "Morris",
  "Morales",
  "Murphy",
  "Cook",
  "Rogers",
  "Gutierrez",
  "Ortiz",
  "Morgan",
  "Cooper",
  "Peterson",
  "Bailey",
  "Reed",
  "Kelly",
  "Howard",
  "Ramos",
  "Kim",
  "Cox",
  "Ward",
  "Richardson",
  "Watson",
  "Brooks",
  "Chavez",
  "Wood",
  "James",
  "Bennett",
  "Gray",
  "Mendoza",
];

const departments = [
  "Engineering",
  "Human Resources",
  "Marketing",
  "Sales",
  "Finance",
  "Operations",
  "Customer Service",
  "Information Technology",
  "Legal",
  "Research & Development",
  "Quality Assurance",
  "Administration",
  "Procurement",
  "Facilities",
  "Training",
];

const positions = {
  Engineering: [
    "Software Engineer",
    "Senior Software Engineer",
    "Lead Software Engineer",
    "Frontend Developer",
    "Backend Developer",
    "Full Stack Developer",
    "DevOps Engineer",
    "System Architect",
    "Technical Lead",
    "Principal Engineer",
    "Engineering Manager",
  ],
  "Human Resources": [
    "HR Specialist",
    "HR Manager",
    "Recruiter",
    "HR Director",
    "Compensation Analyst",
    "Training Coordinator",
    "Employee Relations Specialist",
    "HR Business Partner",
  ],
  Marketing: [
    "Marketing Specialist",
    "Marketing Manager",
    "Digital Marketing Manager",
    "Content Marketing Manager",
    "Brand Manager",
    "Marketing Director",
    "Marketing Coordinator",
    "Social Media Manager",
    "SEO Specialist",
    "Marketing Analyst",
  ],
  Sales: [
    "Sales Representative",
    "Sales Manager",
    "Account Manager",
    "Sales Director",
    "Business Development Manager",
    "Regional Sales Manager",
    "Inside Sales Rep",
    "Sales Coordinator",
    "Key Account Manager",
    "Sales Operations Manager",
  ],
  Finance: [
    "Financial Analyst",
    "Accountant",
    "Senior Accountant",
    "Finance Manager",
    "Controller",
    "CFO",
    "Budget Analyst",
    "Financial Planning Analyst",
    "Accounts Payable Specialist",
    "Accounts Receivable Specialist",
  ],
  Operations: [
    "Operations Manager",
    "Operations Coordinator",
    "Process Improvement Specialist",
    "Operations Director",
    "Supply Chain Manager",
    "Logistics Coordinator",
    "Operations Analyst",
    "Project Manager",
    "Operations Specialist",
  ],
  "Customer Service": [
    "Customer Service Representative",
    "Customer Service Manager",
    "Support Specialist",
    "Customer Success Manager",
    "Technical Support Specialist",
    "Call Center Manager",
    "Customer Experience Specialist",
    "Client Relations Manager",
  ],
  "Information Technology": [
    "IT Specialist",
    "System Administrator",
    "Network Administrator",
    "IT Manager",
    "Database Administrator",
    "IT Director",
    "Cybersecurity Specialist",
    "Help Desk Technician",
    "IT Support Specialist",
    "Infrastructure Engineer",
  ],
  Legal: [
    "Legal Counsel",
    "Paralegal",
    "Legal Assistant",
    "Contract Manager",
    "Compliance Officer",
    "General Counsel",
    "Legal Analyst",
  ],
  "Research & Development": [
    "Research Scientist",
    "R&D Manager",
    "Product Developer",
    "Research Analyst",
    "Innovation Manager",
    "R&D Director",
    "Laboratory Technician",
  ],
  "Quality Assurance": [
    "QA Analyst",
    "QA Manager",
    "Quality Control Inspector",
    "QA Director",
    "Test Engineer",
    "Quality Specialist",
    "Compliance Analyst",
  ],
  Administration: [
    "Administrative Assistant",
    "Executive Assistant",
    "Office Manager",
    "Administrative Coordinator",
    "Receptionist",
    "Data Entry Clerk",
  ],
  Procurement: [
    "Procurement Specialist",
    "Purchasing Manager",
    "Vendor Manager",
    "Procurement Analyst",
    "Sourcing Manager",
    "Contract Specialist",
  ],
  Facilities: [
    "Facilities Manager",
    "Maintenance Technician",
    "Security Guard",
    "Facilities Coordinator",
    "Building Engineer",
    "Groundskeeper",
  ],
  Training: [
    "Training Specialist",
    "Learning & Development Manager",
    "Corporate Trainer",
    "Instructional Designer",
    "Training Coordinator",
  ],
};

const employmentTypes = ["Full-time", "Part-time", "Contract", "Temporary"];
const workLocations = ["Office", "Remote", "Hybrid", "Field"];
const benefitsPackages = ["Basic", "Standard", "Premium", "Executive"];
const statuses = ["active", "inactive"] as const;

// Salary ranges by department (annual)
const salaryRanges = {
  Engineering: [75000, 180000],
  "Human Resources": [50000, 120000],
  Marketing: [45000, 130000],
  Sales: [40000, 150000],
  Finance: [55000, 140000],
  Operations: [45000, 110000],
  "Customer Service": [35000, 80000],
  "Information Technology": [60000, 160000],
  Legal: [70000, 200000],
  "Research & Development": [65000, 150000],
  "Quality Assurance": [50000, 100000],
  Administration: [30000, 70000],
  Procurement: [45000, 95000],
  Facilities: [35000, 85000],
  Training: [50000, 110000],
};

function getRandomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function getRandomSalary(department: string): number {
  const range = salaryRanges[department as keyof typeof salaryRanges] || [
    40000, 80000,
  ];
  return Math.floor(Math.random() * (range[1] - range[0] + 1)) + range[0];
}

function generateRandomDate(start: Date, end: Date): string {
  const startTime = start.getTime();
  const endTime = end.getTime();
  const randomTime = startTime + Math.random() * (endTime - startTime);
  return new Date(randomTime).toISOString().split("T")[0];
}

function generatePhoneNumber(): string {
  const areaCode = Math.floor(Math.random() * 900) + 100;
  const exchange = Math.floor(Math.random() * 900) + 100;
  const number = Math.floor(Math.random() * 9000) + 1000;
  return `+1 (${areaCode}) ${exchange}-${number}`;
}

function generateEmployeeId(index: number): string {
  return `EMP${(index + 1).toString().padStart(3, "0")}`;
}

function generateDocumentNumber(prefix: string): string {
  return `${prefix}${Math.floor(Math.random() * 900000) + 100000}`;
}

function generateSSN(): string {
  const area = Math.floor(Math.random() * 900) + 100;
  const group = Math.floor(Math.random() * 90) + 10;
  const serial = Math.floor(Math.random() * 9000) + 1000;
  return `***-**-${serial.toString().slice(-4)}`;
}

export function generateEmployeeData(
  count: number = 82,
): Omit<Employee, "id">[] {
  const employees: Omit<Employee, "id">[] = [];

  for (let i = 0; i < count; i++) {
    const firstName = getRandomElement(firstNames);
    const lastName = getRandomElement(lastNames);
    const department = getRandomElement(departments);
    const departmentPositions = positions[
      department as keyof typeof positions
    ] || ["Employee"];
    const position = getRandomElement(departmentPositions);
    const hireDate = generateRandomDate(
      new Date(2020, 0, 1),
      new Date(2024, 11, 31),
    );
    const dateOfBirth = generateRandomDate(
      new Date(1970, 0, 1),
      new Date(2000, 11, 31),
    );

    // Generate expiry dates 2-5 years in the future
    const futureDate1 = new Date();
    futureDate1.setFullYear(
      futureDate1.getFullYear() + Math.floor(Math.random() * 4) + 2,
    );

    const futureDate2 = new Date();
    futureDate2.setFullYear(
      futureDate2.getFullYear() + Math.floor(Math.random() * 4) + 2,
    );

    const futureDate3 = new Date();
    futureDate3.setFullYear(
      futureDate3.getFullYear() + Math.floor(Math.random() * 4) + 2,
    );

    const futureDate4 = new Date();
    futureDate4.setFullYear(
      futureDate4.getFullYear() + Math.floor(Math.random() * 4) + 2,
    );

    const employee: Omit<Employee, "id"> = {
      personalInfo: {
        firstName,
        lastName,
        email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@company.com`,
        phone: generatePhoneNumber(),
        address: `${Math.floor(Math.random() * 9999) + 1} ${getRandomElement(["Main", "Oak", "Pine", "Maple", "Cedar", "Elm", "Park", "First", "Second", "Third"])} ${getRandomElement(["St", "Ave", "Blvd", "Dr", "Rd"])}, ${getRandomElement(["New York", "Los Angeles", "Chicago", "Houston", "Phoenix", "Philadelphia", "San Antonio", "San Diego", "Dallas", "San Jose"])}, ${getRandomElement(["NY", "CA", "IL", "TX", "AZ", "PA", "FL", "OH", "NC", "GA"])} ${Math.floor(Math.random() * 90000) + 10000}`,
        dateOfBirth,
        socialSecurityNumber: generateSSN(),
        emergencyContactName: `${getRandomElement(firstNames)} ${getRandomElement(lastNames)}`,
        emergencyContactPhone: generatePhoneNumber(),
      },
      jobDetails: {
        employeeId: generateEmployeeId(i),
        department,
        position,
        hireDate,
        employmentType: getRandomElement(employmentTypes),
        workLocation: getRandomElement(workLocations),
        manager: `${getRandomElement(firstNames)} ${getRandomElement(lastNames)}`,
      },
      compensation: {
        annualSalary: getRandomSalary(department),
        annualLeaveDays: Math.floor(Math.random() * 11) + 20, // 20-30 days
        benefitsPackage: getRandomElement(benefitsPackages),
      },
      documents: {
        socialSecurityNumber: {
          number: generateSSN(),
          expiryDate: futureDate1.toISOString().split("T")[0],
        },
        electoralCard: {
          number: generateDocumentNumber("EC"),
          expiryDate: futureDate2.toISOString().split("T")[0],
        },
        idCard: {
          number: generateDocumentNumber("ID"),
          expiryDate: futureDate3.toISOString().split("T")[0],
        },
        passport: {
          number: generateDocumentNumber("PA"),
          expiryDate: futureDate4.toISOString().split("T")[0],
        },
      },
      status: getRandomElement(statuses),
    };

    employees.push(employee);
  }

  return employees;
}

// Export function to populate Firebase
export async function populateEmployeeDatabase(employeeService: any) {
  console.log("🚀 Generating 82 employee records...");

  const employees = generateEmployeeData(82);
  let successCount = 0;
  let errorCount = 0;

  for (const [index, employee] of employees.entries()) {
    try {
      const employeeId = await employeeService.addEmployee(employee);
      if (employeeId) {
        successCount++;
        console.log(
          `✅ ${successCount}/82: Added ${employee.personalInfo.firstName} ${employee.personalInfo.lastName} (${employee.jobDetails.department})`,
        );
      } else {
        errorCount++;
        console.error(
          `❌ Failed to add ${employee.personalInfo.firstName} ${employee.personalInfo.lastName}`,
        );
      }
    } catch (error) {
      errorCount++;
      console.error(
        `❌ Error adding ${employee.personalInfo.firstName} ${employee.personalInfo.lastName}:`,
        error,
      );
    }

    // Add small delay to avoid overwhelming Firebase
    if (index % 10 === 0 && index > 0) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  console.log(`🎉 Database population completed!`);
  console.log(`✅ Successfully added: ${successCount} employees`);
  console.log(`❌ Errors: ${errorCount} employees`);
  console.log(`📊 Total: ${successCount + errorCount}/82 employees processed`);

  return { successCount, errorCount };
}
