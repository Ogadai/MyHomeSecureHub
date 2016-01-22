var events = require('events');

function StateNot(arg) {
    var self = this;
    events.EventEmitter.call(this);

    self.active = function () {
        return !arg.active();
    }
    
    arg.on('changed', function () {
        var active = self.active();
        self.emit(active ? 'active' : 'reset');
        self.emit('changed', active);
    });
}
StateNot.prototype.__proto__ = events.EventEmitter.prototype;
module.exports = function (arg) { return new StateNot(arg); };
