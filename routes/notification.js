var ensureLogin = require('connect-ensure-login');
var db = require('../models/db');
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
        db.NotificationQuery(userId, function(data) {
        	console.log(req.path);
            console.log("Notifications:");
            console.log(data);
            req.session.notification = data;
            next();
        });
    }
};

module.exports = toExport;