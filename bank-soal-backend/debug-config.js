// debug-config.js
// Jalankan dengan: node debug-config.js

console.log("=== DEBUGGING CONFIG ===");

// Test 1: Environment variables
require('dotenv').config();
console.log("1. Environment Variables:");
console.log("   NODE_ENV:", process.env.NODE_ENV);
console.log("   JWT_SECRET:", process.env.JWT_SECRET);
console.log("   JWT_SECRET length:", process.env.JWT_SECRET?.length);

// Test 2: Auth config
try {
  const config = require("./config/auth.config");
  console.log("2. Auth Config:");
  console.log("   Config object:", config);
  console.log("   Secret:", config.secret);
  console.log("   Secret length:", config.secret?.length);
  console.log("   JWT Expiration:", config.jwtExpiration);
} catch (error) {
  console.error("❌ Error loading auth config:", error.message);
}

// Test 3: JWT functionality
try {
  const jwt = require("jsonwebtoken");
  const config = require("./config/auth.config");
  
  console.log("3. JWT Test:");
  
  // Test payload
  const testPayload = {
    id: 4,
    username: "test_user",
    email: "test@example.com",
    role: "dosen"
  };
  
  console.log("   Test payload:", testPayload);
  console.log("   Using secret:", config.secret);
  
  // Generate token
  const token = jwt.sign(testPayload, config.secret, { expiresIn: '1h' });
  console.log("   ✅ Token generated successfully");
  console.log("   Token preview:", token.substring(0, 50) + "...");
  
  // Verify token immediately
  const decoded = jwt.verify(token, config.secret);
  console.log("   ✅ Token verified successfully");
  console.log("   Decoded payload:", decoded);
  
} catch (error) {
  console.error("   ❌ JWT test failed:", error.message);
  console.error("   Error details:", error);
}

// Test 4: Check existing token (jika ada)
console.log("4. Token Analysis:");
console.log("   Jika Anda punya token yang bermasalah, decode dulu tanpa verify:");

// Contoh decode token tanpa verify untuk melihat payload
const sampleToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NCwicm9sZSI6ImRvc2VuIiwiaWF0IjoxNzYwNDQ3NzAwLCJleHAiOjE3NjA1MzQxMDB9.OANtcgNBEqdjsLovZN-0vFYh5h69CWYdRXwx8jZJBSI";

try {
  const jwt = require("jsonwebtoken");
  const decodedWithoutVerify = jwt.decode(sampleToken);
  console.log("   Sample token payload (decoded without verify):", decodedWithoutVerify);
  
  // Coba verify dengan secret yang berbeda
  const config = require("./config/auth.config");
  console.log("   Trying to verify with current secret...");
  const verified = jwt.verify(sampleToken, config.secret);
  console.log("   ✅ Sample token verified with current secret");
} catch (error) {
  console.log("   ❌ Sample token verification failed:", error.message);
  console.log("   This is expected if token was generated with different secret");
}

console.log("=== END DEBUG ===");