const express = require('express');
const url = require('url');
const path = require('path');
require('dotenv').config();
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const serviceSid = process.env.TWILIO_SERVICE_SID;
const client = require('twilio')(accountSid, authToken);
const { MessagingResponse } = require('twilio').twiml;

// ---------- SETUP ----------
const ___dirname = path.dirname(url.fileURLToPath(url.pathToFileURL(__filename).toString()));

// initialize express app
const app = express();

// use handlebars
app.set("view engine", "hbs");

// body parsing middleware
app.use(express.urlencoded({extended: false}));

// static file-serving middleware
app.use(express.static(path.join(___dirname, 'public')));

// ---------- ROUTING ----------
// home page
app.get('/', (req, res) => {
    res.render('index');
});

// instructions page
app.get('/instructions', (req, res) => {
    res.render('instructions');
});

// game page
app.get('/game', (req, res) => {
    res.render('game');
});

// for gameplay
app.post('/game', async(req, res) => {
    try {
        await sendSMS(req.phoneNum, req.text);
        res.json({status: 'success'});
    } catch (err) {
        res.json({status: 'error'});
    }
});

async function sendSMS(phoneNum, text) {
    client.messages.create({
        body: text,
        messagingServiceSid: serviceSid,
        to: phoneNum
    }).then(message => console.log(message.sid));
}

function awaitSMS() {
    app.post('/sms', (req, res) => {
        const twiml = new MessagingResponse();
      
        twiml.message('Received!');
      
        res.type('text/xml').send(twiml.toString());
    });
      
    app.listen(3000, () => {
        console.log('Express server listening on port 3000');
    });
}

// ---------- START APP ----------
app.listen(process.env.PORT || 3000);