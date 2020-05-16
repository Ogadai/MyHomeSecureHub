const GoogleDrive = require('./google-drive')

const googleDrive = new GoogleDrive()

googleDrive.createToken()
    .then(path => {
        console.log('Token stored to', path)
    })
    .catch(err => {
        console.error(err)
    })
