//
// Write to database
// topic for mutations: store/w/dbname/type or store/w/dbname/type/id
// examples
// 1)  mosquitto_pub -t "store/w/dbname/test" -m "{\"id\":\"config\",\"value\":1}"
// 2)  mosquitto_pub -t "store/w/dbname/test/config" -m "{\"value\":1}"
//
// Read the database
// topic for observers: store/r/dbname/type/id
// mosquitto_sub -v -t "store/r/dbname/test/#"
//
//
// Remove from database
// topic for mutations: store/w/dbname/type/id
// mosquitto_pub -t "store/w/dbname/test/config" -m ""
//
// Important: no mutation will be publish while there is no user authenticated to the json-up
//
import config from "config";
import mqtt from "mqtt";
import Model from "../src/model.js"
import { checkDB } from "../src/database.js";
export default class PubSub {

  constructor(app) {
    this.app=app;
    this.listeners={};
    this.client=null;
    const broker_url=config.get('pubsub.broker_url')
    if (!broker_url) return;
    this.client=mqtt.connect(broker_url, { protocolVersion: 5 });
    this.client.on("connect", (entry) => {
      if (entry) {
        console.log(`MQTT: ${broker_url} connected`)
      }
      else {
        this.client=null;
      }
    });
    this.client.on("message", this._onMessage);
  }

  _onMessage=(topic, message) => {
    try {
      let v=(topic??"").split("/");
      if (v.length<4) return;

      v[0]=v[0]??""; // store
      v[1]=v[1]??""; // read/write
      v[2]=v[2]??""; // database name
      v[3]=v[3]??""; // entity type name
      v[4]=v[4]??""; // entity id
      console.log(message.toString())
      if (!v[0]||!v[1]||!v[2]||!v[3]||!this.listeners[`${v[0]}/${v[1]}/${v[2]}`]) return;
      try {
        let db=this.app.get(v[2])||null;
        if (db) {
          checkDB(db).then((db) => {
            try {
              let data=undefined
              let msg=message.toString();
              if (msg!=="") {
                try {
                  data=JSON.parse(msg);
                }
                catch (e) {
                  // empty or invalid json
                }
              }
              let item=new Model(db, v[3], this);
              if (data) {
                if (data.id===undefined&&v[4]!=="") {
                  data.id=v[4]
                }
                item.put(data);
              }
              else {
                if (v[4]!=="") {
                  item.get(v[4]).then((r) => {
                    if (r) item.del(v[4])
                  })
                }
              }
            } catch (error) {
              console.log(error)
            }
          })
        }
        else {
          console.log(`MQTT: Invalid db ${v[2]}`)
        }
      } catch (error) {
        console.log(error)
      }
    } catch (error) {
      console.log("items")
      console.log(error)
    }
  }

  close=() => {
    this.client&&this.client.end();
    this.client=true;
  }

  pub=(topic, item) => {
    if (!topic||!this.client) return;
    try {
      // console.log(`MQTT: posting to ${topic} ${JSON.stringify(item)}`);
      this.client.publish(topic, JSON.stringify(item));
    } catch (error) {
      console.log("MQTT: could not publish item")
    }
  }

  sub=(topic) => {
    try {
      if (!topic||!this.client) return;
      this.listeners[topic]=(this.listeners[topic]===undefined? 0:this.listeners[topic])+1;
      if (this.listeners[topic]==1) {
        //https://www.npmjs.com/package/mqtt#example
        this.client.subscribe(`${topic}/#`, { nl: true }, (err) => {
          if (err) {
            console.log(`MQTT: could no subscribe to ${topic}`);
          }
        });
        // console.log(`MQTT: subscribers to: ${topic} ${this.listeners[topic]}`)
      }
    } catch (error) {
      console.log(`MQTT: error ${error}`);
    }
  }

};