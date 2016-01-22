var events = require('events');

function Timer(startTimeString, endTimeString) {
    var self = this,
        active = false;
    events.EventEmitter.call(this);

    checkStateAndSetTimer();

    self.apply = function (state) {
        state.active(active);
        self.on('changed', function (a) {
            state.active(a);
        });
        return self;
    }

    function updateState(newActive) {
        if (active !== newActive) {
            active = newActive;
            self.emit(active ? 'active' : 'reset');
            self.emit('changed', active);
        }
    }

    function checkStateAndSetTimer() {
        var start = getTime(startTimeString),
            end = getTime(endTimeString);

        updateState(isBetween(start, end));

        var delay = getDelay(active ? end : start);
        setTimeout(checkStateAndSetTimer, Math.min(delay, 10 * 60 * 1000));
    }

    function isBetween(start, end) {
        var now = new Date();
        if (end > start) {
            return now >= start && now < end;
        } else {
            return now >= start || now < end;
        }
    }

    function getDelay(time) {
        var now = new Date();
        if (now > time) {
            time.setDate(time.getDate() + 1);
        }
        return time - now;
    }

    function getTime(timeString) {
        var parts = timeString.split(':'),
            today = new Date();

        return new Date(today.getFullYear(), today.getMonth(), today.getDate(),
            parts[0], parts.length > 1 ? parts[1] : 0, parts.length > 2 ? parts[2] : 0);
    }
}
Timer.prototype.__proto__ = events.EventEmitter.prototype;
module.exports = Timer;
