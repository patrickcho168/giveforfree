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
  console.log(knex.raw('CURRENT_TIMESTAMP'));
  knex
    .from('item as i')
    .leftJoin('user as u', 'u.userID', 'i.giverID')
    .leftJoin('itemWanter as iw', 'iw.itemID', 'i.itemID')
    .leftJoin('itemWanter as iwu', function() {
      this.on('iwu.itemID', '=', 'i.itemID').andOn('iwu.wanterID', '=', userId)
    })
    .select(['i.itemID', 'i.imageLocation', 'i.title', 'i.description', 'u.name', 'u.userID'])
    .count('iw.itemID as numWants')
    .countDistinct('iwu.itemID as meWant')
    .groupBy('i.itemID')
    .whereNull('i.takerID')
    .where('i.giverID', '!=', userId)
    .where('i.timeExpired', '>', knex.raw('NOW()'))
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
    .select(['i.itemID', 'i.imageLocation', 'i.title', 'i.description', 'u.name', 'u.userID'])
    .count('iw.itemID as numWants')
    .countDistinct('iwu.itemID as meWant')
    .groupBy('i.itemID')
    .whereNull('i.takerID')
    .where('i.giverID', '!=', userId)
    .where('i.itemID', '<', beforeId)
    .where('i.timeExpired', '>', knex.raw('NOW()'))
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
    .select(['i.itemID', 'i.timeExpired', knex.raw('i.timeExpired < NOW() as expired'), 'i.imageLocation', 'i.title', 'i.takerID', 'i.description', 'i.giverID', 'u.name', 'u.userID'])
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
    .select(['i.itemID', 'i.timeExpired', knex.raw('i.timeExpired < NOW() as expired'), 'i.imageLocation', 'i.title', 'i.takerID', 'i.description', 'i.giverID', 'u.name', 'u.userID'])
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
    .select(['i.itemID', 'i.timeExpired', knex.raw('i.timeExpired < NOW() as expired'), 'i.imageLocation', 'i.title', 'i.takerID', 'i.description', 'i.giverID', 'u.name', 'u.userID'])
    .count('iw.itemID as numWants')
    .countDistinct('iwu.itemID as meWant')
    .groupBy('i.itemID')
    .where('w.wanterID', '=', profileId)
    .where(function() {
      this.whereNull('i.takerID').orWhere('i.takerID', '=', userId)
    })
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
    .select(['i.itemID', 'i.timeExpired', knex.raw('i.timeExpired < NOW() as expired'), 'i.imageLocation', 'i.title', 'i.takerID', 'i.description', 'i.giverID', 'u.name', 'u.userID'])
    .count('iw.itemID as numWants')
    .countDistinct('iwu.itemID as meWant')
    .groupBy('i.itemID')
    .where('w.wanterID', '=', profileId)
    .where('i.itemID', '<', beforeId)
    .where(function() {
      this.whereNull('i.takerID').orWhere('i.takerID', '=', userId)
    })
    .orderBy('i.itemID', 'DESC')
    .limit(numItems)
    .then(function(result){
    return cb(result);
  });
}

var ItemPageQuery = function(userId, itemId, cb) {
  knex
    .from('item as i')
    .leftJoin('user as u', 'u.userID', 'i.giverID')
    .leftJoin('user as t', 't.userID', 'i.takerID')
    .leftJoin('itemWanter as iw', 'iw.itemID', 'i.itemID')
    .leftJoin('itemWanter as iwu', function() {
      this.on('iwu.itemID', '=', 'i.itemID').andOn('iwu.wanterID', '=', userId)
    })
    .select(['i.itemID', 'i.timeExpired', 'i.imageLocation', 'i.title', 'i.takerID', 'i.description', 'i.giverID', 'u.name', 'u.userID', 'u.fbID', 't.name as takerName', 't.userID as takerId', 't.fbID as takerFbID'])
    .count('iw.itemID as numWants')
    .countDistinct('iwu.itemID as meWant')
    .groupBy('i.itemID')
    .where('i.itemID', '=', itemId)
    .orderBy('i.itemID', 'DESC')
    .limit(1)
    .then(function(result){
    return cb(result);
  });
}

var ItemPageManualQuery = function(itemId, cb) {
  knex
    .from('itemWanter as iw')
    .leftJoin('user as u', 'iw.wanterID', 'u.userID')
    .leftJoin('item as i', 'i.giverID', 'u.userID')
    .select(['u.name', 'u.userID', 'u.fbID'])
    .count('i.takerID as numGiven')
    .groupBy('u.userID')
    .where('iw.itemID', '=', itemId)
    .then(function(result){
    return cb(result);
  });
}

var ProfilePageTotalGivenQuery = function(userId, cb) {
  knex
    .from('item as i')
    .count('i.itemID as numGiven')
    .where('i.giverID', '=', userId)
    .whereNotNull('i.takerID')
    .orderBy('i.itemID', 'DESC')
    .then(function(result){
    return cb(result);
  });
}

var ProfilePageTotalTakenQuery = function(userId, cb) {
  knex
    .from('item as i')
    .count('i.itemID as numTaken')
    .where('i.takerID', '=', userId)
    .orderBy('i.itemID', 'DESC')
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
db.ItemPageQuery = ItemPageQuery;
db.ProfilePageTotalTakenQuery = ProfilePageTotalTakenQuery;
db.ProfilePageTotalGivenQuery = ProfilePageTotalGivenQuery;
db.ItemPageManualQuery = ItemPageManualQuery;

module.exports = db;