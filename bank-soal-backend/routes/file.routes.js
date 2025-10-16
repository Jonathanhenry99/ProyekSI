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

  // Upload file (harus login)
  app.post(
    "/api/files/upload",
    [authJwt.verifyToken, upload.single("file")],
    controller.uploadFile
  );

  // Download file tunggal (publik)
  app.get("/api/files/download/:id", controller.downloadFile);

  // Hapus file (harus login dan pemilik atau admin)
  app.delete(
    "/api/files/:id",
    [authJwt.verifyToken],
    controller.deleteFile
  );

  // Preview file tunggal (publik)
  app.get("/api/files/preview/:id", controller.previewFile);

  // Get file as BLOB (publik)
  app.get("/api/files/blob/:id", controller.getFileAsBlob);

  // Gabungkan file dari satu question set untuk preview (publik)
  app.get("/api/files/combine-preview/:id", controller.combineFilesForPreview);

  // Gabungkan file dari banyak question set untuk download (publik)
  app.get("/api/files/combine-download", controller.combineFilesForDownload);

  // Indikator kelengkapan soal berdasarkan questionSetId (publik)
  app.get("/api/files/completeness/:questionSetId", controller.getFileCompleteness);

  // Download template soal (publik)
  app.get("/api/files/download-template", controller.downloadTemplate);

  // Download bundle ZIP berisi file soal, kunci jawaban, dan test case (publik)
  app.get("/api/files/download-bundle", controller.downloadZipBundle);
};