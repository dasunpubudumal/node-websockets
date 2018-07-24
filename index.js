const WebSocket = require('ws');
const config = require('./config/config.json');

const wss = new WebSocket.Server(config["wss-conf"], () => {
    console.log("WSS Successfull Started!");
});

