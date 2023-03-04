import express from "express";
import url from "url";
import path from "path";

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