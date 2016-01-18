var events          = require('events');

function NodeHandler(connection) {
    var self = this,
        name;
    events.EventEmitter.call(this);

    this.name = function () {
        return name;
    }

    this.send = function (data) {
        connection.sendUTF(JSON.stringify(data));
    }

    connection
      .on('message', function (message) {
          if (message.type = 'utf8') {
              var data = JSON.parse(message.utf8Data);
              if (data.method === 'initialise') {
                  name = data.name;
                  console.log('Initialised connection with ' + name);
                  self.emit('intialised');
              } else {
                  self.emit(data.method, data);
              }
          }
      })
      .on('close', function (c) {
          if (name) {
              console.log('Closed connection with ' + name);
              self.emit('close');
          }
      })

}
NodeHandler.prototype.__proto__ = events.EventEmitter.prototype;
module.exports = NodeHandler;
