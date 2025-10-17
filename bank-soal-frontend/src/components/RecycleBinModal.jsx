import React, { useState, useEffect } from 'react';
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
  Check 
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

  // Helper function untuk mendapatkan nama mata kuliah berdasarkan ID
  const getSubjectNameById = (subjectId) => {
    if (!subjectId || !courseOptions.length) return subjectId;
    
    const course = courseOptions.find(course => 
      course.id.toString() === subjectId.toString()
    );
    
    return course ? course.name : subjectId;
  };

  // Fungsi untuk mengambil data recycle bin
  const fetchRecycleBinData = async () => {
    setIsLoadingRecycleBin(true);
    try {
      const token = getAuthToken();
      if (!token) {
        alert('Token autentikasi tidak ditemukan. Silakan login kembali.');
        setIsLoadingRecycleBin(false);
        return;
      }

      console.log('🔄 Fetching recycle bin data...');
      
      const response = await axios.get(`${API_URL}/questionsets/recycle-bin/all`, {
        headers: { 
          "x-access-token": token,
          "Content-Type": "application/json"
        }
      });
      
      const data = response.data?.data || response.data || [];
      
      // Transform data
      const transformedData = data.map(item => {
        let subjectName = item.subject;
        
        if (item.courseName || item.subjectName) {
          subjectName = item.courseName || item.subjectName;
        } else if (courseOptions.length > 0) {
          const course = courseOptions.find(course => 
            course.id.toString() === item.subject.toString()
          );
          subjectName = course ? course.name : item.subject;
        }
        
        return {
          id: item.id,
          fileName: item.title,
          subject: subjectName,
          subjectId: item.subject,
          year: item.year,
          lecturer: item.lecturer || (item.creator ? (item.creator.fullName || item.creator.username) : 'Unknown'),
          level: item.level,
          lastUpdated: new Date(item.last_updated || item.updated_at || item.createdAt).toISOString(),
          deletedAt: new Date(item.deleted_at || item.deletedAt || new Date()).toISOString(),
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
        };
      });
      
      setRecycleBinData(transformedData);
      console.log(`✅ Loaded ${transformedData.length} deleted question sets`);
      
    } catch (error) {
      console.error("❌ Error fetching recycle bin data:", error);
      
      if (error.response?.status === 401) {
        alert('Sesi telah berakhir. Silakan login kembali.');
        setRecycleBinData([]);
      } else if (error.response?.status === 403) {
        alert('Anda tidak memiliki izin untuk mengakses recycle bin.');
        setRecycleBinData([]);
      } else if (error.response?.status === 404) {
        alert('⚠️ Fitur Recycle Bin belum tersedia.\n\nKemungkinan:\n1. Backend belum diupdate\n2. Server belum direstart\n3. Route order salah\n\nSilakan hubungi administrator.');
        setRecycleBinData([]);
      } else if (error.response?.status === 500) {
        const errorMsg = error.response?.data?.error || error.message;
        
        if (errorMsg.includes('column') || errorMsg.includes('does not exist')) {
          alert('⚠️ Database Error!\n\nKolom "is_deleted", "deleted_at", atau "deleted_by" belum ada di database.\n\nSilakan jalankan migration SQL terlebih dahulu.');
        } else if (errorMsg.includes('association') || errorMsg.includes('deletedByUser')) {
          alert('⚠️ Model Error!\n\nAssociation "deletedByUser" belum terdaftar.\n\nSilakan update models/index.js dengan associations yang benar.');
        } else {
          alert(`❌ Server Error:\n${errorMsg}\n\nCek console server untuk detail lengkap.`);
        }
        
        setRecycleBinData([]);
      } else {
        alert(`Gagal memuat recycle bin: ${error.response?.data?.message || error.message}`);
        setRecycleBinData([]);
      }
    } finally {
      setIsLoadingRecycleBin(false);
    }
  };

  // Fungsi untuk restore dari recycle bin
  const handleRestore = async (id) => {
    setIsRestoring(true);
    try {
      const token = getAuthToken();
      if (!token) {
        alert('Token autentikasi tidak ditemukan. Silakan login kembali.');
        return;
      }

      console.log(`♻️ Restoring question set ID: ${id}`);
      
      let response;
      let restoreSuccess = false;
      
      // Try restore endpoint first
      try {
        response = await axios.patch(`${API_URL}/questionsets/${id}/restore`, {}, {
          headers: { 
            "x-access-token": token,
            "Content-Type": "application/json"
          }
        });
        restoreSuccess = true;
      } catch (error) {
        if (error.response?.status === 404) {
          // Fallback: try update with isDeleted = false
          try {
            response = await axios.patch(`${API_URL}/questionsets/${id}`, {
              isDeleted: false,
              deletedAt: null
            }, {
              headers: { 
                "x-access-token": token,
                "Content-Type": "application/json"
              }
            });
            restoreSuccess = true;
          } catch (updateError) {
            throw updateError;
          }
        } else {
          throw error;
        }
      }

      if (restoreSuccess && (response.status === 200 || response.status === 204)) {
        console.log('✅ Question set restored successfully');
        
        // Remove from recycle bin data
        setRecycleBinData(prev => prev.filter(item => item.id !== id));
        
        // Notify parent component
        if (onItemRestored) {
          onItemRestored(id);
        }
        
        alert('Soal berhasil dipulihkan');
      } else {
        throw new Error('Restore operation failed');
      }
    } catch (error) {
      console.error("❌ Error restoring question set:", error);
      
      if (error.response?.status === 401) {
        alert('Sesi telah berakhir. Silakan login kembali.');
      } else if (error.response?.status === 403) {
        alert('Anda tidak memiliki izin untuk memulihkan soal ini.');
      } else if (error.response?.status === 404) {
        alert('Fitur restore belum tersedia atau soal tidak ditemukan.');
      } else {
        alert('Gagal memulihkan soal. Silakan coba lagi.');
      }
    } finally {
      setIsRestoring(false);
    }
  };

  // Fungsi untuk permanent delete
  const handlePermanentDelete = async (id) => {
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
        }
      });

      if (response.status === 200 || response.status === 204) {
        console.log('✅ Question set permanently deleted');
        
        // Remove from recycle bin data
        setRecycleBinData(prev => prev.filter(item => item.id !== id));
        
        // Notify parent component
        if (onItemPermanentlyDeleted) {
          onItemPermanentlyDeleted(id);
        }
        
        alert('Soal berhasil dihapus secara permanen');
      } else {
        throw new Error('Permanent delete failed');
      }
    } catch (error) {
      console.error("❌ Error permanently deleting question set:", error);
      if (error.response?.status === 404) {
        // Item already deleted, remove from UI
        setRecycleBinData(prev => prev.filter(item => item.id !== id));
        alert('Soal sudah terhapus.');
      } else {
        alert('Gagal menghapus soal secara permanen. Silakan coba lagi.');
      }
    }
  };

  // Helper functions
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  const getLevelColor = (level) => {
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
  };

  // Load data when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchRecycleBinData();
    }
  }, [isOpen]);

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
          className="bg-white rounded-2xl max-w-6xl w-full max-h-[90vh] shadow-2xl overflow-hidden backdrop-blur-sm border border-white/20"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex justify-between items-center p-6 border-b border-gray-200 bg-gray-50/80 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <Archive className="w-6 h-6 text-gray-600" />
              <div>
                <h3 className="text-xl font-bold text-gray-900">Recycle Bin</h3>
                <p className="text-sm text-gray-500">
                  {recycleBinData.length} soal dihapus
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

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)] bg-white/90 backdrop-blur-sm">
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
            ) : (
              <div className="space-y-4">
                {recycleBinData.map((item) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gray-50/60 backdrop-blur-sm rounded-lg p-4 border border-gray-200/50"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-3">
                          <h4 className="text-lg font-semibold text-gray-900 mb-1">
                            {item.fileName}
                          </h4>
                          <span className={`px-2 py-1 text-xs rounded-full ${getLevelColor(item.level)}`}>
                            {item.level}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                          <div className="space-y-2">
                            <div className="flex items-center text-sm text-gray-600">
                              <BookOpen className="w-4 h-4 mr-2" />
                              <span>{item.subject}</span>
                            </div>
                            <div className="flex items-center text-sm text-gray-600">
                              <User className="w-4 h-4 mr-2" />
                              <span>{item.lecturer}</span>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center text-sm text-gray-600">
                              <Trash2 className="w-4 h-4 mr-2" />
                              <span>Dihapus: {formatDate(item.deletedAt)}</span>
                            </div>
                            <div className="flex items-center text-sm text-gray-600">
                              <Clock className="w-4 h-4 mr-2" />
                              <span>Dibuat: {formatDate(item.lastUpdated)}</span>
                            </div>
                          </div>
                        </div>

                        {item.topics?.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-3">
                            {item.topics.map((topic, index) => (
                              <span
                                key={index}
                                className="px-2 py-1 bg-blue-100/70 text-blue-800 text-xs rounded-full backdrop-blur-sm"
                              >
                                {topic}
                              </span>
                            ))}
                          </div>
                        )}

                        <div className="mb-4">
                          <div className="flex items-center gap-4">
                            <span className={`text-xs flex items-center gap-1 ${item.hasAnswerKey ? 'text-green-600' : 'text-gray-400'}`}>
                              <Check className="w-3 h-3" /> Kunci Jawaban
                            </span>
                            <span className={`text-xs flex items-center gap-1 ${item.hasTestCase ? 'text-green-600' : 'text-gray-400'}`}>
                              <Check className="w-3 h-3" /> Test Case
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2 ml-4">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="px-3 py-2 bg-green-600/90 backdrop-blur-sm text-white text-sm rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
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
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="px-3 py-2 bg-red-600/90 backdrop-blur-sm text-white text-sm rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
                          onClick={() => handlePermanentDelete(item.id)}
                        >
                          <Trash className="w-3 h-3" />
                          Hapus Permanen
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {recycleBinData.length > 0 && (
            <div className="p-4 border-t border-gray-200/50 bg-gray-50/80 backdrop-blur-sm flex justify-between items-center">
              <p className="text-sm text-gray-500">
                💡 Tips: Soal yang dihapus akan disimpan selama 30 hari
              </p>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-4 py-2 text-gray-600 hover:bg-gray-200/50 rounded-lg transition-colors flex items-center gap-2 backdrop-blur-sm"
                onClick={fetchRecycleBinData}
              >
                <RefreshCw className="w-4 h-4" />
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