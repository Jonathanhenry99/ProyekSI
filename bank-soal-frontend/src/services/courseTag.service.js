import axios from "axios";
import authHeader from "./auth-header";

const API_URL = "http://localhost:8080/api/";

class CourseTagService {
  // Get all course tags
  getAllCourseTags() {
    return axios.get(API_URL + "course-tags", { headers: authHeader() });
  }

  // Create new course tag (admin only)
  createCourseTag(tagData) {
    return axios.post(API_URL + "course-tags", tagData, { headers: authHeader() });
  }

  // Update course tag (admin only)
  updateCourseTag(id, tagData) {
    return axios.put(API_URL + "course-tags/" + id, tagData, { headers: authHeader() });
  }

  // Delete course tag (admin only)
  deleteCourseTag(id) {
    return axios.delete(API_URL + "course-tags/" + id, { headers: authHeader() });
  }
}

export default new CourseTagService(); 