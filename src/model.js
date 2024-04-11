'use strict';

import crypto from "crypto";
const uuid = crypto.randomUUID;

export default class Model {

  constructor(db, type) {
    this.db = db;
    this.type = type || "global";
  }

  _put(payload) {
    return new Promise((resolve, reject) => {
      console.log(`put ${this.type}/${payload.id}`);
      let item = { ...payload };
      item._$ = item._$ || {};
      if (item.id === undefined) {
        item.id = uuid();
        item._$ = {
          created: new Date().getTime()
        };
      }
      item._$.updated = new Date().getTime();
      item._$.key = `${this.type}/${item.id}`;
      const entityType = this.db.sublevel(this.type);
      entityType.put(item.id, JSON.stringify(item)).then(() => {
        resolve(item);
      }).catch((e) => {
        reject(`could not save ${key}`);
      });
    })
  }

  _get(id) {
    return new Promise((resolve, reject) => {
      console.log(`get ${this.type}/${id}`);
      const entityType = this.db.sublevel(this.type);
      entityType.get(id).then((res) => {
        resolve(JSON.parse(res));
      }).catch((e) => {
        if (e && e.status == 404) {
          resolve(null)
        }
        else {
          reject(e);
        }
      });
    })
  }

  /*
  usage: a._del().then((r) => console.log(r));
  */
  _del(id) {
    return new Promise((resolve, reject) => {
      console.log(`del ${this.type}/${id}`);
      const entityType = this.db.sublevel(this.type);
      entityType.del(id).then(() => {
        resolve();
      }).catch((e) => {
        reject(e);
      });
    })
  }

  /*
  usage: a._all().then((r) => console.log(r));
  */
  _all() {
    return new Promise((resolve) => {
      console.log(`all ${this.type}/`);
      const process = async (db) => {
        const entityType = db.sublevel(this.type)
        let lst = [];
        // for await (const [key, value] of entityType.iterator({ 'gt': `${this.type}/`, 'lt': `${this.type}0` })) {
        for await (const [key, value] of entityType.iterator()) {
          lst.push(JSON.parse(value));
        }
        resolve(lst);
      }
      process(this.db);
    })
  }

  /*
  usage: a._filter((e) => e.id.charAt(1) == 3).then((r) => console.log(r));
  */
  _filter(fn) {
    return new Promise((resolve, reject) => {
      this._all().then((lst) => {
        if (fn && typeof fn == "function") {
          lst = lst.filter(fn)
        }
        resolve(lst)
      }).catch((err) => {
        reject(err)
      });
    })
  }

} 