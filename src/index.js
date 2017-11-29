//@ts-check
const cluster = require('cluster');
const path = require('path');
const botbuilder = require('botbuilder');
const express = require("express");
const botsfactory = require('@botsfactory/botsfactory');
const { FacebookConnector } = require('./FacebookConnector.js');

const EXIT_CODE_RESTART = 107;

if (cluster.isMaster && process.env.NODE_ENV !== "development") {
    cluster.fork();

    cluster.on('exit', (worker, code) => {
        if (code === EXIT_CODE_RESTART) {
            cluster.fork();
            console.log('Restarting bot process...');
        } else {
            process.exit(code);
        }
    })
} else { //if cluster.isWorker or if you are using VSCode to debug
    start();
}


function start() {
    const connector = new FacebookConnector();

    const server = express();
    
    var bot = new botbuilder.UniversalBot(connector);

    const intents = new botbuilder.IntentDialog({ recognizers: [], recognizeOrder: botbuilder.RecognizeOrder.series })

    bot.dialog('/', intents);

    const DB_URI = process.env.DB_URI || 'mongodb://localhost:27017/starter-echobot';

    //LET'S DO IT!
    botsfactory.powerUp({
        bot,
        server,
        dbUri: DB_URI
    }).then((result) => {

        console.log(result);

        // Handle Bot Framework messages
        server.post('/api/messages', connector.listen());
        
        server.get('/api/messages', function (req, res) {
            res.send(req.query['hub.challenge']);
        });

        const listener = server.listen(process.env.PORT || 8989, function () {
            console.log('Bot started listening on', listener.address().address, listener.address().port);
        })
    });
}












