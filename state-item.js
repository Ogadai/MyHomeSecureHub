var events = require('events');

function StateItem(name) {
    var self = this,
        active = false;

    events.EventEmitter.call(this);

    this.active = function (value) {
        if (arguments.length) {
            if (active !== value) {
                active = value;
                self.emit(value ? 'active' : 'reset');
                self.emit('changed', value);
            }
            return this;
        }
        return active;
    }

    self.apply = function (controller, activeName, inactiveName) {
        var onName = activeName ? activeName : 'on',
            offName = inactiveName ? inactiveName : 'off';

        controller.state(active ? onName : offName);
        self.on('changed', function (a) {
            controller.state(a ? onName : offName);
        });
        return self;
    }

}
StateItem.prototype.__proto__ = events.EventEmitter.prototype;
module.exports = StateItem;
