
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
		Latitude: settings.location.latitude,
		Longitude: settings.location.longitude,
		Radius: settings.location.radius,
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
        .on('cameracommand', function (data) {
            console.log('Requested node "' + data.Node + '" camera to ' + (data.Active ? 'on' : 'off'));
            hubServer.getController(data.Node + '.camera').state(data.Active ? 'on' : 'off');
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

    this.userTaggedHome = function(userName) {
	webClient.send({
            Method: 'UserTaggedHome',
            UserName: userName
        });
    }

    setInterval(function() {
	webClient.send({
	    Method: 'ChangeStates',
	    States: []
	});
    }, 60000);
}

module.exports = Hub;
