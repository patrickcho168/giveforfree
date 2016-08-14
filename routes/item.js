"use strict";

var db = require('../models/db');
var ensureLogin = require('connect-ensure-login');

// Included to support <IE9
function inArray(needle,haystack)
{
    var count=haystack.length;
    for(var i=0;i<count;i++)
    {
        if(haystack[i]===needle){return true;}
    }
    return false;
}

module.exports = function(app) {
  app.get('/item/:id',
    ensureLogin.ensureLoggedIn(),
    function(req, res){
      var itemId = req.params.id;
      // Find Item
      db.Item.where({itemID: itemId}).fetch().then(function(itemData) {
        // Is it my item?
        var giverId = itemData.attributes.giverID;
        var mine = req.user.appUserId == giverId;
        var friend;
        if (inArray(giverId, req.session.fbFriendsId)) {
          friend = true;
        } else {
          friend = false;
        }
        // If Item not mine or not friends
        if (friend || mine) {
          res.render('item', { myItem: mine, item: itemData.attributes, friendProperty: req.session.fbFriendsToPropertyMap }); 
        } else {
          res.redirect('/');
        }
        
      });
    });
}