const { authJwt } = require("../middlewares");
const controller = require("../controllers/questionSet.controller");
const fileController = require("../controllers/file.controller");

module.exports = function(app) {
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  // ==================== IMPORTANT: SPECIFIC ROUTES FIRST! ====================
  // These must come BEFORE generic /:id routes to avoid conflicts

  // Get recycle bin (all deleted question sets) - MUST BE BEFORE /:id
  app.get(
    "/api/questionsets/recycle-bin/all",
    [authJwt.verifyToken],
    controller.getRecycleBin
  );

  // ==================== SOFT DELETE ROUTES ====================

  // Soft delete question set (move to recycle bin)
  app.patch(
    "/api/questionsets/:id/soft-delete",
    [authJwt.verifyToken],
    controller.softDeleteQuestionSet
  );

  // Restore question set from recycle bin
  app.patch(
    "/api/questionsets/:id/restore",
    [authJwt.verifyToken],
    controller.restoreQuestionSet
  );

  // Permanent delete question set (from recycle bin)
  app.delete(
    "/api/questionsets/:id/permanent",
    [authJwt.verifyToken],
    controller.permanentDeleteQuestionSet
  );

  // Get deleted files untuk question set tertentu
  app.get(
    "/api/questionsets/:id/deleted-files",
    [authJwt.verifyToken],
    fileController.getDeletedFiles
  );

  // ==================== BASIC CRUD ROUTES ====================

  // Membuat question set baru (harus login)
  app.post(
    "/api/questionsets",
    [authJwt.verifyToken],
    controller.createQuestionSet
  );

  // Mendapatkan semua question set (publik) - EXCLUDE DELETED
  app.get("/api/questionsets", controller.getAllQuestionSets);

  // Update question set sederhana (tanpa file) - MUST BE BEFORE GET /:id
  app.patch(
    "/api/questionsets/:id",
    [authJwt.verifyToken],
    controller.updateQuestionSetSimple
  );

  // Mengupdate question set (harus login dan pemilik)
  app.put(
    "/api/questionsets/:id",
    [authJwt.verifyToken],
    controller.updateQuestionSet
  );

  // Menghapus question set (DEPRECATED - kept for backward compatibility)
  // Use /soft-delete instead
  app.delete(
    "/api/questionsets/:id",
    [authJwt.verifyToken],
    controller.deleteQuestionSet
  );

  // Mendapatkan question set berdasarkan ID (publik) - MUST BE LAST
  app.get("/api/questionsets/:id", controller.getQuestionSetById);
};