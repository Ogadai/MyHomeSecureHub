var events          = require('events');

function Sensor() {
    var self = this;
    events.EventEmitter.call(this);

    self._message = function (data) {
        self.emit(data.message);
    }
}
Sensor.prototype.__proto__ = events.EventEmitter.prototype;
module.exports = Sensor;
