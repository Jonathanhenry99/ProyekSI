import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Home from './pages/Home';
import Search from './pages/Search';
import Upload from './pages/Upload';
import Create from './pages/Create';
import History from './pages/History'; // Hapus jika tidak digunakan
import Login from './pages/Login';
import AuthService from './services/auth.service';
import QuestionSets from './pages/QuestionSets';
import MataKuliahAdmin from './pages/admin/MataKuliahAdmin'; // Tambahkan import ini
import DosenPage from './pages/admin/DosenPage';
export default function App() {
  const [currentUser, setCurrentUser] = useState(undefined);
  
  useEffect(() => {
    const user = AuthService.getCurrentUser();
    if (user) {
      setCurrentUser(user);
    }
  }, []);

  // Protected Route component
  const ProtectedRoute = ({ children }) => {
    if (!currentUser) {
      return <Navigate to="/login" />;
    }
    return children;
  };

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home currentUser={currentUser} />} />
        <Route path="/login" element={<Login setCurrentUser={setCurrentUser} />} />
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
        <Route path="/matakuliah-admin" element={
         
            <MataKuliahAdmin currentUser={currentUser} />
          
        } />
        
        <Route path="/dosen-admin" element={
         
         <DosenPage currentUser={currentUser} />
       
     } />
      </Routes>
    </Router>
  );
}