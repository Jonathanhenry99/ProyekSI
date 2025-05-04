// src/components/Header.jsx
import { motion } from "framer-motion";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";

export default function Header() {
  return (
    <motion.header
      className="bg-white shadow-md py-4 px-6 md:px-12 lg:px-24"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {/* Logo Unpar - Replace with actual import */}
          <img
            src={LogoUnpar}
            alt="Logo Unpar"
            className="h-10 w-auto"
          />
          <div className="h-8 w-px bg-gray-300"></div>
          {/* Logo IF - Replace with actual import */}
          <img
            src={LogoIF}
            alt="Logo IF"
            className="h-10 w-auto rounded"
          />
        </div>

        <motion.a
          whileHover={{ scale: 1.05 }}
          className="text-gray-600 hover:text-blue-600 font-medium cursor-pointer"
          href="/"
        >
          Home
        </motion.a>

        <motion.a
          whileHover={{ scale: 1.05 }}
          className="text-gray-600 hover:text-blue-600 font-medium cursor-pointer"
          href="/search"
        >
          Cari Soal
        </motion.a>

        <motion.a
          whileHover={{ scale: 1.05 }}
          className="text-gray-600 hover:text-blue-600 font-medium cursor-pointer"
          href="/upload"
        >
          Upload
        </motion.a>

        <motion.button
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all duration-300"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Login
        </motion.button>
      </div>
    </motion.header>
  );
}