import React, { useState, useRef } from 'react';
import { motion } from "framer-motion";
import {
    Upload, File, Search, Trash2, Edit, Download, Plus,
    Move, ChevronDown, ChevronUp, Check, Database, PenTool
} from 'lucide-react';
import LogoIF from 'D:/Programming/ProyekSI/ProyekSI/src/assets/LogoIF.jpg';
import LogoUnpar from 'D:/Programming/ProyekSI/ProyekSI/src/assets/LogoUnpar.png';
import Footer from '../components/Footer';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import EnhancedMarkdownEditor from '../components/EnhancedMarkdownEditor';

const CustomHeader = () => {
    return (
        <motion.header
            className="bg-white shadow-md py-5 px-6 md:px-12 lg:px-24"
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <div className="flex items-center justify-between">
                {/* Logo di kiri */}
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

                {/* Navigasi di tengah - dengan container yang memiliki width tetap */}
                <div className="flex-1 flex justify-center -ml-27">
                    <nav className="flex items-center space-x-7">
                        {/* Teks navigasi dengan indikator aktif */}
                        {[
                            { name: "Home", path: "/" },
                            { name: "Cari Soal", path: "/search" },
                            { name: "Upload", path: "/upload" },
                            { name: "Buat Soal", path: "/Create" },
                            { name: "History", path: "/history" }
                        ].map((item) => (
                            <div className="relative group" key={item.name}>
                                <motion.a
                                    whileHover={{ y: -2 }}
                                    className="text-gray-600 hover:text-blue-600 font-medium cursor-pointer px-1 py-2 block"
                                    href={item.path}
                                >
                                    {item.name}
                                </motion.a>
                                <motion.div
                                    className="h-0.5 w-0 bg-blue-600 absolute bottom-0 left-0"
                                    initial={{ width: 0 }}
                                    whileHover={{ width: "100%" }}
                                    transition={{ duration: 0.3 }}
                                />
                            </div>
                        ))}
                    </nav>
                </div>
                {/* Tombol Login di kanan */}
                <motion.a
                    href="/login" // Tambahkan href ke /login
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all duration-300"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    Login
                </motion.a>
            </div>
        </motion.header>
    );
};

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

const FormCreatorPage = () => {
    const [formTitle, setFormTitle] = useState("Untitled Form");
    const [formDescription, setFormDescription] = useState("");
    const [selectedQuestions, setSelectedQuestions] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [isSearching, setIsSearching] = useState(false);
    const [showMarkdownEditor, setShowMarkdownEditor] = useState(false);
    const [markdownContent, setMarkdownContent] = useState("");
    const [filteredQuestions, setFilteredQuestions] = useState(sampleQuestions);
    const markdownEditorRef = useRef(null);

    // Handle drag and drop functionality
    const handleDragEnd = (result) => {
        if (!result.destination) return;

        const items = Array.from(selectedQuestions);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);

        setSelectedQuestions(items);
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
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-blue-50">
            <CustomHeader />

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
                        className="lg:col-span-8 bg-white rounded-2xl p-8 shadow-lg"
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
                        <DragDropContext onDragEnd={handleDragEnd}>
                            <Droppable droppableId="questions">
                                {(provided) => (
                                    <div
                                        {...provided.droppableProps}
                                        ref={provided.innerRef}
                                        className="space-y-4"
                                    >
                                        {selectedQuestions.length === 0 ? (
                                            <motion.div
                                                className="text-center py-16 border-2 border-dashed border-gray-300 rounded-xl"
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                transition={{ delay: 0.3 }}
                                            >
                                                <p className="text-gray-500 mb-4">Belum ada soal yang dipilih</p>
                                                <p className="text-gray-400">Pilih soal dari bank soal atau buat soal baru</p>
                                            </motion.div>
                                        ) : (
                                            selectedQuestions.map((question, index) => (
                                                <Draggable key={index} draggableId={`question-${index}`} index={index}>
                                                    {(provided) => (
                                                        <motion.div
                                                            ref={provided.innerRef}
                                                            {...provided.draggableProps}
                                                            {...provided.dragHandleProps}
                                                            initial={{ opacity: 0, y: 20 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            transition={{ delay: index * 0.05 }}
                                                            className="bg-white border rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow"
                                                        >
                                                            <div className="flex justify-between items-start mb-3">
                                                                <div className="flex items-center">
                                                                    <div className="bg-blue-100 text-blue-800 w-8 h-8 rounded-full flex items-center justify-center font-semibold mr-3">
                                                                        {index + 1}
                                                                    </div>
                                                                    <span className="text-sm font-medium text-gray-600">
                                                                        {question.subject} • {question.difficulty}
                                                                    </span>
                                                                </div>
                                                                <div className="flex gap-2">
                                                                    <div {...provided.dragHandleProps} className="cursor-move p-1">
                                                                        <Move className="w-5 h-5 text-gray-400 hover:text-gray-700" />
                                                                    </div>
                                                                    <button
                                                                        onClick={() => handleRemoveQuestion(index)}
                                                                        className="p-1"
                                                                    >
                                                                        <Trash2 className="w-5 h-5 text-gray-400 hover:text-red-500" />
                                                                    </button>
                                                                </div>
                                                            </div>
                                                            <div className="pl-11">
                                                                <p className="text-gray-800">{question.question}</p>
                                                                <div className="mt-2 flex items-center text-xs text-gray-500">
                                                                    <span>{question.lecturer}</span>
                                                                    <span className="mx-2">•</span>
                                                                    <span>{question.type}</span>
                                                                </div>
                                                            </div>
                                                        </motion.div>
                                                    )}
                                                </Draggable>
                                            ))
                                        )}
                                        {provided.placeholder}
                                    </div>
                                )}
                            </Droppable>
                        </DragDropContext>

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
                        className="lg:col-span-4 space-y-6"
                    >
                        {/* Search in question bank */}
                        <div className="bg-white rounded-2xl p-6 shadow-lg">
                            <h2 className="text-xl font-semibold mb-4 text-gray-900 flex items-center gap-2">
                                <Database className="w-5 h-5 text-blue-500" />
                                Bank Soal
                            </h2>

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

                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="w-full bg-gray-100 text-gray-800 border border-gray-300 py-2 rounded-lg font-medium hover:bg-gray-200 transition-colors flex items-center justify-center gap-2 mb-4"
                                onClick={handleSearch}
                            >
                                <Search className="w-4 h-4" />
                                Cari
                            </motion.button>

                            <div className="max-h-80 overflow-y-auto pr-2">
                                <AnimatedQuestionList
                                    questions={filteredQuestions}
                                    onAddQuestion={handleAddQuestion}
                                />
                            </div>
                        </div>

                        {/* Create new question with markdown */}
                        <div className="bg-white rounded-2xl p-6 shadow-lg">
                            <h2 className="text-xl font-semibold mb-4 text-gray-900 flex items-center gap-2">
                                <PenTool className="w-5 h-5 text-blue-500" />
                                Buat Soal Baru
                            </h2>

                            {showMarkdownEditor ? (
                                <div>
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
                                </div>
                            ) : (
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="w-full bg-blue-50 text-blue-700 border border-blue-200 py-3 rounded-xl font-medium hover:bg-blue-100 transition-colors flex items-center justify-center gap-2"
                                    onClick={() => setShowMarkdownEditor(true)}
                                >
                                    <Plus className="w-5 h-5" />
                                    Buat Soal Baru
                                </motion.button>
                            )}
                        </div>
                    </motion.div>
                </div>
            </div>

            <Footer />
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