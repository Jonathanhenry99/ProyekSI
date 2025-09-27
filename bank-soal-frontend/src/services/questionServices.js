import axios from 'axios';

const API_URL = 'http://localhost:8080/api';

// Ambil semua questions
export const getAllQuestions = async () => {
  const response = await axios.get(`${API_URL}/questions`);
  return response.data;
};

// Search questions dengan filter
export const searchQuestions = async (params) => {
  const response = await axios.get(`${API_URL}/questions/search`, { params });
  return response.data;
};

// Ambil course tags
export const getCourseTags = async () => {
  const response = await axios.get(`${API_URL}/course-tags`);
  return response.data;
};

// Ambil material tags
export const getMaterialTags = async () => {
  const response = await axios.get(`${API_URL}/material-tags`);
  return response.data;
};