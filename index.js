"use strict"

var express = require("express");
var passport = require("passport");
var bodyParser = require("body-parser");
var session = require('express-session');
var RedisStore = require('connect-redis')(session);
var redis = require("redis");
var client = redis.createClient();
var flash = require("connect-flash");
var expressValidator = require("express-validator");
var compression = require("compression");
var notification = require('./routes/notification');
var fbLogin = require('./routes/facebookLogin');
var upload = require('./routes/upload');
var profile = require('./routes/profile');
var freeItem = require('./routes/item');
var privacy = require('./routes/privacy');
var prelaunch = require('./routes/prelaunch');
var handleErrors = require('./routes/handleErrors')
var facebook = require('./controllers/facebook');
var paypal = require('./controllers/paypal');
var config = require('./config');
var db = require('./models/db');
var moment = require('moment');
var helmet = require('helmet');
// var csp = require('helmet-csp');

moment().format();

var app = express();

// Redirect www
function wwwRedirect(req, res, next) {
    if (req.headers.host.slice(0, 4) === 'www.') {
        var newHost = req.headers.host.slice(4);
        return res.redirect(301, req.protocol + '://' + newHost + req.originalUrl);
    }
    next();
};

app.set('trust proxy', true);
app.use(wwwRedirect);
app.use(express.static('public'));
app.use('/sweetalert', express.static(__dirname + '/node_modules/sweetalert/dist/'));
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

// app.use(require('cookie-parser')());
app.use(bodyParser.json()); // For parsing forms
app.use(expressValidator());
var sessionMiddleware = session({
    store: new RedisStore({ host: 'localhost', port: 6379, client: client, ttl : 60*60*24}),
    secret: config.secretKey,
    resave: false, // don't save session if unmodified
    saveUninitialized: false // don't create session until something stored
});
app.use(sessionMiddleware);
app.use(function (req, res, next) {
  var tries = 3;
  function lookupSession(error) {
    if (error) {
      return next(error);
    }
    tries -= 1;
    if (req.session !== undefined) {
      return next();
    }
    if (tries < 0) {
      return next(new Error('oh no'));
    }
    sessionMiddleware(req, res, lookupSession);
  }
  lookupSession();
})
// // use cookie session instead of express session for lightweight
// app.use(require('cookie-session')({
//   // Do we need to use a session store?
//   // Cookie maxAge not set yet.
//   secret: config.secretKey, // consider using array of keys [SEE: https://github.com/expressjs/cookie-session]
//   cookie: {
//     maxAge: 365 * 24 * 60 * 60 * 1000
//   }
//   // Following 2 options not required for cookie session
//   // resave: false,
//   // saveUninitialized: true
// }));

// Flash messages
app.use(flash());
app.use(function(req, res, next){
    res.locals.success_messages = req.flash('success_messages');
    res.locals.error_messages = req.flash('error_messages');
    next();
});

// Initialize Passport and restore authentication state, if any, from the
// session
app.use(passport.initialize());
app.use(passport.session());
// Define routes
app.use(fbLogin.onlyNotLogout(fbLogin.facebookCache));
app.use(fbLogin.onlyNotLogout(notification.getNotifications))
app.use(helmet());
app.use(helmet.noCache())
fbLogin.route(app);
notification.route(app);
upload(app);
profile(app);
freeItem(app);
paypal(app);
privacy(app);
prelaunch(app);
handleErrors(app);

app.listen(config.portNum);
