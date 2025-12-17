import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { Search, Filter, Download, User, Clock, Tag, Calendar, ArrowUpDown, X, CheckCircle, ChevronDown, FileText, BarChart2, Plus, Check, BookOpen, Trash2, AlertTriangle, Archive, RefreshCw, Trash, Info, CheckCircle2, XCircle, MessageCircle } from 'lucide-react';
import Footer from '../components/Footer';
import Header from '../components/Header';
import RecycleBinModal from '../components/RecycleBinModal.jsx';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

const API_URL = "http://localhost:8080/api";

const SearchPage = ({ currentUser }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('semua');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState([]);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [viewMode, setViewMode] = useState('grid');
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [questionSets, setQuestionSets] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [courseOptions, setCourseOptions] = useState([]);

  // State untuk soft delete
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // State untuk recycle bin
  const [showRecycleBinModal, setShowRecycleBinModal] = useState(false);

  // State untuk dropdown
  const [showLevelDropdown, setShowLevelDropdown] = useState(false);
  const [showCourseTagDropdown, setShowCourseTagDropdown] = useState(false);
  const [showMaterialTagDropdown, setShowMaterialTagDropdown] = useState(false);
  const [levelSearch, setLevelSearch] = useState('');
  const [courseTagSearch, setCourseTagSearch] = useState('');
  const [materialTagSearch, setMaterialTagSearch] = useState('');
  const [selectedCourseTags, setSelectedCourseTags] = useState([]);
  const [selectedMaterialTags, setSelectedMaterialTags] = useState([]);

  // Data dropdown state
  const [difficultyLevels, setDifficultyLevels] = useState([]);
  const [courseTags, setCourseTags] = useState([]);
  const [materialTags, setMaterialTags] = useState([]);
  const [dropdownLoading, setDropdownLoading] = useState(false);
  const [dropdownError, setDropdownError] = useState(null);

  // State untuk download progress
  const [downloadingItems, setDownloadingItems] = useState(new Set());

  // State untuk overlay notification
  const [notification, setNotification] = useState({
    show: false,
    message: '',
    type: 'info' // 'success', 'error', 'warning', 'info'
  });

  // State untuk menyimpan jumlah komentar per question set
  const [commentCounts, setCommentCounts] = useState({});

  // Helper function untuk cek apakah value adalah numeric ID
  const isNumericId = (value) => {
    if (!value) return false;
    const str = String(value).trim();
    // Cek apakah string adalah pure number (bisa parseInt)
    return !isNaN(str) && !isNaN(parseFloat(str)) && isFinite(str) && str.length > 0;
  };

  // Helper function untuk mendapatkan nama mata kuliah berdasarkan ID
  const getSubjectNameById = (subjectId) => {
    if (!subjectId || !courseOptions.length) {
      return subjectId;
    }
    
    const subjectIdStr = String(subjectId).trim();
    const course = courseOptions.find(course => {
      const courseIdStr = String(course.id).trim();
      return courseIdStr === subjectIdStr;
    });
    
    if (course) {
      return course.name;
    } else {
      return subjectId;
    }
  };

  // Helper function untuk mendapatkan nama mata kuliah (handles both ID and name)
  const getSubjectName = (subject) => {
    if (!subject) return subject;
    
    // Jika sudah berupa nama (bukan numeric ID), kembalikan langsung
    if (!isNumericId(subject)) {
      return subject;
    }
    
    // Jika numeric ID, resolve ke nama
    return getSubjectNameById(subject);
  };

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

  // Helper function to check if file extension is a programming language
  const isProgrammingLanguageFile = (extension) => {
    if (!extension) return false;
    
    const ext = extension.toLowerCase().trim();
    if (!ext.startsWith('.')) {
      return false;
    }
    
    // List of programming language file extensions
    const programmingExtensions = [
      '.js', '.jsx', '.ts', '.tsx',           // JavaScript/TypeScript
      '.java',                                 // Java
      '.py',                                   // Python
      '.cpp', '.c', '.h', '.hpp', '.cc', '.cxx', // C/C++
      '.cs',                                   // C#
      '.php',                                  // PHP
      '.rb',                                   // Ruby
      '.go',                                   // Go
      '.rs',                                   // Rust
      '.swift',                                // Swift
      '.kt', '.kts',                           // Kotlin
      '.scala',                                // Scala
      '.r',                                    // R
      '.m',                                    // Objective-C/Matlab
      '.pl', '.pm',                            // Perl
      '.sh', '.bash', '.zsh', '.fish',         // Shell scripts
      '.sql',                                  // SQL
      '.html', '.htm', '.css',                 // Web files
      '.xml', '.json', '.yaml', '.yml',        // Data formats
      '.md', '.markdown',                      // Markdown
      '.vue', '.svelte',                       // Frontend frameworks
      '.dart',                                 // Dart
      '.lua',                                  // Lua
      '.clj', '.cljs',                         // Clojure
      '.hs',                                   // Haskell
      '.elm',                                  // Elm
      '.ex', '.exs',                           // Elixir
      '.erl', '.hrl',                          // Erlang
      '.ml', '.mli',                           // OCaml
      '.fs', '.fsi', '.fsx',                   // F#
      '.vb', '.vbnet',                         // VB.NET
      '.pas', '.pp',                           // Pascal
      '.asm', '.s',                            // Assembly
      '.makefile', '.mk',                      // Makefile
      '.cmake',                                // CMake
      '.gradle',                               // Gradle
      '.maven', '.pom',                        // Maven
      '.dockerfile',                           // Dockerfile
      '.tf',                                   // Terraform
      '.groovy',                               // Groovy
      '.jsp', '.jspx',                         // JSP
      '.asp', '.aspx',                         // ASP.NET
      '.ps1', '.psm1',                         // PowerShell
      '.bat', '.cmd',                          // Batch files
      '.vbs',                                  // VBScript
      '.coffee',                               // CoffeeScript
      '.less', '.sass', '.scss',               // CSS preprocessors
      '.styl',                                 // Stylus
      '.jade', '.pug',                         // Template engines
    ];
    
    return programmingExtensions.includes(ext);
  };

  // UPDATED: Fungsi untuk download ZIP dengan semua file
  const handleDownload = async (id, fileName) => {
    if (downloadingItems.has(id)) {
      return; // Prevent multiple downloads
    }

    try {
      setDownloadingItems(prev => new Set(prev).add(id));
      
      console.log(`🔄 Starting ZIP download for question set ID: ${id}`);
      
      // Get detailed question set data with files
      const response = await axios.get(`${API_URL}/questionsets/${id}?download=true`);
      const questionSet = response.data;
      
      if (!questionSet.files || questionSet.files.length === 0) {
        showNotification('Tidak ada file yang tersedia untuk diunduh', 'warning');
        return;
      }
      
      console.log(`📁 Found ${questionSet.files.length} files to process`);
      
      // Create a new ZIP instance
      const zip = new JSZip();
      
      // Create folders in ZIP
      const soalFolder = zip.folder("01_Soal");
      const jawabanFolder = zip.folder("02_Kunci_Jawaban");
      const testCaseFolder = zip.folder("03_Test_Cases");
      
      // Track download promises and successful downloads
      const downloadPromises = [];
      let hasFiles = false;
      let downloadedFiles = {
        soal: 0,
        jawaban: 0,
        testcase: 0
      };
      
      // Process each file
      for (const file of questionSet.files) {
        let targetFolder = null;
        let folderName = '';
        let fileType = '';
        
        // Determine which folder based on file category
        switch (file.filecategory) {
          case 'soal':
          case 'questions':
            targetFolder = soalFolder;
            folderName = 'Soal';
            fileType = 'soal';
            break;
          case 'kunci':
          case 'answers':
            targetFolder = jawabanFolder;
            folderName = 'Kunci Jawaban';
            fileType = 'jawaban';
            break;
          case 'test':
          case 'testCases':
            targetFolder = testCaseFolder;
            folderName = 'Test Cases';
            fileType = 'testcase';
            break;
          default:
            console.warn(`⚠️ Unknown file category: ${file.filecategory}`);
            continue;
        }
        
        // Download file and add to ZIP
        const downloadPromise = axios.get(`${API_URL}/files/download/${file.id}`, {
          responseType: 'blob',
          timeout: 30000 // 30 second timeout
        }).then(fileResponse => {
          // Get file extension from original filename or content-type
          let fileExtension = '';
          let safeFileName = '';
          let isProgrammingFile = false;
          
          // Priority 1: Try to get extension from originalname (nama file asli saat upload)
          const originalName = file.originalname || file.filename || '';
          if (originalName && originalName.includes('.')) {
            const lastDot = originalName.lastIndexOf('.');
            fileExtension = originalName.substring(lastDot).toLowerCase();
            safeFileName = originalName;
            
            // Check if it's a programming language file
            isProgrammingFile = isProgrammingLanguageFile(fileExtension);
            
            if (isProgrammingFile) {
              console.log(`🔧 Detected programming language file: ${originalName} (${fileExtension})`);
            } else {
              console.log(`📄 Using original filename: ${originalName} (${fileExtension})`);
            }
          } 
          // Priority 2: Try filename if originalname doesn't have extension
          else if (file.filename && file.filename.includes('.')) {
            const lastDot = file.filename.lastIndexOf('.');
            fileExtension = file.filename.substring(lastDot).toLowerCase();
            safeFileName = file.filename;
            
            // Check if it's a programming language file
            isProgrammingFile = isProgrammingLanguageFile(fileExtension);
            
            if (isProgrammingFile) {
              console.log(`🔧 Detected programming language file from filename: ${file.filename} (${fileExtension})`);
            }
          } 
          // Priority 3: Determine extension from content-type
          else {
            const contentType = fileResponse.headers['content-type'] || fileResponse.headers['Content-Type'];
            console.log(`File ${file.id} content-type:`, contentType);
            
            if (contentType) {
              // Check for programming language content types first
              if (contentType.includes('javascript') || contentType.includes('application/javascript') || contentType.includes('text/javascript')) {
                fileExtension = '.js';
                isProgrammingFile = true;
              } else if (contentType.includes('json') || contentType.includes('application/json')) {
                fileExtension = '.json';
                isProgrammingFile = true;
              } else if (contentType.includes('xml') || contentType.includes('application/xml') || contentType.includes('text/xml')) {
                fileExtension = '.xml';
                isProgrammingFile = true;
              } else if (contentType.includes('python') || contentType.includes('text/x-python')) {
                fileExtension = '.py';
                isProgrammingFile = true;
              } else if (contentType.includes('java') || contentType.includes('text/x-java')) {
                fileExtension = '.java';
                isProgrammingFile = true;
              } else if (contentType.includes('pdf') || contentType.includes('application/pdf')) {
                fileExtension = '.pdf';
              } else if (contentType.includes('word') || contentType.includes('application/vnd.openxmlformats-officedocument.wordprocessingml.document')) {
                fileExtension = '.docx';
              } else if (contentType.includes('msword') || contentType.includes('application/msword')) {
                fileExtension = '.doc';
              } else if (contentType.includes('text') || contentType.includes('text/plain')) {
                // For text/plain, we can't determine exact type, so use .txt
                fileExtension = '.txt';
              } else {
                // If content-type is unknown, try to infer from filetype field if available
                if (file.filetype) {
                  const filetypeLower = file.filetype.toLowerCase();
                  if (filetypeLower.includes('pdf')) {
                    fileExtension = '.pdf';
                  } else if (filetypeLower.includes('word') || filetypeLower.includes('docx')) {
                    fileExtension = '.docx';
                  } else if (filetypeLower.includes('doc')) {
                    fileExtension = '.doc';
                  } else if (filetypeLower.includes('text') || filetypeLower.includes('txt')) {
                    fileExtension = '.txt';
                  } else {
                    // Last resort: use generic extension based on content-type pattern
                    // But DON'T assume PDF for answers or TXT for test cases
                    // Only use PDF if content-type suggests it
                    fileExtension = '.bin'; // Generic binary file
                    console.warn(`⚠️ Unknown file type for file ${file.id}, using .bin extension`);
                  }
                } else {
                  // No filetype info, use generic extension
                  fileExtension = '.bin';
                  console.warn(`⚠️ No file type information for file ${file.id}, using .bin extension`);
                }
              }
            } else {
              // No content-type, try filetype field
              if (file.filetype) {
                const filetypeLower = file.filetype.toLowerCase();
                if (filetypeLower.includes('pdf')) {
                  fileExtension = '.pdf';
                } else if (filetypeLower.includes('word') || filetypeLower.includes('docx')) {
                  fileExtension = '.docx';
                } else if (filetypeLower.includes('doc')) {
                  fileExtension = '.doc';
                } else if (filetypeLower.includes('text') || filetypeLower.includes('txt')) {
                  fileExtension = '.txt';
                } else {
                  fileExtension = '.bin';
                  console.warn(`⚠️ Unknown filetype "${file.filetype}" for file ${file.id}, using .bin extension`);
                }
              } else {
                // Last resort: use .bin as generic extension
                fileExtension = '.bin';
                console.warn(`⚠️ No file information available for file ${file.id}, using .bin extension`);
              }
            }
            
            // Create safe filename if original doesn't exist
            safeFileName = `${folderName}_${file.id}${fileExtension}`;
          }
          
          // CRITICAL: Always preserve the detected extension, especially for programming files
          // Never convert programming language files to PDF
          if (isProgrammingFile) {
            console.log(`✅ Preserving programming language file extension: ${fileExtension}`);
            // Ensure the filename has the correct extension
            if (safeFileName && !safeFileName.toLowerCase().endsWith(fileExtension.toLowerCase())) {
              // Remove any existing extension and add the correct one
              const lastDot = safeFileName.lastIndexOf('.');
              if (lastDot > 0) {
                safeFileName = safeFileName.substring(0, lastDot) + fileExtension;
              } else {
                safeFileName = safeFileName + fileExtension;
              }
            }
          } else {
            // For non-programming files, ensure filename has proper extension
            if (!safeFileName.includes('.')) {
              safeFileName += fileExtension;
            }
          }
          
          // Clean filename for ZIP compatibility
          safeFileName = safeFileName
            .replace(/[<>:"/\\|?*]/g, '_') // Replace invalid characters
            .replace(/\s+/g, '_') // Replace spaces
            .replace(/_+/g, '_'); // Remove multiple underscores
          
          console.log(`📁 Adding file: ${safeFileName} (${fileType}) - Extension: ${fileExtension}`);
          
          // Add file to appropriate folder in ZIP
          targetFolder.file(safeFileName, fileResponse.data);
          hasFiles = true;
          downloadedFiles[fileType]++;
          
          console.log(`✅ Added ${safeFileName} to ${folderName} folder`);
        }).catch(error => {
          console.error(`❌ Failed to download file ${file.id}:`, error);
          // Continue with other files even if one fails
        });
        
        downloadPromises.push(downloadPromise);
      }
      
      // Wait for all downloads to complete
      console.log('⏳ Waiting for all file downloads to complete...');
      await Promise.allSettled(downloadPromises);
      
      if (!hasFiles) {
        showNotification('Gagal mengunduh file. Tidak ada file yang berhasil diproses.', 'error');
        return;
      }
      
      // Add summary file in JSON format for programmatic access
      const summaryData = {
        questionSet: {
          id: id,
          title: questionSet.title || fileName,
          subject: getSubjectName(questionSet.subject),
          level: questionSet.level,
          lecturer: questionSet.lecturer,
          year: questionSet.year,
          topics: questionSet.topics,
          description: questionSet.description
        },
        download: {
          timestamp: new Date().toISOString(),
          user: currentUser?.username || 'Unknown',
          filesDownloaded: downloadedFiles,
          totalFiles: downloadedFiles.soal + downloadedFiles.jawaban + downloadedFiles.testcase
        }
      };
      
      zip.file("summary.json", JSON.stringify(summaryData, null, 2));
      
      // Generate ZIP file
      console.log('🔄 Generating ZIP file...');
      const zipBlob = await zip.generateAsync({
        type: "blob",
        compression: "DEFLATE",
        compressionOptions: {
          level: 6
        }
      });
      
      // Create safe filename for ZIP
      const safeFileName = (fileName || questionSet.title || `Soal_${id}`)
        .replace(/[^a-zA-Z0-9\s-_]/g, '') // Remove special characters
        .replace(/\s+/g, '_') // Replace spaces with underscores
        .substring(0, 50); // Limit length
      
      const zipFileName = `${safeFileName}_${new Date().toISOString().split('T')[0]}.zip`;
      
      // Save ZIP file
      saveAs(zipBlob, zipFileName);
      
      console.log(`✅ ZIP file "${zipFileName}" download started successfully`);
      
      // Show success message with details
      const successMessage = `Berhasil mengunduh paket soal "${fileName}"!\n\n` +
        `File yang diunduh:\n` +
        `- Soal: ${downloadedFiles.soal} file\n` +
        `- Kunci Jawaban: ${downloadedFiles.jawaban} file\n` +
        `- Test Cases: ${downloadedFiles.testcase} file\n\n` +
        `Total: ${downloadedFiles.soal + downloadedFiles.jawaban + downloadedFiles.testcase} file dalam format ZIP`;
      
      showNotification(successMessage, 'success');
      
    } catch (error) {
      console.error("❌ Error downloading files:", error);
      
      if (error.response?.status === 404) {
        showNotification('File soal tidak ditemukan atau telah dihapus', 'error');
      } else if (error.response?.status === 403) {
        showNotification('Anda tidak memiliki izin untuk mengunduh file ini', 'error');
      } else if (error.code === 'ECONNABORTED') {
        showNotification('Download timeout. Silakan coba lagi atau periksa koneksi internet.', 'warning');
      } else {
        showNotification(`Gagal mengunduh file: ${error.message}`, 'error');
      }
    } finally {
      setDownloadingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }
  };

  // FIXED: Fungsi untuk soft delete question set
  const handleSoftDelete = async (id) => {
    setIsDeleting(true);
    try {
      const token = getAuthToken();
      if (!token) {
        showNotification('Token autentikasi tidak ditemukan. Silakan login kembali.', 'error');
        return;
      }

      console.log(`🗑️ Performing soft delete for question set ID: ${id}`);
      
      const response = await axios.patch(
        `${API_URL}/questionsets/${id}/soft-delete`, 
        {}, 
        {
          headers: { 
            "x-access-token": token,
            "Content-Type": "application/json"
          }
        }
      );

      if (response.data.success) {
        console.log('✅ Question set soft deleted successfully');
        
        // Remove from local state
        setQuestionSets(prev => prev.filter(item => item.id !== id));
        setFilteredData(prev => prev.filter(item => item.id !== id));
        
        showNotification('Soal berhasil dipindahkan ke Recycle Bin', 'success');
        setShowDeleteModal(false);
        setItemToDelete(null);
      } else {
        throw new Error(response.data.message || 'Delete operation failed');
      }
      
    } catch (error) {
      console.error("❌ Error deleting question set:", error);
      
      if (error.response?.status === 401) {
        showNotification('Sesi telah berakhir. Silakan login kembali.', 'error');
      } else if (error.response?.status === 403) {
        showNotification('Anda tidak memiliki izin untuk menghapus soal ini.', 'error');
      } else if (error.response?.status === 404) {
        showNotification('⚠️ Endpoint soft delete belum tersedia di backend.\n\nPastikan backend sudah diupdate dengan:\n1. Route: PATCH /api/questionsets/:id/soft-delete\n2. Database column: is_deleted, deleted_at, deleted_by', 'warning');
      } else {
        showNotification(`Gagal menghapus soal: ${error.response?.data?.message || error.message}`, 'error');
      }
    } finally {
      setIsDeleting(false);
    }
  };

  // Handler callbacks untuk RecycleBinModal
  const handleItemRestored = (id) => {
    const initializeData = async () => {
      const courses = await fetchCourseOptions();
      await fetchQuestionSets(courses);
    };
    initializeData();
  };

  const handleItemPermanentlyDeleted = (id) => {
    console.log(`Item ${id} permanently deleted`);
  };

  // Helper functions
  const openRecycleBinModal = () => {
    setShowRecycleBinModal(true);
  };

  const confirmDelete = (item) => {
    setItemToDelete(item);
    setShowDeleteModal(true);
  };

  // Data fetching functions
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

  const fetchDropdownData = async () => {
    setDropdownError(null);
    
    try {
      console.log('🔄 Fetching dropdown data...');
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
      
      // Fallback data
      console.log('🔄 Using fallback data for dropdowns');
      setDifficultyLevels(['Mudah', 'Sedang', 'Sulit']);
      setCourseTags([
        'Algoritma dan Pemrograman', 'Struktur Data', 'Basis Data',
        'Pemrograman Web', 'Pemrograman Mobile', 'Jaringan Komputer',
        'Sistem Operasi', 'Rekayasa Perangkat Lunak'
      ]);
      setMaterialTags([
        'Array', 'Linked List', 'Stack', 'Queue', 'Tree', 'Graph',
        'Sorting', 'Searching', 'SQL', 'NoSQL', 'HTML', 'CSS',
        'JavaScript', 'React', 'Node.js', 'PHP', 'Python', 'Java'
      ]);
    }
  };

  // Fungsi untuk fetch jumlah komentar per question set (menggunakan batch endpoint)
  const fetchCommentCounts = useCallback(async (questionSetIds) => {
    if (!questionSetIds || questionSetIds.length === 0) return;
    
    try {
      // Gunakan batch endpoint untuk fetch semua jumlah komentar sekaligus
      const response = await axios.post(`${API_URL}/comments/counts`, {
        question_set_ids: questionSetIds
      });
      
      if (response.data.success && response.data.data) {
        setCommentCounts(prev => ({ ...prev, ...response.data.data }));
      }
    } catch (error) {
      console.error("Error fetching comment counts:", error);
      // Fallback: set semua ke 0 jika error
      const fallbackCounts = {};
      questionSetIds.forEach(id => {
        fallbackCounts[id] = 0;
      });
      setCommentCounts(prev => ({ ...prev, ...fallbackCounts }));
    }
  }, []);

  const fetchQuestionSets = async (courses = []) => {
    try {
      const response = await axios.get(`${API_URL}/questionsets`);
      
      console.log('🔄 Processing question sets data...');
      
      // Filter only active data (not deleted)
      const activeData = response.data.filter(item => 
        !item.isDeleted && 
        !item.deleted_at && 
        !item.deletedAt
      );
      
      const transformedData = activeData.map(item => {
        // Simpan subject ID asli
        const subjectId = item.subject;
        let subjectName = item.subject;
        
        // Priority 1: Gunakan courseName atau subjectName dari backend JIKA bukan numeric ID
        const backendName = item.courseName || item.subjectName;
        if (backendName && !isNumericId(backendName)) {
          // Backend memberikan nama yang valid (bukan ID)
          subjectName = backendName;
          console.log(`✅ Using backend name for subject ${subjectId}: ${subjectName}`);
        } 
        // Priority 2: Jika backend name adalah ID atau tidak ada, resolve menggunakan courseOptions
        else if (courseOptions.length > 0) {
          subjectName = getSubjectNameById(subjectId);
          if (subjectName !== subjectId) {
            console.log(`✅ Resolved subject ID ${subjectId} to name: ${subjectName}`);
          } else {
            console.warn(`⚠️ Could not resolve subject ID ${subjectId} to name. Available courses: ${courseOptions.map(c => `${c.id}:${c.name}`).join(', ')}`);
          }
        }
        // Priority 3: Fallback ke parameter courses jika courseOptions belum ter-load
        else if (courses.length > 0) {
          const course = courses.find(course => 
            course.id.toString() === subjectId.toString()
          );
          if (course) {
            subjectName = course.name;
            console.log(`✅ Resolved subject ID ${subjectId} to name using courses param: ${subjectName}`);
          } else {
            console.warn(`⚠️ Subject ID ${subjectId} not found in courses parameter`);
          }
        } else {
          console.warn(`⚠️ No course options available to resolve subject ID ${subjectId}`);
        }
        // Jika tidak ada yang cocok, tetap gunakan nilai asli (bisa ID atau nama)
        
        return {
          id: item.id,
          fileName: item.title,
          subject: subjectName,
          subjectId: subjectId, // Simpan ID asli untuk referensi
          year: item.year,
          lecturer: item.lecturer || (item.creator ? (item.creator.fullName || item.creator.username) : 'Unknown'),
          level: item.level,
          lastUpdated: new Date(item.lastupdated || item.updated_at).toISOString(),
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
      
      console.log(`✅ Processed ${transformedData.length} active question sets`);
      
      setQuestionSets(transformedData);
      setFilteredData(transformedData);
      
      // Fetch jumlah komentar untuk semua question set secara paralel (tidak blocking)
      // Ini akan langsung muncul karena menggunakan batch endpoint yang lebih cepat
      const questionSetIds = transformedData.map(item => item.id);
      if (questionSetIds.length > 0) {
        // Fetch komentar secara paralel tanpa menunggu - menggunakan batch endpoint
        fetchCommentCounts(questionSetIds).catch(err => 
          console.error("⚠️ Error fetching comment counts:", err)
        );
      }
    } catch (error) {
      console.error("❌ Error fetching question sets:", error);
    }
  };
  
  const handleCardClick = (id) => {
    navigate(`/preview/${id}`);
  };

  // Filter and search functions
  const filterData = useCallback(() => {
    // Tidak perlu set loading untuk filter/search karena sudah client-side
    // Pastikan questionSets tidak kosong
    if (!questionSets || questionSets.length === 0) {
      setFilteredData([]);
      return [];
    }
    
    // Mulai dengan semua data dari questionSets
    let filtered = [...questionSets];
    
    // Filter berdasarkan search query (jika ada dan tidak kosong)
    if (searchQuery && searchQuery.trim().length > 0) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(item => {
        const subjectName = getSubjectName(item.subject).toLowerCase();
        return (
          item.fileName.toLowerCase().includes(query) ||
          subjectName.includes(query) ||
          (item.lecturer && item.lecturer.toLowerCase().includes(query)) ||
          (item.topics && item.topics.some(topic => topic.toLowerCase().includes(query)))
        );
      });
    }
    
    // Filter berdasarkan tingkat kesulitan (jika ada)
    if (selectedLevel.length > 0) {
      filtered = filtered.filter(item => selectedLevel.includes(item.level));
    }
    
    // Filter berdasarkan course tags (jika ada)
    if (selectedCourseTags.length > 0) {
      filtered = filtered.filter(item => {
        const subjectName = getSubjectName(item.subject).toLowerCase();
        return selectedCourseTags.some(tag => subjectName.includes(tag.toLowerCase()));
      });
    }
    
    // Filter berdasarkan material tags (jika ada)
    if (selectedMaterialTags.length > 0) {
      filtered = filtered.filter(item => {
        return selectedMaterialTags.some(tag =>
          item.topics && item.topics.some(topic => topic.toLowerCase().includes(tag.toLowerCase()))
        );
      });
    }
    
    // Filter berdasarkan date range (jika ada)
    if (dateRange.start && dateRange.end) {
      const startDate = new Date(dateRange.start);
      const endDate = new Date(dateRange.end);
      
      filtered = filtered.filter(item => {
        const itemDate = new Date(item.lastUpdated);
        return itemDate >= startDate && itemDate <= endDate;
      });
    }
    
    // Pastikan filteredData selalu di-update, bahkan jika hasilnya kosong
    console.log(`🔍 Filter applied: ${filtered.length} results from ${questionSets.length} total items`);
    setFilteredData(filtered);
    return filtered;
  }, [questionSets, searchQuery, selectedLevel, selectedCourseTags, selectedMaterialTags, dateRange, courseOptions]);

  // Filter dropdown data
  const filteredLevels = difficultyLevels.filter(level =>
    level.toLowerCase().includes(levelSearch.toLowerCase())
  );

  const filteredCourseTags = courseTags.filter(tag =>
    tag.toLowerCase().includes(courseTagSearch.toLowerCase())
  );

  const filteredMaterialTags = materialTags.filter(tag =>
    tag.toLowerCase().includes(materialTagSearch.toLowerCase())
  );

  // Toggle functions
  const toggleLevel = (level) => {
    setSelectedLevel(prev => 
      prev.includes(level) ? prev.filter(l => l !== level) : [...prev, level]
    );
  };

  const toggleCourseTag = (tag) => {
    setSelectedCourseTags(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const toggleMaterialTag = (tag) => {
    setSelectedMaterialTags(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  // Helper functions for UI
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

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { 
        staggerChildren: 0.1,
        delayChildren: 0
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: {
        duration: 0.3
      }
    }
  };

  const dropdownVariants = {
    hidden: { opacity: 0, y: -10, height: 0 },
    visible: { opacity: 1, y: 0, height: 'auto' }
  };

  // Components
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

  const renderCard = (item) => {
    const hasAnswerKey = item.hasAnswerKey ?? false;
    const hasTestCase = item.hasTestCase ?? false;
    const isDownloading = downloadingItems.has(item.id);
    const commentCount = commentCounts[item.id] || 0;

    const completeness = (hasAnswerKey ? 1 : 0) + (hasTestCase ? 1 : 0);
    const completenessPercent = (completeness / 2) * 100;

    let completenessLabel = "Belum Lengkap";
    let barColor = "bg-red-400";
    if (completeness === 1) {
      completenessLabel = hasAnswerKey ? "Ada Kunci Jawaban" : "Ada Test Case";
      barColor = "bg-yellow-400";
    } else if (completeness === 2) {
      completenessLabel = "Lengkap";
      barColor = "bg-green-500";
    }

    return (
      <motion.div
        key={item.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className={`bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow cursor-pointer ${viewMode === 'grid' ? 'h-full' : ''}`}
        onClick={() => handleCardClick(item.id)}
      >
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">{item.fileName}</h3>
            <div className="flex items-center gap-2">
              {commentCount > 0 && (
                <div className="flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-600 rounded-full text-xs">
                  <MessageCircle className="w-3 h-3" />
                  <span className="font-medium">{commentCount}</span>
                </div>
              )}
              <span className={`px-2 py-1 text-xs rounded-full ${getLevelColor(item.level)}`}>
                {item.level}
              </span>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="p-1.5 text-red-500 hover:bg-red-50 rounded-full transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  confirmDelete(item);
                }}
                title="Hapus Soal"
              >
                <Trash2 className="w-4 h-4" />
              </motion.button>
            </div>
          </div>

          <div className="mb-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-gray-600">Kelengkapan Soal</span>
              <span className={`text-xs font-semibold ${
                completeness === 2 ? 'text-green-600' :
                completeness === 1 ? 'text-yellow-600' :
                'text-red-600'
              }`}>
                {completenessLabel}
              </span>
            </div>
            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`h-2 ${barColor} transition-all`}
                style={{ width: `${completenessPercent}%` }}
              />
            </div>
            <div className="flex justify-between mt-1">
              <span className={`text-[10px] flex items-center gap-1 ${hasAnswerKey ? 'text-green-600' : 'text-gray-400'}`}>
                <Check className="w-3 h-3" /> Kunci Jawaban
              </span>
              <span className={`text-[10px] flex items-center gap-1 ${hasTestCase ? 'text-green-600' : 'text-gray-400'}`}>
                <Check className="w-3 h-3" /> Test Case
              </span>
            </div>
          </div>

          <div className="space-y-2 mb-4">
            <div className="flex items-center text-sm text-gray-600">
              <BookOpen className="w-4 h-4 mr-2" />
              <span title={`Subject ID: ${item.subjectId}`}>{item.subject}</span>
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

          {item.topics?.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-4">
              {item.topics.map((topic, index) => (
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
            <div className="flex items-center gap-3 text-sm text-gray-500">
              <div className="flex items-center">
                <Download className="w-4 h-4 mr-1" />
                <span>{item.downloads} unduhan</span>
              </div>
              {commentCount > 0 && (
                <div className="flex items-center text-blue-600">
                  <MessageCircle className="w-4 h-4 mr-1" />
                  <span className="font-medium">{commentCount} komentar</span>
                </div>
              )}
            </div>
            <motion.button
              whileHover={{ scale: isDownloading ? 1 : 1.05 }}
              whileTap={{ scale: isDownloading ? 1 : 0.95 }}
              className={`px-3 py-1.5 text-white text-sm rounded-lg transition-colors flex items-center gap-1 ${
                isDownloading 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
              onClick={(e) => {
                e.stopPropagation();
                if (!isDownloading) {
                  handleDownload(item.id, item.fileName);
                }
              }}
              disabled={isDownloading}
            >
              {isDownloading ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-3 h-3 border-2 border-white border-t-transparent rounded-full"
                  />
                  Mengunduh...
                </>
              ) : (
                <>
                  <Download className="w-3 h-3" />
                  Unduh ZIP
                </>
              )}
            </motion.button>
          </div>
        </div>
      </motion.div>
    );
  };

  useEffect(() => {
    let isMounted = true; // Prevent updates on unmounted component
  
    const initialize = async () => {
      console.log("🔄 Initializing SearchPage data...");
      const startTime = performance.now();
      setIsInitialLoading(true);
  
      try {
        // Step 1: Load courses
        console.log("⏳ Fetching course options...");
        const courses = await fetchCourseOptions();
        if (!isMounted) return;
        console.log("✅ Course options loaded");
  
        // Step 2: Load question sets based on courses
        console.log("⏳ Fetching question sets...");
        await fetchQuestionSets(courses);
        if (!isMounted) return;
        console.log("✅ Question sets loaded");
        // Note: Comment counts akan di-fetch secara paralel di dalam fetchQuestionSets menggunakan batch endpoint yang cepat
  
        // Step 3: Load dropdown data in parallel (non-blocking)
        console.log("⏳ Fetching dropdown data (parallel)...");
        fetchDropdownData().catch(err =>
          console.error("⚠️ Dropdown fetch failed:", err)
        );
  
        const endTime = performance.now();
        console.log(`✨ Initialization complete in ${(endTime - startTime).toFixed(0)} ms`);
      } catch (err) {
        console.error("❌ Initialization failed:", err);
      } finally {
        // Set initial loading to false setelah semua data ter-load
        if (isMounted) {
          setIsInitialLoading(false);
        }
      }
    };
  
    initialize();
  
    // Cleanup
    return () => {
      isMounted = false;
    };
  }, []);
  

  // Re-transform question sets ketika courseOptions ter-load/update
  // Ini memastikan subject ID selalu di-resolve ke nama mata kuliah
  useEffect(() => {
    if (courseOptions.length > 0) {
      setQuestionSets(prevQuestionSets => {
        if (prevQuestionSets.length === 0) return prevQuestionSets;
        
        // Cek apakah ada item yang masih menggunakan ID (numeric) sebagai subject
        const needsRetransform = prevQuestionSets.some(item => {
          // Jika subject adalah numeric (baik sama dengan subjectId atau tidak), berarti perlu di-resolve
          return item.subjectId && !isNaN(item.subjectId) && isNumericId(item.subject);
        });

        if (!needsRetransform) {
          console.log('ℹ️ No re-transformation needed, all subjects already resolved');
          return prevQuestionSets;
        }

        console.log('🔄 Re-transforming question sets dengan courseOptions yang sudah ter-load...');
        console.log(`📚 Available courseOptions: ${courseOptions.length} courses`);
        
        const reTransformedData = prevQuestionSets.map(item => {
          // Jika subject masih berupa ID (numeric), resolve ke nama
          if (item.subjectId && !isNaN(item.subjectId) && isNumericId(item.subject)) {
            const resolvedName = getSubjectNameById(item.subjectId);
            // Jika berhasil di-resolve (bukan ID lagi), update
            if (resolvedName !== item.subjectId && resolvedName !== item.subject) {
              console.log(`✅ Re-resolved subject ID ${item.subjectId} from "${item.subject}" to "${resolvedName}"`);
              return {
                ...item,
                subject: resolvedName
              };
            } else if (resolvedName === item.subjectId) {
              console.warn(`⚠️ Could not resolve subject ID ${item.subjectId} to name. Available courses: ${courseOptions.map(c => `${c.id}:${c.name}`).join(', ')}`);
            }
          }
          return item;
        });

        // Update filteredData juga
        setFilteredData(reTransformedData);
        return reTransformedData;
      });
    }
  }, [courseOptions]);

  useEffect(() => {
    // Hanya filter jika sudah tidak dalam initial loading dan questionSets sudah ter-load
    if (!isInitialLoading && questionSets.length > 0) {
      const timeoutId = setTimeout(() => {
        filterData();
      }, 300);

      return () => clearTimeout(timeoutId);
    } else if (!isInitialLoading && questionSets.length === 0) {
      // Jika tidak ada data, set filteredData ke array kosong
      setFilteredData([]);
    }
  }, [filterData, isInitialLoading, questionSets.length, searchQuery, selectedLevel, selectedCourseTags, selectedMaterialTags, dateRange]);

  // Update comment counts ketika filteredData berubah
  useEffect(() => {
    if (filteredData.length > 0) {
      const questionSetIds = filteredData.map(item => item.id);
      // Hanya fetch jika ada ID yang belum ada di commentCounts
      const missingIds = questionSetIds.filter(id => !(id in commentCounts));
      if (missingIds.length > 0) {
        fetchCommentCounts(missingIds);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredData.map(item => item.id).join(',')]);

  // Handle outside clicks for dropdowns
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

  // Main render
  return (
    <div className="min-h-screen bg-white">
      <Header currentUser={currentUser} />

      <DropdownStatusIndicator />

      {isInitialLoading ? (
        <LoadingAnimation />
      ) : (
        <div className="w-full px-4 md:px-8 py-8 md:py-12">
          {/* Header Section */}
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
                onClick={() => filterData()}
              >
                <Search className="w-5 h-5" />
                Cari
              </motion.button>
            </div>

            {/* Dropdown Filters */}
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
                            onClick={() => toggleLevel(level)}
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
                            onClick={() => toggleCourseTag(tag)}
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
                            onClick={() => toggleMaterialTag(tag)}
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
                    className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm flex items-center gap-1"
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
                  className="p-2 rounded bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                  onClick={openRecycleBinModal}
                  title="Recycle Bin"
                >
                  <Archive className="w-5 h-5" />
                </motion.button>
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
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
              {filteredData && filteredData.length > 0 ? (
                filteredData.map((item) => renderCard(item))
              ) : (
                <div className="col-span-full text-center py-16">
                  <p className="text-lg text-gray-600">Tidak ada hasil yang ditemukan. Silakan coba pencarian lain.</p>
                </div>
              )}
            </div>
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
                    {filteredData && filteredData.length > 0 ? (
                      filteredData.map((item) => {
                        const isDownloading = downloadingItems.has(item.id);
                        return (
                          <motion.tr
                            key={item.id}
                            variants={itemVariants}
                            className="hover:bg-gray-50 cursor-pointer"
                            onClick={() => handleCardClick(item.id)}
                          >
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {item.fileName}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700" title={`Subject ID: ${item.subjectId}`}>
                              {item.subject}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-3 py-1 rounded-full text-xs ${getLevelColor(item.level)}`}>
                                {item.level}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                              {item.lecturer}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                              {formatDate(item.lastUpdated)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 text-center">
                              <div className="flex items-center justify-center gap-2">
                                <motion.button
                                  whileHover={{ scale: isDownloading ? 1 : 1.05 }}
                                  whileTap={{ scale: isDownloading ? 1 : 0.95 }}
                                  className={`inline-flex items-center px-3 py-1 rounded-lg text-sm text-white transition-colors ${
                                    isDownloading 
                                      ? 'bg-gray-400 cursor-not-allowed' 
                                      : 'bg-blue-600 hover:bg-blue-700'
                                  }`}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (!isDownloading) {
                                      handleDownload(item.id, item.fileName);
                                    }
                                  }}
                                  disabled={isDownloading}
                                >
                                  {isDownloading ? (
                                    <>
                                      <motion.div
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                        className="w-3 h-3 border-2 border-white border-t-transparent rounded-full mr-1"
                                      />
                                      Unduh...
                                    </>
                                  ) : (
                                    <>
                                      <Download className="w-3 h-3 mr-1" />
                                      Unduh ZIP
                                    </>
                                  )}
                                </motion.button>
                                <motion.button
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  className="inline-flex items-center px-3 py-1 rounded-lg text-sm text-white bg-red-600 hover:bg-red-700"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    confirmDelete(item);
                                  }}
                                >
                                  <Trash2 className="w-3 h-3 mr-1" />
                                  Hapus
                                </motion.button>
                              </div>
                            </td>
                          </motion.tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                          Tidak ada hasil yang ditemukan. Silakan coba pencarian lain.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </motion.div>
            )}

          <Link to="/upload">
            <motion.button
              className="fixed bottom-8 right-8 w-16 h-16 bg-blue-600 hover:bg-blue-700 rounded-full flex items-center justify-center shadow-lg z-50"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <Plus className="text-white w-8 h-8" />
            </motion.button>
          </Link>

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

      {/* Modals */}
      {/* Recycle Bin Modal */}
      <RecycleBinModal
        isOpen={showRecycleBinModal}
        onClose={() => setShowRecycleBinModal(false)}
        currentUser={currentUser}
        courseOptions={courseOptions}
        onItemRestored={handleItemRestored}
        onItemPermanentlyDeleted={handleItemPermanentlyDeleted}
      />

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 backdrop-blur-md bg-white/30 flex items-center justify-center z-50 p-4"
            onClick={() => setShowDeleteModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 max-w-md w-full shadow-2xl border border-white/20"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center mb-4">
                <div className="flex-shrink-0 w-10 h-10 bg-red-100/80 backdrop-blur-sm rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-gray-900">Masukan Ke Arsip</h3>
                  <p className="text-sm text-gray-500">Soal akan dimasukan ke dalam arsip</p>
                </div>
              </div>

              {itemToDelete && (
                <div className="mb-6 p-4 bg-gray-50/60 backdrop-blur-sm rounded-lg border border-gray-200/50">
                  <p className="text-sm text-gray-600">Anda Memasukan Ke Arsip:</p>
                  <p className="font-medium text-gray-900">{itemToDelete.fileName}</p>
                  <p className="text-sm text-gray-500">Mata Kuliah: {itemToDelete.subject}</p>
                  <p className="text-sm text-gray-500">Dosen: {itemToDelete.lecturer}</p>
                </div>
              )}

              <div className="flex justify-end space-x-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-4 py-2 text-gray-700 bg-gray-200/70 hover:bg-gray-300/70 backdrop-blur-sm rounded-lg transition-colors"
                  onClick={() => {
                    setShowDeleteModal(false);
                    setItemToDelete(null);
                  }}
                  disabled={isDeleting}
                >
                  Batal
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-4 py-2 bg-red-600/90 backdrop-blur-sm text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={() => handleSoftDelete(itemToDelete.id)}
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                      />
                      Menghapus...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4" />
                      Hapus Soal
                    </>
                  )}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filter Modal */}
      <AnimatePresence>
        {showFilterModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 backdrop-blur-md bg-white/30 flex items-center justify-center z-50 p-4"
            onClick={() => setShowFilterModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 max-w-md w-full shadow-2xl border border-white/20"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-900">Filter Pencarian</h3>
                <button
                  onClick={() => setShowFilterModal(false)}
                  className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-200/50 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tingkat Kesulitan
                  </label>
                  <div className="space-y-2">
                    {difficultyLevels.map((level) => (
                      <label key={level} className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          className="form-checkbox h-5 w-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                          checked={selectedLevel.includes(level)}
                          onChange={() => toggleLevel(level)}
                        />
                        <span className="text-gray-700">{level}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rentang Tanggal
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Dari</label>
                      <input
                        type="date"
                        className="w-full p-2 border border-gray-300/50 rounded-lg bg-white/70 backdrop-blur-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        value={dateRange.start}
                        onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Sampai</label>
                      <input
                        type="date"
                        className="w-full p-2 border border-gray-300/50 rounded-lg bg-white/70 backdrop-blur-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        value={dateRange.end}
                        onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-2">
                  <button
                    className="px-4 py-2 text-gray-700 hover:bg-gray-100/70 backdrop-blur-sm rounded-lg transition"
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
                    className="px-6 py-2 bg-blue-600/90 backdrop-blur-sm text-white rounded-lg hover:bg-blue-700 transition"
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

      {/* Mobile Filter Button */}
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

export default SearchPage;