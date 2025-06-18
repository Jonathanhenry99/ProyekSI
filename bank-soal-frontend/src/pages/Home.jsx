import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Header from '../components/Header';
import Footer from '../components/Footer';
import AuthService from '../services/auth.service';

// Note: You'll need to import these images in your actual project
import LogoIF from '../assets/LogoIF.jpg';  // Updated path
import LogoUnpar from '../assets/LogoUnpar.png';  // Updated path
export default function HomePage({ currentUser }) {
  const [isLoading, setIsLoading] = useState(false); // Ubah nilai awal menjadi false

  // Hapus useEffect untuk loading
  // useEffect(() => {
  //   // Simulate loading time
  //   const timer = setTimeout(() => {
  //     setIsLoading(false);
  //   }, 1500);
  //
  //   return () => clearTimeout(timer);
  // }, []);

  return (
    <div className="flex flex-col min-h-screen bg-white text-gray-800 overflow-hidden">
      {isLoading ? (
        <LoadingAnimation />
      ) : (
        <>
          <Header currentUser={currentUser} />
          <main className="flex-grow">
            {/* Hero Section */}
            <HeroSection />

            {/* Study Concept Section */}
            <StudyConceptSection />

            {/* Get Started Section */}
            {/* fitur tambahan jika ada update */}
            {/* <GetStartedSection /> */}
          </main>
          <Footer />

          {/* Animated Background Elements */}
          <BackgroundElements />
        </>
      )}
    </div>
  );
}

// Hero Section Component
const HeroSection = () => {

  return (
    <section className="pt-12 pb-16 px-6 md:px-12 lg:px-24 relative overflow-hidden">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-12">
          <motion.div
            className="md:w-1/2 space-y-6"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.h1
              className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 1 }}
            >
              Bank Soal <span className="text-blue-600">Informatika</span>
            </motion.h1>

            <motion.p
              className="text-lg md:text-xl text-gray-600"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 1 }}
            >
              Atur, Kelola, dan Akses Soal dengan Mudah dan Terstruktur            </motion.p>

          </motion.div>

          <motion.div
            className="md:w-1/2"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <IllustrationComponent />
          </motion.div>
        </div>
      </div>

      {/* Decorative Elements */}
      <motion.div
        className="absolute top-20 left-10 w-16 h-16 rounded-full bg-blue-100"
        animate={{
          y: [0, -20, 0],
          scale: [1, 1.1, 1]
        }}
        transition={{
          repeat: Infinity,
          duration: 4,
        }}
      />
      <motion.div
        className="absolute bottom-20 right-10 w-8 h-8 rounded-full bg-blue-200"
        animate={{
          y: [0, -15, 0],
          scale: [1, 1.1, 1]
        }}
        transition={{
          repeat: Infinity,
          duration: 3,
          delay: 1
        }}
      />
    </section>
  );
};

// Animated Illustration Component
const IllustrationComponent = () => {
  return (
    <div className="relative h-80 md:h-96 w-full">
      {/* Base Circle */}
      <motion.div
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-gradient-to-tr from-blue-50 to-blue-100"
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 6, repeat: Infinity }}
      />

      {/* Book */}
      <motion.div
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white shadow-lg rounded-md h-40 w-32 border border-gray-200"
        initial={{ y: 20, rotateZ: -10 }}
        animate={{ y: [0, -10, 0], rotateZ: [-5, 5, -5] }}
        transition={{ duration: 5, repeat: Infinity }}
      >
        <div className="h-full w-1/4 bg-blue-600 absolute left-0 top-0"></div>
        <div className="absolute top-1/4 left-1/3 w-16 h-2 bg-gray-300"></div>
        <div className="absolute top-1/3 left-1/3 w-12 h-2 bg-gray-300"></div>
        <div className="absolute top-1/2 left-1/3 w-14 h-2 bg-gray-300"></div>
      </motion.div>

      {/* Pencil */}
      <motion.div
        className="absolute top-1/3 right-1/4 h-24 w-4 bg-yellow-400 transform rotate-45"
        animate={{ rotate: [45, 35, 45] }}
        transition={{ duration: 4, repeat: Infinity }}
      >
        <div className="h-4 w-4 bg-pink-500"></div>
        <div className="absolute bottom-0 w-0 h-0 border-l-8 border-r-8 border-b-8 border-l-transparent border-r-transparent border-b-gray-700"></div>
      </motion.div>

      {/* Floating Elements */}
      <motion.div
        className="absolute top-1/4 left-1/3 w-8 h-8 rounded bg-blue-400"
        animate={{ y: [-10, 10, -10], rotate: [0, 15, 0] }}
        transition={{ duration: 4, repeat: Infinity }}
      />

      <motion.div
        className="absolute bottom-1/4 right-1/3 w-6 h-6 rounded-full bg-green-400"
        animate={{ x: [-10, 10, -10], y: [5, -5, 5] }}
        transition={{ duration: 5, repeat: Infinity }}
      />

      <motion.div
        className="absolute top-2/3 left-1/4 w-5 h-5 rounded-full bg-yellow-300"
        animate={{ x: [10, -10, 10], y: [-5, 5, -5] }}
        transition={{ duration: 4.5, repeat: Infinity }}
      />
    </div>
  );
};

// Study Concept Section Component
const StudyConceptSection = () => {
  return (
    <section className="py-16 px-6 md:px-12 lg:px-24 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <motion.h2
          className="text-3xl font-bold text-center mb-16 text-gray-900"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          Fitur <span className="text-blue-600">Utama</span>
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              title: "Cari Soal",
              description: "Kemudahan mencari soal yang sudah terorganisir dengan baik",
              icon: "🕒"
            },
            {
              title: "Upload Soal",
              description: "Sistem yang menyediakan layanan upload soal dengan mudah dan cepat",
              icon: "🧠"
            },
            {
              title: "Unduh Soal",
              description: "Unduh soal yang sudah terorganisir dengan satu perintah",
              icon: "📊"
            }
          ].map((item, index) => (
            <motion.div
              key={index}
              className="bg-white rounded-xl p-6 shadow-lg"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 * index }}
              viewport={{ once: true }}
              whileHover={{ y: -10, boxShadow: '0 15px 30px rgba(0, 0, 0, 0.1)' }}
            >
              <div className="text-4xl mb-4">{item.icon}</div>
              <h3 className="text-xl font-bold mb-2 text-gray-900">{item.title}</h3>
              <p className="text-gray-600">{item.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Get Started Section Component
const GetStartedSection = () => {
  return (
    <section className="py-16 px-6 md:px-12 lg:px-24 bg-white">
      <div className="max-w-4xl mx-auto text-center">
        <motion.h2
          className="text-3xl font-bold mb-6 text-gray-900"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          Siap Meningkatkan Prestasi Akademik Anda?
        </motion.h2>

        <motion.p
          className="text-lg text-gray-600 mb-10"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
        >
          Bergabunglah dengan ribuan mahasiswa yang telah merasakan manfaat dari Bank Soal Digital kami
        </motion.p>

        <motion.button
          className="px-10 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-lg shadow-lg transition-all duration-300"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
          whileHover={{ scale: 1.05, boxShadow: '0 0 25px rgba(59, 130, 246, 0.6)' }}
          whileTap={{ scale: 0.95 }}
        >
          Daftar Sekarang
        </motion.button>
      </div>
    </section>
  );
};

//animasi loading
// Loading animation component
const LoadingAnimation = () => (
  <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-90 z-50">
    <motion.div
      animate={{
        scale: [1, 1.2, 1],
        rotate: [0, 180, 360]
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }}
      className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full"
    />
    <motion.p
      animate={{ opacity: [0.5, 1, 0.5] }}
      transition={{
        duration: 1.5,
        repeat: Infinity
      }}
      className="ml-4 text-lg font-medium text-blue-600"
    >
      Memuat Bank Soal...
    </motion.p>
  </div>
);

// Background Elements Component
const BackgroundElements = () => {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      <div className="absolute top-0 left-0 w-full h-full">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full opacity-10"
            style={{
              width: Math.random() * 200 + 50,
              height: Math.random() * 200 + 50,
              background: `radial-gradient(circle, rgba(59, 130, 246, 0.3) 0%, rgba(59, 130, 246, 0.1) 70%, transparent 100%)`,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
            }}
            animate={{
              x: [0, Math.random() * 30 - 15],
              y: [0, Math.random() * 30 - 15],
            }}
            transition={{
              repeat: Infinity,
              repeatType: "reverse",
              duration: Math.random() * 10 + 10,
            }}
          />
        ))}
      </div>
    </div>
  );
};