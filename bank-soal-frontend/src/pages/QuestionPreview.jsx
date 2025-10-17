import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from "framer-motion";
import { ArrowLeft, Download, FileText, File, BookOpen, Trash2, AlertTriangle, Upload, RotateCcw, X, CheckCircle } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import EditModal from '../components/EditModal';
import axios from 'axios';
import AuthService from '../services/auth.service';

const API_URL = "http://localhost:8080/api";

// Setup axios interceptor for authentication
axios.interceptors.request.use(
(config) => {
  let token = localStorage.getItem('token') || sessionStorage.getItem('token');
  
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
  
  if (token) {
    config.headers['x-access-token'] = token;
    delete config.headers['Authorization'];
  }
  
  return config;
},
(error) => {
  return Promise.reject(error);
}
);

// Upload Modal Component
const UploadFileModal = ({ isOpen, onClose, questionSetId, fileCategory, onFileUploaded }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFileChange = (file) => {
    if (!file) return;

    const validTypes = ['.pdf', '.docx', '.txt'];
    const fileExt = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    
    if (!validTypes.includes(fileExt)) {
      setError(`Format file ${fileExt} tidak didukung. Gunakan PDF, DOCX, atau TXT.`);
      return;
    }

    setSelectedFile(file);
    setError(null);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('questionSetId', questionSetId);
      formData.append('fileCategory', fileCategory);

      const response = await axios.post(`${API_URL}/files/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (onFileUploaded) {
        onFileUploaded(response.data.file);
      }

      onClose();
    } catch (err) {
      console.error('Error uploading file:', err);
      setError('Gagal mengupload file. Silakan coba lagi.');
    } finally {
      setUploading(false);
    }
  };

  useEffect(() => {
    if (!isOpen) {
      setSelectedFile(null);
      setError(null);
      setDragOver(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const getCategoryDisplayName = (category) => {
    switch (category) {
      case 'soal':
      case 'questions':
        return 'Soal';
      case 'kunci':
      case 'answers':
        return 'Kunci Jawaban';
      case 'test':
      case 'testCases':
        return 'Test Cases';
      default:
        return 'File';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 flex items-center justify-center z-50 p-4"
      style={{ 
        background: 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(10px)'
      }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-gray-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
              <Upload className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Upload {getCategoryDisplayName(fileCategory)}</h2>
              <p className="text-gray-500 text-sm">Tambahkan file baru</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        <div
          className={`relative border-2 border-dashed rounded-xl p-6 transition-all mb-6 ${
            dragOver ? 'border-blue-400 bg-blue-50' :
            selectedFile ? 'border-green-400 bg-green-50' :
            'border-gray-300 hover:border-blue-400'
          }`}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            const files = Array.from(e.dataTransfer.files);
            if (files.length > 0) handleFileChange(files[0]);
          }}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={(e) => {
            e.preventDefault();
            setDragOver(false);
          }}
        >
          <input
            type="file"
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            onChange={(e) => handleFileChange(e.target.files[0])}
            accept=".pdf,.docx,.txt"
          />
          
          <div className="text-center">
            {selectedFile ? (
              <div className="flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-green-500 mr-3" />
                <div>
                  <p className="font-medium text-gray-900">{selectedFile.name}</p>
                  <p className="text-sm text-gray-500">
                    {(selectedFile.size / 1024).toFixed(1)} KB
                  </p>
                </div>
              </div>
            ) : (
              <div>
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-700 mb-2">Pilih file {getCategoryDisplayName(fileCategory)}</p>
                <p className="text-sm text-gray-500">Drag & drop atau klik untuk memilih</p>
                <p className="text-xs text-gray-400 mt-2">Format: PDF, DOCX, TXT</p>
              </div>
            )}
          </div>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={onClose}
            disabled={uploading}
            className="flex-1 px-4 py-3 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
          >
            Batal
          </button>
          <button
            onClick={handleUpload}
            disabled={!selectedFile || uploading}
            className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center"
          >
            {uploading ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"
                />
                Mengupload...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Upload File
              </>
            )}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

// Enhanced Combined PDF Viewer Component
const CombinedPDFViewer = ({ questionSetId, type = 'questions', isAuthenticated, onFileUploaded }) => {
  const [pdfUrl, setPdfUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const fetchCombinedPDF = async (forceRefresh = false) => {
    try {
      setLoading(true);
      
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
        setPdfUrl(null);
      }
      
      const timestamp = forceRefresh ? `&_t=${Date.now()}` : '';
      const response = await axios.get(
        `${API_URL}/files/combine-preview/${questionSetId}?type=${type}${timestamp}`, 
        {
          responseType: 'blob',
          headers: forceRefresh ? {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          } : {}
        }
      );
      
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setPdfUrl(url);
      setError(null);
    } catch (err) {
      console.error(`Error loading ${type} PDF:`, err);
      
      if (err.response?.status === 404) {
        setError(`Belum ada file ${type === 'questions' ? 'soal dan test cases' : 'kunci jawaban'} untuk ditampilkan`);
      } else if (err.response?.status === 500) {
        setError(`Gagal memproses file ${type === 'questions' ? 'soal dan test cases' : 'kunci jawaban'}`);
      } else {
        setError(`Gagal memuat ${type === 'questions' ? 'soal dan test cases' : 'kunci jawaban'}`);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (questionSetId) {
      fetchCombinedPDF();
    }

    return () => {
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }
    };
  }, [questionSetId, type, refreshKey]);

  const getUploadCategory = (type) => {
    switch (type) {
      case 'questions':
        return 'questions';
      case 'answers':
        return 'answers';
      default:
        return 'testCases';
    }
  };

  const handleFileUploaded = async (file) => {
    console.log('File uploaded:', file);
    
    if (onFileUploaded) {
      onFileUploaded(file);
    }
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setRefreshKey(prev => prev + 1);
    await fetchCombinedPDF(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[600px] bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat {type === 'questions' ? 'soal dan test cases' : 'kunci jawaban'}...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[600px] bg-gray-50 border border-gray-200 rounded-lg">
        <FileText className="w-16 h-16 text-gray-400 mb-4" />
        <p className="text-gray-600 text-center max-w-md mb-4">{error}</p>
        <p className="text-sm text-gray-500 mb-6 text-center">
          {type === 'questions' ? 
            'Upload file soal atau test cases untuk melihat preview' : 
            'Upload file kunci jawaban untuk melihat preview'
          }
        </p>
        
        {isAuthenticated && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setUploadModalOpen(true)}
            className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md"
          >
            <Upload className="w-5 h-5 mr-2" />
            Upload {type === 'questions' ? 'Soal/Test Cases' : 'Kunci Jawaban'}
          </motion.button>
        )}

        <UploadFileModal
          isOpen={uploadModalOpen}
          onClose={() => setUploadModalOpen(false)}
          questionSetId={questionSetId}
          fileCategory={getUploadCategory(type)}
          onFileUploaded={handleFileUploaded}
        />
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="w-full h-[600px] border border-gray-300 rounded-lg overflow-hidden">
        <iframe 
          key={`pdf-${refreshKey}`}
          src={pdfUrl}
          className="w-full h-full"
          title={`${type === 'questions' ? 'Soal dan Test Cases' : 'Kunci Jawaban'} Viewer`}
        />
      </div>
      
      {isAuthenticated && (
        <button
          onClick={() => {
            setRefreshKey(prev => prev + 1);
            fetchCombinedPDF(true);
          }}
          className="absolute top-4 right-4 p-2 bg-white bg-opacity-90 hover:bg-opacity-100 rounded-full shadow-md transition-all"
          title="Refresh Preview"
        >
          <RotateCcw className="w-4 h-4 text-gray-600" />
        </button>
      )}
    </div>
  );
};

// Delete Confirmation Modal Component
const DeleteConfirmationModal = ({ isOpen, onClose, file, onConfirm, loading }) => {
  if (!isOpen || !file) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 flex items-center justify-center z-50 p-4"
      style={{ 
        background: 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(10px)'
      }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-gray-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center mb-6">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mr-4">
            <Trash2 className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Hapus File</h2>
            <p className="text-gray-500 text-sm">Konfirmasi penghapusan file</p>
          </div>
        </div>

        <div className="mb-6">
          <p className="text-gray-700 mb-4">
            Apakah Anda yakin ingin menghapus file berikut?
          </p>
          
          <div className="p-4 bg-gray-50 rounded-lg border">
            <div className="flex items-center">
              <FileText className="w-5 h-5 text-gray-400 mr-2" />
              <div>
                <p className="font-medium text-gray-900">{file.originalname}</p>
                <p className="text-sm text-gray-500">
                  {file.filetype?.toUpperCase()} • {Math.round(file.filesize / 1024)} KB
                </p>
              </div>
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start">
              <AlertTriangle className="w-4 h-4 text-red-600 mr-2 mt-0.5" />
              <div className="text-sm">
                <p className="text-red-800 font-medium mb-1">Peringatan</p>
                <p className="text-red-700">
                  File akan dihapus secara permanen dan tidak dapat dipulihkan.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 px-4 py-3 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
          >
            Batal
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center"
          >
            {loading ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"
                />
                Menghapus...
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4 mr-2" />
                Hapus File
              </>
            )}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

// Toast Notification Component
const Toast = ({ message, type = 'success', isVisible, onClose }) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -50, x: '-50%' }}
      animate={{ opacity: 1, y: 0, x: '-50%' }}
      exit={{ opacity: 0, y: -50, x: '-50%' }}
      className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 px-6 py-3 rounded-lg shadow-lg ${
        type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
      }`}
    >
      <div className="flex items-center">
        {type === 'success' ? (
          <div className="w-5 h-5 rounded-full bg-white bg-opacity-20 flex items-center justify-center mr-3">
            <div className="w-2 h-2 bg-white rounded-full"></div>
          </div>
        ) : (
          <AlertTriangle className="w-5 h-5 mr-3" />
        )}
        <span className="font-medium">{message}</span>
      </div>
    </motion.div>
  );
};

// Main QuestionPreview Component
const QuestionPreview = ({ currentUser }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [questionSet, setQuestionSet] = useState(null);
  const [files, setFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('questions');
  const [combinedPdfUrl, setCombinedPdfUrl] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [fileToDelete, setFileToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [toast, setToast] = useState({ isVisible: false, message: '', type: 'success' });
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [tabUploadModal, setTabUploadModal] = useState({ isOpen: false, category: '', questionSetId: null });

  useEffect(() => {
    const user = AuthService?.getCurrentUser ? AuthService.getCurrentUser() : null;
    const token = localStorage.getItem('token') || sessionStorage.getItem('token') || user?.accessToken;
    
    setIsAuthenticated(!!token);
    
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const isExpired = payload.exp < Date.now() / 1000;
        if (isExpired) {
          localStorage.removeItem('token');
          sessionStorage.removeItem('token');
          localStorage.removeItem('user');
          setIsAuthenticated(false);
          showToast('Sesi Anda telah berakhir. Silakan login ulang.', 'error');
        }
      } catch (e) {
        console.error('Invalid token:', e);
        localStorage.removeItem('token');
        sessionStorage.removeItem('token');
        setIsAuthenticated(false);
      }
    }

    fetchQuestionSetDetails();
  }, [id]);

  useEffect(() => {
    if (questionSet && questionSet.id) {
      setCombinedPdfUrl(`${API_URL}/files/combine-preview/${questionSet.id}`);
    }
  }, [questionSet]);

  const showToast = (message, type = 'success') => {
    setToast({ isVisible: true, message, type });
  };

  const hideToast = () => {
    setToast({ ...toast, isVisible: false });
  };

  const fetchQuestionSetDetails = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`${API_URL}/questionsets/${id}`);
      setQuestionSet(response.data);
      
      const activeFiles = response.data.files.filter(file => 
        file.is_deleted !== true && file.isDeleted !== true
      );
      
      const filesByCategory = {};
      activeFiles.forEach(file => {
        let category = file.filecategory;
        
        if (category === 'soal') category = 'questions';
        if (category === 'kunci') category = 'answers';
        if (category === 'test') category = 'testCases';
        
        if (!filesByCategory[category]) {
          filesByCategory[category] = [];
        }
        filesByCategory[category].push(file);
      });
      
      console.log('📁 Filtered files by category:', filesByCategory);
      setFiles(filesByCategory);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching question set details:", error);
      setIsLoading(false);
      showToast('Gagal memuat data soal', 'error');
    }
  };

  const handleModalClose = (updateSuccess = false) => {
    setIsEditModalOpen(false);
    if (updateSuccess) {
      fetchQuestionSetDetails(); 
    }
  };

  const handleDownload = (fileId) => {
    window.open(`${API_URL}/files/download/${fileId}`, '_blank');
  };

  const handleDeleteClick = (file) => {
    setFileToDelete(file);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!fileToDelete) return;

    setDeleteLoading(true);
    try {
      const response = await axios.delete(`${API_URL}/files/${fileToDelete.id}`);
      
      if (response.status === 200) {
        showToast(`File "${fileToDelete.originalname}" berhasil dihapus`, 'success');
        fetchQuestionSetDetails();
        setDeleteModalOpen(false);
        setFileToDelete(null);
      }
    } catch (error) {
      console.error('Error deleting file:', error);
      
      if (error.response?.status === 404) {
        showToast('File tidak ditemukan', 'error');
      } else if (error.response?.status === 403) {
        showToast('Anda tidak memiliki izin untuk menghapus file ini', 'error');
      } else {
        showToast('Gagal menghapus file. Silakan coba lagi.', 'error');
      }
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleFileUploaded = (newFile) => {
    showToast(`File "${newFile.originalname}" berhasil diupload`, 'success');
    fetchQuestionSetDetails();
  };

  const handleBack = () => {
    navigate(-1);
  };

  const renderFileActionButtons = (file) => {
    if (file.is_deleted || file.isDeleted) {
      return null;
    }

    return (
      <div className="flex items-center space-x-2">
        <button
          onClick={() => handleDownload(file.id)}
          className="flex items-center text-blue-600 hover:text-blue-800 transition-colors px-3 py-2 rounded-lg hover:bg-blue-50"
          title="Download file"
        >
          <Download size={18} className="mr-1" />
          Download
        </button>
        {isAuthenticated && (
          <button
            onClick={() => handleDeleteClick(file)}
            className="flex items-center text-red-600 hover:text-red-800 transition-colors px-3 py-2 rounded-lg hover:bg-red-50"
            title="Hapus file"
          >
            <Trash2 size={18} className="mr-1" />
            Delete
          </button>
        )}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!questionSet) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <p className="text-xl text-gray-700 mb-4">Soal tidak ditemukan</p>
        <button
          onClick={handleBack}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Kembali
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header currentUser={currentUser} />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <button
            onClick={handleBack}
            className="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
          >
            <ArrowLeft size={20} className="mr-1" />
            Kembali ke pencarian
          </button>
        </div>
        
        {!isAuthenticated && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start">
              <AlertTriangle className="w-5 h-5 text-red-600 mr-3 mt-0.5" />
              <div className="flex-1">
                <h3 className="text-red-800 font-semibold mb-2">Authentication Required</h3>
                <p className="text-red-700 mb-3">
                  Anda belum login atau sesi Anda telah berakhir. Silakan login terlebih dahulu untuk dapat mengelola file.
                </p>
                <button 
                  onClick={() => navigate('/login')}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                >
                  Login Sekarang
                </button>
              </div>
            </div>
          </div>
        )}
        
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-2">
            <h1 className="text-2xl font-bold text-gray-900">{questionSet.title}</h1>
            {isAuthenticated && (
              <button
                onClick={() => setIsEditModalOpen(true)}
                className="mt-4 md:mt-0 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Edit Soal
              </button>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="flex items-center text-gray-700">
              <BookOpen size={18} className="mr-2" />
              <span>{questionSet.subject}</span>
            </div>
            <div className="flex items-center text-gray-700">
              <span className="font-medium mr-2">Tingkat Kesulitan:</span>
              <span className={`px-2 py-1 text-xs rounded-full ${
                {
                  'Mudah': 'bg-green-100 text-green-700',
                  'Sedang': 'bg-yellow-100 text-yellow-700',
                  'Sulit': 'bg-red-100 text-red-700'
                }[questionSet.level] || 'bg-gray-100 text-gray-700'
              }`}>
                {questionSet.level}
              </span>
            </div>
            <div className="flex items-center text-gray-700">
              <span className="font-medium mr-2">Tahun:</span>
              <span>{questionSet.year}</span>
            </div>
          </div>
          
          {questionSet.description && (
            <div className="mt-4">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Deskripsi</h3>
              <p className="text-gray-700">{questionSet.description}</p>
            </div>
          )}
          
          {isEditModalOpen && (
            <EditModal 
              isOpen={isEditModalOpen}
              onClose={handleModalClose}
              questionSet={questionSet}
              currentUser={currentUser} 
            />
          )}
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Soal dan Test Cases</h3>
            </div>
            <div className="p-4">
              {questionSet && questionSet.id ? (
                <CombinedPDFViewer 
                  questionSetId={questionSet.id} 
                  type="questions" 
                  isAuthenticated={isAuthenticated}
                  onFileUploaded={handleFileUploaded}
                />
              ) : (
                <div className="flex items-center justify-center p-10">
                  <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Kunci Jawaban</h3>
            </div>
            <div className="p-4">
              {questionSet && questionSet.id ? (
                <CombinedPDFViewer 
                  questionSetId={questionSet.id} 
                  type="answers" 
                  isAuthenticated={isAuthenticated}
                  onFileUploaded={handleFileUploaded}
                />
              ) : (
                <div className="flex items-center justify-center p-10">
                  <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex justify-between items-center border-b border-gray-200 mb-6">
          <div className="flex">
            <button
              className={`px-4 py-2 font-medium ${activeTab === 'questions' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => setActiveTab('questions')}
            >
              Soal ({files.questions ? files.questions.length : 0})
            </button>
            <button
              className={`px-4 py-2 font-medium ${activeTab === 'answers' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => setActiveTab('answers')}
            >
              Jawaban ({files.answers ? files.answers.length : 0})
            </button>
            <button
              className={`px-4 py-2 font-medium ${activeTab === 'testCases' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => setActiveTab('testCases')}
            >
              Test Cases ({files.testCases ? files.testCases.length : 0})
            </button>
          </div>
        </div>
        
        <div className="space-y-6">
          {files[activeTab] && files[activeTab].length > 0 ? (
            files[activeTab].map((file, index) => (
              <motion.div 
                key={`file-${file.id}-${activeTab}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-xl shadow-md overflow-hidden"
              >
                <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">{file.originalname}</h3>
                    <p className="text-sm text-gray-500">
                      {file.filetype.toUpperCase()} • {Math.round(file.filesize / 1024)} KB
                    </p>
                  </div>
                  {renderFileActionButtons(file)}
                </div>
                <div className="p-4">
                  {file.filetype.toLowerCase() === 'pdf' ? (
                    <div className="w-full h-[600px] border border-gray-300 rounded-lg overflow-hidden">
                      <iframe 
                        src={`${API_URL}/files/blob/${file.id}`}
                        className="w-full h-full"
                        title="PDF Viewer"
                      />
                    </div>
                  ) : file.filetype.toLowerCase() === 'docx' || file.filetype.toLowerCase() === 'doc' ? (
                    <div className="flex flex-col items-center justify-center p-10 border border-gray-300 rounded-lg">
                      <File size={64} className="text-blue-500 mb-4" />
                      <p className="text-lg font-medium mb-2">{file.originalname}</p>
                      <p className="text-gray-500 mb-4">File Microsoft Word tidak dapat ditampilkan secara langsung</p>
                      <button
                        onClick={() => handleDownload(file.id)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Download untuk melihat
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center p-10 border border-gray-300 rounded-lg">
                      <FileText size={64} className="text-gray-500 mb-4" />
                      <p className="text-lg font-medium mb-2">{file.originalname}</p>
                      <p className="text-gray-500 mb-4">Tipe file tidak didukung untuk preview</p>
                      <button
                        onClick={() => handleDownload(file.id)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Download File
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            ))
          ) : (
            <div className="bg-white rounded-xl shadow-md p-6 text-center">
              <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 mb-6">Tidak ada file {activeTab === 'questions' ? 'soal' : activeTab === 'answers' ? 'jawaban' : 'test cases'} yang tersedia</p>
              
              {isAuthenticated && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    const category = activeTab === 'questions' ? 'soal' : 
                                   activeTab === 'answers' ? 'kunci' : 'test';
                    setTabUploadModal({ 
                      isOpen: true, 
                      category: category, 
                      questionSetId: questionSet.id 
                    });
                  }}
                  className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md mx-auto"
                >
                  <Upload className="w-5 h-5 mr-2" />
                  Upload {activeTab === 'questions' ? 'Soal' : activeTab === 'answers' ? 'Kunci Jawaban' : 'Test Cases'}
                </motion.button>
              )}
            </div>
          )}
        </div>
      </div>
      
      <DeleteConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setFileToDelete(null);
        }}
        file={fileToDelete}
        onConfirm={handleConfirmDelete}
        loading={deleteLoading}
      />
      
      <UploadFileModal
        isOpen={tabUploadModal.isOpen}
        onClose={() => setTabUploadModal({ isOpen: false, category: '', questionSetId: null })}
        questionSetId={tabUploadModal.questionSetId}
        fileCategory={tabUploadModal.category}
        onFileUploaded={(file) => {
          handleFileUploaded(file);
          setTabUploadModal({ isOpen: false, category: '', questionSetId: null });
        }}
      />
      
      <Toast 
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={hideToast}
      />
      
      <Footer />
    </div>
  );
};

export default QuestionPreview;