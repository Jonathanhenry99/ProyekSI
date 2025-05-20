const { verifySignup } = require("../middlewares");
const controller = require("../controllers/auth.controller");

module.exports = function(app) {
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.post(
    "/api/auth/signin",
    controller.signin
  );

  // Endpoint untuk reset password admin (hanya untuk testing)
  app.post("/api/auth/reset-admin", controller.resetAdminPassword);
};