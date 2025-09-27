import React, { useState, useEffect, useCallback } from 'react';
import { Search, Plus, User, LogOut, Tag, BookOpen, Trash2, X, AlertCircle, CheckCircle, ChevronRight, ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import AuthService from '../../services/auth.service';

const API_URL = "http://localhost:8080/api";

// Service untuk mengambil course data
const CourseService = {
  getAllCourses: async () => {
    const user = JSON.parse(localStorage.getItem('user'));
    const headers = user?.accessToken ? { 'x-access-token': user.accessToken } : {};
    
    try {
      const response = await axios.get(`${API_URL}/course-tags`, { headers });
      const data = response.data;
      
      return {
        data: data.map(course => ({
          id: course.id,
          name: course.name,
          code: `CS${course.id.toString().padStart(3, '0')}`,
          description: `Mata kuliah ${course.name.toLowerCase()}`
        }))
      };
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch course tags');
    }
  }
};

// Service untuk mengambil material tags global
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

// Service untuk assignment system menggunakan junction table
const CourseAssignmentService = {
  // Get assigned materials for a course
  getAssignedMaterials: async (courseId) => {
    const user = JSON.parse(localStorage.getItem('user'));
    const headers = user?.accessToken ? { 'x-access-token': user.accessToken } : {};
    
    try {
      const response = await axios.get(`${API_URL}/course-material-assignments/course/${courseId}/assigned-materials`, { headers });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch assigned materials');
    }
  },

  // Get unassigned materials for a course
  getUnassignedMaterials: async (courseId) => {
    const user = JSON.parse(localStorage.getItem('user'));
    const headers = user?.accessToken ? { 'x-access-token': user.accessToken } : {};
    
    try {
      const response = await axios.get(`${API_URL}/course-material-assignments/course/${courseId}/unassigned-materials`, { headers });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch unassigned materials');
    }
  },

  // Assign materials to course
  assignMaterials: async (courseId, materialTagIds) => {
    const user = JSON.parse(localStorage.getItem('user'));
    const headers = {
      'Content-Type': 'application/json',
      ...(user?.accessToken ? { 'x-access-token': user.accessToken } : {})
    };
    
    try {
      const response = await axios.post(`${API_URL}/course-material-assignments/course/${courseId}/assign-materials`, 
        { materialTagIds }, 
        { headers }
      );
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to assign materials');
    }
  },

  // Remove material assignment
  removeMaterialAssignment: async (courseId, materialId) => {
    const user = JSON.parse(localStorage.getItem('user'));
    const headers = user?.accessToken ? { 'x-access-token': user.accessToken } : {};
    
    try {
      const response = await axios.delete(`${API_URL}/course-material-assignments/course/${courseId}/material/${materialId}`, { headers });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to remove material assignment');
    }
  },

  // Get assignment statistics
  getStatistics: async () => {
    const user = JSON.parse(localStorage.getItem('user'));
    const headers = user?.accessToken ? { 'x-access-token': user.accessToken } : {};
    
    try {
      const response = await axios.get(`${API_URL}/course-material-assignments/statistics`, { headers });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch statistics');
    }
  },

  // Get all assignments overview
  getAllAssignments: async () => {
    const user = JSON.parse(localStorage.getItem('user'));
    const headers = user?.accessToken ? { 'x-access-token': user.accessToken } : {};
    
    try {
      const response = await axios.get(`${API_URL}/course-material-assignments/assignments`, { headers });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch assignments overview');
    }
  }
};

const CourseTaggingAdmin = ({ currentUser }) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [coursesList, setCoursesList] = useState([]);
  const [materialTagsList, setMaterialTagsList] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [assignedMaterials, setAssignedMaterials] = useState([]);
  const [unassignedMaterials, setUnassignedMaterials] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedMaterialsForAssign, setSelectedMaterialsForAssign] = useState([]);
  const [currentView, setCurrentView] = useState('courses');
  const [statistics, setStatistics] = useState({});
  const [assignmentsOverview, setAssignmentsOverview] = useState([]);
  const [saving, setSaving] = useState(false);

  // Fetch initial data
  useEffect(() => {
    fetchInitialData();
  }, []);

  // Fetch course assignments when course is selected
  useEffect(() => {
    if (selectedCourse) {
      fetchCourseAssignments();
    }
  }, [selectedCourse]);

  const fetchInitialData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [coursesResponse, materialTagsResponse] = await Promise.all([
        CourseService.getAllCourses(),
        MaterialTagService.getAllMaterialTag()
      ]);
      
      setCoursesList(coursesResponse.data);
      setMaterialTagsList(materialTagsResponse.data);

      // Load statistics separately to avoid blocking
      try {
        const [statsResponse, assignmentsResponse] = await Promise.all([
          CourseAssignmentService.getStatistics(),
          CourseAssignmentService.getAllAssignments()
        ]);
        setStatistics(statsResponse.data || {});
        setAssignmentsOverview(assignmentsResponse.data || []);
      } catch (statsError) {
        console.warn('Could not load statistics:', statsError);
        setStatistics({});
        setAssignmentsOverview([]);
      }
      
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

  const fetchCourseAssignments = useCallback(async () => {
    if (!selectedCourse) return;
    
    setIsLoading(true);
    try {
      const [assignedResponse, unassignedResponse] = await Promise.all([
        CourseAssignmentService.getAssignedMaterials(selectedCourse.id),
        CourseAssignmentService.getUnassignedMaterials(selectedCourse.id)
      ]);
      
      setAssignedMaterials(assignedResponse.data);
      setUnassignedMaterials(unassignedResponse.data);
    } catch (err) {
      console.error("Error fetching course assignments:", err);
      const errorMessage = err.message || 'Gagal memuat assignment mata kuliah.';
      setError(errorMessage);
      showNotification(errorMessage, 'error');
    } finally {
      setIsLoading(false);
    }
  }, [selectedCourse]);

  const showNotification = useCallback((message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  }, []);

  const handleCourseSelect = useCallback((course) => {
    setSelectedCourse(course);
    setCurrentView('assignments');
    setSearchTerm('');
  }, []);

  const handleAssignMaterials = useCallback(async () => {
    if (!selectedCourse || selectedMaterialsForAssign.length === 0) return;
    
    setSaving(true);
    try {
      const response = await CourseAssignmentService.assignMaterials(selectedCourse.id, selectedMaterialsForAssign);
      showNotification(`${response.data.inserted.length} materi berhasil ditugaskan`, 'success');
      setShowAssignModal(false);
      setSelectedMaterialsForAssign([]);
      fetchCourseAssignments();
      fetchInitialData(); // Refresh overview data
    } catch (err) {
      console.error("Error assigning materials:", err);
      const errorMessage = err.message || 'Gagal menugaskan materi.';
      showNotification(errorMessage, 'error');
    } finally {
      setSaving(false);
    }
  }, [selectedCourse, selectedMaterialsForAssign, fetchCourseAssignments, fetchInitialData, showNotification]);

  const handleRemoveMaterial = useCallback(async (materialId) => {
    if (!selectedCourse) return;
    
    // Enhanced confirmation dialog
    const isConfirmed = window.confirm(
      '🗑️ Apakah Anda yakin ingin menghapus assignment materi ini?\n\n' +
      '⚠️ Tindakan ini tidak dapat dibatalkan.'
    );
    
    if (!isConfirmed) return;
    
    // Show loading notification
    const loadingToast = showNotification('⏳ Menghapus assignment materi...', 'loading');
    
    try {
      await CourseAssignmentService.removeMaterialAssignment(selectedCourse.id, materialId);
      
      // Hide loading notification
      if (loadingToast && typeof loadingToast.dismiss === 'function') {
        loadingToast.dismiss();
      }
      
      // Enhanced success notification
      showNotification(
        '✅ Berhasil! Assignment materi telah dihapus dari kursus',
        'success',
        {
          duration: 4000,
          position: 'top-right',
          showCloseButton: true
        }
      );
      
      fetchCourseAssignments();
      fetchInitialData(); // Refresh overview data
      
    } catch (err) {
      console.error("Error removing material assignment:", err);
      
      // Hide loading notification
      if (loadingToast && typeof loadingToast.dismiss === 'function') {
        loadingToast.dismiss();
      }
      
      // Enhanced error notification with more context
      const errorMessage = err.response?.data?.message || 
                          err.message || 
                          'Terjadi kesalahan saat menghapus assignment materi';
      
      showNotification(
        `❌ Gagal Menghapus: ${errorMessage}`,
        'error',
        {
          duration: 6000,
          position: 'top-right',
          showCloseButton: true,
          actions: [
            {
              label: '🔄 Coba Lagi',
              onClick: () => handleRemoveMaterial(materialId)
            }
          ]
        }
      );
    }
  }, [selectedCourse, fetchCourseAssignments, fetchInitialData, showNotification]);

  const handleLogout = useCallback(() => {
    AuthService.logout();
    navigate('/login');
  }, [navigate]);

  const handleBackToCourses = useCallback(() => {
    setSelectedCourse(null);
    setCurrentView('courses');
    setAssignedMaterials([]);
    setUnassignedMaterials([]);
    setSearchTerm('');
  }, []);

  const toggleMaterialSelection = useCallback((materialId) => {
    setSelectedMaterialsForAssign(prev => {
      if (prev.includes(materialId)) {
        return prev.filter(id => id !== materialId);
      } else {
        return [...prev, materialId];
      }
    });
  }, []);

  // Filter functions
  const filteredCourses = coursesList.filter(course =>
    course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredAssignedMaterials = assignedMaterials.filter(material =>
    material.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const Header = () => (
    <header className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="grid grid-cols-3 items-center">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <span className="font-bold text-gray-900">Course Assignment Manager</span>
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
              Assignment Materi
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

  // Assign Materials Modal
  const AssignMaterialsModal = () => {
    if (!showAssignModal) return null;
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">
              Tugaskan Materi ke {selectedCourse?.name}
            </h3>
            <button
              onClick={() => {
                setShowAssignModal(false);
                setSelectedMaterialsForAssign([]);
              }}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="mb-4">
            <p className="text-sm text-gray-600">
              Pilih materi yang ingin ditugaskan ke mata kuliah ini:
            </p>
          </div>
          
          <div className="flex-1 overflow-y-auto mb-4">
            {unassignedMaterials.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                Semua materi sudah ditugaskan ke mata kuliah ini
              </p>
            ) : (
              <div className="space-y-2">
                {unassignedMaterials.map((material) => (
                  <label
                    key={material.id}
                    className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedMaterialsForAssign.includes(material.id)}
                      onChange={() => toggleMaterialSelection(material.id)}
                      className="mr-3 rounded"
                    />
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                        <Tag className="w-4 h-4 text-white" />
                      </div>
                      <span className="font-medium text-gray-900">{material.name}</span>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>
          
          {selectedMaterialsForAssign.length > 0 && (
            <div className="mb-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                {selectedMaterialsForAssign.length} materi dipilih untuk ditugaskan
              </p>
            </div>
          )}
          
          <div className="flex gap-3">
            <button
              onClick={handleAssignMaterials}
              disabled={saving || selectedMaterialsForAssign.length === 0}
              className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Menyimpan...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Tugaskan ({selectedMaterialsForAssign.length})
                </>
              )}
            </button>
            <button
              onClick={() => {
                setShowAssignModal(false);
                setSelectedMaterialsForAssign([]);
              }}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Batal
            </button>
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
      <AssignMaterialsModal />
      
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
            {currentView === 'courses' ? 'Manajemen Assignment Materi' : `Assignment Materi - ${selectedCourse?.name}`}
          </h2>
          <p className="text-gray-600">
            {currentView === 'courses' 
              ? 'Kelola assignment materi untuk setiap mata kuliah' 
              : 'Kelola materi yang ditugaskan untuk mata kuliah ini'
            }
          </p>
        </div>

        {/* Course Selection View */}
        {currentView === 'courses' && (
          <>
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-600 text-sm font-medium">Total Mata Kuliah</p>
                    <p className="text-2xl font-bold text-blue-900">{statistics.total_courses || 0}</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                    <BookOpen className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl border border-green-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-600 text-sm font-medium">Total Materi</p>
                    <p className="text-2xl font-bold text-green-900">{statistics.total_materials || 0}</p>
                  </div>
                  <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
                    <Tag className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl border border-purple-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-600 text-sm font-medium">Total Assignment</p>
                    <p className="text-2xl font-bold text-purple-900">{statistics.total_assignments || 0}</p>
                  </div>
                  <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center">
                    <Tag className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-xl border border-orange-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-600 text-sm font-medium">Rata-rata per MK</p>
                    <p className="text-2xl font-bold text-orange-900">{statistics.avg_materials_per_course || 0}</p>
                  </div>
                  <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center">
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
                  const courseAssignment = assignmentsOverview.find(assignment => assignment.course_id === course.id);
                  const materialCount = courseAssignment ? parseInt(courseAssignment.material_count || 0) : 0;
                  
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
                        <span className="text-gray-500">{materialCount} materi assigned</span>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          materialCount > 0 
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {materialCount > 0 ? 'Configured' : 'Needs Setup'}
                        </span>
                      </div>
                      {courseAssignment && courseAssignment.materials && (
                        <div className="mt-2">
                          <p className="text-xs text-gray-500 truncate" title={courseAssignment.materials}>
                            {courseAssignment.materials}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </>
        )}

        {/* Course Assignment Management View */}
        {currentView === 'assignments' && selectedCourse && (
          <>
            {/* Back Button */}
            <div className="flex items-center justify-between mb-8">
              <button
                onClick={handleBackToCourses}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Kembali ke Daftar Mata Kuliah</span>
              </button>

              <button
                onClick={() => setShowAssignModal(true)}
                disabled={unassignedMaterials.length === 0}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-6 py-3 rounded-xl font-medium flex items-center space-x-2 transition-all transform hover:scale-105 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                <Plus className="w-5 h-5" />
                <span>Tugaskan Materi</span>
              </button>
            </div>

            {/* Search */}
            <div className="mb-8">
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Cari materi..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Assigned Materials */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="px-6 py-4 bg-slate-50 border-b border-slate-200">
                <h3 className="text-lg font-semibold text-slate-800">
                  Materi yang Ditugaskan ke {selectedCourse.name}
                </h3>
                <p className="text-sm text-slate-600 mt-1">
                  Total: {filteredAssignedMaterials.length} materi
                </p>
              </div>

              {isLoading ? (
                <div className="p-6 text-center text-gray-600">
                  <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                  Memuat assignment materi...
                </div>
              ) : filteredAssignedMaterials.length === 0 ? (
                <div className="p-6 text-center text-gray-500">
                  <Tag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p>
                    {searchTerm 
                      ? 'Tidak ada materi assigned yang ditemukan' 
                      : 'Belum ada materi yang ditugaskan untuk mata kuliah ini'
                    }
                  </p>
                  {!searchTerm && unassignedMaterials.length > 0 && (
                    <button
                      onClick={() => setShowAssignModal(true)}
                      className="mt-4 text-green-600 hover:text-green-700 font-medium"
                    >
                      Tugaskan materi pertama
                    </button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
                  {filteredAssignedMaterials.map((material) => (
                    <div 
                      key={material.id} 
                      className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4 group hover:shadow-md transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                            <Tag className="w-4 h-4 text-white" />
                          </div>
                          <div>
                            <span className="font-medium text-gray-900 block">{material.name}</span>
                            <span className="text-xs text-gray-500">
                              Assigned: {new Date(material.assigned_at).toLocaleDateString('id-ID')}
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => handleRemoveMaterial(material.id)}
                          className="opacity-0 group-hover:opacity-100 p-1 text-red-500 hover:text-red-700 transition-all"
                          title="Hapus assignment"
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