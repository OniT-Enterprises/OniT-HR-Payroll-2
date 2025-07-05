import { employeeService } from "@/services/employeeService";
import { populateEmployeeDatabase } from "@/services/employeeDataGenerator";

// Function to run in browser console or as module
export async function populateStaffData() {
  console.log("🏢 PayrollHR Staff Database Population");
  console.log("=====================================");
  console.log("📊 Generating 82 realistic employee records...");
  console.log("");

  try {
    const result = await populateEmployeeDatabase(employeeService);

    console.log("");
    console.log("📈 POPULATION SUMMARY:");
    console.log("======================");
    console.log(`✅ Success: ${result.successCount} employees`);
    console.log(`❌ Errors: ${result.errorCount} employees`);
    console.log(`📊 Total: 82 employees processed`);
    console.log("");

    if (result.successCount > 0) {
      console.log("🎉 Database successfully populated!");
      console.log("🔄 Refresh your browser to see the new data in:");
      console.log("   • All Employees page");
      console.log("   • Organization Chart");
      console.log("   • Department views");
      console.log("   • All other modules");
    } else {
      console.log(
        "⚠️  No employees were added. Please check your Firebase configuration.",
      );
    }
  } catch (error) {
    console.error("💥 Critical error during population:", error);
  }
}

// Auto-run if called directly in console
if (typeof window !== "undefined") {
  (window as any).populateStaffData = populateStaffData;
  console.log("📝 Staff population script loaded!");
  console.log("🚀 Run: populateStaffData() to generate 82 employees");
}
