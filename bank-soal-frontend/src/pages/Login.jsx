import React, { useState } from 'react';
import { motion } from "framer-motion";
import { Mail, Lock, LogIn, EyeOff, Eye, AlertCircle } from 'lucide-react';
import Footer from '../components/Footer';
import Header from '../components/Header';
import LogoIF from '../assets/LogoIF.jpg';
import LogoUnpar from '../assets/LogoUnpar.png';
import AuthService from '../services/auth.service';
import { useNavigate } from 'react-router-dom';

const LoginPage = ({ setCurrentUser }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        // Validate inputs
        if (!email || !password) {
            setError('Email dan password harus diisi');
            setIsLoading(false);
            return;
        }

        // Call the authentication service
        AuthService.login(email, password)
            .then((response) => {
                // Update current user in parent component
                setCurrentUser(response);
                
                // Paksa reload agar App membaca user baru dari localStorage
                setTimeout(() => {
                    if (response.roles && response.roles.includes('ROLE_ADMIN')) {
                        navigate('/admin/dosen');
                    } else {
                        navigate('/');
                    }
                }, 100); // beri delay kecil agar state update
            })
            .catch(error => {
                setIsLoading(false);
                
                // Handle specific error messages from the server
                if (error.response) {
                    switch (error.response.status) {
                        case 404:
                            setError('Email tidak ditemukan');
                            break;
                        case 401:
                            setError('Password salah');
                            break;
                        case 403:
                            setError('Akun telah dinonaktifkan, hubungi administrator');
                            break;
                        default:
                            setError('Gagal masuk. Silakan coba lagi.');
                    }
                } else {
                    setError('Terjadi kesalahan. Periksa koneksi jaringan Anda.');
                }
            });
    };

    // Dekorasi background
    const decorations = [
        { top: '10%', left: '5%', delay: 0 },
        { top: '60%', left: '8%', delay: 0.1 },
        { top: '20%', right: '8%', delay: 0.2 },
        { top: '70%', right: '5%', delay: 0.3 },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-blue-50 relative overflow-hidden">
            {/* Elemen dekorasi */}
            {decorations.map((pos, index) => (
                <motion.div
                    key={index}
                    className="absolute opacity-20 z-0"
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 0.15, scale: 1, rotate: 360 }}
                    transition={{
                        duration: 20,
                        repeat: Infinity,
                        repeatType: "reverse",
                        delay: pos.delay,
                    }}
                    style={{
                        top: pos.top,
                        left: pos.left,
                        right: pos.right,
                        width: '300px',
                        height: '300px',
                        borderRadius: '50%',
                        background: 'radial-gradient(circle, rgba(59,130,246,0.4) 0%, rgba(59,130,246,0) 70%)',
                    }}
                />
            ))}

            {/* Pola teknologi */}
            <svg
                className="absolute inset-0 w-full h-full z-0 opacity-5"
                xmlns="http://www.w3.org/2000/svg"
            >
                <pattern
                    id="tech-pattern"
                    width="100"
                    height="100"
                    patternUnits="userSpaceOnUse"
                    patternTransform="rotate(10)"
                >
                    <path
                        d="M20 50 L50 20 L80 50 L50 80 Z"
                        fill="none"
                        stroke="#3b82f6"
                        strokeWidth="2"
                    />
                    <circle cx="50" cy="50" r="10" fill="none" stroke="#3b82f6" strokeWidth="1" />
                </pattern>
                <rect width="100%" height="100%" fill="url(#tech-pattern)" />
            </svg>

            <Header currentUser={null} />

            <div className="container mx-auto px-4 py-16 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-8"
                >
                    <motion.h1
                        className="text-4xl md:text-5xl font-bold mb-3 text-gray-900"
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        Bank Soal <span className="text-blue-600">Informatika</span>
                    </motion.h1>
                    <p className="text-xl text-gray-600">Masuk untuk mengakses kumpulan soal teknologi informasi</p>
                </motion.div>

                <div className="flex justify-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-white rounded-2xl p-8 shadow-xl w-full max-w-md relative overflow-hidden"
                    >
                        {/* Efek blur pada sudut form */}
                        <div className="absolute -top-10 -left-10 w-40 h-40 bg-blue-200 rounded-full blur-3xl opacity-30"></div>
                        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-indigo-200 rounded-full blur-3xl opacity-30"></div>

                        <div className="relative z-10">
                            {/* Login Icon */}
                            <motion.div
                                className="mx-auto bg-blue-100 w-20 h-20 rounded-full flex items-center justify-center mb-6"
                                whileHover={{ rotate: 10, scale: 1.05 }}
                            >
                                <LogIn className="w-10 h-10 text-blue-600" />
                            </motion.div>

                            <h2 className="text-2xl font-semibold mb-6 text-center text-gray-900">
                                Masuk ke Akun Anda
                            </h2>

                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="mb-4 p-3 bg-red-50 text-red-800 rounded-lg flex items-center gap-2"
                                >
                                    <AlertCircle className="w-5 h-5" />
                                    <span>{error}</span>
                                </motion.div>
                            )}

                            <form onSubmit={handleLogin} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium mb-2 text-gray-700">Email</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Mail className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="w-full pl-10 px-4 py-3 bg-gray-50 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                                            placeholder="nama@example.com"
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2 text-gray-700">Password</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Lock className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="w-full pl-10 px-4 py-3 bg-gray-50 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                                            placeholder="Password Anda"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                        >
                                            {showPassword ? (
                                                <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                                            ) : (
                                                <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                                            )}
                                        </button>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <input
                                            id="remember-me"
                                            type="checkbox"
                                            className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                        />
                                        <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                                            Ingat saya
                                        </label>
                                    </div>
                                    <div className="text-sm">
                                        <a
                                            href="#"
                                            className="font-medium text-blue-600 hover:text-blue-500 hover:underline"
                                        >
                                            Lupa password?
                                        </a>
                                    </div>
                                </div>

                                <motion.button
                                    type="submit"
                                    whileHover={{ scale: 1.02, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)" }}
                                    whileTap={{ scale: 0.98 }}
                                    className={`w-full py-3 px-4 flex justify-center items-center gap-2 rounded-xl font-semibold text-white transition-colors ${isLoading ? "bg-blue-400" : "bg-blue-600 hover:bg-blue-700"
                                        }`}
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <>
                                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            <span>Memproses...</span>
                                        </>
                                    ) : (
                                        <>
                                            <LogIn className="w-5 h-5" />
                                            <span>Masuk</span>
                                        </>
                                    )}
                                </motion.button>
                            </form>


                        </div>
                    </motion.div>
                </div>

                {/* Fitur Tambahan */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="mt-12 text-center"
                >
                    <h3 className="text-xl font-semibold text-gray-800 mb-4">
                        Fitur Bank Soal Teknologi
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                        <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow">
                            <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                            <h4 className="font-semibold text-gray-800 mb-2">Ribuan Soal</h4>
                            <p className="text-gray-600 text-sm">
                                Akses berbagai soal teknologi dari berbagai mata kuliah
                            </p>
                        </div>
                        <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow">
                            <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                                </svg>
                            </div>
                            <h4 className="font-semibold text-gray-800 mb-2">Filter Cerdas</h4>
                            <p className="text-gray-600 text-sm">
                                Temukan soal berdasarkan topik, tingkat kesulitan, dan dosen
                            </p>
                        </div>
                        <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow">
                            <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                </svg>
                            </div>
                            <h4 className="font-semibold text-gray-800 mb-2">Solusi Cepat</h4>
                            <p className="text-gray-600 text-sm">
                                Dapatkan akses ke kunci jawaban dan test cases lengkap
                            </p>
                        </div>
                    </div>
                </motion.div>
            </div>
            <Footer />
        </div>
    );
};

export default LoginPage;