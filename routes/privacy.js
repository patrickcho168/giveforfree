"use strict"

module.exports = function(app) {
    app.get("/privacy", function(req, res) {
    	if (req.user === undefined) {
    		res.render("privacy", {loggedIn: false, id: null});
    	} else {
        	res.render("privacy", {loggedIn: true, id: req.user.appUserId});
    	}
    });
}
