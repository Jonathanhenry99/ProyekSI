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
import CourseTaggingAdmin from './pages/admin/CourseTaggingAdmin'; // New import
import AdminPage from './pages/admin/AdminPage';
import QuestionPreview from './pages/QuestionPreview';

import DosenPage from './pages/admin/DosenPage';

export default function App() {
  const [currentUser, setCurrentUser] = useState(undefined);
  const [isLoading, setIsLoading] = useState(true);
  
  // *** DEVELOPMENT MODE - Set to true to bypass admin authentication ***
  const DEVELOPMENT_MODE = true; // Change to false in production
  
  useEffect(() => {
    // Check for user in localStorage on app start
    const user = AuthService.getCurrentUser();
    if (user) {
      setCurrentUser(user);
    }
    setIsLoading(false);
  }, []);

  // Listen for storage changes (when user logs in/out in another tab)
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'user') {
        if (e.newValue) {
          setCurrentUser(JSON.parse(e.newValue));
        } else {
          setCurrentUser(undefined);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Protected Route component for regular users
  const ProtectedRoute = ({ children }) => {
    if (isLoading) {
      return <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>;
    }
    
    if (!currentUser) {
      return <Navigate to="/login" />;
    }
    return children;
  };

  // Protected Route component for admin users
  const AdminRoute = ({ children }) => {
    if (isLoading) {
      return <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>;
    }
    
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
            <Navigate to="/admin/dosen" />
          </AdminRoute>
        } />
        
        {/* Admin Dosen Management */}
        <Route path="/admin/dosen" element={
          <AdminRoute>
            <AdminPage currentUser={currentUser} />
          </AdminRoute>
        } />
        
        {/* Admin Mata Kuliah Management */}
        <Route path="/admin/mata-kuliah" element={
          <AdminRoute>
            <MataKuliahAdmin currentUser={currentUser} />
          </AdminRoute>
        } />
        
        {/* Admin Tagging Management */}
        <Route path="/admin/tagging" element={
          <AdminRoute>
            <TaggingAdmin currentUser={currentUser} />
          </AdminRoute>
        } />
        
        {/* Admin Course Tagging Management - NEW ROUTE */}
        <Route path="/admin/course-tagging" element={
          <AdminRoute>
            <CourseTaggingAdmin currentUser={currentUser} />
          </AdminRoute>
        } />
        
        {/* *** DEVELOPMENT ONLY - Direct Admin Routes *** */}
        {DEVELOPMENT_MODE && (
          <>
            <Route path="/dev/admin" element={<Navigate to="/dev/admin/mata-kuliah" />} />
            <Route path="/dev/admin/mata-kuliah" element={<MataKuliahAdmin currentUser={currentUser} />} />
            <Route path="/dev/admin/dosen" element={
              <div className="p-8 text-center">
                <h1 className="text-2xl font-bold">Halaman Dosen Admin (DEV)</h1>
                <p className="text-gray-600 mt-2">Coming Soon...</p>
              </div>
            } />
            <Route path="/dev/admin/tagging" element={<TaggingAdmin currentUser={currentUser} />} />
            {/* Development Course Tagging Route - NEW */}
            <Route path="/dev/admin/course-tagging" element={<CourseTaggingAdmin currentUser={currentUser} />} />
          </>
        )}
        
        {/* Tambahkan route baru untuk preview soal */}
        <Route path="/preview/:id" element={<QuestionPreview currentUser={currentUser} />} />
        
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
      </Routes>
    </Router>
  );
}