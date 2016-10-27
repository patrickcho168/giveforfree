"use strict";

var db = require('../models/db');
var express = require('express');
var ensureLogin = require('connect-ensure-login');
var moment = require('moment');
var facebook = require('../controllers/facebook');
var config = require('../config');
var moment = require("moment");
var xss = require('xss');
var bodyParser = require("body-parser");
var csrf = require('csurf');
var router = express.Router();

var csrfProtection = csrf();

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

var parseForm = bodyParser.urlencoded({ extended: true, limit: '50mb' });

// -------------- DONATE

router.post('/api/item/donate/:id', ensureLogin.ensureLoggedIn(), function(req, res) {
    var userId = parseInt(req.user.appUserId);
    var itemId = parseInt(req.params.id);
    db.Item.where({
        itemID: itemId,
        takerID: userId,
    }).fetch().then(function(itemData) {
        if (itemData && itemData.attributes && itemData.attributes.giverID !== null) {
            itemData.save({
                donatedAmount: itemData.attributes.donationAmount,
            })
            var newNote = new db.Notification({
                timeCreated: moment().format("YYYY-MM-DD HH:mm:ss"),
                active: 1,
                notificationType: 6,
                itemID: itemId,
                userID: userId
            });
            newNote.save();
        }
    })
})

// -------------- DELIVERED

router.post('/api/item/deliver/:id', ensureLogin.ensureLoggedIn(), function(req, res) {
    var userId = parseInt(req.user.appUserId);
    var itemId = parseInt(req.params.id);
    db.Item.where({
        itemID: itemId,
        takerID: userId,
    }).fetch().then(function(itemData) {
        if (itemData && itemData.attributes && itemData.attributes.giverID !== null) {
            itemData.save({
                delivered: 1,
            })
            var newNote = new db.Notification({
                timeCreated: moment().format("YYYY-MM-DD HH:mm:ss"),
                active: 1,
                notificationType: 7,
                itemID: itemId,
                userID: userId
            });
            newNote.save();
        }
    })
})

// -------------- RATINGS

router.post('/api/item/:id/rateGiver/:score', ensureLogin.ensureLoggedIn(), function(req, res) {
    var userId = parseInt(req.user.appUserId);
    var itemId = parseInt(req.params.id);
    var score = parseInt(req.params.score);
    if (score !== null && score > 0 && score <= 10) {
        db.Item.where({
            itemID: itemId,
            takerID: userId,
        }).fetch().then(function(itemData) {
            if (itemData && itemData.attributes && itemData.attributes.giverID !== null) {
                itemData.save({
                    giverRating: score,
                })
            }
        })
    }
})

router.post('/api/item/:id/rateTaker/:score', ensureLogin.ensureLoggedIn(), function(req, res) {
    var userId = parseInt(req.user.appUserId);
    var itemId = parseInt(req.params.id);
    var score = parseInt(req.params.score);
    if (score !== null && score > 0 && score <= 10) {
        db.Item.where({
            itemID: itemId,
            giverID: userId
        }).fetch().then(function(itemData) {
            if (itemData && itemData.attributes && itemData.attributes.takerID !== null) {
                itemData.save({
                    takerRating: score,
                })
            }
        })
    }
})

// -------------- COMMENTS

router.get('/item/:id/comment', function(req, res, next) {
    var itemId = req.params.id;
    db.Comment.where({
        itemID: itemId
    }).orderBy('timeCreated', 'ASC').fetchAll({withRelated: ['commentedBy', 'upvote']}).then(function(commentData) {
        res.json(commentData);
    });
})

router.post('/api/updatecomment/:commentId', ensureLogin.ensureLoggedIn(), csrfProtection, parseForm, function(req,res) {
    var userId = parseInt(req.user.appUserId);
    var commentId = parseInt(req.params.commentId);
    db.Comment.where({
        commentID: commentId,
        commenterID: userId
    }).fetch().then(function(commentData) {
        if (commentData) {
            commentData.save({
                message: xss(req.body.content)
            }).then(function(comment) {
                db.Comment.where({
                    commentID: comment.attributes.commentID
                }).fetch({withRelated: ['commentedBy', 'upvote']}).then(function(newCommentData) {
                    // req.flash('success_messages', 'You have successfully edited a comment!');
                    res.json(newCommentData);
                });
            })
        } else {
            // req.flash('error_messages', 'An error was encountered! Please try editing your comment again!');
        }
    })
})

router.post('/api/comment/:itemId', ensureLogin.ensureLoggedIn(), csrfProtection, parseForm, function(req, res) {
    var userId = parseInt(req.user.appUserId);
    var itemId = parseInt(req.params.itemId);
    if (req.body.parent === '') {
        req.body.parent = null;
    }
    var newComment = new db.Comment({
        commenterID: userId,
        message: xss(req.body.content),
        itemID: itemId,
        timeCreated: moment().format("YYYY-MM-DD HH:mm:ss"),
        parentComment: req.body.parent
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
        db.Comment.where({
            commentID: comment.attributes.commentID
        }).fetch({withRelated: ['commentedBy', 'upvote']}).then(function(commentData) {
            // req.flash('success_messages', 'You have successfully posted a comment!');
            res.json(commentData);
        });
    })
})

router.post('/api/deletecomment/:commentId', ensureLogin.ensureLoggedIn(), function(req, res) {
    var userId = parseInt(req.user.appUserId);
    var commentId = parseInt(req.params.commentId);
    db.Comment.where({
        commentID: commentId
    }).fetch().then(function(data) {
        // If comment exists
        if (data!=null) {
            // Ensure comment belongs to user currently logged in
            if (data.attributes && data.attributes.commenterID === userId) {
                data.where({
                    commentID: commentId,
                    commenterID: userId
                }).destroy();
                db.Notification.where({
                    commentID: commentId
                }).fetch().then(function(oldNote) {
                    if (oldNote != null) {
                        oldNote.destroy();
                        // req.flash('success_messages', 'You have successfully deleted a comment!');
                        res.json({});
                    } else {
                        // req.flash('error_messages', 'An error was encountered! Please try deleting your comment again!');
                        res.json({});
                    }
                })
            }
        }
    })
})

router.post('/api/comment/upvotes/:commentId', ensureLogin.ensureLoggedIn(), function(req, res) {
    var userId = parseInt(req.user.appUserId);
    var commentId = parseInt(req.params.commentId);
    db.CommentUpvote.where({
        commentID: commentId,
        userID: userId
    }).fetch().then(function(data) {
        if (!data) {
            var newCommentUpvote = new db.CommentUpvote({
                commentID: commentId,
                userID: userId
            });
            newCommentUpvote.save().then(function(comment) {
                db.Comment.where({
                    commentID: commentId
                }).fetch({withRelated: ['commentedBy', 'upvote']}).then(function(newCommentData) {
                    res.json(newCommentData);
                });
            })
        } else {
            db.Comment.where({
                commentID: commentId
            }).fetch({withRelated: ['commentedBy', 'upvote']}).then(function(newCommentData) {
                res.json(newCommentData);
            });
        }
    })
})

router.post('/api/comment/downvotes/:commentId', ensureLogin.ensureLoggedIn(), function(req, res) {
    var userId = parseInt(req.user.appUserId);
    var commentId = parseInt(req.params.commentId);
    db.CommentUpvote.where({
        commentID: commentId,
        userID: userId
    }).fetch().then(function(data) {
        if (data) {
            data.destroy().then(function() {
                db.Comment.where({
                    commentID: commentId
                }).fetch({withRelated: ['commentedBy', 'upvote']}).then(function(newCommentData) {
                    res.json(newCommentData);
                });
            })
        } else {
            db.Comment.where({
                commentID: commentId
            }).fetch({withRelated: ['commentedBy', 'upvote']}).then(function(newCommentData) {
                res.json(newCommentData);
            });
        }
    })
})

// -------------- GIVE

// This is for giving to random person
router.get('/api/give/:itemId', ensureLogin.ensureLoggedIn(), function(req, res) {
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
router.get('/api/give/:itemId/:takerId', ensureLogin.ensureLoggedIn(), function(req, res) {
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

// -------------- DELETE

// Delete an item
router.get('/api/delete/:itemId', ensureLogin.ensureLoggedIn(), function(req, res) {
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

// -------------- WANT AND UNWANT

// Want a product (given itemID and userID)
// Should return success header?
router.post('/api/want/:itemId', ensureLogin.ensureLoggedIn(), function(req, res, next) {
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
router.post('/api/unwant/:itemId', ensureLogin.ensureLoggedIn(), function(req, res, next) {
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

router.get('/api/myWants/:lastItemId/:loadNum/:profileId', function(req, res) {
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

router.get('/api/myItems/:lastItemId/:loadNum/:profileId', function(req, res) {
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
// router.get('/api/friendItems/:lastItemId/:loadNum', ensureLogin.ensureLoggedIn(), function(req, res) {
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
router.get('/api/allItems/:lastItemId/:loadNum', function(req, res) {
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

// Find items posted by anyone other than yourself
router.get('/api/items/:categoryID/:lastItemId/:loadNum', function(req, res) {
    // db.getNextItems(req.params.pageNum, req.user.fbFriendsId, function(result) {
    //   res.json(result);
    // });
    var categoryID = parseInt(req.params.categoryID) + 1;
    var lastSeenItem = parseInt(req.params.lastItemId);
    var numItems = parseInt(req.params.loadNum);
    if (req.user === undefined) {
        if (lastSeenItem === 0) {
            db.CategoryPageItemQuery(0, numItems, categoryID, function(data) {
                res.json(data);
            })
        } else {
            db.CategoryPageItemQueryBeforeId(0, numItems, lastSeenItem, categoryID, function(data) {
                res.json(data);
            })
        }
    } else {
        var userId = parseInt(req.user.appUserId);
        if (lastSeenItem === 0) {
            db.CategoryPageItemQuery(userId, numItems, categoryID, function(data) {
                res.json(data);
            })
        } else {
            db.CategoryPageItemQueryBeforeId(userId, numItems, lastSeenItem, categoryID, function(data) {
                res.json(data);
            })
        }
    }
});

// ITEM PAGE
router.get('/item/:id', csrfProtection, function(req, res, next) {
    var itemId = req.params.id;
    req.session.lastPageVisit = '/item/' + itemId;
    var userId;
    var loggedIn;
    var categories;
    if (req.user === undefined) {
        userId = 0;
        loggedIn = false;
    } else {
        userId = req.user.appUserId;
        loggedIn = true;
    }
    db.User.where({
        userID: userId
    }).fetch().then(function(user) {
        db.Item.where('itemID', itemId).fetch().then(function(item) {
            item.categories().fetch().then(function(cat) {
                categories = cat.toJSON().map(function(obj) {
                    return obj.name;
                });
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
                                            gifts: gifted[0].numGiven,
                                            manual: data2,
                                            loggedIn: loggedIn,
                                            comment: commentData.models,
                                            notification: req.session.notification,
                                            moment: moment,
                                            fbNameSpace: config.fbNamespace,
                                            csrfToken: req.csrfToken(),
                                            expiryDate: date,
                                            categories: categories,
                                            user: user ? user.attributes : null
                                        });
                                    });
                                } else {
                                    var givenToMe = userId === data[0].takerID;
                                    db.ItemPageManualQuery(itemId, function(data2) {
                                        res.render('item', {
                                            id: userId,
                                            item: data[0],
                                            mine: mine,
                                            givenToMe: givenToMe,
                                            appId: config.fbClientID,
                                            domain: config.domain,
                                            date: processedDate,
                                            expired: expiredMin > 0,
                                            gifts: gifted[0].numGiven,
                                            manual: data2,
                                            loggedIn: loggedIn,
                                            comment: commentData.models,
                                            notification: req.session.notification,
                                            moment: moment,
                                            fbNameSpace: config.fbNamespace,
                                            csrfToken: req.csrfToken(),
                                            expiryDate: date,
                                            categories: categories,
                                            user: user ? user.attributes : null
                                        });
                                    });
                                }
                            });
                        });
                    }
                })
            });
        });
    });
    next();
});

module.exports = router;