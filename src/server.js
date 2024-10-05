import { initDB } from "./database.js";
import { destroyDB } from "./database.js";
import { Application } from "../config/express.js";
import PubSub from "../config/pubsub.js";

const app=Application();
const port=app.get("port");

const main=() => {
  app.pubsub=new PubSub(app);
  initDB(app);

  const shutdown=(server) => {
    app.pubsub.close();
    server.close(() => {
      destroyDB(app);
      console.log('HTTP server closed')
    })
  };

  const server=app.listen(port, () => {
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