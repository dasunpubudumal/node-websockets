const WebSocket = require('ws');
const winston = require('winston'); // For logging purposes.
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
    console.log("WSS Successfully Started!");
});

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
const parseReceivedMetrics = (metrics) => {};

// Event handlers listed here onwards.
// TODO: Get the port that the client is connecting from.
wss.on('connection', (ws, req) => {
    setNode({"nodeIp": req["connection"]["remoteAddress"]});
    ws.on('message', (data) => {
        let message = JSON.parse(data);
        if (message["messageType"] === METRIC) {
            console.log(message);
            logger.log("info", JSON.stringify(message));
        } else if (message["messageType"] === HEARTBEAT) {
            console.log("Ping message received from " + req["connection"]["remoteAddress"]);
            logger.log("info", JSON.stringify(message));
            sendHeartbeatAck(ws);
        }
    });
});