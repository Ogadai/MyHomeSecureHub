"use strict"

const express = require('express');
const path = require('path');
const settings = require('./settings');
const recordings = require('./recordings');

let cameraFeeds = [];

const allowLocal = res => {
    res.header("Access-Control-Allow-Origin", "http://localhost:3000");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
};

module.exports = function() {
    const app = express();

    app.get('/cameras', (req, res) => {
        allowLocal(res);
        res.json({
            cameras: cameraFeeds,
            recordings: settings.recordings
        });
    });

    app.use('/recordings', recordings());

    app.use(express.static(path.join(__dirname, 'public')));

    app.startedCamera = (name, address, type) => {
        console.log(`Connected ${type} camera: ${name} at ${address}`);
        cameraFeeds = cameraFeeds
            .filter(f => f.address !== address)
            .concat([{ name: name, address, type }]);
    }
    
    app.stoppedCamera = (name, address) => {
        if (address) {
            console.log(`Disconnected camera: ${name} at ${address}`);
            cameraFeeds = cameraFeeds
                .filter(f => f.address !== address);
        } else {
            console.log(`Disconnected camera: ${name}`);
            cameraFeeds = cameraFeeds
                .filter(f => f.name !== name);
        }
    }
    
    return app;
}
