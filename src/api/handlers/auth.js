import https from "https";
import { createDB, checkDB } from "../../database.js";

const parseJwt = (token) => {

  const base64urlDecode = (str) => {
    return Buffer.from(base64urlUnescape(str), 'base64').toString();
  };

  const base64urlUnescape = (str) => {
    str += Array(5 - str.length % 4).join('=');
    return str.replace(/\-/g, '+').replace(/_/g, '/');
  };

  // ATTENTION: 
  //  this function try to decode an id_token (not access_token)
  const decodeIdToken = (token) => {
    var segments = token.split('.');

    if (segments.length !== 3) {
      throw new Error('Not enough or too many segments');
    }

    // All segment should be base64
    var headerSeg = segments[0];
    var payloadSeg = segments[1];
    var signatureSeg = segments[2];

    // base64 decode and parse JSON
    var header = JSON.parse(base64urlDecode(headerSeg));
    var payload = JSON.parse(base64urlDecode(payloadSeg));

    return {
      header: header,
      payload: payload,
      signature: signatureSeg
    }
  };

  // ATTENTION: 
  // this function try to decode an access_token
  const decodeAccessToken = (token) => {
    return JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
  };

  try {
    return JSON.stringify(decodeAccessToken(token));
  } catch (error) {
    try {
      return JSON.stringify(decodeIdToken(token).payload);
    } catch (error) {
      return null;
    }
  }
};

const validate = (app, token, body) => {
  try {
    const auth = (JSON.parse(body));
    if (auth && auth.email) {
      var entry = app.get("db") || {};
      entry[token] = auth.email;
      app.set("db", entry);
      return entry[token];
    }
    throw new Error('Invalid access_token');
  } catch (error) {
    throw new Error('Invalid body');
  };
};

const initSession = (req) => {
  const token = (req.get('authorization') || "").substring(7);
  return new Promise((resolve, reject) => {
    if (!token) {
      reject()
      return;
    }

    // try first it locally
    let body = parseJwt(token);
    if (body) {
      try {
        resolve(validate(req.app, token, body));
      } catch (error) {
        reject();
      }
      return;
    };

    // then try it remotely (by google)
    body = "";
    https.get(`https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=${token}`, (res) => {
      res.on("data", (chunk) => body += chunk);
      res.on("end", () => {
        try {
          resolve(validate(req.app, token, body));
        } catch (error) {
          console.log(error);
          reject();
        }
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

export default () => {
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

