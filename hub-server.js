var WebSocketServer = require('websocket').server,
    NodeHandler     = require('./node-handler')
    Sensor          = require('./sensor')
    http            = require('http'),
    events          = require('events');

function HubServer(socketPort) {
    var self = this,
        nodeHandlers = {},
        sensors = {};
    events.EventEmitter.call(this);

    var server = http.createServer(function(request, response) {});
    server.listen(socketPort, function() {
      console.log('Listing for hub messages on port ' + socketPort)
    });

    var wsServer = new WebSocketServer({
      httpServer: server
    });

    wsServer.on("request", function(request) {
      var connection = request.accept('echo-protocol', request.origin),
          handler = new NodeHandler(connection);

      handler
        .on('initialised', function () {
            nodeHandlers[handler.name()] = handler;
        })
        .on('close', function () {
            delete nodeHandlers[handler.name()];
        })
        .on('sensor', function (data) {
            var sensorName = handler.name() + '.' + data.name;
            if (sensors[sensorName]) {
                sensors[sensorName]._message(data);
            }
        });
    })

    self.getSensor = function (name) {
        if (!sensors[name]) {
            sensors[name] = new Sensor();
        }
        return sensors[name];
    }
}
HubServer.prototype.__proto__ = events.EventEmitter.prototype;
module.exports = HubServer;
