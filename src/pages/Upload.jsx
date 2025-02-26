import React, { useState } from 'react';
import { motion } from "framer-motion";
import { Upload, File, CheckCircle, X, AlertCircle } from 'lucide-react';

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
    description: ''
  });

  const handleFileSelect = (type) => {
    // Simulated file selection
    setUploadSteps(prev => ({
      ...prev,
      [type]: 'uploaded'
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-bold mb-4">Upload Soal Baru</h1>
          <p className="text-xl text-blue-200">Unggah dan kelola soal-soal anda dengan mudah</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* File Upload Section */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white/10 backdrop-blur-xl rounded-2xl p-8"
          >
            <h2 className="text-2xl font-semibold mb-6">Upload Files</h2>
            
            {/* Questions Upload */}
            <div className="mb-6">
              <div 
                className={`border-2 border-dashed rounded-xl p-6 cursor-pointer transition-all ${
                  uploadSteps.questions ? 'border-green-400 bg-green-400/10' : 'border-white/20 hover:border-blue-400'
                }`}
                onClick={() => handleFileSelect('questions')}
              >
                <div className="flex items-center gap-4">
                  {uploadSteps.questions ? (
                    <CheckCircle className="w-8 h-8 text-green-400" />
                  ) : (
                    <Upload className="w-8 h-8 text-blue-300" />
                  )}
                  <div>
                    <h3 className="font-semibold">Upload Soal</h3>
                    <p className="text-sm text-blue-200">Format: PDF, DOCX, atau TXT</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Answers Upload */}
            <div className="mb-6">
              <div 
                className={`border-2 border-dashed rounded-xl p-6 cursor-pointer transition-all ${
                  uploadSteps.answers ? 'border-green-400 bg-green-400/10' : 'border-white/20 hover:border-blue-400'
                }`}
                onClick={() => handleFileSelect('answers')}
              >
                <div className="flex items-center gap-4">
                  {uploadSteps.answers ? (
                    <CheckCircle className="w-8 h-8 text-green-400" />
                  ) : (
                    <File className="w-8 h-8 text-blue-300" />
                  )}
                  <div>
                    <h3 className="font-semibold">Upload Kunci Jawaban</h3>
                    <p className="text-sm text-blue-200">Format: PDF, DOCX, atau TXT</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Test Cases Upload */}
            <div className="mb-6">
              <div 
                className={`border-2 border-dashed rounded-xl p-6 cursor-pointer transition-all ${
                  uploadSteps.testCases ? 'border-green-400 bg-green-400/10' : 'border-white/20 hover:border-blue-400'
                }`}
                onClick={() => handleFileSelect('testCases')}
              >
                <div className="flex items-center gap-4">
                  {uploadSteps.testCases ? (
                    <CheckCircle className="w-8 h-8 text-green-400" />
                  ) : (
                    <AlertCircle className="w-8 h-8 text-blue-300" />
                  )}
                  <div>
                    <h3 className="font-semibold">Upload Test Cases</h3>
                    <p className="text-sm text-blue-200">Format: PDF, DOCX, atau TXT</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Metadata Section */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white/10 backdrop-blur-xl rounded-2xl p-8"
          >
            <h2 className="text-2xl font-semibold mb-6">Informasi Soal</h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">Mata Kuliah</label>
                <input
                  type="text"
                  className="w-full px-4 py-3 bg-white/5 rounded-xl border border-white/20 focus:border-blue-400 focus:ring-2 focus:ring-blue-400"
                  placeholder="Nama mata kuliah"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Topik</label>
                <input
                  type="text"
                  className="w-full px-4 py-3 bg-white/5 rounded-xl border border-white/20 focus:border-blue-400 focus:ring-2 focus:ring-blue-400"
                  placeholder="Pisahkan dengan koma"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Tingkat Kesulitan</label>
                <select className="w-full px-4 py-3 bg-white/5 rounded-xl border border-white/20 focus:border-blue-400 focus:ring-2 focus:ring-blue-400">
                  <option value="">Pilih tingkat kesulitan</option>
                  <option value="easy">Mudah</option>
                  <option value="medium">Sedang</option>
                  <option value="hard">Sulit</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Deskripsi</label>
                <textarea
                  className="w-full px-4 py-3 bg-white/5 rounded-xl border border-white/20 focus:border-blue-400 focus:ring-2 focus:ring-blue-400"
                  rows="4"
                  placeholder="Deskripsi singkat tentang soal"
                />
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full mt-8 bg-blue-500 text-white py-4 rounded-xl font-semibold hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
            >
              <Upload className="w-5 h-5" />
              Upload Soal
            </motion.button>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default UploadPage;