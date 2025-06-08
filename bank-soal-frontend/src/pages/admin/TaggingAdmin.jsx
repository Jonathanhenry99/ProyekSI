import React, { useState } from 'react';
import { Search, Plus, User, LogOut, Tag } from 'lucide-react';

const TaggingAdmin = ({ currentUser }) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Data dummy tags
  const [tagsList] = useState([
    { id: 1, nama: 'Array', kategori: 'Data Structure', jumlahSoal: 15 },
    { id: 2, nama: 'Sorting', kategori: 'Algorithm', jumlahSoal: 12 },
    { id: 3, nama: 'Graph', kategori: 'Data Structure', jumlahSoal: 8 },
    { id: 4, nama: 'Dynamic Programming', kategori: 'Algorithm', jumlahSoal: 10 },
    { id: 5, nama: 'Tree', kategori: 'Data Structure', jumlahSoal: 14 },
  ]);

  // Filter tags berdasarkan pencarian
  const filteredTags = tagsList.filter(tag =>
    tag.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tag.kategori.toLowerCase().includes(searchTerm.toLowerCase())
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
            className="text-gray-700 hover:text-gray-900 transition-colors"
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
            className="text-gray-900 font-medium border-b-2 border-blue-600"
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
        <h1 className="text-3xl font-bold text-center mb-8">Manajemen Tagging</h1>
        
        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Cari tag"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <p className="text-sm text-gray-500 mt-2">
            Menampilkan {filteredTags.length} hasil pencarian
          </p>
        </div>

        {/* Tags Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden max-w-6xl mx-auto">
          <div className="bg-gray-100 px-6 py-4 border-b">
            <div className="grid grid-cols-4 gap-4">
              <h2 className="font-semibold text-gray-800">Tag</h2>
              <h2 className="font-semibold text-gray-800">Kategori</h2>
              <h2 className="font-semibold text-gray-800">Jumlah Soal</h2>
              <h2 className="font-semibold text-gray-800">Aksi</h2>
            </div>
          </div>
          
          <div className="divide-y divide-gray-200">
            {filteredTags.map((tag) => (
              <div key={tag.id} className="px-6 py-4 grid grid-cols-4 gap-4 items-center hover:bg-gray-50">
                <div className="flex items-center space-x-2">
                  <Tag className="w-4 h-4 text-blue-600" />
                  <span className="text-gray-700">{tag.nama}</span>
                </div>
                <span className="text-gray-600">{tag.kategori}</span>
                <span className="text-gray-600">{tag.jumlahSoal} soal</span>
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

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8 max-w-6xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Tags</p>
                <p className="text-2xl font-bold text-gray-900">{tagsList.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Tag className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Kategori Unik</p>
                <p className="text-2xl font-bold text-gray-900">
                  {[...new Set(tagsList.map(tag => tag.kategori))].length}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Tag className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Soal</p>
                <p className="text-2xl font-bold text-gray-900">
                  {tagsList.reduce((sum, tag) => sum + tag.jumlahSoal, 0)}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Tag className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Tambah Tag Button */}
        <div className="fixed bottom-8 right-8">
          <button className="bg-black text-white px-6 py-3 rounded-full flex items-center space-x-2 shadow-lg hover:bg-gray-800 transition-colors">
            <Plus className="w-5 h-5" />
            <span>Tambah Tag</span>
          </button>
        </div>
      </main>
    </div>
  );
};

export default TaggingAdmin;