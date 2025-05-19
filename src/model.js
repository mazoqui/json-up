'use strict';

import crypto from "crypto";
import Expression from "./expression.js";

const uuid=crypto.randomUUID;

export default class Model {

  constructor(db, type, pubsub) {
    this.db=db;
    this.type=type||"global";
    this.pubsub=pubsub
  }

  pub (id, data) {
    if (!this.pubsub) return
    this.pubsub.pub(`${this.db.topic.r}/${this.type}/${id}`, data);
  }

  put (payload) {
    return new Promise((resolve, reject) => {
      let item={ ...payload };
      item._$=item._$||{};
      if (item.id===undefined) {
        item.id=uuid();
        item._$={
          created: new Date().getTime()
        };
      }
      item._$.updated=new Date().getTime();
      item._$.key=`${this.type}/${item.id}`;
      console.log(`put ${this.type}/${item.id}`);
      const entityType=this.db.sublevel(this.type);
      entityType.put(item.id, JSON.stringify(item)).then(() => {
        this.pub(item.id, item);
        resolve(item);
      }).catch((e) => {
        reject(`could not save ${key}`);
      });
    })
  }

  /*
  usage: model.del().then((r) => console.log(r));
  */
  del (id) {
    return new Promise((resolve, reject) => {
      console.log(`del ${this.type}/${id}`);
      const entityType=this.db.sublevel(this.type);
      entityType.del(id).then(() => {
        this.pub(id, null);
        resolve();
      }).catch((e) => {
        reject(e);
      });
    })
  }

  /*
  usage: model.get(33).then((r) => console.log(r));
  */
  get (id) {
    return new Promise((resolve, reject) => {
      console.log(`get ${this.type}/${id}`);
      const entityType=this.db.sublevel(this.type);
      entityType.get(id).then((res) => {
        resolve(JSON.parse(res));
      }).catch((e) => {
        if (e&&e.status==404) {
          resolve(null)
        }
        else {
          reject(e);
        }
      });
    })
  }

  /*
  usage: a.all().then((r) => console.log(r));
  */
  all () {
    return new Promise((resolve) => {
      console.log(`all ${this.type}/`);
      const process=async (db) => {
        const entityType=db.sublevel(this.type)
        let lst=[];
        for await (const value of entityType.values()) {
          lst.push(JSON.parse(value));
        }
        resolve(lst);
      }
      process(this.db);
    })
  }

  /*
   usage: a.filter("value == 'aaaa'")
  */
  filter (expression) {
    return new Promise((resolve) => {
      console.log(`filter ${this.type}/`);
      console.log(expression);
      let exp;
      try {
        exp=new Expression(expression);
      } catch (error) {
        resolve([]);
        return
      }
      const process=async (db) => {
        const entityType=db.sublevel(this.type)
        let lst=[];
        let obj=null;
        for await (const value of entityType.values()) {
          try {
            obj=JSON.parse(value);
            if (exp.eval(obj)) lst.push(obj);
          }
          catch { }
        }
        resolve(lst);
      }
      process(this.db);
    })
  }

} 