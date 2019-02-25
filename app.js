'use strict';
// const mqttClient = require('./app/public/postal/sub');

const mqtt = require('mqtt');
const fs = require('fs');
const path = require('path');

const PORT = 8883;
const HOST = '121.42.143.106';
const USERNAME = 'admin';
const PASSWORD = 'finfosoft123';
const KEY = fs.readFileSync(path.join(__dirname, './app/public/file-key/client/client.key'));
const CERT = fs.readFileSync(path.join(__dirname, './app/public/file-key/client/client.crt'));
const TRUSTED_CA_LIST = fs.readFileSync(path.join(__dirname, './app/public/file-key/ca/ca.crt'));
const options = {
  port: PORT,
  host: HOST,
  username: USERNAME,
  password: PASSWORD,
  key: KEY,
  cert: CERT,
  ca: TRUSTED_CA_LIST,
  rejectUnauthorized: false,
  protocol: 'mqtt',
};

const client = mqtt.connect(options);
client.on('connect', () => {
//   console.log('已经链接');
  client.subscribe('bs/current_data');
});

module.exports = app => {
  app.beforeStart(() => {

    // client.on('message', (topic, msg) => {
    //   console.log('msg=' + msg);
    //   client.publish('aaaaa', '111111');
    // });
  });
};
