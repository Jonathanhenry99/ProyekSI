import React, { useState } from 'react';
import { Search, Plus, User, LogOut, Edit, Trash2, Save, X, BookOpen, Code, GraduationCap, Filter, AlertCircle, CheckCircle } from 'lucide-react';

const MataKuliahAdmin = ({ currentUser }) => {
  const [currentView, setCurrentView] = useState('daftar');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [sortBy, setSortBy] = useState('nama');
  const [sortOrder, setSortOrder] = useState('asc');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [notification, setNotification] = useState(null);

  const [formData, setFormData] = useState({
    namaMataKuliah: '',
    kodeMataKuliah: '',
    sks: ''
  });

  const [formErrors, setFormErrors] = useState({});

  const [mataKuliahList, setMataKuliahList] = useState([
    { id: 1, nama: 'Algoritma Struktur Data', kode: 'AIF233101', sks: 4, createdAt: '2024-01-15', status: 'active' },
    { id: 2, nama: 'Desain Analisis Algoritma', kode: 'AIF233102', sks: 3, createdAt: '2024-01-16', status: 'active' },
    { id: 3, nama: 'Algoritma Pemrograman', kode: 'AIF233103', sks: 4, createdAt: '2024-01-17', status: 'active' },
    { id: 4, nama: 'Dasar Pemrograman', kode: 'AIF233104', sks: 3, createdAt: '2024-01-18', status: 'active' },
    { id: 5, nama: 'Pemrograman Berbasis Objek', kode: 'AIF233105', sks: 4, createdAt: '2024-01-19', status: 'active' },
    { id: 6, nama: 'Basis Data', kode: 'AIF233106', sks: 3, createdAt: '2024-01-20', status: 'active' }
  ]);

  // Show notification
  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // Validate form
  const validateForm = () => {
    const errors = {};
    
    if (!formData.namaMataKuliah.trim()) {
      errors.namaMataKuliah = 'Nama mata kuliah harus diisi';
    }
    
    if (!formData.kodeMataKuliah.trim()) {
      errors.kodeMataKuliah = 'Kode mata kuliah harus diisi';
    } else if (!/^[A-Z]{3}\d{6}$/.test(formData.kodeMataKuliah)) {
      errors.kodeMataKuliah = 'Format kode: 3 huruf kapital + 6 angka (contoh: AIF233101)';
    }
    
    if (!formData.sks.trim()) {
      errors.sks = 'Jumlah SKS harus diisi';
    } else if (!/^[1-6]$/.test(formData.sks)) {
      errors.sks = 'SKS harus berupa angka 1-6';
    }
    
    // Check for duplicate code
    const isDuplicate = mataKuliahList.some(mk => 
      mk.kode === formData.kodeMataKuliah && mk.id !== editingId
    );
    if (isDuplicate) {
      errors.kodeMataKuliah = 'Kode mata kuliah sudah digunakan';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Filter and sort mata kuliah
  const filteredAndSortedMataKuliah = mataKuliahList
    .filter(mk =>
      mk.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mk.kode.toLowerCase().includes(searchTerm.toLowerCase())
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

  const handleSubmit = () => {
    if (!validateForm()) return;

    if (currentView === 'edit' && editingId) {
      setMataKuliahList(prev => 
        prev.map(mk => 
          mk.id === editingId 
            ? { 
                ...mk, 
                nama: formData.namaMataKuliah, 
                kode: formData.kodeMataKuliah,
                sks: parseInt(formData.sks)
              }
            : mk
        )
      );
      showNotification('Mata kuliah berhasil diperbarui');
    } else {
      const newMataKuliah = {
        id: Math.max(...mataKuliahList.map(mk => mk.id)) + 1,
        nama: formData.namaMataKuliah,
        kode: formData.kodeMataKuliah,
        sks: parseInt(formData.sks),
        createdAt: new Date().toISOString().split('T')[0],
        status: 'active'
      };
      setMataKuliahList(prev => [...prev, newMataKuliah]);
      showNotification('Mata kuliah berhasil ditambahkan');
    }
    
    resetForm();
  };

  const resetForm = () => {
    setFormData({ namaMataKuliah: '', kodeMataKuliah: '', sks: '' });
    setFormErrors({});
    setEditingId(null);
    setCurrentView('daftar');
  };

  const handleEdit = (id) => {
    const mataKuliah = mataKuliahList.find(mk => mk.id === id);
    if (mataKuliah) {
      setFormData({
        namaMataKuliah: mataKuliah.nama,
        kodeMataKuliah: mataKuliah.kode,
        sks: mataKuliah.sks.toString()
      });
      setEditingId(id);
      setCurrentView('edit');
    }
  };

  const handleDelete = (id) => {
    setMataKuliahList(prev => prev.filter(mk => mk.id !== id));
    setShowDeleteConfirm(null);
    showNotification('Mata kuliah berhasil dihapus');
  };

  const handleLogout = () => {
    console.log('Logout clicked');
  };

  // Notification Component
  const Notification = () => {
    if (!notification) return null;
    
    return (
      <div className="fixed top-4 right-4 z-50">
        <div className={`flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg border ${
          notification.type === 'success' 
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
    
    const mataKuliah = mataKuliahList.find(mk => mk.id === showDeleteConfirm);
    
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <Trash2 className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Hapus Mata Kuliah</h3>
              <p className="text-sm text-gray-500">Aksi ini tidak dapat dibatalkan</p>
            </div>
          </div>
          
          <p className="text-gray-700 mb-6">
            Apakah Anda yakin ingin menghapus mata kuliah <strong>"{mataKuliah?.nama}"</strong>?
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

  // Header Component - Updated to match DosenPage
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
            <a 
              href="/admin/dosen" 
              className="text-gray-600 hover:text-gray-900 transition-colors font-medium px-2 py-1"
            >
              Dosen
            </a>
            <a 
              href="/admin/mata-kuliah" 
              className="text-blue-600 font-semibold relative px-2 py-1"
            >
              Mata Kuliah
              <div className="absolute -bottom-4 left-0 right-0 h-0.5 bg-blue-600 rounded-full"></div>
            </a>
            <a 
              href="/admin/tagging" 
              className="text-gray-600 hover:text-gray-900 transition-colors font-medium px-2 py-1"
            >
              Tagging
            </a>
          </nav>
          
          <div className="flex items-center justify-end space-x-4">
            <span className="text-gray-700 font-medium">Admin XXYY</span>
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
            <p className="text-blue-600 text-sm font-medium">Total Mata Kuliah</p>
            <p className="text-2xl font-bold text-blue-900">{mataKuliahList.length}</p>
          </div>
          <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
            <BookOpen className="w-6 h-6 text-white" />
          </div>
        </div>
      </div>
      
      <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl border border-green-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-green-600 text-sm font-medium">Active Courses</p>
            <p className="text-2xl font-bold text-green-900">{mataKuliahList.filter(mk => mk.status === 'active').length}</p>
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
            <p className="text-2xl font-bold text-purple-900">{filteredAndSortedMataKuliah.length}</p>
          </div>
          <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center">
            <Filter className="w-6 h-6 text-white" />
          </div>
        </div>
      </div>
    </div>
  );

  // Daftar Mata Kuliah View
  if (currentView === 'daftar') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30">
        <Header />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Manajemen Mata Kuliah</h2>
            <p className="text-gray-600">Kelola data mata kuliah dalam sistem</p>
          </div>
          
          <StatsCards />
          
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Cari berdasarkan nama atau kode..."
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
              <span>Tambah Mata Kuliah</span>
            </button>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200">
              <h3 className="text-lg font-semibold text-slate-800">Daftar Mata Kuliah</h3>
              <p className="text-sm text-slate-600 mt-1">Total: {filteredAndSortedMataKuliah.length} mata kuliah</p>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Mata Kuliah</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Kode</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">SKS</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-slate-600 uppercase tracking-wider">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredAndSortedMataKuliah.map((mk) => (
                    <tr key={mk.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
                            <BookOpen className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <div className="font-medium text-slate-800">{mk.nama}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <Code className="w-4 h-4 text-slate-400" />
                          <span className="text-slate-600 font-mono">{mk.kode}-{mk.sks.toString().padStart(2, '0')}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {mk.sks} SKS
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                          mk.status === 'active' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {mk.status === 'active' ? 'Aktif' : 'Nonaktif'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-center space-x-2">
                          <button 
                            onClick={() => handleEdit(mk.id)}
                            className="bg-blue-100 hover:bg-blue-200 text-blue-600 p-2 rounded-lg transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => setShowDeleteConfirm(mk.id)}
                            className="bg-red-100 hover:bg-red-200 text-red-600 p-2 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        
        <Notification />
        <DeleteConfirmModal />
      </div>
    );
  }

  // Tambah/Edit View
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30">
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
            {currentView === 'edit' ? 'Edit Mata Kuliah' : 'Tambah Mata Kuliah'}
          </h1>
          <p className="text-gray-600">
            {currentView === 'edit' 
              ? 'Perbarui informasi mata kuliah yang sudah ada' 
              : 'Tambahkan mata kuliah baru ke dalam sistem'
            }
          </p>
        </div>
        
        {/* Form */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Informasi Mata Kuliah</h2>
          </div>
          
          <div className="p-6">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Nama Mata Kuliah *
                </label>
                <input
                  type="text"
                  name="namaMataKuliah"
                  value={formData.namaMataKuliah}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                    formErrors.namaMataKuliah ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="Contoh: Algoritma Struktur Data"
                />
                {formErrors.namaMataKuliah && (
                  <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {formErrors.namaMataKuliah}
                  </p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Kode Mata Kuliah *
                </label>
                <input
                  type="text"
                  name="kodeMataKuliah"
                  value={formData.kodeMataKuliah}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors font-mono ${
                    formErrors.kodeMataKuliah ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="Contoh: AIF233101"
                />
                {formErrors.kodeMataKuliah && (
                  <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {formErrors.kodeMataKuliah}
                  </p>
                )}
                <p className="mt-2 text-xs text-gray-500">
                  Format: 3 huruf kapital + 6 angka (contoh: AIF233101)
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Jumlah SKS *
                </label>
                <select
                  name="sks"
                  value={formData.sks}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                    formErrors.sks ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                >
                  <option value="">Pilih jumlah SKS</option>
                  <option value="1">1 SKS</option>
                  <option value="2">2 SKS</option>
                  <option value="3">3 SKS</option>
                  <option value="4">4 SKS</option>
                  <option value="5">5 SKS</option>
                  <option value="6">6 SKS</option>
                </select>
                {formErrors.sks && (
                  <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {formErrors.sks}
                  </p>
                )}
                <p className="mt-2 text-xs text-gray-500">
                  SKS akan ditampilkan sebagai: {formData.kodeMataKuliah && formData.sks ? `${formData.kodeMataKuliah}-${formData.sks.padStart(2, '0')}` : 'KODEMATKULIAH-SS'}
                </p>
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
                {currentView === 'edit' ? 'Update Mata Kuliah' : 'Simpan Mata Kuliah'}
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