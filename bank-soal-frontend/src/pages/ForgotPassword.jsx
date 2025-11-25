import React from 'react';
import { motion } from "framer-motion";
import { AlertCircle, ArrowLeft, Mail, Phone } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Footer from '../components/Footer';
import Header from '../components/Header';

const ForgotPasswordPage = () => {
    const navigate = useNavigate();

    // Background decorations
    const decorations = [
        { top: '10%', left: '5%', delay: 0 },
        { top: '60%', left: '8%', delay: 0.1 },
        { top: '20%', right: '8%', delay: 0.2 },
        { top: '70%', right: '5%', delay: 0.3 },
    ];

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
                        background: 'radial-gradient(circle, rgba(249,115,22,0.4) 0%, rgba(249,115,22,0) 70%)',
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
                        stroke="#f97316"
                        strokeWidth="2"
                    />
                    <circle cx="50" cy="50" r="10" fill="none" stroke="#f97316" strokeWidth="1" />
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
                        Lupa <span className="text-orange-600">Password?</span>
                    </motion.h1>
                </motion.div>

                <div className="flex justify-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-white rounded-2xl p-8 shadow-xl w-full max-w-2xl relative overflow-hidden"
                    >
                        {/* Blur effects */}
                        <div className="absolute -top-10 -left-10 w-40 h-40 bg-orange-200 rounded-full blur-3xl opacity-30"></div>
                        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-red-200 rounded-full blur-3xl opacity-30"></div>

                        <div className="relative z-10">
                            {/* Icon */}
                            <motion.div
                                className="mx-auto bg-orange-100 w-20 h-20 rounded-full flex items-center justify-center mb-6"
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.3, type: "spring" }}
                            >
                                <AlertCircle className="w-10 h-10 text-orange-600" />
                            </motion.div>

                            <motion.h2 
                                className="text-2xl font-semibold mb-4 text-center text-gray-900"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.4 }}
                            >
                                Mohon Maaf
                            </motion.h2>

                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5 }}
                                className="mb-6"
                            >
                                <div className="bg-orange-50 border-l-4 border-orange-500 p-4 mb-4">
                                    <p className="text-gray-800 text-center text-lg">
                                        Fitur <strong>Lupa Password</strong> belum tersedia saat ini.
                                    </p>
                                </div>

                                <p className="text-gray-600 text-center mb-6">
                                    Untuk sementara waktu, silakan hubungi pihak admin untuk melakukan penggantian password.
                                </p>
                            </motion.div>

                            {/* Contact Admin Section */}
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.6 }}
                                className="bg-blue-50 rounded-xl p-6 mb-6"
                            >
                               
                            </motion.div>

                            {/* Back to Login Button */}
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => navigate('/login')}
                                className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
                            >
                                <ArrowLeft className="w-5 h-5" />
                                Kembali ke Login
                            </motion.button>
                        </div>
                    </motion.div>
                </div>

                {/* Additional Info */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                    className="mt-12 max-w-2xl mx-auto"
                >
                    <div className="bg-white rounded-xl p-6 shadow-md">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">
                            Tips Keamanan Password
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                            <div className="flex items-start gap-2">
                                <div className="bg-blue-100 rounded-full p-1 mt-0.5">
                                    <AlertCircle className="w-4 h-4 text-blue-600" />
                                </div>
                                <p>Gunakan password yang kuat dengan kombinasi huruf, angka, dan simbol</p>
                            </div>
                            <div className="flex items-start gap-2">
                                <div className="bg-blue-100 rounded-full p-1 mt-0.5">
                                    <AlertCircle className="w-4 h-4 text-blue-600" />
                                </div>
                                <p>Jangan gunakan password yang sama untuk berbagai akun</p>
                            </div>
                            <div className="flex items-start gap-2">
                                <div className="bg-blue-100 rounded-full p-1 mt-0.5">
                                    <AlertCircle className="w-4 h-4 text-blue-600" />
                                </div>
                                <p>Ganti password secara berkala untuk keamanan</p>
                            </div>
                            <div className="flex items-start gap-2">
                                <div className="bg-blue-100 rounded-full p-1 mt-0.5">
                                    <AlertCircle className="w-4 h-4 text-blue-600" />
                                </div>
                                <p>Jangan bagikan password Anda kepada siapapun</p>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>

            <Footer />
        </div>
    );
};

export default ForgotPasswordPage;