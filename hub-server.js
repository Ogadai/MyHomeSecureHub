var WebSocketServer = require('websocket').server,
    http            = require('http');

var server = http.createServer(function(request, response) {}),
    socketPort = 1337;

server.listen(socketPort, function() {
  console.log('Listing for hub messages on port ' + socketPort)
});

var wsServer = new WebSocketServer({
  httpServer: server
});

wsServer.on("request", function(request) {
  var connection = request.accept('echo-protocol', request.origin);
  console.log('Connection opened');

  var alarmed = false
  connection
    .on('message', function(message) {
      if (message.type = 'utf8') {
        var data = JSON.parse(message.utf8Data);
        console.log('Received message "' + JSON.stringify(data) + '"');

        if (!alarmed && data.name === 'PIR') {
          sendMessage({ name: 'Alarm', message: 'on' });
          alarmed = true;
          setTimeout(function() {
            sendMessage({ name: 'Alarm', message: 'off' });
            alarmed = false;
          }, 5000)
        }
      }
    })
    .on('close', function(c) {
      console.log('Closed connection');
    })

    function sendMessage(data) {
      var message = JSON.stringify(data);

      console.log('Sending message "' + message + '"')
      connection.sendUTF(message);
    }
})
