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
	    try {
                client.send(JSON.stringify(data));
	    } catch (e) {
		console.error("Error sending message to Azure - " + e.message);
                //bufferedMessages.push(data);
	        client.close();
		client = null;
		connected = false;
	        setTimeout(self.connect, 10000);
	    }
        } else {
            //bufferedMessages.push(data);
        }
    }

    this.connect = function() {
	if (client) return;
        client = new W3CWebSocket(serverAddr + 'homehub', 'echo-protocol');
        console.log((openedOnce ? 'Reconnecting' : 'Connecting') + ' to Azure - ' + serverAddr);

        client.onopen = function () {
            console.log((new Date()).toLocaleTimeString() + ': ' + (openedOnce ? 'Reconnected' : 'Connected') + ' to Azure');
            openedOnce = true;
	    connected = true;

            self.emit('connected');
            clearBuffer();
        };

        client.onclose = function e() {
            console.log('Disconnected from Azure - ' + e.reason + '. Attempting reconnect in 10 seconds');
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

//    function ping() {
//	if (client) {
//	    self.send({
//                Method: 'ChangeStates',
//                States: []
//            });
//	}
//    }
//    setInterval(ping, 60000);

    function clearBuffer() {
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
