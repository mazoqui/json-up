import { auth } from "./api/handlers/auth.js";
import { store } from "./api/handlers/store.js";

export const routes = (app) => {
  /*
  ref: https://expressjs.com/en/guide/routing.html
  */

  app
    .route("/api/v1/auth")
    .get(auth());

  app
    .route("/api/v1/store/:type/:id?")
    .all(store());
};
