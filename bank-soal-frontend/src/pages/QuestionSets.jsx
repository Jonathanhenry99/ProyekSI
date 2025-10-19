import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { Search, Filter, Download, User, Clock, Tag, Calendar, ArrowUpDown, X, CheckCircle, ChevronDown, FileText, BarChart2, Plus, Book, Check } from 'lucide-react';
import Footer from '../components/Footer';
import Header from '../components/Header';
import { Link } from 'react-router-dom';
import { useNavigate } from "react-router-dom";
import axios from "axios";
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

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

  // Function untuk download paket soal sebagai ZIP
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
        alert('Paket soal kosong atau tidak memiliki soal');
        return;
      }
      
      console.log(`📁 Found ${packageData.items.length} question sets to process`);
      
      // Create a new ZIP instance
      const zip = new JSZip();
      
      // Create main folder for the package
      const packageFolder = zip.folder(packageTitle.replace(/[<>:"/\\|?*]/g, '_'));
      
      let totalDownloadedFiles = 0;
      const downloadPromises = [];
      
      // Process each question set in the package
      for (const item of packageData.items) {
        const questionSet = item.question;
        if (!questionSet) continue;
        
        // Create folder for this question set
        const questionSetName = questionSet.title.replace(/[<>:"/\\|?*]/g, '_');
        const questionSetFolder = packageFolder.folder(questionSetName);
        
        // Create subfolders
        const soalFolder = questionSetFolder.folder("01_Soal");
        const jawabanFolder = questionSetFolder.folder("02_Kunci_Jawaban");
        const testCaseFolder = questionSetFolder.folder("03_Test_Cases");
        
        // Get question set details with files
        const downloadPromise = axios.get(`${API_URL}/questionsets/${questionSet.id}?download=true`)
          .then(async (qsResponse) => {
            const qsData = qsResponse.data;
            
            if (qsData.files && qsData.files.length > 0) {
              const fileDownloadPromises = qsData.files.map(async (file) => {
                let targetFolder = null;
                let folderName = '';
                
                // Determine which folder based on file category
                switch (file.filecategory) {
                  case 'soal':
                  case 'questions':
                    targetFolder = soalFolder;
                    folderName = 'Soal';
                    break;
                  case 'kunci':
                  case 'answers':
                    targetFolder = jawabanFolder;
                    folderName = 'Kunci Jawaban';
                    break;
                  case 'test':
                  case 'testCases':
                    targetFolder = testCaseFolder;
                    folderName = 'Test Cases';
                    break;
                  default:
                    return;
                }
                
                try {
                  const fileResponse = await axios.get(`${API_URL}/files/download/${file.id}`, {
                    responseType: 'blob',
                    timeout: 30000
                  });
                  
                  // Get file extension
                  let fileExtension = '';
                  let safeFileName = '';
                  
                  if (file.filename && file.filename.includes('.')) {
                    safeFileName = file.filename;
                  } else {
                    const contentType = fileResponse.headers['content-type'] || fileResponse.headers['Content-Type'];
                    
                    if (contentType) {
                      if (contentType.includes('pdf')) fileExtension = '.pdf';
                      else if (contentType.includes('word') || contentType.includes('application/vnd.openxmlformats-officedocument.wordprocessingml.document')) fileExtension = '.docx';
                      else if (contentType.includes('text')) fileExtension = '.txt';
                      else fileExtension = '.pdf'; // default
                    } else {
                      fileExtension = '.pdf';
                    }
                    
                    safeFileName = `${folderName}_${file.id}${fileExtension}`;
                  }
                  
                  // Clean filename
                  safeFileName = safeFileName
                    .replace(/[<>:"/\\|?*]/g, '_')
                    .replace(/\s+/g, '_')
                    .replace(/_+/g, '_');
                  
                  targetFolder.file(safeFileName, fileResponse.data);
                  totalDownloadedFiles++;
                  
                  console.log(`✅ Added ${safeFileName} to ${questionSetName}/${folderName}`);
                } catch (error) {
                  console.error(`❌ Failed to download file ${file.id}:`, error);
                }
              });
              
              await Promise.allSettled(fileDownloadPromises);
            }
            
            // Add README for this question set
            const readmeContent = `
INFORMASI SOAL
==============

Judul: ${questionSet.title}
Mata Kuliah: ${questionSet.subject}
Tingkat Kesulitan: ${questionSet.level}
Dosen: ${questionSet.lecturer}
Tahun: ${questionSet.year}
Topik: ${questionSet.topics || 'Tidak ada topik'}
Deskripsi: ${questionSet.description || 'Tidak ada deskripsi'}

---
Bagian dari Paket: ${packageTitle}
Diunduh pada: ${new Date().toLocaleString('id-ID')}
            `.trim();
            
            questionSetFolder.file("README.txt", readmeContent);
          })
          .catch(error => {
            console.error(`❌ Failed to process question set ${questionSet.id}:`, error);
          });
        
        downloadPromises.push(downloadPromise);
      }
      
      // Wait for all downloads to complete
      await Promise.allSettled(downloadPromises);
      
      if (totalDownloadedFiles === 0) {
        alert('Tidak ada file yang berhasil diunduh dari paket soal ini');
        return;
      }
      
      // Add main README for the package
      const mainReadmeContent = `
PAKET SOAL - ${packageTitle.toUpperCase()}
${'='.repeat(packageTitle.length + 13)}

INFORMASI PAKET:
- Judul: ${packageData.title}
- Deskripsi: ${packageData.description || 'Tidak ada deskripsi'}
- Mata Kuliah: ${packageData.course?.name || 'Tidak ditentukan'}
- Pembuat: ${packageData.creator?.full_name || 'Tidak diketahui'}
- Jumlah Soal: ${packageData.items.length} set soal
- Tanggal Dibuat: ${new Date(packageData.created_at).toLocaleString('id-ID')}

STRUKTUR FOLDER:
Setiap set soal memiliki struktur folder:
- 01_Soal/ : File soal utama
- 02_Kunci_Jawaban/ : File kunci jawaban
- 03_Test_Cases/ : File test cases
- README.txt : Informasi detail soal

INFORMASI DOWNLOAD:
- Total File Diunduh: ${totalDownloadedFiles} file
- Tanggal Download: ${new Date().toLocaleString('id-ID')}
- User: ${currentUser?.username || 'Unknown'}

---
Diunduh dari Bank Soal Informatika
Universitas Katolik Parahyangan
© ${new Date().getFullYear()}
      `.trim();
      
      packageFolder.file("README_PAKET.txt", mainReadmeContent);
      
      // Generate ZIP file
      console.log('🔄 Generating package ZIP file...');
      const zipBlob = await zip.generateAsync({
        type: "blob",
        compression: "DEFLATE",
        compressionOptions: {
          level: 6
        }
      });
      
      // Create safe filename for ZIP
      const safeFileName = packageTitle
        .replace(/[^a-zA-Z0-9\s-_]/g, '')
        .replace(/\s+/g, '_')
        .substring(0, 50);
      
      const zipFileName = `Paket_${safeFileName}_${new Date().toISOString().split('T')[0]}.zip`;
      
      // Save ZIP file
      saveAs(zipBlob, zipFileName);
      
      console.log(`✅ Package ZIP file "${zipFileName}" download started successfully`);
      
      // Show success message
      alert(`Berhasil mengunduh paket soal "${packageTitle}"!\n\nTotal: ${totalDownloadedFiles} file dalam ${packageData.items.length} set soal`);
      
    } catch (error) {
      console.error("❌ Error downloading package:", error);
      alert(`Gagal mengunduh paket soal: ${error.message}`);
    } finally {
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

  // Filter function untuk paket soal (QuestionPackage)
  const filterData = () => {
    return packages.filter(pkg => {
      // Filter by search query (judul atau deskripsi)
      const matchesSearch =
        searchQuery === '' ||
        pkg.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        pkg.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        pkg.course?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        pkg.items?.some(item =>
          item.question?.title?.toLowerCase().includes(searchQuery.toLowerCase())
        );

      // Filter by level (gunakan level dari soal di dalam paket)
      const matchesLevel =
        selectedLevel.length === 0 ||
        pkg.items?.some(item =>
          selectedLevel.includes(item.question?.level)
        );

      // Filter by course tags (mata kuliah)
      const matchesCourseTags =
        selectedCourseTags.length === 0 ||
        selectedCourseTags.some(tag =>
          pkg.course?.name?.toLowerCase().includes(tag.toLowerCase())
        );

      // Filter by material tags (topik dari deskripsi soal)
      const matchesMaterialTags =
        selectedMaterialTags.length === 0 ||
        pkg.items?.some(item =>
          selectedMaterialTags.some(tag =>
            item.question?.description?.toLowerCase().includes(tag.toLowerCase())
          )
        );

      // Filter by date
      const itemDate = new Date(pkg.created_at);
      const matchesDate =
        (dateRange.start === '' || new Date(dateRange.start) <= itemDate) &&
        (dateRange.end === '' || new Date(dateRange.end) >= itemDate);

      return matchesSearch && matchesLevel && matchesCourseTags && matchesMaterialTags && matchesDate;
    });
  };

  const filteredData = filterData();
  const navigate = useNavigate();
  
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
      alert(err.message);
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
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-6 py-3 bg-blue-600 text-white rounded-xl flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors shadow-sm"
              onClick={() => filterData()}
            >
              <Search className="w-5 h-5" />
              Cari
            </motion.button>
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

        {/* Results Section - UPDATED untuk clickable cards */}
        <AnimatePresence mode="wait">
          {viewMode === 'grid' ? (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {filteredData.map((item) => {
                const isDownloading = downloadingItems.has(item.id);
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
                        <div className="flex items-center text-gray-500 text-sm">
                          <Download className="w-4 h-4 mr-1" />
                          {item.downloads || 0}
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
                            e.stopPropagation(); // Prevent card click
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
                              Unduh
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
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-4"
            >
              {filteredData.map((item) => {
                const isDownloading = downloadingItems.has(item.id);
                return (
                  <motion.div
                    key={item.id}
                    variants={itemVariants}
                    className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all p-4 cursor-pointer group"
                    onClick={() => handleCardClick(item.id)}
                  >
                    <div className="flex flex-col md:flex-row md:items-center">
                      <div className="flex-1">
                        <div className="flex items-center mb-2">
                          <div className="bg-blue-100 p-2 rounded-lg mr-3 group-hover:bg-blue-200 transition-colors">
                            <Book className="w-6 h-6 text-blue-600" />
                          </div>
                          <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">{item.title}</h3>
                        </div>
                        
                        <p className="text-gray-600 text-sm mb-3">{item.description}</p>
                        
                        <div className="flex flex-wrap gap-4 mb-2">
                          <div className="flex items-center text-sm text-gray-500">
                            <User className="w-4 h-4 mr-1" />
                            <span>{item.creator?.full_name || "Tidak diketahui"}</span>
                          </div>
                          
                          <div className="flex items-center text-sm text-gray-500">
                            <Tag className="w-4 h-4 mr-1" />
                            <span>{item.items?.length || 0} soal</span>
                          </div>
                          
                          <div className="flex items-center text-sm text-gray-500">
                            <Clock className="w-4 h-4 mr-1" />
                            {new Date(item.created_at).toLocaleDateString('id-ID', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </div>
                          
                          <div className="flex items-center text-sm text-gray-500">
                            <Download className="w-4 h-4 mr-1" />
                            {item.downloads || 0}
                          </div>
                        </div>
                        
                        <div className="flex flex-wrap gap-2 mt-3">
                          <span className="px-2 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-medium">
                            {item.course?.name || "Tanpa Mata Kuliah"}
                          </span>
                        </div>
                      </div>
                      
                      <div className="mt-4 md:mt-0 md:ml-4 flex md:flex-col justify-end">
                        <motion.button
                          whileHover={{ scale: isDownloading ? 1 : 1.05 }}
                          whileTap={{ scale: isDownloading ? 1 : 0.95 }}
                          onClick={(e) => {
                            e.stopPropagation(); // Prevent card click
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
                              Unduh
                            </>
                          )}
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
        
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
      
      <Footer />
    </div>
  );
};

export default QuestionSetsPage;