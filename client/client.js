const WebSocket = require('ws');
const {setWsHeartbeat} = require('ws-heartbeat/client');
const config = require('./config/config.json');
const metrics = require('metrics-os');
const {HEARTBEATACK, HEARTBEATMESSAGE} = require('../config/messageTypes');

// TODO: Check out Prometheus
const prometheusMetrics = require('prom-client').collectDefaultMetrics;

const ws = new WebSocket(config["ws-config"]["host"], {
    perMessageDeflate: false
});

// Start sending the heartbeat to the server periodically.
const startHeartBeat = (pingInterval, pingTimeout) => {
    setWsHeartbeat(ws, JSON.stringify(HEARTBEATMESSAGE) , {
        pingTimeout: pingTimeout,
        pingInterval: pingInterval
    });
};

// Send metrics to the server periodically.
const sendMetrics = (websocket) => {
    let id = setInterval(function () {
        let sysMetrics = metrics();
        sysMetrics["messageType"] = "metric";
        websocket.send(JSON.stringify(sysMetrics), (error) => {
            if (error) throw error;
        });
    }, 2000);
};

// On opening the websocket.
ws.on('open', () => {
    startHeartBeat(3000, 60000);
    sendMetrics(ws);
});

// On receiving messages to websocket.
ws.on('message', (data) => {
    let message = JSON.parse(data);
    if(message["messageType"] === HEARTBEATACK) {
        console.log("HeartbeatAck received.");
    }
});