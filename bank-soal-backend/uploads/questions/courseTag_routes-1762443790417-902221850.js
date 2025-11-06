const { authJwt } = require("../middlewares");
const controller = require("../controllers/courseTag.controller");

module.exports = function(app) {
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  // Routes untuk manajemen tag mata kuliah (admin only)
  app.post(
    "/api/course-tags",
    [authJwt.verifyToken, authJwt.isAdmin],
    controller.createCourseTag
  );

  app.get(
    "/api/course-tags",
    [authJwt.verifyToken],
    controller.getAllCourseTags
  );

  app.put(
    "/api/course-tags/:id",
    [authJwt.verifyToken, authJwt.isAdmin],
    controller.updateCourseTag
  );

  app.delete(
    "/api/course-tags/:id",
    [authJwt.verifyToken, authJwt.isAdmin],
    controller.deleteCourseTag
  );
};