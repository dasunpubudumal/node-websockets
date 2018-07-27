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

const startHeartBeat = (pingInterval, pingTimeout) => {
    setWsHeartbeat(ws, JSON.stringify(HEARTBEATMESSAGE) , {
        pingTimeout: pingTimeout,
        pingInterval: pingInterval
    });
};

const sendMetrics = (websocket) => {
    let sysMetrics = metrics();
    sysMetrics["messageType"] = "metric";
    websocket.send(JSON.stringify(sysMetrics), (error) => {
        if (error) throw error;
    });
};

// On opening the websocket
ws.on('open', () => {
    startHeartBeat(2000, 60000);
    sendMetrics(ws);
});

// On receiving messages to websocket
ws.on('message', (data) => {
    let message = JSON.parse(data);
    if(message["messageType"] === HEARTBEATACK) {
        console.log("HeartbeatAck received.");
    }
});