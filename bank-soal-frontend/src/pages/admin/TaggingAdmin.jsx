import React, { useState, useEffect } from 'react';
import { Search, Plus, User, LogOut, Tag, Edit, Trash2, Save, X, AlertCircle, CheckCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import MaterialTagService from '../../services/materialTag.service'; // Assuming this path is correct
import AuthService from '../../services/auth.service'; // Assuming this path is correct

const TaggingAdmin = ({ currentUser }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [tagsList, setTagsList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null); // Stores the ID of the tag to be deleted
  const [editingTagId, setEditingTagId] = useState(null); // Stores the ID of the tag being edited (renamed from editingTag for clarity)
  const [formData, setFormData] = useState({ name: '' });
  const [formErrors, setFormErrors] = useState({});
  const [currentView, setCurrentView] = useState('list'); // 'list' or 'form'
  const navigate = useNavigate();

  // Fetch tags on component mount
  useEffect(() => {
    fetchTags();
  }, []);

  const fetchTags = async () => {
    setIsLoading(true);
    setError(null); // Clear any previous errors
    try {
      const response = await MaterialTagService.getAllMaterialTag();
      setTagsList(response.data);
    } catch (err) {
      console.error("Error fetching tags:", err);
      const errorMessage = err.response?.data?.message || 'Gagal memuat data tag. Silakan coba lagi.';
      setError(errorMessage);
      showNotification(errorMessage, 'error');
      // If unauthorized/forbidden, redirect to login
      if (err.response?.status === 401 || err.response?.status === 403) {
        AuthService.logout();
        navigate('/login');
      }
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
    } else {
      // Check for duplicate name (case-insensitive), excluding the tag being edited
      const isDuplicate = tagsList.some(tag =>
        tag.name.toLowerCase() === formData.name.toLowerCase() && tag.id !== editingTagId
      );
      if (isDuplicate) {
        errors.name = 'Tag dengan nama ini sudah ada';
      }
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Handle form submit (Add/Edit)
  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsLoading(true); // Indicate loading for form submission
    setError(null); // Clear any previous errors
    try {
      if (editingTagId) { // If editingTagId has an ID, it means we are editing
        await MaterialTagService.updateMaterialTag(editingTagId, formData);
        showNotification('Tag berhasil diperbarui', 'success');
      } else { // Otherwise, we are adding a new tag
        await MaterialTagService.createMaterialTag(formData);
        showNotification('Tag berhasil ditambahkan', 'success');
      }

      resetForm(); // Reset form and hide it
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
      setIsLoading(false); // End loading for form submission
    }
  };

  // Handle delete
  const handleDelete = async (id) => {
    setIsLoading(true); // Indicate loading for delete operation
    setError(null); // Clear any previous errors
    try {
      await MaterialTagService.deleteMaterialTag(id);
      showNotification('Tag berhasil dihapus', 'success');
      setShowDeleteConfirm(null); // Hide confirmation modal
      fetchTags(); // Re-fetch tags after deletion
    } catch (err) {
      console.error("Error deleting tag:", err);
      const errorMessage = err.response?.data?.message || 'Gagal menghapus tag. Silakan coba lagi.';
      setError(errorMessage);
      showNotification(errorMessage, 'error');
      if (err.response?.status === 401 || err.response?.status === 403) {
        AuthService.logout();
        navigate('/login');
      }
    } finally {
      setIsLoading(false); // End loading for delete operation
    }
  };

  // Reset form and return to list view
  const resetForm = () => {
    setFormData({ name: '' });
    setFormErrors({});
    setEditingTagId(null);
    setCurrentView('list'); // Go back to list view
  };

  // Handle edit button click
  const handleEdit = (id) => {
    const tagToEdit = tagsList.find(t => t.id === id);
    if (tagToEdit) {
      setFormData({ name: tagToEdit.name }); // Populate form with tag's name
      setEditingTagId(id); // Set the ID of the tag being edited
      setCurrentView('form'); // Show the form for editing
    }
  };

  // Handle logout
  const handleLogout = () => {
    AuthService.logout();
    navigate('/login');
  };

  // Filter tags based on search term
  const filteredTags = tagsList.filter(tag =>
    tag.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
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
          <Link to="/admin/mata-kuliah" className="text-gray-600 hover:text-gray-900 transition-colors font-medium px-2 py-1">
            Mata Kuliah
          </Link>
          <Link to="/admin/tagging" className="text-blue-600 font-semibold relative px-2 py-1">
            Tagging
             <div className="absolute -bottom-4 left-0 right-0 h-0.5 bg-blue-600 rounded-full"></div>
          </Link>
          <Link to="/admin/course-tagging" className="text-gray-600 hover:text-gray-900 transition-colors font-medium px-2 py-1">
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
    const tag = tagsList.find(t => t.id === showDeleteConfirm);
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
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
              disabled={isLoading}
            >
              Batal
            </button>
            <button
              onClick={() => handleDelete(showDeleteConfirm)}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              disabled={isLoading}
            >
              {isLoading ? (
                <svg className="animate-spin h-5 w-5 text-white mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : 'Hapus'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30">
      <Header />
      <Notification />
      <DeleteConfirmModal />
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Manajemen Tagging</h2>
          <p className="text-gray-600">Kelola tag dalam sistem</p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-600 text-sm font-medium">Total Tag</p>
                <p className="text-2xl font-bold text-blue-900">{tagsList.length}</p>
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
                {/* Assuming all fetched tags are active. Adjust if you have an 'isActive' field */}
                <p className="text-2xl font-bold text-green-900">{tagsList.length}</p>
              </div>
              <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl border border-purple-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-600 text-sm font-medium">Tag Baru (Bulan Ini)</p>
                <p className="text-2xl font-bold text-purple-900">
                  {tagsList.filter(tag => {
                    // Check if created_at exists and is within the current month/year
                    if (!tag.created_at) return false;
                    const tagDate = new Date(tag.created_at);
                    const now = new Date();
                    return tagDate.getMonth() === now.getMonth() &&
                      tagDate.getFullYear() === now.getFullYear();
                  }).length}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center">
                <Tag className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        {currentView === 'list' && (
          <>
            {/* Search and Add Button */}
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
                onClick={() => {
                  resetForm(); // Ensure form is reset for 'add new'
                  setCurrentView('form'); // Show the form to add a new tag
                }}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-xl font-medium flex items-center space-x-2 transition-all transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                <Plus className="w-5 h-5" />
                <span>Tambah Tag Baru</span>
              </button>
            </div>

            {/* Tag List Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="px-6 py-4 bg-slate-50 border-b border-slate-200">
                <h3 className="text-lg font-semibold text-slate-800">Daftar Tag</h3>
                <p className="text-sm text-slate-600 mt-1">Total: {filteredTags.length} tag</p>
              </div>

              {isLoading && !tagsList.length ? (
                <div className="p-6 text-center text-gray-600">
                  <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                  Memuat data tag...
                </div>
              ) : error && !tagsList.length ? (
                <div className="p-6 text-center text-red-600">
                  <AlertCircle className="w-10 h-10 mx-auto mb-3" />
                  {error}
                  <button
                    onClick={fetchTags}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Coba Lagi
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[600px] divide-y divide-slate-200">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Nama Tag</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Tanggal Dibuat</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Terakhir Diubah</th>
                        <th className="px-6 py-4 text-center text-xs font-semibold text-slate-600 uppercase tracking-wider">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {filteredTags.length === 0 ? (
                        <tr>
                          <td colSpan="4" className="px-6 py-4 text-center text-slate-500">Tidak ada tag yang ditemukan.</td>
                        </tr>
                      ) : (
                        filteredTags.map((tag) => (
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
                              {tag.created_at ? new Date(tag.created_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-'}
                            </td>
                            <td className="px-6 py-4 text-slate-600">
                              {tag.updated_at ? new Date(tag.updated_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-'}
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex justify-center space-x-2">
                                <button
                                  onClick={() => handleEdit(tag.id)}
                                  className="bg-blue-100 hover:bg-blue-200 text-blue-600 p-2 rounded-lg transition-colors"
                                  title="Edit Tag"
                                  disabled={isLoading}
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => setShowDeleteConfirm(tag.id)}
                                  className="bg-red-100 hover:bg-red-200 text-red-600 p-2 rounded-lg transition-colors"
                                  title="Hapus Tag"
                                  disabled={isLoading}
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
          </>
        )}

        {/* Add/Edit Form */}
        {currentView === 'form' && ( // Only show the form when currentView is 'form'
          <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-md border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                {editingTagId ? 'Edit Tag' : 'Tambah Tag Baru'}
              </h2>
              <button
                onClick={resetForm} // Close form and reset
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                disabled={isLoading}
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
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${formErrors.name ? 'border-red-300' : 'border-gray-300'
                    }`}
                  placeholder="Masukkan nama tag"
                />
                {formErrors.name && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {formErrors.name}
                  </p>
                )}
              </div>
              <div className="flex justify-end gap-3">
                <button
                  onClick={resetForm} // Close form and reset
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  disabled={isLoading}
                >
                  Batal
                </button>
                <button
                  onClick={handleSubmit}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    <Save className="w-5 h-5" />
                  )}
                  {editingTagId ? 'Simpan Perubahan' : 'Tambah Tag'}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default TaggingAdmin;