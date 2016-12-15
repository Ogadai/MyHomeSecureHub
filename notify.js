var https = require('https'),
    extend = require('extend');

function Notify(hostOptions) {
    this.post = function (action, message) {
        var data = JSON.stringify(message);

        var options = extend({
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(data)
            }
        }, hostOptions, {
                path: hostOptions.path.replace('{action}', action)
        });

        var req = https.request(options);
        req.write(data);
        req.end();
    }
}
module.exports = Notify;
