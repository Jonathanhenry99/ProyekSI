import React, { useState, useRef } from 'react';
import { motion } from "framer-motion";
import {
    Upload, File, Search, Trash2, Edit, Download, Plus,
    Move, ChevronDown, ChevronUp, Check, Database, PenTool
} from 'lucide-react';
import Footer from '../components/Footer';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import EnhancedMarkdownEditor from '../components/EnhancedMarkdownEditor';
import { Link } from "react-router-dom";
import Header from '../components/Header';

// Sample data for question bank
const sampleQuestions = [
    {
        id: 1,
        question: "Jelaskan konsep inheritance dalam pemrograman berorientasi objek?",
        subject: "Pemrograman Berorientasi Objek",
        difficulty: "Sedang",
        type: "Essay",
        lecturer: "Dr. Ahmad Fauzi"
    },
    {
        id: 2,
        question: "Buatlah program Java untuk menghitung bilangan Fibonacci dengan pendekatan rekursif dan iteratif!",
        subject: "Algoritma dan Pemrograman",
        difficulty: "Sulit",
        type: "Coding",
        lecturer: "Prof. Budi Santoso"
    },
    {
        id: 3,
        question: "Apa perbedaan antara stack dan queue? Berikan contoh implementasinya!",
        subject: "Struktur Data",
        difficulty: "Mudah",
        type: "Essay",
        lecturer: "Dr. Citra Dewi"
    },
    {
        id: 4,
        question: "Jelaskan langkah-langkah normalsiasi database sampai bentuk 3NF!",
        subject: "Basis Data",
        difficulty: "Sedang",
        type: "Essay",
        lecturer: "Dr. Ahmad Fauzi"
    },
];

const FormCreatorPage = ({ currentUser }) => {
    const [formTitle, setFormTitle] = useState("Untitled Form");
    const [formDescription, setFormDescription] = useState("");
    const [selectedQuestions, setSelectedQuestions] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [isSearching, setIsSearching] = useState(false);
    const [showMarkdownEditor, setShowMarkdownEditor] = useState(false);
    const [markdownContent, setMarkdownContent] = useState("");
    const [filteredQuestions, setFilteredQuestions] = useState(sampleQuestions);
    const markdownEditorRef = useRef(null);
    
    // State untuk tag mata kuliah
    const [selectedCourseTags, setSelectedCourseTags] = useState([]);
    const [courseTagSearch, setCourseTagSearch] = useState("");
    const [showCourseTagDropdown, setShowCourseTagDropdown] = useState(false);
    const courseTagOptions = ["Desain Analisis Algoritma", "Pemrograman Berorientasi Objek", "Struktur Data", "Basis Data", "Jaringan Komputer"];
    
    // State untuk tag materi
    const [selectedMaterialTags, setSelectedMaterialTags] = useState([]);
    const [materialTagSearch, setMaterialTagSearch] = useState("");
    const [showMaterialTagDropdown, setShowMaterialTagDropdown] = useState(false);
    const materialTagOptions = ["Linked List", "Greedy", "Graph", "Binary Search Tree", "Array 1D", "Generic", "Inheritance"];
    
    // Fungsi untuk menambah tag mata kuliah
    const addSelectedCourseTag = (tag) => {
        if (!selectedCourseTags.includes(tag)) {
            setSelectedCourseTags([...selectedCourseTags, tag]);
        }
        setCourseTagSearch("");
    };
    
    // Fungsi untuk menghapus tag mata kuliah
    const removeSelectedCourseTag = (index) => {
        const newTags = [...selectedCourseTags];
        newTags.splice(index, 1);
        setSelectedCourseTags(newTags);
    };
    
    // Fungsi untuk menambah tag materi
    const addSelectedMaterialTag = (tag) => {
        if (!selectedMaterialTags.includes(tag)) {
            setSelectedMaterialTags([...selectedMaterialTags, tag]);
        }
        setMaterialTagSearch("");
    };
    
    // Fungsi untuk menghapus tag materi
    const removeSelectedMaterialTag = (index) => {
        const newTags = [...selectedMaterialTags];
        newTags.splice(index, 1);
        setSelectedMaterialTags(newTags);
    };
    
    // Tambahkan juga import untuk ikon X
    // import { X } from 'lucide-react';


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

            // Remove the dragged item from its position
            items.splice(draggedItemIndex, 1);

            // Insert it at the new position
            items.splice(dragOverItemIndex, 0, draggedItem);

            setSelectedQuestions(items);
        }

        // Reset drag states
        setDraggedItemIndex(null);
        setDragOverItemIndex(null);
    };
    // Handle question selection from bank
    const handleAddQuestion = (question) => {
        setSelectedQuestions([...selectedQuestions, question]);

        // Add a small notification animation
        const notification = document.createElement('div');
        notification.className = 'fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50';
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

    // Handle search functionality
    const handleSearch = () => {
        setIsSearching(true);
        const results = sampleQuestions.filter(q =>
            q.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
            q.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
            q.lecturer.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredQuestions(results);
    };

    // Handle adding a new question via markdown
    const handleAddMarkdownQuestion = () => {
        if (markdownContent.trim() === "") return;

        const newQuestion = {
            id: Date.now(),
            question: markdownContent,
            subject: "Custom Question",
            difficulty: "Custom",
            type: "Markdown",
            lecturer: "User Created"
        };

        setSelectedQuestions([...selectedQuestions, newQuestion]);
        setMarkdownContent("");
        setShowMarkdownEditor(false);
    };

    // Download all selected questions
    const handleDownload = () => {
        const questionsText = selectedQuestions.map((q, index) =>
            `${index + 1}. ${q.question}\n   Mata Kuliah: ${q.subject}\n   Tingkat Kesulitan: ${q.difficulty}\n   Dosen: ${q.lecturer}\n\n`
        ).join('');

        const blob = new Blob([`${formTitle}\n${formDescription}\n\nDAFTAR SOAL:\n\n${questionsText}`], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${formTitle.replace(/\s+/g, '_')}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        // Show download animation
        const notification = document.createElement('div');
        notification.className = 'fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-blue-600 text-white px-8 py-4 rounded-xl shadow-2xl z-50 flex items-center gap-3';
        notification.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-check-circle"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg> File berhasil diunduh!';
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, 2000);
    };

    return (
        <div className="min-h-screen bg-white text-gray-800">
            <Header currentUser={currentUser} />
            
            <div className="container mx-auto px-4 py-8">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-8"
                >
                    <h1 className="text-4xl font-bold mb-4 text-gray-900">Pembuat Form Soal</h1>
                    <p className="text-xl text-gray-600">Susun dan atur soal-soal untuk ujian atau tugas</p>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Form Editor Section - 8 columns */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="lg:col-span-6 bg-white rounded-2xl p-8 shadow-lg"
                    >
                        {/* Form title and description */}
                        <div className="mb-8 border-b pb-6">
                            <input
                                type="text"
                                value={formTitle}
                                onChange={(e) => setFormTitle(e.target.value)}
                                className="w-full text-3xl font-bold mb-4 border-b border-transparent hover:border-gray-300 focus:border-blue-500 focus:outline-none pb-2"
                                placeholder="Judul Form"
                            />
                            <textarea
                                value={formDescription}
                                onChange={(e) => setFormDescription(e.target.value)}
                                className="w-full text-gray-600 border-transparent hover:border-gray-300 focus:border-blue-500 focus:outline-none resize-none"
                                placeholder="Deskripsi form (opsional)"
                                rows="2"
                            />
                        </div>

                        {/* Questions list - draggable */}
                        <div className="space-y-4">
                            {selectedQuestions.map((question, index) => (
                                <div
                                    key={index}
                                    draggable
                                    onDragStart={() => handleDragStart(index)}
                                    onDragOver={(e) => handleDragOver(e, index)}
                                    onDrop={handleDrop}
                                    className={`bg-white border border-gray-200 rounded-lg p-4 flex items-start cursor-move ${dragOverItemIndex === index ? "border-2 border-blue-500" : ""
                                        }`}
                                >
                                    <div className="flex-shrink-0 w-8 text-center font-medium mr-2">
                                        {index + 1}
                                    </div>
                                    <div className="flex-grow">
                                        <div className="flex justify-between">
                                            <h3 className="font-medium">{question.question}</h3>
                                            <div className="text-xs bg-gray-100 px-2 py-1 rounded">• {question.difficulty}</div>
                                        </div>
                                        <div className="text-sm text-gray-600 mt-1">
                                            {question.subject}
                                        </div>
                                        <div className="text-xs text-gray-500 mt-2">
                                            {question.lecturer} • {question.type}
                                        </div>
                                    </div>
                                    <div className="flex flex-shrink-0 ml-2 space-x-1">
                                        <button className="p-1">
                                            <Move className="w-4 h-4 text-gray-400" />
                                        </button>
                                        <button
                                            onClick={() => handleRemoveQuestion(index)}
                                            className="p-1"
                                        >
                                            <Trash2 className="w-4 h-4 text-gray-400" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                        {/* Download button */}
                        {selectedQuestions.length > 0 && (
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="mt-8 bg-blue-600 text-white py-3 px-6 rounded-xl font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 ml-auto"
                                onClick={handleDownload}
                            >
                                <Download className="w-5 h-5" />
                                Download Soal
                            </motion.button>
                        )}
                    </motion.div>

                    {/* Question Bank Section - 4 columns */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="lg:col-span-6 space-y-6"
                    >
                        {/* Search in question bank */}
                        <div className="bg-white rounded-2xl p-6 shadow-lg">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                                    <Database className="w-5 h-5 text-blue-500" />
                                    Bank Soal
                                </h2>
                                <button className="flex items-center gap-1 px-3 py-1 bg-gray-900 text-white rounded-lg text-sm">
                                    <ChevronDown className="w-4 h-4" />
                                    Filter Lanjutan
                                </button>
                            </div>

                            <div className="relative mb-4">
                                <input
                                    type="text"
                                    className="w-full pl-10 pr-4 py-3 bg-gray-50 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                                    placeholder="Cari soal..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                />
                                <Search className="w-5 h-5 text-gray-400 absolute left-3 top-3.5" />
                            </div>

                            {/* Question Grid Layout */}
                            <div className="grid grid-cols-2 gap-4 mb-4">
                                {/* Watering Grass */}
                                <motion.div 
                                    className="border border-gray-200 rounded-lg p-4"
                                    whileHover={{ scale: 1.02, boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)" }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <div className="flex justify-between items-start mb-1">
                                        <h3 className="font-medium text-gray-900 text-base">Watering Grass</h3>
                                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Mudah</span>
                                    </div>
                                    <div className="text-sm text-gray-700 mb-1">Greedy</div>
                                    <div className="text-xs text-gray-500 mb-2">Dosen 1</div>
                                    <motion.button 
                                        className="w-full bg-blue-600 text-white py-1.5 px-3 rounded text-sm font-medium"
                                        whileHover={{ scale: 1.02, backgroundColor: "#2563EB" }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => handleAddQuestion({
                                            id: 101,
                                            question: "Watering Grass",
                                            subject: "Greedy",
                                            difficulty: "Mudah",
                                            type: "Essay",
                                            lecturer: "Dosen 1"
                                        })}
                                    >
                                        Tambah
                                    </motion.button>
                                </motion.div>

                                {/* Balanced Tree */}
                                <motion.div 
                                    className="border border-gray-200 rounded-lg p-4"
                                    whileHover={{ scale: 1.02, boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)" }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <div className="flex justify-between items-start mb-1">
                                        <h3 className="font-medium text-gray-900 text-base">Balanced Tree</h3>
                                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Mudah</span>
                                    </div>
                                    <div className="text-sm text-gray-700 mb-1">Binary Search Tree</div>
                                    <div className="text-xs text-gray-500 mb-2">Dosen 4</div>
                                    <motion.button 
                                        className="w-full bg-blue-600 text-white py-1.5 px-3 rounded text-sm font-medium"
                                        whileHover={{ scale: 1.02, backgroundColor: "#2563EB" }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => handleAddQuestion({
                                            id: 102,
                                            question: "Balanced Tree",
                                            subject: "Binary Search Tree",
                                            difficulty: "Mudah",
                                            type: "Essay",
                                            lecturer: "Dosen 4"
                                        })}
                                    >
                                        Tambah
                                    </motion.button>
                                </motion.div>

                                {/* Minites Minggu 6 */}
                                <motion.div 
                                    className="border border-gray-200 rounded-lg p-4"
                                    whileHover={{ scale: 1.02, boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)" }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <div className="flex justify-between items-start mb-1">
                                        <h3 className="font-medium text-gray-900 text-base">Minites Minggu 6</h3>
                                        <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">Sulit</span>
                                    </div>
                                    <div className="text-sm text-gray-700 mb-1">Generic</div>
                                    <div className="text-xs text-gray-500 mb-2">Dosen 2</div>
                                    <motion.button 
                                        className="w-full bg-blue-600 text-white py-1.5 px-3 rounded text-sm font-medium"
                                        whileHover={{ scale: 1.02, backgroundColor: "#2563EB" }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => handleAddQuestion({
                                            id: 103,
                                            question: "Minites Minggu 6",
                                            subject: "Generic",
                                            difficulty: "Sulit",
                                            type: "Essay",
                                            lecturer: "Dosen 2"
                                        })}
                                    >
                                        Tambah
                                    </motion.button>
                                </motion.div>

                                {/* Minites Minggu 7 */}
                                <motion.div 
                                    className="border border-gray-200 rounded-lg p-4"
                                    whileHover={{ scale: 1.02, boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)" }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <div className="flex justify-between items-start mb-1">
                                        <h3 className="font-medium text-gray-900 text-base">Minites Minggu 7</h3>
                                        <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">Sulit</span>
                                    </div>
                                    <div className="text-sm text-gray-700 mb-1">Inheritance</div>
                                    <div className="text-xs text-gray-500 mb-2">Dosen 2</div>
                                    <motion.button 
                                        className="w-full bg-blue-600 text-white py-1.5 px-3 rounded text-sm font-medium"
                                        whileHover={{ scale: 1.02, backgroundColor: "#2563EB" }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => handleAddQuestion({
                                            id: 104,
                                            question: "Minites Minggu 7",
                                            subject: "Inheritance",
                                            difficulty: "Sulit",
                                            type: "Essay",
                                            lecturer: "Dosen 2"
                                        })}
                                    >
                                        Tambah
                                    </motion.button>
                                </motion.div>

                                {/* Memory Maze Game */}
                                <motion.div 
                                    className="border border-gray-200 rounded-lg p-4"
                                    whileHover={{ scale: 1.02, boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)" }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <div className="flex justify-between items-start mb-1">
                                        <h3 className="font-medium text-gray-900 text-base">Memory Maze Game</h3>
                                        <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">Sedang</span>
                                    </div>
                                    <div className="text-sm text-gray-700 mb-1">Array 1D</div>
                                    <div className="text-xs text-gray-500 mb-2">Dosen 3</div>
                                    <motion.button 
                                        className="w-full bg-blue-600 text-white py-1.5 px-3 rounded text-sm font-medium"
                                        whileHover={{ scale: 1.02, backgroundColor: "#2563EB" }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => handleAddQuestion({
                                            id: 105,
                                            question: "Memory Maze Game",
                                            subject: "Array 1D",
                                            difficulty: "Sedang",
                                            type: "Essay",
                                            lecturer: "Dosen 3"
                                        })}
                                    >
                                        Tambah
                                    </motion.button>
                                </motion.div>

                                {/* Jadwal Bentrok */}
                                <motion.div 
                                    className="border border-gray-200 rounded-lg p-4"
                                    whileHover={{ scale: 1.02, boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)" }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <div className="flex justify-between items-start mb-1">
                                        <h3 className="font-medium text-gray-900 text-base">Jadwal Bentrok</h3>
                                        <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">Sedang</span>
                                    </div>
                                    <div className="text-sm text-gray-700 mb-1">Array 1D</div>
                                    <div className="text-xs text-gray-500 mb-2">Dosen 3</div>
                                    <motion.button 
                                        className="w-full bg-blue-600 text-white py-1.5 px-3 rounded text-sm font-medium"
                                        whileHover={{ scale: 1.02, backgroundColor: "#2563EB" }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => handleAddQuestion({
                                            id: 106,
                                            question: "Jadwal Bentrok",
                                            subject: "Array 1D",
                                            difficulty: "Sedang",
                                            type: "Essay",
                                            lecturer: "Dosen 3"
                                        })}
                                    >
                                        Tambah
                                    </motion.button>
                                </motion.div>
                            </div>
                        </div>

                        {/* Tag Selection Section */}
                        <div className="grid grid-cols-2 gap-4">
                            {/* Tag Mata Kuliah */}
                            <div className="bg-white rounded-2xl p-6 shadow-lg">
                                <h3 className="text-lg font-medium mb-3">Pilih Tag Mata Kuliah</h3>
                                
                                {/* Selected Tags */}
                                <div className="flex flex-wrap gap-2 mb-3">
                                    {selectedCourseTags.map((tag, index) => (
                                        <div key={index} className="bg-blue-600 text-white text-sm px-3 py-1 rounded-full flex items-center">
                                            {tag}
                                            <button 
                                                className="ml-2 focus:outline-none" 
                                                onClick={() => removeSelectedCourseTag(index)}
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                                
                                <div className="relative">
                                    <input
                                        type="text"
                                        className="w-full pl-10 pr-4 py-2 bg-gray-50 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                                        placeholder="Cari Tag Soal"
                                        value={courseTagSearch}
                                        onChange={(e) => setCourseTagSearch(e.target.value)}
                                        onFocus={() => setShowCourseTagDropdown(true)}
                                    />
                                    <Search className="w-5 h-5 text-gray-400 absolute left-3 top-2" />
                                </div>
                                
                                {showCourseTagDropdown && (
                                    <div className="mt-2 p-2 border border-gray-200 rounded-lg max-h-40 overflow-y-auto bg-white shadow-md absolute z-10 w-[calc(100%-3rem)]">
                                        {courseTagOptions.filter(tag => 
                                            tag.toLowerCase().includes(courseTagSearch.toLowerCase())
                                        ).map((tag, index) => (
                                            <div 
                                                key={index} 
                                                className="p-2 hover:bg-gray-100 rounded cursor-pointer"
                                                onClick={() => {
                                                    addSelectedCourseTag(tag);
                                                    setShowCourseTagDropdown(false);
                                                }}
                                            >
                                                {tag}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Tag Materi */}
                            <div className="bg-white rounded-2xl p-6 shadow-lg">
                                <h3 className="text-lg font-medium mb-3">Pilih Tag Materi</h3>
                                
                                {/* Selected Tags */}
                                <div className="flex flex-wrap gap-2 mb-3">
                                    {selectedMaterialTags.map((tag, index) => (
                                        <div key={index} className="bg-blue-600 text-white text-sm px-3 py-1 rounded-full flex items-center">
                                            {tag}
                                            <button 
                                                className="ml-2 focus:outline-none" 
                                                onClick={() => removeSelectedMaterialTag(index)}
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                                
                                <div className="relative">
                                    <input
                                        type="text"
                                        className="w-full pl-10 pr-4 py-2 bg-gray-50 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                                        placeholder="Cari Tag Materi"
                                        value={materialTagSearch}
                                        onChange={(e) => setMaterialTagSearch(e.target.value)}
                                        onFocus={() => setShowMaterialTagDropdown(true)}
                                    />
                                    <Search className="w-5 h-5 text-gray-400 absolute left-3 top-2" />
                                </div>
                                
                                {showMaterialTagDropdown && (
                                    <div className="mt-2 p-2 border border-gray-200 rounded-lg max-h-40 overflow-y-auto bg-white shadow-md">
                                        {materialTagOptions.filter(tag => 
                                            tag.toLowerCase().includes(materialTagSearch.toLowerCase())
                                        ).map((tag, index) => (
                                            <div 
                                                key={index} 
                                                className="p-2 hover:bg-gray-100 rounded cursor-pointer"
                                                onClick={() => {
                                                    addSelectedMaterialTag(tag);
                                                    setShowMaterialTagDropdown(false);
                                                }}
                                            >
                                                {tag}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Create New Question Section */}
                        <div className="bg-white rounded-2xl p-6 shadow-lg">
                            <h2 className="text-xl font-semibold mb-4 text-gray-900 flex items-center gap-2">
                                <PenTool className="w-5 h-5 text-blue-500" />
                                Buat Soal Baru
                            </h2>
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                                onClick={() => setShowMarkdownEditor(true)}
                            >
                                <Plus className="w-4 h-4" />
                                Buat Soal Baru
                            </motion.button>
                        </div>
                    </motion.div>
                </div>
            </div>
            <Footer />

            {/* Markdown Editor Modal */}
            {showMarkdownEditor && (
                <EnhancedMarkdownEditor
                    initialValue={markdownContent}
                    onSave={(content) => {
                        const newQuestion = {
                            id: Date.now(),
                            question: content,
                            subject: "Custom Question",
                            difficulty: "Custom",
                            type: "Markdown",
                            lecturer: "User Created"
                        };

                        setSelectedQuestions([...selectedQuestions, newQuestion]);
                        setMarkdownContent("");
                        setShowMarkdownEditor(false);
                    }}
                    onCancel={() => setShowMarkdownEditor(false)}
                />
            )}
        </div>
    );
};

// Animated question list component
const AnimatedQuestionList = ({ questions, onAddQuestion }) => {
    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={{
                visible: {
                    transition: {
                        staggerChildren: 0.05
                    }
                }
            }}
        >
            {questions.length === 0 ? (
                <p className="text-center py-4 text-gray-500">Tidak ada soal yang ditemukan</p>
            ) : (
                questions.map((question, index) => (
                    <motion.div
                        key={question.id}
                        variants={{
                            hidden: { opacity: 0, y: 20 },
                            visible: { opacity: 1, y: 0 }
                        }}
                        className="bg-gray-50 rounded-lg p-3 mb-3 hover:bg-blue-50 transition-colors border border-gray-200"
                    >
                        <div className="flex justify-between">
                            <span className="text-sm font-medium text-gray-700">{question.subject}</span>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${question.difficulty === 'Mudah'
                                ? 'bg-green-100 text-green-800'
                                : question.difficulty === 'Sedang'
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : 'bg-red-100 text-red-800'
                                }`}>
                                {question.difficulty}
                            </span>
                        </div>
                        <p className="text-sm text-gray-800 mt-1 line-clamp-2">{question.question}</p>
                        <div className="flex justify-between items-center mt-2">
                            <span className="text-xs text-gray-500">{question.lecturer}</span>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="text-xs bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700"
                                onClick={() => onAddQuestion(question)}
                            >
                                Tambah
                            </motion.button>
                        </div>
                    </motion.div>
                ))
            )}
        </motion.div>
    );
};

export default FormCreatorPage;