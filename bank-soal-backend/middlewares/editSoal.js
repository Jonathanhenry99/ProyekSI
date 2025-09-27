// const jwt = require('jsonwebtoken');
// const { User } = require('../models'); // Sesuaikan path model

// // Auth middleware untuk memverifikasi token dan set user info
// const authMiddleware = async (req, res, next) => {
//   try {
//     // Ambil token dari berbagai sumber header
//     let token = req.headers['x-access-token'] 
//                 || req.headers['authorization']
//                 || req.headers['Authorization'];

//     // Handle Bearer token format
//     if (token && token.startsWith('Bearer ')) {
//       token = token.slice(7, token.length);
//     }

//     if (!token) {
//       return res.status(401).json({
//         success: false,
//         message: 'Access token diperlukan'
//       });
//     }

//     // Verifikasi token
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     console.log('🔑 Token payload:', decoded);

//     // Set user info ke request object - handle berbagai format token
//     req.userId = decoded.id || decoded.userId || decoded.user_id;
//     req.userRole = decoded.role || decoded.userRole || decoded.user_role || decoded.authorities;
//     req.username = decoded.username || decoded.name || decoded.user_name;

//     console.log('🔑 Request user info set:', {
//       userId: req.userId,
//       userRole: req.userRole,
//       username: req.username
//     });

//     // Optional: Fetch full user info dari database
//     try {
//       const user = await User.findByPk(decoded.id);
//       if (user) {
//         req.user = user;
//         // Update role dari database jika ada
//         req.userRole = user.role || decoded.role;
//       }
//     } catch (dbError) {
//       console.warn('⚠️ Could not fetch user from database:', dbError.message);
//       // Continue tanpa user object dari database
//     }

//     next();
//   } catch (error) {
//     console.error('❌ Auth middleware error:', error);
    
//     if (error.name === 'JsonWebTokenError') {
//       return res.status(401).json({
//         success: false,
//         message: 'Token tidak valid'
//       });
//     }
    
//     if (error.name === 'TokenExpiredError') {
//       return res.status(401).json({
//         success: false,
//         message: 'Token sudah expired'
//       });
//     }

//     return res.status(500).json({
//       success: false,
//       message: 'Internal server error'
//     });
//   }
// };

// // Middleware khusus untuk admin
// const adminMiddleware = (req, res, next) => {
//   if (!req.userRole || !['ROLE_ADMIN', 'admin', 'ADMIN'].includes(req.userRole.toUpperCase())) {
//     return res.status(403).json({
//       success: false,
//       message: 'Akses ditolak. Hanya admin yang diizinkan.'
//     });
//   }
//   next();
// };

// // Middleware untuk owner atau admin
// const ownerOrAdminMiddleware = (resourceOwnerField = 'created_by') => {
//   return async (req, res, next) => {
//     try {
//       const userId = req.userId;
//       const userRole = req.userRole;
      
//       // Jika admin, langsung izinkan
//       if (['ROLE_ADMIN', 'admin', 'ADMIN'].includes(userRole?.toUpperCase())) {
//         return next();
//       }
      
//       // Untuk non-admin, cek ownership di controller
//       // Karena kita perlu data dari database dulu
//       req.requireOwnership = {
//         field: resourceOwnerField,
//         userId: userId
//       };
      
//       next();
//     } catch (error) {
//       return res.status(500).json({
//         success: false,
//         message: 'Authorization error'
//       });
//     }
//   };
// };

// module.exports = {
//   authMiddleware,
//   adminMiddleware,
//   ownerOrAdminMiddleware
// };