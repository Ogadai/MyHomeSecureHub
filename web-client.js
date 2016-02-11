var W3CWebSocket = require('websocket').w3cwebsocket,
    events       = require('events');

function WebClient(serverAddr) {
    var client = null,
	connected = false,
        self = this,
        openedOnce = false,
        bufferedMessages = [];

    events.EventEmitter.call(this);

    this.send = function (data) {
        if (connected) {
            client.send(JSON.stringify(data));
        } else {
            bufferedMessages.push(data);
        }
    }

    this.connect = function() {
        client = new W3CWebSocket(serverAddr);
        console.log((openedOnce ? 'Reconnecting' : 'Connecting') + ' to Azure - ' + serverAddr);

        client.onopen = function () {
            console.log((new Date()).toLocaleTimeString() + ': ' + (openedOnce ? 'Reconnected' : 'Connected') + ' to Azure');

            self.emit('connected');
            openedOnce = true;
	    connected = true;

            clearBuffer();
        };

        client.onclose = function () {
            console.log('Disconnected from Azure. Attempting reconnect in 10 seconds');
            client = null;
	    connected = false;
            setTimeout(self.connect, 10000);
        };

        client.onerror = function () {
            console.log('Error connecting to Azure. Attempting reconnect in 10 seconds');
            client = null;
	    connected = false;
            setTimeout(self.connect, 10000);
        };

        client.onmessage = function (e) {
            if (typeof e.data === 'string') {
                var data = JSON.parse(e.data);
                self.emit(data.Method.toLowerCase(), data);
            }
        };
    }

    var clearBuffer = function () {
        if (bufferedMessages.length > 0) {
            setTimeout(function () {
                var nextMessages = bufferedMessages.splice(0, 1);
                self.send(nextMessages[0]);

                clearBuffer();
            }, 10);
        }
    }
}
WebClient.prototype.__proto__ = events.EventEmitter.prototype;

module.exports = WebClient;
