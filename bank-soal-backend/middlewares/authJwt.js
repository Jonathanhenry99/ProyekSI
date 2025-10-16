const jwt = require("jsonwebtoken");
const config = require("../config/auth.config.js");
const db = require("../models");
const User = db.user;

verifyToken = (req, res, next) => {
  console.log("=== AUTH MIDDLEWARE DEBUG ===");
  console.log("Headers received:", req.headers);
  
  // Support multiple token header formats
  let token = req.headers["x-access-token"] || req.headers["authorization"];

  console.log("Raw token from headers:", token);

  if (!token) {
    console.log("❌ No token provided in x-access-token or authorization headers");
    return res.status(403).send({
      message: "No token provided!"
    });
  }

  // Remove 'Bearer ' prefix if present in Authorization header
  if (token.startsWith('Bearer ')) {
    token = token.slice(7, token.length).trim();
    console.log("Token after removing Bearer prefix:", token.substring(0, 20) + "...");
  }

  jwt.verify(token, config.secret, (err, decoded) => {
    if (err) {
      console.log("❌ Token verification failed:", err.message);
      console.log("Token used for verification:", token.substring(0, 20) + "...");
      console.log("Secret length:", config.secret?.length);
      return res.status(401).send({
        message: "Unauthorized! Token invalid or expired."
      });
    }
    
    console.log("✅ Token decoded successfully:", {
      id: decoded.id,
      username: decoded.username,
      role: decoded.role
    });
    
    req.userId = decoded.id;
    req.userRole = decoded.role; // Add this line to set userRole
    req.username = decoded.username;
    
    console.log("Request user info set:", {
      userId: req.userId,
      userRole: req.userRole,
      username: req.username
    });
    console.log("=== END AUTH MIDDLEWARE DEBUG ===");
    
    next();
  });
};

isAdmin = async (req, res, next) => {
  try {
    console.log("=== CHECKING ADMIN ROLE ===");
    console.log("User ID from request:", req.userId);
    
    const user = await User.findByPk(req.userId);
    
    if (!user) {
      console.log("❌ User not found in database");
      return res.status(404).send({
        message: "User not found!"
      });
    }
    
    console.log("User role from database:", user.role);
    
    if (user.role === "ROLE_ADMIN") {
      console.log("✅ User is admin, proceeding");
      return next();
    }

    console.log("❌ User is not admin");
    return res.status(403).send({
      message: "Require Admin Role!"
    });
  } catch (error) {
    console.error("Error validating user role:", error);
    return res.status(500).send({
      message: "Unable to validate user role!"
    });
  }
};

const authJwt = {
  verifyToken: verifyToken,
  isAdmin: isAdmin
};

module.exports = authJwt;