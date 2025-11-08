import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { Search, Filter, Download, User, Clock, Tag, Calendar, ArrowUpDown, X, CheckCircle, ChevronDown, FileText, BarChart2, Plus, Book, Check } from 'lucide-react';
import Footer from '../components/Footer';
import Header from '../components/Header';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const QuestionSetsPage = ({ currentUser }) => {
  const [activeTab, setActiveTab] = useState('semua');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState([]);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [viewMode, setViewMode] = useState('grid');
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [data, setData] = useState([]);
  const [error, setError] = useState(null);
  const [selectedQuestionSets, setSelectedQuestionSets] = useState([]);
  const [combineMode, setCombineMode] = useState(false);
  const [showCombineModal, setShowCombineModal] = useState(false);
  const [combinedPdfTitle, setCombinedPdfTitle] = useState('');
  
  // State untuk dropdown
  const [showLevelDropdown, setShowLevelDropdown] = useState(false);
  const [showCourseTagDropdown, setShowCourseTagDropdown] = useState(false);
  const [showMaterialTagDropdown, setShowMaterialTagDropdown] = useState(false);
  const [levelSearch, setLevelSearch] = useState('');
  const [courseTagSearch, setCourseTagSearch] = useState('');
  const [materialTagSearch, setMaterialTagSearch] = useState('');
  const [selectedCourseTags, setSelectedCourseTags] = useState([]);
  const [selectedMaterialTags, setSelectedMaterialTags] = useState([]);

  // Data untuk dropdown
  const difficultyLevels = ['Mudah', 'Sedang', 'Sulit'];
  const courseTags = ['Algoritma dan Struktur Data', 'Pemrograman Web', 'Basis Data', 'Pemrograman Berorientasi Objek', 'Jaringan Komputer', 'Kecerdasan Buatan'];
  const materialTags = ['Algoritma', 'Struktur Data', 'HTML', 'CSS', 'JavaScript', 'React', 'SQL', 'Normalisasi', 'ERD', 'OOP', 'Java', 'Inheritance', 'Polymorphism', 'TCP/IP', 'Routing', 'Switching', 'Machine Learning', 'Neural Network', 'AI'];

  // Fungsi untuk mengambil data paket soal
  const fetchPaketSoal = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get("http://localhost:8080/api/paketsoal");
      console.log("Fetched paket soal:", response.data);
      setData(response.data);
    } catch (err) {
      console.error("Error fetching paket soal:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPaketSoal();
  }, []);

  // Filter function
  const filterData = () => {
    return data.filter(item => {
      // Filter by search query
      const matchesSearch =
        searchQuery === '' ||
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.lecturer.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        parseTopics(item.topics).some(topic => topic.toLowerCase().includes(searchQuery.toLowerCase()));

      // Filter by level
      const matchesLevel =
        selectedLevel.length === 0 ||
        selectedLevel.includes(item.level);
        
      // Filter by course tags
      const matchesCourseTags =
        selectedCourseTags.length === 0 ||
        selectedCourseTags.some(tag => item.title.toLowerCase().includes(tag.toLowerCase()));
        
      // Filter by material tags
      const matchesMaterialTags =
        selectedMaterialTags.length === 0 ||
        selectedMaterialTags.some(tag => 
          parseTopics(item.topics).some(topic => topic.toLowerCase().includes(tag.toLowerCase()))
        );

      return matchesSearch && matchesLevel && matchesCourseTags && matchesMaterialTags;
    });
  };

  const filteredData = filterData();
  
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

  const navigate = useNavigate();

  // Helper for level color
  const getLevelColor = (level) => {
    switch (level) {
      case 'Mudah':
        return 'bg-green-100 text-green-700';
      case 'Sedang':
        return 'bg-yellow-100 text-yellow-700';
      case 'Sulit':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  // Helper for date formatting
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Helper to parse topics string into array
  const parseTopics = (topicsString) => {
    if (!topicsString) return [];
    try {
      return JSON.parse(topicsString);
    } catch (e) {
      // If not JSON, try splitting by comma
      return topicsString.split(',').map(t => t.trim());
    }
  };

  // Card click handler for preview
  const handleCardClick = (id) => {
    if (combineMode) {
      toggleQuestionSetSelection(id);
    } else {
      navigate(`/preview/${id}`);
    }
  };

  // Download handler
  const handleDownload = async (id) => {
    try {
      const response = await axios.get(`http://localhost:8080/api/paketsoal/${id}`);
      const questionFile = response.data.files.find(file => file.filecategory === 'questions');
      if (questionFile) {
        window.open(`http://localhost:8080/api/files/download/${questionFile.id}`, '_blank');
      } else {
        alert('File soal tidak ditemukan');
      }
    } catch (error) {
      console.error("Error downloading file:", error);
      alert('Gagal mendownload file');
    }
  };
  
  // Toggle question set selection for combining
  const toggleQuestionSetSelection = (id) => {
    setSelectedQuestionSets(prev => {
      if (prev.includes(id)) {
        return prev.filter(setId => setId !== id);
      } else {
        return [...prev, id];
      }
    });
  };
  
  // Toggle combine mode
  const toggleCombineMode = () => {
    setCombineMode(prev => !prev);
    if (!combineMode) {
      setSelectedQuestionSets([]);
    }
  };
  
  // Handle combine selected question sets
  const handleCombineQuestionSets = async () => {
    if (selectedQuestionSets.length < 2) {
      alert('Pilih minimal 2 set soal untuk digabungkan');
      return;
    }
    
    setShowCombineModal(true);
  };
  
  // Handle confirm combine
  const handleConfirmCombine = async () => {
    if (!combinedPdfTitle) {
      alert('Judul PDF gabungan harus diisi');
      return;
    }
    
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      if (!user || !user.accessToken) {
        alert("Anda belum login atau sesi telah berakhir. Silakan login kembali.");
        return;
      }
      
      const token = user.accessToken;
      
      // Kirim permintaan ke backend untuk menggabungkan PDF
      const response = await axios.post(
        `http://localhost:8080/api/files/combine`,
        {
          questionSetIds: selectedQuestionSets,
          title: combinedPdfTitle,
          description: `Gabungan dari ${selectedQuestionSets.length} set soal`,
          subject: data.find(item => item.id === selectedQuestionSets[0])?.subject || '',
          year: new Date().getFullYear(),
          level: 'Gabungan',
          lecturer: currentUser?.username || user.username || ''
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'x-access-token': token
          },
          responseType: 'blob'
        }
      );
      
      // Buat URL untuk file blob dan download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${combinedPdfTitle}.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Reset state
      setShowCombineModal(false);
      setCombineMode(false);
      setSelectedQuestionSets([]);
      setCombinedPdfTitle('');
      
      // Refresh data untuk menampilkan paket soal gabungan yang baru
      fetchPaketSoal();
      
    } catch (error) {
      console.error("Error combining files:", error);
      alert('Gagal menggabungkan file');
    }
  };

  // Card renderer (from Search.jsx)
  const renderCard = (item) => (
    <motion.div
      variants={itemVariants}
      className={`bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow cursor-pointer ${viewMode === 'grid' ? 'h-full' : ''} ${selectedQuestionSets.includes(item.id) ? 'ring-2 ring-blue-500' : ''}`}
      onClick={() => handleCardClick(item.id)}
      key={item.id}
    >
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          {combineMode && (
            <div className={`w-6 h-6 border rounded mr-2 flex items-center justify-center ${selectedQuestionSets.includes(item.id) ? 'bg-blue-500 border-blue-500' : 'border-gray-300'}`}>
              {selectedQuestionSets.includes(item.id) && <Check className="w-4 h-4 text-white" />}
            </div>
          )}
          <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">{item.title}</h3>
          <span className={`px-2 py-1 text-xs rounded-full ${getLevelColor(item.level)}`}>
            {item.level}
          </span>
        </div>
        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm text-gray-600">
            <Book className="w-4 h-4 mr-2" />
            <span>{item.subject || item.title}</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <User className="w-4 h-4 mr-2" />
            <span>{item.lecturer}</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <Calendar className="w-4 h-4 mr-2" />
            <span>{formatDate(item.lastUpdated)}</span>
          </div>
        </div>
        {item.topics && (
          <div className="flex flex-wrap gap-1 mb-4">
            {parseTopics(item.topics).map((topic, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
              >
                {topic}
              </span>
            ))}
          </div>
        )}
        <div className="flex justify-between items-center mt-4">
          <div className="flex items-center text-sm text-gray-500">
            <Download className="w-4 h-4 mr-1" />
            <span>{item.downloads} unduhan</span>
          </div>
          {!combineMode ? (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                handleDownload(item.id);
              }}
            >
              Unduh
            </motion.button>
          ) : (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${selectedQuestionSets.includes(item.id) ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
              onClick={(e) => {
                e.stopPropagation();
                toggleQuestionSetSelection(item.id);
              }}
            >
              {selectedQuestionSets.includes(item.id) ? 'Batal Pilih' : 'Pilih'}
            </motion.button>
          )}
        </div>
      </div>
    </motion.div>
  );

  // Render loading state
  if (isLoading) {
    return <div>Loading...</div>;
  }

  // Render error state
  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="min-h-screen bg-white">
      <Header currentUser={currentUser} />
      
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
          
          {/* Dropdown Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            {/* Tingkat Kesulitan Dropdown */}
            <div className="relative">
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
            <div className="relative">
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
            <div className="relative">
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

          

          {/* View Toggle, Combine Mode, and Results Count */}
          <div className="flex justify-between items-center mt-6">
            <div className="flex items-center gap-4">
              <p className="text-gray-600 text-sm">
                Menampilkan <span className="font-medium">{filteredData.length}</span> hasil pencarian
              </p>
              {combineMode && (
                <div className="flex items-center">
                  <span className="text-blue-600 font-medium text-sm">
                    {selectedQuestionSets.length} set soal dipilih
                  </span>
                </div>
              )}
            </div>
            <div className="flex gap-2">
              {combineMode ? (
                <>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-3 py-2 bg-red-600 text-white rounded-lg text-sm flex items-center gap-1"
                    onClick={toggleCombineMode}
                  >
                    <X className="w-4 h-4" />
                    Batal
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`px-3 py-2 rounded-lg text-sm flex items-center gap-1 ${selectedQuestionSets.length >= 2 ? 'bg-green-600 text-white' : 'bg-gray-300 text-gray-600 cursor-not-allowed'}`}
                    onClick={selectedQuestionSets.length >= 2 ? handleCombineQuestionSets : undefined}
                  >
                    <Download className="w-4 h-4" />
                    Gabung & Unduh ({selectedQuestionSets.length})
                  </motion.button>
                </>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-3 py-2 bg-blue-600 text-white rounded-lg text-sm flex items-center gap-1 mr-2"
                  onClick={toggleCombineMode}
                >
                  <CheckCircle className="w-4 h-4" />
                  Pilih Beberapa
                </motion.button>
              )}
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

        {/* Results Section */}
        <AnimatePresence mode="wait">
          {viewMode === 'grid' ? (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto"
            >
              {filteredData.map((item) => renderCard(item))}
            </motion.div>
          ) : (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-4"
            >
              {filteredData.map((item) => (
                <motion.div
                  key={item.id}
                  variants={itemVariants}
                  className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow p-4"
                >
                  <div className="flex flex-col md:flex-row md:items-center">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <div className="bg-blue-100 p-2 rounded-lg mr-3">
                          <Book className="w-6 h-6 text-blue-600" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900">{item.title}</h3>
                        <span className={`ml-3 px-2 py-1 text-xs rounded-full ${
                          item.level === 'Mudah' ? 'bg-green-100 text-green-800' :
                          item.level === 'Sedang' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {item.level}
                        </span>
                      </div>
                      
                      <p className="text-gray-600 text-sm mb-3">{item.description}</p>
                      
                      <div className="flex flex-wrap gap-4 mb-2">
                        <div className="flex items-center text-sm text-gray-500">
                          <User className="w-4 h-4 mr-1" />
                          <span>{item.lecturer}</span>
                        </div>
                        
                        <div className="flex items-center text-sm text-gray-500">
                          <Tag className="w-4 h-4 mr-1" />
                          <span>{item.questionCount} soal</span>
                        </div>
                        
                        <div className="flex items-center text-sm text-gray-500">
                          <Clock className="w-4 h-4 mr-1" />
                          {new Date(item.lastUpdated).toLocaleDateString('id-ID', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </div>
                        
                        <div className="flex items-center text-sm text-gray-500">
                          <Download className="w-4 h-4 mr-1" />
                          {item.downloads}
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-2 mt-3">
                        {parseTopics(item.topics).map((topic, index) => (
                          <span key={index} className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                            {topic}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <div className="mt-4 md:mt-0 md:ml-4 flex md:flex-col justify-end">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium"
                      >
                        Lihat Detail
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ))}
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
      
      {/* Modal untuk judul PDF gabungan */}
      <AnimatePresence>
        {showCombineModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl p-6 w-full max-w-md"
            >
              <h3 className="text-xl font-semibold mb-4">Gabung Set Soal</h3>
              <p className="text-gray-600 mb-4">
                Anda akan menggabungkan {selectedQuestionSets.length} set soal menjadi satu PDF.
                Silakan masukkan judul untuk PDF gabungan ini.
              </p>
              
              <div className="mb-4">
                <label htmlFor="combinedTitle" className="block text-sm font-medium text-gray-700 mb-1">
                  Judul PDF Gabungan
                </label>
                <input
                  type="text"
                  id="combinedTitle"
                  value={combinedPdfTitle}
                  onChange={(e) => setCombinedPdfTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Masukkan judul PDF gabungan"
                />
              </div>
              
              <div className="flex justify-end gap-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg"
                  onClick={() => {
                    setShowCombineModal(false);
                    setCombinedPdfTitle('');
                  }}
                >
                  Batal
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`px-4 py-2 rounded-lg ${!combinedPdfTitle ? 'bg-gray-300 text-gray-600 cursor-not-allowed' : 'bg-blue-600 text-white'}`}
                  onClick={combinedPdfTitle ? handleConfirmCombine : undefined}
                >
                  Gabung & Unduh
                </motion.button>
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