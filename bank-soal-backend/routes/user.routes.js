const { authJwt, verifySignup } = require("../middlewares");
const controller = require("../controllers/user.controller");

module.exports = function(app) {
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  // Routes for user management (admin only)
  app.post(
    "/api/users",
    [
      authJwt.verifyToken,
      authJwt.isAdmin,
      verifySignup.checkDuplicateEmail,
      verifySignup.checkRolesExisted
    ],
    controller.createUser
  );

  app.get(
    "/api/users",
    [authJwt.verifyToken, authJwt.isAdmin],
    controller.getAllUsers
  );

  app.put(
    "/api/users/:id",
    [authJwt.verifyToken, authJwt.isAdmin],
    controller.updateUser
  );

  app.delete(
    "/api/users/:id",
    [authJwt.verifyToken, authJwt.isAdmin],
    controller.deleteUser
  );

  // Protected route example - can be accessed by any authenticated user
  app.get(
    "/api/test/user",
    [authJwt.verifyToken],
    (req, res) => {
      res.status(200).send("User Content.");
    }
  );

  // Protected route example - can only be accessed by admins
  app.get(
    "/api/test/admin",
    [authJwt.verifyToken, authJwt.isAdmin],
    (req, res) => {
      res.status(200).send("Admin Content.");
    }
  );
};