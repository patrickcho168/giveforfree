"use strict"

var db = require('../models/db');
var facebook = require('../controllers/facebook');
var ensureLogin = require('connect-ensure-login');

// Included to support <IE9
function inArray(needle, haystack) {
    var count = haystack.length;
    for (var i = 0; i < count; i++) {
        if (haystack[i] === needle) {
            return true;
        }
    }
    return false;
}

module.exports = function(app) {
    // SHOW PROFILE DETAILS
    // SHOW PROFILE WANTS
    // SHOW PROFILE GIVING OUT
    // SHOW PROFILE GIVEN OUT
    app.get('/profile/:id',
        function(req, res) {
            if (req.user === undefined) {
                var otherUserId = parseInt(req.params.id);
                var mine = false;
                db.User.where({
                    userID: otherUserId
                }).fetch().then(function(user) {
                    db.ProfilePageTotalGivenQuery(otherUserId, function(gifted) {
                        db.ProfilePageTotalTakenQuery(otherUserId, function(taken) {
                            res.render('profile', {
                                loggedIn: false,
                                myProfile: mine,
                                user: user.attributes,
                                id: 0,
                                friendProperty: {},
                                friends: [],
                                totalGifted: gifted[0].numGiven,
                                totalTaken: taken[0].numTaken,
                                totalKarma: gifted[0].numGiven * 10
                            });
                        });
                    });
                });
            } else {
                var otherUserId = parseInt(req.params.id);
                var mine = otherUserId === req.user.appUserId;
                db.User.where({
                    userID: otherUserId
                }).fetch().then(function(user) {
                    db.User.where('userID', 'in', req.user.fbFriendsId).fetchAll().then(function(data) {
                        db.ProfilePageTotalGivenQuery(otherUserId, function(gifted) {
                            db.ProfilePageTotalTakenQuery(otherUserId, function(taken) {
                                res.render('profile', {
                                    loggedIn: true,
                                    myProfile: mine,
                                    user: user.attributes,
                                    id: req.user.appUserId,
                                    friendProperty: req.user.fbFriendsToPropertyMap,
                                    friends: data.models,
                                    totalGifted: gifted[0].numGiven,
                                    totalTaken: taken[0].numTaken,
                                    totalKarma: gifted[0].numGiven * 10
                                });
                            });
                        });
                    });
                });
            }
        });

    // GET FRIENDS
    // app.get('/friends',
    //     ensureLogin.ensureLoggedIn(),
    //     function(req, res) {
    //         db.User.where('userID', 'in', req.user.fbFriendsId).fetchAll().then(function(data) {
    //             res.render('friends', {
    //                 friends: data.models
    //             });
    //         });
    //     });
}
