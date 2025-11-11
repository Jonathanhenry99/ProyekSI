module.exports = app => {
  const questionPackages = require("../controllers/questionPackage.controller.js");
  const { authJwt } = require("../middlewares");
  const router = require("express").Router();

  // >>> CREATE paket soal
  router.post("/", [authJwt.verifyToken], questionPackages.create);

  // >>> GET semua paket soal
  router.get("/", [authJwt.verifyToken], questionPackages.findAll);

  // >>> GET satu paket soal
  router.get("/:id", [authJwt.verifyToken], questionPackages.findOne);

  // >>> DELETE paket soal
  router.delete("/:id", [authJwt.verifyToken], questionPackages.delete);

  // >>> Register ke app
  app.use("/api/question-packages", router);
};
