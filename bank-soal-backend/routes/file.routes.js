const { authJwt } = require("../middlewares");
const controller = require("../controllers/file.controller");
const upload = require("../middlewares/upload");

module.exports = function(app) {
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  // ========================================
  // EXISTING ROUTES (MAINTAINED)
  // ========================================

  // Upload file (harus login)
  app.post(
    "/api/files/upload",
    [authJwt.verifyToken, upload.single("file")],
    controller.uploadFile
  );

  // Download file (publik)
  app.get("/api/files/download/:id", controller.downloadFile);

  // Hapus file (harus login) - ini akan jadi soft delete
  app.delete(
    "/api/files/:id",
    [authJwt.verifyToken],
    controller.deleteFile
  );

  // Preview file (publik)
  app.get("/api/files/preview/:id", controller.previewFile);

  // Get file as BLOB (publik)
  app.get("/api/files/blob/:id", controller.getFileAsBlob);

  // Route untuk menggabungkan file dari satu question set
  app.get("/api/files/combine-preview/:id", controller.combineFilesForPreview);

  // Indikator kelengkapan soal berdasarkan questionSetId (publik)
  app.get("/api/files/completeness/:questionSetId", controller.getFileCompleteness);

  // Rute untuk mengunduh template soal
  app.get("/api/files/download-template", controller.downloadTemplate);

  // Get files by question set (with proper filtering)
  app.get("/api/files/by-questionset/:questionSetId", controller.getFilesByQuestionSet);

  // ========================================
  // ENHANCED/NEW ROUTES
  // ========================================

  // NEW: Upload-Replace file (atomic replacement)
  app.post(
    "/api/files/upload-replace",
    [authJwt.verifyToken, upload.single("file")],
    controller.uploadReplaceFile
  );

  // NEW: Get replacement history for question set
  app.get(
    "/api/files/replacement-history/:questionSetId",
    [authJwt.verifyToken],
    controller.getReplacementHistory
  );

  // ENHANCED: Soft delete routes (enhanced with tracking)
  app.patch(
    "/api/files/:id/soft-delete",
    [authJwt.verifyToken],
    controller.softDeleteFile
  );

  // ENHANCED: Restore file (enhanced with proper tracking)
  app.patch(
    "/api/files/:id/restore",
    [authJwt.verifyToken],
    controller.restoreFile
  );

  // ENHANCED: Permanent delete (enhanced with safety checks)
  app.delete(
    "/api/files/:id/permanent",
    [authJwt.verifyToken],
    controller.permanentDeleteFile
  );

  // ENHANCED: Get deleted files for question set (enhanced with user info)
  app.get(
    "/api/files/deleted/:questionSetId",
    [authJwt.verifyToken],
    controller.getDeletedFiles
  );

  // ENHANCED: Bulk operations (enhanced with better tracking)
  app.post(
    "/api/files/bulk/restore",
    [authJwt.verifyToken],
    controller.bulkRestoreFiles
  );

  app.delete(
    "/api/files/bulk/permanent",
    [authJwt.verifyToken],
    controller.bulkPermanentDeleteFiles
  );

  // NEW: Get file activity/audit log
  app.get(
    "/api/files/activity/:questionSetId",
    [authJwt.verifyToken],
    controller.getFileActivity
  );

  // NEW: Rollback file replacement (emergency recovery)
  app.post(
    "/api/files/:fileId/rollback",
    [authJwt.verifyToken],
    controller.rollbackFileReplacement
  );

  // NEW: Batch file operations status
  app.get(
    "/api/files/batch-status/:batchId",
    [authJwt.verifyToken],
    controller.getBatchOperationStatus
  );

  // NEW: File statistics for dashboard
  app.get(
    "/api/files/stats/:questionSetId",
    controller.getFileStatistics
  );
};