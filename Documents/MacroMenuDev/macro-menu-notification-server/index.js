var express = require('express');
var { Expo } = require('expo-server-sdk')
var cors = require('cors');

var app = express();

app.use(cors());

app.use(express.json());

var PORT = 3300;

var expo = new Expo();

async function sendChunks(messages){
    let chunks = expo.chunkPushNotifications(messages);
    let tickets = [];

    (async () => {
        for( let chunk of chunks){
            try {
                let ticketChunk = await expo.sendPushNotificationsAsync(chunk);
                console.log(ticketChunk);
                tickets.push(ticketChunk);
            }catch (error) {
                console.error(error);
            }
        }
    })();

    return tickets; 
}


app.get('/', function(req, res) {
    console.log(req.query)
    res.status(200).send('Hello world');
});

app.post('/send-notification-from-site', function(req, res) {
    console.log(req.body.messages)
    let tickets = sendChunks(req.body.messages)
    res.status(200).send(tickets);
});

app.listen(PORT, () => {
    console.log('Server running on Port: ', PORT)
});