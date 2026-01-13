import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { Upload, File, CheckCircle, X, AlertCircle, User, Calendar, Tag, ChevronDown, Plus, Trash2, Settings, Info, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';
import LogoIF from '../assets/LogoIF.jpg';
import LogoUnpar from '../assets/LogoUnpar.png';
import Footer from '../components/Footer';
import Header from '../components/Header';
import axios from 'axios';
import { saveAs } from 'file-saver';

const API_URL = "http://localhost:8080/api";

const UploadPage = ({ currentUser }) => {
  const [files, setFiles] = useState({
    questions: null,
    answers: [],
    testCases: null
  });

  const [uploadStatus, setUploadStatus] = useState({
    questions: null,
    answers: [],
    testCases: null
  });

  const [metadata, setMetadata] = useState({
    title: '',
    subject: '',
    selectedCourseId: null,
    topics: [],
    difficulty: '',
    description: '',
    year: new Date().getFullYear(),
    lecturer: currentUser?.username || ''
  });

  const [courseTags, setCourseTags] = useState([]);
  const [materialTags, setMaterialTags] = useState([]);
  const [filteredMaterialTags, setFilteredMaterialTags] = useState([]);
  const [lecturerOptions, setLecturerOptions] = useState([]);
  const [loadingLecturers, setLoadingLecturers] = useState(false);
  const [lecturerSearchTerm, setLecturerSearchTerm] = useState('');
  const [showLecturerDropdown, setShowLecturerDropdown] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [loadingMaterials, setLoadingMaterials] = useState(false);
  
  const [courseSearchTerm, setCourseSearchTerm] = useState('');
  const [showCourseDropdown, setShowCourseDropdown] = useState(false);
  const [filteredCourseTags, setFilteredCourseTags] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const templateFileInputRef = useRef(null);
  const [localTemplateFile, setLocalTemplateFile] = useState(null);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [templateSuccess, setTemplateSuccess] = useState(null);
  
  // State untuk overlay notification
  const [notification, setNotification] = useState({
    show: false,
    message: '',
    type: 'info' // 'success', 'error', 'warning', 'info'
  });

  // ✅ VALIDASI FORMAT FILE
  const validateFileType = (fileName, type) => {
    const extension = fileName.substring(fileName.lastIndexOf('.')).toLowerCase();
    
    const allowedFormats = {
      questions: ['.pdf', '.docx', '.doc'],
      answers: [
        '.js', '.jsx', '.ts', '.tsx',
        '.py',
        '.java',
        '.c', '.cpp', '.cc', '.cxx', '.h', '.hpp',
        '.cs',
        '.php',
        '.rb',
        '.go',
        '.rs',
        '.kt',
        '.swift',
        '.dart',
        '.scala',
        '.r',
        '.m',
        '.sh', '.bash',
        '.sql',
        '.html', '.css', '.scss', '.sass', '.less',
        '.xml', '.json', '.yaml', '.yml',
        '.pdf', '.txt', '.docx', '.doc'
      ],
      testCases: ['.zip', '.rar', '.txt']
    };

    return allowedFormats[type]?.includes(extension) || false;
  };

  // Helper function untuk mendapatkan info file
  const getFileInfo = (fileName) => {
    const extension = fileName.substring(fileName.lastIndexOf('.')).toLowerCase();
    const languageMap = {
      '.js': 'JavaScript',
      '.jsx': 'React',
      '.ts': 'TypeScript',
      '.tsx': 'TypeScript React',
      '.py': 'Python',
      '.java': 'Java',
      '.c': 'C',
      '.cpp': 'C++',
      '.cc': 'C++',
      '.cxx': 'C++',
      '.cs': 'C#',
      '.php': 'PHP',
      '.rb': 'Ruby',
      '.go': 'Go',
      '.rs': 'Rust',
      '.kt': 'Kotlin',
      '.swift': 'Swift',
      '.dart': 'Dart',
      '.scala': 'Scala',
      '.r': 'R',
      '.m': 'MATLAB',
      '.sh': 'Shell',
      '.sql': 'SQL',
      '.html': 'HTML',
      '.css': 'CSS',
      '.scss': 'SCSS',
      '.sass': 'SASS',
      '.less': 'LESS',
      '.xml': 'XML',
      '.json': 'JSON',
      '.yaml': 'YAML',
      '.yml': 'YAML',
      '.pdf': 'PDF',
      '.txt': 'Text',
      '.docx': 'Word Document',
      '.doc': 'Word Document',
      '.zip': 'ZIP Archive',
      '.rar': 'RAR Archive'
    };
    
    return {
      extension,
      language: languageMap[extension] || 'Unknown'
    };
  };

  const handleTemplateFileUpload = (event) => {
    const file = event.target.files[0];
    
    if (file) {
      if (file.name.toLowerCase().endsWith('.docx')) {
        console.log("File template DOCX dipilih:", file.name);
        setLocalTemplateFile(file);
        
        const successMessage = `Template soal berhasil diganti dengan: ${file.name}`;
        setTemplateSuccess(successMessage);
        
        setTimeout(() => {
          setTemplateSuccess(null);
        }, 4000);
        
      } else {
        showNotification("Gagal: Hanya file dengan format .DOCX yang diizinkan untuk template.", 'error');
      }
    }
    event.target.value = null;
  };

  const handleDownloadTemplate = async () => {
    if (localTemplateFile) {
      console.log("Downloading local template file:", localTemplateFile.name);
      saveAs(localTemplateFile, localTemplateFile.name);
      return;
    }
    
    try {
      const response = await axios.get(`${API_URL}/files/download-template`, {
        responseType: "blob",
      });

      const blob = new Blob([response.data], {
        type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      });

      saveAs(blob, "Template_Soal.docx");
    } catch (error) {
      console.error("Error downloading file from server:", error);
      showNotification("Gagal mendownload template dari server.", 'error');
    }
  };

  const handleEditTemplate = () => {
    setShowTemplateModal(true);
  };

  const handleConfirmTemplateEdit = () => {
    setShowTemplateModal(false);
    templateFileInputRef.current.click();
  };

  const handleCancelTemplateEdit = () => {
    setShowTemplateModal(false);
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

        setLoadingLecturers(true);
        const [courseTagsResponse, lecturersResponse] = await Promise.all([
          axios.get(`${API_URL}/course-tags`, { headers }),
          axios.get(`${API_URL}/admin/dosen`, { headers })
        ]);

        setCourseTags(courseTagsResponse.data || []);
        setFilteredCourseTags(courseTagsResponse.data || []);
        setLecturerOptions(lecturersResponse.data || []);
        if (!metadata.lecturer && lecturersResponse.data && lecturersResponse.data.length > 0) {
          setMetadata(prev => ({
            ...prev,
            lecturer: lecturersResponse.data[0].nama
          }));
        }
        
        setMetadata(prev => ({
          ...prev,
          lecturer: prev.lecturer || currentUser?.username || user.username || ''
        }));

      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Gagal memuat data mata kuliah dan topik.");
      } finally {
        setLoadingData(false);
        setLoadingLecturers(false);
      }
    };

    fetchData();
  }, [currentUser]);

  const fetchMaterialTagsByCourse = async (courseId) => {
    if (!courseId) {
      setFilteredMaterialTags([]);
      return;
    }

    setLoadingMaterials(true);
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      if (!user || !user.accessToken) {
        setError("Token tidak valid. Silakan login kembali.");
        return;
      }

      const token = user.accessToken;
      const headers = {
        'x-access-token': token,
        'Content-Type': 'application/json'
      };
      
      console.log('Fetching materials for course:', courseId);
      
      const response = await axios.get(`${API_URL}/course-material-assignments/course/${courseId}/materials-for-upload`, {
        headers
      });
      
      console.log('Materials response:', response.data);
      
      const materials = response.data.success ? response.data.data : [];
      setFilteredMaterialTags(materials);
      
      setMetadata(prev => ({
        ...prev,
        topics: []
      }));
      
    } catch (error) {
      console.error('Error fetching course materials:', error);
      
      if (error.response?.status === 404) {
        setFilteredMaterialTags([]);
      } else if (error.response?.status === 403) {
        setError("Akses ditolak. Silakan login kembali.");
      } else {
        setError("Gagal memuat materi untuk mata kuliah ini.");
      }
      
      setFilteredMaterialTags([]);
    } finally {
      setLoadingMaterials(false);
    }
  };

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

  useEffect(() => {
    setLecturerSearchTerm(metadata.lecturer || '');
  }, [metadata.lecturer]);

  useEffect(() => {
    const handleClickOutsideLecturer = (event) => {
      if (!event.target.closest('.lecturer-dropdown')) {
        setShowLecturerDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutsideLecturer);
    return () => {
      document.removeEventListener('mousedown', handleClickOutsideLecturer);
    };
  }, []);

  // ✅ HANDLE FILE CHANGE DENGAN VALIDASI KETAT
  const handleFileChange = (e, type, index = null) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      const fileName = selectedFile.name;
      const fileExtension = fileName.substring(fileName.lastIndexOf('.')).toLowerCase();
      
      // Validasi format file
      if (!validateFileType(fileName, type)) {
        let errorMessage = '';
        
        if (type === 'questions') {
          errorMessage = `Format file ${fileExtension} tidak didukung untuk soal. Hanya PDF dan DOCX yang diizinkan.`;
        } else if (type === 'answers') {
          errorMessage = `Format file ${fileExtension} tidak didukung untuk kunci jawaban. Hanya file bahasa pemrograman, PDF, TXT, dan DOCX yang diizinkan.`;
        } else if (type === 'testCases') {
          errorMessage = `Format file ${fileExtension} tidak didukung untuk test cases. Hanya ZIP, RAR, dan TXT yang diizinkan.`;
        }
        
        setError(errorMessage);
        
        if (type === 'answers' && index !== null) {
          setUploadStatus(prev => {
            const newAnswerStatus = [...prev.answers];
            newAnswerStatus[index] = 'error';
            return { ...prev, answers: newAnswerStatus };
          });
        } else {
          setUploadStatus(prev => ({
            ...prev,
            [type]: 'error'
          }));
        }
        
        e.target.value = '';
        return;
      }
      
      // File valid
      if (type === 'answers' && index !== null) {
        setFiles(prev => {
          const newAnswers = [...prev.answers];
          newAnswers[index] = selectedFile;
          return {
            ...prev,
            answers: newAnswers
          };
        });
        
        setUploadStatus(prev => {
          const newAnswerStatus = [...prev.answers];
          newAnswerStatus[index] = 'ready';
          return {
            ...prev,
            answers: newAnswerStatus
          };
        });
      } else {
        setFiles(prev => ({
          ...prev,
          [type]: selectedFile
        }));
        
        setUploadStatus(prev => ({
          ...prev,
          [type]: 'ready'
        }));
      }
      
      setError(null);
    }
  };

  const addAnswerFile = () => {
    setFiles(prev => ({
      ...prev,
      answers: [...prev.answers, null]
    }));
    setUploadStatus(prev => ({
      ...prev,
      answers: [...prev.answers, null]
    }));
  };

  const removeAnswerFile = (index) => {
    setFiles(prev => ({
      ...prev,
      answers: prev.answers.filter((_, i) => i !== index)
    }));
    setUploadStatus(prev => ({
      ...prev,
      answers: prev.answers.filter((_, i) => i !== index)
    }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setMetadata(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCourseSearch = (e) => {
    const value = e.target.value;
    setCourseSearchTerm(value);
    setMetadata(prev => ({
      ...prev,
      subject: value,
      selectedCourseId: null
    }));
    setShowCourseDropdown(true);
    setFilteredMaterialTags([]);
  };

  const handleCourseSelect = (courseName, courseId = null) => {
    setMetadata(prev => ({
      ...prev,
      subject: courseName,
      selectedCourseId: courseId
    }));
    setCourseSearchTerm(courseName);
    setShowCourseDropdown(false);
    
    if (courseId) {
      fetchMaterialTagsByCourse(courseId);
    } else {
      setFilteredMaterialTags([]);
    }
  };

  const handleCourseFocus = () => {
    setShowCourseDropdown(true);
  };

  const handleCourseBlur = () => {
    setTimeout(() => {
      setShowCourseDropdown(false);
    }, 200);
  };

  const handleCourseKeyDown = (e) => {
    if (e.key === 'Escape') {
      setShowCourseDropdown(false);
    } else if (e.key === 'Enter' && showCourseDropdown) {
      e.preventDefault();
      if (filteredCourseTags.length > 0) {
        const firstCourse = filteredCourseTags[0];
        handleCourseSelect(firstCourse.name, firstCourse.id);
      } else if (courseSearchTerm) {
        handleCourseSelect(courseSearchTerm, null);
      }
    }
  };

  const filteredLecturerOptions = lecturerOptions.filter((lecturer) =>
    lecturer.nama.toLowerCase().includes((lecturerSearchTerm || '').toLowerCase())
  );

  const handleTopicChange = (tagId, tagName) => {
    setMetadata(prev => {
      const currentTopics = prev.topics || [];
      const topicExists = currentTopics.some(topic => topic.id === tagId);
      
      if (topicExists) {
        return {
          ...prev,
          topics: currentTopics.filter(topic => topic.id !== tagId)
        };
      } else {
        return {
          ...prev,
          topics: [...currentTopics, { id: tagId, name: tagName }]
        };
      }
    });
  };

  const handleSubmit = async () => {
    window.scrollTo({top:0,behavior: "smooth"});
    
    if (!files.questions) {
      setError("Silakan upload file soal terlebih dahulu!");
      return;
    }
    
    if (!metadata.title || !metadata.subject || !metadata.difficulty) {
      setError("Judul, mata kuliah, dan tingkat kesulitan harus diisi!");
      return;
    }
    
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
      const questionSetResponse = await axios.post(
        `${API_URL}/questionsets`,
        {
          title: metadata.title,
          subject: metadata.subject,
          difficulty: metadata.difficulty,
          year: metadata.year,
          lecturer: metadata.lecturer,
          topics: metadata.topics.map(topic => topic.name).join(', '),
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
      console.log('Question set created:', questionSetId);
      
      const uploadPromises = [];
      
      if (files.questions) {
        const formData = new FormData();
        formData.append('file', files.questions);
        formData.append('questionSetId', questionSetId);
        formData.append('fileCategory', 'questions');
        
        console.log('Uploading questions file:', files.questions.name);
        
        uploadPromises.push(
          axios.post(`${API_URL}/files/upload`, formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
              'x-access-token': token
            }
          }).catch(error => {
            console.error('Error uploading questions:', error.response?.data || error.message);
            throw error;
          })
        );
      }
      
      files.answers.forEach((file, index) => {
        if (file) {
          const formData = new FormData();
          formData.append('file', file);
          formData.append('questionSetId', questionSetId);
          formData.append('fileCategory', `answers_${index + 1}`);
          
          console.log(`Uploading answer file ${index + 1}:`, file.name);
          
          uploadPromises.push(
            axios.post(`${API_URL}/files/upload`, formData, {
              headers: {
                'Content-Type': 'multipart/form-data',
                'x-access-token': token
              }
            }).catch(error => {
              console.error(`Error uploading answer ${index + 1}:`, error.response?.data || error.message);
              throw error;
            })
          );
        }
      });
      
      if (files.testCases) {
        const formData = new FormData();
        formData.append('file', files.testCases);
        formData.append('questionSetId', questionSetId);
        formData.append('fileCategory', 'testCases');
        
        console.log('Uploading test cases file:', files.testCases.name);
        
        uploadPromises.push(
          axios.post(`${API_URL}/files/upload`, formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
              'x-access-token': token
            }
          }).catch(error => {
            console.error('Error uploading test cases:', error.response?.data || error.message);
            throw error;
          })
        );
      }
      
      await Promise.all(uploadPromises);
      
      console.log('All files uploaded successfully');
      
      window.scrollTo({top:0,behavior: "smooth"});
      setSuccess("Soal berhasil diupload!");
      
      setFiles({
        questions: null,
        answers: [],
        testCases: null
      });
      
      setUploadStatus({
        questions: null,
        answers: [],
        testCases: null
      });
      
      const defaultLecturer =
        lecturerOptions.find(opt => opt.status !== 'Nonaktif')?.nama ||
        lecturerOptions[0]?.nama ||
        currentUser?.username ||
        user.username ||
        '';

      setMetadata({
        title: '',
        subject: '',
        selectedCourseId: null,
        topics: [],
        difficulty: '',
        description: '',
        year: new Date().getFullYear(),
        lecturer: defaultLecturer
      });
      
      setFilteredMaterialTags([]);
      setCourseSearchTerm('');
      
    } catch (error) {
      console.error("Upload error:", error);
      if (error.response?.status === 403) {
        setError("Akses ditolak. Silakan login kembali untuk mendapatkan token yang valid.");
      } else {
        setError(error.response?.data?.message || "Terjadi kesalahan saat mengupload soal. Silakan cek console untuk detail.");
      }
    } finally {
      setLoading(false);
    }
  };

  // ✅ RENDER FILE INPUT DENGAN ACCEPT STRICT
  const renderFileInput = (type, label, description, icon) => {
    const IconComponent = icon;
    const status = uploadStatus[type];
    
    let acceptTypes = '';
    if (type === 'questions') {
      acceptTypes = '.pdf,.docx,.doc';
    } else if (type === 'testCases') {
      acceptTypes = '.zip,.rar,.txt';
    }
    
    const resetFile = (e) => {
      e.stopPropagation();
      setFiles(prev => ({ ...prev, [type]: null }));
      setUploadStatus(prev => ({ ...prev, [type]: null }));
      
      const fileInput = document.getElementById(`file-${type}`);
      if (fileInput) {
        fileInput.value = ''; 
      }
    };
    
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
            accept={acceptTypes}
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
                className="p-1 rounded-full bg-gray-200 hover:bg-gray-300 relative z-20" 
                onClick={resetFile}
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  // ✅ RENDER ANSWER FILES DENGAN ACCEPT STRICT
  const renderAnswerFileInputs = () => {
    const answerAcceptTypes = '.js,.jsx,.ts,.tsx,.py,.java,.c,.cpp,.cc,.cxx,.h,.hpp,.cs,.php,.rb,.go,.rs,.kt,.swift,.dart,.scala,.r,.m,.sh,.bash,.sql,.html,.css,.scss,.sass,.less,.xml,.json,.yaml,.yml,.pdf,.txt,.docx,.doc';
    
    return (
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900">Upload Kunci Jawaban</h3>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="button"
            onClick={addAnswerFile}
            className="flex items-center gap-2 px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm"
          >
            <Plus className="w-4 h-4" />
            Tambah File
          </motion.button>
        </div>
        
        {files.answers.length === 0 && (
          <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center">
            <File className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-500 mb-3">Belum ada file kunci jawaban</p>
            <button
              type="button"
              onClick={addAnswerFile}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
            >
              <Plus className="w-4 h-4" />
              Tambah File Jawaban
            </button>
          </div>
        )}
        
        {files.answers.map((file, index) => {
          const status = uploadStatus.answers[index];
          const fileInfo = file ? getFileInfo(file.name) : null;
          
          return (
            <div
              key={index}
              className={`relative border-2 border-dashed rounded-xl p-4 mb-3 transition-all cursor-pointer ${
                status === 'ready' ? 'border-blue-400 bg-blue-50' :
                status === 'error' ? 'border-red-400 bg-red-50' :
                'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
              }`}
            >
              <input
                type="file"
                id={`answer-file-${index}`}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                onChange={(e) => handleFileChange(e, 'answers', index)}
                accept={answerAcceptTypes}
              />
              
              <div className="flex items-center gap-3 relative pointer-events-none">
                <div className="flex-shrink-0">
                  {status === 'ready' ? (
                    <CheckCircle className="w-6 h-6 text-blue-500" />
                  ) : status === 'error' ? (
                    <AlertCircle className="w-6 h-6 text-red-500" />
                  ) : (
                    <File className="w-6 h-6 text-blue-500" />
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium text-gray-700">
                      Jawaban {index + 1}
                    </span>
                    {fileInfo && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-600">
                        {fileInfo.language}
                      </span>
                    )}
                  </div>
                  {file ? (
                    <div>
                      <p className="text-sm text-blue-600 truncate">{file.name}</p>
                      <p className="text-xs text-gray-500">
                        {(file.size / 1024).toFixed(1)} KB • {fileInfo?.extension}
                      </p>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">Klik untuk memilih file (bahasa pemrograman, PDF, TXT, atau DOCX)</p>
                  )}
                </div>
                
                <div className="flex gap-2 pointer-events-auto relative z-20">
                  {file && (
                    <button
                      type="button"
                      className="p-1 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        setFiles(prev => {
                          const newAnswers = [...prev.answers];
                          newAnswers[index] = null;
                          return { ...prev, answers: newAnswers };
                        });
                        setUploadStatus(prev => {
                          const newAnswerStatus = [...prev.answers];
                          newAnswerStatus[index] = null;
                          return { ...prev, answers: newAnswerStatus };
                        });
                        const fileInput = document.getElementById(`answer-file-${index}`);
                        if (fileInput) fileInput.value = '';
                      }}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    type="button"
                    className="p-1 rounded-full bg-red-100 hover:bg-red-200 text-red-600 transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeAnswerFile(index);
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
        
        <p className="text-xs text-gray-500 mt-2">
          Format yang didukung: File bahasa pemrograman (Python, JavaScript, Java, C++, PHP, Ruby, dll.), PDF, TXT, dan DOCX
        </p>
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

      <AnimatePresence>
        {templateSuccess && (
          <motion.div
            initial={{ opacity: 0, x: 50, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 50, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed top-24 right-4 z-50 p-4 rounded-xl shadow-2xl bg-white/90 backdrop-blur-sm border border-green-200/50"
          >
            <div className="flex items-start gap-3">
              <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
              <div>
                <h4 className="text-base font-semibold text-gray-900 mb-1">Template Berhasil Diganti</h4>
                <p className="text-sm text-gray-600">{templateSuccess}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="container mx-auto px-4 py-8">
        <input 
          type="file"
          ref={templateFileInputRef}
          onChange={handleTemplateFileUpload}
          accept=".docx"
          style={{ display: 'none' }}
        />

        {showTemplateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 backdrop-blur-md bg-white/30 flex items-center justify-center z-50 p-4"
            onClick={handleCancelTemplateEdit}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 max-w-md w-full shadow-2xl border border-white/20"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center mb-4">
                <div className="flex-shrink-0 w-10 h-10 bg-orange-100/80 backdrop-blur-sm rounded-full flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-orange-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-gray-900">Konfirmasi Ganti Template Soal</h3>
                  <p className="text-sm text-gray-500">Template akan diperbarui secara permanen.</p>
                </div>
              </div>

              <div className="mb-6 p-4 bg-yellow-50/60 backdrop-blur-sm rounded-lg border border-yellow-200/50">
                <p className="text-sm text-gray-700 font-medium">
                  Apakah Anda yakin ingin mengganti template soal yang sudah tersimpan?
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  File baru yang Anda unggah akan digunakan sebagai template standar untuk fitur Download Template Soal.
                </p>
              </div>

              <div className="flex justify-end space-x-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-4 py-2 text-gray-700 bg-gray-200/70 hover:bg-gray-300/70 backdrop-blur-sm rounded-lg transition-colors"
                  onClick={handleCancelTemplateEdit}
                >
                  Batal
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-4 py-2 bg-orange-600/90 backdrop-blur-sm text-white rounded-lg hover:bg-orange-700 transition-colors flex items-center gap-2"
                  onClick={handleConfirmTemplateEdit}
                >
                  <Upload className="w-4 h-4" />
                  Ganti Template
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}

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
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col gap-8"
          >
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <h2 className="text-2xl font-semibold mb-6 text-gray-900">Upload Files</h2>

              {renderFileInput('questions', 'Upload Soal', 'Format: PDF atau DOCX', Upload)}
              {renderAnswerFileInputs()}
              {renderFileInput('testCases', 'Upload Test Cases', 'Format: ZIP, RAR, atau TXT', AlertCircle)}
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-semibold text-gray-900">
                  Template Soal
                </h3>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-3 py-2 text-sm text-gray-600 bg-gray-100 hover:bg-gray-200 hover:text-blue-700 transition-colors rounded-xl font-medium flex items-center gap-1.5"
                  onClick={handleEditTemplate}
                  aria-label="Kelola Template Soal"
                >
                  <Settings className="w-5 h-5" />
                  Ganti Template Soal
                </motion.button>
              </div>
              
              <p className="text-sm text-gray-600 mb-4">
                Unduh template soal dalam format DOCX untuk mempermudah pembuatan soal.
              </p>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full mt-8 bg-blue-600 text-white py-4 rounded-xl font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                onClick={handleDownloadTemplate}
              >
                <Upload className="w-5 h-5" />
                Download Template Soal
              </motion.button>
            </div>
          </motion.div>

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
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center">
                    {metadata.selectedCourseId && (
                      <CheckCircle className="w-5 h-5 text-green-500 mr-1" />
                    )}
                    <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${showCourseDropdown ? 'rotate-180' : ''}`} />
                  </div>
                  
                  {showCourseDropdown && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      {filteredCourseTags.length > 0 ? (
                        filteredCourseTags.map((courseTag) => (
                          <div
                            key={courseTag.id}
                            className="px-4 py-2 hover:bg-blue-50 cursor-pointer transition-colors border-b border-gray-100 last:border-b-0"
                            onMouseDown={() => handleCourseSelect(courseTag.name, courseTag.id)}
                          >
                            <span className="text-gray-900">{courseTag.name}</span>
                          </div>
                        ))
                      ) : courseSearchTerm ? (
                        <div className="px-4 py-3">
                          <div className="text-gray-500 text-sm mb-2">Mata kuliah tidak ditemukan</div>
                          <div
                            className="px-3 py-2 bg-blue-50 text-blue-700 rounded-lg cursor-pointer hover:bg-blue-100 transition-colors"
                            onMouseDown={() => handleCourseSelect(courseSearchTerm, null)}
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

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">
                  Topik Materi
                  {metadata.selectedCourseId && (
                    <span className="text-xs text-blue-600 ml-2">
                      (untuk {metadata.subject})
                    </span>
                  )}
                </label>
                
                {/* Bagian Topik Terpilih - Dipisahkan */}
                {metadata.topics.length > 0 && (
                  <div className="bg-blue-50 rounded-xl border-2 border-blue-200 p-4 mb-4">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-sm font-semibold text-gray-700">
                        Topik Terpilih ({metadata.topics.length})
                      </p>
                      <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                        {metadata.topics.length} dipilih
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                      {metadata.topics.map((topic) => (
                        <span
                          key={topic.id}
                          className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 px-3 py-1.5 rounded-lg text-sm font-medium border border-blue-200"
                        >
                          <Tag className="w-3 h-3" />
                          {topic.name}
                          <button
                            type="button"
                            onClick={() => handleTopicChange(topic.id, topic.name)}
                            className="text-blue-600 hover:text-blue-800 ml-1 hover:bg-blue-200 rounded-full p-0.5 transition-colors"
                            title="Hapus topik"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Bagian Pilih Topik */}
                <div className="bg-gray-50 rounded-xl border border-gray-300 p-3 min-h-[100px]">
                  {!metadata.selectedCourseId ? (
                    <div className="text-center py-6">
                      <Tag className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">
                        Pilih mata kuliah terlebih dahulu untuk menampilkan topik yang tersedia
                      </p>
                    </div>
                  ) : loadingMaterials ? (
                    <div className="text-center py-6">
                      <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                      <p className="text-sm text-gray-500">Memuat topik untuk {metadata.subject}...</p>
                    </div>
                  ) : filteredMaterialTags.length === 0 ? (
                    <div className="text-center py-6">
                      <AlertCircle className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                      <p className="text-sm text-gray-500 mb-2">
                        Belum ada topik yang tersedia untuk mata kuliah "{metadata.subject}"
                      </p>
                      <p className="text-xs text-gray-400">
                        Hubungi admin untuk menambahkan topik ke mata kuliah ini
                      </p>
                    </div>
                  ) : (
                    <>
                      <p className="text-xs text-gray-500 mb-3 font-medium">
                        Pilih topik untuk mata kuliah "{metadata.subject}":
                      </p>
                      <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto">
                        {filteredMaterialTags
                          .filter(tag => !metadata.topics.some(topic => topic.id === tag.id))
                          .map((tag) => (
                            <button
                              key={tag.id}
                              type="button"
                              onClick={() => handleTopicChange(tag.id, tag.name)}
                              className="inline-flex items-center gap-1 bg-white hover:bg-blue-50 border border-gray-200 hover:border-blue-300 text-gray-700 hover:text-blue-800 px-3 py-2 rounded-lg text-sm transition-all duration-200 hover:shadow-sm"
                            >
                              <Tag className="w-3 h-3" />
                              {tag.name}
                            </button>
                          ))}
                      </div>
                    </>
                  )}
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

              <div className="lecturer-dropdown">
                <label className="block text-sm font-medium mb-2 text-gray-700">Dosen</label>
                <div className="relative">
                  <User className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    name="lecturer"
                    value={metadata.lecturer}
                    onChange={(e) => {
                      const value = e.target.value;
                      setMetadata(prev => ({ ...prev, lecturer: value }));
                      setLecturerSearchTerm(value);
                      setShowLecturerDropdown(true);
                    }}
                    onFocus={() => {
                      if (!loadingLecturers) setShowLecturerDropdown(true);
                    }}
                    placeholder={loadingLecturers ? 'Memuat daftar dosen...' : 'Ketik nama dosen atau pilih dari daftar'}
                    disabled={loadingLecturers}
                    className="w-full pl-10 pr-10 py-3 bg-gray-50 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 disabled:opacity-60"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (!loadingLecturers) setShowLecturerDropdown(prev => !prev);
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    tabIndex={-1}
                  >
                    <ChevronDown className={`w-5 h-5 transition-transform ${showLecturerDropdown ? 'rotate-180' : ''}`} />
                  </button>

                  <AnimatePresence>
                    {showLecturerDropdown && !loadingLecturers && (
                      <motion.div
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        className="absolute z-10 mt-2 w-full bg-white border border-gray-200 rounded-xl shadow-lg max-h-56 overflow-y-auto"
                      >
                        {filteredLecturerOptions.length > 0 ? (
                          filteredLecturerOptions.map((lecturer) => (
                            <button
                              type="button"
                              key={lecturer.id}
                              className="w-full text-left px-4 py-2 hover:bg-blue-50 flex justify-between text-sm"
                              onMouseDown={() => {
                                setMetadata(prev => ({ ...prev, lecturer: lecturer.nama }));
                                setLecturerSearchTerm(lecturer.nama);
                                setShowLecturerDropdown(false);
                              }}
                            >
                              <span>{lecturer.nama}</span>
                              {lecturer.status === 'Nonaktif' && (
                                <span className="text-xs text-red-500">Nonaktif</span>
                              )}
                            </button>
                          ))
                        ) : (
                          <div className="px-4 py-3 text-sm text-gray-500">
                            Tidak ditemukan. Lanjutkan mengetik untuk input manual.
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {loadingLecturers
                    ? 'Sedang mengambil daftar dosen dari server...'
                    : 'Ketik beberapa huruf untuk mencari, atau pilih langsung dari daftar'}
                </p>
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
              className="w-full mt-8 bg-blue-600 text-white py-4 rounded-xl font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
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
                  <CheckCircle className="w-5 h-5" />
                  Simpan
                </>
              )}
            </motion.button>
          </motion.div>
        </div>
      </div>
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

export default UploadPage;