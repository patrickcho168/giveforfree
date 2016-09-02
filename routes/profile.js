"use strict"

var db = require('../models/db');
var facebook = require('../controllers/facebook');
var ensureLogin = require('connect-ensure-login');
var moment = require("moment");
var base64url = require('b64url');
var crypto = require('crypto');
var xss = require('xss');
var bodyParser = require("body-parser");
var csrf = require('csurf');

var csrfProtection = csrf();
var parseForm = bodyParser.urlencoded({ extended: true, limit: '50mb' });

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

    app.get('/profile/:id/thank', function(req, res, next) {
        var profileId = req.params.id;
        db.Thank.where({
            receiverID: profileId
        }).orderBy('timeCreated', 'ASC').fetchAll({withRelated: ['thankedBy', 'upvote']}).then(function(thankData) {
            res.json(thankData);
        });
    })

    app.post('/api/thank/profile/:profileId', ensureLogin.ensureLoggedIn(), parseForm, function(req, res) {
        var userId = parseInt(req.user.appUserId); // thanker
        var profileId = parseInt(req.params.profileId); // who to thank
        if (req.body.parent === '') {
            req.body.parent = null;
        }
        var newThank = new db.Thank({
            thankerID: userId,
            message: xss(req.body.content),
            receiverID: profileId,
            timeCreated: moment().format("YYYY-MM-DD HH:mm:ss"),
            parentThank: req.body.parent
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
            db.Thank.where({
                thankID: thank.attributes.thankID
            }).fetch({withRelated: ['thankedBy', 'upvote']}).then(function(thankData) {
                res.json(thankData);
            });
        })
    })

    app.post('/api/updatethank/profile/:thankId', ensureLogin.ensureLoggedIn(), parseForm, function(req,res) {
        var userId = parseInt(req.user.appUserId);
        var thankId = parseInt(req.params.thankId);
        db.Thank.where({
            thankID: thankId,
            thankerID: userId
        }).fetch().then(function(thankData) {
            if (thankData) {
                thankData.save({
                    message: xss(req.body.content)
                }).then(function(thank) {
                    db.Thank.where({
                        thankID: thank.attributes.thankID
                    }).fetch({withRelated: ['thankedBy', 'upvote']}).then(function(newThankData) {
                        req.flash('success_messages', 'You have successfully edited your Thank You Message!');
                        res.json(newThankData);
                    });
                })
            } else {
                req.flash('error_messages', 'An error was encountered! Please try editing your Thank You Message again!');
            }
        })
    })

    app.post('/api/deletethank/profile/:thankId', ensureLogin.ensureLoggedIn(), function(req, res) {
        var userId = parseInt(req.user.appUserId);
        var thankId = parseInt(req.params.thankId);
        db.Thank.where({
            thankID: thankId
        }).fetch().then(function(data) {
            // If thank exists
            if (data!=null) {
                // Ensure comment belongs to user currently logged in
                if (data.attributes && data.attributes.thankerID === userId) {
                    data.where({
                        thankID: thankId,
                        thankerID: userId
                    }).destroy();
                    db.Notification.where({
                        thankID: thankId
                    }).fetch().then(function(oldNote) {
                        if (oldNote != null) {
                            oldNote.destroy();
                            req.flash('success_messages', 'You have successfully deleted a Thank You Message!');
                            res.json({});
                        } else {
                            req.flash('error_messages', 'An error was encountered! Please try deleting your Thank You Message again!');
                            res.json({});
                        }
                    })
                }
            }
        })
    })

    app.post('/api/thank/profile/upvotes/:thankId', ensureLogin.ensureLoggedIn(), function(req, res) {
        console.log("UPVOTE");
        var userId = parseInt(req.user.appUserId);
        var thankId = parseInt(req.params.thankId);
        console.log("USERID: " + userId);
        console.log("THANKID: " + thankId);
        db.ThankUpvote.where({
            thankID: thankId,
            userID: userId
        }).fetch().then(function(data) {
            console.log(data);
            if (!data) {
                var newThankUpvote = new db.ThankUpvote({
                    thankID: thankId,
                    userID: userId
                });
                newThankUpvote.save().then(function(thank) {
                    console.log(thank);
                    db.Thank.where({
                        thankID: thankId
                    }).fetch({withRelated: ['thankedBy', 'upvote']}).then(function(newThankData) {
                        res.json(newThankData);
                    });
                })
            } else {
                db.Thank.where({
                    thankID: thankId
                }).fetch({withRelated: ['thankedBy', 'upvote']}).then(function(newThankData) {
                    res.json(newThankData);
                });
            }
        })
    })

    app.post('/api/thank/profile/downvotes/:thankId', ensureLogin.ensureLoggedIn(), function(req, res) {
        console.log("DOWNVOTE");
        var userId = parseInt(req.user.appUserId);
        var thankId = parseInt(req.params.thankId);
        db.ThankUpvote.where({
            thankID: thankId,
            userID: userId
        }).fetch().then(function(data) {
            if (data) {
                data.destroy().then(function() {
                    db.Thank.where({
                        thankID: thankId
                    }).fetch({withRelated: ['thankedBy', 'upvote']}).then(function(newThankData) {
                        res.json(newThankData);
                    });
                })
            } else {
                db.Thank.where({
                    thankID: thankId
                }).fetch({withRelated: ['thankedBy', 'upvote']}).then(function(newThankData) {
                    res.json(newThankData);
                });
            }
        })
    })

    // THANK BY ITEM
    // app.post('/api/thank/item/:itemId', ensureLogin.ensureLoggedIn(), function(req, res) {
    //     var userId = parseInt(req.user.appUserId); // thanker
    //     var itemId = parseInt(req.params.itemId); // what you want to thank for
    //     db.Item.where({
    //         itemID: itemId
    //     }).fetch().then(function(itemData) {
    //         if (itemData != null && itemData.attributes) {
    //             var profileId = itemData.attributes.giverID;
    //             var newThank = new db.Thank({
    //                 thankerID: userId,
    //                 message: req.body.message,
    //                 receiverID: profileId,
    //                 itemID: itemId,
    //                 timeCreated: moment().format("YYYY-MM-DD HH:mm:ss")
    //             });
    //             newThank.save().then(function(thank) {
    //                 var newNote = new db.Notification({
    //                     timeCreated: moment().format("YYYY-MM-DD HH:mm:ss"),
    //                     active: 1,
    //                     notificationType: 5,
    //                     userID: userId,
    //                     itemID: itemId,
    //                     thankID: thank.attributes.thankID
    //                 });
    //                 newNote.save();
    //                 res.redirect('/item/' + itemId);
    //             })
    //         } else {
    //             res.redirect('/item/' + itemId);
    //         }
    //     });
    // })

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
    });

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
                    res.render('profile', {
                        loggedIn: false,
                        myProfile: mine,
                        user: user.attributes,
                        id: 0,
                        friendProperty: {},
                        friends: [],
                        notification: req.session.notification
                    });
                });
            } else {
                var mine = otherUserId === req.user.appUserId;
                db.User.where({
                    userID: otherUserId
                }).fetch().then(function(user) {
                    db.User.where('userID', 'in', req.user.fbFriendsId).fetchAll().then(function(data) {
                        res.render('profile', {
                            loggedIn: true,
                            myProfile: mine,
                            user: user.attributes,
                            id: req.user.appUserId,
                            friendProperty: req.user.fbFriendsToPropertyMap,
                            friends: data.models,
                            notification: req.session.notification,
                            moment: moment
                        });
                    });
                });
            }
        }
    );

    app.post('/api/delete-user', ensureLogin.ensureLoggedIn(), function(req, res, next) {
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
                        req.flash('success_messages', 'Thanks for using Give For Free! Come back anytime soon okay? We\'ll miss you!');
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
