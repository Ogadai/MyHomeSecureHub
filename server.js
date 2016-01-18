var WebClient = require('./web-client'),
    Hub = require('./hub'),
    HubServer = require('./hub-server'),
    settings = require('./settings');

var webClient = new WebClient(settings.addr),
    hubServer = new HubServer(settings.hubPort),
    hub = new Hub(settings, webClient, hubServer);

webClient.connect();


hubServer.getSensor('testnode.pir')
        .on('activated', function () {
            console.log('PIR in testnode was activated');
        })

hubServer.getSensor('testnode.door')
        .on('open', function () {
            console.log('Door in testnode was opened');
        })
        .on('closed', function () {
            console.log('Door in testnode was closed');
        })