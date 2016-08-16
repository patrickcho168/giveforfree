"use strict";

var db = require('../models/db');
var ensureLogin = require('connect-ensure-login');
var moment = require('moment');

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

  // Want a product (given itemID and userID)
  // Should return success header?
  app.post('/api/want/:itemId', ensureLogin.ensureLoggedIn(), function (req, res) {
    var itemId = parseInt(req.params.itemId);
    var userId = parseInt(req.user.appUserId);

    console.log(itemId);
    console.log(req.user);
    console.log(userId);

    // Check if item already wanted by this person
    db.Want.where({itemID: itemId, wanterID: userId}).fetch().then(function (oldWant) {
      if (oldWant === null) {

        // Register a new claim for the item
        var newWant = new db.Want({
          itemID: profile.id,
          wanterID: profile.displayName,
          timeWanted: moment().format()
        });

        // Store in db
        newWant.save();
      }
    });
  })

  // Want a product (given itemID and userID)
  app.post('/api/unwant/:itemId', ensureLogin.ensureLoggedIn(), function (req,res) {
    var itemId = parseInt(req.params.itemId);
    var userId = parseInt(req.params.appUserId);

    // Check if item is wanted by this person
    db.Want.where({itemID: itemId, wanterID: userId}).fetch().then(function (oldWant) {
      if (oldWant) {
        // Remove
        newWant.destroy();
      }
    });
  })

  // Find items posted from friends
  app.get('/api/friendItems/:lastItemId/:loadNum', ensureLogin.ensureLoggedIn(),
    function(req, res) {
      // db.getNextItems(req.params.pageNum, req.session.fbFriendsId, function(result) {
      //   res.json(result);
      // });
      var lastSeenItem = parseInt(req.params.lastItemId);
      var numItems = parseInt(req.params.loadNum);
      console.log(req.session.fbFriendsId);
      if (lastSeenItem === 0) {
        db.Item.where({takerID: null}).where('giverID', 'in', req.session.fbFriendsId).orderBy('timeCreated', 'DESC').query(function (qb) {qb.limit(numItems);}).fetchAll({withRelated: ['ownedBy']}).then(function(data3) {
          res.json(data3.models);
        });
      } else {
        db.Item.where('itemID', '<', lastSeenItem).where({takerID: null}).where('giverID', 'in', req.session.fbFriendsId).orderBy('timeCreated', 'DESC').query(function (qb) {qb.limit(numItems);}).fetchAll({withRelated: ['ownedBy']}).then(function(data3) {
          res.json(data3.models);
        });
      }
    });

  // Find items posted by anyone other than yourself
  app.get('/api/allItems/:lastItemId/:loadNum', ensureLogin.ensureLoggedIn(),
    function(req, res) {
      // db.getNextItems(req.params.pageNum, req.session.fbFriendsId, function(result) {
      //   res.json(result);
      // });
      var lastSeenItem = parseInt(req.params.lastItemId);
      var numItems = parseInt(req.params.loadNum);
      var userId = req.user.appUserId;
      if (lastSeenItem === 0) {
        db.Item.where({takerID: null}).where('giverID', '!=', userId).orderBy('timeCreated', 'DESC').query(function (qb) {qb.limit(numItems);}).fetchAll({withRelated: ['ownedBy']}).then(function(data3) {
          res.json(data3.models);
        });
      } else {
        db.Item.where('itemID', '<', lastSeenItem).where({takerID: null}).where('giverID', '!=', userId).orderBy('timeCreated', 'DESC').query(function (qb) {qb.limit(numItems);}).fetchAll({withRelated: ['ownedBy']}).then(function(data3) {
          res.json(data3.models);
        });
      }
    });

  app.get('/item/:id', ensureLogin.ensureLoggedIn(),
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