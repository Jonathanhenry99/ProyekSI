import React, { useState } from 'react';
import { motion } from "framer-motion";
import { Search, Filter, Download, User, Clock, Tag } from 'lucide-react';

const SearchPage = () => {
  const [activeTab, setActiveTab] = useState('semua');
  const mockData = [
    { 
      id: 1, 
      subject: 'Matematika', 
      year: 2023, 
      lecturer: 'Dr. Ahmad', 
      level: 'Mudah',
      lastUpdated: '2024-02-20',
      topics: ['Kalkulus', 'Integral']
    }
    // Add more mock data as needed
  ];

  return (
    <div className="min-h-screen w-full bg-white">
      <div className="w-full px-8 py-12">
        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold mb-3 text-gray-900">Bank Soal Digital</h1>
          <p className="text-lg text-gray-600">Platform Kolaborasi Soal untuk Pendidikan Modern</p>
        </motion.div>

        {/* Search Section */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="max-w-6xl mx-auto bg-white rounded-2xl p-6 shadow-lg mb-8"
        >
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-3.5 text-gray-400" />
              <input
                type="text"
                placeholder="Cari soal berdasarkan mata kuliah, dosen, atau topik..."
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-6 py-3 bg-blue-600 text-white rounded-xl flex items-center gap-2 hover:bg-blue-700 transition-colors shadow-sm"
            >
              <Filter className="w-5 h-5" />
              Filter
            </motion.button>
          </div>

          {/* Filter Tags */}
          <div className="flex flex-wrap gap-3 mt-6">
            {['Semua', 'Soal', 'Kunci Jawaban', 'Test Case'].map((tab) => (
              <motion.button
                key={tab}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`px-4 py-2 rounded-full transition-colors ${
                  activeTab === tab.toLowerCase() 
                    ? 'bg-blue-600 text-white shadow-sm' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                onClick={() => setActiveTab(tab.toLowerCase())}
              >
                {tab}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Results Grid */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {mockData.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 hover:border-blue-200 transition-all"
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-semibold text-gray-900">{item.subject}</h3>
                <span className={`px-3 py-1 rounded-full text-sm ${
                  item.level === 'Mudah' ? 'bg-green-100 text-green-700' :
                  item.level === 'Sedang' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {item.level}
                </span>
              </div>

              <div className="space-y-3 text-gray-600">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  <span>{item.lecturer}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>Updated: {item.lastUpdated}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Tag className="w-4 h-4" />
                  <div className="flex gap-2">
                    {item.topics.map(topic => (
                      <span key={topic} className="text-sm bg-gray-100 px-2 py-1 rounded">
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full mt-6 flex items-center justify-center gap-2 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
              >
                <Download className="w-4 h-4" />
                Download
              </motion.button>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default SearchPage;