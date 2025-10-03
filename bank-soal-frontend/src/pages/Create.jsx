import React, { useState, useRef, useEffect } from 'react';
import { motion } from "framer-motion";
// Di bagian import tambahkan:
import LogoUnpar from "../assets/LogoUnpar.png";
import LogoIF from "../assets/LogoIF.jpg";

// Lalu di komponen Header, ganti bagian logo:
<div className="flex items-center space-x-4">
    <img
        src={LogoUnpar}
        alt="Logo Unpar"
        className="h-10 w-auto"
    />
    <div className="h-8 w-px bg-gray-300"></div>
    <img
        src={LogoIF}
        alt="Logo IF"
        className="h-10 w-auto rounded"
    />
</div>
import {
    Upload, File, Search, Trash2, Edit, Download, Plus,
    Move, ChevronDown, ChevronUp, Check, Database, FileText, Clock, User, BookOpen, Calendar
} from 'lucide-react';

// Header Component
const Header = ({ currentUser }) => {
    const handleLogout = () => {
        // Implement logout logic
        window.location.href = '/login';
    };

    return (
        <motion.header
            className="bg-white shadow-md py-4 px-6 md:px-12 lg:px-24"
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                <img
        src={LogoUnpar}
        alt="Logo Unpar"
        className="h-10 w-auto"
    />
                    <div className="h-8 w-px bg-gray-300"></div>
                    <img
        src={LogoIF}
        alt="Logo IF"
        className="h-10 w-auto rounded"
    />
                </div>

                <nav className="flex items-center space-x-7">
                    {[
                        { name: "Home", path: "/" },
                        { name: "Cari Soal", path: "/search" },
                        { name: "Paket Soal", path: "/question-sets" }
                    ].map((item) => (
                        <div className="relative group" key={item.name}>
                            <a href={item.path}>
                                <motion.span
                                    whileHover={{ y: -2 }}
                                    className="text-gray-600 hover:text-blue-600 font-medium cursor-pointer px-1 py-2 block"
                                >
                                    {item.name}
                                </motion.span>
                                <motion.div
                                    className="h-0.5 w-0 bg-blue-600 absolute bottom-0 left-0"
                                    initial={{ width: 0 }}
                                    whileHover={{ width: "100%" }}
                                    transition={{ duration: 0.3 }}
                                />
                            </a>
                        </div>
                    ))}
                </nav>

                {currentUser ? (
                    <div className="flex items-center space-x-2">
                        <motion.div
                            className="px-6 py-2 bg-blue-100 text-blue-800 rounded-lg font-medium"
                            whileHover={{ scale: 1.05 }}
                        >
                            {currentUser.username || currentUser.email}
                        </motion.div>
                        <motion.button
                            onClick={handleLogout}
                            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium transition-all duration-300"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            Logout
                        </motion.button>
                    </div>
                ) : (
                    <a href="/login">
                        <motion.button
                            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all duration-300"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            Login
                        </motion.button>
                    </a>
                )}
            </div>
        </motion.header>
    );
};

const FormCreatorPage = ({ currentUser }) => {
    const [formTitle, setFormTitle] = useState("Untitled Form");
    const [formDescription, setFormDescription] = useState("");
    const [selectedQuestions, setSelectedQuestions] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [isSearching, setIsSearching] = useState(false);
    const [filteredQuestions, setFilteredQuestions] = useState([]);
    
    // State untuk questions dari API
    const [questions, setQuestions] = useState([]);
    
    // State untuk dropdown data dari API
    const [courseTagOptions, setCourseTagOptions] = useState([]);
    const [materialTagOptions, setMaterialTagOptions] = useState([]);
    const [difficultyLevels, setDifficultyLevels] = useState([]);
    const [isLoadingDropdowns, setIsLoadingDropdowns] = useState(true);
    
    // State untuk tag mata kuliah
    const [selectedCourseTags, setSelectedCourseTags] = useState([]);
    const [courseTagSearch, setCourseTagSearch] = useState("");
    const [showCourseTagDropdown, setShowCourseTagDropdown] = useState(false);
    
    // State untuk tag materi
    const [selectedMaterialTags, setSelectedMaterialTags] = useState([]);
    const [materialTagSearch, setMaterialTagSearch] = useState("");
    const [showMaterialTagDropdown, setShowMaterialTagDropdown] = useState(false);
    
    // State untuk difficulty level
    const [selectedDifficulty, setSelectedDifficulty] = useState("");
    const [showDifficultyDropdown, setShowDifficultyDropdown] = useState(false);

    // Fetch dropdown data dari API
    useEffect(() => {
        const fetchDropdownData = async () => {
            try {
                setIsLoadingDropdowns(true);
                
                const response = await fetch("http://localhost:8080/api/dropdown/all-dropdown-data");
                const data = await response.json();
                
                if (data.success) {
                    setCourseTagOptions(data.data.courseTags || []);
                    setMaterialTagOptions(data.data.materialTags || []);
                    setDifficultyLevels(data.data.difficultyLevels || []);
                    console.log("Dropdown data loaded:", data.data);
                } else {
                    console.error("Failed to fetch dropdown data:", data.message);
                    setDifficultyLevels([
                        { level: 'Mudah' },
                        { level: 'Sedang' },
                        { level: 'Sulit' }
                    ]);
                }
            } catch (error) {
                console.error("Error fetching dropdown data:", error);
                setDifficultyLevels([
                    { level: 'Mudah' },
                    { level: 'Sedang' },
                    { level: 'Sulit' }
                ]);
            } finally {
                setIsLoadingDropdowns(false);
            }
        };

        fetchDropdownData();
    }, []);

    // Fetch questions dari API
    useEffect(() => {
        const fetchQuestions = async () => {
            try {
                const response = await fetch("http://localhost:8080/api/questionSets");
                const data = await response.json();
                console.log("Questions data dari backend:", data);
                setQuestions(data);
                setFilteredQuestions(data);
            } catch (error) {
                console.error("Error fetch question sets:", error);
            }
        };

        fetchQuestions();
    }, []);

    // Fungsi untuk menambah tag mata kuliah
    const addSelectedCourseTag = (tag) => {
        if (!selectedCourseTags.some(selected => selected.id === tag.id)) {
            setSelectedCourseTags([...selectedCourseTags, tag]);
        }
        setCourseTagSearch("");
        setShowCourseTagDropdown(false);
    };
    
    // Fungsi untuk menghapus tag mata kuliah
    const removeSelectedCourseTag = (index) => {
        const newTags = [...selectedCourseTags];
        newTags.splice(index, 1);
        setSelectedCourseTags(newTags);
    };
    
    // Fungsi untuk menambah tag materi
    const addSelectedMaterialTag = (tag) => {
        if (!selectedMaterialTags.some(selected => selected.id === tag.id)) {
            setSelectedMaterialTags([...selectedMaterialTags, tag]);
        }
        setMaterialTagSearch("");
        setShowMaterialTagDropdown(false);
    };
    
    // Fungsi untuk menghapus tag materi
    const removeSelectedMaterialTag = (index) => {
        const newTags = [...selectedMaterialTags];
        newTags.splice(index, 1);
        setSelectedMaterialTags(newTags);
    };

    // State for drag and drop
    const [draggedItemIndex, setDraggedItemIndex] = useState(null);
    const [dragOverItemIndex, setDragOverItemIndex] = useState(null);

    // Handle drag and drop functionality
    const handleDragStart = (index) => {
        setDraggedItemIndex(index);
    };

    const handleDragOver = (e, index) => {
        e.preventDefault();
        setDragOverItemIndex(index);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        if (draggedItemIndex !== null && dragOverItemIndex !== null) {
            const items = Array.from(selectedQuestions);
            const draggedItem = items[draggedItemIndex];

            items.splice(draggedItemIndex, 1);
            items.splice(dragOverItemIndex, 0, draggedItem);

            setSelectedQuestions(items);
        }

        setDraggedItemIndex(null);
        setDragOverItemIndex(null);
    };

    // Handle question selection from bank
    const handleAddQuestion = (question) => {
        setSelectedQuestions([...selectedQuestions, question]);

        const notification = document.createElement('div');
        notification.className =
        'fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50';
        notification.textContent = 'Soal berhasil ditambahkan!';
        document.body.appendChild(notification);

        setTimeout(() => {
        notification.remove();
        }, 2000);
    };

    // Handle question removal
    const handleRemoveQuestion = (index) => {
        const newQuestions = [...selectedQuestions];
        newQuestions.splice(index, 1);
        setSelectedQuestions(newQuestions);
    };

    // Handle search functionality - DIPERBAIKI
    const handleSearch = () => {
        setIsSearching(true);
        let results = questions;

        // Filter berdasarkan search term (hanya title dan description)
        if (searchTerm.trim()) {
            results = results.filter(q =>
                q.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                q.description?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Filter berdasarkan course tags
        if (selectedCourseTags.length > 0) {
            results = results.filter(q => 
                selectedCourseTags.some(tag => 
                    q.subject?.toLowerCase().includes(tag.name?.toLowerCase())
                )
            );
        }

        // Filter berdasarkan material tags
        if (selectedMaterialTags.length > 0) {
            results = results.filter(q => 
                selectedMaterialTags.some(tag => 
                    q.title?.toLowerCase().includes(tag.name?.toLowerCase()) ||
                    q.description?.toLowerCase().includes(tag.name?.toLowerCase())
                )
            );
        }

        // Filter berdasarkan difficulty
        if (selectedDifficulty) {
            results = results.filter(q => q.level === selectedDifficulty);
        }

        setFilteredQuestions(results);
    };

    // Auto search ketika filter berubah
    useEffect(() => {
        handleSearch();
    }, [searchTerm, selectedCourseTags, selectedMaterialTags, selectedDifficulty, questions]);

    const handleDownloadZipBundle = () => {
        const questionIds = selectedQuestions
            .map(q => q.question_set_id || q.id) 
            .filter(id => id) 
            .join(',');

        if (!questionIds) {
            alert("Harap tambahkan setidaknya satu soal untuk mengaktifkan download ZIP.");
            return;
        }

        const cleanFormTitle = formTitle.trim() === "" 
            ? "Form_Tanpa_Judul" 
            : formTitle.replace(/[^\w\s-]/g, '').trim().replace(/\s+/g, '_');

        const url = `http://localhost:8080/api/files/download-bundle?ids=${questionIds}&formTitle=${cleanFormTitle}`;
        
        window.location.href = url;

        const notification = document.createElement('div');
        notification.className = 'fixed bottom-4 right-4 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg z-50';
        notification.textContent = 'Download Bundle ZIP Soal dimulai...';
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, 3000);
    };

    // Format date helper
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('id-ID', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    return (
        <div className="min-h-screen bg-gray-50 text-gray-800">
            <Header currentUser={currentUser} />
            
            <div className="container mx-auto px-6 py-8">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-8"
                >
                    <h1 className="text-4xl font-bold mb-4 text-gray-900">Pembuat Form  Paket Soal</h1>
                  
                </motion.div>

                {/* Filter Section - DIPERBAIKI */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-semibold text-gray-900">Filter & Pencarian</h2>
                            {(searchTerm || selectedCourseTags.length > 0 || selectedMaterialTags.length > 0 || selectedDifficulty) && (
                                <button
                                    onClick={() => {
                                        setSearchTerm("");
                                        setSelectedCourseTags([]);
                                        setSelectedMaterialTags([]);
                                        setSelectedDifficulty("");
                                    }}
                                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                                >
                                    Reset Semua Filter
                                </button>
                            )}
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {/* 1. Tag Mata Kuliah */}
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">
                                    Tag Mata Kuliah
                                </label>
                                
                                {selectedCourseTags.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mb-2">
                                        {selectedCourseTags.map((tag, index) => (
                                            <span key={index} className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 text-xs px-2.5 py-1 rounded-full">
                                                {tag.name}
                                                <button 
                                                    onClick={() => removeSelectedCourseTag(index)}
                                                    className="hover:text-blue-900"
                                                >
                                                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                    </svg>
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                )}
                                
                                <div className="relative">
                                    <input
                                        type="text"
                                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all text-sm"
                                        placeholder={isLoadingDropdowns ? "Loading..." : "Pilih mata kuliah..."}
                                        value={courseTagSearch}
                                        onChange={(e) => setCourseTagSearch(e.target.value)}
                                        onFocus={() => setShowCourseTagDropdown(true)}
                                        disabled={isLoadingDropdowns}
                                    />
                                    <BookOpen className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                                </div>
                                
                                {showCourseTagDropdown && courseTagOptions.length > 0 && (
                                    <div className="absolute z-30 mt-1 w-full max-w-[calc(25%-1rem)] bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                                        {courseTagOptions
                                            .filter(tag => 
                                                tag.name?.toLowerCase().includes(courseTagSearch.toLowerCase())
                                            )
                                            .map((tag, index) => (
                                                <button
                                                    key={index} 
                                                    className="w-full text-left px-3 py-2 hover:bg-gray-50 text-sm transition-colors"
                                                    onClick={() => addSelectedCourseTag(tag)}
                                                >
                                                    {tag.name}
                                                </button>
                                            ))
                                        }
                                    </div>
                                )}
                            </div>

                            {/* 2. Tag Materi */}
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">
                                    Tag Materi
                                </label>
                                
                                {selectedMaterialTags.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mb-2">
                                        {selectedMaterialTags.map((tag, index) => (
                                            <span key={index} className="inline-flex items-center gap-1 bg-green-100 text-green-800 text-xs px-2.5 py-1 rounded-full">
                                                {tag.name}
                                                <button 
                                                    onClick={() => removeSelectedMaterialTag(index)}
                                                    className="hover:text-green-900"
                                                >
                                                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                    </svg>
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                )}
                                
                                <div className="relative">
                                    <input
                                        type="text"
                                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all text-sm"
                                        placeholder={isLoadingDropdowns ? "Loading..." : "Pilih tag materi..."}
                                        value={materialTagSearch}
                                        onChange={(e) => setMaterialTagSearch(e.target.value)}
                                        onFocus={() => setShowMaterialTagDropdown(true)}
                                        disabled={isLoadingDropdowns}
                                    />
                                    <FileText className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                                </div>
                                
                                {showMaterialTagDropdown && materialTagOptions.length > 0 && (
                                    <div className="absolute z-30 mt-1 w-full max-w-[calc(25%-1rem)] bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                                        {materialTagOptions
                                            .filter(tag => 
                                                tag.name?.toLowerCase().includes(materialTagSearch.toLowerCase())
                                            )
                                            .map((tag, index) => (
                                                <button
                                                    key={index} 
                                                    className="w-full text-left px-3 py-2 hover:bg-gray-50 text-sm transition-colors"
                                                    onClick={() => addSelectedMaterialTag(tag)}
                                                >
                                                    {tag.name}
                                                </button>
                                            ))
                                        }
                                    </div>
                                )}
                            </div>

                            {/* 3. Tingkat Kesulitan */}
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">
                                    Tingkat Kesulitan
                                </label>
                                
                                {selectedDifficulty && (
                                    <div className="flex flex-wrap gap-2 mb-2">
                                        <span className="inline-flex items-center gap-1 bg-purple-100 text-purple-800 text-xs px-2.5 py-1 rounded-full">
                                            {selectedDifficulty}
                                            <button 
                                                onClick={() => setSelectedDifficulty("")}
                                                className="hover:text-purple-900"
                                            >
                                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </button>
                                        </span>
                                    </div>
                                )}
                                
                                <div className="relative">
                                    <select
                                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all appearance-none text-sm"
                                        value={selectedDifficulty}
                                        onChange={(e) => setSelectedDifficulty(e.target.value)}
                                        disabled={isLoadingDropdowns}
                                    >
                                        <option value="">Semua Tingkat</option>
                                        {difficultyLevels.map((level, index) => (
                                            <option key={index} value={level.level}>
                                                {level.level}
                                            </option>
                                        ))}
                                    </select>
                                    <ChevronDown className="w-4 h-4 text-gray-400 absolute left-3 top-3 pointer-events-none" />
                                </div>
                            </div>

                            {/* Search Box - Dipindah ke kolom terakhir */}
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">
                                    Cari Soal
                                </label>
                                
                                {searchTerm && (
                                    <div className="flex flex-wrap gap-2 mb-2">
                                        <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-800 text-xs px-2.5 py-1 rounded-full">
                                            "{searchTerm}"
                                            <button 
                                                onClick={() => setSearchTerm("")}
                                                className="hover:text-gray-900"
                                            >
                                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </button>
                                        </span>
                                    </div>
                                )}
                                
                                <div className="relative">
                                    <input
                                        type="text"
                                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all text-sm"
                                        placeholder="Cari judul atau deskripsi..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                    <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Form Editor Section */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200"
                    >
                        {/* Form title and description */}
                        <div className="mb-8 border-b pb-6">
                            <input
                                type="text"
                                value={formTitle}
                                onChange={(e) => setFormTitle(e.target.value)}
                                className="w-full text-3xl font-bold mb-4 border-b border-transparent hover:border-gray-300 focus:border-blue-500 focus:outline-none pb-2 transition-colors"
                                placeholder="Judul Form"
                            />
                            <textarea
                                value={formDescription}
                                onChange={(e) => setFormDescription(e.target.value)}
                                className="w-full text-gray-600 border-transparent hover:border-gray-300 focus:border-blue-500 focus:outline-none resize-none transition-colors"
                                placeholder="Deskripsi form (opsional)"
                                rows="2"
                            />
                        </div>

                        {/* Questions list - draggable */}
                        <div className="space-y-4 mb-6">
                            <div className="flex justify-between items-center">
                                <h3 className="text-lg font-semibold text-gray-900">Soal Terpilih ({selectedQuestions.length})</h3>
                                {selectedQuestions.length > 0 && (
                                    <span className="text-sm text-gray-500">Seret untuk mengubah urutan</span>
                                )}
                            </div>
                            
                            {selectedQuestions.length === 0 ? (
                                <div className="text-center py-12 text-gray-500 border-2 border-dashed border-gray-200 rounded-lg">
                                    <Database className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                                    <p>Belum ada soal yang dipilih</p>
                                    <p className="text-sm">Pilih soal dari bank soal di sebelah kanan</p>
                                </div>
                            ) : (
                                selectedQuestions.map((question, index) => (
                                    <div
                                        key={index}
                                        draggable
                                        onDragStart={() => handleDragStart(index)}
                                        onDragOver={(e) => handleDragOver(e, index)}
                                        onDrop={handleDrop}
                                        className={`bg-gray-50 border border-gray-200 rounded-lg p-4 flex items-start cursor-move hover:shadow-md transition-all ${dragOverItemIndex === index ? "border-2 border-blue-500 bg-blue-50" : ""
                                            }`}
                                    >
                                        <div className="flex-shrink-0 w-8 text-center font-medium mr-4 text-gray-600">
                                            {index + 1}
                                        </div>
                                        <div className="flex-grow">
                                            <div className="flex justify-between items-start mb-2">
                                                <h3 className="font-semibold text-gray-900">{question.title}</h3>
                                                <div className={`text-xs px-2 py-1 rounded-full ${
                                                    question.level === "Mudah"
                                                    ? "bg-green-100 text-green-800"
                                                    : question.level === "Sedang"
                                                    ? "bg-yellow-100 text-yellow-800"
                                                    : "bg-red-100 text-red-800"
                                                }`}>
                                                    {question.level}
                                                </div>
                                            </div>
                                            {question.description && (
                                                <p className="text-sm text-gray-600 mb-2 line-clamp-2">{question.description}</p>
                                            )}
                                            <div className="text-sm text-gray-700 mb-1">{question.subject}</div>
                                            <div className="flex justify-between items-center">
                                                <div className="text-xs text-gray-500 flex items-center gap-1">
                                                    <User className="w-3 h-3" />
                                                    {question.lecturer}
                                                </div>
                                                <div className="text-xs text-gray-500 flex items-center gap-1">
                                                    <Calendar className="w-3 h-3" />
                                                    {formatDate(question.created_at)}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex flex-shrink-0 ml-4 space-x-1">
                                            <button className="p-2 hover:bg-gray-200 rounded transition-colors">
                                                <Move className="w-4 h-4 text-gray-400" />
                                            </button>
                                            <button
                                                onClick={() => handleRemoveQuestion(index)}
                                                className="p-2 hover:bg-red-100 rounded transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4 text-red-400 hover:text-red-600" />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                        
                        {/* Download button */}
                        {selectedQuestions.length > 0 && (
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="w-full bg-blue-600 text-white py-3 px-6 rounded-xl font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                                onClick={handleDownloadZipBundle} 
                            >
                                <Download className="w-5 h-5" />
                                Download Kumpulan Soal ({selectedQuestions.length} soal)
                            </motion.button>
                        )}
                    </motion.div>

                    {/* Question Bank Section */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200"
                    >
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                                <Database className="w-5 h-5 text-blue-500" />
                                Bank Soal
                            </h2>
                            <div className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                                {filteredQuestions.length} soal tersedia
                            </div>
                        </div>

                        {/* Question Grid Layout */}
                        <div className="space-y-4 max-h-[calc(100vh-320px)] overflow-y-auto">
                            {filteredQuestions.map((q) => (
                                <motion.div
                                key={q.id}
                                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all duration-200"
                                whileHover={{ scale: 1.01 }}
                                >
                                    <div className="flex justify-between items-start mb-3">
                                        <h3 className="font-semibold text-gray-900 text-base leading-tight">{q.title}</h3>
                                        <span
                                        className={`text-xs px-2 py-1 rounded-full flex-shrink-0 ml-2 ${
                                            q.level === "Mudah"
                                            ? "bg-green-100 text-green-800"
                                            : q.level === "Sedang"
                                            ? "bg-yellow-100 text-yellow-800"
                                            : "bg-red-100 text-red-800"
                                        }`}
                                        >
                                        {q.level}
                                        </span>
                                    </div>
                                    
                                    {q.description && (
                                        <p className="text-sm text-gray-600 mb-3 line-clamp-2 leading-relaxed">
                                            {q.description}
                                        </p>
                                    )}
                                    
                                    <div className="space-y-2 mb-4">
                                        <div className="flex items-center gap-2 text-sm text-gray-700">
                                            <BookOpen className="w-4 h-4 text-blue-500 flex-shrink-0" />
                                            <span className="font-medium">{q.subject}</span>
                                        </div>
                                        
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                            <User className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                            <span>{q.lecturer}</span>
                                        </div>
                                        
                                        <div className="flex items-center gap-2 text-xs text-gray-500">
                                            <Calendar className="w-3 h-3 text-gray-400 flex-shrink-0" />
                                            <span>Dibuat: {formatDate(q.created_at)}</span>
                                        </div>
                                        
                                        {q.updated_at && q.updated_at !== q.created_at && (
                                            <div className="flex items-center gap-2 text-xs text-gray-500">
                                                <Clock className="w-3 h-3 text-gray-400 flex-shrink-0" />
                                                <span>Diperbarui: {formatDate(q.updated_at)}</span>
                                            </div>
                                        )}
                                    </div>
                                    
                                    <motion.button
                                        className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => handleAddQuestion(q)}
                                        disabled={selectedQuestions.some(selected => selected.id === q.id)}
                                    >
                                        {selectedQuestions.some(selected => selected.id === q.id) ? (
                                            <>
                                                <Check className="w-4 h-4" />
                                                Sudah Ditambahkan
                                            </>
                                        ) : (
                                            <>
                                                <Plus className="w-4 h-4" />
                                                Tambah ke Form
                                            </>
                                        )}
                                    </motion.button>
                                </motion.div>
                            ))}
                            
                            {filteredQuestions.length === 0 && (
                                <div className="text-center py-12 text-gray-500">
                                    <Database className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                                    <p className="text-lg font-medium mb-2">Tidak ada soal yang ditemukan</p>
                                    <p className="text-sm">Coba ubah kriteria pencarian atau filter Anda</p>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Footer */}
            <footer className="bg-white border-t border-gray-200 py-6 mt-12">
                <div className="container mx-auto px-6 text-center text-gray-600 text-sm">
                    © 2024 Form Creator. All rights reserved.
                </div>
            </footer>

            {/* Click outside handlers */}
            {(showCourseTagDropdown || showMaterialTagDropdown) && (
                <div 
                    className="fixed inset-0 z-10" 
                    onClick={() => {
                        setShowCourseTagDropdown(false);
                        setShowMaterialTagDropdown(false);
                    }}
                />
            )}
        </div>
    );
};

export default FormCreatorPage;