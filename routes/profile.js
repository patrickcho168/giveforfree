"use strict"

var db = require('../models/db');
var facebook = require('../controllers/facebook');
var ensureLogin = require('connect-ensure-login');
var moment = require("moment");
var base64url = require('b64url');
var crypto = require('crypto');

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
        newThank.save().then(function(thank) {
            var newNote = new db.Notification({
                timeCreated: moment().format("YYYY-MM-DD HH:mm:ss"),
                active: 1,
                notificationType: 5,
                userID: userId,
                thankID: thank.attributes.thankID
            });
            newNote.save();
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
                newThank.save().then(function(thank) {
                    var newNote = new db.Notification({
                        timeCreated: moment().format("YYYY-MM-DD HH:mm:ss"),
                        active: 1,
                        notificationType: 5,
                        userID: userId,
                        itemID: itemId,
                        thankID: thank.attributes.thankID
                    });
                    newNote.save();
                    res.redirect('/item/' + itemId);
                })
            } else {
                res.redirect('/item/' + itemId);
            }
        });
    })

    function parse_signed_request(signed_request, secret) {
        encoded_data = signed_request.split('.', 2);
        // decode the data
        sig = encoded_data[0];
        json = base64url.decode(encoded_data[1]);
        data = JSON.parse(json); // ERROR Occurs Here!

        // check algorithm - not relevant to error
        if (!data.algorithm || data.algorithm.toUpperCase() != 'HMAC-SHA256') {
            console.error('Unknown algorithm. Expected HMAC-SHA256');
            return null;
        }

        // check sig - not relevant to error
        expected_sig = crypto.createHmac('sha256', secret).update(encoded_data[1]).digest('base64').replace(/\+/g, '-').replace(/\//g, '_').replace('=', '');
        if (sig !== expected_sig) {
            console.error('Bad signed JSON Signature!');
            return null;
        }

        return data;
    }

    app.post('/api/delete-user-from-fb', function(req, res) {
        var signedRequest = req.param.signed_request;
        var appSecret = config.fbClientSecret;
        var data = parse_signed_request(signedRequest, appSecret);
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
            var otherUserId = parseInt(req.params.id);
            req.session.lastPageVisit = '/profile/' + otherUserId;
            if (req.user === undefined) {
                var mine = false;
                db.User.where({
                    userID: otherUserId
                }).fetch().then(function(user) {
                    db.ProfilePageTotalGivenQuery(otherUserId, function(gifted) {
                        db.ProfilePageTotalTakenQuery(otherUserId, function(taken) {
                            db.Thank.where({
                                receiverID: otherUserId
                            }).orderBy('timeCreated', 'ASC').fetchAll({
                                withRelated: ['thankedBy']
                            }).then(function(thankData) {
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
                                    thank: thankData.models,
                                    notification: req.session.notification
                                });
                            });
                        });
                    });
                });
            } else {
                var mine = otherUserId === req.user.appUserId;
                db.User.where({
                    userID: otherUserId
                }).fetch().then(function(user) {
                    db.User.where('userID', 'in', req.user.fbFriendsId).fetchAll().then(function(data) {
                        db.ProfilePageTotalGivenQuery(otherUserId, function(gifted) {
                            db.ProfilePageTotalTakenQuery(otherUserId, function(taken) {
                                db.Thank.where({
                                    receiverID: otherUserId
                                }).orderBy('timeCreated', 'ASC').fetchAll({
                                    withRelated: ['thankedBy']
                                }).then(function(thankData) {
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
                                        thank: thankData.models,
                                        notification: req.session.notification,
                                        moment: moment
                                    });
                                });
                            });
                        });
                    });
                });
            }
        }
    );

    app.get('/api/delete-user', ensureLogin.ensureLoggedIn(), function(req, res, next) {
        db.User.where({
            userID: req.user.appUserId
        }).fetch().then(function(user) {
            if (user) {
                user.save({
                    name: null,
                    deleted: true
                }).then(function() {
                    // Delete all this user's items that have no takerID
                    db.Item.where({
                        giverID: req.user.appUserId,
                        takerID: null
                    }).destroy().then(function() {
                        // Revoke permissions
                        facebook.getFbData(req.user.accessToken,
                            '/' + req.user.id + '/permissions',
                            "method=DELETE",
                            function(resp) {
                                console.log(resp);
                            });
                        res.redirect("/logout");
                    }).catch(function(err) {
                        next(err);
                    });
                }).catch(function(err) {
                    next(err);
                });
            } else {
                res.redirect("/logout");
            }
        });
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
