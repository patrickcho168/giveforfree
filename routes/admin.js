"use strict"
var moment = require('moment');
var ensureLogin = require('connect-ensure-login');
var db = require('../models/db');

module.exports = function(app) {
    app.get("/admin", ensureLogin.ensureLoggedIn(), function(req, res) {
    	if (req.user && req.user.admin) {
    		// Display Flagged Users
            db.FlagUser.fetchAll({withRelated: ['flaggedBy', 'flags']}).then(function(flagUser) {
                db.Item.fetchAll({withRelated: ['ownedBy', 'takenBy']}).then(function(items) {
                    res.render('admin', {
                        flag: flagUser.models,
                        items: items.models
                    });
                });
            });
            // Display All Items
    	} else {
        	res.render('404');
    	}
    });

    app.get('/api/admin/item/delete/:itemId', ensureLogin.ensureLoggedIn(), function(req, res) {
        if (req.user && req.user.admin) {
            var itemId = parseInt(req.params.itemId);
            var userId = parseInt(req.user.appUserId);
            db.Item.where({
                itemID: itemId
            }).fetch().then(function(item) {
                // If this item exists
                if (item) {
                    item.where({
                        itemID: itemId
                    }).destroy().then(function() {
                        res.redirect("/admin");
                    });
                } else {
                    res.redirect("/admin");
                }
            });
            
        } else {
            res.render('404');
        }
    });
}
