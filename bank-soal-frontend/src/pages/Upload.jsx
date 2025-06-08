import React, { useState } from 'react';
import { motion } from "framer-motion";
import { Upload, File, CheckCircle, X, AlertCircle, User, Calendar, Tag, ChevronDown } from 'lucide-react';
import LogoIF from '../assets/LogoIF.jpg';
import LogoUnpar from '../assets/LogoUnpar.png';
import Footer from '../components/Footer';
import Header from '../components/Header';
import axios from 'axios';

const API_URL = "http://localhost:8080/api";

const UploadPage = ({ currentUser }) => {
  const [files, setFiles] = useState({
    questions: null,
    answers: null,
    testCases: null
  });

  const [uploadStatus, setUploadStatus] = useState({
    questions: null,
    answers: null,
    testCases: null
  });

  const [metadata, setMetadata] = useState({
    title: '',
    subject: '',
    topics: '',
    difficulty: '',
    description: '',
    year: new Date().getFullYear(),
    lecturer: currentUser?.name || ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleFileChange = (e, type) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      // Validasi tipe file
      const validTypes = ['.pdf', '.docx', '.txt'];
      const fileExt = selectedFile.name.substring(selectedFile.name.lastIndexOf('.')).toLowerCase();
      
      if (!validTypes.includes(fileExt)) {
        setUploadStatus(prev => ({
          ...prev,
          [type]: 'error'
        }));
        setError(`Format file ${fileExt} tidak didukung. Gunakan PDF, DOCX, atau TXT.`);
        return;
      }
      
      setFiles(prev => ({
        ...prev,
        [type]: selectedFile
      }));
      
      setUploadStatus(prev => ({
        ...prev,
        [type]: 'ready'
      }));
      
      setError(null);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setMetadata(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async () => {
    // Validasi input
    if (!files.questions) {
      setError("Silakan upload file soal terlebih dahulu!");
      return;
    }
    
    if (!metadata.title || !metadata.subject || !metadata.difficulty) {
      setError("Judul, mata kuliah, dan tingkat kesulitan harus diisi!");
      return;
    }
    
    // Validasi token - PERBAIKAN DI SINI
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
      // 1. Buat question set baru
      // Dalam handleSubmit
      const questionSetResponse = await axios.post(
        `${API_URL}/questionsets`,
        {
          title: metadata.title,
          subject: metadata.subject,
          difficulty: metadata.difficulty, // Ini akan dipetakan ke 'level' di backend
          year: metadata.year,
          lecturer: metadata.lecturer,
          topics: metadata.topics,
          description: metadata.description,
          lastupdated: new Date() // Gunakan huruf kecil untuk konsistensi
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'x-access-token': token
          }
        }
      );
      
      const questionSetId = questionSetResponse.data.questionSet.id;
      
      // 2. Upload files
      const uploadPromises = [];
      
      for (const [category, file] of Object.entries(files)) {
        if (file) {
          const formData = new FormData();
          formData.append('file', file);
          formData.append('questionSetId', questionSetId);
          formData.append('fileCategory', category);
          
          uploadPromises.push(
            axios.post(`${API_URL}/files/upload`, formData, {
              headers: {
                'Content-Type': 'multipart/form-data',
                'x-access-token': token
              }
            })
          );
        }
      }
      
      await Promise.all(uploadPromises);
      
      setSuccess("Soal berhasil diupload!");
      
      // Reset form
      setFiles({
        questions: null,
        answers: null,
        testCases: null
      });
      
      setUploadStatus({
        questions: null,
        answers: null,
        testCases: null
      });
      
      setMetadata({
        title: '',
        subject: '',
        topics: '',
        difficulty: '',
        description: '',
        year: new Date().getFullYear(),
        lecturer: currentUser?.name || ''
      });
      
    } catch (error) {
      console.error("Upload error:", error);
      if (error.response?.status === 403) {
        setError("Akses ditolak. Silakan login kembali untuk mendapatkan token yang valid.");
      } else {
        setError(error.response?.data?.message || "Terjadi kesalahan saat mengupload soal.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Render file input
  const renderFileInput = (type, label, description, icon) => {
    const IconComponent = icon;
    const status = uploadStatus[type];
    
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
            accept=".pdf,.docx,.txt"
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
                className="p-1 rounded-full bg-gray-200 hover:bg-gray-300"
                onClick={() => {
                  setFiles(prev => ({ ...prev, [type]: null }));
                  setUploadStatus(prev => ({ ...prev, [type]: null }));
                }}
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-blue-50">
      <Header currentUser={currentUser} />
      <div className="container mx-auto px-4 py-8">
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
          {/* File Upload Section */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-2xl p-8 shadow-lg"
          >
            <h2 className="text-2xl font-semibold mb-6 text-gray-900">Upload Files</h2>

            {renderFileInput('questions', 'Upload Soal', 'Format: PDF, DOCX, atau TXT', Upload)}
            {renderFileInput('answers', 'Upload Kunci Jawaban', 'Format: PDF, DOCX, atau TXT', File)}
            {renderFileInput('testCases', 'Upload Test Cases', 'Format: PDF, DOCX, atau TXT', AlertCircle)}
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
                <input
                  type="text"
                  name="subject"
                  value={metadata.subject}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  placeholder="Nama mata kuliah"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Topik</label>
                <input
                  type="text"
                  name="topics"
                  value={metadata.topics}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  placeholder="Pisahkan dengan koma"
                />
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

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Dosen</label>
                <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 rounded-xl border border-gray-300">
                  <User className="w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    name="lecturer"
                    value={metadata.lecturer}
                    onChange={handleInputChange}
                    className="flex-1 bg-transparent border-none focus:ring-0"
                    placeholder="Nama dosen"
                  />
                </div>
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
              className="w-full mt-8 bg-blue-600 text-white py-4 rounded-xl font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
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
                  <Upload className="w-5 h-5" />
                  Upload Soal
                </>
              )}
            </motion.button>
          </motion.div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default UploadPage;