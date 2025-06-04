import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { Search, Filter, Download, User, Clock, Tag, Calendar, ArrowUpDown, X, CheckCircle, ChevronDown, FileText, BarChart2, Plus, Book, Check } from 'lucide-react';
import Footer from '../components/Footer';
import Header from '../components/Header';
import { Link } from 'react-router-dom';

const QuestionSetsPage = ({ currentUser }) => {
  const [activeTab, setActiveTab] = useState('semua');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState([]);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [viewMode, setViewMode] = useState('grid');
  const [isLoading, setIsLoading] = useState(false);
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

  // Data untuk dropdown
  const difficultyLevels = ['Mudah', 'Sedang', 'Sulit'];
  const courseTags = ['Algoritma dan Struktur Data', 'Pemrograman Web', 'Basis Data', 'Pemrograman Berorientasi Objek', 'Jaringan Komputer', 'Kecerdasan Buatan'];
  const materialTags = ['Algoritma', 'Struktur Data', 'HTML', 'CSS', 'JavaScript', 'React', 'SQL', 'Normalisasi', 'ERD', 'OOP', 'Java', 'Inheritance', 'Polymorphism', 'TCP/IP', 'Routing', 'Switching', 'Machine Learning', 'Neural Network', 'AI'];

  // Generate mock data untuk paket soal
  const mockData = [
    {
      id: 1,
      title: 'UTS Algoritma dan Struktur Data 2023',
      description: 'Kumpulan soal untuk UTS mata kuliah Algoritma dan Struktur Data',
      questionCount: 15,
      lecturer: 'Dr. Ahmad Fauzi',
      level: 'Sedang',
      lastUpdated: '2024-02-20',
      topics: ['Algoritma', 'Struktur Data', 'Kompleksitas'],
      downloads: 245
    },
    {
      id: 2,
      title: 'UAS Pemrograman Web 2023',
      description: 'Kumpulan soal untuk UAS mata kuliah Pemrograman Web',
      questionCount: 10,
      lecturer: 'Prof. Siti Aminah',
      level: 'Sulit',
      lastUpdated: '2024-01-15',
      topics: ['HTML', 'CSS', 'JavaScript', 'React'],
      downloads: 187
    },
    {
      id: 3,
      title: 'Quiz Basis Data',
      description: 'Kumpulan soal quiz untuk mata kuliah Basis Data',
      questionCount: 8,
      lecturer: 'Dr. Budi Santoso',
      level: 'Mudah',
      lastUpdated: '2024-01-28',
      topics: ['SQL', 'Normalisasi', 'ERD'],
      downloads: 156
    },
    {
      id: 4,
      title: 'UTS Pemrograman Berorientasi Objek',
      description: 'Kumpulan soal untuk UTS mata kuliah PBO',
      questionCount: 12,
      lecturer: 'Dr. Wijaya Kusuma',
      level: 'Sedang',
      lastUpdated: '2024-02-10',
      topics: ['OOP', 'Java', 'Inheritance', 'Polymorphism'],
      downloads: 325
    },
    {
      id: 5,
      title: 'UAS Jaringan Komputer',
      description: 'Kumpulan soal untuk UAS mata kuliah Jaringan Komputer',
      questionCount: 20,
      lecturer: 'Dr. Rahmat Hidayat',
      level: 'Sulit',
      lastUpdated: '2023-12-05',
      topics: ['TCP/IP', 'Routing', 'Switching'],
      downloads: 289
    },
    {
      id: 6,
      title: 'Quiz Kecerdasan Buatan',
      description: 'Kumpulan soal quiz untuk mata kuliah Kecerdasan Buatan',
      questionCount: 10,
      lecturer: 'Prof. Diana Putri',
      level: 'Mudah',
      lastUpdated: '2024-02-15',
      topics: ['Machine Learning', 'Neural Network', 'AI'],
      downloads: 178
    },
  ];

  // Filter function
  const filterData = () => {
    return mockData.filter(item => {
      // Filter by search query
      const matchesSearch =
        searchQuery === '' ||
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.lecturer.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.topics.some(topic => topic.toLowerCase().includes(searchQuery.toLowerCase()));

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
          item.topics.some(topic => topic.toLowerCase().includes(tag.toLowerCase()))
        );

      // Filter by date
      const itemDate = new Date(item.lastUpdated);
      const matchesDate =
        (dateRange.start === '' || new Date(dateRange.start) <= itemDate) &&
        (dateRange.end === '' || new Date(dateRange.end) >= itemDate);

      return matchesSearch && matchesLevel && matchesCourseTags && matchesMaterialTags && matchesDate;
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

        {/* Results Section */}
        <AnimatePresence mode="wait">
          {viewMode === 'grid' ? (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {filteredData.map((item) => (
                <motion.div
                  key={item.id}
                  variants={itemVariants}
                  className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center">
                        <div className="bg-blue-100 p-2 rounded-lg mr-3">
                          <Book className="w-6 h-6 text-blue-600" />
                        </div>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          item.level === 'Mudah' ? 'bg-green-100 text-green-800' :
                          item.level === 'Sedang' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {item.level}
                        </span>
                      </div>
                      <div className="flex items-center text-gray-500 text-sm">
                        <Download className="w-4 h-4 mr-1" />
                        {item.downloads}
                      </div>
                    </div>
                    
                    <h3 className="text-lg font-semibold mb-2 text-gray-900">{item.title}</h3>
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">{item.description}</p>
                    
                    <div className="flex items-center text-sm text-gray-500 mb-3">
                      <User className="w-4 h-4 mr-1" />
                      <span>{item.lecturer}</span>
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-500 mb-4">
                      <Tag className="w-4 h-4 mr-1" />
                      <span>{item.questionCount} soal</span>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 mb-4">
                      {item.topics.slice(0, 3).map((topic, index) => (
                        <span key={index} className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                          {topic}
                        </span>
                      ))}
                      {item.topics.length > 3 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                          +{item.topics.length - 3}
                        </span>
                      )}
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <div className="text-xs text-gray-500 flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        {new Date(item.lastUpdated).toLocaleDateString('id-ID', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </div>
                      
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-medium"
                      >
                        Lihat Detail
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ))}
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
                        {item.topics.map((topic, index) => (
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
      
      <Footer />
    </div>
  );
};

export default QuestionSetsPage;