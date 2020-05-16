const fs = require('fs')
const path = require('path')
const readline = require('readline')
const { google } = require('googleapis')

const SCOPES = ['https://www.googleapis.com/auth/drive']
const TOKEN_PATH = path.join(__dirname, 'token.json')
const CREDENTIALS_PATH = path.join(__dirname, 'credentials.json')

class GoogleDrive {
  async createToken() {
    const credentials = await this.getCredentials()
    const oAuth2Client = this.getClient(credentials)

    const token = await this.getAccessToken(oAuth2Client)
    return await this.saveToken(token)
  }

  getCredentialsAndToken() {
    return new Promise(resolve => {
      this.loadCredentialsAndToken()
        .then(resolve)
        .catch(() => resolve({}))
    })
  }

  async loadCredentialsAndToken() {
    const credentials = await this.getCredentials()
    const token = await this.loadToken()

    return {credentials, token}
  }

  getCredentials() {
    return new Promise((resolve, reject) => {
      fs.readFile(CREDENTIALS_PATH, (err, content) => {
        if (err) {
          console.error(`Error loading secret file: ${CREDENTIALS_PATH}`)
          reject(err)
        } else {
          resolve(JSON.parse(content))
        }
      })
    })
  }

  getClient(credentials) {
    const { client_secret, client_id, redirect_uris } = credentials.installed
    return new google.auth.OAuth2(client_id, client_secret, redirect_uris[0])
  }

  getAccessToken(oAuth2Client) {
    return new Promise((resolve, reject) => {
      const authUrl = oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES,
      })
      console.log('Authorize this app by visiting this url:', authUrl)
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
      })
      rl.question('Enter the code from that page here: ', (code) => {
        rl.close()
        oAuth2Client.getToken(code, (err, token) => {
          if (err) {
            console.error('Error retrieving access token')
            reject(err)
          } else {
            resolve(token)
          }
        });
      });
    })
  }

  loadToken() {
    return new Promise((resolve, reject) => {
      fs.readFile(TOKEN_PATH, (err, content) => {
        if (err) {
          console.error(`Error loading token from ${TOKEN_PATH}`)
          reject(err)
        } else {
          resolve(JSON.parse(content))
        }
      })
    })
  }

  saveToken(token) {
    return new Promise((resolve, reject) => {
      fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
        if (err) {
          console.error(`Error writing token to ${TOKEN_PATH}`)
          reject(err)
        } else {
          resolve(TOKEN_PATH)
        }
      })
    })
  }
}

module.exports = GoogleDrive
