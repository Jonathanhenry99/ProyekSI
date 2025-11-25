// import React, { useState, useEffect } from 'react';
// import { motion } from "framer-motion";
// import { Lock, Eye, EyeOff, CheckCircle, AlertCircle, KeyRound } from 'lucide-react';
// import { useNavigate, useSearchParams } from 'react-router-dom';
// import axios from 'axios';
// import Footer from '../components/Footer';
// import Header from '../components/Header';

// const ResetPasswordPage = () => {
//     const [searchParams] = useSearchParams();
//     const [newPassword, setNewPassword] = useState('');
//     const [confirmPassword, setConfirmPassword] = useState('');
//     const [showNewPassword, setShowNewPassword] = useState(false);
//     const [showConfirmPassword, setShowConfirmPassword] = useState(false);
//     const [isLoading, setIsLoading] = useState(false);
//     const [error, setError] = useState('');
//     const [success, setSuccess] = useState(false);
//     const [tokenValid, setTokenValid] = useState(null);
//     const navigate = useNavigate();

//     const token = searchParams.get('token');
//     const userId = searchParams.get('id');

//     // Validate token on component mount
//     useEffect(() => {
//         const validateToken = async () => {
//             if (!token || !userId) {
//                 setTokenValid(false);
//                 setError('Link reset password tidak valid');
//                 return;
//             }

//             try {
//                 const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';
//                 await axios.post(`${API_URL}/auth/validate-reset-token`, {
//                     token,
//                     userId: parseInt(userId)
//                 });
//                 setTokenValid(true);
//             } catch (error) {
//                 setTokenValid(false);
//                 if (error.response) {
//                     switch (error.response.status) {
//                         case 400:
//                             setError('Link reset password tidak valid atau sudah digunakan');
//                             break;
//                         case 410:
//                             setError('Link reset password telah kadaluarsa. Silakan minta link baru.');
//                             break;
//                         default:
//                             setError('Terjadi kesalahan. Silakan coba lagi.');
//                     }
//                 } else {
//                     setError('Tidak dapat terhubung ke server');
//                 }
//             }
//         };

//         validateToken();
//     }, [token, userId]);

//     const validatePassword = (password) => {
//         if (password.length < 8) {
//             return 'Password minimal 8 karakter';
//         }
//         if (!/(?=.*[a-z])/.test(password)) {
//             return 'Password harus mengandung huruf kecil';
//         }
//         if (!/(?=.*[A-Z])/.test(password)) {
//             return 'Password harus mengandung huruf besar';
//         }
//         if (!/(?=.*\d)/.test(password)) {
//             return 'Password harus mengandung angka';
//         }
//         return null;
//     };

//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         setIsLoading(true);
//         setError('');

//         // Validate passwords
//         if (!newPassword || !confirmPassword) {
//             setError('Semua field harus diisi');
//             setIsLoading(false);
//             return;
//         }

//         const passwordError = validatePassword(newPassword);
//         if (passwordError) {
//             setError(passwordError);
//             setIsLoading(false);
//             return;
//         }

//         if (newPassword !== confirmPassword) {
//             setError('Password dan konfirmasi password tidak sama');
//             setIsLoading(false);
//             return;
//         }

//         try {
//             const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';
//             const response = await axios.post(`${API_URL}/auth/reset-password`, {
//                 token,
//                 userId: parseInt(userId),
//                 newPassword
//             });

//             if (response.data.success) {
//                 setSuccess(true);
//                 // Redirect to login after 3 seconds
//                 setTimeout(() => {
//                     navigate('/login');
//                 }, 3000);
//             }
//         } catch (error) {
//             setIsLoading(false);
//             if (error.response) {
//                 switch (error.response.status) {
//                     case 400:
//                         setError('Link reset password tidak valid atau sudah digunakan');
//                         break;
//                     case 410:
//                         setError('Link reset password telah kadaluarsa');
//                         break;
//                     default:
//                         setError('Gagal mereset password. Silakan coba lagi.');
//                 }
//             } else {
//                 setError('Terjadi kesalahan. Periksa koneksi jaringan Anda.');
//             }
//         }
//     };

//     // Password strength indicator
//     const getPasswordStrength = (password) => {
//         if (!password) return { strength: 0, label: '', color: '' };
        
//         let strength = 0;
//         if (password.length >= 8) strength += 25;
//         if (/(?=.*[a-z])/.test(password)) strength += 25;
//         if (/(?=.*[A-Z])/.test(password)) strength += 25;
//         if (/(?=.*\d)/.test(password)) strength += 25;

//         if (strength <= 25) return { strength, label: 'Lemah', color: 'bg-red-500' };
//         if (strength <= 50) return { strength, label: 'Sedang', color: 'bg-yellow-500' };
//         if (strength <= 75) return { strength, label: 'Kuat', color: 'bg-blue-500' };
//         return { strength, label: 'Sangat Kuat', color: 'bg-green-500' };
//     };

//     const passwordStrength = getPasswordStrength(newPassword);

//     // Background decorations
//     const decorations = [
//         { top: '10%', left: '5%', delay: 0 },
//         { top: '60%', left: '8%', delay: 0.1 },
//         { top: '20%', right: '8%', delay: 0.2 },
//         { top: '70%', right: '5%', delay: 0.3 },
//     ];

//     // Success screen
//     if (success) {
//         return (
//             <div className="min-h-screen bg-gradient-to-b from-gray-50 to-green-50 relative overflow-hidden">
//                 {decorations.map((pos, index) => (
//                     <motion.div
//                         key={index}
//                         className="absolute opacity-20 z-0"
//                         initial={{ opacity: 0, scale: 0 }}
//                         animate={{ opacity: 0.15, scale: 1, rotate: 360 }}
//                         transition={{
//                             duration: 20,
//                             repeat: Infinity,
//                             repeatType: "reverse",
//                             delay: pos.delay,
//                         }}
//                         style={{
//                             top: pos.top,
//                             left: pos.left,
//                             right: pos.right,
//                             width: '300px',
//                             height: '300px',
//                             borderRadius: '50%',
//                             background: 'radial-gradient(circle, rgba(34,197,94,0.4) 0%, rgba(34,197,94,0) 70%)',
//                         }}
//                     />
//                 ))}

//                 <Header currentUser={null} />

//                 <div className="container mx-auto px-4 py-16 relative z-10">
//                     <motion.div
//                         initial={{ opacity: 0, scale: 0.9 }}
//                         animate={{ opacity: 1, scale: 1 }}
//                         className="max-w-md mx-auto bg-white rounded-2xl p-8 shadow-xl text-center"
//                     >
//                         <motion.div
//                             initial={{ scale: 0 }}
//                             animate={{ scale: 1, rotate: 360 }}
//                             transition={{ delay: 0.2, type: "spring" }}
//                             className="mx-auto bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mb-6"
//                         >
//                             <CheckCircle className="w-12 h-12 text-green-600" />
//                         </motion.div>

//                         <h2 className="text-2xl font-bold text-gray-900 mb-4">
//                             Password Berhasil Direset!
//                         </h2>

//                         <p className="text-gray-600 mb-6">
//                             Password Anda telah berhasil diubah. Anda akan diarahkan ke halaman login dalam beberapa detik.
//                         </p>

//                         <motion.button
//                             whileHover={{ scale: 1.02 }}
//                             whileTap={{ scale: 0.98 }}
//                             onClick={() => navigate('/login')}
//                             className="w-full py-3 px-4 bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold transition-colors"
//                         >
//                             Ke Halaman Login
//                         </motion.button>
//                     </motion.div>
//                 </div>

//                 <Footer />
//             </div>
//         );
//     }

//     // Invalid token screen
//     if (tokenValid === false) {
//         return (
//             <div className="min-h-screen bg-gradient-to-b from-gray-50 to-red-50 relative overflow-hidden">
//                 <Header currentUser={null} />

//                 <div className="container mx-auto px-4 py-16 relative z-10">
//                     <motion.div
//                         initial={{ opacity: 0, scale: 0.9 }}
//                         animate={{ opacity: 1, scale: 1 }}
//                         className="max-w-md mx-auto bg-white rounded-2xl p-8 shadow-xl text-center"
//                     >
//                         <motion.div
//                             initial={{ scale: 0 }}
//                             animate={{ scale: 1 }}
//                             className="mx-auto bg-red-100 w-20 h-20 rounded-full flex items-center justify-center mb-6"
//                         >
//                             <AlertCircle className="w-12 h-12 text-red-600" />
//                         </motion.div>

//                         <h2 className="text-2xl font-bold text-gray-900 mb-4">
//                             Link Tidak Valid
//                         </h2>

//                         <p className="text-gray-600 mb-6">
//                             {error || 'Link reset password tidak valid atau telah kadaluarsa.'}
//                         </p>

//                         <motion.button
//                             whileHover={{ scale: 1.02 }}
//                             whileTap={{ scale: 0.98 }}
//                             onClick={() => navigate('/forgot-password')}
//                             className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-colors"
//                         >
//                             Minta Link Baru
//                         </motion.button>
//                     </motion.div>
//                 </div>

//                 <Footer />
//             </div>
//         );
//     }

//     // Loading screen
//     if (tokenValid === null) {
//         return (
//             <div className="min-h-screen bg-gradient-to-b from-gray-50 to-blue-50 flex items-center justify-center">
//                 <div className="text-center">
//                     <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
//                     <p className="text-gray-600">Memvalidasi link...</p>
//                 </div>
//             </div>
//         );
//     }

//     // Reset password form
//     return (
//         <div className="min-h-screen bg-gradient-to-b from-gray-50 to-blue-50 relative overflow-hidden">
//             {decorations.map((pos, index) => (
//                 <motion.div
//                     key={index}
//                     className="absolute opacity-20 z-0"
//                     initial={{ opacity: 0, scale: 0 }}
//                     animate={{ opacity: 0.15, scale: 1, rotate: 360 }}
//                     transition={{
//                         duration: 20,
//                         repeat: Infinity,
//                         repeatType: "reverse",
//                         delay: pos.delay,
//                     }}
//                     style={{
//                         top: pos.top,
//                         left: pos.left,
//                         right: pos.right,
//                         width: '300px',
//                         height: '300px',
//                         borderRadius: '50%',
//                         background: 'radial-gradient(circle, rgba(59,130,246,0.4) 0%, rgba(59,130,246,0) 70%)',
//                     }}
//                 />
//             ))}

//             <svg
//                 className="absolute inset-0 w-full h-full z-0 opacity-5"
//                 xmlns="http://www.w3.org/2000/svg"
//             >
//                 <pattern
//                     id="tech-pattern"
//                     width="100"
//                     height="100"
//                     patternUnits="userSpaceOnUse"
//                     patternTransform="rotate(10)"
//                 >
//                     <path
//                         d="M20 50 L50 20 L80 50 L50 80 Z"
//                         fill="none"
//                         stroke="#3b82f6"
//                         strokeWidth="2"
//                     />
//                     <circle cx="50" cy="50" r="10" fill="none" stroke="#3b82f6" strokeWidth="1" />
//                 </pattern>
//                 <rect width="100%" height="100%" fill="url(#tech-pattern)" />
//             </svg>

//             <Header currentUser={null} />

//             <div className="container mx-auto px-4 py-16 relative z-10">
//                 <motion.div
//                     initial={{ opacity: 0, y: -20 }}
//                     animate={{ opacity: 1, y: 0 }}
//                     className="text-center mb-8"
//                 >
//                     <motion.h1
//                         className="text-4xl md:text-5xl font-bold mb-3 text-gray-900"
//                         initial={{ opacity: 0, y: -20 }}
//                         animate={{ opacity: 1, y: 0 }}
//                         transition={{ delay: 0.2 }}
//                     >
//                         Buat Password <span className="text-blue-600">Baru</span>
//                     </motion.h1>
//                     <p className="text-xl text-gray-600">Masukkan password baru untuk akun Anda</p>
//                 </motion.div>

//                 <div className="flex justify-center">
//                     <motion.div
//                         initial={{ opacity: 0, y: 20 }}
//                         animate={{ opacity: 1, y: 0 }}
//                         transition={{ delay: 0.2 }}
//                         className="bg-white rounded-2xl p-8 shadow-xl w-full max-w-md relative overflow-hidden"
//                     >
//                         <div className="absolute -top-10 -left-10 w-40 h-40 bg-blue-200 rounded-full blur-3xl opacity-30"></div>
//                         <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-indigo-200 rounded-full blur-3xl opacity-30"></div>

//                         <div className="relative z-10">
//                             <motion.div
//                                 className="mx-auto bg-blue-100 w-20 h-20 rounded-full flex items-center justify-center mb-6"
//                                 whileHover={{ rotate: 10, scale: 1.05 }}
//                             >
//                                 <KeyRound className="w-10 h-10 text-blue-600" />
//                             </motion.div>

//                             <h2 className="text-2xl font-semibold mb-6 text-center text-gray-900">
//                                 Reset Password
//                             </h2>

//                             {error && (
//                                 <motion.div
//                                     initial={{ opacity: 0, y: -10 }}
//                                     animate={{ opacity: 1, y: 0 }}
//                                     className="mb-4 p-3 bg-red-50 text-red-800 rounded-lg flex items-center gap-2"
//                                 >
//                                     <AlertCircle className="w-5 h-5" />
//                                     <span>{error}</span>
//                                 </motion.div>
//                             )}

//                             <form onSubmit={handleSubmit} className="space-y-6">
//                                 <div>
//                                     <label className="block text-sm font-medium mb-2 text-gray-700">
//                                         Password Baru
//                                     </label>
//                                     <div className="relative">
//                                         <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                                             <Lock className="h-5 w-5 text-gray-400" />
//                                         </div>
//                                         <input
//                                             type={showNewPassword ? "text" : "password"}
//                                             value={newPassword}
//                                             onChange={(e) => setNewPassword(e.target.value)}
//                                             className="w-full pl-10 px-4 py-3 bg-gray-50 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
//                                             placeholder="Masukkan password baru"
//                                             required
//                                             disabled={isLoading}
//                                         />
//                                         <button
//                                             type="button"
//                                             onClick={() => setShowNewPassword(!showNewPassword)}
//                                             className="absolute inset-y-0 right-0 pr-3 flex items-center"
//                                         >
//                                             {showNewPassword ? (
//                                                 <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
//                                             ) : (
//                                                 <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
//                                             )}
//                                         </button>
//                                     </div>
                                    
//                                     {/* Password strength indicator */}
//                                     {newPassword && (
//                                         <div className="mt-2">
//                                             <div className="flex items-center justify-between mb-1">
//                                                 <span className="text-xs text-gray-600">Kekuatan Password:</span>
//                                                 <span className={`text-xs font-medium ${
//                                                     passwordStrength.strength <= 25 ? 'text-red-600' :
//                                                     passwordStrength.strength <= 50 ? 'text-yellow-600' :
//                                                     passwordStrength.strength <= 75 ? 'text-blue-600' :
//                                                     'text-green-600'
//                                                 }`}>
//                                                     {passwordStrength.label}
//                                                 </span>
//                                             </div>
//                                             <div className="w-full bg-gray-200 rounded-full h-2">
//                                                 <div
//                                                     className={`h-2 rounded-full transition-all ${passwordStrength.color}`}
//                                                     style={{ width: `${passwordStrength.strength}%` }}
//                                                 ></div>
//                                             </div>
//                                         </div>
//                                     )}
//                                 </div>

//                                 <div>
//                                     <label className="block text-sm font-medium mb-2 text-gray-700">
//                                         Konfirmasi Password
//                                     </label>
//                                     <div className="relative">
//                                         <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                                             <Lock className="h-5 w-5 text-gray-400" />
//                                         </div>
//                                         <input
//                                             type={showConfirmPassword ? "text" : "password"}
//                                             value={confirmPassword}
//                                             onChange={(e) => setConfirmPassword(e.target.value)}
//                                             className="w-full pl-10 px-4 py-3 bg-gray-50 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
//                                             placeholder="Konfirmasi password baru"
//                                             required
//                                             disabled={isLoading}
//                                         />
//                                         <button
//                                             type="button"
//                                             onClick={() => setShowConfirmPassword(!showConfirmPassword)}
//                                             className="absolute inset-y-0 right-0 pr-3 flex items-center"
//                                         >
//                                             {showConfirmPassword ? (
//                                                 <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
//                                             ) : (
//                                                 <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
//                                             )}
//                                         </button>
//                                     </div>
//                                 </div>

//                                 {/* Password requirements */}
//                                 <div className="bg-blue-50 rounded-lg p-4">
//                                     <p className="text-sm font-medium text-blue-900 mb-2">Password harus memenuhi:</p>
//                                     <ul className="text-xs text-blue-800 space-y-1">
//                                         <li className={newPassword.length >= 8 ? 'text-green-600' : ''}>
//                                             • Minimal 8 karakter
//                                         </li>
//                                         <li className={/(?=.*[a-z])/.test(newPassword) ? 'text-green-600' : ''}>
//                                             • Mengandung huruf kecil
//                                         </li>
//                                         <li className={/(?=.*[A-Z])/.test(newPassword) ? 'text-green-600' : ''}>
//                                             • Mengandung huruf besar
//                                         </li>
//                                         <li className={/(?=.*\d)/.test(newPassword) ? 'text-green-600' : ''}>
//                                             • Mengandung angka
//                                         </li>
//                                     </ul>
//                                 </div>

//                                 <motion.button
//                                     type="submit"
//                                     whileHover={{ scale: 1.02, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)" }}
//                                     whileTap={{ scale: 0.98 }}
//                                     className={`w-full py-3 px-4 flex justify-center items-center gap-2 rounded-xl font-semibold text-white transition-colors ${
//                                         isLoading ? "bg-blue-400" : "bg-blue-600 hover:bg-blue-700"
//                                     }`}
//                                     disabled={isLoading}
//                                 >
//                                     {isLoading ? (
//                                         <>
//                                             <svg
//                                                 className="animate-spin h-5 w-5 text-white"
//                                                 xmlns="http://www.w3.org/2000/svg"
//                                                 fill="none"
//                                                 viewBox="0 0 24 24"
//                                             >
//                                                 <circle
//                                                     className="opacity-25"
//                                                     cx="12"
//                                                     cy="12"
//                                                     r="10"
//                                                     stroke="currentColor"
//                                                     strokeWidth="4"
//                                                 ></circle>
//                                                 <path
//                                                     className="opacity-75"
//                                                     fill="currentColor"
//                                                     d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
//                                                 ></path>
//                                             </svg>
//                                             <span>Memproses...</span>
//                                         </>
//                                     ) : (
//                                         <>
//                                             <Lock className="w-5 h-5" />
//                                             <span>Reset Password</span>
//                                         </>
//                                     )}
//                                 </motion.button>
//                             </form>
//                         </div>
//                     </motion.div>
//                 </div>
//             </div>

//             <Footer />
//         </div>
//     );


// export default ResetPasswordPage;
