import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Home from './pages/Home';
import Search from './pages/Search';
import Upload from './pages/Upload';
import Create from './pages/Create';
import History from './pages/History';
import Login from './pages/Login';
import AuthService from './services/auth.service';
import QuestionSets from './pages/QuestionSets';
import MataKuliahAdmin from './pages/admin/MataKuliahAdmin';
import TaggingAdmin from './pages/admin/TaggingAdmin';
import QuestionPreview from './pages/QuestionPreview';

export default function App() {
  const [currentUser, setCurrentUser] = useState(undefined);
  
  useEffect(() => {
    const user = AuthService.getCurrentUser();
    if (user) {
      setCurrentUser(user);
    }
  }, []);

  // Protected Route component for regular users
  const ProtectedRoute = ({ children }) => {
    if (!currentUser) {
      return <Navigate to="/login" />;
    }
    return children;
  };

  // Protected Route component for admin users
  const AdminRoute = ({ children }) => {
    if (!currentUser) {
      return <Navigate to="/login" />;
    }
    
    // Check if user has admin role
    if (!currentUser.roles || !currentUser.roles.includes('ROLE_ADMIN')) {
      return <Navigate to="/" />;
    }
    
    return children;
  };

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home currentUser={currentUser} />} />
        <Route path="/login" element={<Login setCurrentUser={setCurrentUser} />} />
        
        {/* User Protected Routes */}
        <Route path="/search" element={
          <ProtectedRoute>
            <Search currentUser={currentUser} />
          </ProtectedRoute>
        } />
        <Route path="/upload" element={
          <ProtectedRoute>
            <Upload currentUser={currentUser} />
          </ProtectedRoute>
        } />
        <Route path="/create" element={
          <ProtectedRoute>
            <Create currentUser={currentUser} />
          </ProtectedRoute>
        } />
        <Route path="/question-sets" element={
          <ProtectedRoute>
            <QuestionSets currentUser={currentUser} />
          </ProtectedRoute>
        } />
        
        {/* Admin Protected Routes */}
        <Route path="/admin" element={
          <AdminRoute>
            <Navigate to="/admin/mata-kuliah" />
          </AdminRoute>
        } />
        <Route path="/admin/mata-kuliah" element={
          <AdminRoute>
            <MataKuliahAdmin currentUser={currentUser} />
          </AdminRoute>
        } />
        <Route path="/admin/dosen" element={
          <AdminRoute>
            {/* Komponen DosenAdmin akan dibuat nanti */}
            <div className="p-8 text-center">
              <h1 className="text-2xl font-bold">Halaman Dosen Admin</h1>
              <p className="text-gray-600 mt-2">Coming Soon...</p>
            </div>
          </AdminRoute>
        } />
        <Route path="/admin/tagging" element={
          <AdminRoute>
            <TaggingAdmin currentUser={currentUser} />
          </AdminRoute>
        } />
        
        {/* 404 Route */}
        <Route path="*" element={
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-gray-800">404</h1>
              <p className="text-gray-600 mt-2">Halaman tidak ditemukan</p>
              <a href="/" className="text-blue-600 hover:underline mt-4 inline-block">
                Kembali ke Home
              </a>
            </div>
          </div>
        } />
        {/* Tambahkan route baru untuk preview soal */}
        <Route path="/preview/:id" element={<QuestionPreview currentUser={currentUser} />} />
      </Routes>
    </Router>
  );
}