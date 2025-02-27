import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Search from './pages/Search';
import Upload from './pages/Upload';
import Create from './pages/Create';
import History from './pages/History';
import Login from './pages/Login';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/search" element={<Search />} />
        <Route path="/upload" element={<Upload />} />
        <Route path="/create" element={<Create />} />
        <Route path="/History" element={<History />} />
        <Route path="/Login" element={<Login />} />
      </Routes>
    </Router>
  );
}