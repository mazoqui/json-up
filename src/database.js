'use strict';

const fs = require('fs');
const { Level } = require('level');

let databasePath = "";

const databaseList = (app) => {
  return new Promise((resolve) => {
    fs.readdir(databasePath, { withFileTypes: true }, (error, files) => {
      const lst = (files || [])
        .filter((item) => item.isDirectory())
        .map((item) => item.name);
      resolve(lst);
    });
  })
}

const createDB = (app, dbname) => {
  return new Promise((resolve, reject) => {
    fs.mkdir(`${databasePath}/${dbname}`, (err) => {
      if (err) {
        reject();
        return console.log(err);
      }
      openDB(app, dbname).then(() => {
        resolve();
      }).catch(() => {
        reject();
      })
    })
  })
};

const checkDB = (db) => {
  let _cn = 0;
  const validate = (db, resolve, reject) => {
    try {
      if (db) {
        if (db.status == "open") {
          resolve(db)
        }
        else if (db.status == 'closed') {
          reject()
        }
        else {
          // opening...
          _cn += 1;
          if (_cn < 10) {
            setTimeout(() => {
              validate(db, resolve, reject);
            }, 200);
            return;
          }
          reject();
        }
        return;
      }
      else {
        reject()
      }
    } catch (error) {
      console.log(error);
    };
  };
  return new Promise((resolve, reject) => {
    validate(db, resolve, reject);
  });
};

const openDB = (app, dbname) => {
  return new Promise((resolve, reject) => {
    checkDB(new Level(`${databasePath}/${dbname}`)).then((db) => {
      var dblist = app.get("dblist") || {};
      dblist[dbname] = true;
      app.set("dblist", dblist);
      app.set(dbname, db);
      resolve();
    }).catch((e) => {
      console.log(e);
      reject();
    })
  })
};

const closeDB = (db) => {
  return new Promise((resolve) => {
    db.close().then(() => {
      resolve(db.location)
    });
  })
}

const initDB = (app) => {
  databasePath = app.get("database_path");
  databaseList(app).then((lst) => {
    (lst || []).forEach((dbname) => {
      openDB(app, dbname);
    });
  })
};

const destroyDB = (app) => {
  var dblist = app.get("dblist") || {};
  Object.keys(dblist || {}).forEach((dbname) => {
    delete dblist[dbname];
    app.set("dblist", dblist);
    //========================
    var db = app.get(dbname);
    if (db) {
      app.delete(dbname);
      closeDB(db).then((location) => {
        console.log(`${location} closed`)
      })
    }
  });
}

module.exports.initDB = initDB;
module.exports.createDB = createDB;
module.exports.destroyDB = destroyDB;
module.exports.databaseList = databaseList;
module.exports.checkDB = checkDB;
module.exports.openDB = openDB;
module.exports.closeDB = closeDB;