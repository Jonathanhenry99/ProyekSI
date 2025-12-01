import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { Search, Filter, Download, User, Clock, Tag, Calendar, ArrowUpDown, X, CheckCircle, ChevronDown, FileText, BarChart2, Plus, Book, Check, Trash2, AlertTriangle, Info, CheckCircle2, XCircle } from 'lucide-react';
import Footer from '../components/Footer';
import Header from '../components/Header';
import { Link } from 'react-router-dom';
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API_URL = "http://localhost:8080/api";

const QuestionSetsPage = ({ currentUser }) => {
  const [activeTab, setActiveTab] = useState('semua');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState([]);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [viewMode, setViewMode] = useState('grid');
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // State untuk dropdown
  const [showLevelDropdown, setShowLevelDropdown] = useState(false);
  const [showCourseTagDropdown, setShowCourseTagDropdown] = useState(false);
  const [showMaterialTagDropdown, setShowMaterialTagDropdown] = useState(false);
  const [levelSearch, setLevelSearch] = useState('');
  const [courseTagSearch, setCourseTagSearch] = useState('');
  const [materialTagSearch, setMaterialTagSearch] = useState('');
  const [selectedCourseTags, setSelectedCourseTags] = useState([]);
  const [selectedMaterialTags, setSelectedMaterialTags] = useState([]);

  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);

  // State untuk dropdown data dari backend
  const [courseOptions, setCourseOptions] = useState([]);
  const [difficultyLevels, setDifficultyLevels] = useState([]);
  const [courseTags, setCourseTags] = useState([]);
  const [materialTags, setMaterialTags] = useState([]);
  const [dropdownLoading, setDropdownLoading] = useState(false);
  const [dropdownError, setDropdownError] = useState(null);

  // State untuk download progress
  const [downloadingItems, setDownloadingItems] = useState(new Set());

  // State untuk delete modal
  const [deleteModal, setDeleteModal] = useState({ show: false, packageId: null, packageTitle: '' });
  const [deleting, setDeleting] = useState(false);

  // State untuk overlay notification
  const [notification, setNotification] = useState({
    show: false,
    message: '',
    type: 'info' // 'success', 'error', 'warning', 'info'
  });

  // Helper function to get auth token
  const getAuthToken = () => {
    let token = localStorage.getItem('token') || sessionStorage.getItem('token');
    
    if (!token && currentUser?.accessToken) {
      token = currentUser.accessToken;
    }
    
    if (!token) {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          token = user.accessToken;
        } catch (e) {
          console.error('Error parsing user from localStorage:', e);
        }
      }
    }
    
    return token;
  };

  // Helper function to show notification overlay
  const showNotification = (message, type = 'info') => {
    setNotification({
      show: true,
      message: message,
      type: type
    });
    
    // Auto hide after 5 seconds for success/info, 7 seconds for error/warning
    const duration = (type === 'error' || type === 'warning') ? 7000 : 5000;
    setTimeout(() => {
      setNotification(prev => ({ ...prev, show: false }));
    }, duration);
  };

  // Fungsi untuk membuka modal konfirmasi delete
  const openDeleteModal = (e, packageId, packageTitle) => {
    e.stopPropagation(); // Prevent card click
    setDeleteModal({ show: true, packageId, packageTitle });
  };

  // Fungsi untuk menutup modal
  const closeDeleteModal = () => {
    setDeleteModal({ show: false, packageId: null, packageTitle: '' });
  };

  // Fungsi untuk delete paket soal
  const handleDeletePackage = async () => {
    if (!deleteModal.packageId) return;

    setDeleting(true);
    try {
      const token = getAuthToken();
      const res = await fetch(`${API_URL}/question-packages/${deleteModal.packageId}`, {
        method: 'DELETE',
        headers: { 
          "x-access-token": token,
          "Content-Type": "application/json"
        },
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Gagal menghapus paket soal');
      }

      // Update state untuk remove paket yang dihapus
      setPackages(prev => prev.filter(pkg => pkg.id !== deleteModal.packageId));

      closeDeleteModal();
      
      // Tampilkan notifikasi sukses
      showNotification('Paket soal berhasil dihapus!', 'success');

    } catch (err) {
      console.error("❌ Error deleting package:", err);
      showNotification(err.message || 'Gagal menghapus paket soal. Silakan coba lagi.', 'error');
    } finally {
      setDeleting(false);
    }
  };

  // Cek apakah user bisa delete (pembuat atau admin)
  const canDelete = (packageCreatorId) => {
    return currentUser && (
      currentUser.id === packageCreatorId || 
      currentUser.role === 'ROLE_ADMIN'
    );
  };

  // Function untuk download paket soal sebagai ZIP - menggunakan logika sama seperti Create.jsx
  const handleDownloadPackage = async (packageId, packageTitle) => {
    if (downloadingItems.has(packageId)) {
      return; // Prevent multiple downloads
    }

    try {
      setDownloadingItems(prev => new Set(prev).add(packageId));
      
      console.log(`🔄 Starting package download for ID: ${packageId}`);
      
      // Get package details with all question sets
      const response = await axios.get(`${API_URL}/question-packages/${packageId}`);
      const packageData = response.data;
      
      if (!packageData.items || packageData.items.length === 0) {
        showNotification('Paket soal kosong atau tidak memiliki soal', 'warning');
        setDownloadingItems(prev => {
          const newSet = new Set(prev);
          newSet.delete(packageId);
          return newSet;
        });
        return;
      }
      
      console.log(`📁 Found ${packageData.items.length} question sets to process`);
      
      // Collect all question set IDs from the package
      const questionSetIds = packageData.items
        .map(item => item.question?.id || item.question_id)
        .filter(id => id)
        .join(',');
      
      if (!questionSetIds) {
        showNotification('Tidak ada question set ID yang valid untuk diunduh', 'error');
        setDownloadingItems(prev => {
          const newSet = new Set(prev);
          newSet.delete(packageId);
          return newSet;
        });
        return;
      }
      
      // Clean package title untuk digunakan sebagai formTitle
      const cleanFormTitle = packageTitle.trim() === "" 
        ? "Paket_Tanpa_Judul" 
        : packageTitle.replace(/[^\w\s-]/g, '').trim().replace(/\s+/g, '_');
      
      // Use the same endpoint as Create.jsx
      const url = `${API_URL}/files/download-bundle?ids=${questionSetIds}&formTitle=${cleanFormTitle}`;
      
      // Trigger download using window.location.href (same as Create.jsx)
      window.location.href = url;
      
      // Show notification
      showNotification('Download Bundle ZIP Paket Soal dimulai...', 'info');
      
      // Increment download count
      const token = getAuthToken();
      if (token) {
        try {
          const incrementResponse = await axios.post(
            `${API_URL}/question-packages/${packageId}/increment-download`,
            {},
            { 
              headers: {
                "x-access-token": token,
                Authorization: `Bearer ${token}`
              }
            }
          );
          
          const updatedDownloadCount = incrementResponse.data?.downloads ?? null;
          
          setPackages(prev =>
            prev.map(pkg =>
              pkg.id === packageId
                ? {
                    ...pkg,
                    downloads:
                      updatedDownloadCount !== null
                        ? updatedDownloadCount
                        : (pkg.downloads || 0) + 1
                  }
                : pkg
            )
          );
        } catch (persistError) {
          console.error("⚠️ Failed to persist package download count:", persistError);
        }
      }
      
      // Remove from downloading items after a delay
      setTimeout(() => {
        setDownloadingItems(prev => {
          const newSet = new Set(prev);
          newSet.delete(packageId);
          return newSet;
        });
      }, 2000);
      
    } catch (error) {
      console.error("❌ Error downloading package:", error);
      showNotification(`Gagal mengunduh paket soal: ${error.message}`, 'error');
      setDownloadingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(packageId);
        return newSet;
      });
    }
  };

  // Fetch dropdown data dari backend
  const fetchDropdownData = async () => {
    setDropdownLoading(true);
    setDropdownError(null);
    
    try {
      console.log('🔄 Fetching dropdown data for question packages...');
      const response = await axios.get(`${API_URL}/dropdown/all-dropdown-data`);
      
      if (response.data.success) {
        const { courseTags: courseTagsData, materialTags: materialTagsData, difficultyLevels: difficultyData } = response.data.data;
        
        setCourseTags(courseTagsData.map(tag => tag.name));
        setMaterialTags(materialTagsData.map(tag => tag.name));
        setDifficultyLevels(difficultyData.map(level => level.level));
        
        console.log('✅ Dropdown data loaded successfully');
      } else {
        throw new Error(response.data.message || 'Failed to fetch dropdown data');
      }
      
    } catch (error) {
      console.error("❌ Error fetching dropdown data:", error);
      setDropdownError(error.message);
      
      // Fallback data jika API gagal
      console.log('🔄 Using fallback data for dropdowns');
      setDifficultyLevels(['Mudah', 'Sedang', 'Sulit']);
      setCourseTags([
        'Algoritma dan Struktur Data', 'Pemrograman Web', 'Basis Data', 
        'Pemrograman Berorientasi Objek', 'Jaringan Komputer', 'Kecerdasan Buatan'
      ]);
      setMaterialTags([
        'Algoritma', 'Struktur Data', 'HTML', 'CSS', 'JavaScript', 'React', 
        'SQL', 'Normalisasi', 'ERD', 'OOP', 'Java', 'Inheritance', 
        'Polymorphism', 'TCP/IP', 'Routing', 'Switching', 'Machine Learning', 
        'Neural Network', 'AI'
      ]);
    } finally {
      setDropdownLoading(false);
    }
  };

  // Fetch course options
  const fetchCourseOptions = async () => {
    try {
      const token = getAuthToken();
      if (!token) {
        console.warn("No auth token found for fetching courses");
        return [];
      }
      
      console.log('🔄 Fetching course options...');
      
      const response = await axios.get(`${API_URL}/course-material-stats`, {
        headers: { 
          "x-access-token": token,
          "Content-Type": "application/json"
        }
      });

      if (response.data && Array.isArray(response.data)) {
        const courses = response.data.map(course => ({
          id: course.id,
          name: course.name
        }));
        
        setCourseOptions(courses);
        console.log(`✅ Loaded ${courses.length} course options`);
        return courses;
      } else {
        console.warn("Invalid course data format received");
        return [];
      }
    } catch (error) {
      console.error("❌ Error fetching course options:", error);
      return [];
    }
  };

  // Filter function untuk paket soal (QuestionPackage) - menggunakan useMemo untuk optimasi
  const filteredData = useMemo(() => {
    // Pastikan packages adalah array
    if (!Array.isArray(packages)) {
      console.log('⚠️ packages is not an array:', packages);
      return [];
    }

    if (packages.length === 0) {
      console.log('⚠️ packages array is empty');
      return [];
    }

    // Normalize searchQuery - pastikan selalu string
    const normalizedSearchQuery = (searchQuery || '').trim();
    
    // Normalize filter arrays
    const hasSelectedLevel = Array.isArray(selectedLevel) && selectedLevel.length > 0;
    const hasSelectedCourseTags = Array.isArray(selectedCourseTags) && selectedCourseTags.length > 0;
    const hasSelectedMaterialTags = Array.isArray(selectedMaterialTags) && selectedMaterialTags.length > 0;
    const hasDateRange = dateRange && (dateRange.start !== '' || dateRange.end !== '');

    // Jika searchQuery kosong dan tidak ada filter lain, return semua packages
    const hasActiveFilters = 
      normalizedSearchQuery !== '' ||
      hasSelectedLevel ||
      hasSelectedCourseTags ||
      hasSelectedMaterialTags ||
      hasDateRange;

    if (!hasActiveFilters) {
      console.log('✅ No active filters, returning all packages:', packages.length);
      return packages;
    }

    console.log('🔍 Applying filters:', {
      searchQuery: normalizedSearchQuery,
      hasSelectedLevel,
      hasSelectedCourseTags,
      hasSelectedMaterialTags,
      hasDateRange,
      totalPackages: packages.length
    });

    const filtered = packages.filter(pkg => {
      if (!pkg) return false;

      // Filter by search query (judul atau deskripsi)
      const matchesSearch =
        normalizedSearchQuery === '' ||
        (pkg.title && pkg.title.toLowerCase().includes(normalizedSearchQuery.toLowerCase())) ||
        (pkg.description && pkg.description.toLowerCase().includes(normalizedSearchQuery.toLowerCase())) ||
        (pkg.course?.name && pkg.course.name.toLowerCase().includes(normalizedSearchQuery.toLowerCase())) ||
        (pkg.items && Array.isArray(pkg.items) && pkg.items.some(item =>
          item?.question?.title && item.question.title.toLowerCase().includes(normalizedSearchQuery.toLowerCase())
        ));

      // Filter by level (gunakan level dari soal di dalam paket)
      const matchesLevel =
        !hasSelectedLevel ||
        (pkg.items && Array.isArray(pkg.items) && pkg.items.some(item =>
          selectedLevel.includes(item?.question?.level)
        ));

      // Filter by course tags (mata kuliah)
      const matchesCourseTags =
        !hasSelectedCourseTags ||
        (pkg.course?.name && selectedCourseTags.some(tag =>
          pkg.course.name.toLowerCase().includes(tag.toLowerCase())
        ));

      // Filter by material tags (topik dari deskripsi soal)
      const matchesMaterialTags =
        !hasSelectedMaterialTags ||
        (pkg.items && Array.isArray(pkg.items) && pkg.items.some(item =>
          selectedMaterialTags.some(tag =>
            item?.question?.description && item.question.description.toLowerCase().includes(tag.toLowerCase())
          )
        ));

      // Filter by date
      let matchesDate = true;
      if (hasDateRange) {
        try {
          const itemDate = new Date(pkg.created_at);
          matchesDate =
            (dateRange.start === '' || new Date(dateRange.start) <= itemDate) &&
            (dateRange.end === '' || new Date(dateRange.end) >= itemDate);
        } catch (e) {
          console.error('Error parsing date:', e);
          matchesDate = true; // Jika error, tampilkan item tersebut
        }
      }

      return matchesSearch && matchesLevel && matchesCourseTags && matchesMaterialTags && matchesDate;
    });

    console.log('✅ Filter result:', {
      totalPackages: packages.length,
      filteredCount: filtered.length,
      searchQuery: normalizedSearchQuery
    });

    return filtered;
  }, [packages, searchQuery, selectedLevel, selectedCourseTags, selectedMaterialTags, dateRange]);
  const navigate = useNavigate();

  // Tambahkan fungsi ini di dalam Komponen Anda (misalnya: di dalam ListPage)
const getLevelColor = (level) => {
  if (!level || level === 'N/A') return 'bg-gray-100 text-gray-800';
  if (level.toLowerCase().includes('mudah')) return 'bg-green-100 text-green-800';
  if (level.toLowerCase().includes('sedang')) return 'bg-yellow-100 text-yellow-800';
  return 'bg-red-100 text-red-800';
};
  
  // Filter dropdown data berdasarkan input pencarian
  const filteredLevels = difficultyLevels.filter(level => 
    level.toLowerCase().includes(levelSearch.toLowerCase())
  );
  
  const filteredCourseTags = courseTags.filter(tag => 
    tag.toLowerCase().includes(courseTagSearch.toLowerCase())
  );
  
  const filteredMaterialTags = materialTags.filter(tag => 
    tag.toLowerCase().includes(materialTagSearch.toLowerCase())
  );
  
  // Fungsi untuk menambah/menghapus level
  const toggleLevel = (level) => {
    if (selectedLevel.includes(level)) {
      setSelectedLevel(prev => prev.filter(l => l !== level));
    } else {
      setSelectedLevel(prev => [...prev, level]);
    }
  };
  
  // Fungsi untuk menambah/menghapus tag mata kuliah
  const toggleCourseTag = (tag) => {
    if (selectedCourseTags.includes(tag)) {
      setSelectedCourseTags(prev => prev.filter(t => t !== tag));
    } else {
      setSelectedCourseTags(prev => [...prev, tag]);
    }
  };
  
  // Fungsi untuk menambah/menghapus tag materi
  const toggleMaterialTag = (tag) => {
    if (selectedMaterialTags.includes(tag)) {
      setSelectedMaterialTags(prev => prev.filter(t => t !== tag));
    } else {
      setSelectedMaterialTags(prev => [...prev, tag]);
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };
  
  // Dropdown animation variants
  const dropdownVariants = {
    hidden: { opacity: 0, y: -10, height: 0 },
    visible: { opacity: 1, y: 0, height: 'auto' }
  };

  // useEffect untuk fetch packages dan dropdown data
  useEffect(() => {
    const initializeData = async () => {
      try {
        console.log('🔄 Initializing QuestionSetsPage data...');
        
        // Fetch course options terlebih dahulu
        const courses = await fetchCourseOptions();
        
        // Fetch packages dan dropdown data secara paralel
        await Promise.all([
          fetchDropdownData(),
          fetchPackages()
        ]);
        
        console.log('✅ QuestionSetsPage data initialization complete');
      } catch (error) {
        console.error('❌ Error initializing data:', error);
      }
    };
    
    initializeData();
  }, []);

  // Function untuk fetch packages
  const fetchPackages = async () => {
    const token = getAuthToken();

    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/question-packages`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "x-access-token": token || "",
          "Authorization": token ? `Bearer ${token}` : ""
        }
      });

      if (!response.ok) {
        throw new Error("Gagal mengambil paket soal");
      }

      const data = await response.json();
      setPackages(data);
      console.log('✅ Question packages loaded:', data.length);
    } catch (err) {
      console.error('❌ Error fetching packages:', err);
      showNotification(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Loading indicator untuk dropdown
  const DropdownStatusIndicator = () => {
    if (dropdownError && !dropdownLoading) {
      return (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-2 rounded-lg mb-4 text-sm max-w-6xl mx-auto"
        >
          ⚠️ Menggunakan data filter default. Server mungkin sedang bermasalah. ({dropdownError})
        </motion.div>
      );
    }
    return null;
  };

  // Handle outside clicks untuk dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.dropdown-container')) {
        setShowLevelDropdown(false);
        setShowCourseTagDropdown(false);
        setShowMaterialTagDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Handle card click - navigate to detail page
  const handleCardClick = (packageId) => {
    if (!packageId) {
      console.error("ID paket soal kosong!");
      return;
    }
    navigate(`/question-packages/${packageId}`);
  };

  if (loading || dropdownLoading) return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          rotate: [0, 180, 360]
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full"
      />
      <motion.p
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{
          duration: 1.5,
          repeat: Infinity
        }}
        className="ml-4 text-lg font-medium text-blue-600"
      >
        {dropdownLoading ? 'Memuat Filter Data...' : 'Memuat Paket Soal...'}
      </motion.p>
    </div>
  );

  return (
    <div className="min-h-screen bg-white">
      <Header currentUser={currentUser} />
      
      <DropdownStatusIndicator />
      
      <div className="w-full px-4 md:px-8 py-8 md:py-12">
        {/* Header Section with Animated Background */}
        <div className="relative overflow-hidden">
          <motion.div
            className="absolute inset-0 -z-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
          >
            {[...Array(10)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute rounded-full bg-blue-200 opacity-30"
                style={{
                  width: Math.random() * 120 + 40,
                  height: Math.random() * 120 + 40,
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                }}
                animate={{
                  x: [0, Math.random() * 50 - 25],
                  y: [0, Math.random() * 50 - 25],
                }}
                transition={{
                  repeat: Infinity,
                  repeatType: "reverse",
                  duration: Math.random() * 8 + 8,
                }}
              />
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center relative z-10 py-12"
          >
            <motion.h1
              className="text-4xl md:text-5xl font-bold mb-3 text-gray-900"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              Paket Soal <span className="text-blue-600">Informatika</span>
            </motion.h1>
            <motion.p
              className="text-lg text-gray-600"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              Temukan dan Unduh Paket Soal untuk Kebutuhan Akademik Anda
            </motion.p>
          </motion.div>
        </div>

        {/* Search Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="max-w-6xl mx-auto bg-white rounded-2xl p-6 shadow-lg mb-8 border border-gray-100"
        >
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-3.5 text-gray-400" />
              <input
                type="text"
                placeholder="Cari paket soal berdasarkan mata kuliah, dosen, atau topik..."
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            {searchQuery && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl flex items-center justify-center gap-2 hover:bg-gray-200 transition-colors shadow-sm"
                onClick={() => setSearchQuery('')}
              >
                <X className="w-5 h-5" />
                Hapus
              </motion.button>
            )}
          </div>
          
          {/* Dropdown Filters dengan dropdown-container class */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            {/* Tingkat Kesulitan Dropdown */}
            <div className="relative dropdown-container">
              <label className="block text-sm font-medium mb-2 text-gray-700">Pilih Tingkat Kesulitan</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Cari Tingkat Kesulitan"
                  className="w-full pl-4 pr-10 py-2 border border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  value={levelSearch}
                  onChange={(e) => setLevelSearch(e.target.value)}
                  onClick={() => setShowLevelDropdown(true)}
                />
                <button 
                  className="absolute right-2 top-1/2 transform -translate-y-1/2"
                  onClick={() => setShowLevelDropdown(!showLevelDropdown)}
                >
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                </button>
              </div>
              
              {/* Dropdown Menu */}
              <AnimatePresence>
                {showLevelDropdown && (
                  <motion.div
                    className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto"
                    variants={dropdownVariants}
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                  >
                    {filteredLevels.length > 0 ? (
                      filteredLevels.map((level) => (
                        <div
                          key={level}
                          className="flex items-center px-4 py-2 hover:bg-blue-50 cursor-pointer"
                          onClick={() => {
                            toggleLevel(level);
                          }}
                        >
                          <div className={`w-5 h-5 border rounded mr-2 flex items-center justify-center ${selectedLevel.includes(level) ? 'bg-blue-500 border-blue-500' : 'border-gray-300'}`}>
                            {selectedLevel.includes(level) && <Check className="w-4 h-4 text-white" />}
                          </div>
                          <span>{level}</span>
                        </div>
                      ))
                    ) : (
                      <div className="px-4 py-2 text-gray-500">Tidak ada hasil</div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            {/* Tag Mata Kuliah Dropdown */}
            <div className="relative dropdown-container">
              <label className="block text-sm font-medium mb-2 text-gray-700">Pilih Tag Mata Kuliah</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Cari Tag Mata Kuliah"
                  className="w-full pl-4 pr-10 py-2 border border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  value={courseTagSearch}
                  onChange={(e) => setCourseTagSearch(e.target.value)}
                  onClick={() => setShowCourseTagDropdown(true)}
                />
                <button 
                  className="absolute right-2 top-1/2 transform -translate-y-1/2"
                  onClick={() => setShowCourseTagDropdown(!showCourseTagDropdown)}
                >
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                </button>
              </div>
              
              {/* Dropdown Menu */}
              <AnimatePresence>
                {showCourseTagDropdown && (
                  <motion.div
                    className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto"
                    variants={dropdownVariants}
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                  >
                    {filteredCourseTags.length > 0 ? (
                      filteredCourseTags.map((tag) => (
                        <div
                          key={tag}
                          className="flex items-center px-4 py-2 hover:bg-blue-50 cursor-pointer"
                          onClick={() => {
                            toggleCourseTag(tag);
                          }}
                        >
                          <div className={`w-5 h-5 border rounded mr-2 flex items-center justify-center ${selectedCourseTags.includes(tag) ? 'bg-blue-500 border-blue-500' : 'border-gray-300'}`}>
                            {selectedCourseTags.includes(tag) && <Check className="w-4 h-4 text-white" />}
                          </div>
                          <span>{tag}</span>
                        </div>
                      ))
                    ) : (
                      <div className="px-4 py-2 text-gray-500">Tidak ada hasil</div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            {/* Tag Materi Dropdown */}
            <div className="relative dropdown-container">
              <label className="block text-sm font-medium mb-2 text-gray-700">Pilih Tag Materi</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Cari Tag Materi"
                  className="w-full pl-4 pr-10 py-2 border border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  value={materialTagSearch}
                  onChange={(e) => setMaterialTagSearch(e.target.value)}
                  onClick={() => setShowMaterialTagDropdown(true)}
                />
                <button 
                  className="absolute right-2 top-1/2 transform -translate-y-1/2"
                  onClick={() => setShowMaterialTagDropdown(!showMaterialTagDropdown)}
                >
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                </button>
              </div>
              
              {/* Dropdown Menu */}
              <AnimatePresence>
                {showMaterialTagDropdown && (
                  <motion.div
                    className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto"
                    variants={dropdownVariants}
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                  >
                    {filteredMaterialTags.length > 0 ? (
                      filteredMaterialTags.map((tag) => (
                        <div
                          key={tag}
                          className="flex items-center px-4 py-2 hover:bg-blue-50 cursor-pointer"
                          onClick={() => {
                            toggleMaterialTag(tag);
                          }}
                        >
                          <div className={`w-5 h-5 border rounded mr-2 flex items-center justify-center ${selectedMaterialTags.includes(tag) ? 'bg-blue-500 border-blue-500' : 'border-gray-300'}`}>
                            {selectedMaterialTags.includes(tag) && <Check className="w-4 h-4 text-white" />}
                          </div>
                          <span>{tag}</span>
                        </div>
                      ))
                    ) : (
                      <div className="px-4 py-2 text-gray-500">Tidak ada hasil</div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Applied Filters Display */}
          {(selectedLevel.length > 0 || selectedCourseTags.length > 0 || selectedMaterialTags.length > 0 || dateRange.start || dateRange.end) && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-4 flex flex-wrap gap-2"
            >
              <span className="text-sm text-gray-500 my-auto">Filter Aktif:</span>

              {selectedLevel.map(level => (
                <motion.span
                  key={level}
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm flex items-center gap-1"
                >
                  <CheckCircle className="w-3 h-3" />
                  {level}
                  <button onClick={() => toggleLevel(level)}>
                    <X className="w-3 h-3 ml-1" />
                  </button>
                </motion.span>
              ))}
              
              {selectedCourseTags.map(tag => (
                <motion.span
                  key={tag}
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm flex items-center gap-1"
                >
                  <CheckCircle className="w-3 h-3" />
                  {tag}
                  <button onClick={() => toggleCourseTag(tag)}>
                    <X className="w-3 h-3 ml-1" />
                  </button>
                </motion.span>
              ))}
              
              {selectedMaterialTags.map(tag => (
                <motion.span
                  key={tag}
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm flex items-center gap-1"
                >
                  <CheckCircle className="w-3 h-3" />
                  {tag}
                  <button onClick={() => toggleMaterialTag(tag)}>
                    <X className="w-3 h-3 ml-1" />
                  </button>
                </motion.span>
              ))}

              {(dateRange.start || dateRange.end) && (
                <motion.span
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm flex items-center gap-1"
                >
                  <Calendar className="w-3 h-3" />
                  {dateRange.start ? new Date(dateRange.start).toLocaleDateString() : 'Awal'} -
                  {dateRange.end ? new Date(dateRange.end).toLocaleDateString() : 'Akhir'}
                  <button onClick={() => setDateRange({ start: '', end: '' })}>
                    <X className="w-3 h-3 ml-1" />
                  </button>
                </motion.span>
              )}

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-3 py-1 text-red-600 text-sm flex items-center gap-1 hover:bg-red-50 rounded-full"
                onClick={() => {
                  setSelectedLevel([]);
                  setSelectedCourseTags([]);
                  setSelectedMaterialTags([]);
                  setDateRange({ start: '', end: '' });
                }}
              >
                <X className="w-3 h-3" />
                Hapus Semua
              </motion.button>
            </motion.div>
          )}

          {/* View Toggle and Results Count */}
          <div className="flex justify-between items-center mt-6">
            <p className="text-gray-600 text-sm">
              Menampilkan <span className="font-medium">{filteredData.length}</span> hasil pencarian
            </p>
            <div className="flex gap-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`p-2 rounded ${viewMode === 'grid' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}
                onClick={() => setViewMode('grid')}
              >
                <BarChart2 className="w-5 h-5" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`p-2 rounded ${viewMode === 'list' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}
                onClick={() => setViewMode('list')}
              >
                <FileText className="w-5 h-5" />
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Results Section - UPDATED dengan tombol delete */}
        {loading ? (
          <div className="flex justify-center items-center py-16">
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                rotate: [0, 180, 360]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full"
            />
          </div>
        ) : !filteredData || filteredData.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <div className="max-w-md mx-auto">
              <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <Search className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {searchQuery.trim() !== '' || selectedLevel.length > 0 || selectedCourseTags.length > 0 || selectedMaterialTags.length > 0 || dateRange.start || dateRange.end
                  ? 'Tidak ada paket soal yang sesuai'
                  : 'Belum ada paket soal'}
              </h3>
              <p className="text-gray-600 mb-4">
                {searchQuery.trim() !== '' || selectedLevel.length > 0 || selectedCourseTags.length > 0 || selectedMaterialTags.length > 0 || dateRange.start || dateRange.end
                  ? 'Coba ubah kata kunci pencarian atau filter yang Anda gunakan.'
                  : 'Paket soal akan muncul di sini setelah dibuat.'}
              </p>
              {(searchQuery.trim() !== '' || selectedLevel.length > 0 || selectedCourseTags.length > 0 || selectedMaterialTags.length > 0 || dateRange.start || dateRange.end) && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedLevel([]);
                    setSelectedCourseTags([]);
                    setSelectedMaterialTags([]);
                    setDateRange({ start: '', end: '' });
                  }}
                >
                  Hapus Semua Filter
                </motion.button>
              )}
            </div>
          </motion.div>
        ) : (
          <AnimatePresence mode="wait" key={`results-${viewMode}-${filteredData.length}-${searchQuery || 'empty'}`}>
            {viewMode === 'grid' ? (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {filteredData.map((item) => {
                const isDownloading = downloadingItems.has(item.id);
                const userCanDelete = canDelete(item.created_by);
                
                return (
                  <motion.div
                    key={item.id}
                    variants={itemVariants}
                    className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all cursor-pointer group"
                    onClick={() => handleCardClick(item.id)}
                  >
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center">
                          <div className="bg-blue-100 p-2 rounded-lg mr-3 group-hover:bg-blue-200 transition-colors">
                            <Book className="w-6 h-6 text-blue-600" />
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex items-center text-gray-500 text-sm">
                            <Download className="w-4 h-4 mr-1" />
                            {item.downloads || 0}
                          </div>
                          {userCanDelete && (
                            <button
                              onClick={(e) => openDeleteModal(e, item.id, item.title)}
                              className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Hapus paket soal"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                      
                      <h3 className="text-lg font-semibold mb-2 text-gray-900 group-hover:text-blue-700 transition-colors">{item.title}</h3>
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">{item.description}</p>
                      
                      <div className="flex items-center text-sm text-gray-500 mb-3">
                        <User className="w-4 h-4 mr-1" />
                        <span>{item.creator?.full_name || "Tidak diketahui"}</span>
                      </div>
                      
                      <div className="flex items-center text-sm text-gray-500 mb-4">
                        <Tag className="w-4 h-4 mr-1" />
                        <span>{item.items?.length || 0} soal</span>
                      </div>
                      
                      <div className="flex items-center gap-2 mb-4">
                        <span className="px-2 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-medium">
                          {item.course?.name || "Tanpa Mata Kuliah"}
                        </span>
                      </div>

                      <div className="flex justify-between items-center">
                        <div className="text-xs text-gray-500 flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          {new Date(item.created_at).toLocaleDateString('id-ID', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </div>
                        
                        <motion.button
                          whileHover={{ scale: isDownloading ? 1 : 1.05 }}
                          whileTap={{ scale: isDownloading ? 1 : 0.95 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (!isDownloading) {
                              handleDownloadPackage(item.id, item.title);
                            }
                          }}
                          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1 ${
                            isDownloading 
                              ? 'bg-gray-400 text-white cursor-not-allowed' 
                              : 'bg-blue-600 text-white hover:bg-blue-700'
                          }`}
                          disabled={isDownloading}
                        >
                          {isDownloading ? (
                            <>
                              <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                className="w-3 h-3 border-2 border-white border-t-transparent rounded-full"
                              />
                              Unduh...
                            </>
                          ) : (
                            <>
                              <Download className="w-3 h-3" />
                              Unduh ZIP
                            </>
                          )}
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          ) : (
            <motion.div
                className="overflow-x-auto max-w-7xl mx-auto bg-white rounded-xl shadow-lg"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                key="table-ui-in-grid-mode" // Kunci unik untuk AnimatePresence
            >
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                <div className="flex items-center gap-1 cursor-pointer hover:text-gray-700">
                                    Nama File <ArrowUpDown className="w-3 h-3" />
                                </div>
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                <div className="flex items-center gap-1 cursor-pointer hover:text-gray-700">
                                    Mata Kuliah <ArrowUpDown className="w-3 h-3" />
                                </div>
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                <div className="flex items-center gap-1 cursor-pointer hover:text-gray-700">
                                    Tingkat Kesulitan <ArrowUpDown className="w-3 h-3" />
                                </div>
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                <div className="flex items-center gap-1 cursor-pointer hover:text-gray-700">
                                    Dosen <ArrowUpDown className="w-3 h-3" />
                                </div>
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                <div className="flex items-center gap-1 cursor-pointer hover:text-gray-700">
                                    Tanggal <ArrowUpDown className="w-3 h-3" />
                                </div>
                            </th>
                            <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Aksi
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {filteredData.map((item) => {
                            const isDownloading = downloadingItems.has(item.id);
                            const userCanDelete = canDelete(item.created_by); 

                            // Mapping data dari Card View ke kolom Tabel
                            const namaFile = item.title; 
                            const mataKuliah = item.course?.name || "N/A";
                            const dosen = item.creator?.full_name || "Tidak diketahui";
                            const tanggal = new Date(item.created_at).toLocaleDateString('id-ID', {
                                year: 'numeric', month: 'short', day: 'numeric'
                            });
                            // item.level digunakan dari data yang diasumsikan ada di kedua mode

                            return (
                                <motion.tr
                                    key={item.id}
                                    variants={itemVariants}
                                    className="hover:bg-gray-50 cursor-pointer"
                                    onClick={() => navigate(`/question-packages/${item.id}`)}
                                >
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {namaFile}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                        {mataKuliah}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {/* Menggunakan getLevelColor dan item.level */}
                                        <span className={`px-3 py-1 rounded-full text-xs ${getLevelColor(item.level || 'N/A')}`}>
                                            {item.level || 'N/A'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                        {dosen}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                        {tanggal}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            <motion.button
                                                whileHover={{ scale: isDownloading ? 1 : 1.05 }}
                                                whileTap={{ scale: isDownloading ? 1 : 0.95 }}
                                                className={`inline-flex items-center px-3 py-1 rounded-lg text-sm text-white transition-colors ${
                                                    isDownloading 
                                                        ? 'bg-gray-400 cursor-not-allowed' 
                                                        : 'bg-blue-600 hover:bg-blue-700'
                                                }`}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    if (!isDownloading) {
                                                        // Menggunakan handler download Card View
                                                        handleDownloadPackage(item.id, item.title);
                                                    }
                                                }}
                                                disabled={isDownloading}
                                            >
                                                {isDownloading ? (
                                                    <>
                                                        <motion.div
                                                            animate={{ rotate: 360 }}
                                                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                                            className="w-3 h-3 border-2 border-white border-t-transparent rounded-full mr-1"
                                                        />
                                                        Unduh...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Download className="w-3 h-3 mr-1" />
                                                        Unduh ZIP
                                                    </>
                                                )}
                                            </motion.button>
                                            {userCanDelete && (
                                                <motion.button
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    className="inline-flex items-center px-3 py-1 rounded-lg text-sm text-white bg-red-600 hover:bg-red-700"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        openDeleteModal(e, item.id, item.title);
                                                    }}
                                                >
                                                    <Trash2 className="w-3 h-3 mr-1" />
                                                    Hapus
                                                </motion.button>
                                            )}
                                        </div>
                                    </td>
                                </motion.tr>
                            );
                        })}
                    </tbody>
                </table>
            </motion.div>
            )}
          </AnimatePresence>
        )}
        
        {/* Floating Create Button */}
        <Link to="/create">
          <motion.button
            className="fixed bottom-8 right-8 w-16 h-16 bg-blue-600 hover:bg-blue-700 rounded-full flex items-center justify-center shadow-lg z-50"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <Plus className="text-white w-8 h-8" />
          </motion.button>
        </Link>
      </div>

      {/* Modal Konfirmasi Delete */}
      {deleteModal.show && (
    <div 
      // MODIFIKASI BERIKUT: bg-black diganti menjadi bg-white/70 dan ditambahkan backdrop-blur-md
      className="fixed inset-0 bg-white/70 backdrop-blur-md flex items-center justify-center z-50 p-4"
      onClick={() => !deleting && closeDeleteModal()}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6"
      >
        <div className="flex items-start mb-4">
          <div className="flex-shrink-0 w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6 text-red-600" />
          </div>
          <div className="ml-4 flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Hapus Paket Soal?
            </h3>
            <p className="text-sm text-gray-600">
              Apakah Anda yakin ingin menghapus paket <strong>"{deleteModal.packageTitle}"</strong>?
            </p>
            <p className="text-sm text-red-600 mt-2 font-medium">
              ⚠️ Semua soal di dalam paket ini juga akan terhapus!
            </p>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={closeDeleteModal}
            disabled={deleting}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Batal
          </button>
          <button
            onClick={handleDeletePackage}
            disabled={deleting}
            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center"
          >
            {deleting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                Menghapus...
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4 mr-1" />
                Hapus
              </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
)}

      {/* Notification Overlay */}
      <AnimatePresence>
        {notification.show && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.9 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="fixed top-4 right-4 z-[100] max-w-md"
          >
            <motion.div
              className={`rounded-lg shadow-2xl border-2 p-4 backdrop-blur-sm ${
                notification.type === 'success'
                  ? 'bg-green-50 border-green-200 text-green-900'
                  : notification.type === 'error'
                  ? 'bg-red-50 border-red-200 text-red-900'
                  : notification.type === 'warning'
                  ? 'bg-yellow-50 border-yellow-200 text-yellow-900'
                  : 'bg-blue-50 border-blue-200 text-blue-900'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-0.5">
                  {notification.type === 'success' && (
                    <CheckCircle2 className="w-6 h-6 text-green-600" />
                  )}
                  {notification.type === 'error' && (
                    <XCircle className="w-6 h-6 text-red-600" />
                  )}
                  {notification.type === 'warning' && (
                    <AlertTriangle className="w-6 h-6 text-yellow-600" />
                  )}
                  {notification.type === 'info' && (
                    <Info className="w-6 h-6 text-blue-600" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium whitespace-pre-line break-words">
                    {notification.message}
                  </p>
                </div>
                <button
                  onClick={() => setNotification(prev => ({ ...prev, show: false }))}
                  className={`flex-shrink-0 p-1 rounded-full hover:bg-opacity-20 transition-colors ${
                    notification.type === 'success'
                      ? 'text-green-600 hover:bg-green-200'
                      : notification.type === 'error'
                      ? 'text-red-600 hover:bg-red-200'
                      : notification.type === 'warning'
                      ? 'text-yellow-600 hover:bg-yellow-200'
                      : 'text-blue-600 hover:bg-blue-200'
                  }`}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
};

export default QuestionSetsPage;