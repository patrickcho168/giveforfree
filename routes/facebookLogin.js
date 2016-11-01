"use strict";

var passport = require("passport");
var Strategy = require("passport-facebook").Strategy;
var ensureLogin = require('connect-ensure-login');
var config = require('../config');
var db = require('../models/db');
var facebook = require('../controllers/facebook');
var note = require('./notification');
var moment = require('moment');
var https = require('https');

passport.use(new Strategy({
        clientID: config.fbClientID,
        clientSecret: config.fbClientSecret,
        callbackURL: '/login/facebook/return',
        profileFields: ['id', 'displayName', 'photos', 'email', 'birthday', 'gender', 'friends', 'hometown']
    },
    function(accessToken, refreshToken, profile, cb) {
        profile.accessToken = accessToken;
        console.log(profile);
        db.User.where({
            fbID: profile.id
        }).fetch().then(function(user) {
            if (user === null) {
                var email = null;
                if (profile.emails && profile.emails.length > 0) {
                    email = profile.emails[0].value;
                }
                var newUser = new db.User({
                    fbID: profile.id,
                    name: profile.displayName,
                    email: email
                });
                newUser.save().then(function(user2) {
                    profile.appUserId = user2.attributes.userID;
                    return cb(null, profile);
                });
            } else if (user.attributes.deleted) {
                user.save({
                    name: profile.displayName,
                    deleted: false
                }).then(function(user2) {
                    profile.appUserId = user2.attributes.userID;
                    return cb(null, profile);
                })
            } else {
                profile.appUserId = user.attributes.userID;
                return cb(null, profile);
            }
        });
    }));

passport.serializeUser(function(user, cb) {
    cb(null, user);
});

passport.deserializeUser(function(obj, cb) {
    cb(null, obj);
});

var toExport = {}
toExport.route = function(app) {

    // HOME PAGE
    app.get('/feed', function(req, res) {
        req.session.lastPageVisit = '/feed';
        if (req.user === undefined) {
            res.render('homeLoggedIn', {
                id: null,
                loggedIn: false
            });
        } else {
            var userId = req.user.appUserId;
            db.User.where({
                userID: userId
            }).fetch().then(function(user) {
                res.render('homeLoggedIn', {
                    notification: req.session.notification,
                    moment: moment,
                    id: userId,
                    user: user.attributes,
                    loggedIn: true
                });
            });
        }
    });

    app.get('/', function(req, res) {
        req.session.lastPageVisit = '/feed';
        if (req.user === undefined) {
            res.render('loginSS', {
                user: null,
                loggedIn: false,
                id: null
            });
        } else {
            var userId = req.user.appUserId;
            db.User.where({
                userID: userId
            }).fetch().then(function(user) {
                res.render('loginSS', {
                    user: user.attributes,
                    notification: req.session.notification,
                    moment: moment,
                    loggedIn: true,
                    id: userId
                });
            });
        }
    });

    app.get('/login/facebook',
        passport.authenticate('facebook', {
            // scope: ['user_friends'] // USE THIS TO GET USERS FIRST
            // scope: ['user_friends', 'publish_actions']
            scope: ['user_friends', 'email']
        }));

    app.get('/login/facebook/return',
        passport.authenticate('facebook', {
            failureRedirect: '/'
        }),
        function(req, res) {
            if (req.session  && req.session.lastPageVisit) {
                if (req.session.lastPageVisit === '/') {
                    res.redirect('/upload');
                } else {
                    res.redirect(req.session.lastPageVisit);
                }
            } else {
                res.redirect('/feed');
            }
        });

    app.get('/logout', function(req, res) {
        req.logout();
        req.session.destroy();
        // req.session = null;
        res.redirect('/');
    })
}
    // CACHE THINGS HERE
toExport.facebookCache = function(req, res, next) {
    if (req.user && req.user.fbFriends && req.user.fbFriendsId && req.user.fbFriendsToPropertyMap) {
        next();
    } else {
        if (req.user === undefined) {
            next();
        } else {
            var accessToken = req.user.accessToken;
            facebook.getFbData(accessToken, '/' + req.user.id + '/friends', '', function(data) {
                var jsonData = JSON.parse(data);
                var friendsData = jsonData.data;
                var friendsQuery = [];
                if (friendsData instanceof Array) {
                    for (var i = 0; i < friendsData.length; i++) {
                        friendsQuery.push(friendsData[i].id); // all Facebook IDs of friends
                    }
                }
                // GET ALL FRIENDS USING PAGINATION
                // if (jsonData.paging && jsonData.paging.next) {
                //     do {
                //         console.log(jsonData.paging.next);
                //         var request = https.get(jsonData.paging.next, function(result){
                //             result.setEncoding('utf8');
                //             var buffer = '';
                //             result.on('data', function(chunk){
                //                 buffer += chunk;
                //             });

                //             result.on('end', function(){
                //                 jsonData = JSON.parse(buffer);
                //                 var newFriendsData = jsonData.data;
                //                 console.log(newFriendsData);
                //                 if (newFriendsData instanceof Array) {
                //                     for (var i = 0; i < newFriendsData.length; i++) {
                //                         friendsQuery.push(newFriendsData[i].id); // all Facebook IDs of friends
                //                     }
                //                 }
                //             });
                //         });
                //         request.end();
                //         request.on('error', function(e) {
                //             console.error(e);
                //         });
                //     } while (jsonData.paging && jsonData.paging.next)
                // }
                var cacheFriends = []; // List of {userID, name, fbID}
                var cacheFriendsAppId = []; // List of userID
                var cacheFriendsToPropertiesMapping = {};
                db.User.where('fbID', 'in', friendsQuery).fetchAll().then(function(data2) {
                    for (var i = 0; i < data2.models.length; i++) {
                        cacheFriends.push(data2.models[i].attributes);
                        cacheFriendsAppId.push(data2.models[i].attributes.userID);
                        cacheFriendsToPropertiesMapping[data2.models[i].attributes.userID] = data2.models[i].attributes;
                    }
                    // CACHE
                    req.user.fbFriends = cacheFriends;
                    req.user.fbFriendsId = cacheFriendsAppId;
                    req.user.fbFriendsToPropertyMap = cacheFriendsToPropertiesMapping;
                    next();
                });
            });
        }
    }
};

toExport.onlyNotLogout = function(fn) {
    return function(req, res, next) {
        if (req.path != '/logout' && req.path != '/' && req.path != '/login/facebook' && req.path != '/login/facebook/return' && req.path != "/privacy" && ensureLogin.ensureLoggedIn() && req.path.substring(0, 4) != "/api" && req.path != "/favicon.ico") {
            fn(req, res, next);
        } else {
            next();
        }
    }
};

module.exports = toExport;

