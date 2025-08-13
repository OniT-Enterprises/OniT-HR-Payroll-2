// Test script to verify the fetch error fixes
console.log("🧪 Testing fetch error fixes...");

// Test 1: Data URL fetch should work
async function testDataURLFetch() {
  try {
    const response = await fetch("data:text/plain,test-data");
    const text = await response.text();
    console.log("✅ Data URL fetch works:", text);
    return true;
  } catch (error) {
    console.error("❌ Data URL fetch failed:", error);
    return false;
  }
}

// Test 2: Test navigator.onLine check
function testNavigatorOnline() {
  console.log("🌐 navigator.onLine:", navigator.onLine);
  return navigator.onLine;
}

// Test 3: Test OfflineFirstService instantiation
async function testOfflineFirstService() {
  try {
    const { offlineFirstService } = await import("./services/offlineFirstService");
    console.log("✅ OfflineFirstService instantiated successfully");
    console.log("📊 Offline mode:", offlineFirstService.isInOfflineMode());
    return true;
  } catch (error) {
    console.error("❌ OfflineFirstService failed:", error);
    return false;
  }
}

// Run tests
async function runTests() {
  const results = await Promise.allSettled([
    testDataURLFetch(),
    testNavigatorOnline(),
    testOfflineFirstService(),
  ]);

  console.log("🧪 Test Results:");
  results.forEach((result, index) => {
    if (result.status === "fulfilled") {
      console.log(`  Test ${index + 1}: ✅ ${result.value ? "PASS" : "FAIL"}`);
    } else {
      console.log(`  Test ${index + 1}: ❌ ERROR - ${result.reason}`);
    }
  });
}

// Only run if in browser environment
if (typeof window !== "undefined") {
  runTests();
}
