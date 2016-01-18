var W3CWebSocket = require('websocket').w3cwebsocket,
    events       = require('events');

function WebClient(serverAddr) {
    var client,
        self = this,
        openedOnce = false;
    events.EventEmitter.call(this);

    this.send = function (data) {
        client.send(JSON.stringify(data));
    }

    this.connect = function() {
        client = new W3CWebSocket(serverAddr);
        console.log((openedOnce ? 'Reconnecting' : 'Connecting') + ' to Azure - ' + serverAddr);

        client.onopen = function () {
            console.log((openedOnce ? 'Reconnected' : 'Connected') + ' to Azure');

            self.emit(openedOnce ? 'reconnected' : 'connected');
            openedOnce = true;
        };

        client.onclose = function () {
            console.log('Disconnected from Azure. Attempting reconnect in 10 seconds');
            setTimeout(self.connect, 10000);
        };

        client.onerror = function () {
            console.log('Error connecting to Azure');
        };

        client.onmessage = function (e) {
            if (typeof e.data === 'string') {
                var data = JSON.parse(e.data);
                self.emit(data.Method.toLowerCase(), data);
            }
        };
    }
}
WebClient.prototype.__proto__ = events.EventEmitter.prototype;

module.exports = WebClient;
