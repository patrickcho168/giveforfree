"use strict"

var db = require('../models/db');
var facebook = require('../controllers/facebook');
var ensureLogin = require('connect-ensure-login');
var moment = require("moment");

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

    app.post('/api/thank/profile/:profileId', ensureLogin.ensureLoggedIn(), function(req, res) {
        var userId = parseInt(req.user.appUserId); // thanker
        var profileId = parseInt(req.params.profileId); // who to thank
        var newThank = new db.Thank({
            thankerID: userId,
            message: req.body.message,
            receiverID: profileId,
            timeCreated: moment().format("YYYY-MM-DD HH:mm:ss")
        });
        newThank.save().then(function(comment) {
            res.redirect('/profile/' + profileId);
        })
    })

    app.post('/api/thank/item/:itemId', ensureLogin.ensureLoggedIn(), function(req, res) {
        var userId = parseInt(req.user.appUserId); // thanker
        var itemId = parseInt(req.params.itemId); // what you want to thank for
        db.Item.where({
            itemID: itemId
        }).fetch().then(function(itemData) {
            if (itemData != null && itemData.attributes) {
                var profileId = itemData.attributes.giverID;
                var newThank = new db.Thank({
                    thankerID: userId,
                    message: req.body.message,
                    receiverID: profileId,
                    itemID: itemId,
                    timeCreated: moment().format("YYYY-MM-DD HH:mm:ss")
                });
                newThank.save().then(function(comment) {
                    res.redirect('/item/' + itemId);
                })
            } else {
                res.redirect('/item/' + itemId);
            }
        });
    })

    // Should we allow deletion of thanks? Or just edits?
    // app.post('/api/deletethank/:thankId', ensureLogin.ensureLoggedIn(), function(req, res) {
    //     var userId = parseInt(req.user.appUserId);
    //     var thankId = parseInt(req.params.thankId);
    //     db.Thank.where({
    //         thankID: thankId,
    //         thankerID: userId // only delete if thank belongs to user
    //     }).fetch().then(function(data) {
    //         // If thank exists
    //         if (data!=null && data.attributes) {
    //             data.destroy();
    //             res.redirect('/item/' + itemId);
    //         } else {
    //             res.redirect('/');
    //         }
    //     })
    // })

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
                            db.Thank.where({
                                receiverID: otherUserId
                            }).orderBy('timeCreated', 'ASC').fetchAll({withRelated: ['thankedBy']}).then(function(thankData) {
                                res.render('profile', {
                                    loggedIn: false,
                                    myProfile: mine,
                                    user: user.attributes,
                                    id: 0,
                                    friendProperty: {},
                                    friends: [],
                                    totalGifted: gifted[0].numGiven,
                                    totalTaken: taken[0].numTaken,
                                    totalKarma: gifted[0].numGiven * 10,
                                    thank: thankData.models
                                });
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
                                db.Thank.where({
                                    receiverID: otherUserId
                                }).orderBy('timeCreated', 'ASC').fetchAll({withRelated: ['thankedBy']}).then(function(thankData) {
                                    res.render('profile', {
                                        loggedIn: true,
                                        myProfile: mine,
                                        user: user.attributes,
                                        id: req.user.appUserId,
                                        friendProperty: req.user.fbFriendsToPropertyMap,
                                        friends: data.models,
                                        totalGifted: gifted[0].numGiven,
                                        totalTaken: taken[0].numTaken,
                                        totalKarma: gifted[0].numGiven * 10,
                                        thank: thankData.models
                                    });
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
