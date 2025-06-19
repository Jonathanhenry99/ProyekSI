import React, { useState, useEffect } from 'react';
import { motion } from "framer-motion";
import { Upload, File, CheckCircle, X, AlertCircle, User, Calendar, Tag, ChevronDown } from 'lucide-react';
import LogoIF from '../assets/LogoIF.jpg';
import LogoUnpar from '../assets/LogoUnpar.png';
import Footer from '../components/Footer';
import Header from '../components/Header';
import axios from 'axios';

const API_URL = "http://localhost:8080/api";

const UploadPage = ({ currentUser }) => {
  const [files, setFiles] = useState({
    questions: null,
    answers: null,
    testCases: null
  });

  const [uploadStatus, setUploadStatus] = useState({
    questions: null,
    answers: null,
    testCases: null
  });

  const [metadata, setMetadata] = useState({
    title: '',
    subject: '',
    topics: [], // Changed to array for multiple selection
    difficulty: '',
    description: '',
    year: new Date().getFullYear(),
    lecturer: currentUser?.username || '' // Use username instead of name
  });

  // New states for database data
  const [courseTags, setCourseTags] = useState([]);
  const [materialTags, setMaterialTags] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  
  // States for searchable dropdown
  const [courseSearchTerm, setCourseSearchTerm] = useState('');
  const [showCourseDropdown, setShowCourseDropdown] = useState(false);
  const [filteredCourseTags, setFilteredCourseTags] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Fetch data from database on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const user = JSON.parse(localStorage.getItem('user'));
        if (!user || !user.accessToken) {
          setError("Anda belum login atau sesi telah berakhir. Silakan login kembali.");
          return;
        }

        const token = user.accessToken;
        const headers = {
          'x-access-token': token
        };

        // Fetch course tags and material tags
        const [courseTagsResponse, materialTagsResponse] = await Promise.all([
          axios.get(`${API_URL}/course-tags`, { headers }),
          axios.get(`${API_URL}/material-tags`, { headers })
        ]);

        setCourseTags(courseTagsResponse.data || []);
        setMaterialTags(materialTagsResponse.data || []);
        setFilteredCourseTags(courseTagsResponse.data || []);
        
        // Set lecturer to current user's username
        setMetadata(prev => ({
          ...prev,
          lecturer: currentUser?.username || user.username || ''
        }));

      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Gagal memuat data mata kuliah dan topik.");
      } finally {
        setLoadingData(false);
      }
    };

    fetchData();
  }, [currentUser]);

  // Filter course tags based on search term
  useEffect(() => {
    if (courseSearchTerm) {
      const filtered = courseTags.filter(tag =>
        tag.name.toLowerCase().includes(courseSearchTerm.toLowerCase())
      );
      setFilteredCourseTags(filtered);
    } else {
      setFilteredCourseTags(courseTags);
    }
  }, [courseSearchTerm, courseTags]);

  const handleFileChange = (e, type) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      // Validasi tipe file
      const validTypes = ['.pdf', '.docx', '.txt'];
      const fileExt = selectedFile.name.substring(selectedFile.name.lastIndexOf('.')).toLowerCase();
      
      if (!validTypes.includes(fileExt)) {
        setUploadStatus(prev => ({
          ...prev,
          [type]: 'error'
        }));
        setError(`Format file ${fileExt} tidak didukung. Gunakan PDF, DOCX, atau TXT.`);
        return;
      }
      
      setFiles(prev => ({
        ...prev,
        [type]: selectedFile
      }));
      
      setUploadStatus(prev => ({
        ...prev,
        [type]: 'ready'
      }));
      
      setError(null);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setMetadata(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle course search input
  const handleCourseSearch = (e) => {
    const value = e.target.value;
    setCourseSearchTerm(value);
    setMetadata(prev => ({
      ...prev,
      subject: value
    }));
    setShowCourseDropdown(true);
  };

  // Handle course selection from dropdown
  const handleCourseSelect = (courseName) => {
    setMetadata(prev => ({
      ...prev,
      subject: courseName
    }));
    setCourseSearchTerm(courseName);
    setShowCourseDropdown(false);
  };

  // Handle focus and blur for course input
  const handleCourseFocus = () => {
    setShowCourseDropdown(true);
  };

  const handleCourseBlur = () => {
    // Delay hiding dropdown to allow for selection
    setTimeout(() => {
      setShowCourseDropdown(false);
    }, 200);
  };

  // Handle keyboard navigation for course dropdown
  const handleCourseKeyDown = (e) => {
    if (e.key === 'Escape') {
      setShowCourseDropdown(false);
    } else if (e.key === 'Enter' && showCourseDropdown) {
      e.preventDefault();
      if (filteredCourseTags.length > 0) {
        handleCourseSelect(filteredCourseTags[0].name);
      } else if (courseSearchTerm) {
        handleCourseSelect(courseSearchTerm);
      }
    }
  };

  // Handle topic selection (multi-select)
  const handleTopicChange = (tagId, tagName) => {
    setMetadata(prev => {
      const currentTopics = prev.topics || [];
      const topicExists = currentTopics.some(topic => topic.id === tagId);
      
      if (topicExists) {
        // Remove topic if already selected
        return {
          ...prev,
          topics: currentTopics.filter(topic => topic.id !== tagId)
        };
      } else {
        // Add topic if not selected
        return {
          ...prev,
          topics: [...currentTopics, { id: tagId, name: tagName }]
        };
      }
    });
  };

  const handleSubmit = async () => {
    // Validasi input
    if (!files.questions) {
      setError("Silakan upload file soal terlebih dahulu!");
      return;
    }
    
    if (!metadata.title || !metadata.subject || !metadata.difficulty) {
      setError("Judul, mata kuliah, dan tingkat kesulitan harus diisi!");
      return;
    }
    
    // Validasi token
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || !user.accessToken) {
      setError("Anda belum login atau sesi telah berakhir. Silakan login kembali.");
      return;
    }
    
    const token = user.accessToken;
    
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      // 1. Buat question set baru
      const questionSetResponse = await axios.post(
        `${API_URL}/questionsets`,
        {
          title: metadata.title,
          subject: metadata.subject,
          difficulty: metadata.difficulty,
          year: metadata.year,
          lecturer: metadata.lecturer,
          topics: metadata.topics.map(topic => topic.name).join(', '), // Convert array to comma-separated string
          description: metadata.description,
          lastupdated: new Date()
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'x-access-token': token
          }
        }
      );
      
      const questionSetId = questionSetResponse.data.questionSet.id;
      
      // 2. Upload files
      const uploadPromises = [];
      const uploadedFileIds = [];
      
      for (const [category, file] of Object.entries(files)) {
        if (file) {
          const formData = new FormData();
          formData.append('file', file);
          formData.append('questionSetId', questionSetId);
          formData.append('fileCategory', category);
          
          const uploadResponse = await axios.post(`${API_URL}/files/upload`, formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
              'x-access-token': token
            }
          });
          
          // Simpan ID file yang diupload
          if (uploadResponse.data && uploadResponse.data.id) {
            uploadedFileIds.push(uploadResponse.data.id);
          }
        }
      }
      
      // 3. Buat paket soal baru yang terhubung dengan question set
      await axios.post(
        `${API_URL}/paketsoal`,
        {
          title: metadata.title,
          description: metadata.description,
          subject: metadata.subject,
          year: metadata.year,
          level: metadata.difficulty,
          lecturer: metadata.lecturer,
          topics: metadata.topics.map(topic => topic.name).join(', '),
          files: uploadedFileIds // Menghubungkan file yang diupload dengan paket soal
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'x-access-token': token
          }
        }
      );
      
      setSuccess("Soal berhasil diupload dan ditambahkan ke paket soal!");
      
      // Reset form
      setFiles({
        questions: null,
        answers: null,
        testCases: null
      });
      
      setUploadStatus({
        questions: null,
        answers: null,
        testCases: null
      });
      
      setMetadata({
        title: '',
        subject: '',
        topics: [],
        difficulty: '',
        description: '',
        year: new Date().getFullYear(),
        lecturer: currentUser?.username || user.username || ''
      });
      
    } catch (error) {
      console.error("Upload error:", error);
      if (error.response?.status === 403) {
        setError("Akses ditolak. Silakan login kembali untuk mendapatkan token yang valid.");
      } else {
        setError(error.response?.data?.message || "Terjadi kesalahan saat mengupload soal.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Render file input
  const renderFileInput = (type, label, description, icon) => {
    const IconComponent = icon;
    const status = uploadStatus[type];
    
    return (
      <div className="mb-6">
        <div
          className={`relative border-2 border-dashed rounded-xl p-6 transition-all ${
            status === 'ready' ? 'border-blue-400 bg-blue-50' :
            status === 'error' ? 'border-red-400 bg-red-50' :
            'border-gray-300 hover:border-blue-400'
          }`}
        >
          <input
            type="file"
            id={`file-${type}`}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            onChange={(e) => handleFileChange(e, type)}
            accept=".pdf,.docx,.txt"
          />
          <div className="flex items-center gap-4">
            {status === 'ready' ? (
              <CheckCircle className="w-8 h-8 text-blue-500" />
            ) : status === 'error' ? (
              <AlertCircle className="w-8 h-8 text-red-500" />
            ) : (
              <IconComponent className="w-8 h-8 text-blue-500" />
            )}
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">{label}</h3>
              <p className="text-sm text-gray-500">{description}</p>
              {files[type] && (
                <p className="text-sm text-blue-600 mt-1">{files[type].name}</p>
              )}
            </div>
            {files[type] && (
              <button
                type="button"
                className="p-1 rounded-full bg-gray-200 hover:bg-gray-300"
                onClick={() => {
                  setFiles(prev => ({ ...prev, [type]: null }));
                  setUploadStatus(prev => ({ ...prev, [type]: null }));
                }}
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (loadingData) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-blue-50">
      <Header currentUser={currentUser} />
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold mb-4 text-gray-900">Upload Soal Baru</h1>
          <p className="text-xl text-gray-600">Unggah dan kelola soal-soal Anda dengan mudah</p>
        </motion.div>

        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-200 rounded-xl text-red-700">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-100 border border-green-200 rounded-xl text-green-700">
            {success}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* File Upload Section */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-2xl p-8 shadow-lg"
          >
            <h2 className="text-2xl font-semibold mb-6 text-gray-900">Upload Files</h2>

            {renderFileInput('questions', 'Upload Soal', 'Format: PDF, DOCX, atau TXT', Upload)}
            {renderFileInput('answers', 'Upload Kunci Jawaban', 'Format: PDF, DOCX, atau TXT', File)}
            {renderFileInput('testCases', 'Upload Test Cases', 'Format: PDF, DOCX, atau TXT', AlertCircle)}
          </motion.div>

          {/* Metadata Section */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-2xl p-8 shadow-lg"
          >
            <h2 className="text-2xl font-semibold mb-6 text-gray-900">Informasi Soal</h2>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Judul Set Soal</label>
                <input
                  type="text"
                  name="title"
                  value={metadata.title}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  placeholder="Judul set soal"
                />
              </div>

              {/* Course Tags Searchable Dropdown */}
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Mata Kuliah</label>
                <div className="relative">
                  <input
                    type="text"
                    value={metadata.subject}
                    onChange={handleCourseSearch}
                    onFocus={handleCourseFocus}
                    onBlur={handleCourseBlur}
                    onKeyDown={handleCourseKeyDown}
                    className="w-full px-4 py-3 pr-10 bg-gray-50 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    placeholder="Ketik atau pilih mata kuliah..."
                  />
                  {/* Icon indicator */}
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center">
                    {metadata.subject && courseTags.some(tag => tag.name === metadata.subject) ? (
                      <CheckCircle className="w-5 h-5 text-green-500 mr-1" />
                    ) : null}
                    <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${showCourseDropdown ? 'rotate-180' : ''}`} />
                  </div>
                  
                  {/* Dropdown List */}
                  {showCourseDropdown && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      {filteredCourseTags.length > 0 ? (
                        filteredCourseTags.map((courseTag) => (
                          <div
                            key={courseTag.id}
                            className="px-4 py-2 hover:bg-blue-50 cursor-pointer transition-colors border-b border-gray-100 last:border-b-0"
                            onMouseDown={() => handleCourseSelect(courseTag.name)}
                          >
                            <span className="text-gray-900">{courseTag.name}</span>
                          </div>
                        ))
                      ) : courseSearchTerm ? (
                        <div className="px-4 py-3">
                          <div className="text-gray-500 text-sm mb-2">Mata kuliah tidak ditemukan</div>
                          <div
                            className="px-3 py-2 bg-blue-50 text-blue-700 rounded-lg cursor-pointer hover:bg-blue-100 transition-colors"
                            onMouseDown={() => handleCourseSelect(courseSearchTerm)}
                          >
                            <span className="text-sm">Gunakan: "<strong>{courseSearchTerm}</strong>"</span>
                          </div>
                        </div>
                      ) : (
                        <div className="px-4 py-2 text-gray-500 text-center">
                          Tidak ada mata kuliah tersedia
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Mulai ketik untuk mencari atau menambahkan mata kuliah baru
                </p>
              </div>

              {/* Material Tags Multi-Select */}
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Topik</label>
                <div className="bg-gray-50 rounded-xl border border-gray-300 p-3 min-h-[50px]">
                  {/* Selected Topics */}
                  <div className="flex flex-wrap gap-2 mb-2">
                    {metadata.topics.map((topic) => (
                      <span
                        key={topic.id}
                        className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 px-2 py-1 rounded-lg text-sm"
                      >
                        {topic.name}
                        <button
                          type="button"
                          onClick={() => handleTopicChange(topic.id, topic.name)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                  
                  {/* Available Topics */}
                  <div className="border-t border-gray-200 pt-2">
                    <p className="text-xs text-gray-500 mb-2">Klik topik untuk menambahkan:</p>
                    <div className="flex flex-wrap gap-1 max-h-32 overflow-y-auto">
                      {materialTags
                        .filter(tag => !metadata.topics.some(topic => topic.id === tag.id))
                        .map((tag) => (
                          <button
                            key={tag.id}
                            type="button"
                            onClick={() => handleTopicChange(tag.id, tag.name)}
                            className="inline-flex items-center gap-1 bg-gray-200 hover:bg-blue-100 text-gray-700 hover:text-blue-800 px-2 py-1 rounded-lg text-sm transition-colors"
                          >
                            <Tag className="w-3 h-3" />
                            {tag.name}
                          </button>
                        ))}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Tingkat Kesulitan</label>
                <select 
                  name="difficulty"
                  value={metadata.difficulty}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                >
                  <option value="">Pilih tingkat kesulitan</option>
                  <option value="Mudah">Mudah</option>
                  <option value="Sedang">Sedang</option>
                  <option value="Sulit">Sulit</option>
                </select>
              </div>

              {/* Lecturer - Read Only */}
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Dosen</label>
                <div className="flex items-center gap-2 px-4 py-3 bg-gray-100 rounded-xl border border-gray-300">
                  <User className="w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    name="lecturer"
                    value={metadata.lecturer}
                    readOnly
                    className="flex-1 bg-transparent border-none focus:ring-0 text-gray-600"
                    placeholder="Username dosen"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">Otomatis terisi berdasarkan akun yang login</p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Tahun</label>
                <input
                  type="number"
                  name="year"
                  value={metadata.year}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  placeholder="Tahun soal"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Deskripsi</label>
                <textarea
                  name="description"
                  value={metadata.description}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  rows="4"
                  placeholder="Deskripsi singkat tentang soal"
                />
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full mt-8 bg-blue-600 text-white py-4 rounded-xl font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Mengupload...
                </>
              ) : (
                <>
                  <Upload className="w-5 h-5" />
                  Upload Soal
                </>
              )}
            </motion.button>
          </motion.div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default UploadPage;