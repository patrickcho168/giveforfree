"use strict"

var express = require("express");
var flash = require("connect-flash");
var expressValidator = require("express-validator");
var compression = require("compression");
var fbLogin = require('./routes/facebookLogin');
var upload = require('./routes/upload');
var profile = require('./routes/profile');
var freeItem = require('./routes/item');
var privacy = require('./routes/privacy');
var handleErrors = require('./routes/handleErrors')
var facebook = require('./controllers/facebook');
var config = require('./config');
var db = require('./models/db');
var app = express();

app.use(express.static('public'));
// app.use('/static', express.static('public'));
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

// app.use(require('cookie-parser')());
app.use(require('body-parser').urlencoded({ extended: true })); // For parsing forms
app.use(expressValidator());
// use cookie session instead of express session for lightweight
app.use(require('cookie-session')({
  // Do we need to use a session store?
  // Cookie maxAge not set yet.
  secret: config.secretKey, // consider using array of keys [SEE: https://github.com/expressjs/cookie-session]
  // Following 2 options not required for cookie session
  // resave: false,
  // saveUninitialized: true
}));

// Flash messages
app.use(flash());
app.use(function(req, res, next){
    res.locals.success_messages = req.flash('success_messages');
    res.locals.error_messages = req.flash('error_messages');
    next();
});

// Define routes.
fbLogin(app);
upload(app);
profile(app);
freeItem(app);
privacy(app);
handleErrors(app);

app.listen(80);
