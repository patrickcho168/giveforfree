"use strict"
var moment = require('moment');
var express = require('express');
var router = express.Router();

router.get("/tnc", function(req, res) {
    if (req.user === undefined) {
        res.render("privacy", {loggedIn: false, id: null});
    } else {
        res.render("privacy", {loggedIn: true, 
            id: req.user.appUserId, 
            notification: req.session.notification,
            moment: moment});
    }
});

module.exports = router;
