"use strict"

const express = require('express');
const fs = require('fs');
const path = require('path');
const settings = require('./settings');

let cameraFeeds = [];

const allowLocal = res => {
    res.header("Access-Control-Allow-Origin", "http://localhost:3000");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
};

const readdir = path => new Promise((resolve, reject) => {
  fs.readdir(path, (err, files) => {
    if (err) {
      reject(err)
    } else {
      resolve(files)
    }
  })
})

module.exports = function() {
    const app = express.Router();
    const fullPath = path.join(__dirname, settings.recordingsPath);

    app.get('/cameras', async (req, res) => {
        allowLocal(res);

        const camFolders = await readdir(fullPath);
        const cameras = await Promise.all(
          camFolders.map(async name => {
            const days = await readdir(path.join(fullPath, name));
            return { name, days };
          })
        )

        res.json({ cameras });
    });

    app.get('/clips/:name/:day', async (req, res) => {
        allowLocal(res);
        const { name, day } = req.params;
        const files = await readdir(path.join(fullPath, name, day));

        res.json({ files });
    });

    app.use('/files', express.static(fullPath));
    return app;
}
