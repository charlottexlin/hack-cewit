const express = require('express');
const url = require('url');
const path = require('path');
require('dotenv').config();
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const serviceSid = process.env.TWILIO_SERVICE_SID;
const client = require('twilio')(accountSid, authToken);
const { MessagingResponse } = require('twilio').twiml;
const bodyParser = require('body-parser');
const { Console } = require('console');
let receivedTexts = {};

// ---------- SETUP ----------
const ___dirname = path.dirname(url.fileURLToPath(url.pathToFileURL(__filename).toString()));

// initialize express app
const app = express();

// use handlebars
app.set("view engine", "hbs");

// body parsing middleware
app.use(express.urlencoded({extended: false}));
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));

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
        if (req.body.mode == "send") {
            const msg = await sendSMS(req.body.phoneNum, req.body.text);
            res.json({status: 'success', msg: msg});
        } else if (req.body.mode == "receive") {
            res.json({status: 'success', msg: receivedTexts[req.body.phoneNum]});
        }
    } catch (err) {
        res.json({status: 'error', error: err});
    }
});

async function sendSMS(phoneNum, text) {
    try {
        client.messages.create({
            body: text,
            messagingServiceSid: serviceSid,
            to: phoneNum
        }).then(message => console.log(message.sid));
    } catch (e) { console.log(e); }
}

/*
app.post('/sms', async(req, res) => {
    receivedTexts[req.body.From] = req.body.Body;
    
    console.log(req.body);

    const twiml = new MessagingResponse();
  
    twiml.message('Received: ' + req.body);
  
    res.type('text/xml').send(twiml.toString());
});
*/

app.post('/sms', (req, res) => {
    const twiml = new MessagingResponse();
  
    twiml.message('The Robots are coming! Head for the hills!');
  
    res.type('text/xml').send(twiml.toString());
});  

// ---------- START APP ----------
app.listen(process.env.PORT || 3000);