const https = require("https");
const url = require("url"); 
const ws = require("ws");
const minimist = require("minimist");
const express = require("express");
var fs = require("fs");

const argv = minimist(process.argv.slice(2), {
    default: {
      as_uri: "https://localhost:8443/",
      ws_uri: "ws://18.133.29.253:8888/kurento",
    },
  });

const asUrl = url.parse(argv.as_uri);
const port = asUrl.port;

const options = {
    key: fs.readFileSync("keys/server.key"),
    cert: fs.readFileSync("keys/server.crt"),
  };
const app = express();

const server = https.createServer(options, app).listen(port, function () {
    console.log("Open " + url.format(asUrl) + " with a WebRTC capable browser");
});

// URL for the client to ping: wss://localhost:8443/gibber

const wsServer = new ws.Server({
    server: server,
    path: "/gibber",
});


wsServer.on("connection", function (ws, req) {
    console.log('Connection established')

    ws.on("error", function (error) {
        console.error("Connection error", error);
      });
    
      ws.on("close", function () {
        console.log("Connection closed");
      });
    
      ws.on("message", function (_message) {
          console.log('_message :>> ', _message);
      });
});
