var ensureLogin = require('connect-ensure-login');
var db = require('../models/db');
var moment = require('moment');
var ensureLogin = require('connect-ensure-login');
var request = require('request');
var config = require('../config');
var moment = require('moment');

// NotificationType 1: Someone snag an item that I am currently giving but haven't given out
// NotificationType 2: My item has just expired and I haven't given out the item
// NotificationType 3: Someone commented on an item I am giving out OR have given out
// NotificationType 3: Someone commented on an item that I am currently snagging and hasn't been given out
// NotificationType 4: The item that I am currently snagging has been given out (to who?)
// NotificationType 5: Receive a thanks on my wall

var toExport = {};

toExport.getNotifications = function(req, res, next) {
    // If not logged in, go next
    if (req.user === undefined) {
        next();
    } else {
        var userId = parseInt(req.user.appUserId);
        var limitNum = 10;
        db.NotificationQuery(userId, limitNum, function(data) {
            // console.log(req.path);
            // console.log("Notifications:");
            // console.log(data);
            req.session.notification = data;
            next();
        });
    }
};

toExport.route = function(app) {
    // HOME PAGE
    // app.post('/notification/gcmregistration', ensureLogin.ensureLoggedIn(), function(req, res, next) {
    //     // console.log("GCM Registration");
    //     var userId = parseInt(req.user.appUserId);
    //     db.User.where({
    //         userID: userId
    //     }).fetch().then(function(user) {
    //         if (user) {
    //             var endpoint = req.body.endpoint;
    //             var regId = endpoint.substring(endpoint.lastIndexOf("/")+1, endpoint.length);
    //             user.save({
    //                 gcm: regId
    //             });
    //         }
    //     });
    //     next();
    // });

    // app.get('/api/getonenotification/:recipientgcm', function(req,res) {
    //     db.User.where({
    //         gcm: recipientgcm
    //     }).fetch().then(function(user) {
    //         db.NotificationQuery(parseInt(user.attributes.userID), 1, function(data) {
    //             res.json(data);
    //         });
    //     });
    // });

    // Read single notification
    app.post('/api/read_notification/:notifID', function(req, res, next) {
        db.Notification.where({
            notificationID: req.params.notifID
        }).fetch().then(function(notification) {
            notification.readBy().attach(req.user.appUserId);
            res.json({ message: 'Notification read' });
        }).catch(function(err) {
            next(err);
        });
    });

    // Clear all notifications
    app.post('/api/clear_notifications', function(req, res, next) {
        db.User.where({
            userID: req.user.appUserId
        }).fetch().then(function(user) {
            var ids = req.session.notification.map(function(notification) {
                return notification.notificationID;
            });
            user.readNotifications().attach(ids);
            res.json({ message: 'Notifications cleared' });
        }).catch(function(err) {
            next(err);
        });
    });
}

toExport.pushNotification = function(userId) {
    db.User.where({
        userID: userId
    }).fetch().then(function(user) {
        console.log(user.attributes.gcm);
        if (user && user.attributes.gcm) {
            var options = {
                url: 'https://android.googleapis.com/gcm/send',
                port: 443,
                method: 'POST',
                headers: {
                    "Authorization": "key=" + config.gcmKey,
                    "Content-Type": "application/json"
                },
                json: {
                    "to": user.attributes.gcm,
                    // "notification": {
                    //     "body": "LALALA",
                    //     "title": "New Message from Give For Free",
                    //     "icon": "/images/common/logo.svg"
                    // }
                }
            };

            var callback = function(error, response, body) {

            }

            request(options, callback);
        }
    });
}

module.exports = toExport;