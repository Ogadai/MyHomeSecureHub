var events = require('events');

function StateOr(left, right) {
    var self = this,
        active = getActive();
    events.EventEmitter.call(this);

    self.active = function () {
        return active;
    }
    
    left.on('changed', checkChange);
    right.on('changed', checkChange);

    function getActive() {
        return left.active() || right.active();
    }
    function checkChange() {
        var newActive = getActive();
        if (newActive !== active) {
            active = newActive;
            self.emit(active ? 'active' : 'reset');
            self.emit('changed', active);
        }
    }
}
StateOr.prototype.__proto__ = events.EventEmitter.prototype;
module.exports = function (left, right) { return new StateOr(left, right); };