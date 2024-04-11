const https = require('https');
const createDB = require("../../database.js").createDB;
const checkDB = require("../../database.js").checkDB;

const parseJwt = (payload) => {
  try {
    return (
      (payload &&
        JSON.parse(
          decodeURIComponent(
            window
              .atob(payload.split(".")[1].replace(/-/g, "+").replace(/_/g, "/"))
              .split("")
              .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
              .join("")
          )
        )) ||
      null
    );
  } catch (error) {
    return null;
  }
};

const initSession = (req) => {
  const access_token = (req.get('authorization') || "").substring(7);
  return new Promise((resolve, reject) => {
    if (!access_token) {
      reject()
      return;
    }
    https.get(`https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=${access_token}`, (res) => {
      let body = "";
      res.on("data", (chunk) => body += chunk);
      res.on("end", () => {
        try {
          const auth = (JSON.parse(body));
          if (auth && auth.email) {
            var entry = req.app.get("db") || {};
            entry[access_token] = auth.email;
            req.app.set("db", entry);
            resolve(entry[access_token]);
            return;
          }
          reject();
        } catch (error) {
          console.error(error.message);
          reject();
        };
      });
    }).on("error", (error) => {
      console.error(error.message);
      reject();
    });
  })
};

const doIt = (req) => {
  return new Promise((resolve, reject) => {
    initSession(req).then((dbname) => {
      let db = req.app.get(dbname) || null;
      if (db) {
        checkDB(db).then(() => {
          resolve({ status: 'open' });
        }).catch(() => {
          reject({ status: "error" });
        })
      }
      else {
        createDB(req.app, dbname).then(() => {
          resolve({ status: 'open' });
        }).catch(() => {
          reject({ status: "error" });
        })
      }
    }).catch(() => {
      reject({ status: "invalid credentials" });
    })
  })
};

module.exports = () => {
  return async (req, res, next) => {
    console.log(`> ${req.method} ${req.path}`);
    doIt(req).then((result) => {
      console.log(`< ${req.method} ${req.path}`);
      res.status(200).json(result);
    }).catch(() => {
      next();
    });
  };
}

