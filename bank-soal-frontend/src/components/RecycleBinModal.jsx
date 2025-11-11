import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { 
  Archive, 
  X, 
  RefreshCw, 
  Trash, 
  BookOpen, 
  User, 
  Trash2, 
  Clock, 
  Check,
  Search
} from 'lucide-react';
import axios from 'axios';

const API_URL = "http://localhost:8080/api";

const RecycleBinModal = ({ 
  isOpen, 
  onClose, 
  currentUser, 
  courseOptions = [],
  onItemRestored,
  onItemPermanentlyDeleted 
}) => {
  const [recycleBinData, setRecycleBinData] = useState([]);
  const [isLoadingRecycleBin, setIsLoadingRecycleBin] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('deletedAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [hasFetched, setHasFetched] = useState(false); // Track if data has been fetched

  // Helper function to get auth token
  const getAuthToken = useCallback(() => {
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
  }, [currentUser]);

  // Memoized subject name lookup
  const getSubjectNameById = useCallback((subjectId) => {
    if (!subjectId || !courseOptions.length) return subjectId;
    
    const course = courseOptions.find(course => 
      course.id.toString() === subjectId.toString()
    );
    
    return course ? course.name : subjectId;
  }, [courseOptions]);

  // Optimized data fetching dengan abort controller
  const fetchRecycleBinData = useCallback(async (forceRefresh = false) => {
    if (isLoadingRecycleBin) return;
    
    // Don't fetch again if already fetched and not forcing refresh
    if (hasFetched && !forceRefresh) return;
    
    setIsLoadingRecycleBin(true);
    const abortController = new AbortController();
    
    try {
      const token = getAuthToken();
      if (!token) {
        alert('Token autentikasi tidak ditemukan. Silakan login kembali.');
        return;
      }

      console.log('🔄 Fetching recycle bin data...');
      
      const response = await axios.get(`${API_URL}/questionsets/recycle-bin/all`, {
        headers: { 
          "x-access-token": token,
          "Content-Type": "application/json"
        },
        signal: abortController.signal,
        timeout: 10000
      });
      
      const data = response.data?.data || response.data || [];
      
      // Batch transform data with minimal processing
      const transformedData = data.map(item => ({
        id: item.id,
        fileName: item.title || 'Untitled',
        subject: item.courseName || item.subjectName || getSubjectNameById(item.subject),
        subjectId: item.subject,
        year: item.year,
        lecturer: item.lecturer || item.creator?.fullName || item.creator?.username || 'Unknown',
        level: item.level || 'Unknown',
        lastUpdated: item.last_updated || item.updated_at || item.createdAt,
        deletedAt: item.deleted_at || item.deletedAt || new Date().toISOString(),
        deletedBy: item.deletedBy || item.deleted_by || null,
        topics: item.topics ? item.topics.split(',').map(topic => topic.trim()) : [],
        downloads: item.downloads || 0,
        description: item.description || '',
        hasAnswerKey: Array.isArray(item.files) && item.files.some(file => 
          file.filecategory === 'kunci' || file.filecategory === 'answers'
        ),
        hasTestCase: Array.isArray(item.files) && item.files.some(file => 
          file.filecategory === 'test' || file.filecategory === 'testCases'
        )
      }));
      
      setRecycleBinData(transformedData);
      setHasFetched(true); // Mark as fetched
      console.log(`✅ Loaded ${transformedData.length} deleted question sets`);
      
    } catch (error) {
      if (axios.isCancel(error)) {
        console.log('Request cancelled');
        return;
      }
      
      console.error("❌ Error fetching recycle bin data:", error);
      
      // Enhanced error handling
      const status = error.response?.status;
      const message = error.response?.data?.message || error.message;
      
      switch (status) {
        case 401:
          alert('Sesi telah berakhir. Silakan login kembali.');
          break;
        case 403:
          alert('Anda tidak memiliki izin untuk mengakses recycle bin.');
          break;
        case 404:
          alert('⚠️ Fitur Recycle Bin belum tersedia di backend.');
          break;
        case 500:
          if (message.includes('column') || message.includes('does not exist')) {
            alert('⚠️ Database belum dikonfigurasi untuk soft delete.');
          } else {
            alert(`❌ Server Error: ${message}`);
          }
          break;
        default:
          alert(`Gagal memuat recycle bin: ${message}`);
      }
      
      setRecycleBinData([]);
      setHasFetched(true); // Mark as fetched even on error to prevent infinite loop
    } finally {
      setIsLoadingRecycleBin(false);
    }
    
    return () => abortController.abort();
  }, [getAuthToken, getSubjectNameById, isLoadingRecycleBin, hasFetched]);

  // Optimized restore function
  const handleRestore = useCallback(async (id) => {
    if (isRestoring) return;
    
    setIsRestoring(true);
    try {
      const token = getAuthToken();
      if (!token) {
        alert('Token autentikasi tidak ditemukan. Silakan login kembali.');
        return;
      }

      console.log(`♻️ Restoring question set ID: ${id}`);
      
      // Try restore endpoint first, fallback to update
      let response;
      try {
        response = await axios.patch(`${API_URL}/questionsets/${id}/restore`, {}, {
          headers: { 
            "x-access-token": token,
            "Content-Type": "application/json"
          },
          timeout: 5000
        });
      } catch (error) {
        if (error.response?.status === 404) {
          response = await axios.patch(`${API_URL}/questionsets/${id}`, {
            isDeleted: false,
            deletedAt: null
          }, {
            headers: { 
              "x-access-token": token,
              "Content-Type": "application/json"
            },
            timeout: 5000
          });
        } else {
          throw error;
        }
      }

      if (response.status === 200 || response.status === 204) {
        // Optimistic update - remove from local state immediately
        setRecycleBinData(prev => prev.filter(item => item.id !== id));
        
        // Notify parent
        onItemRestored?.(id);
        
        alert('Soal berhasil dipulihkan');
      } else {
        throw new Error('Restore operation failed');
      }
    } catch (error) {
      console.error("❌ Error restoring question set:", error);
      
      const status = error.response?.status;
      switch (status) {
        case 401:
          alert('Sesi telah berakhir. Silakan login kembali.');
          break;
        case 403:
          alert('Anda tidak memiliki izin untuk memulihkan soal ini.');
          break;
        case 404:
          alert('Fitur restore belum tersedia atau soal tidak ditemukan.');
          break;
        default:
          alert('Gagal memulihkan soal. Silakan coba lagi.');
      }
    } finally {
      setIsRestoring(false);
    }
  }, [getAuthToken, onItemRestored, isRestoring]);

  // Optimized permanent delete
  const handlePermanentDelete = useCallback(async (id) => {
    if (!confirm('Apakah Anda yakin ingin menghapus soal ini secara permanen? Aksi ini tidak dapat dibatalkan.')) {
      return;
    }

    try {
      const token = getAuthToken();
      if (!token) {
        alert('Token autentikasi tidak ditemukan. Silakan login kembali.');
        return;
      }

      console.log(`🗑️ Permanently deleting question set ID: ${id}`);
      
      const response = await axios.delete(`${API_URL}/questionsets/${id}`, {
        headers: { 
          "x-access-token": token,
          "Content-Type": "application/json"
        },
        timeout: 5000
      });

      if (response.status === 200 || response.status === 204) {
        // Optimistic update
        setRecycleBinData(prev => prev.filter(item => item.id !== id));
        
        onItemPermanentlyDeleted?.(id);
        
        alert('Soal berhasil dihapus secara permanen');
      } else {
        throw new Error('Permanent delete failed');
      }
    } catch (error) {
      console.error("❌ Error permanently deleting question set:", error);
      if (error.response?.status === 404) {
        setRecycleBinData(prev => prev.filter(item => item.id !== id));
        alert('Soal sudah terhapus.');
      } else {
        alert('Gagal menghapus soal secara permanen. Silakan coba lagi.');
      }
    }
  }, [getAuthToken, onItemPermanentlyDeleted]);

  // Memoized filtered and sorted data
  const filteredAndSortedData = useMemo(() => {
    let filtered = recycleBinData;
    
    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(item => 
        item.fileName.toLowerCase().includes(query) ||
        item.subject.toLowerCase().includes(query) ||
        item.lecturer.toLowerCase().includes(query) ||
        item.topics.some(topic => topic.toLowerCase().includes(query))
      );
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];
      
      // Handle date sorting
      if (sortBy === 'deletedAt' || sortBy === 'lastUpdated') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }
      
      // Handle string sorting
      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
    
    return filtered;
  }, [recycleBinData, searchQuery, sortBy, sortOrder]);

  // Helper functions
  const formatDate = useCallback((dateString) => {
    if (!dateString) return 'Unknown';
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }, []);
  
  const getLevelColor = useCallback((level) => {
    switch(level) {
      case 'Mudah':
        return 'bg-green-100 text-green-700';
      case 'Sedang':
        return 'bg-yellow-100 text-yellow-700';
      case 'Sulit':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  }, []);

  // Load data when modal opens (only once unless forced)
  useEffect(() => {
    if (isOpen && !hasFetched) {
      fetchRecycleBinData();
    }
  }, [isOpen, hasFetched, fetchRecycleBinData]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      setSearchQuery('');
      setSortBy('deletedAt');
      setSortOrder('desc');
      setHasFetched(false); // Reset fetch status on unmount
    };
  }, []);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 backdrop-blur-md bg-white/30 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-2xl max-w-7xl w-full max-h-[90vh] shadow-2xl overflow-hidden backdrop-blur-sm border border-white/20"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex justify-between items-center p-6 border-b border-gray-200 bg-gray-50/80 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <Archive className="w-6 h-6 text-gray-600" />
              <div>
                <h3 className="text-xl font-bold text-gray-900">Recycle Bin</h3>
                <p className="text-sm text-gray-500">
                  {isLoadingRecycleBin ? 'Loading...' : `${filteredAndSortedData.length} dari ${recycleBinData.length} soal`}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-200/50 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Search and Sort Controls */}
          {!isLoadingRecycleBin && recycleBinData.length > 0 && (
            <div className="p-4 border-b border-gray-100 bg-white/50">
              <div className="flex flex-col md:flex-row gap-4">
                {/* Search */}
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Cari soal yang dihapus..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                
                {/* Sort Controls */}
                <div className="flex gap-2">
                
                  
                  <button
                    onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                    className="px-3 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    title={`Sort ${sortOrder === 'asc' ? 'Descending' : 'Ascending'}`}
                  >
                    {sortOrder === 'asc' ? '↑' : '↓'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Content */}
          <div className="overflow-y-auto max-h-[calc(90vh-220px)] bg-white/90 backdrop-blur-sm">
            {isLoadingRecycleBin ? (
              <div className="flex items-center justify-center py-12">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"
                />
                <p className="ml-3 text-gray-600">Memuat data recycle bin...</p>
              </div>
            ) : recycleBinData.length === 0 ? (
              <div className="text-center py-12">
                <Archive className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h4 className="text-lg font-medium text-gray-900 mb-2">Recycle Bin Kosong</h4>
                <p className="text-gray-500">Tidak ada soal yang dihapus</p>
              </div>
            ) : filteredAndSortedData.length === 0 ? (
              <div className="text-center py-12">
                <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h4 className="text-lg font-medium text-gray-900 mb-2">Tidak Ada Hasil</h4>
                <p className="text-gray-500">Tidak ada soal yang cocok dengan pencarian</p>
              </div>
            ) : (
              <div className="p-6">
                <div className="space-y-3">
                  {filteredAndSortedData.map((item, index) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.02 }}
                      className="bg-gray-50/60 backdrop-blur-sm rounded-lg p-4 border border-gray-200/50 hover:shadow-md transition-shadow"
                    >
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="text-lg font-semibold text-gray-900 truncate">
                              {item.fileName}
                            </h4>
                            <span className={`px-2 py-1 text-xs rounded-full whitespace-nowrap ${getLevelColor(item.level)}`}>
                              {item.level}
                            </span>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3 text-sm">
                            <div className="space-y-1">
                              <div className="flex items-center text-gray-600">
                                <BookOpen className="w-4 h-4 mr-2 flex-shrink-0" />
                                <span className="truncate">{item.subject}</span>
                              </div>
                              <div className="flex items-center text-gray-600">
                                <User className="w-4 h-4 mr-2 flex-shrink-0" />
                                <span className="truncate">{item.lecturer}</span>
                              </div>
                            </div>
                            <div className="space-y-1">
                              <div className="flex items-center text-gray-600">
                                <Trash2 className="w-4 h-4 mr-2 flex-shrink-0" />
                                <span>Dihapus: {formatDate(item.deletedAt)}</span>
                              </div>
                              <div className="flex items-center text-gray-600">
                                <Clock className="w-4 h-4 mr-2 flex-shrink-0" />
                                <span>Dibuat: {formatDate(item.lastUpdated)}</span>
                              </div>
                            </div>
                          </div>

                          {item.topics?.length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-3">
                              {item.topics.slice(0, 3).map((topic, topicIndex) => (
                                <span
                                  key={topicIndex}
                                  className="px-2 py-1 bg-blue-100/70 text-blue-800 text-xs rounded-full backdrop-blur-sm"
                                >
                                  {topic}
                                </span>
                              ))}
                              {item.topics.length > 3 && (
                                <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                                  +{item.topics.length - 3} lagi
                                </span>
                              )}
                            </div>
                          )}

                          <div className="flex items-center gap-4 text-xs">
                            <span className={`flex items-center gap-1 ${item.hasAnswerKey ? 'text-green-600' : 'text-gray-400'}`}>
                              <Check className="w-3 h-3" /> Kunci Jawaban
                            </span>
                            <span className={`flex items-center gap-1 ${item.hasTestCase ? 'text-green-600' : 'text-gray-400'}`}>
                              <Check className="w-3 h-3" /> Test Case
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-col gap-2 flex-shrink-0">
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="px-4 py-2 bg-green-600/90 backdrop-blur-sm text-white text-sm rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed min-w-[100px] justify-center"
                            onClick={() => handleRestore(item.id)}
                            disabled={isRestoring}
                          >
                            {isRestoring ? (
                              <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                className="w-3 h-3 border-2 border-white border-t-transparent rounded-full"
                              />
                            ) : (
                              <RefreshCw className="w-3 h-3" />
                            )}
                            Pulihkan
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="px-4 py-2 bg-red-600/90 backdrop-blur-sm text-white text-sm rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2 min-w-[100px] justify-center"
                            onClick={() => handlePermanentDelete(item.id)}
                          >
                            <Trash className="w-3 h-3" />
                            Hapus
                          </motion.button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          {recycleBinData.length > 0 && (
            <div className="p-4 border-t border-gray-200/50 bg-gray-50/80 backdrop-blur-sm flex justify-between items-center">
              <p className="text-sm text-gray-500">
              
              </p>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-4 py-2 text-gray-600 hover:bg-gray-200/50 rounded-lg transition-colors flex items-center gap-2 backdrop-blur-sm"
                onClick={() => fetchRecycleBinData(true)}
                disabled={isLoadingRecycleBin}
              >
                <RefreshCw className={`w-4 h-4 ${isLoadingRecycleBin ? 'animate-spin' : ''}`} />
                Refresh
              </motion.button>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default RecycleBinModal;