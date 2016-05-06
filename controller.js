var events = require('events');

function Controller() {
    var self = this;
    events.EventEmitter.call(this);

    self.state = function (value) {
        if (arguments.length) {
            self.emit('changed', value);
            return this;
        }
        return state;
    }
}
Controller.prototype.__proto__ = events.EventEmitter.prototype;
module.exports = Controller;
