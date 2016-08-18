"use strict"

module.exports = function(app) {
    app.get("/privacy", function(req, res) {
        res.render("privacy");
    });
}
