
function Hub(settings, webClient, hubServer, stateList) {
    webClient
        .on('connected', function () {
            var users = settings.users.map(function (u) {
                return { Name: u.name, Token: u.token };
            });

            webClient.send({
                Method: 'Initialise',
                Name: settings.identification.name,
                Token: settings.identification.token,
                Users: users,
                States: settings.states
            });

	    webClient.send({
		Method: 'ChangeStates',
		States: settings.states.map(function(s) {
		    return { Name: s, Active: stateList.getState(s).active() };
		})
	    });
        })
        .on('changestates', function (data) {
            data.States.forEach(function (s) {
                console.log('Initialising state: ' + s.Name + '=' + s.Active);
                stateList.getState(s.Name).active(s.Active);
            });
        })
        .on('firstuserhome', function (data) {
            console.log('First user arrived home: ' + data.UserName);
            stateList.getState('Away').active(false);
        })
        .on('lastuseraway', function (data) {
            console.log('Last user has left: ' + data.UserName);
            stateList.getState('Away').active(true);
        })

    stateList.on('statechange', function (name, value) {
        console.log((new Date()).toLocaleTimeString() + ': Updating state: ' + name + '=' + value);
        webClient.send({
            Method: 'ChangeStates',
            States: [
                { Name: name, Active: value }
            ]
        });
    });

    setInterval(function() {
	webClient.send({ Method: 'ChangeStates', States: []});
    }, 60 * 1000);
}

module.exports = Hub;
