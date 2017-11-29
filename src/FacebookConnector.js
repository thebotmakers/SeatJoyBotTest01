const async = require("async");
const axios = require('axios');
const { Message } = require('botbuilder');
const accessTokens = require('./AccessTokens.json');

class FacebookConnector {

    constructor(projects) {
        this.replyCnt = 0;
    }

    listen() {

        return (req, res) => {

            if (req.body) {

                let message = req.body.entry[0].messaging[0];

                if (message.message && message.message.text) {

                    this.replyCnt = 0;

                    var msg = new Message()
                        .address({
                            channelId: 'facebook',
                            user: { id: message.sender.id, name: 'User' },
                            bot: { id: message.recipient.id, name: 'Bot' },
                        })
                        .timestamp()
                        .text(message.message.text);

                    this.onEventHandler([msg.toMessage()]);
                }

            } else {
                console.log('No body found...');
            }

            res.sendStatus(200);
        };
    };

    onEvent(handler) {
        this.onEventHandler = handler;
    };

    send(messages) {
        var _this = this;

        messages.forEach(async (msg) => {
            try {

                if (msg.type == 'message') {
                    if (_this.replyCnt++ > 0) {
                        console.log();
                    }

                    if (msg.text) {
                        console.log(msg.text);

                        let url = `https://graph.facebook.com/v2.6/me/messages?access_token=${accessTokens[msg.address.bot.id].access_token}`;
                        let message = {
                            messaging_type: 'RESPONSE',
                            recipient: {
                                id: msg.address.user.id
                            },
                            message: {
                                text: msg.text
                            }
                        };

                        let newMsgResponse = await axios.post(url, message);
                        console.log(newMsgResponse);
                    }
                } else {
                    console.log(`Message type is: ${msg.type}.`);
                }

            } catch (e) {
                console.log(`An error has occurred with message: ${msg}.`);
            }
        });
    };

    startConversation(address, cb) {
        var adr = { ...address }
        adr.conversation = { id: 'Convo1' };
        cb(null, adr);
    };

};

module.exports.FacebookConnector = FacebookConnector;