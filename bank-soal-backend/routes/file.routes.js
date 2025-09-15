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

  // Download file (publik)
  app.get("/api/files/download/:id", controller.downloadFile);

  // Hapus file (harus login dan pemilik atau admin)
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
};