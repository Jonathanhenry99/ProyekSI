import axios from "axios";
import authHeader from "./auth-header";

const API_URL = "http://localhost:8080/api/";

class MaterialTagService {
  // Get all course tags
  getAllMaterialTag() {
    return axios.get(API_URL + "material-tags", { headers: authHeader() });
  }

  // Create new course tag (admin only)
  createMaterialTag(tagData) {
    return axios.post(API_URL + "material-tags", tagData, { headers: authHeader() });
  }

  // Update course tag (admin only)
  updateMaterialTag(id, tagData) {
    return axios.put(API_URL + "material-tags/" + id, tagData, { headers: authHeader() });
  }

  // Delete course tag (admin only)
  deleteMaterialTag(id) {
    return axios.delete(API_URL + "material-tags/" + id, { headers: authHeader() });
  }
}

export default new MaterialTagService(); 