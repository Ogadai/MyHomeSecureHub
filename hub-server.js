var WebSocketServer = require('websocket').server,
    http = require('http'),
    events = require('events'),
    NodeHandler = require('./node-handler'),
    Sensor = require('./sensor'),
    Controller = require('./controller'),
    Timer = require('./timer'),
    webApp = require('./web-app'),
    GoogleDrive = require('./google/google-drive');

const googleDrive = new GoogleDrive()
const credentialsPromise = googleDrive.getCredentialsAndToken()

function HubServer(socketPort, nodeSettings) {
    var self = this,
        nodeHandlers = {},
        sensors = {},
        controllers = {};
    events.EventEmitter.call(this);

    const app = webApp();
    var server = http.createServer(app);
    server.listen(socketPort, function () {
        console.log('Listing for hub messages on port ' + socketPort)
    });

    var wsServer = new WebSocketServer({
        httpServer: server
    });

    wsServer.on("request", function (request) {
        var connection = request.accept('echo-protocol', request.origin),
            handler = new NodeHandler(connection),
            pingInterval = setInterval(doPing, 10000),
            cameraOn = false;

        handler
            .on('initialised', function () {
                nodeHandlers[handler.name()] = handler;
                resetControllers(handler.name());

                credentialsPromise.then(drive => {
                    handler.send({
                        method: 'settings',
                        settings: {...nodeSettings, drive }
                    });
                })

                self.emit('connected', handler.name());
                self.emit(handler.name() + '.connected');
            })
            .on('close', function () {
                closeConnection();
            })
            .on('sensor', function (data) {
                var sensorName = handler.name() + '.' + data.name;
                if (sensors[sensorName]) {
                    sensors[sensorName]._message(data);
                }
            })
            .on('websocket', function (data) {
                const { status, address } = data;
                if (status === 'started') {
                    cameraOn = true;
                    app.startedCamera(handler.name(), address);
                } else if (status === 'stopped') {
                    cameraOn = false;
                    app.stoppedCamera(handler.name());
                }
            });

        function doPing() {
            try {
                handler.send({ method: 'ping' });
            } catch (ex) {
                console.log('Error pinging node "' + handler.name() + '"', ex);
                closeConnection();
            }
        }

        function closeConnection() {
            if (cameraOn) {
                app.stoppedCamera(handler.name());
            }
            clearInterval(pingInterval);

            self.emit('disconnected', handler.name());
            self.emit(handler.name() + '.disconnected');

            delete nodeHandlers[handler.name()];
        }
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
