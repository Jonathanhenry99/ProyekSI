import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { Search, Filter, Download, User, Clock, Tag, Calendar, ArrowUpDown, X, CheckCircle, ChevronDown, FileText, BarChart2 } from 'lucide-react';
import Footer from '../components/Footer';
import Header from '../components/Header';

const SearchPage = ({ currentUser }) => {
  const [activeTab, setActiveTab] = useState('semua');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState([]);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [viewMode, setViewMode] = useState('grid');
  const [isLoading, setIsLoading] = useState(false); // Ubah nilai awal menjadi false
  const [searchQuery, setSearchQuery] = useState('');

  // Generate more comprehensive mock data
  const mockData = [
    {
      id: 1,
      fileName: 'UTS_MTK_2023_Ganjil.pdf',
      subject: 'Algoritma Struktur Dasar',
      year: 2023,
      lecturer: 'Dr. Ahmad Fauzi',
      level: 'Mudah',
      lastUpdated: '2024-02-20',
      topics: ['Kalkulus', 'Integral'],
      downloads: 245
    },
    {
      id: 2,
      fileName: 'UAS_Fisika_2023_Genap.pdf',
      subject: 'Fisika',
      year: 2023,
      lecturer: 'Prof. Siti Aminah',
      level: 'Sulit',
      lastUpdated: '2024-01-15',
      topics: ['Mekanika Kuantum', 'Relativitas'],
      downloads: 187
    },
    {
      id: 3,
      fileName: 'Quiz_Kimia_Organik.pdf',
      subject: 'Kimia',
      year: 2023,
      lecturer: 'Dr. Budi Santoso',
      level: 'Sedang',
      lastUpdated: '2024-01-28',
      topics: ['Kimia Organik', 'Alkena'],
      downloads: 156
    },
    {
      id: 4,
      fileName: 'Tugas_Algo_Strukdat.pdf',
      subject: 'Ilmu Komputer',
      year: 2023,
      lecturer: 'Dr. Wijaya Kusuma',
      level: 'Sedang',
      lastUpdated: '2024-02-10',
      topics: ['Algoritma', 'Struktur Data'],
      downloads: 325
    },
    {
      id: 5,
      fileName: 'UTS_Database_2023.pdf',
      subject: 'Sistem Database',
      year: 2023,
      lecturer: 'Dr. Rahmat Hidayat',
      level: 'Sulit',
      lastUpdated: '2023-12-05',
      topics: ['SQL', 'Normalisasi'],
      downloads: 289
    },
    {
      id: 6,
      fileName: 'UAS_Ekonomi_Makro.pdf',
      subject: 'Ekonomi',
      year: 2023,
      lecturer: 'Prof. Diana Putri',
      level: 'Mudah',
      lastUpdated: '2024-02-15',
      topics: ['Makroekonomi', 'Inflasi'],
      downloads: 178
    },
  ];

  // Simulate loading
  // Hapus useEffect untuk loading
  // useEffect(() => {
  //   const timer = setTimeout(() => {
  //     setIsLoading(false);
  //   }, 1500);
  //
  //   return () => clearTimeout(timer);
  // }, []);



  // Filter function
  const filterData = () => {
    return mockData.filter(item => {
      // Filter by search query
      const matchesSearch =
        searchQuery === '' ||
        item.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.lecturer.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.topics.some(topic => topic.toLowerCase().includes(searchQuery.toLowerCase()));

      // Filter by level
      const matchesLevel =
        selectedLevel.length === 0 ||
        selectedLevel.includes(item.level);

      // Filter by date
      const itemDate = new Date(item.lastUpdated);
      const matchesDate =
        (dateRange.start === '' || new Date(dateRange.start) <= itemDate) &&
        (dateRange.end === '' || new Date(dateRange.end) >= itemDate);

      return matchesSearch && matchesLevel && matchesDate;
    });
  };

  const filteredData = filterData();

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

  // Loading animation component
  const LoadingAnimation = () => (
    <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-90 z-50">
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
        Memuat Data...
      </motion.p>
    </div>
  );

  return (
    <div className="min-h-screen bg-white">
      <Header currentUser={currentUser} />
      
      {isLoading ? (
        <LoadingAnimation />
      ) : (
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
                Bank Soal <span className="text-blue-600">Informatika</span>
              </motion.h1>
              <motion.p
                className="text-lg text-gray-600"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                Temukan dan Unduh Soal untuk Kebutuhan Akademik Anda
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
                  placeholder="Cari soal berdasarkan mata kuliah, dosen, atau topik..."
                  className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-6 py-3 bg-blue-600 text-white rounded-xl flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors shadow-sm"
                onClick={() => setShowFilterModal(true)}
              >
                <Filter className="w-5 h-5" />
                Filter Lanjutan
              </motion.button>
            </div>

            {/* Applied Filters Display */}
            {(selectedLevel.length > 0 || dateRange.start || dateRange.end) && (
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
                    <button onClick={() => setSelectedLevel(prev => prev.filter(l => l !== level))}>
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
                    setDateRange({ start: '', end: '' });
                  }}
                >
                  <X className="w-3 h-3" />
                  Hapus Semua
                </motion.button>
              </motion.div>
            )}

            {/* Filter Tags */}
            <div className="flex flex-wrap gap-3 mt-6">
              {['Semua', 'Soal UTS', 'Soal UAS', 'Quiz', 'Tugas'].map((tab) => (
                <motion.button
                  key={tab}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`px-4 py-2 rounded-full transition-colors ${activeTab === tab.toLowerCase()
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  onClick={() => setActiveTab(tab.toLowerCase())}
                >
                  {tab}
                </motion.button>
              ))}
            </div>

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
                  className={`p-2 rounded ${viewMode === 'table' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}
                  onClick={() => setViewMode('table')}
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
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                key="grid-view"
              >
                {filteredData.map((item, index) => (
                  <motion.div
                    key={item.id}
                    variants={itemVariants}
                    whileHover={{ y: -5, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' }}
                    className="bg-white rounded-xl p-6 shadow-md border border-gray-100 transition-all"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-xl font-semibold text-gray-900">{item.subject}</h3>
                      <span className={`px-3 py-1 rounded-full text-sm ${item.level === 'Mudah' ? 'bg-green-100 text-green-700' :
                        item.level === 'Sedang' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                        {item.level}
                      </span>
                    </div>

                    <p className="text-sm text-gray-500 mb-4 border-b pb-3">
                      {item.fileName}
                    </p>

                    <div className="space-y-3 text-gray-600">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-blue-500" />
                        <span>{item.lecturer}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-blue-500" />
                        <span>Updated: {item.lastUpdated}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Tag className="w-4 h-4 text-blue-500" />
                        <div className="flex gap-2 flex-wrap">
                          {item.topics.map(topic => (
                            <span key={topic} className="text-sm bg-gray-100 px-2 py-1 rounded">
                              {topic}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full mt-6 flex items-center justify-center gap-2 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                    >
                      <Download className="w-4 h-4" />
                      Download ({item.downloads})
                    </motion.button>
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <motion.div
                className="overflow-x-auto max-w-7xl mx-auto bg-white rounded-xl shadow-lg"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                key="table-view"
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
                    {filteredData.map((item) => (
                      <motion.tr
                        key={item.id}
                        variants={itemVariants}
                        className="hover:bg-gray-50"
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {item.fileName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          {item.subject}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-3 py-1 rounded-full text-xs ${item.level === 'Mudah' ? 'bg-green-100 text-green-700' :
                            item.level === 'Sedang' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-red-100 text-red-700'
                            }`}>
                            {item.level}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          {item.lecturer}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          {item.lastUpdated}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 text-center">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="inline-flex items-center px-3 py-1 rounded-lg text-sm text-white bg-blue-600 hover:bg-blue-700"
                          >
                            <Download className="w-3 h-3 mr-1" />
                            Download
                          </motion.button>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </motion.div>
            )}
          </AnimatePresence>

          {/* No Results Message */}
          {filteredData.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16"
            >
              <p className="text-lg text-gray-600">Tidak ada hasil yang ditemukan. Silakan coba pencarian lain.</p>
            </motion.div>
          )}
        </div>
      )}

      {/* Filter Modal */}
      <AnimatePresence>
        {showFilterModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowFilterModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-900">Filter Pencarian</h3>
                <button
                  onClick={() => setShowFilterModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Level Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tingkat Kesulitan
                  </label>
                  <div className="space-y-2">
                    {['Mudah', 'Sedang', 'Sulit'].map((level) => (
                      <label key={level} className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          className="form-checkbox h-5 w-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                          checked={selectedLevel.includes(level)}
                          onChange={() => {
                            if (selectedLevel.includes(level)) {
                              setSelectedLevel(prev => prev.filter(l => l !== level));
                            } else {
                              setSelectedLevel(prev => [...prev, level]);
                            }
                          }}
                        />
                        <span className="text-gray-700">{level}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Date Range Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rentang Tanggal
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Dari</label>
                      <input
                        type="date"
                        className="w-full p-2 border border-gray-300 rounded-lg"
                        value={dateRange.start}
                        onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Sampai</label>
                      <input
                        type="date"
                        className="w-full p-2 border border-gray-300 rounded-lg"
                        value={dateRange.end}
                        onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                      />
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end space-x-3 pt-2">
                  <button
                    className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition"
                    onClick={() => {
                      setSelectedLevel([]);
                      setDateRange({ start: '', end: '' });
                    }}
                  >
                    Reset
                  </button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                    onClick={() => setShowFilterModal(false)}
                  >
                    Terapkan Filter
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Buttons for Sorting and Views (Mobile Friendly) */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
        className="fixed bottom-6 right-6 md:hidden"
      >
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="w-12 h-12 bg-blue-600 rounded-full shadow-lg flex items-center justify-center text-white"
          onClick={() => setShowFilterModal(true)}
        >
          <Filter className="w-5 h-5" />
        </motion.button>
      </motion.div>
      <Footer />
    </div>
  );
};

export default SearchPage;