var events          = require('events');

function Sensor() {
    var self = this;
    events.EventEmitter.call(this);

    self._message = function (data) {
        self.emit(data.message);
        self.emit('changed', data.message);
    }

    self.apply = function (state, activeName) {
        var stateName = activeName ? activeName : 'active';
        self.on('changed', function (eventName) {
            state.active(eventName === activeName);
        });
        return self;
    }
}
Sensor.prototype.__proto__ = events.EventEmitter.prototype;
module.exports = Sensor;
