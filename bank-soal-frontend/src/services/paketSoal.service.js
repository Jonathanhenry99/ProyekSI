import axios from "axios";

const API_URL = "http://localhost:8080/api";

class PaketSoalService {
  create(data) {
    return axios.post(`${API_URL}/paketsoal`, data);
  }

  getAll() {
    return axios.get(`${API_URL}/paketsoal`);
  }

  getById(id) {
    return axios.get(`${API_URL}/paketsoal/${id}`);
  }
}

export default new PaketSoalService();
