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
        state.on('changed', function (value) { anyStateChange(name, value); })
        states[name.toLowerCase()] = state;
    });

    function anyStateChange(name, value) {
        self.emit('statechange', name, value);
    }
}
StateList.prototype.__proto__ = events.EventEmitter.prototype;
module.exports = StateList;
