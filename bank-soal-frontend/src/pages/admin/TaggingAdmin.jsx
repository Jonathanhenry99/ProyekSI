import React, { useState, useEffect } from 'react';
import { Search, Plus, User, LogOut, Tag, Edit, Trash2, Save, X, AlertCircle, CheckCircle } from 'lucide-react';
import CourseTagService from '../../services/courseTag.service';
import AuthService from '../../services/auth.service';

const TaggingAdmin = ({ currentUser }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [tagsList, setTagsList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [editingTag, setEditingTag] = useState(null);
  const [formData, setFormData] = useState({ name: '' });
  const [formErrors, setFormErrors] = useState({});

  // Fetch tags on component mount
  useEffect(() => {
    fetchTags();
  }, []);

  const fetchTags = async () => {
    try {
      setIsLoading(true);
      const response = await CourseTagService.getAllCourseTags();
      setTagsList(response.data);
      setError(null);
    } catch (err) {
      setError('Gagal memuat data tag. Silakan coba lagi.');
      console.error('Error fetching tags:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Show notification
  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // Validate form
  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) {
      errors.name = 'Nama tag harus diisi';
    }
    // Check for duplicate names
    const isDuplicate = tagsList.some(tag => 
      tag.name.toLowerCase() === formData.name.toLowerCase() && tag.id !== editingTag?.id
    );
    if (isDuplicate) {
      errors.name = 'Tag dengan nama ini sudah ada';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Handle form submit
  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      if (editingTag) {
        await CourseTagService.updateCourseTag(editingTag.id, formData);
        showNotification('Tag berhasil diperbarui');
      } else {
        await CourseTagService.createCourseTag(formData);
        showNotification('Tag berhasil ditambahkan');
      }
      resetForm();
      fetchTags();
    } catch (err) {
      showNotification(err.response?.data?.message || 'Terjadi kesalahan', 'error');
    }
  };

  // Handle delete
  const handleDelete = async (id) => {
    try {
      await CourseTagService.deleteCourseTag(id);
      showNotification('Tag berhasil dihapus');
      setShowDeleteConfirm(null);
      fetchTags();
    } catch (err) {
      showNotification(err.response?.data?.message || 'Gagal menghapus tag', 'error');
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({ name: '' });
    setFormErrors({});
    setEditingTag(null);
  };

  // Handle edit
  const handleEdit = (tag) => {
    setFormData({ name: tag.name });
    setEditingTag(tag);
  };

  // Handle logout
  const handleLogout = () => {
    AuthService.logout();
    window.location.href = '/login';
  };

  // Filter tags based on search
  const filteredTags = tagsList.filter(tag =>
    tag.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Header Component
  const Header = () => (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex justify-between items-center max-w-7xl mx-auto">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-3">
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
            Hi, {currentUser?.username || 'Admin'}
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
    
    const tag = tagsList.find(t => t.id === showDeleteConfirm);
    
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-in fade-in duration-200">
        <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 animate-in zoom-in-95 duration-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <Trash2 className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Hapus Tag</h3>
              <p className="text-sm text-gray-500">Aksi ini tidak dapat dibatalkan</p>
            </div>
          </div>
          
          <p className="text-gray-700 mb-6">
            Apakah Anda yakin ingin menghapus tag <strong>"{tag?.name}"</strong>?
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

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Memuat data...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-600 mx-auto" />
          <p className="mt-4 text-gray-600">{error}</p>
          <button
            onClick={fetchTags}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <Notification />
      <DeleteConfirmModal />
      
      <main className="max-w-7xl mx-auto px-6 py-8">
        <h1 className="text-3xl font-bold text-center mb-8">Manajemen Tagging</h1>
        
        {/* Search and Add Form */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Cari tag"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <button
              onClick={() => {
                resetForm();
                setEditingTag(null);
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Tambah Tag
            </button>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            Menampilkan {filteredTags.length} hasil pencarian
          </p>
        </div>

        {/* Add/Edit Form */}
        {editingTag !== null && (
          <div className="max-w-2xl mx-auto mb-8 bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                {editingTag ? 'Edit Tag' : 'Tambah Tag Baru'}
              </h2>
              <button
                onClick={resetForm}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Nama Tag
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    formErrors.name ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Masukkan nama tag"
                />
                {formErrors.name && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.name}</p>
                )}
              </div>
              
              <div className="flex justify-end gap-3">
                <button
                  onClick={resetForm}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  onClick={handleSubmit}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <Save className="w-5 h-5" />
                  {editingTag ? 'Simpan Perubahan' : 'Tambah Tag'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tags Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden max-w-6xl mx-auto">
          <div className="bg-gray-100 px-6 py-4 border-b">
            <div className="grid grid-cols-3 gap-4">
              <h2 className="font-semibold text-gray-800">Tag</h2>
              <h2 className="font-semibold text-gray-800">Tanggal Dibuat</h2>
              <h2 className="font-semibold text-gray-800">Aksi</h2>
            </div>
          </div>
          
          <div className="divide-y divide-gray-200">
            {filteredTags.map((tag) => (
              <div key={tag.id} className="px-6 py-4 grid grid-cols-3 gap-4 items-center hover:bg-gray-50">
                <div className="flex items-center space-x-2">
                  <Tag className="w-4 h-4 text-blue-600" />
                  <span className="text-gray-700">{tag.name}</span>
                </div>
                <span className="text-gray-600">
                  {new Date(tag.createdAt).toLocaleDateString('id-ID', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(tag)}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
                  >
                    <Edit className="w-4 h-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(tag.id)}
                    className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors flex items-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
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
                <p className="text-sm font-medium text-gray-600">Tags Aktif</p>
                <p className="text-2xl font-bold text-gray-900">{tagsList.length}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Tag className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tags Baru (Bulan Ini)</p>
                <p className="text-2xl font-bold text-gray-900">
                  {tagsList.filter(tag => {
                    const tagDate = new Date(tag.createdAt);
                    const now = new Date();
                    return tagDate.getMonth() === now.getMonth() && 
                           tagDate.getFullYear() === now.getFullYear();
                  }).length}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Tag className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default TaggingAdmin;