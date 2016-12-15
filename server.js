var WebClient = require('./web-client'),
    Hub = require('./hub'),
    HubServer = require('./hub-server'),
    StateList = require('./state-list'),
    Notify = require('./notify'),
    settings = require('./settings'),
    path = require('path'),
    fs = require('fs'),
    keypress = require("keypress");

var webClient = new WebClient(settings.addr),
    hubServer = new HubServer(settings.hubPort, nodeSettings()),
    stateList = new StateList(settings.states),
    hub = new Hub(settings, webClient, hubServer, stateList),
    notify = new Notify(settings.notifyHost)

webClient.connect();

var rulesApi = {
    state: stateList.getState,
    sensor: hubServer.getSensor,
    controller: hubServer.getController,
    timer: hubServer.getTimer,
    user: getUser,
    hubServer: hubServer,
    notify: notify
};

function userApi(user) {
    return {
	name: user.name,
	taggedHome: function() {
	    hub.userTaggedHome(user.name);
	}
    };
}

function getUser(arg) {
    for(var n = 0; n < settings.users.length; n++) {
	var user = settings.users[n];
        if (typeof arg === 'function') {
	    if (arg(user)) return userApi(user);
        } else {
	    if (user.name === arg) return userApi(user);
        }
    }
    return null;
}

function nodeSettings() {
    return {
        addr: settings.addr,
        identification: settings.identification
    };
}

var rulesPath = path.join(__dirname, settings.rules);
fs.readdirSync(rulesPath).forEach(function (file) {
    var ruleSet = require(path.join(settings.rules, file));
    ruleSet(rulesApi);
});

var evening = stateList.getState('Evening'),
    night = stateList.getState('Night'),
    morning = stateList.getState('Morning'),
    away = stateList.getState('Away'),
    dark = stateList.getState('Dark');

keypress(process.stdin);
process.stdin.on('keypress', function (ch, key) {
    if (key) {
        switch (key.name) {
	case 'a':
	    away.active(!away.active());
	    break;
        case 'e':
            setTimeState('Evening');
            dark.active(true);
            break;
        case 'n':
            setTimeState('Night');
            dark.active(true);
            break;
        case 'm':
            setTimeState('Morning');
            dark.active(false);
            break;
        case 'd':
            setTimeState('Day');
            dark.active(false);
            break;
        case 'c':
            if (key.ctrl) {
                process.exit(0);
            }
            break;
        }
    }
});

if (process.stdin.isTTY) {
    process.stdin.setRawMode(true);
}
process.stdin.resume();

function setTimeState(name) {
    evening.active(name === 'Evening');
    night.active(name === 'Night');
    morning.active(name === 'Morning');
}