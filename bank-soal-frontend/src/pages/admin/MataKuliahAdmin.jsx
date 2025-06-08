import React, { useState } from 'react';
import { Search, Plus, User, LogOut } from 'lucide-react';

const MataKuliahAdmin = ({ currentUser }) => {
  const [currentView, setCurrentView] = useState('daftar'); // 'daftar', 'tambah', atau 'edit'
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    namaMataKuliah: '',
    kodeMataKuliah: ''
  });

  // Data dummy mata kuliah
  const [mataKuliahList, setMataKuliahList] = useState([
    { id: 1, nama: 'Algoritma Struktur Data', kode: 'ASD001' },
    { id: 2, nama: 'Desain Analisis Algoritma', kode: 'DAA002' },
    { id: 3, nama: 'Algoritma Pemrograman', kode: 'AP003' },
    { id: 4, nama: 'Dasar Pemrograman', kode: 'DP004' },
    { id: 5, nama: 'Pemrograman Berbasis Objek', kode: 'PBO005' },
    { id: 6, nama: 'Desain Analisis Algoritma', kode: 'DAA006' }
  ]);

  // Filter mata kuliah berdasarkan pencarian
  const filteredMataKuliah = mataKuliahList.filter(mk =>
    mk.nama.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = () => {
    if (formData.namaMataKuliah && formData.kodeMataKuliah) {
      if (currentView === 'edit' && editingId) {
        // Update mata kuliah yang sudah ada
        setMataKuliahList(prev => 
          prev.map(mk => 
            mk.id === editingId 
              ? { ...mk, nama: formData.namaMataKuliah, kode: formData.kodeMataKuliah }
              : mk
          )
        );
      } else {
        // Tambah mata kuliah baru
        const newMataKuliah = {
          id: mataKuliahList.length + 1,
          nama: formData.namaMataKuliah,
          kode: formData.kodeMataKuliah
        };
        setMataKuliahList(prev => [...prev, newMataKuliah]);
      }
      
      setFormData({ namaMataKuliah: '', kodeMataKuliah: '' });
      setEditingId(null);
      setCurrentView('daftar');
    }
  };

  const handleCancel = () => {
    setFormData({ namaMataKuliah: '', kodeMataKuliah: '' });
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
  };

  const handleLogout = () => {
    // Implementasi logout - sesuaikan dengan AuthService
    // AuthService.logout();
    // window.location.href = '/login';
    console.log('Logout clicked');
  };

  // Header Component
  const Header = () => (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex justify-between items-center max-w-7xl mx-auto">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-3">
            {/* Logo UNPAR */}
            <img 
              src="/src/assets/LogoIF.jpg" 
              alt="Logo UNPAR Informatika" 
              className="h-12 w-auto"
            />
          </div>
        </div>
        
        <nav className="flex space-x-8">
          <a 
            href="/admin/dosen" 
            className="text-gray-700 hover:text-gray-900 transition-colors"
          >
            Dosen
          </a>
          <a 
            href="/admin/mata-kuliah" 
            className="text-gray-900 font-medium border-b-2 border-blue-600"
          >
            Mata Kuliah
          </a>
          <a 
            href="/admin/tagging" 
            className="text-gray-700 hover:text-gray-900 transition-colors"
          >
            Tagging
          </a>
        </nav>
        
        <div className="flex items-center space-x-4">
          <span className="text-gray-700">
            Hi, {currentUser?.username || 'Admin XXYY'}
          </span>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-gray-600" />
            </div>
            <button
              onClick={handleLogout}
              className="p-2 text-gray-600 hover:text-gray-800 transition-colors"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );

  // Daftar Mata Kuliah View
  const DaftarMataKuliah = () => (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-6 py-8">
        <h1 className="text-3xl font-bold text-center mb-8">Daftar Mata Kuliah</h1>
        
        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Cari mata kuliah"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <p className="text-sm text-gray-500 mt-2">
            Menampilkan {filteredMataKuliah.length} hasil pencarian
          </p>
        </div>

        {/* Mata Kuliah Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden max-w-4xl mx-auto">
          <div className="bg-gray-100 px-6 py-4 border-b">
            <div className="flex justify-between items-center">
              <h2 className="font-semibold text-gray-800">Mata Kuliah</h2>
              <h2 className="font-semibold text-gray-800">AKSI</h2>
            </div>
          </div>
          
          <div className="divide-y divide-gray-200">
            {filteredMataKuliah.map((mk) => (
              <div key={mk.id} className="px-6 py-4 flex justify-between items-center hover:bg-gray-50">
                <span className="text-gray-700">{mk.nama}</span>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(mk.id)}
                    className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(mk.id)}
                    className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors"
                  >
                    Hapus
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tambah Mata Kuliah Button */}
        <div className="fixed bottom-8 right-8">
          <button
            onClick={() => setCurrentView('tambah')}
            className="bg-black text-white px-6 py-3 rounded-full flex items-center space-x-2 shadow-lg hover:bg-gray-800 transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>Tambah Mata Kuliah</span>
          </button>
        </div>
      </main>
    </div>
  );

  // Tambah/Edit Mata Kuliah View
  const TambahEditMataKuliah = () => (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold text-center mb-4">
            {currentView === 'edit' ? 'Edit Mata Kuliah' : 'Tambah Mata Kuliah'}
          </h1>
          <p className="text-gray-600 text-center mb-8">
            {currentView === 'edit' 
              ? 'Perbarui informasi mata kuliah' 
              : 'Unggah dan kelola soal-soal Anda dengan mudah'
            }
          </p>
          
          {/* Form */}
          <div className="bg-white rounded-lg shadow-sm p-8">
            <h2 className="text-xl font-semibold mb-6">Informasi Mata Kuliah</h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nama Mata Kuliah
                </label>
                <input
                  type="text"
                  name="namaMataKuliah"
                  value={formData.namaMataKuliah}
                  onChange={handleInputChange}
                  className="w-full px-3 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Masukkan nama mata kuliah"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kode Mata Kuliah
                </label>
                <input
                  type="text"
                  name="kodeMataKuliah"
                  value={formData.kodeMataKuliah}
                  onChange={handleInputChange}
                  className="w-full px-3 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Masukkan kode mata kuliah"
                />
              </div>
              
              <div className="flex space-x-4 pt-4">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="flex-1 px-6 py-3 bg-black text-white rounded-md hover:bg-gray-800 transition-colors"
                >
                  {currentView === 'edit' ? 'Update Mata Kuliah' : 'Simpan Mata Kuliah'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );

  return currentView === 'daftar' ? <DaftarMataKuliah /> : <TambahEditMataKuliah />;
};

export default MataKuliahAdmin;