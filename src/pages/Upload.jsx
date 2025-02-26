import React, { useState } from 'react';
import { motion } from "framer-motion";
import { Upload, File, CheckCircle, X, AlertCircle, User, Calendar, Tag, ChevronDown } from 'lucide-react';
import LogoIF from 'D:/Programming/ProyekSI/ProyekSI/src/assets/LogoIF.jpg';
import LogoUnpar from 'D:/Programming/ProyekSI/ProyekSI/src/assets/LogoUnpar.png';
import Footer from '../components/Footer';

const CustomHeader = () => {
  return (
    <motion.header
      className="bg-white shadow-md py-4 px-6 md:px-12 lg:px-24"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {/* Logo Unpar - Replace with actual import */}
          <img
            src={LogoUnpar}
            alt="Logo Unpar"
            className="h-10 w-auto"
          />
          <div className="h-8 w-px bg-gray-300"></div>
          {/* Logo IF - Replace with actual import */}
          <img
            src={LogoIF}
            alt="Logo IF"
            className="h-10 w-auto rounded"
          />
        </div>

        <motion.a
          whileHover={{ scale: 1.05 }}
          className="text-gray-600 hover:text-blue-600 font-medium cursor-pointer"
          href="/"
        >
          Home
        </motion.a>

        <motion.a
          whileHover={{ scale: 1.05 }}
          className="text-gray-600 hover:text-blue-600 font-medium cursor-pointer"
          href="/search"
        >
          Cari Soal
        </motion.a>

        <motion.a
          whileHover={{ scale: 1.05 }}
          className="text-gray-600 hover:text-blue-600 font-medium cursor-pointer"
          href="/upload"
        >
          Upload
        </motion.a>

        <motion.button
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all duration-300"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Login
        </motion.button>
      </div>
    </motion.header>
  );
};

const UploadPage = () => {
  const [uploadSteps, setUploadSteps] = useState({
    questions: null,
    answers: null,
    testCases: null
  });

  const [metadata, setMetadata] = useState({
    subject: '',
    topics: '',
    difficulty: '',
    description: '',
    lecturer: 'Dr. Ahmad Fauzi' // Ini akan diambil dari akun yang login
  });

  const handleFileSelect = (type) => {
    // Simulated file selection
    setUploadSteps(prev => ({
      ...prev,
      [type]: 'uploaded'
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-blue-50">
      <CustomHeader />
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold mb-4 text-gray-900">Upload Soal Baru</h1>
          <p className="text-xl text-gray-600">Unggah dan kelola soal-soal Anda dengan mudah</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* File Upload Section */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-2xl p-8 shadow-lg"
          >
            <h2 className="text-2xl font-semibold mb-6 text-gray-900">Upload Files</h2>
            
            {/* Questions Upload */}
            <div className="mb-6">
              <div 
                className={`border-2 border-dashed rounded-xl p-6 cursor-pointer transition-all ${
                  uploadSteps.questions ? 'border-green-400 bg-green-50' : 'border-gray-300 hover:border-blue-400'
                }`}
                onClick={() => handleFileSelect('questions')}
              >
                <div className="flex items-center gap-4">
                  {uploadSteps.questions ? (
                    <CheckCircle className="w-8 h-8 text-green-500" />
                  ) : (
                    <Upload className="w-8 h-8 text-blue-500" />
                  )}
                  <div>
                    <h3 className="font-semibold text-gray-900">Upload Soal</h3>
                    <p className="text-sm text-gray-500">Format: PDF, DOCX, atau TXT</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Answers Upload */}
            <div className="mb-6">
              <div 
                className={`border-2 border-dashed rounded-xl p-6 cursor-pointer transition-all ${
                  uploadSteps.answers ? 'border-green-400 bg-green-50' : 'border-gray-300 hover:border-blue-400'
                }`}
                onClick={() => handleFileSelect('answers')}
              >
                <div className="flex items-center gap-4">
                  {uploadSteps.answers ? (
                    <CheckCircle className="w-8 h-8 text-green-500" />
                  ) : (
                    <File className="w-8 h-8 text-blue-500" />
                  )}
                  <div>
                    <h3 className="font-semibold text-gray-900">Upload Kunci Jawaban</h3>
                    <p className="text-sm text-gray-500">Format: PDF, DOCX, atau TXT</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Test Cases Upload */}
            <div className="mb-6">
              <div 
                className={`border-2 border-dashed rounded-xl p-6 cursor-pointer transition-all ${
                  uploadSteps.testCases ? 'border-green-400 bg-green-50' : 'border-gray-300 hover:border-blue-400'
                }`}
                onClick={() => handleFileSelect('testCases')}
              >
                <div className="flex items-center gap-4">
                  {uploadSteps.testCases ? (
                    <CheckCircle className="w-8 h-8 text-green-500" />
                  ) : (
                    <AlertCircle className="w-8 h-8 text-blue-500" />
                  )}
                  <div>
                    <h3 className="font-semibold text-gray-900">Upload Test Cases</h3>
                    <p className="text-sm text-gray-500">Format: PDF, DOCX, atau TXT</p>
                  </div>
                </div>
              </div>
            </div>
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
                <label className="block text-sm font-medium mb-2 text-gray-700">Mata Kuliah</label>
                <input
                  type="text"
                  className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  placeholder="Nama mata kuliah"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Topik</label>
                <input
                  type="text"
                  className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  placeholder="Pisahkan dengan koma"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Tingkat Kesulitan</label>
                <select className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200">
                  <option value="">Pilih tingkat kesulitan</option>
                  <option value="easy">Mudah</option>
                  <option value="medium">Sedang</option>
                  <option value="hard">Sulit</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Dosen</label>
                <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 rounded-xl border border-gray-300">
                  <User className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-700">{metadata.lecturer}</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Tanggal Upload</label>
                <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 rounded-xl border border-gray-300">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-700">{new Date().toLocaleDateString()}</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Deskripsi</label>
                <textarea
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
            >
              <Upload className="w-5 h-5" />
              Upload Soal
            </motion.button>
          </motion.div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default UploadPage;