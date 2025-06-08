import React, { useState } from 'react';
import { Search, Plus, User, LogOut } from 'lucide-react';

const DosenAdmin = ({ currentUser }) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Data dummy dosen
  const [dosenList] = useState([
    { id: 1, nama: 'Dr. John Doe', email: 'john.doe@unpar.ac.id', mataKuliah: 'Algoritma Struktur Data' },
    { id: 2, nama: 'Prof. Jane Smith', email: 'jane.smith@unpar.ac.id', mataKuliah: 'Desain Analisis Algoritma' },
    { id: 3, nama: 'Dr. Bob Johnson', email: 'bob.johnson@unpar.ac.id', mataKuliah: 'Pemrograman Berbasis Objek' },
  ]);

  // Filter dosen berdasarkan pencarian
  const filteredDosen = dosenList.filter(dosen =>
    dosen.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
    dosen.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleLogout = () => {
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
            className="text-gray-900 font-medium border-b-2 border-blue-600"
          >
            Dosen
          </a>
          <a 
            href="/admin/mata-kuliah" 
            className="text-gray-700 hover:text-gray-900 transition-colors"
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-6 py-8">
        <h1 className="text-3xl font-bold text-center mb-8">Daftar Dosen</h1>
        
        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Cari dosen"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <p className="text-sm text-gray-500 mt-2">
            Menampilkan {filteredDosen.length} hasil pencarian
          </p>
        </div>

        {/* Dosen Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden max-w-6xl mx-auto">
          <div className="bg-gray-100 px-6 py-4 border-b">
            <div className="grid grid-cols-4 gap-4">
              <h2 className="font-semibold text-gray-800">Nama</h2>
              <h2 className="font-semibold text-gray-800">Email</h2>
              <h2 className="font-semibold text-gray-800">Mata Kuliah</h2>
              <h2 className="font-semibold text-gray-800">Aksi</h2>
            </div>
          </div>
          
          <div className="divide-y divide-gray-200">
            {filteredDosen.map((dosen) => (
              <div key={dosen.id} className="px-6 py-4 grid grid-cols-4 gap-4 items-center hover:bg-gray-50">
                <span className="text-gray-700">{dosen.nama}</span>
                <span className="text-gray-600">{dosen.email}</span>
                <span className="text-gray-600">{dosen.mataKuliah}</span>
                <div className="flex space-x-2">
                  <button className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors">
                    Edit
                  </button>
                  <button className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors">
                    Hapus
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tambah Dosen Button */}
        <div className="fixed bottom-8 right-8">
          <button className="bg-black text-white px-6 py-3 rounded-full flex items-center space-x-2 shadow-lg hover:bg-gray-800 transition-colors">
            <Plus className="w-5 h-5" />
            <span>Tambah Dosen</span>
          </button>
        </div>
      </main>
    </div>
  );
};

export default DosenAdmin;