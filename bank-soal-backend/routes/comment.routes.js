const express = require("express");
const router = express.Router();
const commentController = require("../controllers/comment.controller");
const { verifyToken } = require("../middlewares/authJwt");

// Routes untuk komentar
router.post("/", verifyToken, commentController.createComment);
router.post("/counts", commentController.getCommentCounts); // Batch get comment counts
router.get("/question-set/:question_set_id", commentController.getCommentsByQuestionSet);
router.put("/:id", verifyToken, commentController.updateComment);
router.delete("/:id", verifyToken, commentController.deleteComment);

module.exports = router;

