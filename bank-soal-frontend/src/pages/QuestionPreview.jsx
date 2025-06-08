import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from "framer-motion";
import { ArrowLeft, Download, FileText, File, BookOpen } from 'lucide-react';
import Header from '../components/Footer';
import Footer from '../components/Footer';
import axios from 'axios';

const API_URL = "http://localhost:8080/api";

const QuestionPreview = ({ currentUser }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [questionSet, setQuestionSet] = useState(null);
  const [files, setFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('questions'); // questions, answers, testCases

  useEffect(() => {
    fetchQuestionSetDetails();
  }, [id]);

  const fetchQuestionSetDetails = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`${API_URL}/questionsets/${id}`);
      setQuestionSet(response.data);
      
      // Kelompokkan file berdasarkan kategori
      const filesByCategory = {};
      response.data.files.forEach(file => {
        if (!filesByCategory[file.filecategory]) {
          filesByCategory[file.filecategory] = [];
        }
        filesByCategory[file.filecategory].push(file);
      });
      
      setFiles(filesByCategory);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching question set details:", error);
      setIsLoading(false);
    }
  };

  const handleDownload = (fileId) => {
    window.open(`${API_URL}/files/download/${fileId}`, '_blank');
  };

  const handleBack = () => {
    navigate(-1);
  };

  // Fungsi untuk menampilkan preview file berdasarkan tipe
  const renderFilePreview = (file) => {
    const fileExtension = file.filetype.toLowerCase();
    
    if (fileExtension === 'pdf') {
      return (
        <div className="w-full h-[600px] border border-gray-300 rounded-lg overflow-hidden">
          <iframe 
            src={`${API_URL}/files/download/${file.id}`} 
            className="w-full h-full"
            title={file.originalname}
          />
        </div>
      );
    } else if (fileExtension === 'docx' || fileExtension === 'doc') {
      // DOCX tidak dapat di-preview langsung di browser
      return (
        <div className="flex flex-col items-center justify-center p-10 border border-gray-300 rounded-lg">
          <File size={64} className="text-blue-500 mb-4" />
          <p className="text-lg font-medium mb-2">{file.originalname}</p>
          <p className="text-gray-500 mb-4">File Microsoft Word tidak dapat ditampilkan secara langsung</p>
          <button
            onClick={() => handleDownload(file.id)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Download untuk melihat
          </button>
        </div>
      );
    } else if (fileExtension === 'txt') {
      // Untuk file TXT, kita bisa fetch kontennya dan tampilkan
      return (
        <div className="w-full min-h-[300px] p-4 border border-gray-300 rounded-lg bg-gray-50 font-mono whitespace-pre-wrap">
          <TxtFileViewer fileId={file.id} />
        </div>
      );
    } else {
      // Untuk tipe file lainnya
      return (
        <div className="flex flex-col items-center justify-center p-10 border border-gray-300 rounded-lg">
          <FileText size={64} className="text-gray-500 mb-4" />
          <p className="text-lg font-medium mb-2">{file.originalname}</p>
          <p className="text-gray-500 mb-4">Tipe file tidak didukung untuk preview</p>
          <button
            onClick={() => handleDownload(file.id)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Download File
          </button>
        </div>
      );
    }
  };

  // Komponen untuk menampilkan isi file TXT
  const TxtFileViewer = ({ fileId }) => {
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      const fetchTxtContent = async () => {
        try {
          const response = await axios.get(`${API_URL}/files/download/${fileId}`, {
            responseType: 'text'
          });
          setContent(response.data);
        } catch (error) {
          console.error("Error fetching TXT content:", error);
          setContent('Error loading file content');
        } finally {
          setLoading(false);
        }
      };

      fetchTxtContent();
    }, [fileId]);

    if (loading) return <p>Loading content...</p>;
    return <div>{content}</div>;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!questionSet) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <p className="text-xl text-gray-700 mb-4">Soal tidak ditemukan</p>
        <button
          onClick={handleBack}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Kembali
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header currentUser={currentUser} />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header dan navigasi kembali */}
        <div className="mb-6">
          <button
            onClick={handleBack}
            className="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
          >
            <ArrowLeft size={20} className="mr-1" />
            Kembali ke pencarian
          </button>
        </div>
        
        {/* Judul dan informasi soal */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{questionSet.title}</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="flex items-center text-gray-700">
              <BookOpen size={18} className="mr-2" />
              <span>{questionSet.subject}</span>
            </div>
            <div className="flex items-center text-gray-700">
              <span className="font-medium mr-2">Tingkat Kesulitan:</span>
              <span className={`px-2 py-1 text-xs rounded-full ${{
                'Mudah': 'bg-green-100 text-green-700',
                'Sedang': 'bg-yellow-100 text-yellow-700',
                'Sulit': 'bg-red-100 text-red-700'
              }[questionSet.level] || 'bg-gray-100 text-gray-700'}`}>
                {questionSet.level}
              </span>
            </div>
            <div className="flex items-center text-gray-700">
              <span className="font-medium mr-2">Tahun:</span>
              <span>{questionSet.year}</span>
            </div>
          </div>
          
          {questionSet.description && (
            <div className="mt-4">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Deskripsi</h3>
              <p className="text-gray-700">{questionSet.description}</p>
            </div>
          )}
        </div>
        
        {/* Tab untuk navigasi antar kategori file */}
        <div className="flex border-b border-gray-200 mb-6">
          <button
            className={`px-4 py-2 font-medium ${activeTab === 'questions' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('questions')}
          >
            Soal
          </button>
          <button
            className={`px-4 py-2 font-medium ${activeTab === 'answers' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('answers')}
          >
            Jawaban
          </button>
          <button
            className={`px-4 py-2 font-medium ${activeTab === 'testCases' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('testCases')}
          >
            Test Cases
          </button>
        </div>
        
        {/* Konten file berdasarkan tab aktif */}
        <div className="space-y-6">
          {files[activeTab] && files[activeTab].length > 0 ? (
            files[activeTab].map((file, index) => (
              <div key={file.id} className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                  <h3 className="text-lg font-medium text-gray-900">{file.originalname}</h3>
                  <button
                    onClick={() => handleDownload(file.id)}
                    className="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    <Download size={18} className="mr-1" />
                    Download
                  </button>
                </div>
                <div className="p-4">
                  {renderFilePreview(file)}
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white rounded-xl shadow-md p-6 text-center">
              <p className="text-gray-500">Tidak ada file {activeTab === 'questions' ? 'soal' : activeTab === 'answers' ? 'jawaban' : 'test cases'} yang tersedia</p>
            </div>
          )}
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default QuestionPreview;