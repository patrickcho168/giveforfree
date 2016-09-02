"use strict"
var moment = require('moment');

module.exports = function(app) {
    app.get("/privacy", function(req, res) {
    	if (req.user === undefined) {
    		res.render("privacy", {loggedIn: false, id: null});
    	} else {
        	res.render("privacy", {loggedIn: true, 
        		id: req.user.appUserId, 
        		notification: req.session.notification,
                moment: moment});
    	}
    });
}
