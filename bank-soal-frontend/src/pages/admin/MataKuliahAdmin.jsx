import React, { useState, useEffect, useCallback } from 'react';
import { Search, Plus, User, LogOut, Edit, Trash2, Save, X, Tag, Filter, AlertCircle, CheckCircle } from 'lucide-react'; // Mengganti BookOpen, Code, GraduationCap dengan Tag
import { BrowserRouter as Router, Link, useNavigate } from 'react-router-dom';
import axios from 'axios'; // Menggunakan Axios untuk permintaan HTTP
import AuthService from '../../services/auth.service'; // Assuming this path is correct

// Base URL untuk API Anda, sekarang menunjuk ke endpoint tags
const API_URL = "http://localhost:8080/api/course-tags/"; // Sesuai dengan route backend Anda

const MataKuliahAdmin = ({ currentUser }) => {
  const navigate = useNavigate();
  const [currentView, setCurrentView] = useState('daftar');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [sortBy, setSortBy] = useState('name'); // Mengurutkan berdasarkan nama tag
  const [sortOrder, setSortOrder] = useState('asc');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [notification, setNotification] = useState(null);
  const [loading, setLoading] = useState(true); // Mulai dengan loading true
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    name: '', // Hanya perlu field 'name' untuk tag
  });

  const [formErrors, setFormErrors] = useState({});

  const [tagList, setTagList] = useState([]); // Mengubah nama state dari mataKuliahList menjadi tagList

  // Show notification
  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // Fungsi untuk mendapatkan header otentikasi
  const getAuthHeaders = () => {
    const user = AuthService.getCurrentUser();
    return user && user.accessToken ? { 'x-access-token': user.accessToken } : {};
  };

  // Fungsi untuk mengambil tag dari API
  const fetchTags = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const headers = getAuthHeaders();
      if (Object.keys(headers).length === 0) {
        console.warn('No authentication token found. Proceeding without x-access-token header.');
        // Jika backend Anda sangat ketat dan mengembalikan 401/403 tanpa token
        // Anda mungkin perlu me-redirect atau menampilkan pesan error khusus di sini.
        // navigate('/login'); // Uncomment ini jika Anda ingin memaksa login
        // return;
      }

      const response = await axios.get(API_URL, { headers });
      setTagList(response.data); // Mengisi tagList dengan data dari API
      showNotification('Daftar tag berhasil dimuat', 'success');
    } catch (err) {
      console.error("Failed to fetch tags:", err);
      const errorMessage = err.response?.data?.message || "Gagal memuat tag. Silakan coba lagi.";
      setError(errorMessage);
      showNotification(errorMessage, 'error');
      if (err.response?.status === 401 || err.response?.status === 403) {
        AuthService.logout();
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  // Muat data saat komponen mount
  useEffect(() => {
    fetchTags();
  }, [fetchTags]);

  // Validate form
  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) {
      errors.name = 'Nama tag harus diisi';
    } else {
      // Check for duplicate name (case-insensitive)
      const isDuplicate = tagList.some(tag =>
        tag.name.toLowerCase() === formData.name.toLowerCase() && tag.id !== editingId
      );
      if (isDuplicate) {
        errors.name = 'Nama tag sudah digunakan';
      }
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Filter and sort tags
  const filteredAndSortedTags = tagList
    .filter(tag =>
      tag.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      const aValue = a[sortBy];
      const bValue = b[sortBy];
      const comparison = aValue.toString().localeCompare(bValue.toString());
      return sortOrder === 'asc' ? comparison : -comparison;
    });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    setError(null);
    try {
      const headers = getAuthHeaders();
      if (Object.keys(headers).length === 0) {
        showNotification('Anda perlu login untuk melakukan aksi ini.', 'error');
        setLoading(false);
        navigate('/login');
        return;
      }

      const payload = { name: formData.name }; // Payload hanya 'name'

      if (currentView === 'edit' && editingId) {
        await axios.put(`${API_URL}${editingId}`, payload, { headers });
        showNotification('Tag berhasil diperbarui', 'success');
      } else {
        await axios.post(API_URL, payload, { headers });
        showNotification('Tag berhasil ditambahkan', 'success');
      }

      resetForm();
      fetchTags(); // Re-fetch data to show the updated list
    } catch (err) {
      console.error("Error submitting form:", err);
      const errorMessage = err.response?.data?.message || "Terjadi kesalahan saat menyimpan tag.";
      setError(errorMessage);
      showNotification(errorMessage, 'error');
      if (err.response?.status === 401 || err.response?.status === 403) {
        AuthService.logout();
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({ name: '' }); // Reset hanya field name
    setFormErrors({});
    setEditingId(null);
    setCurrentView('daftar');
  };

  const handleEdit = (id) => {
    const tag = tagList.find(t => t.id === id);
    if (tag) {
      setFormData({
        name: tag.name, // Mengisi form dengan nama tag
      });
      setEditingId(id);
      setCurrentView('edit');
    }
  };

  const handleDelete = async (id) => {
    setLoading(true);
    setError(null);
    try {
      const headers = getAuthHeaders();
      if (Object.keys(headers).length === 0) {
        showNotification('Anda perlu login untuk melakukan aksi ini.', 'error');
        setLoading(false);
        navigate('/login');
        return;
      }

      await axios.delete(`${API_URL}${id}`, { headers });
      showNotification('Tag berhasil dihapus', 'success');
      fetchTags(); // Re-fetch data to show the updated list
    } catch (err) {
      console.error("Error deleting tag:", err);
      const errorMessage = err.response?.data?.message || "Terjadi kesalahan saat menghapus tag.";
      setError(errorMessage);
      showNotification(errorMessage, 'error');
      if (err.response?.status === 401 || err.response?.status === 403) {
        AuthService.logout();
        navigate('/login');
      }
    } finally {
      setLoading(false);
      setShowDeleteConfirm(null); // Tutup modal konfirmasi
    }
  };

  const handleLogout = () => {
    AuthService.logout();
    navigate('/login');
  };

  // Notification Component
  const Notification = () => {
    if (!notification) return null;

    return (
      <div className="fixed top-4 right-4 z-50">
        <div className={`flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg border ${notification.type === 'success'
            ? 'bg-green-50 text-green-800 border-green-200'
            : 'bg-red-50 text-red-800 border-red-200'
          }`}>
          {notification.type === 'success' ? (
            <CheckCircle className="w-5 h-5" />
          ) : (
            <AlertCircle className="w-5 h-5" />
          )}
          <span className="font-medium">{notification.message}</span>
        </div>
      </div>
    );
  };

  // Delete Confirmation Modal
  const DeleteConfirmModal = () => {
    if (!showDeleteConfirm) return null;

    const tagToDelete = tagList.find(t => t.id === showDeleteConfirm);

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <Trash2 className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Hapus Tag Mata Kuliah</h3>
              <p className="text-sm text-gray-500">Aksi ini tidak dapat dibatalkan</p>
            </div>
          </div>

          <p className="text-gray-700 mb-6">
            Apakah Anda yakin ingin menghapus tag <strong>"{tagToDelete?.name}"</strong>?
          </p>

          <div className="flex gap-3">
            <button
              onClick={() => setShowDeleteConfirm(null)}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Batal
            </button>
            <button
              onClick={() => handleDelete(showDeleteConfirm)}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Hapus
            </button>
          </div>
        </div>
      </div>
    );
  };

  const Header = () => (
    <header className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="grid grid-cols-3 items-center">
          <div className="flex items-center space-x-3">
            <img
              src="/src/assets/LogoIF.jpg"
              alt="Logo Informatika UNPAR"
              className="h-10 w-auto"
            />
          </div>
          
          <nav className="flex justify-center space-x-8">
            <Link to="/admin/dosen" className="text-gray-600 hover:text-gray-900 transition-colors font-medium px-2 py-1">
              Dosen
            </Link>
            <Link to="/admin/mata-kuliah" className="text-blue-600 font-semibold relative px-2 py-1">
              Mata Kuliah
               <div className="absolute -bottom-4 left-0 right-0 h-0.5 bg-blue-600 rounded-full"></div>
            </Link>
            <Link to="/admin/tagging" className="text-gray-600 hover:text-gray-900 transition-colors font-medium px-2 py-1">
              Tagging
            </Link>
            <Link to="/admin/course-tagging" className="text-gray-600 hover:text-gray-900 transition-colors font-medium px-2 py-1  ">
              Tagging Mata Kuliah
             
            </Link>
          </nav>
            
          <div className="flex items-center justify-end space-x-4">
            <span className="text-gray-700 font-medium">{currentUser?.username || 'Admin'}</span>
            <div className="flex items-center space-x-2">
              <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              <button
                onClick={handleLogout}
                className="p-2 text-gray-500 hover:text-gray-700 transition-colors rounded-lg hover:bg-gray-100"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
  
  // Stats Cards
  const StatsCards = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-blue-600 text-sm font-medium">Total Tag</p>
            <p className="text-2xl font-bold text-blue-900">{tagList.length}</p>
          </div>
          <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
            <Tag className="w-6 h-6 text-white" />
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl border border-green-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-green-600 text-sm font-medium">Tag Aktif</p>
            <p className="text-2xl font-bold text-green-900">{tagList.length}</p> {/* Asumsi semua tag aktif */}
          </div>
          <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
            <CheckCircle className="w-6 h-6 text-white" />
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl border border-purple-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-purple-600 text-sm font-medium">Hasil Pencarian</p>
            <p className="text-2xl font-bold text-purple-900">{filteredAndSortedTags.length}</p>
          </div>
          <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center">
            <Filter className="w-6 h-6 text-white" />
          </div>
        </div>
      </div>
    </div>
  );

  // Daftar Tags View
  if (currentView === 'daftar') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 font-inter">
        <Header />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Manajemen Tag Mata Kuliah</h2>
            <p className="text-gray-600">Kelola kategori atau tag untuk mata kuliah dalam sistem</p>
          </div>

          <StatsCards />

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Cari berdasarkan nama tag..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>
            <button
              onClick={() => setCurrentView('tambah')}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-xl font-medium flex items-center space-x-2 transition-all transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              <Plus className="w-5 h-5" />
              <span>Tambah Tag Baru</span>
            </button>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200">
              <h3 className="text-lg font-semibold text-slate-800">Daftar Tag</h3>
              <p className="text-sm text-slate-600 mt-1">Total: {filteredAndSortedTags.length} tag</p>
            </div>

            {loading ? (
              <div className="p-6 text-center text-gray-600">Memuat data...</div>
            ) : error ? (
              <div className="p-6 text-center text-red-600">Error: {error}</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Nama Tag</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Tanggal Dibuat</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Terakhir Diubah</th>
                      <th className="px-6 py-4 text-center text-xs font-semibold text-slate-600 uppercase tracking-wider">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {filteredAndSortedTags.length === 0 ? (
                      <tr>
                        <td colSpan="4" className="px-6 py-4 text-center text-slate-500">Tidak ada tag yang ditemukan.</td>
                      </tr>
                    ) : (
                      filteredAndSortedTags.map((tag) => (
                        <tr key={tag.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                                <Tag className="w-5 h-5 text-white" />
                              </div>
                              <div>
                                <div className="font-medium text-slate-800">{tag.name}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-slate-600">
                            {/* Menggunakan tag.created_at sesuai nama kolom database */}
                            {new Date(tag.created_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </td>
                          <td className="px-6 py-4 text-slate-600">
                            {/* Menggunakan tag.updated_at sesuai nama kolom database */}
                            {new Date(tag.updated_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex justify-center space-x-2">
                              <button
                                onClick={() => handleEdit(tag.id)}
                                className="bg-blue-100 hover:bg-blue-200 text-blue-600 p-2 rounded-lg transition-colors"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => setShowDeleteConfirm(tag.id)}
                                className="bg-red-100 hover:bg-red-200 text-red-600 p-2 rounded-lg transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        <Notification />
        <DeleteConfirmModal />
      </div>
    );
  }

  // Tambah/Edit View
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 font-inter">
      <Header />

      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="mb-8">
          <button
            onClick={resetForm}
            className="text-blue-600 hover:text-blue-700 mb-4 flex items-center gap-2 font-medium"
          >
            ← Kembali ke Daftar
          </button>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {currentView === 'edit' ? 'Edit Tag Mata Kuliah' : 'Tambah Tag Baru'}
          </h1>
          <p className="text-gray-600">
            {currentView === 'edit'
              ? 'Perbarui informasi tag mata kuliah yang sudah ada'
              : 'Tambahkan tag baru untuk mengkategorikan mata kuliah'
            }
          </p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Informasi Tag</h2>
          </div>

          <div className="p-6">
            <div className="space-y-6">
              <div>
                <label htmlFor="tagName" className="block text-sm font-semibold text-gray-700 mb-3">
                  Nama Tag *
                </label>
                <input
                  type="text"
                  id="tagName"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${formErrors.name ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                  placeholder="Contoh: Rekayasa Perangkat Lunak"
                />
                {formErrors.name && (
                  <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {formErrors.name}
                  </p>
                )}
              </div>
            </div>

            <div className="flex gap-4 pt-8">
              <button
                type="button"
                onClick={resetForm}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium flex items-center justify-center gap-2"
              >
                <X className="w-4 h-4" />
                Batal
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all font-medium flex items-center justify-center gap-2 shadow-sm"
                disabled={loading}
              >
                {loading ? (
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <Save className="w-4 h-4" />
                )}
                {currentView === 'edit' ? 'Update Tag' : 'Simpan Tag'}
              </button>
            </div>
          </div>
        </div>
      </main>

      <Notification />
      <DeleteConfirmModal />
    </div>
  );
};

export default MataKuliahAdmin;