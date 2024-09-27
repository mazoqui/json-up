

import fs from 'fs';
import { Level } from 'level';

let databasePath="";

export const databaseList=(app) => {
  return new Promise((resolve) => {
    fs.readdir(databasePath, { withFileTypes: true }, (error, files) => {
      const lst=(files||[])
        .filter((item) => item.isDirectory())
        .map((item) => item.name);
      resolve(lst);
    });
  })
}

export const homeDir=() => {
  return new Promise((resolve, reject) => {
    if (fs.existsSync(databasePath)) {
      resolve();
    }
    else {
      fs.mkdir(databasePath, (err) => (err? reject():resolve()))
    }
  })
};

export const createDB=(app, dbname) => {
  return new Promise((resolve, reject) => {
    homeDir().then(() => {
      fs.mkdir(`${databasePath}/${dbname}`, (err) => {
        if (err) {
          reject();
          return console.log(err);
        }
        openDB(app, dbname).then(() => {
          resolve();
        }).catch(reject)
      })
    }).catch(reject)
  })
};

export const checkDB=(db) => {
  let _cn=0;
  const validate=(db, resolve, reject) => {
    try {
      if (db) {
        if (db.status=="open") {
          resolve(db)
        }
        else if (db.status=='closed') {
          reject()
        }
        else {
          // opening...
          _cn+=1;
          if (_cn<10) {
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

export const openDB=(app, dbname) => {
  return new Promise((resolve, reject) => {
    checkDB(new Level(`${databasePath}/${dbname}`)).then((db) => {
      var dblist=app.get("dblist")||{};
      dblist[dbname]=true;
      app.set("dblist", dblist);
      app.set(dbname, db);
      resolve();
    }).catch((e) => {
      console.log(e);
      reject();
    })
  })
};

export const closeDB=(db) => {
  return new Promise((resolve) => {
    db.close().then(() => {
      resolve(db.location)
    });
  })
}

export const initDB=(app) => {
  databasePath=app.get("database_path");
  databaseList(app).then((lst) => {
    (lst||[]).forEach((dbname) => {
      openDB(app, dbname);
    });
  })
};

export const destroyDB=(app) => {
  var dblist=app.get("dblist")||{};
  Object.keys(dblist||{}).forEach((dbname) => {
    delete dblist[dbname];
    app.set("dblist", dblist);
    //========================
    var db=app.get(dbname);
    if (db) {
      app.delete(dbname);
      closeDB(db).then((location) => {
        console.log(`${location} closed`)
      })
    }
  });
}


