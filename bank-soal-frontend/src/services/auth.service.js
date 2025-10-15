import axios from "axios";

const API_URL = "http://localhost:8080/api/auth/";

class AuthService {
  login(email, password) {
    console.log("Attempting login with:", { email, password: "***" });
    return axios
      .post(API_URL + "signin", {
        email,
        password
      })
      .then(response => {
        console.log("Login response:", response.data);
        if (response.data.accessToken) {
          // ✅ FIX: Store both user data and token separately
          localStorage.setItem("user", JSON.stringify(response.data));
          localStorage.setItem("token", response.data.accessToken); // ✅ ADD THIS
          
          console.log("✅ Token stored successfully:", response.data.accessToken.substring(0, 20) + "...");
        }
        return response.data;
      })
      .catch(error => {
        console.error("❌ Login failed:", error.response?.data || error.message);
        throw error;
      });
  }

  logout() {
    // ✅ FIX: Clear both user and token
    localStorage.removeItem("user");
    localStorage.removeItem("token"); // ✅ ADD THIS
    console.log("✅ User logged out, storage cleared");
  }

  getCurrentUser() {
    return JSON.parse(localStorage.getItem("user"));
  }

  // ✅ ADD: Helper method to get token
  getToken() {
    // Try to get token directly first
    let token = localStorage.getItem("token");
    
    // If no direct token, try to extract from user object
    if (!token) {
      const user = this.getCurrentUser();
      token = user?.accessToken;
    }
    
    return token;
  }

  // ✅ ADD: Check if user is authenticated
  isAuthenticated() {
    const token = this.getToken();
    const user = this.getCurrentUser();
    
    return !!(token && user);
  }

  // ✅ ADD: Get user role
  getUserRole() {
    const user = this.getCurrentUser();
    return user?.role;
  }

  // ✅ ADD: Check if user has specific role
  hasRole(role) {
    return this.getUserRole() === role;
  }

  // ✅ ADD: Check if user is admin
  isAdmin() {
    return this.hasRole("ROLE_ADMIN");
  }

  // ✅ ADD: Check if user is dosen
  isDosen() {
    return this.hasRole("dosen") || this.hasRole("ROLE_DOSEN");
  }
}

export default new AuthService();