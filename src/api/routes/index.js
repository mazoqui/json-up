module.exports = (app) => {
  /*
  ref: https://expressjs.com/en/guide/routing.html
  */

  app
    .route("/api/v1/auth")
    .get(require("../handlers/auth.js")());

  app
    .route("/api/v1/store/:type/:id?")
    .all(require("../handlers/store.js")());
};
