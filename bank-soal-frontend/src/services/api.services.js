import axios from "axios";
import AuthService from "./auth.service";

const API_BASE_URL = "http://localhost:8080/api";

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
});

// Request interceptor - auto attach token
api.interceptors.request.use(
  (config) => {
    const token = AuthService.getToken();
    
    if (token) {
      config.headers['x-access-token'] = token;
      console.log('🔑 Token attached to:', config.method?.toUpperCase(), config.url);
    } else {
      console.warn('⚠️ No token available for:', config.method?.toUpperCase(), config.url);
    }
    
    return config;
  },
  (error) => {
    console.error('❌ Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor - handle auth errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      console.log('❌ 401 Unauthorized - Token invalid or expired');
      
      // Auto logout on 401
      AuthService.logout();
      
      // Redirect to login (adjust sesuai routing app Anda)
      window.location.href = '/login';
    }
    
    console.error('❌ API Error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      message: error.response?.data?.message || error.message
    });
    
    return Promise.reject(error);
  }
);

// API Service Class
class ApiService {
  // Course Tags
  async getCourseTags() {
    try {
      console.log('📡 Fetching course tags...');
      const response = await api.get('/course-tags/');
      console.log('✅ Course tags fetched:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Failed to fetch course tags:', error);
      throw error;
    }
  }

  async createCourseTag(tagData) {
    try {
      console.log('📡 Creating course tag:', tagData);
      const response = await api.post('/course-tags/', tagData);
      console.log('✅ Course tag created:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Failed to create course tag:', error);
      throw error;
    }
  }

  async updateCourseTag(tagId, tagData) {
    try {
      console.log('📡 Updating course tag:', tagId, tagData);
      const response = await api.put(`/course-tags/${tagId}`, tagData);
      console.log('✅ Course tag updated:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Failed to update course tag:', error);
      throw error;
    }
  }

  async deleteCourseTag(tagId) {
    try {
      console.log('📡 Deleting course tag:', tagId);
      const response = await api.delete(`/course-tags/${tagId}`);
      console.log('✅ Course tag deleted');
      return response.data;
    } catch (error) {
      console.error('❌ Failed to delete course tag:', error);
      throw error;
    }
  }

  // Users
  async getUsers() {
    try {
      console.log('📡 Fetching users...');
      const response = await api.get('/users/');
      console.log('✅ Users fetched:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Failed to fetch users:', error);
      throw error;
    }
  }

  // Courses
  async getCourses() {
    try {
      console.log('📡 Fetching courses...');
      const response = await api.get('/courses/');
      console.log('✅ Courses fetched:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Failed to fetch courses:', error);
      throw error;
    }
  }

  // Generic methods
  async get(endpoint) {
    try {
      console.log('📡 GET:', endpoint);
      const response = await api.get(endpoint);
      console.log('✅ GET success:', endpoint, response.data);
      return response.data;
    } catch (error) {
      console.error('❌ GET failed:', endpoint, error);
      throw error;
    }
  }

  async post(endpoint, data) {
    try {
      console.log('📡 POST:', endpoint, data);
      const response = await api.post(endpoint, data);
      console.log('✅ POST success:', endpoint, response.data);
      return response.data;
    } catch (error) {
      console.error('❌ POST failed:', endpoint, error);
      throw error;
    }
  }

  async put(endpoint, data) {
    try {
      console.log('📡 PUT:', endpoint, data);
      const response = await api.put(endpoint, data);
      console.log('✅ PUT success:', endpoint, response.data);
      return response.data;
    } catch (error) {
      console.error('❌ PUT failed:', endpoint, error);
      throw error;
    }
  }

  async delete(endpoint) {
    try {
      console.log('📡 DELETE:', endpoint);
      const response = await api.delete(endpoint);
      console.log('✅ DELETE success:', endpoint);
      return response.data;
    } catch (error) {
      console.error('❌ DELETE failed:', endpoint, error);
      throw error;
    }
  }
}

export default new ApiService();