const db = require("../models");
const Comment = db.comment;
const User = db.user;
const QuestionSet = db.questionSet;
const { Op } = require("sequelize");

// Membuat komentar baru
exports.createComment = async (req, res) => {
  try {
    const { content, question_set_id } = req.body;
    const user_id = req.userId;

    if (!content || !content.trim()) {
      return res.status(400).send({ 
        success: false,
        message: "Komentar tidak boleh kosong!" 
      });
    }

    if (!question_set_id) {
      return res.status(400).send({ 
        success: false,
        message: "Question set ID harus diisi!" 
      });
    }

    // Verifikasi question set exists
    const questionSet = await QuestionSet.findByPk(question_set_id);
    if (!questionSet) {
      return res.status(404).send({ 
        success: false,
        message: "Question set tidak ditemukan!" 
      });
    }

    const comment = await Comment.create({
      content: content.trim(),
      question_set_id: question_set_id,
      user_id: user_id
    });

    // Fetch comment with user info
    const commentWithUser = await Comment.findByPk(comment.id, {
      include: [{
        model: User,
        as: "author",
        attributes: ["id", "username", "fullName", "email"]
      }]
    });

    res.status(201).send({
      success: true,
      message: "Komentar berhasil ditambahkan!",
      data: commentWithUser
    });
  } catch (error) {
    console.error("Error creating comment:", error);
    res.status(500).send({ 
      success: false,
      message: error.message 
    });
  }
};

// Mendapatkan semua komentar untuk question set tertentu
exports.getCommentsByQuestionSet = async (req, res) => {
  try {
    const { question_set_id } = req.params;

    const comments = await Comment.findAll({
      where: {
        question_set_id: question_set_id,
        [Op.or]: [
          { is_deleted: false },
          { is_deleted: { [Op.is]: null } }
        ]
      },
      include: [{
        model: User,
        as: "author",
        attributes: ["id", "username", "fullName", "email"]
      }],
      order: [['created_at', 'DESC']]
    });

    res.status(200).send({
      success: true,
      data: comments
    });
  } catch (error) {
    console.error("Error fetching comments:", error);
    res.status(500).send({ 
      success: false,
      message: error.message 
    });
  }
};

// Mendapatkan jumlah komentar untuk beberapa question set sekaligus (batch)
exports.getCommentCounts = async (req, res) => {
  try {
    const { question_set_ids } = req.body; // Array of question set IDs

    if (!question_set_ids || !Array.isArray(question_set_ids) || question_set_ids.length === 0) {
      return res.status(400).send({
        success: false,
        message: "question_set_ids harus berupa array yang tidak kosong"
      });
    }

    // Convert semua ID ke integer untuk konsistensi
    const ids = question_set_ids.map(id => parseInt(id));

    // Query untuk mendapatkan jumlah komentar per question set
    const counts = await Comment.findAll({
      where: {
        question_set_id: {
          [Op.in]: ids
        },
        [Op.or]: [
          { is_deleted: false },
          { is_deleted: { [Op.is]: null } }
        ]
      },
      attributes: [
        'question_set_id',
        [db.sequelize.fn('COUNT', db.sequelize.col('id')), 'count']
      ],
      group: ['question_set_id'],
      raw: true
    });

    // Convert ke object dengan question_set_id sebagai key
    const countsMap = {};
    ids.forEach(id => {
      const found = counts.find(c => parseInt(c.question_set_id) === id);
      countsMap[id] = found ? parseInt(found.count) : 0;
    });

    res.status(200).send({
      success: true,
      data: countsMap
    });
  } catch (error) {
    console.error("Error fetching comment counts:", error);
    res.status(500).send({
      success: false,
      message: error.message
    });
  }
};

// Update komentar
exports.updateComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const user_id = req.userId;

    if (!content || !content.trim()) {
      return res.status(400).send({ 
        success: false,
        message: "Komentar tidak boleh kosong!" 
      });
    }

    const comment = await Comment.findByPk(id);

    if (!comment) {
      return res.status(404).send({ 
        success: false,
        message: "Komentar tidak ditemukan!" 
      });
    }

    // Check if deleted
    if (comment.is_deleted) {
      return res.status(400).send({ 
        success: false,
        message: "Komentar telah dihapus!" 
      });
    }

    // Check if user is the author
    if (comment.user_id !== user_id) {
      return res.status(403).send({ 
        success: false,
        message: "Anda tidak memiliki izin untuk mengedit komentar ini!" 
      });
    }

    await comment.update({
      content: content.trim()
    });

    // Fetch updated comment with user info
    const updatedComment = await Comment.findByPk(id, {
      include: [{
        model: User,
        as: "author",
        attributes: ["id", "username", "fullName", "email"]
      }]
    });

    res.status(200).send({
      success: true,
      message: "Komentar berhasil diperbarui!",
      data: updatedComment
    });
  } catch (error) {
    console.error("Error updating comment:", error);
    res.status(500).send({ 
      success: false,
      message: error.message 
    });
  }
};

// Soft delete komentar
exports.deleteComment = async (req, res) => {
  try {
    const { id } = req.params;
    const user_id = req.userId;

    const comment = await Comment.findByPk(id);

    if (!comment) {
      return res.status(404).send({ 
        success: false,
        message: "Komentar tidak ditemukan!" 
      });
    }

    // Check if already deleted
    if (comment.is_deleted) {
      return res.status(400).send({ 
        success: false,
        message: "Komentar sudah dihapus sebelumnya!" 
      });
    }

    // Check if user is the author or admin
    const user = await User.findByPk(user_id);
    const isAuthor = comment.user_id === user_id;
    const isAdmin = user && user.role === 'ROLE_ADMIN';

    if (!isAuthor && !isAdmin) {
      return res.status(403).send({ 
        success: false,
        message: "Anda tidak memiliki izin untuk menghapus komentar ini!" 
      });
    }

    await comment.update({
      is_deleted: true,
      deleted_at: new Date(),
      deleted_by: user_id
    });

    res.status(200).send({
      success: true,
      message: "Komentar berhasil dihapus!"
    });
  } catch (error) {
    console.error("Error deleting comment:", error);
    res.status(500).send({ 
      success: false,
      message: error.message 
    });
  }
};

