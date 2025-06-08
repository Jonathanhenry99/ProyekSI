import React, { useState, useEffect } from 'react';
import { Search, Plus, User, LogOut, Edit, Trash2, Save, X, BookOpen, Code, GraduationCap, Filter, SortAsc, AlertCircle, CheckCircle } from 'lucide-react';

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
    kodeMataKuliah: ''
  });
  const [formErrors, setFormErrors] = useState({});

  const [mataKuliahList, setMataKuliahList] = useState([
    { id: 1, nama: 'Algoritma Struktur Data', kode: 'ASD001', createdAt: '2024-01-15', status: 'active' },
    { id: 2, nama: 'Desain Analisis Algoritma', kode: 'DAA002', createdAt: '2024-01-16', status: 'active' },
    { id: 3, nama: 'Algoritma Pemrograman', kode: 'AP003', createdAt: '2024-01-17', status: 'active' },
    { id: 4, nama: 'Dasar Pemrograman', kode: 'DP004', createdAt: '2024-01-18', status: 'active' },
    { id: 5, nama: 'Pemrograman Berbasis Objek', kode: 'PBO005', createdAt: '2024-01-19', status: 'active' },
    { id: 6, nama: 'Basis Data', kode: 'BD006', createdAt: '2024-01-20', status: 'active' }
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
    } else if (!/^[A-Z]{2,4}\d{3}$/.test(formData.kodeMataKuliah)) {
      errors.kodeMataKuliah = 'Format kode: 2-4 huruf kapital + 3 angka (contoh: ASD001)';
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
      const comparison = aValue.localeCompare(bValue);
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
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
            ? { ...mk, nama: formData.namaMataKuliah, kode: formData.kodeMataKuliah }
            : mk
        )
      );
      showNotification('Mata kuliah berhasil diperbarui');
    } else {
      const newMataKuliah = {
        id: Math.max(...mataKuliahList.map(mk => mk.id)) + 1,
        nama: formData.namaMataKuliah,
        kode: formData.kodeMataKuliah,
        createdAt: new Date().toISOString().split('T')[0],
        status: 'active'
      };
      setMataKuliahList(prev => [...prev, newMataKuliah]);
      showNotification('Mata kuliah berhasil ditambahkan');
    }
    
    resetForm();
  };

  const resetForm = () => {
    setFormData({ namaMataKuliah: '', kodeMataKuliah: '' });
    setFormErrors({});
    setEditingId(null);
    setCurrentView('daftar');
  };

  const handleEdit = (id) => {
    const mataKuliah = mataKuliahList.find(mk => mk.id === id);
    if (mataKuliah) {
      setFormData({
        namaMataKuliah: mataKuliah.nama,
        kodeMataKuliah: mataKuliah.kode
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

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  // Notification Component
  const Notification = () => {
    if (!notification) return null;
    
    return (
      <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-right duration-300">
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
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-in fade-in duration-200">
        <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 animate-in zoom-in-95 duration-200">
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

  // Header Component
  const Header = () => (
    <header className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-gray-900">UNPAR</h1>
                <p className="text-xs text-gray-500">Informatika</p>
              </div>
            </div>
          </div>
          
          <nav className="flex space-x-8">
            <a 
              href="/admin/dosen" 
              className="text-gray-600 hover:text-gray-900 transition-colors font-medium"
            >
              Dosen
            </a>
            <a 
              href="/admin/mata-kuliah" 
              className="text-blue-600 font-semibold relative"
            >
              Mata Kuliah
              <div className="absolute -bottom-4 left-0 right-0 h-0.5 bg-blue-600 rounded-full"></div>
            </a>
            <a 
              href="/admin/tagging" 
              className="text-gray-600 hover:text-gray-900 transition-colors font-medium"
            >
              Tagging
            </a>
          </nav>
          
          <div className="flex items-center space-x-4">
            <span className="text-gray-700 font-medium">
              {currentUser?.username || 'Admin XXYY'}
            </span>
            <div className="flex items-center space-x-2">
              <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              <button
                onClick={() => console.log('Logout clicked')}
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
  const DaftarMataKuliah = () => (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30">
      <Header />
      
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Daftar Mata Kuliah</h1>
          <p className="text-gray-600">Kelola semua mata kuliah dalam sistem</p>
        </div>
        
        <StatsCards />
        
        {/* Search and Controls */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Cari nama atau kode mata kuliah..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              />
            </div>
            
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Urutkan:</span>
                <select 
                  value={`${sortBy}-${sortOrder}`}
                  onChange={(e) => {
                    const [field, order] = e.target.value.split('-');
                    setSortBy(field);
                    setSortOrder(order);
                  }}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="nama-asc">Nama A-Z</option>
                  <option value="nama-desc">Nama Z-A</option>
                  <option value="kode-asc">Kode A-Z</option>
                  <option value="kode-desc">Kode Z-A</option>
                </select>
              </div>
              
              <button
                onClick={() => setCurrentView('tambah')}
                className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:from-blue-700 hover:to-blue-800 transition-all shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah</span>
              </button>
            </div>
          </div>
        </div>

        {/* Mata Kuliah Cards */}
        <div className="space-y-3">
          {filteredAndSortedMataKuliah.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Tidak ada mata kuliah</h3>
              <p className="text-gray-600 mb-6">
                {searchTerm ? 'Tidak ditemukan mata kuliah yang sesuai dengan pencarian' : 'Belum ada mata kuliah yang ditambahkan'}
              </p>
              {!searchTerm && (
                <button
                  onClick={() => setCurrentView('tambah')}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Tambah Mata Kuliah Pertama
                </button>
              )}
            </div>
          ) : (
            filteredAndSortedMataKuliah.map((mk) => (
              <div key={mk.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all group">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                      <Code className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">{mk.nama}</h3>
                      <p className="text-sm text-gray-500">Kode: {mk.kode}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleEdit(mk.id)}
                      className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit mata kuliah"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setShowDeleteConfirm(mk.id)}
                      className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Hapus mata kuliah"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );

  // Tambah/Edit Mata Kuliah View
  const TambahEditMataKuliah = () => (
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
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                    formErrors.kodeMataKuliah ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="Contoh: ASD001"
                />
                {formErrors.kodeMataKuliah && (
                  <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {formErrors.kodeMataKuliah}
                  </p>
                )}
                <p className="mt-2 text-xs text-gray-500">
                  Format: 2-4 huruf kapital diikuti 3 angka (contoh: ASD001, COMP101)
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
    </div>
  );

  return (
    <>
      {currentView === 'daftar' ? <DaftarMataKuliah /> : <TambahEditMataKuliah />}
      <DeleteConfirmModal />
      <Notification />
    </>
  );
};

export default MataKuliahAdmin;