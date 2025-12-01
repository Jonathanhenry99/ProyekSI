// src/pages/QuestionSetsPreview.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  ArrowLeft, 
  AlertTriangle, 
  BookOpen, 
  User, 
  Clock, 
  FileText, 
  Eye, 
  XCircle,
  Trash2,
  Calendar,
  Download,
  Info,
  CheckCircle2,
  X
} from "lucide-react";
import { AnimatePresence } from "framer-motion"; 
import Header from "../components/Header";
import Footer from "../components/Footer";

const API_URL = "http://localhost:8080/api";

const QuestionSetsPreview = ({ currentUser }) => {
  const { id: packageId } = useParams();
  const navigate = useNavigate();
  const [questionPackage, setQuestionPackage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [deleteModal, setDeleteModal] = useState({ show: false });
  const [deleting, setDeleting] = useState(false);
  
  // State untuk overlay notification
  const [notification, setNotification] = useState({
    show: false,
    message: '',
    type: 'info' // 'success', 'error', 'warning', 'info'
  });

  // Cek login
  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsAuthenticated(!!token);
  }, []);

  // Fetch paket soal dan daftar soalnya
  useEffect(() => {
    if (!packageId || packageId === 'undefined' || packageId === 'null') {
      setFetchError("ID paket soal tidak valid atau tidak ditemukan di URL.");
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      setFetchError(null);
      
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_URL}/question-packages/${packageId}`, {
          headers: { "x-access-token": token },
        });

        if (res.status === 404) {
          throw new Error("Paket soal tidak ditemukan di server (404).");
        }
        if (res.status === 401 || res.status === 403) {
          throw new Error("Anda tidak memiliki izin untuk melihat paket ini. Silakan login ulang.");
        }
        
        if (!res.ok) {
          throw new Error(`Gagal mengambil data (${res.status}).`);
        }

        const data = await res.json();
        setQuestionPackage(data);

      } catch (err) {
        console.error("❌ Error fetching package:", err);
        setFetchError(err.message || "Terjadi kesalahan yang tidak diketahui.");
        setQuestionPackage(null);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [packageId]);

  // Fungsi untuk membuka modal konfirmasi delete
  const openDeleteModal = () => {
    setDeleteModal({ show: true });
  };

  // Fungsi untuk menutup modal
  const closeDeleteModal = () => {
    setDeleteModal({ show: false });
  };

  // Helper function to show notification overlay
  const showNotification = (message, type = 'info') => {
    setNotification({
      show: true,
      message: message,
      type: type
    });
    
    // Auto hide after 5 seconds for success/info, 7 seconds for error/warning
    const duration = (type === 'error' || type === 'warning') ? 7000 : 5000;
    setTimeout(() => {
      setNotification(prev => ({ ...prev, show: false }));
    }, duration);
  };

  // Fungsi untuk delete paket soal
  const handleDeletePackage = async () => {
    setDeleting(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${API_URL}/question-packages/${packageId}`,
        {
          method: 'DELETE',
          headers: { 
            "x-access-token": token,
            "Content-Type": "application/json"
          },
        }
      );

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Gagal menghapus paket soal');
      }

      // Redirect ke halaman daftar paket soal setelah berhasil delete
      navigate("/question-sets", { 
        state: { message: "Paket soal berhasil dihapus" } 
      });

    } catch (err) {
      console.error("❌ Error deleting package:", err);
      showNotification(err.message || 'Gagal menghapus paket soal. Silakan coba lagi.', 'error');
      closeDeleteModal();
    } finally {
      setDeleting(false);
    }
  };

  const handleBack = () => navigate("/question-sets");

  // Cek apakah user adalah pembuat paket atau admin
  const canDelete = currentUser && (
    currentUser.id === questionPackage?.created_by || 
    currentUser.role === 'ROLE_ADMIN'
  );

  // --- RENDERING KONDISIONAL ---

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

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
        {/* Tombol kembali dan Delete */}
        <div className="mb-6 flex items-center justify-between">
          <button
            onClick={handleBack}
            className="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
          >
            <ArrowLeft size={20} className="mr-1" />
            Kembali ke daftar paket soal
          </button>
          
          {canDelete && (
            <button
              onClick={openDeleteModal}
              className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors shadow-sm"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Hapus Paket Soal
            </button>
          )}
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

        {/* Header Paket Soal */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8 border border-gray-200">
          {/* Header dengan Title */}
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
            <h1 className="text-xl font-bold text-gray-900">{questionPackage.title}</h1>
            <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
              Lengkap
            </span>
          </div>

          {/* Content */}
          <div className="p-6">
            <p className="text-gray-700 mb-4">{questionPackage.description || "Tidak ada deskripsi."}</p>
            
            {/* Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="flex items-center text-sm text-gray-600">
                <BookOpen className="w-4 h-4 mr-2 text-gray-400" />
                <span className="font-medium mr-2">Mata Kuliah:</span>
                <span>{questionPackage.course?.name || "Tanpa Mata Kuliah"}</span>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <User className="w-4 h-4 mr-2 text-gray-400" />
                <span className="font-medium mr-2">Pembuat:</span>
                <span>{questionPackage.creator?.full_name || "Tidak diketahui"}</span>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Clock className="w-4 h-4 mr-2 text-gray-400" />
                <span className="font-medium mr-2">Dibuat:</span>
                <span>
                  {questionPackage.created_at
                    ? new Date(questionPackage.created_at).toLocaleDateString("id-ID", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })
                    : "Tanggal tidak tersedia"}
                </span>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Download className="w-4 h-4 mr-2 text-gray-400" />
                <span className="font-medium mr-2">Unduhan:</span>
                <span>{questionPackage.downloads || 0} kali</span>
              </div>
            </div>

            {/* Tags jika ada */}
            {questionPackage.topics && (
              <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-100">
                {questionPackage.topics.split(',').map((topic, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-md"
                  >
                    {topic.trim()}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Section Title untuk Daftar Soal */}
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Daftar Soal ({questions.length})
          </h2>
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
                className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200"
              >
                {/* Header Card */}
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
                  <h3 className="text-base font-semibold text-gray-900">
                    Soal {index + 1}: {q.title}
                  </h3>
                  <span
                    className={`px-2.5 py-1 text-xs font-medium rounded-full ${
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

                {/* Content Card */}
                <div className="p-6">
                  {/* Informasi Detail */}
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <BookOpen className="w-4 h-4 mr-2 text-gray-400" />
                      <span className="font-medium mr-2">Mata Kuliah:</span>
                      <span>{questionPackage.course?.name || "Tidak ada"}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <User className="w-4 h-4 mr-2 text-gray-400" />
                      <span className="font-medium mr-2">Pembuat:</span>
                      <span>{q.lecturer || questionPackage.creator?.full_name || "Tidak diketahui"}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                      <span className="font-medium mr-2">Tanggal:</span>
                      <span>
                        {q.created_at 
                          ? new Date(q.created_at).toLocaleDateString("id-ID", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })
                          : "Tidak tersedia"}
                      </span>
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {q.course_tags?.map((tag) => (
                      <span
                        key={tag.id}
                        className="px-2.5 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-md"
                      >
                        {tag.name}
                      </span>
                    ))}
                    {q.material_tags?.map((tag) => (
                      <span
                        key={tag.id}
                        className="px-2.5 py-1 bg-purple-50 text-purple-700 text-xs font-medium rounded-md"
                      >
                        {tag.name}
                      </span>
                    ))}
                  </div>

                  {/* Action Button */}
                  <div className="flex justify-end pt-4 border-t border-gray-100">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => navigate(`/preview/${q.id}`)}
                      className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Lihat Detail
                    </motion.button>
                  </div>
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

      {/* Modal Konfirmasi Delete Paket */}
      {deleteModal.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6"
          >
            <div className="flex items-start mb-4">
              <div className="shrink-0 w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div className="ml-4 flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Konfirmasi Hapus Paket Soal
                </h3>
                <p className="text-sm text-gray-600">
                  Apakah Anda yakin ingin menghapus paket soal <strong>"{questionPackage.title}"</strong>?
                </p>
                <p className="text-sm text-red-600 mt-2 font-medium">
                  ⚠️ Semua soal di dalam paket ini juga akan terhapus!
                </p>
                <p className="text-sm text-red-600 mt-1">
                  Tindakan ini tidak dapat dibatalkan!
                </p>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={closeDeleteModal}
                disabled={deleting}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Batal
              </button>
              <button
                onClick={handleDeletePackage}
                disabled={deleting}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center"
              >
                {deleting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                    Menghapus...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4 mr-1" />
                    Hapus Paket
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Notification Overlay */}
      <AnimatePresence>
        {notification.show && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.9 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="fixed top-4 right-4 z-[100] max-w-md"
          >
            <motion.div
              className={`rounded-lg shadow-2xl border-2 p-4 backdrop-blur-sm ${
                notification.type === 'success'
                  ? 'bg-green-50 border-green-200 text-green-900'
                  : notification.type === 'error'
                  ? 'bg-red-50 border-red-200 text-red-900'
                  : notification.type === 'warning'
                  ? 'bg-yellow-50 border-yellow-200 text-yellow-900'
                  : 'bg-blue-50 border-blue-200 text-blue-900'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-0.5">
                  {notification.type === 'success' && (
                    <CheckCircle2 className="w-6 h-6 text-green-600" />
                  )}
                  {notification.type === 'error' && (
                    <XCircle className="w-6 h-6 text-red-600" />
                  )}
                  {notification.type === 'warning' && (
                    <AlertTriangle className="w-6 h-6 text-yellow-600" />
                  )}
                  {notification.type === 'info' && (
                    <Info className="w-6 h-6 text-blue-600" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium whitespace-pre-line break-words">
                    {notification.message}
                  </p>
                </div>
                <button
                  onClick={() => setNotification(prev => ({ ...prev, show: false }))}
                  className={`flex-shrink-0 p-1 rounded-full hover:bg-opacity-20 transition-colors ${
                    notification.type === 'success'
                      ? 'text-green-600 hover:bg-green-200'
                      : notification.type === 'error'
                      ? 'text-red-600 hover:bg-red-200'
                      : notification.type === 'warning'
                      ? 'text-yellow-600 hover:bg-yellow-200'
                      : 'text-blue-600 hover:bg-blue-200'
                  }`}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
};

export default QuestionSetsPreview;