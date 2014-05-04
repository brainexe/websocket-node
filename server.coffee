# todo use ServerConfig
config = require('./ServerConfig.js')

node_static = new (require('node-static')).Server('..')
sockjs = require('sockjs')
socket_server = sockjs.createServer()

redis = require("redis")
client = redis.createClient() # todo config

# serve static files, including index.html
handler = (request, response) ->
#  request.addListener 'end', ->
#    node_static.serve(request, response)

server = require('http').createServer()
socket_server.installHandlers(server, {prefix:'/socket'})
server.listen(config.port)

broadcast = {}
socket_server.on('connection', (conn) ->
  broadcast[conn.id] = conn
  conn.on('data', (message) ->
		# todo reply request...
    conn.write(message)
  )

  conn.on('close', ->
    delete broadcast[conn.id];
  )
)

client.on("message", (channel, message) ->
  conn.write(message) for conn_id, conn of broadcast
)

client.subscribe("websocket:push")
