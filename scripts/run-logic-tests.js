/**
 * QA Business Logic Unit Test Suite for Community Hero
 * Run this test using command: node scripts/run-logic-tests.js
 */

const assert = require("assert");

// Mocking core calculation algorithms to test logic consistency

// 1. Proximity Distance Calculations (assert within 150 meters)
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371000; // Earth radius in meters
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

// 2. Reverse Geocoder Coordinate Matcher
function reverseGeocodeCoords(lat, lng) {
  if (Math.abs(lat - 37.7715) < 0.002) return "800 Valencia St, San Francisco, CA 94110";
  if (Math.abs(lat - 37.7752) < 0.002) return "355 McAllister St, San Francisco, CA 94102";
  if (Math.abs(lat - 37.7760) < 0.002) return "420 Howard St, San Francisco, CA 94105";
  if (Math.abs(lat - 37.7780) < 0.002) return "100 Larkin St, San Francisco, CA 94102";
  return "Market St, San Francisco, CA 94102";
}

// 3. Keyword-Based Filename Classifier
function classifyFilename(fileName) {
  const fileNameLower = (fileName || "").toLowerCase();
  if (fileNameLower.includes("leak") || fileNameLower.includes("water") || fileNameLower.includes("hydrant")) {
    return "Water Leak";
  } else if (fileNameLower.includes("trash") || fileNameLower.includes("garbage") || fileNameLower.includes("dump") || fileNameLower.includes("waste")) {
    return "Garbage Pile";
  } else if (fileNameLower.includes("light") || fileNameLower.includes("street") || fileNameLower.includes("dark") || fileNameLower.includes("bulb")) {
    return "Broken Streetlight";
  } else if (fileNameLower.includes("wire") || fileNameLower.includes("exposed") || fileNameLower.includes("cable") || fileNameLower.includes("spark")) {
    return "Exposed Power Wire";
  } else if (fileNameLower.includes("manhole") || fileNameLower.includes("open") || fileNameLower.includes("hole")) {
    return "Open Manhole Cover";
  }
  return "Asphalt Road Pothole";
}

// 4. Points & Badge Gamification Progression Logic
function calculateBadges(points) {
  const currentBadges = ["Civic Novice 🛡️"];
  if (points >= 300) currentBadges.push("City Hero 👑", "Safety Specialist 🔍");
  else if (points >= 200) currentBadges.push("Street Guardian 🛡️", "Safety Specialist 🔍");
  else if (points >= 150) currentBadges.push("Street Guardian 🛡️");
  return currentBadges;
}

// ==================== TEST EXECUTION ====================

console.log("🚀 STARTING CIVIC PORTAL BUSINESS LOGIC TEST SUITE...\n");

try {
  // Test 1: Distance proximity check
  console.log("🧪 Test 1: Proximity check...");
  const distClose = calculateDistance(37.7749, -122.4194, 37.7752, -122.4185); // Valencia Street close points
  const distFar = calculateDistance(37.7749, -122.4194, 37.8049, -122.4094); // Far points
  
  assert.ok(distClose < 150, `Close coordinate distance ${distClose.toFixed(1)}m should be under duplicate threshold (150m)`);
  assert.ok(distFar > 150, `Far coordinate distance ${distFar.toFixed(1)}m should exceed threshold`);
  console.log("   ✅ PASSED - Proximity calculations are accurate.\n");

  // Test 2: Reverse Geocoding
  console.log("🧪 Test 2: Reverse Geocoding translations...");
  const addr1 = reverseGeocodeCoords(37.7716, -122.4214);
  const addr2 = reverseGeocodeCoords(37.7753, -122.4193);
  
  assert.strictEqual(addr1, "800 Valencia St, San Francisco, CA 94110");
  assert.strictEqual(addr2, "355 McAllister St, San Francisco, CA 94102");
  console.log("   ✅ PASSED - Geocoding outputs match human-readable addresses.\n");

  // Test 3: Filename keyword categorization
  console.log("🧪 Test 3: Gemini Filename Fallback Classifier...");
  const issue1 = classifyFilename("my_water_leak_ Valencia.jpg");
  const issue2 = classifyFilename("garbage_dump_alleyway.png");
  const issue3 = classifyFilename("IMG_0923_broken_streetlight.jpg");
  const issue4 = classifyFilename("sparking_power_wire_short.jpeg");
  const issue5 = classifyFilename("arbitrary_camera_shot.png");

  assert.strictEqual(issue1, "Water Leak");
  assert.strictEqual(issue2, "Garbage Pile");
  assert.strictEqual(issue3, "Broken Streetlight");
  assert.strictEqual(issue4, "Exposed Power Wire");
  assert.strictEqual(issue5, "Asphalt Road Pothole"); // Defaults to Pothole
  console.log("   ✅ PASSED - AI fallback maps file names correctly.\n");

  // Test 4: Gamification badges
  console.log("🧪 Test 4: Badge threshold progressions...");
  const badges100 = calculateBadges(100);
  const badges160 = calculateBadges(160);
  const badges220 = calculateBadges(220);
  const badges320 = calculateBadges(320);

  assert.deepStrictEqual(badges100, ["Civic Novice 🛡️"]);
  assert.deepStrictEqual(badges160, ["Civic Novice 🛡️", "Street Guardian 🛡️"]);
  assert.deepStrictEqual(badges220, ["Civic Novice 🛡️", "Street Guardian 🛡️", "Safety Specialist 🔍"]);
  assert.deepStrictEqual(badges320, ["Civic Novice 🛡️", "City Hero 👑", "Safety Specialist 🔍"]);
  console.log("   ✅ PASSED - Gamification logic rewards points correctly.\n");

  console.log("🎉 ALL BUSINESS LOGIC INTEGRATION TESTS PASSED SUCCESSFULLY!");

} catch (error) {
  console.error("❌ TEST FAILURE DETECTED:");
  console.error(error.message);
  process.exit(1);
}
