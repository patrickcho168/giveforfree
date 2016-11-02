"use strict"
var moment = require('moment');
var ensureLogin = require('connect-ensure-login');
var db = require('../models/db');

module.exports = function(app) {
    app.get("/admin", ensureLogin.ensureLoggedIn(), function(req, res) {
    	if (req.user && req.user.admin) {
    		// Display Flagged Users
            db.FlagUser.fetchAll({withRelated: ['flaggedBy', 'flags']}).then(function(flagUser) {
                // Display All Items
                db.Item.fetchAll({withRelated: ['ownedBy', 'takenBy']}).then(function(items) {
                    res.render('admin', {
                        flag: flagUser.models,
                        items: items.models
                    });
                });
            });
    	} else {
        	res.render('404');
    	}
    });

    app.get("/admin/item/:id", ensureLogin.ensureLoggedIn(), function(req, res) {
        var itemId = req.params.id;
        if (req.user && req.user.admin) {
            db.Item.where({
                itemID: itemId
            }).fetch({withRelated: ['ownedBy', 'takenBy', 'categories']}).then(function(item) {
                console.log(item.relations.categories.models[0]);
                if (item) {
                    res.render('adminItem', {
                        item: item
                    });
                } else {
                    res.render('404');
                }
            });
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
