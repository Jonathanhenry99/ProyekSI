const controller = require("../controllers/paketSoal.controller");
const { authJwt } = require("../middlewares");

module.exports = function(app) {
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, Content-Type, Accept"
    );
    next();
  });

  // Get all paket soal
  app.get("/api/paketsoal", controller.getAllPaketSoal);
  
  // Get single paket soal
  app.get("/api/paketsoal/:id", controller.getPaketSoalById);
  
  // Create new paket soal (protected)
  app.post("/api/paketsoal", [authJwt.verifyToken], controller.createPaketSoal);
  
  // Update paket soal (protected)
  app.put("/api/paketsoal/:id", [authJwt.verifyToken], controller.updatePaketSoal);
  
  // Delete paket soal (protected)
  app.delete("/api/paketsoal/:id", [authJwt.verifyToken], controller.deletePaketSoal);
};