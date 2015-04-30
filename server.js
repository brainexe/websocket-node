var config = require('./ServerConfig.js'),
	sockjs = require('sockjs'),
	redis = require("redis");

var redis_client  = redis.createClient();
var socket_server = sockjs.createServer();
var server        = require('http').createServer();

socket_server.installHandlers(server, {
	prefix: '/socket'
});

server.listen(config.port);

var sockets = {};
socket_server.on('connection', function (conn) {
	sockets[conn.id] = conn;
	conn.on('close', function () {
		delete sockets[conn.id];
	});
});

redis_client.on("message", function (channel, message) {
	var conn, conn_id;
	for (conn_id in sockets) {
		conn = sockets[conn_id];
		conn.write(message);
	}
});

redis_client.subscribe("websocket:push");
