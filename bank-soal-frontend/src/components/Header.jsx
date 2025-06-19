// src/components/Header.jsx
import { motion } from "framer-motion";
import { Link, useLocation } from "react-router-dom";
import LogoUnpar from "../assets/LogoUnpar.png";
import LogoIF from "../assets/LogoIF.jpg";
import AuthService from "../services/auth.service";

export default function Header({ currentUser }) {
  return (
    <motion.header
      className="bg-white shadow-md py-4 px-6 md:px-12 lg:px-24"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <img
            src={LogoUnpar}
            alt="Logo Unpar"
            className="h-10 w-auto"
          />
          <div className="h-8 w-px bg-gray-300"></div>
          <img
            src={LogoIF}
            alt="Logo IF"
            className="h-10 w-auto rounded"
          />
        </div>

        <nav className="flex items-center space-x-7">
          {/* Gunakan Link dari React Router untuk navigasi */}
          {[
            { name: "Home", path: "/" },
            { name: "Cari Soal", path: "/search" },
            { name: "Paket Soal", path: "/question-sets" }
          ].map((item) => {
            const location = useLocation();
            const isActive = location.pathname === item.path;
            
            return (
              <div className="relative group" key={item.name}>
                <Link to={item.path}>
                  <motion.div
                    className="relative"
                    whileHover={{ y: -2 }}
                  >
                    {isActive && (
                      <motion.div
                        className="absolute -inset-1 rounded-lg bg-gradient-to-r from-blue-700 opacity-50 blur-sm"
                        initial={{ opacity: 0 }}
                        animate={{ 
                          opacity: [0.5, 0.7, 0.5],
                          scale: [1, 1.02, 1]
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          repeatType: "reverse"
                        }}
                      />
                    )}
                    <motion.span
                      className={`relative z-10 px-4 py-2 rounded-lg font-medium cursor-pointer block
                        ${isActive 
                          ? 'text-white bg-gradient-to-r from-blue-700 to-blue-700' 
                          : 'text-gray-600 hover:text-blue-700'}`}
                    >
                      {item.name}
                    </motion.span>
                  </motion.div>
                </Link>
              </div>
            );
          })}
        </nav>

        {currentUser ? (
          <div className="flex items-center space-x-2">
            <motion.div
              className="px-6 py-2 bg-blue-100 text-blue-800 rounded-lg font-medium"
              whileHover={{ scale: 1.05 }}
            >
              {currentUser.username || currentUser.email}
            </motion.div>
            <motion.button
              onClick={() => {
                AuthService.logout();
                window.location.reload();
              }}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium transition-all duration-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Logout
            </motion.button>
          </div>
        ) : (
          <Link to="/login">
            <motion.button
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all duration-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Login
            </motion.button>
          </Link>
        )}
      </div>
    </motion.header>
  );
}