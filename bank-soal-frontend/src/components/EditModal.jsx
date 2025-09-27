import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { User, FileText, ChevronDown, X, AlertCircle, CheckCircle, AlertTriangle } from "lucide-react";  

const API_URL = "http://localhost:8080/api";

export default function EditModal({ isOpen, onClose, questionSet = {}, currentUser = {} }) {
    // Main state for form data
    const [metadata, setMetadata] = useState({
        title: "",
        description: "",
        difficulty: "",
        lecturer: "",
        topics: [],
        subject: "",
        year: new Date().getFullYear(),
    });

    // UI states
    const [courseOptions, setCourseOptions] = useState([]);
    const [availableMaterials, setAvailableMaterials] = useState([]);
    const [loadingCourses, setLoadingCourses] = useState(false);
    const [loadingMaterials, setLoadingMaterials] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [validationErrors, setValidationErrors] = useState({});
    const [submitSuccess, setSubmitSuccess] = useState(false);
    const [submitError, setSubmitError] = useState(null);
    
    // State untuk menyimpan nama mata kuliah - ini yang diperbaiki
    const [subjectName, setSubjectName] = useState("");

    // Debug info
    useEffect(() => {
        if (isOpen) {
            console.log("🔍 EditModal Debug Info:");
            console.log("- isOpen:", isOpen);
            console.log("- questionSet:", questionSet);
            console.log("- currentUser:", currentUser);
            console.log("- API_URL:", API_URL);
        }
    }, [isOpen, questionSet, currentUser]);

    // Fetch course options when modal opens
    useEffect(() => {
        if (isOpen) {
            fetchCourseOptions();
            setValidationErrors({});
            setSubmitSuccess(false);
            setSubmitError(null);
        }
    }, [isOpen]);

    // Fetch materials when subject changes
    useEffect(() => {
        if (metadata.subject && isOpen) {
            fetchMaterialsForCourse(metadata.subject);
        }
    }, [metadata.subject, isOpen]);

    // PERBAIKAN: Function untuk mendapatkan nama mata kuliah berdasarkan ID
    const getSubjectNameById = (subjectId) => {
        if (!subjectId || !courseOptions.length) return "";
        const foundCourse = courseOptions.find(course => 
            course.id.toString() === subjectId.toString()
        );
        return foundCourse ? foundCourse.name : "";
    };

    // PERBAIKAN: Sync metadata when modal opens or questionSet changes
    useEffect(() => {
        if (isOpen && questionSet && courseOptions.length > 0) {
            let subjectValue = questionSet.subject || "";
            let currentSubjectName = "";

            // Convert subject name to ID if needed AND set subject name
            if (subjectValue && isNaN(subjectValue)) {
                const foundCourse = courseOptions.find(course => 
                    course.name === subjectValue || 
                    course.name.toLowerCase() === subjectValue.toLowerCase()
                );
                if (foundCourse) {
                    subjectValue = foundCourse.id;
                    currentSubjectName = foundCourse.name;
                    console.log(`🔄 Converted course name "${questionSet.subject}" to ID ${foundCourse.id}`);
                }
            } else if (subjectValue) {
                // Jika subject sudah berupa ID, cari nama mata kuliahnya
                currentSubjectName = getSubjectNameById(subjectValue);
            }
            
            // Set subject name state
            setSubjectName(currentSubjectName);
            
            setMetadata({
                title: questionSet.title || "",
                description: questionSet.description || "",
                difficulty: questionSet.difficulty || questionSet.level || "", 
                lecturer: questionSet.lecturer || currentUser.username || "",
                topics: Array.isArray(questionSet.topics) 
                    ? questionSet.topics 
                    : (questionSet.topics ? questionSet.topics.split(",").map(t => t.trim()) : []),
                subject: subjectValue,
                year: questionSet.year || new Date().getFullYear(),
            });

            console.log("📋 Metadata initialized:", {
                title: questionSet.title,
                subject: subjectValue,
                subjectName: currentSubjectName,
                topics: questionSet.topics
            });
        }
    }, [isOpen, questionSet, currentUser, courseOptions]);

    // Helper function to get token from multiple sources
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
        
        console.log('🔍 Token found:', token ? 'Yes' : 'No');
        return token;
    };

    // Validation function
    const validateField = (name, value) => {
        const errors = { ...validationErrors };
        
        switch (name) {
            case 'title':
                if (!value.trim()) {
                    errors.title = 'Judul tidak boleh kosong';
                } else if (value.trim().length < 3) {
                    errors.title = 'Judul minimal 3 karakter';
                } else {
                    delete errors.title;
                }
                break;
            case 'subject':
                if (!value) {
                    errors.subject = 'Mata kuliah harus dipilih';
                } else {
                    delete errors.subject;
                }
                break;
            case 'difficulty':
                if (!value) {
                    errors.difficulty = 'Tingkat kesulitan harus dipilih';
                } else {
                    delete errors.difficulty;
                }
                break;
            case 'year':
                const currentYear = new Date().getFullYear();
                if (value < 1990 || value > currentYear) {
                    errors.year = `Tahun harus antara 1990 - ${currentYear}`;
                } else {
                    delete errors.year;
                }
                break;
            default:
                break;
        }
        
        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    // Validate all fields
    const validateAllFields = () => {
        const fields = ['title', 'subject', 'difficulty', 'year'];
        let isValid = true;
        
        fields.forEach(field => {
            const fieldValid = validateField(field, metadata[field]);
            if (!fieldValid) isValid = false;
        });
        
        return isValid;
    };

    const fetchCourseOptions = async () => {
        setLoadingCourses(true);
        try {
            const token = getAuthToken();
            if (!token) {
                console.error("No auth token found for fetching courses");
                return;
            }
            
            console.log('🔍 Fetching courses from:', `${API_URL}/course-material-stats`);
            
            const response = await fetch(`${API_URL}/course-material-stats`, {
                method: 'GET',
                headers: { 
                    "x-access-token": token,
                    "Content-Type": "application/json"
                }
            });

            console.log('📡 Courses response status:', response.status);

            if (response.ok) {
                const courses = await response.json();
                console.log("✅ Courses loaded:", courses);
                setCourseOptions(courses.map(course => ({
                    id: course.id,
                    name: course.name
                })));
            } else {
                const errorText = await response.text();
                console.error("❌ Failed to fetch courses:", response.status, errorText);
            }
        } catch (error) {
            console.error("❌ Error fetching courses:", error);
        } finally {
            setLoadingCourses(false);
        }
    };

    const fetchMaterialsForCourse = async (courseId) => {
        if (!courseId) return;
        console.log("🔍 Fetching materials for courseId:", courseId);
        setLoadingMaterials(true);
        setAvailableMaterials([]);
        
        try {
            const token = getAuthToken();
            if (!token) {
                console.error("No auth token found for fetching materials");
                return;
            }
            
            const url = `${API_URL}/course-material-assignments/course/${courseId}/materials-for-upload`;
            console.log('🔍 Fetching materials from:', url);
            
            const response = await fetch(url, {
                method: 'GET',
                headers: { 
                    "x-access-token": token,
                    "Content-Type": "application/json"
                }
            });

            console.log('📡 Materials response status:', response.status);

            if (response.ok) {
                const result = await response.json();
                if (result.success) {
                    setAvailableMaterials(result.data || []);
                    console.log(`✅ Loaded ${result.data?.length || 0} materials for course`);
                } else {
                    console.warn("⚠️ API returned success=false:", result.message);
                }
            } else {
                const errorText = await response.text();
                console.error("❌ Failed to fetch materials:", response.status, errorText);
            }
        } catch (error) {
            console.error("❌ Error fetching materials for course:", error);
        } finally {
            setLoadingMaterials(false);
        }
    };

    // PERBAIKAN: Enhanced handleChange function
    const handleChange = (e) => {
        const { name, value } = e.target;
        
        // PERBAIKAN: Jika yang berubah adalah subject, simpan nama mata kuliahnya
        if (name === 'subject') {
            const selectedCourse = courseOptions.find(course => course.id.toString() === value);
            if (selectedCourse) {
                setSubjectName(selectedCourse.name);
                console.log('📝 Subject name set to:', selectedCourse.name);
            } else {
                setSubjectName("");
            }
        }
        
        setMetadata((prev) => ({
            ...prev,
            [name]: value,
        }));
        
        // Clear submit error when user makes changes
        if (submitError) {
            setSubmitError(null);
        }
        
        // Validate field on change
        validateField(name, value);
        
        console.log(`📝 Field ${name} changed to:`, value);
    };

    const handleTopicToggle = (materialName) => {
        setMetadata(prev => {
            const isSelected = prev.topics.includes(materialName);
            const newTopics = isSelected 
                ? prev.topics.filter(topic => topic !== materialName)
                : [...prev.topics, materialName];
            
            console.log(`🏷️ Topic ${materialName} ${isSelected ? 'removed' : 'added'}. New topics:`, newTopics);
            
            return { ...prev, topics: newTopics };
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
    
        // Clear previous errors
        setSubmitError(null);
        
        // Validate all fields before submit
        if (!validateAllFields()) {
            console.log("❌ Validation failed");
            setSubmitError("Mohon perbaiki kesalahan pada form sebelum menyimpan.");
            return;
        }
    
        if (!questionSet?.id) {
            setSubmitError("ID Set Soal tidak ditemukan. Gagal update.");
            return;
        }
    
        setIsSubmitting(true);
        setSubmitSuccess(false);
    
        try {
            const token = getAuthToken();
            if (!token) {
                setSubmitError("Token otentikasi tidak ditemukan. Silakan login ulang.");
                setIsSubmitting(false);
                return;
            }
    
            // Validate token
            try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                if (payload.exp && payload.exp < Date.now() / 1000) {
                    setSubmitError('Sesi Anda telah berakhir. Silakan login ulang.');
                    setIsSubmitting(false);
                    return;
                }
            } catch (tokenError) {
                console.error('Token validation error:', tokenError);
                setSubmitError('Token tidak valid. Silakan login ulang.');
                setIsSubmitting(false);
                return;
            }
    
            // PERBAIKAN: Prepare payload dengan proper topics handling dan subject name
            const payload = {
                title: metadata.title.trim(),
                description: metadata.description.trim(),
                subject: metadata.subject.toString(),
                subjectName: subjectName, // Include subject name for backend processing
                year: parseInt(metadata.year),
                lecturer: metadata.lecturer.trim(),
                topics: Array.isArray(metadata.topics) 
                    ? metadata.topics.join(', ')
                    : (typeof metadata.topics === 'string' ? metadata.topics : ''),
                difficulty: metadata.difficulty,
            };
  
            console.log("📤 Submitting update with payload:", JSON.stringify(payload, null, 2));
            console.log("📤 Current subjectName state:", subjectName);
            console.log("📤 Updating question set ID:", questionSet.id);
    
            const requestHeaders = {
                "Content-Type": "application/json",
                "x-access-token": token,
            };
    
            const response = await fetch(`${API_URL}/questionsets/${questionSet.id}`, {
                method: "PUT",
                headers: requestHeaders,
                body: JSON.stringify(payload),
            });
    
            console.log("📡 Response status:", response.status);
    
            if (response.ok) {
                const result = await response.json();
                console.log("✅ Update successful:", result);
    
                setSubmitSuccess(true);
    
                // PERBAIKAN: Pass updated data dengan subject name yang benar
                const updatedData = {
                    ...result.data,
                    subject: metadata.subject,
                    subjectName: subjectName, // Pastikan subject name ikut di-pass
                    courseName: subjectName   // Alias untuk backward compatibility
                };
    
                // Show success message for a moment, then close
                setTimeout(() => {
                    onClose(true, updatedData); // Pass success flag and updated data
                }, 1500);
    
            } else {
                let errorMessage = "Gagal menyimpan perubahan.";
                let detailedError = null;
    
                try {
                    const errorResult = await response.json();
                    errorMessage = errorResult.message || errorMessage;
                    detailedError = errorResult;
                    console.error("❌ Update failed with JSON response:", errorResult);
                } catch (parseError) {
                    const errorText = await response.text();
                    console.error("❌ Update failed with text response:", errorText);
                    detailedError = { status: response.status, text: errorText };
    
                    if (response.status === 401) {
                        errorMessage = "Sesi Anda telah berakhir. Silakan login ulang.";
                    } else if (response.status === 403) {
                        errorMessage = "Anda tidak memiliki izin untuk mengubah data ini.";
                    } else if (response.status === 404) {
                        errorMessage = "Set soal tidak ditemukan.";
                    } else if (response.status === 422) {
                        errorMessage = "Data yang dikirim tidak valid. Periksa kembali form Anda.";
                    } else if (response.status >= 500) {
                        errorMessage = "Terjadi kesalahan pada server. Silakan coba lagi atau hubungi administrator.";
                    }
                }
    
                console.error("❌ Complete error details:", {
                    status: response.status,
                    statusText: response.statusText,
                    url: response.url,
                    payload: payload,
                    questionSetId: questionSet.id,
                    detailedError: detailedError
                });
    
                setSubmitError(`${errorMessage}${response.status === 500 ? ` (Error ${response.status})` : ''}`);
            }
        } catch (err) {
            console.error("❌ Network error saat update:", err);
    
            if (err.name === 'TypeError' && err.message.includes('fetch')) {
                setSubmitError("Tidak dapat terhubung ke server. Periksa koneksi internet Anda.");
            } else {
                setSubmitError(`Terjadi kesalahan jaringan: ${err.message}`);
            }
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const handleClose = () => {
        setValidationErrors({});
        setSubmitSuccess(false);
        setSubmitError(null);
        setSubjectName(""); // Reset subject name
        onClose(false);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto p-8"
            >
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h2 className="text-3xl font-bold text-gray-900">Edit Set Soal</h2>
                        <p className="text-gray-500">Ubah data soal sesuai kebutuhan</p>
                        {/* Debug info - hapus di production */}
                        <p className="text-xs text-blue-600 mt-1">
                            Current subject: {subjectName || 'Not selected'} (ID: {metadata.subject})
                        </p>
                    </div>
                    <button 
                        onClick={handleClose} 
                        className="text-gray-500 hover:text-gray-800 text-2xl"
                        disabled={isSubmitting}
                    >
                        ✕
                    </button>
                </div>

                {/* Success Message */}
                {submitSuccess && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-6 p-4 bg-green-100 border border-green-300 rounded-xl flex items-center gap-2"
                    >
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <span className="text-green-800 font-medium">Data berhasil diperbarui!</span>
                    </motion.div>
                )}

                {/* Error Message */}
                {submitError && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-6 p-4 bg-red-100 border border-red-300 rounded-xl flex items-start gap-2"
                    >
                        <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                        <div>
                            <span className="text-red-800 font-medium block">Gagal menyimpan perubahan</span>
                            <span className="text-red-700 text-sm">{submitError}</span>
                        </div>
                    </motion.div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        {/* Title Field */}
                        <div>
                            <label className="block mb-1 font-medium">Judul Set Soal *</label>
                            <input
                                type="text"
                                name="title"
                                value={metadata.title}
                                onChange={handleChange}
                                required
                                disabled={isSubmitting}
                                className={`w-full px-4 py-3 rounded-xl border focus:ring-2 focus:border-transparent transition-colors ${
                                    validationErrors.title 
                                        ? 'border-red-300 focus:ring-red-500' 
                                        : 'border-gray-300 focus:ring-blue-500'
                                } ${isSubmitting ? 'bg-gray-50 cursor-not-allowed' : ''}`}
                                placeholder="Masukkan judul set soal"
                            />
                            {validationErrors.title && (
                                <div className="flex items-center gap-1 mt-1">
                                    <AlertCircle className="w-4 h-4 text-red-500" />
                                    <p className="text-red-500 text-sm">{validationErrors.title}</p>
                                </div>
                            )}
                        </div>

                        {/* Description Field */}
                        <div>
                            <label className="block mb-1 font-medium">Deskripsi</label>
                            <textarea
                                name="description"
                                value={metadata.description}
                                onChange={handleChange}
                                rows="3"
                                disabled={isSubmitting}
                                className={`w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                    isSubmitting ? 'bg-gray-50 cursor-not-allowed' : ''
                                }`}
                                placeholder="Deskripsi optional untuk set soal"
                            />
                        </div>

                        {/* PERBAIKAN: Subject Dropdown dengan display yang lebih jelas */}
                        <div>
                            <label className="block mb-1 font-medium">Mata Kuliah * 
                                {subjectName && <span className="text-sm font-normal text-green-600 ml-2">({subjectName})</span>}
                            </label>
                            <div className="relative">
                                <select
                                    name="subject"
                                    value={metadata.subject}
                                    onChange={handleChange}
                                    required
                                    disabled={loadingCourses || isSubmitting}
                                    className={`w-full px-4 py-3 rounded-xl border focus:ring-2 focus:border-transparent appearance-none bg-white pr-10 ${
                                        validationErrors.subject 
                                            ? 'border-red-300 focus:ring-red-500' 
                                            : 'border-gray-300 focus:ring-blue-500'
                                    } ${(loadingCourses || isSubmitting) ? 'bg-gray-50 cursor-not-allowed' : ''}`}
                                >
                                    <option value="" disabled>
                                        {loadingCourses ? "Memuat mata kuliah..." : "Pilih mata kuliah"}
                                    </option>
                                    {courseOptions.map((course) => (
                                        <option key={course.id} value={course.id}>
                                            {course.name}
                                        </option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                            </div>
                            {validationErrors.subject && (
                                <div className="flex items-center gap-1 mt-1">
                                    <AlertCircle className="w-4 h-4 text-red-500" />
                                    <p className="text-red-500 text-sm">{validationErrors.subject}</p>
                                </div>
                            )}
                        </div>

                        {/* Topics/Materials Multi-select */}
                        <div>
                            <label className="block mb-1 font-medium">
                                Topik Materi 
                                {metadata.subject && availableMaterials.length === 0 && !loadingMaterials && (
                                    <span className="text-sm text-orange-600 ml-2">
                                        (Belum ada materi untuk mata kuliah ini)
                                    </span>
                                )}
                            </label>
                            {!metadata.subject ? (
                                <div className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-gray-50 text-gray-500">
                                    Pilih mata kuliah terlebih dahulu
                                </div>
                            ) : loadingMaterials ? (
                                <div className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-gray-50 text-gray-500 flex items-center gap-2">
                                    <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                                    Memuat materi...
                                </div>
                            ) : availableMaterials.length === 0 ? (
                                <div className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-yellow-50 text-yellow-700">
                                    Belum ada materi yang ditugaskan untuk mata kuliah ini. 
                                    Hubungi admin untuk menambah materi.
                                </div>
                            ) : (
                                <div className="border border-gray-300 rounded-xl p-4 max-h-48 overflow-y-auto">
                                    <div className="space-y-2">
                                        {availableMaterials.map((material) => (
                                            <label key={material.id} className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 p-2 rounded">
                                                <input
                                                    type="checkbox"
                                                    checked={metadata.topics.includes(material.name)}
                                                    onChange={() => handleTopicToggle(material.name)}
                                                    disabled={isSubmitting}
                                                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                                                />
                                                <span className="text-gray-700">{material.name}</span>
                                            </label>
                                        ))}
                                    </div>
                                    {metadata.topics.length > 0 && (
                                        <div className="mt-3 pt-3 border-t border-gray-200">
                                            <p className="text-sm text-gray-600 mb-2">Topik terpilih ({metadata.topics.length}):</p>
                                            <div className="flex flex-wrap gap-2">
                                                {metadata.topics.map((topic, index) => (
                                                    <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                        {topic}
                                                        <button
                                                            type="button"
                                                            onClick={() => handleTopicToggle(topic)}
                                                            disabled={isSubmitting}
                                                            className="ml-1 w-4 h-4 rounded-full hover:bg-blue-200 flex items-center justify-center"
                                                        >
                                                            <X className="w-3 h-3" />
                                                        </button>
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Difficulty Field */}
                        <div>
                            <label className="block mb-1 font-medium">Tingkat Kesulitan *</label>
                            <div className="relative">
                                <select
                                    name="difficulty"
                                    value={metadata.difficulty}
                                    onChange={handleChange}
                                    required
                                    disabled={isSubmitting}
                                    className={`w-full px-4 py-3 rounded-xl border focus:ring-2 focus:border-transparent appearance-none bg-white pr-10 ${
                                        validationErrors.difficulty 
                                            ? 'border-red-300 focus:ring-red-500' 
                                            : 'border-gray-300 focus:ring-blue-500'
                                    } ${isSubmitting ? 'bg-gray-50 cursor-not-allowed' : ''}`}
                                >
                                    <option value="" disabled>Pilih tingkat kesulitan</option>
                                    <option value="Mudah">Mudah</option>
                                    <option value="Sedang">Sedang</option>
                                    <option value="Sulit">Sulit</option>
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                            </div>
                            {validationErrors.difficulty && (
                                <div className="flex items-center gap-1 mt-1">
                                    <AlertCircle className="w-4 h-4 text-red-500" />
                                    <p className="text-red-500 text-sm">{validationErrors.difficulty}</p>
                                </div>
                            )}
                        </div>

                        {/* Lecturer Field */}
                        <div>
                            <label className="block mb-1 font-medium">Dosen</label>
                            <div className="flex items-center gap-2 px-4 py-3 bg-gray-100 rounded-xl border border-gray-300">
                                <User className="w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    name="lecturer"
                                    value={metadata.lecturer}
                                    readOnly
                                    className="flex-1 bg-transparent border-none focus:ring-0 text-gray-700"
                                />
                            </div>
                        </div>

                        {/* Year Field */}
                        <div>
                            <label className="block mb-1 font-medium">Tahun *</label>
                            <input
                                type="number"
                                name="year"
                                value={metadata.year}
                                onChange={handleChange}
                                min="1990"
                                max={new Date().getFullYear()}
                                disabled={isSubmitting}
                                className={`w-full px-4 py-3 rounded-xl border focus:ring-2 focus:border-transparent ${
                                    validationErrors.year 
                                        ? 'border-red-300 focus:ring-red-500' 
                                        : 'border-gray-300 focus:ring-blue-500'
                                } ${isSubmitting ? 'bg-gray-50 cursor-not-allowed' : ''}`}
                            />
                            {validationErrors.year && (
                                <div className="flex items-center gap-1 mt-1">
                                    <AlertCircle className="w-4 h-4 text-red-500" />
                                    <p className="text-red-500 text-sm">{validationErrors.year}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end gap-3 pt-8">
                        <motion.button
                            type="button"
                            onClick={handleClose}
                            disabled={isSubmitting}
                            whileHover={!isSubmitting ? { scale: 1.02 } : {}}
                            whileTap={!isSubmitting ? { scale: 0.98 } : {}}
                            className={`px-6 py-3 rounded-xl transition-colors font-medium ${
                                isSubmitting 
                                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                                    : 'bg-gray-200 hover:bg-gray-300'
                            }`}
                        >
                            Batal
                        </motion.button>
                        <motion.button
                            type="submit"
                            disabled={isSubmitting || Object.keys(validationErrors).length > 0}
                            whileHover={!isSubmitting && Object.keys(validationErrors).length === 0 ? { scale: 1.02 } : {}}
                            whileTap={!isSubmitting && Object.keys(validationErrors).length === 0 ? { scale: 0.98 } : {}}
                            className={`px-6 py-3 rounded-xl text-white transition-colors font-medium flex items-center gap-2 ${
                                isSubmitting || Object.keys(validationErrors).length > 0
                                    ? 'bg-gray-400 cursor-not-allowed' 
                                    : 'bg-blue-600 hover:bg-blue-700'
                            }`}
                        >
                            {isSubmitting ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    Menyimpan...
                                </>
                            ) : submitSuccess ? (
                                <>
                                    <CheckCircle className="w-5 h-5" />
                                    Berhasil!
                                </>
                            ) : (
                                <>
                                    <FileText className="w-5 h-5" />
                                    Simpan Perubahan
                                </>
                            )}
                        </motion.button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
}