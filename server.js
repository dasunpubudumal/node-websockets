const WebSocket = require('ws');
const winston = require('winston'); // For logging purposes.
const {
    setWsHeartbeat
} = require('ws-heartbeat/server');
const config = require('./config/config.json');
const {
    METRIC,
    HEARTBEAT,
    HEARTBEATACKMESSAGE
} = require('./config/messageTypes');
const lodash = require('lodash');

// Custom Logger.
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    transports: [
        new winston.transports.File({
            filename: 'error.log',
            level: 'error'
        }),
        new winston.transports.File({
            filename: 'combined.log'
        })
    ]
});

// Store the client info here.
let nodeMap = [];

const wss = new WebSocket.Server(config["wss-conf"], () => {
    console.log("WSS Successfull Started!");
});

// Temporary function
const startHeartbeatAck = (pongTimeout) => {
    setWsHeartbeat(wss, (ws, data, binary) => {
        if (data === '{"messageType": "heartbeat"}') {
            ws.send('{"messageType": "heartbeat"}');
        } else {
            console.log('Invalid ping message.');
        }
    }, pongTimeout);
};

// Set node information.
const setNode = (node) => {
    nodeMap.push(node);
    logger.log( "info" , "Node " + node["nodeIp"] + " was added to the node map.");
};

// Send the acknowledgement for the heartbeat.
const sendHeartbeatAck = (ws) => {
    ws.send(JSON.stringify(HEARTBEATACKMESSAGE));
};

// TODO: Implement parsing of received metrics.
const parseReceivedMetrics = (metrics) => {}

wss.on('connection', (ws, req) => {
    let nodeIp = req.connection.remoteAddress;
    setNode({"nodeIp": nodeIp});
    ws.on('message', (data) => {
        let message = JSON.parse(data);
        if (message["messageType"] === METRIC) {
            console.log(message);
        } else if (message["messageType"] === HEARTBEAT) {
            console.log("Ping message received.");
            sendHeartbeatAck(ws);
        }
    });
});