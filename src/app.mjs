import express from "express";
import url from "url";
import path from "path";
import dotenv from "dotenv";
dotenv.config();
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const serviceSid = process.env.TWILIO_SERVICE_SID;
const client = require('twilio')(accountSid, authToken);
const express = require('express');
const { MessagingResponse } = require('twilio').twiml;

// ---------- SETUP ----------
const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

// initialize express app
const app = express();

// use handlebars
app.set("view engine", "hbs");

// body parsing middleware
app.use(express.urlencoded({extended: false}));

// static file-serving middleware
app.use(express.static(path.join(__dirname, 'public')));

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

// ---------- START APP ----------
app.listen(process.env.PORT || 3000);

function sendSMS(phoneNum, text) {
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