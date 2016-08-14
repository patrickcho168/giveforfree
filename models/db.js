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
  ownedBy: function() {
    return this.belongsTo(User);
  },
  takenBy: function() {
  	return this.belongsTo(User);
  },
  wantedBy: function() {
  	return this.hasMany(Want);
  }
});

var User = bookshelf.Model.extend({
  tableName: 'user',
  wants: function() {
  	return this.hasMany(Want);
  },
  owns: function() {
  	return this.hasMany(Item);
  },
  takes: function() {
  	return this.hasMany(Item);
  }
});

var Want = bookshelf.Model.extend({
  tableName: 'itemWanter',
  wantedBy: function() {
  	return this.belongsTo(User);
  },
  wants: function() {
  	return this.belongsTo(Item);
  }
});

var db = {}
db.Item = Item;
db.User = User;
db.Want = Want;

module.exports = db;