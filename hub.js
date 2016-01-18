
function Hub(settings, webClient, hubServer) {
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
        })
        .on('reconnected', function () {
            webClient.send({
                Method: 'Reconnect',
                Name: settings.identification.name,
                Token: settings.identification.token
            });
        })
        .on('changestates', function (data) {
            var statesMessage = '';
            data.States.forEach(function (s) {
                if (s.Active) {
                    if (statesMessage.length) statesMessage += ', ';
                    statesMessage += s.Name;
                }
            });

            if (statesMessage.length) {
                console.log('Active States: ' + statesMessage);
            }
        })
        .on('firstuserhome', function (data) {
            console.log('First user arrived home: ' + data.UserName);
        })
        .on('lastuseraway', function (data) {
            console.log('Last user has left: ' + data.UserName);
        })
}

module.exports = Hub;
