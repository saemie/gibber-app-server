const https = require("https");
const url = require("url");
const ws = require("ws");
const minimist = require("minimist");
const express = require("express");
const fs = require("fs");
const util = require("util");

// Config.

const ROOM_NAME = "room:987245";

// HTTPS and Websocket server setup.

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

// Mock api.
const pauseFor = (time) => {
    let promise = new Promise(res => setTimeout(res, time));
    return promise;
}

const createPipeline = async function () {
    await pauseFor(6000);
    return 'pipeline:098';
}

// Rooms.

const rooms = {};

const initRoom = async (roomId) => {
    const pipeline = await createPipeline();
    const sockets = [];
    const addSocket = (socket) => {
        const socketIsAlreadyInRoom = sockets.includes(socket);
        if (socketIsAlreadyInRoom) return;
        sockets.push(socket);
        console.log(`User joined ${roomId}`)
    }

    const getSockets = () => sockets;

    const removeSocket = () => {}

    return { addSocket, getSockets, createEmitter, pipeline, sockets }
}

const createEmitter = wss => (sockets, message) => sockets.forEach(socket => socket.send(message));

(async () => {
    console.log('Preparing main room...')
    const mainRoom = await initRoom(ROOM_NAME);
    console.log('Main room is ready.')
    wsServer.on("connection", async socket => {
        console.log("Connection with a client established");
        const emit = createEmitter(wsServer);
        mainRoom.addSocket(socket);
        const connectedSockets = mainRoom.getSockets();
        emit(connectedSockets, `Hi from the server to the ${connectedSockets.length} people of room ${ROOM_NAME}`)

        socket.on("error", function (error) {
            console.error("Connection error", error);
        });
        
        socket.on("close", function () {
            console.log("Connection closed");
        });
        
        socket.on("message", function (_message) {
            console.log("_message :>> ", _message);
            switch (_message) {
                case 'join':
                    mainRoom.join(socket)
                default: return;    
            }
        });
    });
})();
