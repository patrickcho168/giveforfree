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

var db = {}
db.Item = Item;
db.User = User;
db.Want = Want;

module.exports = db;