// PayrollHR Firebase Data Initialization
// Run this script in browser console after deployment

window.initPayrollHRData = async function () {
  console.log("🚀 Initializing PayrollHR sample data...");

  // Import Firebase modules
  const { initializeApp } = await import(
    "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js"
  );
  const { getFirestore, collection, addDoc, serverTimestamp } = await import(
    "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js"
  );

  // Firebase config
  const firebaseConfig = {
    apiKey: "AIzaSyDVdpT-32mvHyfJi03eHVN4IkZtnFVh3xs",
    authDomain: "onit-payroll.firebaseapp.com",
    projectId: "onit-payroll",
    storageBucket: "onit-payroll.firebasestorage.app",
    messagingSenderId: "797230079174",
    appId: "1:797230079174:web:c95536b46c82eea6300bc7",
  };

  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);

  // Sample candidates
  const candidates = [
    {
      name: "Sarah Johnson",
      email: "sarah.johnson@email.com",
      phone: "+1 (555) 0123",
      position: "Senior Software Engineer",
      experience: "5 years",
      score: 4.8,
      status: "Under Review",
      appliedDate: "2024-01-15",
      resume: "sarah_johnson_resume.pdf",
      avatar: "SJ",
      cvQuality: 9.2,
      coverLetter: 8.8,
      technicalSkills: 9.0,
      interviewScore: 8.5,
      totalScore: 8.9,
    },
    {
      name: "Michael Chen",
      email: "michael.chen@email.com",
      phone: "+1 (555) 0124",
      position: "Senior Software Engineer",
      experience: "7 years",
      score: 4.6,
      status: "Shortlisted",
      appliedDate: "2024-01-14",
      resume: "michael_chen_resume.pdf",
      avatar: "MC",
      cvQuality: 8.9,
      coverLetter: 8.2,
      technicalSkills: 9.5,
      interviewScore: 9.0,
      totalScore: 8.9,
    },
    {
      name: "Emily Rodriguez",
      email: "emily.rodriguez@email.com",
      phone: "+1 (555) 0125",
      position: "Senior Software Engineer",
      experience: "4 years",
      score: 4.4,
      status: "New",
      appliedDate: "2024-01-16",
      resume: "emily_rodriguez_resume.pdf",
      avatar: "ER",
      cvQuality: 8.1,
      coverLetter: 8.7,
      technicalSkills: 8.0,
      interviewScore: null,
      totalScore: 8.3,
    },
  ];

  // Sample employees
  const employees = [
    {
      personalInfo: {
        firstName: "John",
        lastName: "Doe",
        email: "john.doe@company.com",
        phone: "+1 (555) 0001",
        address: "123 Main St, City, State 12345",
        dateOfBirth: "1985-06-15",
        socialSecurityNumber: "***-**-1234",
        emergencyContactName: "Jane Doe",
        emergencyContactPhone: "+1 (555) 0002",
      },
      jobDetails: {
        employeeId: "EMP001",
        department: "Engineering",
        position: "Senior Software Engineer",
        hireDate: "2020-03-15",
        employmentType: "Full-time",
        workLocation: "Remote",
        manager: "Tech Lead",
      },
      compensation: {
        annualSalary: 95000,
        annualLeaveDays: 25,
        benefitsPackage: "Premium",
      },
      documents: {
        socialSecurityNumber: {
          number: "***-**-1234",
          expiryDate: "2030-12-31",
        },
        electoralCard: { number: "EC123456", expiryDate: "2029-01-15" },
        idCard: { number: "ID789012", expiryDate: "2028-06-30" },
        passport: { number: "PA345678", expiryDate: "2031-03-20" },
      },
      status: "active",
    },
    {
      personalInfo: {
        firstName: "Sarah",
        lastName: "Wilson",
        email: "sarah.wilson@company.com",
        phone: "+1 (555) 0003",
        address: "456 Oak Ave, City, State 12345",
        dateOfBirth: "1990-09-22",
        socialSecurityNumber: "***-**-5678",
        emergencyContactName: "Mike Wilson",
        emergencyContactPhone: "+1 (555) 0004",
      },
      jobDetails: {
        employeeId: "EMP002",
        department: "Marketing",
        position: "Marketing Manager",
        hireDate: "2021-07-10",
        employmentType: "Full-time",
        workLocation: "Office",
        manager: "Marketing Director",
      },
      compensation: {
        annualSalary: 75000,
        annualLeaveDays: 22,
        benefitsPackage: "Standard",
      },
      documents: {
        socialSecurityNumber: {
          number: "***-**-5678",
          expiryDate: "2030-12-31",
        },
        electoralCard: { number: "EC654321", expiryDate: "2029-02-10" },
        idCard: { number: "ID210987", expiryDate: "2028-09-15" },
        passport: { number: "PA876543", expiryDate: "2032-01-05" },
      },
      status: "active",
    },
  ];

  try {
    // Add candidates
    console.log("📋 Adding sample candidates...");
    for (const candidate of candidates) {
      await addDoc(collection(db, "candidates"), {
        ...candidate,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      console.log(`✅ Added candidate: ${candidate.name}`);
    }

    // Add employees
    console.log("👥 Adding sample employees...");
    for (const employee of employees) {
      await addDoc(collection(db, "employees"), {
        ...employee,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      console.log(
        `✅ Added employee: ${employee.personalInfo.firstName} ${employee.personalInfo.lastName}`,
      );
    }

    console.log("🎉 Sample data initialization completed successfully!");
    console.log("🔄 Refresh the page to see the data in your app.");
  } catch (error) {
    console.error("❌ Error initializing data:", error);
  }
};

console.log("📝 PayrollHR Data Initialization Script Loaded");
console.log("🚀 Run: initPayrollHRData() to populate sample data");
