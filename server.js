var WebClient = require('./web-client'),
    Hub = require('./hub'),
    HubServer = require('./hub-server'),
    StateList = require('./state-list'),
    settings = require('./settings'),
    path = require('path'),
    fs = require('fs'),
    keypress = require("keypress");

var webClient = new WebClient(settings.addr),
    hubServer = new HubServer(settings.hubPort, nodeSettings()),
    stateList = new StateList(settings.states),
    hub = new Hub(settings, webClient, hubServer, stateList);

webClient.connect();

var rulesApi = {
    state: stateList.getState,
    sensor: hubServer.getSensor,
    controller: hubServer.getController,
    timer: hubServer.getTimer,
    user: getUser
};

function getUser(arg) {
    for(var n = 0; n < settings.users.length; n++) {
	var user = settings.users[n];
        if (typeof arg === 'function') {
	    if (arg(user)) return user;
        } else {
	    if (user.name === arg) return user;
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
    away = stateList.getState('Away');

keypress(process.stdin);
process.stdin.on('keypress', function (ch, key) {
    if (key) {
        switch (key.name) {
	case 'a':
	    away.active(!away.active());
	    break;
        case 'e':
            setTimeState('Evening');
            break;
        case 'n':
            setTimeState('Night');
            break;
        case 'm':
            setTimeState('Morning');
            break;
        case 'd':
            setTimeState('Day');
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