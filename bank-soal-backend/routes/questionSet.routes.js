const { authJwt } = require("../middlewares");
const controller = require("../controllers/questionSet.controller");
const fileController = require("../controllers/file.controller"); // TAMBAHKAN INI


module.exports = function(app) {
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  // Membuat question set baru (harus login)
  app.post(
    "/api/questionsets",
    [authJwt.verifyToken],
    controller.createQuestionSet
  );

  // Mendapatkan semua question set (publik)
  app.get("/api/questionsets", controller.getAllQuestionSets);

  // Mendapatkan question set berdasarkan ID (publik)
  app.get("/api/questionsets/:id", controller.getQuestionSetById);

  // Mengupdate question set (harus login dan pemilik)
  app.put(
    "/api/questionsets/:id",
    [authJwt.verifyToken],
    controller.updateQuestionSet
  );

  // Menghapus question set (harus login dan pemilik atau admin)
  app.delete(
    "/api/questionsets/:id",
    [authJwt.verifyToken],
    controller.deleteQuestionSet
  );

  

  // ===== TAMBAHAN UNTUK RECYCLE BIN =====
  
  // Get deleted files untuk question set tertentu
  app.get(
    "/api/questionsets/:id/deleted-files",
    [authJwt.verifyToken],
    fileController.getDeletedFiles
  );
};