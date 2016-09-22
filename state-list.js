var events = require('events'),
    State = require('./state-item');

function StateList(stateNames) {
    var self = this,
        states = {};

    this.getState = function (name) {
        return states[name.toLowerCase()];
    }

    stateNames.forEach(function (name) {
        var state = new State(name);
        state.on('changed', function (value, details) { anyStateChange(name, value, details); })
        states[name.toLowerCase()] = state;
    });

    function anyStateChange(name, value, details) {
        self.emit('statechange', name, value, details);
    }
}
StateList.prototype.__proto__ = events.EventEmitter.prototype;
module.exports = StateList;
