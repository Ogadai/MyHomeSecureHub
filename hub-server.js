var WebSocketServer = require('websocket').server,
    NodeHandler     = require('./node-handler'),
    Sensor          = require('./sensor'),
    Controller      = require('./controller'),
    Timer           = require('./timer'),
    http            = require('http'),
    events          = require('events');

function HubServer(socketPort, nodeSettings) {
    var self = this,
        nodeHandlers = {},
        sensors = {},
        controllers = {};
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
            resetControllers(handler.name());

            handler.send({
                method: 'settings',
                settings: nodeSettings
            });
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

    self.getController = function (name) {
        if (!controllers[name]) {
            controllers[name] = new Controller(name);
            controllers[name].on('changed', function (state) {
                controllerChangedState(name, state);
            })
        }
        return controllers[name];
    }

    self.getTimer = function (startTimeString, endTimeString) {
        return new Timer(startTimeString, endTimeString);
    }

    function controllerChangedState(name, state) {
        var parsedName = parseName(name);

        if (parsedName && nodeHandlers[parsedName.node]) {
            nodeHandlers[parsedName.node].send({
                method: 'setState',
                name: parsedName.item,
                state: state
            });
        }
    }

    function resetControllers(nodeName) {
        // Reset the controller state for each controller on this node
        for (var name in controllers) {
            var parsedName = parseName(name);
            if (parsedName && parsedName.node === nodeName && controllers[name]._reset) {
                controllers[name]._reset();
            }
        }
    }

    function parseName(name) {
        var index = name.indexOf('.');
        if (index !== -1)
            return (index !== -1) ? {
            node: name.substring(0, index),
            item: name.substring(index + 1)
        } : null;
    }
}
HubServer.prototype.__proto__ = events.EventEmitter.prototype;
module.exports = HubServer;
