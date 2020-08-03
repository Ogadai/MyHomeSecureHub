"use strict"

const express = require('express');
const path = require('path');
let cameraFeeds = [];

module.exports = function() {
    const app = express();

    app.get('/cameras', (req, res) => {
        res.header("Access-Control-Allow-Origin", "http://localhost:3000");
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        res.json({
            cameras: cameraFeeds
        });
    });

    app.use(express.static(path.join(__dirname, 'public')));

    app.startedCamera = (name, address) => {
        console.log(`Connected camera: ${name} at ${address}`);
        cameraFeeds = cameraFeeds
            .filter(f => f.name !== name)
            .concat([{ name: name, address }]);
    }
    
    app.stoppedCamera = (name) => {
        console.log(`Disconnected camera: ${name}`);
        cameraFeeds = cameraFeeds
            .filter(f => f.name !== name);
    }
    
    return app;
}
