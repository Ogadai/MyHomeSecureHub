var events = require('events');

function Controller() {
    var self = this,
        state = '';
    events.EventEmitter.call(this);

    self._reset = function () {
        state = '';
    }

    self.state = function (value) {
        if (arguments.length) {
            if (state !== value) {
                state = value;
                self.emit('changed', state);
            }
            return this;
        }
        return state;
    }
}
Controller.prototype.__proto__ = events.EventEmitter.prototype;
module.exports = Controller;
