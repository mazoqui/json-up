
const initDB = require("./database.js").initDB;
const destroyDB = require("./database.js").destroyDB;

const app = require("../config/express.js")();
const port = app.get("port");

const main = () => {

  initDB(app);

  const shutdown = (server) => {
    server.close(() => {
      destroyDB(app);
      console.log('HTTP server closed')
    })
  };

  const server = app.listen(port, () => {
    console.log(`listening http://localhost:${port}`);
  });

  // kill
  process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server')
    shutdown(server);
  });

  // # CTRL+C
  process.on('SIGINT', () => {
    console.log('SIGINT signal received: closing HTTP server')
    shutdown(server);
  });
}

main();