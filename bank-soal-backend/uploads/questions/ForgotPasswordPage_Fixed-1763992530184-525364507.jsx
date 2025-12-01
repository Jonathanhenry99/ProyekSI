import React, { useState } from 'react';
import { motion } from "framer-motion";
import { Mail, ArrowLeft, Send, CheckCircle, AlertCircle, Wifi, WifiOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Footer from '../components/Footer';
import Header from '../components/Header';

// Helper function to safely get environment variables
const getApiUrl = () => {
    // Try different environment variable patterns
    if (typeof import !== 'undefined' && import.meta?.env?.VITE_API_URL) {
        return import.meta.env.VITE_API_URL;
    }
    
    if (typeof window !== 'undefined' && window.REACT_APP_API_URL) {
        return window.REACT_APP_API_URL;
    }
    
    // Fallback to default
    return 'http://localhost:8080/api';
};

// Helper function to check if we're in development
const isDevelopment = () => {
    // Try different ways to detect development mode
    if (typeof import !== 'undefined' && import.meta?.env?.MODE) {
        return import.meta.env.MODE === 'development';
    }
    
    if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
        return true;
    }
    
    return false;
};

const ForgotPasswordPage = () => {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [networkStatus, setNetworkStatus] = useState(navigator.onLine);
    const navigate = useNavigate();

    // Monitor network status
    React.useEffect(() => {
        const handleOnline = () => setNetworkStatus(true);
        const handleOffline = () => setNetworkStatus(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        // Check network status first
        if (!networkStatus) {
            setError('Tidak ada koneksi internet. Periksa koneksi jaringan Anda.');
            setIsLoading(false);
            return;
        }

        // Validate email
        if (!email) {
            setError('Email harus diisi');
            setIsLoading(false);
            return;
        }

        if (!validateEmail(email)) {
            setError('Format email tidak valid');
            setIsLoading(false);
            return;
        }

        try {
            const API_URL = getApiUrl();
            
            // Log API URL for debugging
            console.log('API URL:', API_URL);
            console.log('Sending request to:', `${API_URL}/auth/forgot-password`);

            // Add timeout and better error handling
            const response = await axios.post(`${API_URL}/auth/forgot-password`, 
                { email }, 
                {
                    timeout: 10000, // 10 second timeout
                    headers: {
                        'Content-Type': 'application/json',
                    }
                }
            );

            console.log('Response:', response.data);

            if (response.data.success) {
                setSuccess(true);
                // Redirect to login after 5 seconds
                setTimeout(() => {
                    navigate('/login');
                }, 5000);
            } else {
                setError(response.data.message || 'Gagal mengirim email reset password');
            }
        } catch (error) {
            setIsLoading(false);
            console.error('API Error:', error);

            if (error.code === 'ECONNABORTED') {
                setError('Koneksi timeout. Server mungkin sedang lambat, coba lagi.');
                return;
            }

            if (error.response) {
                // Server responded with error status
                console.log('Error response:', error.response.data);
                console.log('Error status:', error.response.status);
                
                switch (error.response.status) {
                    case 404:
                        setError('Email tidak terdaftar dalam sistem');
                        break;
                    case 400:
                        setError(error.response.data?.message || 'Email tidak valid');
                        break;
                    case 500:
                        setError('Terjadi kesalahan pada server. Silakan coba lagi nanti.');
                        break;
                    case 429:
                        setError('Terlalu banyak permintaan. Silakan tunggu beberapa menit.');
                        break;
                    default:
                        setError(`Server error (${error.response.status}). Silakan coba lagi.`);
                }
            } else if (error.request) {
                // Request was made but no response received
                console.log('No response received:', error.request);
                if (!navigator.onLine) {
                    setError('Tidak ada koneksi internet. Periksa koneksi jaringan Anda.');
                } else {
                    setError('Server tidak dapat dijangkau. Periksa koneksi jaringan atau coba lagi nanti.');
                }
            } else {
                // Something else happened
                console.log('Request setup error:', error.message);
                setError('Terjadi kesalahan. Silakan coba lagi.');
            }
        }
    };

    // Background decorations
    const decorations = [
        { top: '10%', left: '5%', delay: 0 },
        { top: '60%', left: '8%', delay: 0.1 },
        { top: '20%', right: '8%', delay: 0.2 },
        { top: '70%', right: '5%', delay: 0.3 },
    ];

    if (success) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-gray-50 to-blue-50 relative overflow-hidden">
                {/* Decorative elements */}
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
                            background: 'radial-gradient(circle, rgba(34,197,94,0.4) 0%, rgba(34,197,94,0) 70%)',
                        }}
                    />
                ))}

                <Header currentUser={null} />

                <div className="container mx-auto px-4 py-16 relative z-10">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="max-w-md mx-auto bg-white rounded-2xl p-8 shadow-xl text-center"
                    >
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1, rotate: 360 }}
                            transition={{ delay: 0.2, type: "spring" }}
                            className="mx-auto bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mb-6"
                        >
                            <CheckCircle className="w-12 h-12 text-green-600" />
                        </motion.div>

                        <h2 className="text-2xl font-bold text-gray-900 mb-4">
                            Email Terkirim!
                        </h2>

                        <p className="text-gray-600 mb-6">
                            Kami telah mengirimkan link reset password ke email <strong>{email}</strong>.
                            Silakan cek inbox atau folder spam Anda.
                        </p>

                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                            <p className="text-sm text-blue-800">
                                <strong>Catatan:</strong> Link akan kadaluarsa dalam 1 jam.
                            </p>
                        </div>

                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => navigate('/login')}
                            className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
                        >
                            <ArrowLeft className="w-5 h-5" />
                            Kembali ke Login
                        </motion.button>
                    </motion.div>
                </div>

                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-blue-50 relative overflow-hidden">
            {/* Network Status Indicator */}
            {!networkStatus && (
                <motion.div
                    initial={{ opacity: 0, y: -50 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="fixed top-0 left-0 right-0 bg-red-500 text-white p-2 text-center z-50"
                >
                    <div className="flex items-center justify-center gap-2">
                        <WifiOff className="w-4 h-4" />
                        <span>Tidak ada koneksi internet</span>
                    </div>
                </motion.div>
            )}

            {/* Decorative elements */}
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

            {/* Tech pattern background */}
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
                        Lupa <span className="text-blue-600">Password?</span>
                    </motion.h1>
                    <p className="text-xl text-gray-600">
                        Tidak masalah, kami akan mengirimkan link reset password ke email Anda
                    </p>
                </motion.div>

                <div className="flex justify-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-white rounded-2xl p-8 shadow-xl w-full max-w-md relative overflow-hidden"
                    >
                        {/* Blur effects */}
                        <div className="absolute -top-10 -left-10 w-40 h-40 bg-blue-200 rounded-full blur-3xl opacity-30"></div>
                        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-indigo-200 rounded-full blur-3xl opacity-30"></div>

                        <div className="relative z-10">
                            {/* Icon */}
                            <motion.div
                                className="mx-auto bg-blue-100 w-20 h-20 rounded-full flex items-center justify-center mb-6"
                                whileHover={{ rotate: 10, scale: 1.05 }}
                            >
                                <Mail className="w-10 h-10 text-blue-600" />
                            </motion.div>

                            <h2 className="text-2xl font-semibold mb-2 text-center text-gray-900">
                                Reset Password
                            </h2>

                            <p className="text-center text-gray-600 mb-6">
                                Masukkan email Anda dan kami akan mengirimkan link untuk reset password
                            </p>

                            {/* Network Status in Form */}
                            <div className="mb-4 flex items-center justify-center gap-2 text-sm">
                                {networkStatus ? (
                                    <div className="flex items-center gap-2 text-green-600">
                                        <Wifi className="w-4 h-4" />
                                        <span>Terhubung ke internet</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2 text-red-600">
                                        <WifiOff className="w-4 h-4" />
                                        <span>Tidak ada koneksi internet</span>
                                    </div>
                                )}
                            </div>

                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="mb-4 p-3 bg-red-50 text-red-800 rounded-lg flex items-center gap-2"
                                >
                                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                                    <span className="text-sm">{error}</span>
                                </motion.div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium mb-2 text-gray-700">
                                        Email
                                    </label>
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
                                            disabled={isLoading || !networkStatus}
                                        />
                                    </div>
                                </div>

                                <motion.button
                                    type="submit"
                                    whileHover={{ scale: 1.02, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)" }}
                                    whileTap={{ scale: 0.98 }}
                                    className={`w-full py-3 px-4 flex justify-center items-center gap-2 rounded-xl font-semibold text-white transition-colors ${
                                        isLoading || !networkStatus ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
                                    }`}
                                    disabled={isLoading || !networkStatus}
                                >
                                    {isLoading ? (
                                        <>
                                            <svg
                                                className="animate-spin h-5 w-5 text-white"
                                                xmlns="http://www.w3.org/2000/svg"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                            >
                                                <circle
                                                    className="opacity-25"
                                                    cx="12"
                                                    cy="12"
                                                    r="10"
                                                    stroke="currentColor"
                                                    strokeWidth="4"
                                                ></circle>
                                                <path
                                                    className="opacity-75"
                                                    fill="currentColor"
                                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                                ></path>
                                            </svg>
                                            <span>Mengirim...</span>
                                        </>
                                    ) : !networkStatus ? (
                                        <>
                                            <WifiOff className="w-5 h-5" />
                                            <span>Tidak Ada Koneksi</span>
                                        </>
                                    ) : (
                                        <>
                                            <Send className="w-5 h-5" />
                                            <span>Kirim Link Reset</span>
                                        </>
                                    )}
                                </motion.button>
                            </form>

                            <div className="mt-6 text-center">
                                <button
                                    onClick={() => navigate('/login')}
                                    className="text-blue-600 hover:text-blue-700 font-medium hover:underline flex items-center justify-center gap-2 mx-auto"
                                >
                                    <ArrowLeft className="w-4 h-4" />
                                    Kembali ke Login
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Info Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="mt-12 max-w-2xl mx-auto"
                >
                    <div className="bg-white rounded-xl p-6 shadow-md">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">
                            Tips Keamanan & Troubleshooting
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                            <div className="flex items-start gap-2">
                                <div className="bg-blue-100 rounded-full p-1 mt-0.5">
                                    <CheckCircle className="w-4 h-4 text-blue-600" />
                                </div>
                                <p>Gunakan password yang kuat dengan kombinasi huruf, angka, dan simbol</p>
                            </div>
                            <div className="flex items-start gap-2">
                                <div className="bg-blue-100 rounded-full p-1 mt-0.5">
                                    <CheckCircle className="w-4 h-4 text-blue-600" />
                                </div>
                                <p>Jangan gunakan password yang sama untuk berbagai akun</p>
                            </div>
                            <div className="flex items-start gap-2">
                                <div className="bg-blue-100 rounded-full p-1 mt-0.5">
                                    <CheckCircle className="w-4 h-4 text-blue-600" />
                                </div>
                                <p>Link reset password hanya berlaku selama 1 jam</p>
                            </div>
                            <div className="flex items-start gap-2">
                                <div className="bg-blue-100 rounded-full p-1 mt-0.5">
                                    <CheckCircle className="w-4 h-4 text-blue-600" />
                                </div>
                                <p>Hubungi admin jika tidak menerima email dalam 5 menit</p>
                            </div>
                            <div className="flex items-start gap-2">
                                <div className="bg-orange-100 rounded-full p-1 mt-0.5">
                                    <AlertCircle className="w-4 h-4 text-orange-600" />
                                </div>
                                <p>Pastikan koneksi internet stabil saat mengirim permintaan</p>
                            </div>
                            <div className="flex items-start gap-2">
                                <div className="bg-orange-100 rounded-full p-1 mt-0.5">
                                    <AlertCircle className="w-4 h-4 text-orange-600" />
                                </div>
                                <p>Cek konsol browser (F12) jika ada masalah teknis</p>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Debug Info (only in development) */}
                {isDevelopment() && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                        className="mt-8 max-w-2xl mx-auto"
                    >
                        <div className="bg-gray-100 rounded-xl p-4 text-sm">
                            <h4 className="font-semibold text-gray-800 mb-2">Debug Info (Development Only)</h4>
                            <div className="text-gray-600 space-y-1">
                                <p><strong>API URL:</strong> {getApiUrl()}</p>
                                <p><strong>Network Status:</strong> {networkStatus ? 'Online' : 'Offline'}</p>
                                <p><strong>User Agent:</strong> {navigator.userAgent.substring(0, 50)}...</p>
                                <p><strong>Environment Detection:</strong> {isDevelopment() ? 'Development' : 'Production'}</p>
                            </div>
                        </div>
                    </motion.div>
                )}
            </div>

            <Footer />
        </div>
    );
};

export default ForgotPasswordPage;