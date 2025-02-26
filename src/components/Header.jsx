// src/components/Header.jsx
import { motion } from "framer-motion";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";

export default function Header() {
  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50"
    >
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <motion.div
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          className="flex items-center space-x-2"
        >
          <div className="w-8 h-8 bg-blue-600 rounded-lg" />
          <h1 className="text-2xl font-bold text-gray-800">Bank Soal</h1>
        </motion.div>
        
        <nav className="flex space-x-6">
          <motion.a 
            whileHover={{ scale: 1.05 }}
            className="text-gray-600 hover:text-blue-600 cursor-pointer"
            href="/"
          >
            Home
          </motion.a>
          <motion.a 
            whileHover={{ scale: 1.05 }}
            className="text-gray-600 hover:text-blue-600 cursor-pointer"
            href="/search"
          >
            Cari Soal
          </motion.a>
          <motion.a 
            whileHover={{ scale: 1.05 }}
            className="text-gray-600 hover:text-blue-600 cursor-pointer"
            href="/upload"
          >
            Upload
          </motion.a>
        </nav>
      </div>
    </motion.header>
  );
}