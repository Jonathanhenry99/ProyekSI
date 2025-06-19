import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from "framer-motion";
import { ArrowLeft, Download, FileText, File, BookOpen } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import axios from 'axios';

const API_URL = "http://localhost:8080/api";

// PDF Viewer Component
const PDFViewer = ({ fileId }) => {
  const [pdfUrl, setPdfUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPDF = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_URL}/files/blob/${fileId}`, {
          responseType: 'blob'
        });
        
        // Create blob URL
        const blob = new Blob([response.data], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        setPdfUrl(url);
        setError(null);
      } catch (err) {
        console.error("Error loading PDF:", err);
        setError("Gagal memuat PDF");
      } finally {
        setLoading(false);
      }
    };

    fetchPDF();

    // Cleanup blob URL when component unmounts
    return () => {
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }
    };
  }, [fileId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[600px] bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[600px] bg-gray-50">
        <FileText className="w-16 h-16 text-red-500 mb-4" />
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="w-full h-[600px] border border-gray-300 rounded-lg overflow-hidden">
      <iframe 
        src={pdfUrl}
        className="w-full h-full"
        title="PDF Viewer"
      />
    </div>
  );
};

// Combined PDF Viewer Component
const CombinedPDFViewer = ({ questionSetId, type = 'questions' }) => {
  const [pdfUrl, setPdfUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCombinedPDF = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_URL}/files/combine-preview/${questionSetId}?type=${type}`, {
          responseType: 'blob'
        });
        
        // Create blob URL
        const blob = new Blob([response.data], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        setPdfUrl(url);
        setError(null);
      } catch (err) {
        console.error(`Error loading ${type} PDF:`, err);
        setError(`Gagal memuat ${type === 'questions' ? 'soal dan test cases' : 'kunci jawaban'}`);
      } finally {
        setLoading(false);
      }
    };

    if (questionSetId) {
      fetchCombinedPDF();
    }

    // Cleanup blob URL when component unmounts
    return () => {
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }
    };
  }, [questionSetId, type]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[600px] bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[600px] bg-gray-50">
        <FileText className="w-16 h-16 text-red-500 mb-4" />
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="w-full h-[600px] border border-gray-300 rounded-lg overflow-hidden">
      <iframe 
        src={pdfUrl}
        className="w-full h-full"
        title={`${type === 'questions' ? 'Soal dan Test Cases' : 'Kunci Jawaban'} Viewer`}
      />
    </div>
  );
};

const QuestionPreview = ({ currentUser }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [questionSet, setQuestionSet] = useState(null);
  const [files, setFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('questions'); // questions, answers, testCases
  const [combinedPdfUrl, setCombinedPdfUrl] = useState(null); // Move this hook here

  useEffect(() => {
    fetchQuestionSetDetails();
  }, [id]);

  // Move this useEffect here, before any conditional returns
  useEffect(() => {
    if (questionSet && questionSet.id) {
      setCombinedPdfUrl(`${API_URL}/files/combine-preview/${questionSet.id}`);
    }
  }, [questionSet]);

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
      return <PDFViewer fileId={file.id} />;
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
  
  // Modifikasi bagian render untuk menampilkan PDF gabungan
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
              <span className={`px-2 py-1 text-xs rounded-full ${
                {
                  'Mudah': 'bg-green-100 text-green-700',
                  'Sedang': 'bg-yellow-100 text-yellow-700',
                  'Sulit': 'bg-red-100 text-red-700'
                }[questionSet.level] || 'bg-gray-100 text-gray-700'
              }`}>
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
        
        {/* PDF Gabungan */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Soal dan Test Cases */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Soal dan Test Cases</h3>
            </div>
            <div className="p-4">
              {questionSet && questionSet.id ? (
                <CombinedPDFViewer questionSetId={questionSet.id} type="questions" />
              ) : (
                <div className="flex items-center justify-center p-10">
                  <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              )}
            </div>
          </div>

          {/* Kunci Jawaban */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Kunci Jawaban</h3>
            </div>
            <div className="p-4">
              {questionSet && questionSet.id ? (
                <CombinedPDFViewer questionSetId={questionSet.id} type="answers" />
              ) : (
                <div className="flex items-center justify-center p-10">
                  <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              )}
            </div>
          </div>
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
                  {/* File History Table */}
                  <div className="mt-4">
                    <h4 className="text-md font-semibold mb-2 text-gray-800">Riwayat File</h4>
                    <table className="min-w-max w-full table-auto text-sm border border-gray-200 rounded-lg overflow-hidden">
                      <tbody>
                        <tr className="border-b border-gray-100">
                          <td className="px-3 py-2 font-medium text-gray-600">Dibuat</td>
                          <td className="px-3 py-2 text-gray-800">{file.created_at ? new Date(file.created_at).toLocaleString('id-ID', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-'}</td>
                        </tr>
                        <tr>
                          <td className="px-3 py-2 font-medium text-gray-600">Terakhir Diperbarui</td>
                          <td className="px-3 py-2 text-gray-800">{file.updated_at ? new Date(file.updated_at).toLocaleString('id-ID', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-'}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
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