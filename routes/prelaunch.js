"use strict"
var moment = require('moment');

module.exports = function(app) {
    app.get("/prelaunch", function(req, res) {
        res.render('prelaunch');
    });
}
