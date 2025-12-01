// const { QuestionSet } = require('../models');

// const updateQuestionSetSimple = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { title, description, subject, year, lecturer, topics, difficulty ,role} = req.body;

//     console.log("=== UPDATE QUESTION SET ===");
//     console.log("Question Set ID:", id);
//     console.log("User ID:", req.userId);
//     console.log("User Role:", req.userRole);

//     // Validasi basic input
//     if (!title || !subject || !difficulty) {
//       return res.status(400).json({
//         success: false,
//         message: "Title, subject, dan difficulty wajib diisi"
//       });
//     }

//     const questionSetId = parseInt(id);
//     if (!id || isNaN(questionSetId)) {
//       return res.status(400).json({
//         success: false,
//         message: "ID question set tidak valid"
//       });
//     }

//     // Validasi user terautentikasi
//     if (!req.userId) {
//       return res.status(401).json({
//         success: false,
//         message: "User tidak terautentikasi"
//       });
//     }

//     // Cari question set
//     const questionSet = await QuestionSet.findByPk(questionSetId);
//     if (!questionSet) {
//       return res.status(404).json({
//         success: false,
//         message: "Question set tidak ditemukan"
//       });
//     }

//     // Authorization sederhana - hanya cek role dosen
//     // Karena hanya dosen yang bisa akses halaman ini
//     const userRole = req.userRole?.toUpperCase();
//     const isDosen = userRole === 'ROLE_USER';
    
//     console.log("User role check:", userRole);
//     console.log("Is dosen:", isDosen);

//     if (!isDosen) {
//       return res.status(403).json({
//         success: false,
//         message: "Akses ditolak. Hanya dosen yang dapat mengedit question set."
//       });
//     }

//     // Prepare update data
//     const updateData = {
//       title: title.trim(),
//       description: description ? description.trim() : null,
//       subject: subject.toString(),
//       year: year ? parseInt(year) : new Date().getFullYear(),
//       lecturer: lecturer ? lecturer.trim() : null,
//       level: difficulty,
//       last_updated: new Date()
//     };

//     // Handle topics
//     if (topics !== undefined) {
//       if (Array.isArray(topics)) {
//         updateData.topics = topics.length > 0 ? topics.join(', ') : null;
//       } else if (typeof topics === 'string') {
//         updateData.topics = topics.trim() || null;
//       } else {
//         updateData.topics = null;
//       }
//     }

//     console.log("Data to update:", JSON.stringify(updateData, null, 2));

//     // Update question set
//     const [updatedRowsCount] = await QuestionSet.update(updateData, {
//       where: { id: questionSetId }
//     });

//     console.log("Updated rows:", updatedRowsCount);

//     if (updatedRowsCount === 0) {
//       return res.status(400).json({
//         success: false,
//         message: "Tidak ada data yang diupdate"
//       });
//     }

//     // Ambil data yang sudah diupdate
//     const updatedQuestionSet = await QuestionSet.findByPk(questionSetId);

//     console.log("Update berhasil");

//     return res.status(200).json({
//       success: true,
//       message: "Question set berhasil diupdate",
//       data: updatedQuestionSet
//     });

//   } catch (error) {
//     console.error('Error update question set:', error);
//     console.error('Error details:', error.message);

//     // Handle specific Sequelize errors
//     if (error.name === 'SequelizeValidationError') {
//       return res.status(400).json({
//         success: false,
//         message: "Data tidak valid",
//         errors: error.errors.map(err => err.message)
//       });
//     }

//     if (error.name === 'SequelizeDatabaseError') {
//       return res.status(500).json({
//         success: false,
//         message: "Kesalahan database"
//       });
//     }

//     return res.status(500).json({
//       success: false,
//       message: "Terjadi kesalahan server"
//     });
//   }
// };

// // Controller alternatif tanpa authorization sama sekali
// // Jika memang yakin hanya dosen yang bisa akses halaman
// const updateQuestionSetNoAuth = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { title, description, subject, year, lecturer, topics, difficulty } = req.body;

//     // Validasi input minimal
//     if (!title || !subject || !difficulty) {
//       return res.status(400).json({
//         success: false,
//         message: "Field wajib: title, subject, difficulty"
//       });
//     }

//     const questionSetId = parseInt(id);
//     if (isNaN(questionSetId)) {
//       return res.status(400).json({
//         success: false,
//         message: "ID tidak valid"
//       });
//     }

//     // Cari question set
//     const questionSet = await QuestionSet.findByPk(questionSetId);
//     if (!questionSet) {
//       return res.status(404).json({
//         success: false,
//         message: "Question set tidak ditemukan"
//       });
//     }

//     // Update data langsung
//     const updateData = {
//       title: title.trim(),
//       description: description?.trim() || null,
//       subject: subject.toString(),
//       year: parseInt(year) || new Date().getFullYear(),
//       lecturer: lecturer?.trim() || null,
//       level: difficulty,
//       topics: Array.isArray(topics) ? topics.join(', ') : null,
//       last_updated: new Date()
//     };

//     const [updatedRows] = await QuestionSet.update(updateData, {
//       where: { id: questionSetId }
//     });

//     if (updatedRows === 0) {
//       return res.status(400).json({
//         success: false,
//         message: "Gagal update data"
//       });
//     }

//     const updatedQuestionSet = await QuestionSet.findByPk(questionSetId);

//     return res.status(200).json({
//       success: true,
//       message: "Update berhasil",
//       data: updatedQuestionSet
//     });

//   } catch (error) {
//     console.error('Error:', error);
//     return res.status(500).json({
//       success: false,
//       message: "Server error"
//     });
//   }
// };

// module.exports = {
//   updateQuestionSetSimple,
//   updateQuestionSetNoAuth
// };