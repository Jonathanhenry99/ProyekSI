// Komponen untuk menampilkan riwayat penggantian file
const FileHistoryModal = ({ isOpen, onClose, questionSetId }) => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
  
    useEffect(() => {
      if (isOpen && questionSetId) {
        fetchHistory();
      }
    }, [isOpen, questionSetId]);
  
    const fetchHistory = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await axios.get(`${API_URL}/files/replacement-history/${questionSetId}`);
        setHistory(response.data);
      } catch (err) {
        console.error('Error fetching file history:', err);
        setError('Gagal memuat riwayat file');
      } finally {
        setLoading(false);
      }
    };
  
    const groupFilesByCategory = (files) => {
      const grouped = {};
      files.forEach(file => {
        const category = file.filecategory;
        if (!grouped[category]) {
          grouped[category] = [];
        }
        grouped[category].push(file);
      });
      return grouped;
    };
  
    const formatFileSize = (bytes) => {
      if (bytes === 0) return '0 Bytes';
      const k = 1024;
      const sizes = ['Bytes', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };
  
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
          return category;
      }
    };
  
    if (!isOpen) return null;
  
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
          className="bg-white rounded-2xl p-6 max-w-4xl w-full max-h-[80vh] overflow-hidden shadow-2xl border border-gray-200"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mr-4">
                <Clock className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Riwayat File</h2>
                <p className="text-gray-500">Timeline perubahan dan penggantian file</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-6 h-6 text-gray-500" />
            </button>
          </div>
  
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}
  
          <div className="max-h-[500px] overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
                <span className="ml-3 text-gray-600">Memuat riwayat...</span>
              </div>
            ) : history.length === 0 ? (
              <div className="text-center py-12">
                <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Belum Ada Riwayat</h3>
                <p className="text-gray-500">Belum ada aktivitas penggantian file</p>
              </div>
            ) : (
              <div className="space-y-6">
                {Object.entries(groupFilesByCategory(history)).map(([category, files]) => (
                  <div key={category} className="border border-gray-200 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <FileText className="w-5 h-5 mr-2" />
                      {getCategoryDisplayName(category)}
                    </h3>
                    
                    <div className="space-y-3">
                      {files.map((file, index) => (
                        <motion.div
                          key={file.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className={`flex items-center justify-between p-3 rounded-lg border ${
                            file.is_deleted 
                              ? 'bg-red-50 border-red-200' 
                              : 'bg-green-50 border-green-200'
                          }`}
                        >
                          <div className="flex items-center flex-1">
                            <div className={`w-3 h-3 rounded-full mr-3 ${
                              file.is_deleted ? 'bg-red-400' : 'bg-green-400'
                            }`} />
                            <div className="flex-1">
                              <h4 className={`font-medium ${
                                file.is_deleted ? 'text-red-900' : 'text-green-900'
                              }`}>
                                {file.originalname}
                              </h4>
                              <div className="flex items-center text-sm text-gray-600 mt-1">
                                <span className="mr-4">
                                  {file.filetype.toUpperCase()} • {formatFileSize(file.filesize)}
                                </span>
                                <span className="mr-4">
                                  {file.is_deleted ? 'Dihapus' : 'Diupload'}: {' '}
                                  {new Date(file.is_deleted ? file.deleted_at : file.uploaded_at)
                                    .toLocaleString('id-ID')}
                                </span>
                                <span>
                                  oleh: {file.is_deleted ? file.deleted_by_name : file.uploaded_by_name}
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            {file.is_deleted ? (
                              <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">
                                Digantikan
                              </span>
                            ) : (
                              <div className="flex items-center space-x-2">
                                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                                  Aktif
                                </span>
                                <button
                                  onClick={() => window.open(`${API_URL}/files/download/${file.id}`, '_blank')}
                                  className="p-2 text-blue-600 hover:bg-blue-100 rounded-full transition-colors"
                                  title="Download file"
                                >
                                  <Download className="w-4 h-4" />
                                </button>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
  
          <div className="mt-6 pt-4 border-t border-gray-200 flex justify-between items-center">
            <p className="text-sm text-gray-500">
              {history.length > 0 && `Total ${history.length} aktivitas tercatat`}
            </p>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Tutup
            </button>
          </div>
        </motion.div>
      </motion.div>
    );
  };
  
  // Enhanced File Action Buttons dengan History
  const EnhancedFileActionButtons = ({ file, onReUpload, onShowHistory, isAuthenticated }) => {
    if (file.is_deleted || file.isDeleted) {
      return null;
    }
  
    return (
      <div className="flex items-center space-x-2">
        <button
          onClick={() => window.open(`${API_URL}/files/download/${file.id}`, '_blank')}
          className="flex items-center text-blue-600 hover:text-blue-800 transition-colors px-3 py-2 rounded-lg hover:bg-blue-50"
          title="Download file"
        >
          <Download size={18} className="mr-1" />
          Download
        </button>
        
        {isAuthenticated && (
          <>
            <button
              onClick={() => onReUpload(file)}
              className="flex items-center text-green-600 hover:text-green-800 transition-colors px-3 py-2 rounded-lg hover:bg-green-50"
              title="Ganti file"
            >
              <Upload size={18} className="mr-1" />
              Ganti File
            </button>
            
            <button
              onClick={() => onShowHistory(file)}
              className="flex items-center text-purple-600 hover:text-purple-800 transition-colors px-3 py-2 rounded-lg hover:bg-purple-50"
              title="Lihat riwayat"
            >
              <Clock size={18} className="mr-1" />
              Riwayat
            </button>
          </>
        )}
      </div>
    );
  };
  
  // Enhanced Toast Component dengan berbagai tipe
  const EnhancedToast = ({ message, type = 'success', isVisible, onClose, duration = 4000 }) => {
    useEffect(() => {
      if (isVisible) {
        const timer = setTimeout(() => {
          onClose();
        }, duration);
        return () => clearTimeout(timer);
      }
    }, [isVisible, onClose, duration]);
  
    if (!isVisible) return null;
  
    const getToastConfig = () => {
      switch (type) {
        case 'success':
          return {
            bgColor: 'bg-green-600',
            icon: <CheckCircle className="w-5 h-5 mr-3" />,
            textColor: 'text-white'
          };
        case 'error':
          return {
            bgColor: 'bg-red-600',
            icon: <AlertTriangle className="w-5 h-5 mr-3" />,
            textColor: 'text-white'
          };
        case 'warning':
          return {
            bgColor: 'bg-yellow-600',
            icon: <AlertTriangle className="w-5 h-5 mr-3" />,
            textColor: 'text-white'
          };
        case 'info':
          return {
            bgColor: 'bg-blue-600',
            icon: <Clock className="w-5 h-5 mr-3" />,
            textColor: 'text-white'
          };
        default:
          return {
            bgColor: 'bg-gray-600',
            icon: null,
            textColor: 'text-white'
          };
      }
    };
  
    const config = getToastConfig();
  
    return (
      <motion.div
        initial={{ opacity: 0, y: -50, x: '-50%' }}
        animate={{ opacity: 1, y: 0, x: '-50%' }}
        exit={{ opacity: 0, y: -50, x: '-50%' }}
        className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 px-6 py-3 rounded-lg shadow-lg ${config.bgColor} ${config.textColor}`}
      >
        <div className="flex items-center">
          {config.icon}
          <span className="font-medium">{message}</span>
          <button
            onClick={onClose}
            className="ml-4 hover:bg-white hover:bg-opacity-20 rounded-full p-1 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    );
  };