// src/pages/QuestionSetsPreview.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
// Pastikan Anda mengimpor XCircle untuk tampilan error
import { ArrowLeft, AlertTriangle, BookOpen, User, Clock, FileText, Eye, XCircle } from "lucide-react"; 
import Header from "../components/Header";
import Footer from "../components/Footer";

const API_URL = "http://localhost:8080/api";

const QuestionSetsPreview = ({ currentUser }) => {
  const { id: packageId } = useParams();
  const navigate = useNavigate();
  const [questionPackage, setQuestionPackage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null); // DEKLARASI fetchError
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Cek login
  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsAuthenticated(!!token);
  }, []);

  // Fetch paket soal dan daftar soalnya
  useEffect(() => {
    // 1. Validasi ID di Frontend sebelum Fetch
    if (!packageId || packageId === 'undefined' || packageId === 'null') {
        setFetchError("ID paket soal tidak valid atau tidak ditemukan di URL.");
        setLoading(false);
        return; // Hentikan proses fetch
    }

    const fetchData = async () => {
        setLoading(true);
        setFetchError(null); // Reset state error sebelum fetch baru
        
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`${API_URL}/question-packages/${packageId}`, {
                headers: { "x-access-token": token },
            });

            // 2. Penanganan Status HTTP Spesifik
            if (res.status === 404) {
                throw new Error("Paket soal tidak ditemukan di server (404).");
            }
            if (res.status === 401 || res.status === 403) {
                // Tangani kasus token tidak valid atau izin ditolak
                throw new Error("Anda tidak memiliki izin untuk melihat paket ini. Silakan login ulang.");
            }
            
            if (!res.ok) {
                throw new Error(`Gagal mengambil data (${res.status}).`);
            }

            const data = await res.json();
            setQuestionPackage(data);

        } catch (err) {
            console.error("❌ Error fetching package:", err);
            // 3. Simpan Pesan Error ke State
            setFetchError(err.message || "Terjadi kesalahan yang tidak diketahui.");
            setQuestionPackage(null); // Pastikan data paket dihapus saat error
        } finally {
            setLoading(false);
        }
    };

    fetchData();
  }, [packageId]); // packageId sebagai dependency sudah benar

  const handleBack = () => navigate("/question-sets");

  // --- RENDERING KONDISIONAL ---

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Tampilkan error jika fetchError disetel
  if (fetchError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 text-gray-600 p-4">
        <XCircle className="w-16 h-16 mb-4 text-red-500" /> 
        <p className="text-lg font-semibold text-gray-800 mb-2">Gagal Memuat Paket Soal</p>
        <p className="text-center mb-4 text-sm text-red-600">
            **Pesan Kesalahan:** {fetchError}
        </p>
        <button
          onClick={handleBack}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <ArrowLeft size={16} className="inline mr-1" /> Kembali ke Daftar
        </button>
      </div>
    );
  }
  
  // Fallback: Tampilkan Not Found jika questionPackage null (setelah loading dan error dicek)
  if (!questionPackage) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 text-gray-600">
        <FileText className="w-16 h-16 mb-4 text-gray-400" />
        <p>Paket soal tidak ditemukan.</p>
        <button
          onClick={handleBack}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Kembali
        </button>
      </div>
    );
  }

  const questions = questionPackage.items?.map((item) => item.question) || [];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header currentUser={currentUser} />

      <div className="container mx-auto px-4 py-8">
        {/* Tombol kembali */}
        <div className="mb-6">
          <button
            onClick={handleBack}
            className="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
          >
            <ArrowLeft size={20} className="mr-1" />
            Kembali ke daftar paket soal
          </button>
        </div>

        {/* Auth warning */}
        {!isAuthenticated && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start">
              <AlertTriangle className="w-5 h-5 text-red-600 mr-3 mt-0.5" />
              <div>
                <h3 className="text-red-800 font-semibold mb-2">Authentication Required</h3>
                <p className="text-red-700 mb-3">
                  Anda belum login. Silakan login terlebih dahulu untuk melihat detail soal.
                </p>
                <button
                  onClick={() => navigate("/login")}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                >
                  Login Sekarang
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Header paket */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900">{questionPackage.title}</h1>
            <div className="flex items-center text-gray-500 mt-2 md:mt-0">
              <Clock className="w-4 h-4 mr-2" />
              {questionPackage.created_at
                ? new Date(questionPackage.created_at).toLocaleDateString("id-ID", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })
                : "Tanggal tidak tersedia"}
            </div>
          </div>
          <p className="text-gray-700 mb-3">{questionPackage.description || "Tidak ada deskripsi."}</p>
          <div className="flex flex-wrap gap-2 text-sm text-gray-600">
            <div className="flex items-center">
              <BookOpen className="w-4 h-4 mr-1 text-blue-600" />
              <span>{questionPackage.course?.name || "Tanpa Mata Kuliah"}</span>
            </div>
            <div className="flex items-center ml-4">
              <User className="w-4 h-4 mr-1 text-blue-600" />
              <span>{questionPackage.creator?.full_name || "Tidak diketahui"}</span>
            </div>
          </div>
        </div>

        {/* Daftar Soal */}
        <div className="space-y-6">
          {questions.length > 0 ? (
            questions.map((q, index) => (
              <motion.div
                key={q.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-xl shadow-md p-6 border border-gray-200"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 mb-1">
                      Soal {index + 1}: {q.title}
                    </h2>
                    <p className="text-gray-700 text-sm line-clamp-3">{q.description}</p>
                  </div>
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      q.level === "Mudah"
                        ? "bg-green-100 text-green-700"
                        : q.level === "Sedang"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {q.level}
                  </span>
                </div>

                <div className="flex justify-between items-center mt-4">
                  <span className="text-sm text-gray-500">
                    Dibuat oleh: {q.lecturer || questionPackage.creator?.full_name || "Tidak diketahui"}
                  </span>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    // PERBAIKAN: Menggunakan path /preview/:id
                    onClick={() => navigate(`/preview/${q.id}`)}
                    className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                  >
                    <Eye className="w-4 h-4 mr-1" /> Lihat Detail
                  </motion.button>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="bg-white rounded-xl shadow-md p-6 text-center">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Belum ada soal di dalam paket ini.</p>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default QuestionSetsPreview;