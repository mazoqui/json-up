const express = require('express');
const bodyParser = require('body-parser');
const config = require('config');

module.exports = () => {
  const app = express();

  app.set('port', process.env.PORT || config.get('server.port'));
  app.set('database_path', process.env.DATABASE_PATH || config.get('database_path'));

  app.set('strict routing', false);

  app.use(bodyParser.json());

  app.use(function(req, res, next) {
    if (req.method === 'OPTIONS') {
      var headers = {};
      headers["charset"] = "utf-8";
      headers["Access-Control-Allow-Origin"] = "*";
      headers["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS, PUT, PATCH, DELETE";
      headers["Access-Control-Allow-Credentials"] = true;
      headers["Access-Control-Allow-Headers"] = "*";
      res.writeHead(200, headers);
      res.end();
    }
    else {
      next();
    }
  });

  // routes
  require('../src/api/routes')(app);

  return app;
};