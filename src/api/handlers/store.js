import { checkDB } from "../../database.js";
import Model from "../../model.js";

const execute=(req, resolve, reject, model) => {
  switch (req.method) {
    case "GET": {
      if ("id" in req.params&&req.params.id!==undefined) {
        model.get(req.params.id).then((r) => {
          resolve(r);
        }).catch((e) => {
          console.log(e)
          reject(e)
        })
      }
      else {
        /*
        on browser:
        'filter='+encodeURIComponent("value == 'aaaa'") will be converted in filter=value%20%3D%3D%20'aaaa'
        url?filter=value%20%3D%3D%20'aaaa'
        
        here at server side
        req.query.filter = "value == 'aaaa'"
        */
        var promise=(req.query.filter? model.filter(req.query.filter):model.all());
        promise.then((r) => {
          resolve(r);
        }).catch((e) => {
          reject(e)
        })
      }
      return
      break;
    }
    case "PUT": {
      let payload = {...req.body};
      if (!payload.id && "id" in req.params&&req.params.id!==undefined) {
        payload.id=req.params.id;
      }
      model.put(payload).then((r) => {
        resolve(r);
      }).catch((e) => {
        reject(e);
      })
      break;
    }
    case "POST": {
      console.log(req.body)
      model.put(req.body).then((r) => {
        resolve(r);
      }).catch((e) => {
        reject(e);
      })
      break;
    }
    case "DELETE": {
      if ("id" in req.params&&req.params.id!==undefined) {
        model.del(req.params.id).then((r) => {
          resolve(null);
        }).catch((e) => {
          resolve(null);
        })
      }
      else {
        resolve(null);
      }
      break;
    }
    case "OPTIONS": {
      resolve(null);
      break;
    }
    default:
      reject({ err: "INVALID METHOD" })
      break;
  }
};

const doIt=(req) => {
  return new Promise((resolve, reject) => {
    const access_token=(req.get('authorization')||"").substring(7);
    if (!access_token||!req.params.type) {
      reject({ err: "Invalid access_token or entity type" })
      return;
    }
    const dbname=(req.app.get("db")||{})[access_token];
    if (!dbname) {
      reject({ err: `user not authenticated. Call first the /api/v1/auth endpoint` })
      return;
    }
    let db=req.app.get(dbname)||null;
    if (db) {
      checkDB(db).then((db) => {
        execute(req, resolve, reject, new Model(db, req.params.type, req.app.pubsub));
      })
    }
    else {
      reject({ err: "app not ready" })
    }
  })
};

export default () => {
  return async (req, res, next) => {
    console.log(`${new Date().toISOString()} > ${req.method} ${req.path}`);
    doIt(req).then((result) => {
      console.log(`${new Date().toISOString()} < ${req.method} ${req.path}`);
      res.status(200).json(result);
    }).catch((e) => {
      console.log(JSON.stringify(e))
      next();
    });
  };
}