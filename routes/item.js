"use strict";

var db = require('../models/db');
var ensureLogin = require('connect-ensure-login');
var moment = require('moment');
var facebook = require('../controllers/facebook');
var config = require('../config');
var moment = require("moment");
var xss = require('xss');
var bodyParser = require("body-parser");
var csrf = require('csurf');

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

    app.post('/api/comment/:itemId', ensureLogin.ensureLoggedIn(), function(req, res) {
        // CHECK MESSAGE NOT IMPLEMENTED
        var userId = parseInt(req.user.appUserId);
        var itemId = parseInt(req.params.itemId);
        var newComment = new db.Comment({
            commenterID: userId,
            message: req.body.message,
            itemID: itemId,
            timeCreated: moment().format("YYYY-MM-DD HH:mm:ss")
        });
        newComment.save().then(function(comment) {
            var newNote = new db.Notification({
                notificationType: 3,
                userID: userId,
                itemID: itemId,
                commentID: comment.attributes.commentID,
                timeCreated: moment().format("YYYY-MM-DD HH:mm:ss"),
                active: 1
            });
            newNote.save();
            res.redirect('/item/' + itemId);
        })
    })

    app.post('/api/deletecomment/:itemId/:commentId', ensureLogin.ensureLoggedIn(), function(req, res) {
        var userId = parseInt(req.user.appUserId);
        var commentId = parseInt(req.params.commentId);
        var itemId = parseInt(req.params.itemId);
        db.Comment.where({
            commentID: commentId,
            itemID: itemId
        }).fetch().then(function(data) {
            // If comment exists
            if (data!=null) {
                // Ensure comment belongs to user currently logged in
                if (data.attributes && data.attributes.commenterID === userId) {
                    data.where({
                        commentID: commentId,
                        commenterID: userId,
                        itemID: itemId
                    }).destroy();
                    db.Notification.where({
                        commentID: commentId
                    }).fetch().then(function(oldNote) {
                        if (oldNote != null) {
                            oldNote.destroy();
                        }
                    })
                }
            }
        })
        res.redirect('/item/' + itemId);
    })

    // This is for giving to random person
    app.get('/api/give/:itemId', ensureLogin.ensureLoggedIn(), function(req, res) {
        var userId = parseInt(req.user.appUserId);
        var itemId = parseInt(req.params.itemId);
        db.Item.where({
            itemID: itemId
        }).fetch().then(function(data) {
            // If item exists
            if (data !== null) {
                // Ensure item belongs to user currently logged in
                if (data.attributes && data.attributes.giverID === userId) {
                    // Ensure item has not been given out before
                    if (data.attributes.takerID === null) {
                        // Find who wants the item
                        db.Want.where({
                            itemID: itemId
                        }).fetchAll().then(function(wantData) {
                            // Ensure at least someone wants the item
                            if (wantData !== null) {
                                var allWantUserIds = [];
                                // Record all users who want the item
                                for (var i = 0; i < wantData.models.length; i++) {
                                    allWantUserIds.push(wantData.models[i].attributes.wanterID);
                                }
                                // Randomly choose one user id
                                var wantUserId = allWantUserIds[Math.floor(Math.random() * allWantUserIds.length)];
                                // Update item row
                                data.save({
                                    takerID: wantUserId
                                }).then(function(noUse) {
                                    res.redirect("/item/" + itemId);
                                });
                                var newNote = new db.Notification({
                                    timeCreated: moment().format("YYYY-MM-DD HH:mm:ss"),
                                    active: 1,
                                    notificationType: 4,
                                    itemID: itemId,
                                    userID: userId
                                });
                                newNote.save();
                            }
                        })
                    }
                }
            }
        });
    })

    // This is for giving to specific person
    app.get('/api/give/:itemId/:takerId', ensureLogin.ensureLoggedIn(), function(req, res) {
        var userId = parseInt(req.user.appUserId);
        var itemId = parseInt(req.params.itemId);
        var wanterId = parseInt(req.params.takerId);
        db.Item.where({
            itemID: itemId
        }).fetch().then(function(data) {
            // If item exists
            if (data !== null) {
                // Ensure item belongs to user currently logged in
                if (data.attributes && data.attributes.giverID === userId) {
                    // Ensure item has not been given out before
                    if (data.attributes.takerID === null) {
                        // Check whether taker really wants the item
                        db.Want.where({
                            itemID: itemId,
                            wanterID: wanterId
                        }).fetch().then(function(wantData) {
                            // Update item row
                            if (wantData !== null) {
                                data.save({
                                    takerID: wanterId
                                }).then(function(noUse) {
                                    res.redirect("/item/" + itemId);
                                });
                                var newNote = new db.Notification({
                                    timeCreated: moment().format("YYYY-MM-DD HH:mm:ss"),
                                    active: 1,
                                    notificationType: 4,
                                    itemID: itemId,
                                    userID: userId
                                });
                                newNote.save();
                            }
                        })
                    }
                }
            }
        });
    })

    // Update an item
    app.post('/api/update/:itemId', ensureLogin.ensureLoggedIn(), function(req, res) {
        var itemId = parseInt(req.params.itemId);
        var userId = parseInt(req.user.appUserId);
        db.Item.where({
            itemID: itemId,
            giverID: userId
        }).fetch().then(function(item) {
            // If this item exists
            if (item) {
                item.save({
                    title: req.body.title,
                    description: req.body.description
                }).then(function() {
                    res.redirect("/item/" + itemId);
                });
            } else {
                res.redirect("/item/" + itemId);
            }
        });
    });

    // Delete an item
    app.get('/api/delete/:itemId', ensureLogin.ensureLoggedIn(), function(req, res) {
        var itemId = parseInt(req.params.itemId);
        var userId = parseInt(req.user.appUserId);
        db.Item.where({
            itemID: itemId,
            giverID: userId
        }).fetch().then(function(item) {
            // If this item exists
            if (item) {
                item.where({
                    itemID: itemId,
                    giverID: userId
                }).destroy();
            }
        });
        res.redirect("/");
    });

    // Want a product (given itemID and userID)
    // Should return success header?
    app.post('/api/want/:itemId', ensureLogin.ensureLoggedIn(), function(req, res, next) {
        var itemId = parseInt(req.params.itemId);
        var userId = parseInt(req.user.appUserId);

        db.Want.where({
            itemID: itemId,
            wanterID: userId
        }).fetch().then(function(oldWant) {
            db.Item.where({
                itemID: itemId
            }).fetch().then(function(item) {
                // Check if item is owned by this person
                if (item.giverID != userId) {
                    // Check if item already wanted by this person
                    if (oldWant === null) {

                        // Register a new claim for the item
                        var newWant = new db.Want({
                            itemID: itemId,
                            wanterID: userId,
                            timeWanted: moment().format("YYYY-MM-DD HH:mm:ss")
                        });

                        // Store in db
                        newWant.save().then(function(want) {
                            // Register a new notification for the want of the item
                            db.Notification.where({
                                itemID: itemId,
                                notificationType: 1,
                                userID: userId
                            }).fetch().then(function(oldNote) {
                                if (oldNote) {
                                    oldNote.save({
                                        wantID: want.attributes.wantID,
                                        timeCreated: moment().format("YYYY-MM-DD HH:mm:ss"),
                                        active: 1
                                    }, {
                                        method: "update"
                                    });
                                } else {
                                    var newNote = new db.Notification({
                                        wantID: want.attributes.wantID,
                                        timeCreated: moment().format("YYYY-MM-DD HH:mm:ss"),
                                        active: 1,
                                        notificationType: 1,
                                        itemID: itemId,
                                        userID: userId
                                    });
                                    newNote.save();
                                }
                            })
                        });
                    }
                }
            });
        });

        next();
    })

    // Want a product (given itemID and userID)
    app.post('/api/unwant/:itemId', ensureLogin.ensureLoggedIn(), function(req, res, next) {
        var itemId = parseInt(req.params.itemId);
        var userId = parseInt(req.user.appUserId);

        // Check if item is wanted by this person
        db.Want.where({
            itemID: itemId,
            wanterID: userId
        }).fetch().then(function(oldWant) {
            if (oldWant) {
                // Remove
                oldWant.where({
                    itemID: itemId,
                    wanterID: userId
                }).destroy().then(function() {
                    // Register a new notification for the want of the item
                    db.Notification.where({
                        itemID: itemId,
                        notificationType: 1,
                        userID: userId
                    }).fetch().then(function(oldNote) {
                        if (oldNote) {
                            oldNote.save({
                                active: 0
                            });
                        }
                    })
                });
            }
        });

        next();
    })

    app.get('/api/myWants/:lastItemId/:loadNum/:profileId', function(req, res) {
        var lastSeenItem = parseInt(req.params.lastItemId);
        var numItems = parseInt(req.params.loadNum);
        var profileId = parseInt(req.params.profileId);
        var userId;
        if (req.user === undefined) {
            userId = 0;
        } else {
            userId = parseInt(req.user.appUserId);
        }
        if (lastSeenItem === 0) {
            db.ProfilePageWantQuery(userId, profileId, numItems, function(data) {
                res.json(data);
            });
        } else {
            db.ProfilePageWantQueryBeforeId(userId, profileId, numItems, lastSeenItem, function(data) {
                res.json(data);
            });
        }
    });

    app.get('/api/myItems/:lastItemId/:loadNum/:profileId', function(req, res) {
        var lastSeenItem = parseInt(req.params.lastItemId);
        var numItems = parseInt(req.params.loadNum);
        var profileId = parseInt(req.params.profileId);
        var userId;
        if (req.user === undefined) {
            userId = 0;
        } else {
            userId = parseInt(req.user.appUserId);
        }

        if (lastSeenItem === 0) {
            db.ProfilePageGiveQuery(userId, profileId, numItems, function(data) {
                res.json(data);
            });
        } else {
            db.ProfilePageGiveQueryBeforeId(userId, profileId, numItems, lastSeenItem, function(data) {
                res.json(data);
            });
        }
    });

    // UNCOMMENT IF WANT TO SHOW ITEMS FROM FRIENDS: Find items posted from friends
    // app.get('/api/friendItems/:lastItemId/:loadNum', ensureLogin.ensureLoggedIn(), function(req, res) {
    //   // db.getNextItems(req.params.pageNum, req.user.fbFriendsId, function(result) {
    //   //   res.json(result);
    //   // });
    //   var lastSeenItem = parseInt(req.params.lastItemId);
    //   var numItems = parseInt(req.params.loadNum);
    //   if (lastSeenItem === 0) {
    //     db.Item.where({takerID: null}).where('giverID', 'in', req.user.fbFriendsId).orderBy('timeCreated', 'DESC').query(function (qb) {qb.limit(numItems);}).fetchAll({withRelated: ['ownedBy']}).then(function(data3) {
    //       res.json(data3.models);
    //     });
    //   } else {
    //     db.Item.where('itemID', '<', lastSeenItem).where({takerID: null}).where('giverID', 'in', req.user.fbFriendsId).orderBy('timeCreated', 'DESC').query(function (qb) {qb.limit(numItems);}).fetchAll({withRelated: ['ownedBy']}).then(function(data3) {
    //       res.json(data3.models);
    //     });
    //   }
    // });

    // Find items posted by anyone other than yourself
    app.get('/api/allItems/:lastItemId/:loadNum', function(req, res) {
        // db.getNextItems(req.params.pageNum, req.user.fbFriendsId, function(result) {
        //   res.json(result);
        // });
        var lastSeenItem = parseInt(req.params.lastItemId);
        var numItems = parseInt(req.params.loadNum);
        if (req.user === undefined) {
            if (lastSeenItem === 0) {
                db.HomePageItemQuery(0, numItems, function(data) {
                    res.json(data);
                })
            } else {
                db.HomePageItemQueryBeforeId(0, numItems, lastSeenItem, function(data) {
                    res.json(data);
                })
            }
        } else {
            var userId = parseInt(req.user.appUserId);
            if (lastSeenItem === 0) {
                db.HomePageItemQuery(userId, numItems, function(data) {
                    res.json(data);
                })
            } else {
                db.HomePageItemQueryBeforeId(userId, numItems, lastSeenItem, function(data) {
                    res.json(data);
                })
            }
        }
    });

    // ITEM PAGE
    app.get('/item/:id', function(req, res, next) {
        var itemId = req.params.id;
        req.session.lastPageVisit = '/item/' + itemId;
        var userId;
        var loggedIn;
        if (req.user === undefined) {
            userId = 0;
            loggedIn = false;
        } else {
            userId = req.user.appUserId;
            loggedIn = true;
        }

        // Find Item
        db.ItemPageQuery(userId, itemId, function(data) {

            if (!(data.length)) {
                next();
            } else {
                var date = moment(data[0].timeExpired);
                var expiredMin = moment().diff(date, 'minutes');
                var processedDate = date.locale('en-gb').format("LLL");
                db.ProfilePageTotalGivenQuery(data[0].giverID, function(gifted) {
                    db.Comment.where({
                        itemID: itemId
                    }).orderBy('timeCreated', 'ASC').fetchAll({withRelated: ['commentedBy']}).then(function(commentData) {
                        var mine = userId === data[0].giverID;
                        if (mine && data[0].takerID === null && data[0].numWants > 0) {
                            db.ItemPageManualQuery(itemId, function(data2) {
                                res.render('item', {
                                    id: userId,
                                    item: data[0],
                                    mine: mine,
                                    appId: config.fbClientID,
                                    domain: config.domain,
                                    date: processedDate,
                                    expired: expiredMin > 0,
                                    karma: gifted[0].numGiven * 10,
                                    gifts: gifted[0].numGiven,
                                    manual: data2,
                                    loggedIn: loggedIn,
                                    comment: commentData.models,
                                    notification: req.session.notification,
                                    moment: moment,
                                    fbNameSpace: config.fbNamespace
                                });
                            });
                        } else {
                            res.render('item', {
                                id: userId,
                                item: data[0],
                                mine: mine,
                                appId: config.fbClientID,
                                domain: config.domain,
                                date: processedDate,
                                expired: expiredMin > 0,
                                karma: gifted[0].numGiven * 10,
                                gifts: gifted[0].numGiven,
                                loggedIn: loggedIn,
                                comment: commentData.models,
                                notification: req.session.notification,
                                moment: moment,
                                fbNameSpace: config.fbNamespace
                            });
                        }
                    });
                });
            }
        })
    });
}
