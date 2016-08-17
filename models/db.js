var config = require('../config');

// DATABASE
var knex = require('knex')({
  client: 'mysql',
  connection: {
    host     : config.dbhost,
    user     : config.dbuser,
    password : config.dbpw,
    database : 'fbapp',
    charset  : 'utf8'
  }
});

var bookshelf = require('bookshelf')(knex);
// var pm = require('bookshelf-pagemaker')(bookshelf);

var Item = bookshelf.Model.extend({
  tableName: 'item',
  idAttribute: 'itemID',
  ownedBy: function() {
    return this.belongsTo(User, 'giverID');
  },
  takenBy: function() {
  	return this.belongsTo(User, 'takerID');
  },
  wantedBy: function() {
  	return this.hasMany(Want, 'itemID');
  }
});

var User = bookshelf.Model.extend({
  tableName: 'user',
  idAttribute: 'userID',
  wants: function() {
  	return this.hasMany(Want, 'wanterID');
  },
  owns: function() {
  	return this.hasMany(Item, 'giverID');
  },
  takes: function() {
  	return this.hasMany(Item, 'takerID');
  }
});

var Want = bookshelf.Model.extend({
  tableName: 'itemWanter',
  wantedBy: function() {
  	return this.belongsTo(User, 'wanterID');
  },
  wants: function() {
  	return this.belongsTo(Item, 'itemID');
  }
});

var HomePageItemQuery = function(userId, numItems, cb) {
  knex
    .from('item as i')
    .leftJoin('user as u', 'u.userID', 'i.giverID')
    .leftJoin('itemWanter as iw', 'iw.itemID', 'i.itemID')
    .leftJoin('itemWanter as iwu', function() {
      this.on('iwu.itemID', '=', 'i.itemID').andOn('iwu.wanterID', '=', userId)
    })
    .select(['i.itemID', 'i.imageLocation', 'i.title', 'i.description', 'u.name'])
    .count('iw.itemID as numWants')
    .countDistinct('iwu.itemID as meWant')
    .groupBy('i.itemID')
    .whereNull('i.takerID')
    .where('i.giverID', '!=', userId)
    .orderBy('i.itemID', 'DESC')
    .limit(numItems)
    .then(function(result){
    return cb(result);
  });
}

var HomePageItemQueryBeforeId = function(userId, numItems, beforeId, cb) {
  knex
    .from('item as i')
    .leftJoin('user as u', 'u.userID', 'i.giverID')
    .leftJoin('itemWanter as iw', 'iw.itemID', 'i.itemID')
    .leftJoin('itemWanter as iwu', function() {
      this.on('iwu.itemID', '=', 'i.itemID').andOn('iwu.wanterID', '=', userId)
    })
    .select(['i.itemID', 'i.imageLocation', 'i.title', 'i.description', 'u.name'])
    .count('iw.itemID as numWants')
    .countDistinct('iwu.itemID as meWant')
    .groupBy('i.itemID')
    .whereNull('i.takerID')
    .where('i.giverID', '!=', userId)
    .where('i.itemID', '<', beforeId)
    .orderBy('i.itemID', 'DESC')
    .limit(numItems)
    .then(function(result){
    return cb(result);
  });
}

var ProfilePageGiveQuery = function(userId, profileId, numItems, cb) {
  knex
    .from('item as i')
    .leftJoin('user as u', 'u.userID', 'i.giverID')
    .leftJoin('itemWanter as iw', 'iw.itemID', 'i.itemID')
    .leftJoin('itemWanter as iwu', function() {
      this.on('iwu.itemID', '=', 'i.itemID').andOn('iwu.wanterID', '=', userId)
    })
    .select(['i.itemID', 'i.imageLocation', 'i.title', 'i.takerID', 'i.description', 'i.giverID', 'u.name'])
    .count('iw.itemID as numWants')
    .countDistinct('iwu.itemID as meWant')
    .groupBy('i.itemID')
    .where('i.giverID', '=', profileId)
    .orderBy('i.itemID', 'DESC')
    .limit(numItems)
    .then(function(result){
    return cb(result);
  });
}

var ProfilePageGiveQueryBeforeId = function(userId, profileId, numItems, beforeId, cb) {
  knex
    .from('item as i')
    .leftJoin('user as u', 'u.userID', 'i.giverID')
    .leftJoin('itemWanter as iw', 'iw.itemID', 'i.itemID')
    .leftJoin('itemWanter as iwu', function() {
      this.on('iwu.itemID', '=', 'i.itemID').andOn('iwu.wanterID', '=', userId)
    })
    .select(['i.itemID', 'i.imageLocation', 'i.title', 'i.takerID', 'i.description', 'i.giverID', 'u.name'])
    .count('iw.itemID as numWants')
    .countDistinct('iwu.itemID as meWant')
    .groupBy('i.itemID')
    .where('i.giverID', '=', profileId)
    .where('i.itemID', '<', beforeId)
    .orderBy('i.itemID', 'DESC')
    .limit(numItems)
    .then(function(result){
    return cb(result);
  });
}

var ProfilePageWantQuery = function(userId, profileId, numItems, cb) {
  knex
    .from('itemWanter as w')
    .leftJoin('item as i', 'i.itemID', 'w.itemID')
    .leftJoin('user as u', 'u.userID', 'i.giverID')
    .leftJoin('itemWanter as iw', 'iw.itemID', 'i.itemID')
    .leftJoin('itemWanter as iwu', function() {
      this.on('iwu.itemID', '=', 'i.itemID').andOn('iwu.wanterID', '=', userId)
    })
    .select(['i.itemID', 'i.imageLocation', 'i.title', 'i.takerID', 'i.description', 'i.giverID', 'u.name'])
    .count('iw.itemID as numWants')
    .countDistinct('iwu.itemID as meWant')
    .groupBy('i.itemID')
    .where('w.wanterID', '=', profileId)
    .orderBy('i.itemID', 'DESC')
    .limit(numItems)
    .then(function(result){
    return cb(result);
  });
}

var ProfilePageWantQueryBeforeId = function(userId, profileId, numItems, beforeId, cb) {
  knex
    .from('itemWanter as w')
    .leftJoin('item as i', 'i.itemID', 'w.itemID')
    .leftJoin('user as u', 'u.userID', 'i.giverID')
    .leftJoin('itemWanter as iw', 'iw.itemID', 'i.itemID')
    .leftJoin('itemWanter as iwu', function() {
      this.on('iwu.itemID', '=', 'i.itemID').andOn('iwu.wanterID', '=', userId)
    })
    .select(['i.itemID', 'i.imageLocation', 'i.title', 'i.takerID', 'i.description', 'i.giverID', 'u.name'])
    .count('iw.itemID as numWants')
    .countDistinct('iwu.itemID as meWant')
    .groupBy('i.itemID')
    .where('w.wanterID', '=', profileId)
    .where('i.itemID', '<', beforeId)
    .orderBy('i.itemID', 'DESC')
    .limit(numItems)
    .then(function(result){
    return cb(result);
  });
}

var db = {}
db.Item = Item;
db.User = User;
db.Want = Want;
db.HomePageItemQuery = HomePageItemQuery;
db.HomePageItemQueryBeforeId = HomePageItemQueryBeforeId;
db.ProfilePageGiveQuery = ProfilePageGiveQuery;
db.ProfilePageGiveQueryBeforeId = ProfilePageGiveQueryBeforeId;
db.ProfilePageWantQuery = ProfilePageWantQuery;
db.ProfilePageWantQueryBeforeId = ProfilePageWantQueryBeforeId;

module.exports = db;