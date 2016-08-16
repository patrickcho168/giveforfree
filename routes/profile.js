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
        ensureLogin.ensureLoggedIn(),
        function(req, res) {
            var otherUserId = parseInt(req.params.id);
            var mine = otherUserId === req.user.appUserId;
            db.User.where({
                userID: otherUserId
            }).fetch().then(function(user) {
                if (user === null || (inArray(otherUserId, req.user.fbFriendsId) === false && mine === false)) { // WHAT IF NOT FRIEND
                    res.redirect('/profile/' + req.user.appUserId);
                    //   res.redirect('/profile/');
                } else {
                    // Get Profile Wants
                    db.Want.where({
                        wanterID: otherUserId
                    }).fetchAll().then(function(userWants) {
                        // Get Profile Giving Out and Given Out
                        db.Item.where({
                            giverID: otherUserId
                        }).where({
                            takerID: null
                        }).fetchAll().then(function(userGive) {

                            db.Item.where({
                                giverID: otherUserId
                            }).where({
                                takerID: !null
                            }).fetchAll().then(function(userGiven) {
                                // If Need Profile Taken
                                // db.Item.where({takerID: otherUserId}).fetchAll().then(function(userTaken) {
                                // })
                                db.User.where('userID', 'in', req.user.fbFriendsId).fetchAll().then(function(data) {
                                    res.render('profile', {
                                        myProfile: mine,
                                        user: user.attributes,
                                        userWants: userWants.models,
                                        userGive: userGive.models,
                                        userGiven: userGiven.models,
                                        friendProperty: req.user.fbFriendsToPropertyMap,
                                        friends: JSON.stringify(data.models)
                                    });
                                });

                            });
                        });
                    });
                    // console.log(user.attributes);
                    // var accessToken = req.user.passport.user.accessToken;
                    // var otherUserFbId = user.attributes.fbID;
                    // facebook.getFbData(accessToken, '/' + otherUserFbId +'/friends', function(data){
                    //   var jsonData = JSON.parse(data);
                    //   var friendsData = jsonData.data;
                    //   var friendsQuery = [];
                    //   for (var i=0; i<friendsData.length; i++) {
                    //     friendsQuery.push(friendsData[i].id)
                    //   }
                    //   db.User.where('fbID', 'in', friendsQuery).fetchAll().then(function(data2) {
                    //     if (mine === true) {
                    //       // console.log(data2.models);
                    //       req.user.name = req.user.displayName;
                    //       res.render('profile', { myProfile: mine, user: req.user, friends: data2.models });
                    //     }
                    //     else {
                    //       var otherUser = {'name': user.attributes.name, 'id': otherUserFbId};
                    //       res.render('profile', { myProfile: mine, user: otherUser, friends: data2.models });
                    //     }
                    //   })
                    // })
                }
            });
        });

    app.get('/friends',
        ensureLogin.ensureLoggedIn(),
        function(req, res) {
            db.User.where('userID', 'in', req.user.fbFriendsId).fetchAll().then(function(data) {
                res.render('friends', {
                    friends: data.models
                });
            });
        });
}
