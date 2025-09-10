import React, { useState, useEffect, useCallback } from 'react';
import { Search, Plus, User, LogOut, Tag, BookOpen, Trash2, Save, X, AlertCircle, CheckCircle, ChevronRight, ArrowLeft } from 'lucide-react';
import { BrowserRouter as Router, Link, useNavigate } from 'react-router-dom';
import axios from 'axios'; // Menggunakan Axios untuk permintaan HTTP
import AuthService from '../../services/auth.service'; // Assuming this path is correct

const API_URL = "http://localhost:8080/api";

// Updated Services to work with real database API using axios
const CourseService = {
  getAllCourses: async () => {
    const user = JSON.parse(localStorage.getItem('user'));
    const headers = user?.accessToken ? { 'x-access-token': user.accessToken } : {};
    
    try {
      const response = await axios.get(`${API_URL}/course-tags`, { headers });
      const data = response.data;
      
      // Transform course_tags to match expected format
      return {
        data: data.map(course => ({
          id: course.id,
          name: course.name,
          code: `CS${course.id.toString().padStart(3, '0')}`, // Generate code
          description: `Mata kuliah ${course.name.toLowerCase()}`
        }))
      };
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch course tags');
    }
  }
};

const MaterialTagService = {
  getAllMaterialTag: async () => {
    const user = JSON.parse(localStorage.getItem('user'));
    const headers = user?.accessToken ? { 'x-access-token': user.accessToken } : {};
    
    try {
      const response = await axios.get(`${API_URL}/material-tags`, { headers });
      return { data: response.data };
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch material tags');
    }
  }
};

const CourseTaggingService = {
  getCourseMaterialTags: async (courseId) => {
    const user = JSON.parse(localStorage.getItem('user'));
    const headers = user?.accessToken ? { 'x-access-token': user.accessToken } : {};
    
    try {
      const response = await axios.get(`${API_URL}/material-tags/by-course/${courseId}`, { headers });
      const data = response.data;
      
      // Return array of material tag IDs for compatibility
      return { data: data.map(tag => tag.id) };
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch course material tags');
    }
  },
  
  addMaterialTagToCourse: async (courseId, materialTagId) => {
    const user = JSON.parse(localStorage.getItem('user'));
    const headers = {
      'Content-Type': 'application/json',
      ...(user?.accessToken ? { 'x-access-token': user.accessToken } : {})
    };
    
    try {
      await axios.put(`${API_URL}/material-tags/${materialTagId}/assign-course`, 
        { course_tag_id: courseId }, 
        { headers }
      );
      return { success: true };
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to assign material tag to course');
    }
  },
  
  removeMaterialTagFromCourse: async (courseId, materialTagId) => {
    const user = JSON.parse(localStorage.getItem('user'));
    const headers = {
      'Content-Type': 'application/json',
      ...(user?.accessToken ? { 'x-access-token': user.accessToken } : {})
    };
    
    try {
      await axios.put(`${API_URL}/material-tags/${materialTagId}/unassign-course`, 
        {}, 
        { headers }
      );
      return { success: true };
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to unassign material tag from course');
    }
  },

  // Get statistics
  getCourseStatistics: async () => {
    const user = JSON.parse(localStorage.getItem('user'));
    const headers = user?.accessToken ? { 'x-access-token': user.accessToken } : {};
    
    try {
      const response = await axios.get(`${API_URL}/course-material-stats`, { headers });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch course statistics');
    }
  }
};

const CourseTaggingAdmin = ({ currentUser }) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [coursesList, setCoursesList] = useState([]);
  const [materialTagsList, setMaterialTagsList] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [courseTags, setCourseTags] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState(null);
  const [showAddTagModal, setShowAddTagModal] = useState(false);
  const [availableTags, setAvailableTags] = useState([]);
  const [currentView, setCurrentView] = useState('courses');
  const [statistics, setStatistics] = useState([]);

  // Fetch initial data
  useEffect(() => {
    fetchInitialData();
  }, []);

  // Fetch tags when course is selected
  useEffect(() => {
    if (selectedCourse) {
      fetchCourseTags();
    }
  }, [selectedCourse]);

  const fetchInitialData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [coursesResponse, materialTagsResponse, statsResponse] = await Promise.all([
        CourseService.getAllCourses(),
        MaterialTagService.getAllMaterialTag(),
        CourseTaggingService.getCourseStatistics()
      ]);
      
      setCoursesList(coursesResponse.data);
      setMaterialTagsList(materialTagsResponse.data);
      setStatistics(statsResponse);
    } catch (err) {
      console.error("Error fetching initial data:", err);
      const errorMessage = err.message || 'Gagal memuat data. Silakan coba lagi.';
      setError(errorMessage);
      showNotification(errorMessage, 'error');
      
      if (err.message.includes('401') || err.message.includes('403') || err.message.includes('Unauthorized')) {
        AuthService.logout();
        navigate('/login');
      }
    } finally {
      setIsLoading(false);
    }
  }, [navigate]);

  const fetchCourseTags = useCallback(async () => {
    if (!selectedCourse) return;
    
    setIsLoading(true);
    try {
      const response = await CourseTaggingService.getCourseMaterialTags(selectedCourse.id);
      const tagIds = response.data;
      const courseMaterialTags = materialTagsList.filter(tag => tagIds.includes(tag.id));
      setCourseTags(courseMaterialTags);
      
      // Update available tags (exclude already assigned tags)
      const available = materialTagsList.filter(tag => !tagIds.includes(tag.id));
      setAvailableTags(available);
    } catch (err) {
      console.error("Error fetching course tags:", err);
      const errorMessage = err.message || 'Gagal memuat tag mata kuliah.';
      setError(errorMessage);
      showNotification(errorMessage, 'error');
      
      if (err.message.includes('401') || err.message.includes('403') || err.message.includes('Unauthorized')) {
        AuthService.logout();
        navigate('/login');
      }
    } finally {
      setIsLoading(false);
    }
  }, [selectedCourse, materialTagsList, navigate]);

  const showNotification = useCallback((message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  }, []);

  const handleCourseSelect = useCallback((course) => {
    setSelectedCourse(course);
    setCurrentView('tags');
    setSearchTerm(''); // Reset search when selecting course
  }, []);

  const handleAddTag = useCallback(async (materialTagId) => {
    if (!selectedCourse) return;
    
    try {
      await CourseTaggingService.addMaterialTagToCourse(selectedCourse.id, materialTagId);
      showNotification('Tag berhasil ditambahkan ke mata kuliah', 'success');
      setShowAddTagModal(false);
      fetchCourseTags(); // Refresh tags
    } catch (err) {
      console.error("Error adding tag:", err);
      const errorMessage = err.message || 'Gagal menambahkan tag.';
      showNotification(errorMessage, 'error');
    }
  }, [selectedCourse, fetchCourseTags, showNotification]);

  const handleRemoveTag = useCallback(async (materialTagId) => {
    if (!selectedCourse) return;
    
    if (!window.confirm('Yakin ingin menghapus tag ini dari mata kuliah?')) return;
    
    try {
      await CourseTaggingService.removeMaterialTagFromCourse(selectedCourse.id, materialTagId);
      showNotification('Tag berhasil dihapus dari mata kuliah', 'success');
      fetchCourseTags(); // Refresh tags
    } catch (err) {
      console.error("Error removing tag:", err);
      const errorMessage = err.message || 'Gagal menghapus tag.';
      showNotification(errorMessage, 'error');
    }
  }, [selectedCourse, fetchCourseTags, showNotification]);

  const handleLogout = useCallback(() => {
    AuthService.logout();
    navigate('/login');
  }, [navigate]);

  const handleBackToCourses = useCallback(() => {
    setSelectedCourse(null);
    setCurrentView('courses');
    setCourseTags([]);
    setAvailableTags([]);
    setSearchTerm(''); // Reset search
  }, []);

  // Filter courses or tags based on search term
  const filteredCourses = coursesList.filter(course =>
    course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredCourseTags = courseTags.filter(tag =>
    tag.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate statistics
  const totalMaterialTags = materialTagsList.length;
  const averageTagsPerCourse = coursesList.length > 0 ? 
    Math.round((statistics.reduce((sum, stat) => sum + parseInt(stat.material_count || 0), 0) / coursesList.length) * 10) / 10 : 0;

  const Header = () => (
    <header className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="grid grid-cols-3 items-center">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <span className="font-bold text-gray-900">Course Manager</span>
          </div>
          
          <nav className="flex justify-center space-x-8">
            <Link to="/admin/dosen" className="text-gray-600 hover:text-gray-900 transition-colors font-medium px-2 py-1">
              Dosen
            </Link>
            <Link to="/admin/mata-kuliah" className="text-gray-600 hover:text-gray-900 transition-colors font-medium px-2 py-1">
              Mata Kuliah
            </Link>
            <Link to="/admin/tagging" className="text-gray-600 hover:text-gray-900 transition-colors font-medium px-2 py-1">
              Tagging
            </Link>
            <Link to="/admin/course-tagging" className="text-blue-600 font-semibold relative px-2 py-1">
              Tagging Mata Kuliah
              <div className="absolute -bottom-4 left-0 right-0 h-0.5 bg-blue-600 rounded-full"></div>
            </Link>
          </nav>
            
          <div className="flex items-center justify-end space-x-4">
            <span className="text-gray-700 font-medium">{currentUser?.username || 'Admin'}</span>
            <div className="flex items-center space-x-2">
              <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              <button
                onClick={handleLogout}
                className="p-2 text-gray-500 hover:text-gray-700 transition-colors rounded-lg hover:bg-gray-100"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );

  // Notification Component
  const Notification = () => {
    if (!notification) return null;
    return (
      <div className="fixed top-4 right-4 z-50">
        <div className={`flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg border ${
          notification.type === 'success'
            ? 'bg-green-50 text-green-800 border-green-200'
            : 'bg-red-50 text-red-800 border-red-200'
        }`}>
          {notification.type === 'success' ? (
            <CheckCircle className="w-5 h-5" />
          ) : (
            <AlertCircle className="w-5 h-5" />
          )}
          <span className="font-medium">{notification.message}</span>
        </div>
      </div>
    );
  };

  // Add Tag Modal
  const AddTagModal = () => {
    if (!showAddTagModal) return null;
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 max-h-96 overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Tambah Tag ke {selectedCourse?.name}</h3>
            <button
              onClick={() => setShowAddTagModal(false)}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="space-y-2">
            {availableTags.length === 0 ? (
              <p className="text-gray-500 text-center py-4">Semua tag sudah ditambahkan ke mata kuliah ini</p>
            ) : (
              availableTags.map((tag) => (
                <button
                  key={tag.id}
                  onClick={() => handleAddTag(tag.id)}
                  className="w-full text-left px-4 py-3 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-900">{tag.name}</span>
                    <Plus className="w-4 h-4 text-gray-400" />
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      </div>
    );
  };

  if (isLoading && coursesList.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30">
      <Header />
      <Notification />
      <AddTagModal />
      
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center space-x-2 mb-6">
          <button
            onClick={handleBackToCourses}
            className={`text-sm font-medium ${currentView === 'courses' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'} transition-colors`}
          >
            Mata Kuliah
          </button>
          {selectedCourse && (
            <>
              <ChevronRight className="w-4 h-4 text-gray-400" />
              <span className="text-sm font-medium text-blue-600">{selectedCourse.name}</span>
            </>
          )}
        </div>

        {/* Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            {currentView === 'courses' ? 'Manajemen Tagging Mata Kuliah' : `Tag Materi - ${selectedCourse?.name}`}
          </h2>
          <p className="text-gray-600">
            {currentView === 'courses' 
              ? 'Pilih mata kuliah untuk mengelola tag materi' 
              : 'Kelola tag materi untuk mata kuliah ini'
            }
          </p>
        </div>

        {/* Course Selection View */}
        {currentView === 'courses' && (
          <>
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-600 text-sm font-medium">Total Mata Kuliah</p>
                    <p className="text-2xl font-bold text-blue-900">{coursesList.length}</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                    <BookOpen className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl border border-green-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-600 text-sm font-medium">Total Tag Materi</p>
                    <p className="text-2xl font-bold text-green-900">{totalMaterialTags}</p>
                  </div>
                  <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
                    <Tag className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl border border-purple-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-600 text-sm font-medium">Rata-rata Tag per MK</p>
                    <p className="text-2xl font-bold text-purple-900">{averageTagsPerCourse}</p>
                  </div>
                  <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center">
                    <Tag className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>
            </div>

            {/* Search */}
            <div className="mb-8">
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Cari mata kuliah..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Courses Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCourses.length === 0 ? (
                <div className="col-span-full text-center py-12">
                  <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">
                    {searchTerm ? 'Tidak ada mata kuliah yang ditemukan' : 'Belum ada mata kuliah'}
                  </p>
                </div>
              ) : (
                filteredCourses.map((course) => {
                  const courseStats = statistics.find(stat => stat.id === course.id);
                  const materialCount = courseStats ? parseInt(courseStats.material_count || 0) : 0;
                  const questionSetCount = courseStats ? parseInt(courseStats.question_set_count || 0) : 0;
                  
                  return (
                    <div
                      key={course.id}
                      onClick={() => handleCourseSelect(course)}
                      className="bg-white rounded-xl p-6 border border-slate-200 hover:border-blue-300 hover:shadow-lg transition-all cursor-pointer group"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                          <BookOpen className="w-6 h-6 text-white" />
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors" />
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-2">{course.name}</h3>
                      <p className="text-sm text-gray-600 mb-3">{course.code}</p>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">{materialCount} materi</span>
                        <span className="text-gray-500">{questionSetCount} soal</span>
                      </div>
                      <div className="mt-2">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          materialCount > 0 
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {materialCount > 0 ? 'Setup Complete' : 'Perlu Setup'}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </>
        )}

        {/* Course Tags Management View */}
        {currentView === 'tags' && selectedCourse && (
          <>
            {/* Back Button and Actions */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
              <button
                onClick={handleBackToCourses}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Kembali ke Daftar Mata Kuliah</span>
              </button>
              <button
                onClick={() => setShowAddTagModal(true)}
                disabled={availableTags.length === 0}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-xl font-medium flex items-center space-x-2 transition-all transform hover:scale-105 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                <Plus className="w-5 h-5" />
                <span>Tambah Tag</span>
              </button>
            </div>

            {/* Search Tags */}
            <div className="mb-8">
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Cari tag materi..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Tags List */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="px-6 py-4 bg-slate-50 border-b border-slate-200">
                <h3 className="text-lg font-semibold text-slate-800">Tag Materi {selectedCourse.name}</h3>
                <p className="text-sm text-slate-600 mt-1">Total: {filteredCourseTags.length} tag</p>
              </div>

              {isLoading ? (
                <div className="p-6 text-center text-gray-600">
                  <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                  Memuat tag materi...
                </div>
              ) : filteredCourseTags.length === 0 ? (
                <div className="p-6 text-center text-gray-500">
                  <Tag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p>{searchTerm ? 'Tidak ada tag yang ditemukan' : 'Belum ada tag materi untuk mata kuliah ini'}</p>
                  {!searchTerm && availableTags.length > 0 && (
                    <button
                      onClick={() => setShowAddTagModal(true)}
                      className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Tambah tag pertama
                    </button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
                  {filteredCourseTags.map((tag) => (
                    <div key={tag.id} className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-4 group hover:shadow-md transition-all">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                            <Tag className="w-4 h-4 text-white" />
                          </div>
                          <span className="font-medium text-gray-900">{tag.name}</span>
                        </div>
                        <button
                          onClick={() => handleRemoveTag(tag.id)}
                          className="opacity-0 group-hover:opacity-100 p-1 text-red-500 hover:text-red-700 transition-all"
                          title="Hapus tag"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default CourseTaggingAdmin;