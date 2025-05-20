import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import {
    Search, Filter, Download, Calendar, Clock, FileText, Trash2,
    RefreshCw, List, Grid, ChevronDown, X, CheckCircle, Eye
} from 'lucide-react';
import LogoIF from '../assets/LogoIF.jpg';  // Updated path
import LogoUnpar from '../assets/LogoUnpar.png';  // Updated path
import Footer from '../components/Footer';
import Header from '../components/Header';



// Tech-themed background animation component
const TechBackgroundAnimation = () => {
    return (
        <motion.div
            className="absolute inset-0 -z-10 overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.8 }}
            transition={{ duration: 1.5 }}
        >
            {/* Digital Circuit Lines */}
            {[...Array(15)].map((_, i) => (
                <motion.div
                    key={`line-${i}`}
                    className="absolute bg-blue-200 opacity-30"
                    style={{
                        height: Math.random() < 0.5 ? '1px' : '2px',
                        width: `${Math.random() * 20 + 5}%`,
                        top: `${Math.random() * 100}%`,
                        left: `${Math.random() * 80}%`,
                    }}
                    initial={{ width: 0 }}
                    animate={{
                        width: [`${Math.random() * 20 + 5}%`, `${Math.random() * 30 + 10}%`],
                        opacity: [0.2, 0.4, 0.2],
                    }}
                    transition={{
                        duration: Math.random() * 8 + 4,
                        repeat: Infinity,
                        repeatType: "reverse",
                        ease: "easeInOut"
                    }}
                />
            ))}

            {/* Digital Nodes */}
            {[...Array(20)].map((_, i) => (
                <motion.div
                    key={`node-${i}`}
                    className="absolute rounded-full bg-blue-300"
                    style={{
                        width: Math.random() * 10 + 4,
                        height: Math.random() * 10 + 4,
                        top: `${Math.random() * 100}%`,
                        left: `${Math.random() * 100}%`,
                    }}
                    animate={{
                        scale: [1, 1.5, 1],
                        opacity: [0.3, 0.6, 0.3],
                    }}
                    transition={{
                        duration: Math.random() * 4 + 2,
                        repeat: Infinity,
                        delay: Math.random() * 2,
                    }}
                />
            ))}

            {/* Binary Code */}
            {[...Array(10)].map((_, i) => (
                <motion.div
                    key={`binary-${i}`}
                    className="absolute text-blue-200 opacity-20 font-mono text-xs"
                    style={{
                        top: `${Math.random() * 100}%`,
                        left: `${Math.random() * 100}%`,
                    }}
                    initial={{ opacity: 0 }}
                    animate={{
                        opacity: [0.1, 0.3, 0.1],
                    }}
                    transition={{
                        duration: Math.random() * 5 + 3,
                        repeat: Infinity,
                        delay: Math.random() * 2,
                    }}
                >
                    {Math.random() > 0.5 ? "1" : "0"}
                </motion.div>
            ))}
        </motion.div>
    );
};

const HistoryPage = ({ currentUser }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [historyData, setHistoryData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [viewMode, setViewMode] = useState('grid');
    const [searchQuery, setSearchQuery] = useState('');
    const [showFilterModal, setShowFilterModal] = useState(false);
    const [dateRange, setDateRange] = useState({ start: '', end: '' });
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [selectedSort, setSelectedSort] = useState('newest');

    // Simulate loading
    useEffect(() => {
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 1500);

        return () => clearTimeout(timer);
    }, []);

    // Generate mock history data
    useEffect(() => {
        // Mock data for download history
        const mockHistoryData = [
            {
                id: 1,
                fileName: "UTS_MTK_2023_Ganjil.pdf",
                subject: "Algoritma Struktur Dasar",
                category: "Soal UTS",
                downloadDate: "2024-02-25T14:30:00",
                fileSize: "1.25 MB",
                accessed: 3,
                lastAccessed: "2024-02-26T10:15:00",
                status: "completed"
            },
            {
                id: 2,
                fileName: "UAS_Fisika_2023_Genap.pdf",
                subject: "Fisika Dasar",
                category: "Soal UAS",
                downloadDate: "2024-02-22T09:45:00",
                fileSize: "2.7 MB",
                accessed: 5,
                lastAccessed: "2024-02-25T16:20:00",
                status: "completed"
            },
            {
                id: 3,
                fileName: "Quiz_Kimia_Organik.pdf",
                subject: "Kimia Dasar",
                category: "Quiz",
                downloadDate: "2024-02-20T11:30:00",
                fileSize: "0.8 MB",
                accessed: 2,
                lastAccessed: "2024-02-23T08:10:00",
                status: "completed"
            },
            {
                id: 4,
                fileName: "Tugas_Algo_Strukdat.pdf",
                subject: "Struktur Data",
                category: "Tugas",
                downloadDate: "2024-02-18T16:15:00",
                fileSize: "1.5 MB",
                accessed: 7,
                lastAccessed: "2024-02-26T14:30:00",
                status: "completed"
            },
            {
                id: 5,
                fileName: "UTS_Database_2023.pdf",
                subject: "Sistem Database",
                category: "Soal UTS",
                downloadDate: "2024-02-15T13:20:00",
                fileSize: "3.2 MB",
                accessed: 4,
                lastAccessed: "2024-02-25T09:45:00",
                status: "completed"
            },
            {
                id: 6,
                fileName: "UAS_Ekonomi_Makro.pdf",
                subject: "Ekonomi",
                category: "Soal UAS",
                downloadDate: "2024-02-10T10:45:00",
                fileSize: "2.1 MB",
                accessed: 1,
                lastAccessed: "2024-02-15T11:30:00",
                status: "completed"
            },
            {
                id: 7,
                fileName: "Quiz_Programming_Java.pdf",
                subject: "Pemrograman Java",
                category: "Quiz",
                downloadDate: "2024-02-08T14:50:00",
                fileSize: "1.8 MB",
                accessed: 6,
                lastAccessed: "2024-02-20T13:15:00",
                status: "completed"
            },
            {
                id: 8,
                fileName: "Tugas_Web_Programming.pdf",
                subject: "Pemrograman Web",
                category: "Tugas",
                downloadDate: "2024-02-05T09:30:00",
                fileSize: "2.5 MB",
                accessed: 8,
                lastAccessed: "2024-02-24T15:40:00",
                status: "completed"
            }
        ];

        setHistoryData(mockHistoryData);
        setFilteredData(mockHistoryData);
    }, []);

    // Apply filters and sorting
    useEffect(() => {
        let filtered = [...historyData];

        // Apply search filter
        if (searchQuery) {
            filtered = filtered.filter(item =>
                item.fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.category.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        // Apply category filter
        if (selectedCategories.length > 0) {
            filtered = filtered.filter(item =>
                selectedCategories.includes(item.category)
            );
        }

        // Apply date range filter
        if (dateRange.start || dateRange.end) {
            filtered = filtered.filter(item => {
                const itemDate = new Date(item.downloadDate);
                const startDate = dateRange.start ? new Date(dateRange.start) : new Date(0);
                const endDate = dateRange.end ? new Date(dateRange.end) : new Date('2099-12-31');

                // Set the time part of the dates to compare only the dates
                startDate.setHours(0, 0, 0, 0);
                endDate.setHours(23, 59, 59, 999);

                return itemDate >= startDate && itemDate <= endDate;
            });
        }

        // Apply sorting
        switch (selectedSort) {
            case 'newest':
                filtered.sort((a, b) => new Date(b.downloadDate) - new Date(a.downloadDate));
                break;
            case 'oldest':
                filtered.sort((a, b) => new Date(a.downloadDate) - new Date(b.downloadDate));
                break;
            case 'mostAccessed':
                filtered.sort((a, b) => b.accessed - a.accessed);
                break;
            case 'fileName':
                filtered.sort((a, b) => a.fileName.localeCompare(b.fileName));
                break;
            default:
                break;
        }

        setFilteredData(filtered);
    }, [historyData, searchQuery, selectedCategories, dateRange, selectedSort]);

    // Format the date for display
    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        return new Date(dateString).toLocaleDateString('id-ID', options);
    };

    // Get days since download
    const getDaysSince = (dateString) => {
        const downloadDate = new Date(dateString);
        const today = new Date();
        const diffTime = Math.abs(today - downloadDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return "Today";
        if (diffDays === 1) return "Yesterday";
        return `${diffDays} days ago`;
    };

    // Handle clear history
    const handleClearHistory = () => {
        if (window.confirm("Are you sure you want to clear all download history? This action cannot be undone.")) {
            setHistoryData([]);
            setFilteredData([]);
        }
    };

    // Handle delete item
    const handleDeleteHistoryItem = (id) => {
        if (window.confirm("Are you sure you want to remove this item from your history?")) {
            const updatedHistory = historyData.filter(item => item.id !== id);
            setHistoryData(updatedHistory);
            setFilteredData(updatedHistory);
        }
    };

    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.08 }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1 }
    };

    // Loading animation component
    const LoadingAnimation = () => (
        <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-90 z-50">
            <motion.div
                className="flex flex-col items-center"
            >
                <motion.div
                    className="w-16 h-16 relative"
                >
                    <motion.div
                        animate={{
                            rotate: 360
                        }}
                        transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "linear"
                        }}
                        className="absolute inset-0 border-4 border-blue-500 border-t-transparent rounded-full"
                    />
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{
                            scale: [0, 1, 0]
                        }}
                        transition={{
                            duration: 1.5,
                            repeat: Infinity,
                            repeatDelay: 0.5
                        }}
                        className="absolute inset-0 flex items-center justify-center"
                    >
                        <Clock className="w-8 h-8 text-blue-600" />
                    </motion.div>
                </motion.div>
                <motion.p
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{
                        duration: 1.5,
                        repeat: Infinity
                    }}
                    className="mt-4 text-lg font-medium text-blue-600"
                >
                    Memuat Riwayat Unduhan...
                </motion.p>
            </motion.div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-blue-50">
            <CustomHeader />

            {isLoading ? (
                <LoadingAnimation />
            ) : (
                <div className="w-full px-4 md:px-8 py-8 md:py-12">
                    {/* Header Section with Tech-themed Animated Background */}
                    <div className="relative overflow-hidden">
                        <TechBackgroundAnimation />

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
                                Riwayat <span className="text-blue-600">Unduhan</span>
                            </motion.h1>
                            <motion.p
                                className="text-lg text-gray-600 max-w-3xl mx-auto"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.4 }}
                            >
                                Lihat dan kelola riwayat soal yang telah Anda unduh. Akses cepat ke file yang sering digunakan.
                            </motion.p>
                        </motion.div>
                    </div>

                    {/* Search and Filter Section */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="max-w-6xl mx-auto bg-white rounded-2xl p-6 shadow-lg mb-8 border border-gray-100"
                    >
                        <div className="flex flex-col md:flex-row gap-4 mb-6">
                            <div className="flex-1 relative">
                                <Search className="absolute left-4 top-3.5 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Cari riwayat unduhan berdasarkan nama file atau mata kuliah..."
                                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                            <div className="flex gap-2">
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="px-6 py-3 bg-blue-600 text-white rounded-xl flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors shadow-sm"
                                    onClick={() => setShowFilterModal(true)}
                                >
                                    <Filter className="w-5 h-5" />
                                    Filter
                                </motion.button>
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="px-6 py-3 bg-red-600 text-white rounded-xl flex items-center justify-center gap-2 hover:bg-red-700 transition-colors shadow-sm"
                                    onClick={handleClearHistory}
                                >
                                    <Trash2 className="w-5 h-5" />
                                    Bersihkan
                                </motion.button>
                            </div>
                        </div>

                        {/* Applied Filters Display */}
                        {(selectedCategories.length > 0 || dateRange.start || dateRange.end) && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                className="mb-4 flex flex-wrap gap-2"
                            >
                                <span className="text-sm text-gray-500 my-auto">Filter Aktif:</span>

                                {selectedCategories.map(category => (
                                    <motion.span
                                        key={category}
                                        initial={{ scale: 0.8 }}
                                        animate={{ scale: 1 }}
                                        className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm flex items-center gap-1"
                                    >
                                        <CheckCircle className="w-3 h-3" />
                                        {category}
                                        <button onClick={() => setSelectedCategories(prev => prev.filter(c => c !== category))}>
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
                                        setSelectedCategories([]);
                                        setDateRange({ start: '', end: '' });
                                    }}
                                >
                                    <X className="w-3 h-3" />
                                    Hapus Semua Filter
                                </motion.button>
                            </motion.div>
                        )}

                        {/* Sort and View Toggle */}
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-600">Urutkan:</span>
                                <select
                                    className="pl-3 pr-8 py-2 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                    value={selectedSort}
                                    onChange={(e) => setSelectedSort(e.target.value)}
                                >
                                    <option value="newest">Terbaru</option>
                                    <option value="oldest">Terlama</option>
                                    <option value="mostAccessed">Paling Sering Diakses</option>
                                    <option value="fileName">Nama File (A-Z)</option>
                                </select>
                            </div>

                            <div className="flex justify-between items-center w-full sm:w-auto">
                                <p className="text-gray-600 text-sm">
                                    Menampilkan <span className="font-medium">{filteredData.length}</span> dari {historyData.length} hasil
                                </p>
                                <div className="flex gap-2 ml-4">
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        className={`p-2 rounded ${viewMode === 'grid' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}
                                        onClick={() => setViewMode('grid')}
                                    >
                                        <Grid className="w-5 h-5" />
                                    </motion.button>
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        className={`p-2 rounded ${viewMode === 'list' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}
                                        onClick={() => setViewMode('list')}
                                    >
                                        <List className="w-5 h-5" />
                                    </motion.button>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* History Items - Grid View */}
                    <AnimatePresence mode="wait">
                        {filteredData.length > 0 ? (
                            viewMode === 'grid' ? (
                                <motion.div
                                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto"
                                    variants={containerVariants}
                                    initial="hidden"
                                    animate="visible"
                                    key="grid-view"
                                >
                                    {filteredData.map((item) => (
                                        <motion.div
                                            key={item.id}
                                            variants={itemVariants}
                                            whileHover={{ y: -5, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' }}
                                            className="bg-white rounded-xl p-6 shadow-md border border-gray-100 transition-all relative"
                                        >
                                            <div className="absolute top-4 right-4 flex space-x-1">
                                                <motion.button
                                                    whileHover={{ scale: 1.1 }}
                                                    whileTap={{ scale: 0.9 }}
                                                    className="text-gray-400 hover:text-blue-600 p-1 rounded-full hover:bg-blue-50"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </motion.button>
                                                <motion.button
                                                    whileHover={{ scale: 1.1 }}
                                                    whileTap={{ scale: 0.9 }}
                                                    className="text-gray-400 hover:text-blue-600 p-1 rounded-full hover:bg-blue-50"
                                                >
                                                    <Download className="w-4 h-4" />
                                                </motion.button>
                                                <motion.button
                                                    whileHover={{ scale: 1.1 }}
                                                    whileTap={{ scale: 0.9 }}
                                                    className="text-gray-400 hover:text-red-600 p-1 rounded-full hover:bg-red-50"
                                                    onClick={() => handleDeleteHistoryItem(item.id)}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </motion.button>
                                            </div>

                                            <div className="mb-6 pb-3 border-b">
                                                <div className="flex items-start justify-between">
                                                    <div>
                                                        <h3 className="text-lg font-semibold text-gray-900 mb-1">{item.fileName}</h3>
                                                        <p className="text-sm text-gray-500">{item.subject}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="space-y-3 text-sm">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-gray-500">Kategori:</span>
                                                    <span className="font-medium text-gray-800">{item.category}</span>
                                                </div>

                                                <div className="flex justify-between items-center">
                                                    <span className="text-gray-500">Diunduh:</span>
                                                    <span className="font-medium text-gray-800">{getDaysSince(item.downloadDate)}</span>
                                                </div>

                                                <div className="flex justify-between items-center">
                                                    <span className="text-gray-500">Ukuran File:</span>
                                                    <span className="font-medium text-gray-800">{item.fileSize}</span>
                                                </div>

                                                <div className="flex justify-between items-center">
                                                    <span className="text-gray-500">Dibuka:</span>
                                                    <span className="font-medium text-gray-800">{item.accessed} kali</span>
                                                </div>
                                            </div>

                                            <div className="mt-6 pt-3 border-t">
                                                <div className="flex items-center justify-between text-xs text-gray-500">
                                                    <div className="flex items-center gap-1">
                                                        <Clock className="w-3 h-3" />
                                                        <span>Terakhir diakses:</span>
                                                    </div>
                                                    <div>{formatDate(item.lastAccessed).split('pukul')[0]}</div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </motion.div>
                            ) : (
                                // History Items - List View
                                <motion.div
                                    className="overflow-x-auto max-w-7xl mx-auto bg-white rounded-xl shadow-lg"
                                    variants={containerVariants}
                                    initial="hidden"
                                    animate="visible"
                                    key="list-view"
                                >
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Nama File
                                                </th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Mata Kuliah
                                                </th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Kategori
                                                </th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Tanggal Unduh
                                                </th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Ukuran File
                                                </th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Dibuka
                                                </th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Terakhir Diakses
                                                </th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Aksi
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {filteredData.map((item) => (
                                                <motion.tr
                                                    key={item.id}
                                                    variants={itemVariants}
                                                    whileHover={{ backgroundColor: "#f9fafb" }}
                                                    className="transition-colors"
                                                >
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                        {item.fileName}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {item.subject}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {item.category}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {formatDate(item.downloadDate)}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {item.fileSize}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {item.accessed} kali
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {formatDate(item.lastAccessed)}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        <div className="flex items-center space-x-2">
                                                            <motion.button
                                                                whileHover={{ scale: 1.1 }}
                                                                whileTap={{ scale: 0.9 }}
                                                                className="text-gray-400 hover:text-blue-600 p-1 rounded-full hover:bg-blue-50"
                                                            >
                                                                <Eye className="w-4 h-4" />
                                                            </motion.button>
                                                            <motion.button
                                                                whileHover={{ scale: 1.1 }}
                                                                whileTap={{ scale: 0.9 }}
                                                                className="text-gray-400 hover:text-blue-600 p-1 rounded-full hover:bg-blue-50"
                                                            >
                                                                <Download className="w-4 h-4" />
                                                            </motion.button>
                                                            <motion.button
                                                                whileHover={{ scale: 1.1 }}
                                                                whileTap={{ scale: 0.9 }}
                                                                className="text-gray-400 hover:text-red-600 p-1 rounded-full hover:bg-red-50"
                                                                onClick={() => handleDeleteHistoryItem(item.id)}
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </motion.button>
                                                        </div>
                                                    </td>
                                                </motion.tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </motion.div>
                            )
                        ) : (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-center py-12 text-gray-600"
                            >
                                <FileText className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                                <p>Tidak ada riwayat unduhan yang ditemukan.</p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            )}

            {/* Filter Modal */}
            <AnimatePresence>
                {showFilterModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
                        onClick={() => setShowFilterModal(false)}
                    >
                        <motion.div
                            initial={{ y: 50, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: 50, opacity: 0 }}
                            className="bg-white rounded-xl w-full max-w-md p-6"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-lg font-semibold text-gray-900">Filter Riwayat</h3>
                                <button
                                    className="text-gray-400 hover:text-gray-600"
                                    onClick={() => setShowFilterModal(false)}
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <div className="space-y-6">
                                {/* Category Filter */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Kategori
                                    </label>
                                    <div className="space-y-2">
                                        {["Soal UTS", "Soal UAS", "Quiz", "Tugas"].map((category) => (
                                            <div key={category} className="flex items-center">
                                                <input
                                                    type="checkbox"
                                                    id={category}
                                                    checked={selectedCategories.includes(category)}
                                                    onChange={(e) => {
                                                        if (e.target.checked) {
                                                            setSelectedCategories((prev) => [...prev, category]);
                                                        } else {
                                                            setSelectedCategories((prev) =>
                                                                prev.filter((c) => c !== category)
                                                            );
                                                        }
                                                    }}
                                                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                                />
                                                <label htmlFor={category} className="ml-2 text-sm text-gray-700">
                                                    {category}
                                                </label>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Date Range Filter */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Rentang Tanggal
                                    </label>
                                    <div className="flex gap-4">
                                        <input
                                            type="date"
                                            value={dateRange.start}
                                            onChange={(e) =>
                                                setDateRange((prev) => ({ ...prev, start: e.target.value }))
                                            }
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                        />
                                        <input
                                            type="date"
                                            value={dateRange.end}
                                            onChange={(e) =>
                                                setDateRange((prev) => ({ ...prev, end: e.target.value }))
                                            }
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                        />
                                    </div>
                                </div>

                                {/* Apply Filters Button */}
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="w-full px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-sm"
                                    onClick={() => setShowFilterModal(false)}
                                >
                                    Terapkan Filter
                                </motion.button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <Footer />
        </div>
    );
};

export default HistoryPage;