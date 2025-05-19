import express from "express";
import bodyParser from "body-parser";
import config from "config";
import { routes } from "../src/routes.js";

export const Application = () => {
  const app = express();

  app.set('debug', config.get('debug'));
  app.set('port', process.env.PORT || config.get('server.port'));
  app.set('database_path', process.env.DATABASE_PATH || config.get('database_path'));

  app.set('strict routing', false);

  app.use(bodyParser.json());

  app.use(function(req, res, next) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "*");
    res.setHeader("charset", "utf-8");
    if (req.method === 'OPTIONS') {
      var headers = {};
      headers["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS, PUT, PATCH, DELETE";
      headers["Access-Control-Allow-Credentials"] = true;
      res.writeHead(200, headers);
      res.end();
    }
    else {
      next();
    }
  });

  // routes
  routes(app);

  return app;
};