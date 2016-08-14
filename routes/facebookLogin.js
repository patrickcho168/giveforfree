"use strict";

var passport = require("passport");
var Strategy = require("passport-facebook").Strategy;
var ensureLogin = require('connect-ensure-login');
var config = require('../config');
var db = require('../models/db');
var facebook = require('../controllers/facebook');

passport.use(new Strategy({
    clientID: config.fbClientID,
    clientSecret: config.fbClientSecret,
    callbackURL: '/login/facebook/return',
    profileFields: ['id', 'displayName', 'photos', 'email', 'birthday', 'gender', 'friends']
  },
  function(accessToken, refreshToken, profile, cb) {
    profile.accessToken = accessToken;
    db.User.where({fbID: profile.id}).fetch().then(function(user) {
      if (user === null) {
        console.log("New User: " + profile.displayName);
        var newUser = new db.User({
          fbID: profile.id,
          name: profile.displayName
        });
        newUser.save().then(function(user2) {
          profile.appUserId = user2.attributes.id;
          return cb(null, profile);
        });
      } else {
        profile.appUserId = user.attributes.userID;
        return cb(null, profile);
      }
    });
  })
);

passport.serializeUser(function(user, cb) {
  cb(null, user);
});

passport.deserializeUser(function(obj, cb) {
  cb(null, obj);
});

module.exports = function(app) {
  // Initialize Passport and restore authentication state, if any, from the
  // session.
  app.use(passport.initialize());
  app.use(passport.session());

  // CACHE THINGS HERE
  var facebookCache = function(req, res, next) {
    if (req.session.fbFriends && req.session.fbFriendsId && req.session.fbFriendsToPropertyMap) {
      console.log("CACHED");
      next();
    } else {
      console.log("NOT CACHED");
      if (req.session.passport === undefined) {
        next();
      } else {
        var accessToken = req.session.passport.user.accessToken;
        facebook.getFbData(accessToken, '/' + req.user.id +'/friends', function(data) {
          var jsonData = JSON.parse(data);
          var friendsData = jsonData.data;
          var friendsQuery = [];
          if (friendsData instanceof Array) {
            for (var i=0; i<friendsData.length; i++) {
              friendsQuery.push(friendsData[i].id); // all Facebook IDs of friends
            }
          }
          var cacheFriends = []; // List of {userID, name, fbID}
          var cacheFriendsAppId = []; // List of userID
          var cacheFriendsToPropertiesMapping = {};
          db.User.where('fbID', 'in', friendsQuery).fetchAll().then(function(data2) {
            for (var i=0; i<data2.models.length; i++) {
              cacheFriends.push(data2.models[i].attributes);
              cacheFriendsAppId.push(data2.models[i].attributes.userID);
              cacheFriendsToPropertiesMapping[data2.models[i].attributes.userID] = data2.models[i].attributes;
            }
            // CACHE
            req.session.fbFriends = cacheFriends;
            req.session.fbFriendsId = cacheFriendsAppId;
            req.session.fbFriendsToPropertyMap = cacheFriendsToPropertiesMapping;
            console.log(req.session.fbFriendsId);
            next();
          });
        });
      }
    }
  };

  var onlyNotLogout = function(fn) {
    return function(req,res,next) {
      if (req.path != '/logout' && req.path != '/login' && req.path != '/login/facebook' && req.path != '/login/facebook/return' && req.path != "/privacy" && ensureLogin.ensureLoggedIn()) {
        fn(req,res,next);
      } else {
        next();
      }
    }
  };

  app.use(onlyNotLogout(facebookCache));

  // HOME PAGE
  // DISPLAY ALL ITEMS FROM FRIENDS OR ALL ITEMS
  // MIGHT WANT TO ADD ITEMS THAT ARE ALLOWED TO BE GIVEN TO EVERYONE
  app.get('/', ensureLogin.ensureLoggedIn(),
    function(req, res) {
      db.Item.where({takerID: null}).where('giverID', 'in', req.session.fbFriendsId).fetchAll().then(function(data3) {
        res.render('homeLoggedIn', {user:req.user, availItems: data3.models, friendProperty: req.session.fbFriendsToPropertyMap});
      });
    });

  // app.get('/login',
  //   function(req, res){
  //     res.render('loginSS');
  //   });

  // TESTING
  app.get('/login',
    function(req, res){
      res.render('homeLoggedIn', {user:req.user});
    //   res.render('loginSS');
    });

  app.get('/login/facebook',
    passport.authenticate('facebook', { scope: ['user_friends'] })); // NEED TO ADD POST ITEM SCOPE

  app.get('/login/facebook/return',
    passport.authenticate('facebook', { failureRedirect: '/login' }),
    function(req, res) {
      res.redirect('/');
    });

  app.get('/logout', function(req, res) {
    req.logout();
    // req.session.destroy(function(err2) {
    //   res.redirect('/login');
    // });
    req.session = null;
    res.redirect('/login');
  })
}
