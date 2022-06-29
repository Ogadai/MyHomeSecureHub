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
  fs.readdir(path, { withFileTypes: true }, (err, files) => {
    if (err) {
      reject(err)
    } else {
      resolve(files)
    }
  })
})

const readfolders = path => readdir(path).then(
  items => items.filter(i => i.isDirectory()).map(i => i.name)
);

const readfiles = path => readdir(path).then(
  items => items.filter(i => i.isFile()).map(i => i.name)
);

module.exports = function() {
    const app = express.Router();
    const fullPath = path.join(__dirname, settings.recordingsPath);
    const recordingsUrl = settings.recordings;

    app.get('/cameras', async (req, res) => {
        allowLocal(res);

        const camFolders = await readfolders(fullPath);
        const cameras = await Promise.all(
          camFolders.map(async name => {
            const days = await readfolders(path.join(fullPath, name));
            return {
              name,
              days,
              url: recordingsUrl ? `${recordingsUrl}/${name}` : null
            };
          })
        )

        res.json({ cameras });
    });

    app.get('/clips/:name/:day', async (req, res) => {
        allowLocal(res);
        const { name, day } = req.params;
        const files = await readfiles(path.join(fullPath, name, day));

        res.json({ files });
    });

    app.post('/store/:name/:day/:file', async (req, res, next) => {
      allowLocal(res);
      const { name, day, file } = req.params;
      const src = path.join(fullPath, name, day, file);
      const dest = path.join(fullPath, name, `${day}_${file}`);

      fs.copyFile(src, dest, fs.constants.COPYFILE_EXCL, err => {
        if (err) {
          res.status(500).send({ error: err.message });
        } else {
          res.json({ message: 'Copied', src, dest });
        }
      });
    });

    app.use('/files', express.static(fullPath));
    return app;
}
