"use strict"
var db = require('../models/db');

module.exports = function(app) {
    app.get("/prelaunch", function(req, res) {
    	req.session.lastPageVisit = '/prelaunch';
    	if (req.user === undefined) {
            res.render('prelaunch', {
                user: null,
                loggedIn: false
            });
        } else {
            var userId = req.user.appUserId;
            db.User.where({
                userID: userId
            }).fetch().then(function(user) {
                res.render('prelaunch', {
                    user: user.attributes,
                    loggedIn: true
                });
            });
        }
    });
}
