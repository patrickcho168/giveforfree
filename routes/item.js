"use strict";

var db = require('../models/db');
var ensureLogin = require('connect-ensure-login');
var moment = require('moment');

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

    // Display item page
    app.get('/item/:itemId', ensureLogin.ensureLoggedIn(), function(req, res, next) {
        var itemId = parseInt(req.params.itemId);
        var giver_name;
        var myItem;

        db.Item.where({
            itemID: itemId
        }).fetch().then(function(item) {
            if (!(item)) {
                res.render('404');
                return;
            }
            db.User.where({
                userID: item.attributes.giverID
            }).fetch().then(function(user) {

                res.render('item', {
                    myItem: item.attributes.giverID === req.user.appUserId,
                    giver_name: giver_name,
                    item: JSON.parse(JSON.stringify(item)),
                    id: req.user.appUserId
                });
            });
        });
    });

    // This is for giving to random person
    app.post('/api/give/:itemId', ensureLogin.ensureLoggedIn(), function(req, res) {
        var userId = parseInt(req.user.appUserId);
        var itemId = parseInt(req.params.itemId);
        db.Item.where({
            itemID: itemId
        }).fetch().then(function(data) {
            // If item exists
            if (data !== null) {
                // Ensure item belongs to user currently logged in
                if (data.attributes && data.attributes.takerID === userId) {
                    // Ensure item has not been given out before
                    if (data.attributes.giverID === null) {
                        // Find who wants the item
                        db.Want.where({
                            itemID: itemId
                        }).fetchall().then(function(wantData) {
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
                                });
                            }
                        })
                    }
                }
            }
        });
    })

    // This is for giving to specific person
    app.post('/api/give/:itemId/:takerId', ensureLogin.ensureLoggedIn(), function(req, res) {
        var userId = parseInt(req.user.appUserId);
        var itemId = parseInt(req.params.itemId);
        var wanterId = parseInt(req.param.takerId);
        db.Item.where({
            itemID: itemId
        }).fetch().then(function(data) {
            // If item exists
            if (data !== null) {
                // Ensure item belongs to user currently logged in
                if (data.attributes && data.attributes.takerID === userId) {
                    // Ensure item has not been given out before
                    if (data.attributes.giverID === null) {
                        // Check whether taker really wants the item
                        db.Want.where({
                            itemID: itemId,
                            wanterID: wanterId
                        }).fetch().then(function(wantData) {
                            // Update item row
                            if (wantData !== null) {
                                data.save({
                                    takerID: wanterId
                                });
                            }
                        })
                    }
                }
            }
        });
    })

    // Update an item
    app.post('api/update/:itemId', ensureLogin.ensureLoggedIn(), function(req, res, next) {
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
                }).update({
                    title: req.body.title,
                    description: req.body.description
                })
            }
        });

        next();
    });

    // Delete an item
    app.post('api/delete/:itemId', ensureLogin.ensureLoggedIn(), function(req, res, next) {
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

        next();
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
                console.log(item);
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
                        newWant.save();
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
                }).destroy();
            }
        });

        next();
    })

    app.get('/api/myWants/:lastItemId/:loadNum/:profileId', ensureLogin.ensureLoggedIn(), function(req, res) {
        // db.getNextItems(req.params.pageNum, req.user.fbFriendsId, function(result) {
        //   res.json(result);
        // });
        var lastSeenItem = parseInt(req.params.lastItemId);
        var numItems = parseInt(req.params.loadNum);
        var userId = parseInt(req.user.appUserId);
        var profileId = parseInt(req.params.profileId);
        if (lastSeenItem === 0) {
            db.ProfilePageWantQuery(userId, profileId, numItems, function(data) {
                console.log(data);
                res.json(data);
            });
            // db.Item.where({giverID: userId}).orderBy('timeCreated', 'DESC').query(function (qb) {qb.limit(numItems);}).fetchAll().then(function(data3) {
            //   res.json(data3.models);
            // });
        } else {
            db.ProfilePageWantQueryBeforeId(userId, profileId, numItems, lastSeenItem, function(data) {
                res.json(data);
            });
            // db.Item.where('itemID', '<', lastSeenItem).where({giverID: userId}).orderBy('timeCreated', 'DESC').query(function (qb) {qb.limit(numItems);}).fetchAll().then(function(data3) {
            //   res.json(data3.models);
            // });
        }
    });

    app.get('/api/myItems/:lastItemId/:loadNum/:profileId', ensureLogin.ensureLoggedIn(), function(req, res) {
        var lastSeenItem = parseInt(req.params.lastItemId);
        var numItems = parseInt(req.params.loadNum);
        var userId = parseInt(req.user.appUserId);
        var profileId = parseInt(req.params.profileId);
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
    app.get('/api/allItems/:lastItemId/:loadNum', ensureLogin.ensureLoggedIn(), function(req, res) {
        // db.getNextItems(req.params.pageNum, req.user.fbFriendsId, function(result) {
        //   res.json(result);
        // });
        var lastSeenItem = parseInt(req.params.lastItemId);
        var numItems = parseInt(req.params.loadNum);
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
    });


    // ITEM PAGE
    app.get('/item/:id', ensureLogin.ensureLoggedIn(), function(req, res) {
        var itemId = req.params.id;
        // Find Item
        db.Item.where({
            itemID: itemId
        }).fetch().then(function(itemData) {
            // Is it my item?
            var giverId = itemData.attributes.giverID;
            var mine = req.user.appUserId == giverId;
            var friend;
            if (inArray(giverId, req.user.fbFriendsId)) {
                friend = true;
            } else {
                friend = false;
            }
            // If Item not mine or not friends
            if (friend || mine) {
                res.render('item', {
                    myItem: mine,
                    item: itemData.attributes,
                    friendProperty: req.user.fbFriendsToPropertyMap,
                    id: req.user.appUserId
                });
            } else {
                res.redirect('/');
            }

        });
    });
}
