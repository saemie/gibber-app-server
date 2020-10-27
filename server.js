const https = require("https");
const url = require("url"); 
const ws = require("ws");
const minimist = require("minimist");
const express = require("express");

const argv = minimist(process.argv.slice(2), {
    default: {
      as_uri: "https://localhost:8443/",
      ws_uri: "ws://18.133.29.253:8888/kurento",
    },
  });

const asUrl = url.parse(argv.as_uri);
const port = asUrl.port;

const options = {}
const app = express();

const server = https.createServer(options, app).listen(port, function () {
    console.log("Kurento Tutorial started");
    console.log("Open " + url.format(asUrl) + " with a WebRTC capable browser");
});

const wsServer = new ws.Server({
    server: server,
    path: "/gibber",
});
