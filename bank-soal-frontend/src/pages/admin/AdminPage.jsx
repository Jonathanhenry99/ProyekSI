import React, { useState, useEffect } from 'react';
import axios from 'axios';
// Hapus Eye, EyeOff dari import
import { Search, Plus, Edit, Trash2, User, Mail, X, LogOut, Save, AlertCircle, CheckCircle, Users, UserCheck, Filter } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import AuthService from '../../services/auth.service'; // Pastikan path ini benar

// URL dasar untuk API dosen Anda
const API_URL = 'http://localhost:8080/api/admin/'; // Pastikan port dan path ini benar

const AdminPage = ({ currentUser }) => {
  const navigate = useNavigate();
  const [currentView, setCurrentView] = useState('daftar'); // 'daftar', 'tambah', 'edit'
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState(null);
  // Hapus state untuk showPassword dan showRePassword
  // const [showPassword, setShowPassword] = useState(false);
  // const [showRePassword, setShowRePassword] = useState(false);
  const [notification, setNotification] = useState(null);

  // State terpisah untuk setiap field form
  const [namaDosen, setNamaDosen] = useState('');
  const [emailDosen, setEmailDosen] = useState('');
  const [passwordDosen, setPasswordDosen] = useState('');
  const [rePasswordDosen, setRePasswordDosen] = useState('');
  const [formErrors, setFormErrors] = useState({});

  // Data dosen dari backend
  const [dosenList, setDosenList] = useState([]);

  // Fetch dosen data on component mount
  useEffect(() => {
    fetchDosen();
  }, []);

  const fetchDosen = async () => {
    try {
      const response = await axios.get(API_URL + 'dosen');
      console.log("Data fetched:", response.data); // Debugging: periksa data yang diterima
      setDosenList(response.data);
      showNotification('Daftar dosen berhasil dimuat', 'success');
    } catch (err) {
      console.error("Error fetching dosen:", err);
      showNotification('Gagal memuat daftar dosen. Pastikan backend berjalan.', 'error');
      setDosenList([]); // Pastikan state kosong jika ada error
    }
  };

  // Show notification
  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000); // Notifikasi hilang setelah 3 detik
  };

  // Validate form
  const validateForm = () => {
    const errors = {};

    if (!namaDosen.trim()) {
      errors.nama = 'Nama dosen harus diisi';
    }

    if (!emailDosen.trim()) {
      errors.email = 'Email harus diisi';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailDosen)) {
      errors.email = 'Format email tidak valid';
    }

    // Cek duplikasi email (kecuali untuk dosen yang sedang diedit)
    const isDuplicateEmail = dosenList.some(dosen =>
      dosen.email === emailDosen && dosen.id !== editingId
    );
    if (isDuplicateEmail) {
      errors.email = 'Email sudah digunakan oleh dosen lain.';
    }

    // Validasi password hanya untuk 'tambah' atau jika password diubah di 'edit'
    if (currentView === 'tambah' || passwordDosen) { // Hanya wajib diisi saat tambah atau jika diisi saat edit
      if (!passwordDosen.trim()) {
        errors.password = 'Password harus diisi';
      } else if (passwordDosen.length < 6) {
        errors.password = 'Password minimal 6 karakter';
      }

      if (passwordDosen !== rePasswordDosen) {
        errors.rePassword = 'Konfirmasi password tidak cocok';
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0; // Return true if no errors
  };

  const handleSubmit = async () => {
    if (!validateForm()) return; // Hentikan jika validasi gagal

    try {
      if (currentView === 'edit' && editingId) {
        // Logika Update Dosen
        const updateData = { nama: namaDosen, email: emailDosen };
        if (passwordDosen) { // Hanya kirim password jika diisi
          updateData.password = passwordDosen;
        }
        await axios.put(API_URL + `dosen/${editingId}`, updateData);
        showNotification('Data dosen berhasil diperbarui', 'success');
      } else {
        // Logika Tambah Dosen
        if (!passwordDosen) { // Periksa password lagi untuk mode tambah
          setFormErrors(prev => ({ ...prev, password: 'Password wajib diisi untuk dosen baru.' }));
          return;
        }
        await axios.post(API_URL + 'dosen', { nama: namaDosen, email: emailDosen, password: passwordDosen });
        showNotification('Dosen berhasil ditambahkan', 'success');
      }
      resetForm(); // Reset form dan kembali ke tampilan daftar
      fetchDosen(); // Muat ulang data dosen
    } catch (err) {
      console.error("Error submitting form:", err);
      // Tangani error dari API (misal: duplikasi email dari backend)
      const errorMessage = err.response?.data?.message || err.message || 'Terjadi kesalahan saat menyimpan data.';
      showNotification(`Gagal menyimpan dosen: ${errorMessage}`, 'error');
    }
  };

  const resetForm = () => {
    setNamaDosen('');
    setEmailDosen('');
    setPasswordDosen('');
    setRePasswordDosen('');
    setFormErrors({});
    setEditingId(null);
    setCurrentView('daftar'); // Kembali ke tampilan daftar
    // Hapus set state untuk showPassword dan showRePassword
    // setShowPassword(false);
    // setShowRePassword(false);
  };

  const handleEdit = (id) => {
    const dosen = dosenList.find(d => d.id === id);
    if (dosen) {
      setNamaDosen(dosen.nama);
      setEmailDosen(dosen.email);
      setPasswordDosen(''); // Kosongkan password saat edit
      setRePasswordDosen(''); // Kosongkan konfirmasi password saat edit
      setEditingId(id);
      setCurrentView('edit'); // Ubah tampilan ke form edit
      setFormErrors({}); // Bersihkan error form
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus dosen ini? Tindakan ini tidak dapat dibatalkan.')) {
      try {
        await axios.delete(API_URL + `dosen/${id}`);
        showNotification('Dosen berhasil dihapus', 'success');
        fetchDosen(); // Muat ulang data setelah penghapusan
      } catch (err) {
        console.error("Error deleting dosen:", err);
        const errorMessage = err.response?.data?.message || err.message || 'Terjadi kesalahan saat menghapus data.';
        showNotification(`Gagal menghapus dosen: ${errorMessage}`, 'error');
      }
    }
  };

  // Logika Filter Dosen (perbaikan untuk TypeError)
  const filteredDosen = dosenList.filter(dosen => {
    // Pastikan properti nama dan email ada sebelum memanggil toLowerCase()
    // Jika undefined/null, fallback ke string kosong untuk menghindari error
    const nama = dosen.nama || '';
    const email = dosen.email || '';

    return nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
      email.toLowerCase().includes(searchTerm.toLowerCase());
  });

  // Komponen Notifikasi (Reusable)
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

  // Komponen Header
  const Header = () => (
    <header className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="grid grid-cols-3 items-center">
          <div className="flex items-center space-x-3">
            {/* Pastikan path gambar ini benar dan gambar ada */}
            <img
              src="/src/assets/LogoIF.jpg"
              alt="Logo Informatika UNPAR"
              className="h-10 w-auto"
            />
          </div>

          <nav className="flex justify-center space-x-8">
            <Link
              to="/admin/dosen"
              className="text-blue-600 font-semibold relative px-2 py-1"
            >
              Dosen
              <div className="absolute -bottom-4 left-0 right-0 h-0.5 bg-blue-600 rounded-full"></div>
            </Link>
            <Link
              to="/admin/mata-kuliah"
              className="text-gray-600 hover:text-gray-900 transition-colors font-medium px-2 py-1"
            >
              Mata Kuliah
            </Link>
            <Link
              to="/admin/tagging"
              className="text-gray-600 hover:text-gray-900 transition-colors font-medium px-2 py-1"
            >
              Tagging
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

  // Komponen Stats Cards
  const StatsCards = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-blue-600 text-sm font-medium">Total Dosen</p>
            <p className="text-2xl font-bold text-blue-900">{dosenList.length}</p>
          </div>
          <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
            <Users className="w-6 h-6 text-white" />
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl border border-green-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-green-600 text-sm font-medium">Dosen Aktif</p>
            {/* Asumsi backend menyediakan 'status' field. Sesuaikan jika tidak ada. */}
            <p className="text-2xl font-bold text-green-900">{dosenList.filter(dosen => dosen.status === 'Aktif').length}</p>
          </div>
          <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
            <UserCheck className="w-6 h-6 text-white" />
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl border border-purple-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-purple-600 text-sm font-medium">Hasil Pencarian</p>
            <p className="text-2xl font-bold text-purple-900">{filteredDosen.length}</p>
          </div>
          <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center">
            <Filter className="w-6 h-6 text-white" />
          </div>
        </div>
      </div>
    </div>
  );

  const handleLogout = () => {
    AuthService.logout();
    navigate('/login'); // Redirect ke halaman login setelah logout
  };

  // --- Render tampilan Daftar Dosen ---
  if (currentView === 'daftar') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30">
        <Notification /> {/* Notifikasi di sini agar selalu terlihat */}
        <Header />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Manajemen Dosen</h2>
            <p className="text-gray-600">Kelola data dosen dan akun akses sistem</p>
          </div>

          <StatsCards />

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Cari berdasarkan nama atau email..."
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
              <span>Tambah Dosen</span>
            </button>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200">
              <h3 className="text-lg font-semibold text-slate-800">Daftar Dosen</h3>
              <p className="text-sm text-slate-600 mt-1">Total: {filteredDosen.length} dosen</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Dosen</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-slate-600 uppercase tracking-wider">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredDosen.length > 0 ? (
                    filteredDosen.map((dosen) => (
                      <tr key={dosen.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
                              <User className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <div className="font-medium text-slate-800">{dosen.nama}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            <Mail className="w-4 h-4 text-slate-400" />
                            <span className="text-slate-600">{dosen.email}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${dosen.status === 'Aktif'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                            }`}>
                            {dosen.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex justify-center space-x-2">
                            <button
                              onClick={() => handleEdit(dosen.id)}
                              className="bg-blue-100 hover:bg-blue-200 text-blue-600 p-2 rounded-lg transition-colors"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(dosen.id)}
                              className="bg-red-100 hover:bg-red-200 text-red-600 p-2 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="px-6 py-4 text-center text-gray-500">
                        Tidak ada data dosen.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- Render tampilan Tambah/Edit Dosen ---
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30">
      <Notification /> {/* Notifikasi di sini agar selalu terlihat */}
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
            {currentView === 'edit' ? 'Edit Dosen' : 'Tambah Dosen'}
          </h1>
          <p className="text-gray-600">
            {currentView === 'edit'
              ? 'Perbarui informasi dosen yang sudah ada'
              : 'Tambahkan dosen baru ke dalam sistem'
            }
          </p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Informasi Dosen</h2>
          </div>

          <div className="p-6">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Nama Dosen *
                </label>
                <input
                  type="text"
                  value={namaDosen}
                  onChange={(e) => {
                    setNamaDosen(e.target.value);
                    if (formErrors.nama) { // Hapus error jika user mulai mengetik
                      setFormErrors(prev => ({ ...prev, nama: '' }));
                    }
                  }}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${formErrors.nama ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                  placeholder="Contoh: Dr. Ahmad Susanto"
                />
                {formErrors.nama && (
                  <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {formErrors.nama}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Email *
                </label>
                <input
                  type="email"
                  value={emailDosen}
                  onChange={(e) => {
                    setEmailDosen(e.target.value);
                    if (formErrors.email) { // Hapus error jika user mulai mengetik
                      setFormErrors(prev => ({ ...prev, email: '' }));
                    }
                  }}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${formErrors.email ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                  placeholder="nama@unpar.ac.id"
                />
                {formErrors.email && (
                  <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {formErrors.email}
                  </p>
                )}
              </div>

              {/* Input Password */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Password {currentView === 'edit' ? '(Kosongkan jika tidak ingin mengubah)' : '*'}
                </label>
                <div className="relative">
                  <input
                    type="password" // Selalu type="password"
                    value={passwordDosen}
                    onChange={(e) => {
                      setPasswordDosen(e.target.value);
                      if (formErrors.password) {
                        setFormErrors(prev => ({ ...prev, password: '' }));
                      }
                    }}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${formErrors.password ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                    placeholder="Masukkan password"
                  />
                  {/* Tombol ikon mata dihilangkan di sini */}
                </div>
                {formErrors.password && (
                  <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {formErrors.password}
                  </p>
                )}
              </div>

              {/* Input Konfirmasi Password */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Konfirmasi Password {currentView === 'edit' ? '(Jika mengisi password di atas)' : '*'}
                </label>
                <div className="relative">
                  <input
                    type="password" // Selalu type="password"
                    value={rePasswordDosen}
                    onChange={(e) => {
                      setRePasswordDosen(e.target.value);
                      if (formErrors.rePassword) {
                        setFormErrors(prev => ({ ...prev, rePassword: '' }));
                      }
                    }}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${formErrors.rePassword ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                    placeholder="Ulangi password"
                  />
                  {/* Tombol ikon mata dihilangkan di sini */}
                </div>
                {formErrors.rePassword && (
                  <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {formErrors.rePassword}
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
              >
                <Save className="w-4 h-4" />
                {currentView === 'edit' ? 'Update Dosen' : 'Simpan Dosen'}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminPage;