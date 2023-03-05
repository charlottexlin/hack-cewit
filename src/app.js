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

// ---------- SETUP ----------
const ___dirname = path.dirname(url.fileURLToPath(url.pathToFileURL(__filename).toString()));

// initialize express app
const app = express();

// use handlebars
app.set("view engine", "hbs");

// body parsing middleware
app.use(express.urlencoded({extended: false}));
app.use(express.json());
//app.use(bodyParser.urlencoded({ extended: false }));

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
        const msg = await sendSMS(req.body.phoneNum, req.body.text);
        res.json({status: 'success', msg: msg});
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

// ---------- START APP ----------
let text = "(no response)";
let phoneNum = "(no texts yet)";

app.post('/sms', (req, res) => {
    text = req.body.Body;
    phoneNum = request.body.From;

    const twiml = new MessagingResponse();
  
    twiml.message('Received: ' + text + ' ' + phoneNum);
  
    res.type('text/xml').send(twiml.toString());
});

app.listen(process.env.PORT || 3000);