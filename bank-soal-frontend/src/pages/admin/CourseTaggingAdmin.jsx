import React, { useState, useEffect } from 'react';
import { Search, Plus, User, LogOut, Tag, BookOpen, Trash2, Save, X, AlertCircle, CheckCircle, ChevronRight, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom'; // Pastikan Link diimport
// Mock services - replace with actual service implementations
const CourseService = {
  getAllCourses: async () => {
    // Mock data based on database structure
    return {
      data: [
        { id: 1, name: 'Algoritma dan Pemrograman', code: 'IF001', description: 'Mata kuliah dasar pemrograman' },
        { id: 2, name: 'Struktur Data', code: 'IF002', description: 'Mata kuliah struktur data dan algoritma' },
        { id: 3, name: 'Basis Data', code: 'IF003', description: 'Mata kuliah sistem basis data' },
        { id: 4, name: 'Pemrograman Web', code: 'IF004', description: 'Mata kuliah pengembangan web' },
        { id: 5, name: 'Pemrograman Mobile', code: 'IF005', description: 'Mata kuliah pengembangan aplikasi mobile' }
      ]
    };
  }
};

const MaterialTagService = {
  getAllMaterialTag: async () => {
    return {
      data: [
        { id: 1, name: 'Array' },
        { id: 2, name: 'Linked List' },
        { id: 3, name: 'Stack' },
        { id: 4, name: 'Queue' },
        { id: 5, name: 'Tree' },
        { id: 6, name: 'Graph' },
        { id: 7, name: 'Sorting' },
        { id: 8, name: 'Searching' },
        { id: 9, name: 'Heap' },
        { id: 10, name: 'Greedy' },
        { id: 11, name: 'Dynamic Programming' },
        { id: 12, name: 'SQL' },
        { id: 13, name: 'NoSQL' },
        { id: 14, name: 'HTML' },
        { id: 15, name: 'CSS' },
        { id: 16, name: 'JavaScript' },
        { id: 17, name: 'React' },
        { id: 18, name: 'Node.js' }
      ]
    };
  }
};

const CourseTaggingService = {
  getCourseMaterialTags: async (courseId) => {
    // Mock data - replace with actual API call
    const mockData = {
      1: [1, 2, 7, 8], // Algoritma dan Pemrograman: Array, Linked List, Sorting, Searching
      2: [1, 2, 3, 4, 5, 6, 9], // Struktur Data: Array, Linked List, Stack, Queue, Tree, Graph, Heap
      3: [12, 13], // Basis Data: SQL, NoSQL
      4: [14, 15, 16, 17, 18], // Pemrograman Web: HTML, CSS, JavaScript, React, Node.js
      5: [16, 17] // Pemrograman Mobile: JavaScript, React
    };
    return { data: mockData[courseId] || [] };
  },
  
  addMaterialTagToCourse: async (courseId, materialTagId) => {
    // Mock implementation
    return { success: true };
  },
  
  removeMaterialTagFromCourse: async (courseId, materialTagId) => {
    // Mock implementation
    return { success: true };
  }
};

const AuthService = {
  logout: () => {
    // Mock logout
    localStorage.removeItem('token');
  }
};

const CourseTaggingAdmin = ({ currentUser }) => {
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
  const [currentView, setCurrentView] = useState('courses'); // 'courses' or 'tags'

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

  const fetchInitialData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [coursesResponse, materialTagsResponse] = await Promise.all([
        CourseService.getAllCourses(),
        MaterialTagService.getAllMaterialTag()
      ]);
      setCoursesList(coursesResponse.data);
      setMaterialTagsList(materialTagsResponse.data);
    } catch (err) {
      console.error("Error fetching initial data:", err);
      const errorMessage = err.response?.data?.message || 'Gagal memuat data. Silakan coba lagi.';
      setError(errorMessage);
      showNotification(errorMessage, 'error');
      
      if (err.response?.status === 401 || err.response?.status === 403) {
        AuthService.logout();
        console.log('User unauthorized - redirecting to login');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCourseTags = async () => {
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
      const errorMessage = err.response?.data?.message || 'Gagal memuat tag mata kuliah.';
      setError(errorMessage);
      showNotification(errorMessage, 'error');
      
      if (err.response?.status === 401 || err.response?.status === 403) {
        AuthService.logout();
        console.log('User unauthorized - redirecting to login');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleCourseSelect = (course) => {
    setSelectedCourse(course);
    setCurrentView('tags');
  };

  const handleAddTag = async (materialTagId) => {
    if (!selectedCourse) return;
    
    try {
      await CourseTaggingService.addMaterialTagToCourse(selectedCourse.id, materialTagId);
      showNotification('Tag berhasil ditambahkan ke mata kuliah', 'success');
      setShowAddTagModal(false);
      fetchCourseTags(); // Refresh tags
    } catch (err) {
      console.error("Error adding tag:", err);
      const errorMessage = err.response?.data?.message || 'Gagal menambahkan tag.';
      showNotification(errorMessage, 'error');
    }
  };

  const handleRemoveTag = async (materialTagId) => {
    if (!selectedCourse) return;
    
    try {
      await CourseTaggingService.removeMaterialTagFromCourse(selectedCourse.id, materialTagId);
      showNotification('Tag berhasil dihapus dari mata kuliah', 'success');
      fetchCourseTags(); // Refresh tags
    } catch (err) {
      console.error("Error removing tag:", err);
      const errorMessage = err.response?.data?.message || 'Gagal menghapus tag.';
      showNotification(errorMessage, 'error');
    }
  };

  const handleLogout = () => {
    AuthService.logout();
    // In a real app, this would redirect to login page
    console.log('User logged out');
  };

  const handleBackToCourses = () => {
    setSelectedCourse(null);
    setCurrentView('courses');
    setCourseTags([]);
    setAvailableTags([]);
  };

  // Filter courses or tags based on search term
  const filteredCourses = coursesList.filter(course =>
    course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredCourseTags = courseTags.filter(tag =>
    tag.name.toLowerCase().includes(searchTerm.toLowerCase())
  );



const Header = () => (
  <header className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-40">
    <div className="max-w-7xl mx-auto px-6 py-4">
      <div className="grid grid-cols-3 items-center">
        <div className="flex items-center space-x-3">
          <img
            src="/src/assets/LogoIF.jpg"
            alt="Logo Informatika UNPAR"
            className="h-10 w-auto"
          />
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
                    <p className="text-2xl font-bold text-green-900">{materialTagsList.length}</p>
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
                    <p className="text-2xl font-bold text-purple-900">
                      {coursesList.length > 0 ? Math.round((materialTagsList.length / coursesList.length) * 10) / 10 : 0}
                    </p>
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
              {isLoading ? (
                Array.from({ length: 6 }).map((_, index) => (
                  <div key={index} className="bg-white rounded-xl p-6 border border-slate-200 animate-pulse">
                    <div className="h-6 bg-gray-200 rounded mb-3"></div>
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  </div>
                ))
              ) : filteredCourses.length === 0 ? (
                <div className="col-span-full text-center py-12">
                  <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Tidak ada mata kuliah yang ditemukan</p>
                </div>
              ) : (
                filteredCourses.map((course) => (
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
                    <p className="text-sm text-gray-500 line-clamp-2">{course.description}</p>
                  </div>
                ))
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
                  <p>Belum ada tag materi untuk mata kuliah ini</p>
                  <button
                    onClick={() => setShowAddTagModal(true)}
                    className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Tambah tag pertama
                  </button>
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