var	sockjs = require('sockjs'),
	redis  = require("redis");

module.exports.start = function(port) {
	var redis_client  = redis.createClient();
	var socket_server = sockjs.createServer();
	var server        = require('http').createServer();

	socket_server.installHandlers(server, {
		prefix: '/socket'
	});

	server.listen(port);

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
};
