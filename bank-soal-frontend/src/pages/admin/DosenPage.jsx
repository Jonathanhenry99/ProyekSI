import React, { useState } from 'react';
import { Search, Plus, Edit, Trash2, User, Mail, Lock, Eye, EyeOff, X } from 'lucide-react';

const DosenPage = () => {
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showRePassword, setShowRePassword] = useState(false);
  const [formData, setFormData] = useState({
    nama: '',
    email: '',
    password: '',
    rePassword: ''
  });

  // Data dummy dosen
  const [dosenList, setDosenList] = useState([
    { id: 1, nama: 'Dr. Ahmad Susanto', email: 'ahmad.susanto@unpar.ac.id', status: 'Aktif' },
    { id: 2, nama: 'Dr. Siti Rahayu', email: 'siti.rahayu@unpar.ac.id', status: 'Aktif' },
    { id: 3, nama: 'Prof. Budi Santoso', email: 'budi.santoso@unpar.ac.id', status: 'Aktif' },
    { id: 4, nama: 'Dr. Maria Fernanda', email: 'maria.fernanda@unpar.ac.id', status: 'Nonaktif' },
    { id: 5, nama: 'Dr. Rizki Pratama', email: 'rizki.pratama@unpar.ac.id', status: 'Aktif' },
    { id: 6, nama: 'Prof. Dewi Lestari', email: 'dewi.lestari@unpar.ac.id', status: 'Aktif' },
    { id: 7, nama: 'Dr. Andi Wijaya', email: 'andi.wijaya@unpar.ac.id', status: 'Aktif' }
  ]);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = () => {
    if (formData.password !== formData.rePassword) {
      alert('Password tidak cocok!');
      return;
    }
    
    const newDosen = {
      id: dosenList.length + 1,
      nama: formData.nama,
      email: formData.email,
      status: 'Aktif'
    };
    
    setDosenList([...dosenList, newDosen]);
    setFormData({ nama: '', email: '', password: '', rePassword: '' });
    setShowForm(false);
  };

  const handleDelete = (id) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus dosen ini?')) {
      setDosenList(dosenList.filter(dosen => dosen.id !== id));
    }
  };

  const filteredDosen = dosenList.filter(dosen =>
    dosen.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
    dosen.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <img 
                  src="/src/assets/LogoIF.jpg" 
                  alt="Logo Informatika UNPAR" 
                  className="h-10 w-auto"
                />
               
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <nav className="flex space-x-8">
                <a href="#" className="text-slate-600 hover:text-blue-600 font-medium transition-colors">Dosen</a>
                <a href="#" className="text-slate-600 hover:text-blue-600 font-medium transition-colors">Tagging</a>
              </nav>
              <div className="flex items-center space-x-3 bg-slate-100 rounded-full px-4 py-2">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm font-medium text-slate-700">Hi, Admin XYYY</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Title */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-slate-800 mb-2">Manajemen Dosen</h2>
          <p className="text-slate-600">Kelola data dosen dan akun akses sistem</p>
        </div>

        {/* Search and Add Button */}
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
            onClick={() => setShowForm(true)}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-xl font-medium flex items-center space-x-2 transition-all transform hover:scale-105 shadow-lg hover:shadow-xl"
          >
            <Plus className="w-5 h-5" />
            <span>Tambah Dosen</span>
          </button>
        </div>

        {/* Dosen List */}
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
                {filteredDosen.map((dosen) => (
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
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                        dosen.status === 'Aktif' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {dosen.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center space-x-2">
                        <button className="bg-blue-100 hover:bg-blue-200 text-blue-600 p-2 rounded-lg transition-colors">
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
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add Dosen Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center p-6 border-b border-slate-200">
                <h3 className="text-xl font-semibold text-slate-800">Tambah Akun Dosen</h3>
                <button
                  onClick={() => setShowForm(false)}
                  className="text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Nama Dosen
                  </label>
                  <input
                    type="text"
                    name="nama"
                    value={formData.nama}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Masukkan nama lengkap dosen"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="nama@unpar.ac.id"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all pr-12"
                      placeholder="Masukkan password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Konfirmasi Password
                  </label>
                  <div className="relative">
                    <input
                      type={showRePassword ? 'text' : 'password'}
                      name="rePassword"
                      value={formData.rePassword}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all pr-12"
                      placeholder="Ulangi password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowRePassword(!showRePassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showRePassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="flex-1 px-4 py-3 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl font-medium transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmit}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-medium transition-all transform hover:scale-105"
                  >
                    Simpan Akun
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DosenPage;