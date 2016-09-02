var config = require('../config');
var moment = require("moment");

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
  },
  thankedAbout: function() {
    return this.hasMany(Thank, 'itemID');
  },
  commentedAbout: function() {
    return this.hasMany(Comment, 'itemID');
  },
  categories: function() {
    return this.belongsToMany(Category, 'categoryItem', 'itemID', 'categoryID');
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
  },
  comments: function() {
    return this.hasMany(Comment, 'commenterID');
  },
  thanks: function() {
    return this.hasMany(Thank, 'thankerID');
  },
  receivedThanks: function() {
    return this.hasMany(Thank, 'receiverID');
  },
  readNotifications: function() {
    return this.belongsToMany(Notification, 'readnotification', 'userID', 'notificationID')
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

var Comment = bookshelf.Model.extend({
  tableName: 'comment',
  idAttribute: 'commentID',
  commentedBy: function() {
    return this.belongsTo(User, 'commenterID');
  },
  about: function() {
    return this.belongsTo(Item, 'itemID');
  },
  upvote: function() {
    return this.hasMany(CommentUpvote, 'commentID');
  }
});

var Thank = bookshelf.Model.extend({
  tableName: 'thank',
  idAttribute: 'thankID',
  thankedBy: function() {
    return this.belongsTo(User, 'thankerID');
  },
  receivedBy: function() {
    return this.belongsTo(User, 'receiverID');
  },
  about: function() {
    return this.belongsTo(Item, 'itemID');
  },
  upvote: function() {
    return this.hasMany(ThankUpvote, 'thankID');
  }
});

var Notification = bookshelf.Model.extend({
  tableName: 'notification',
  idAttribute: 'notificationID',
  regardingItem: function() {
    return this.belongsTo(Item, 'itemID');
  },
  initiatedBy: function() {
    return this.belongsTo(User, 'userID');
  },
  regardingWant: function() {
    return this.belongsTo(Want, 'wantID');
  },
  regardingComment: function() {
    return this.belongsTo(Comment, 'commentID');
  },
  regardingThanks: function() {
    return this.belongsTo(Thank, 'thankID');
  },
  readBy: function() {
    return this.belongsToMany(User, 'readnotification', 'notificationID', 'userID');
  }
});

var Category = bookshelf.Model.extend({
  tableName: 'category',
  idAttribute: 'categoryID',
  items: function() {
    return this.belongsToMany(Item, 'categoryItem', 'categoryID', 'itemID');
  }
});

var CommentUpvote = bookshelf.Model.extend({
  tableName: 'commentUpvote',
  idAttribute: 'commentUpvoteID',
  about: function() {
    return this.belongsTo(Comment, 'commentID');
  },
  by: function() {
    return this.belongsTo(User, 'userID');
  }
});

var ThankUpvote = bookshelf.Model.extend({
  tableName: 'thankUpvote',
  idAttribute: 'thankUpvoteID',
  about: function() {
    return this.belongsTo(Thank, 'thankID');
  },
  by: function() {
    return this.belongsTo(User, 'userID');
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
    .select(['i.itemID', 'i.imageLocation', 'i.title', 'i.description', 'u.name', 'u.userID', 'u.fbID'])
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
    .select(['i.itemID', 'i.imageLocation', 'i.title', 'i.description', 'u.name', 'u.userID', 'u.fbID'])
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
    .select(['i.itemID', 'i.timeExpired', knex.raw('i.timeExpired < NOW() as expired'), 'i.imageLocation', 'i.title', 'i.takerID', 'i.description', 'i.giverID', 'u.name', 'u.userID', 'u.fbID'])
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
    .select(['i.itemID', 'i.timeExpired', knex.raw('i.timeExpired < NOW() as expired'), 'i.imageLocation', 'i.title', 'i.takerID', 'i.description', 'i.giverID', 'u.name', 'u.userID', 'u.fbID'])
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
    .select(['i.itemID', 'i.timeExpired', knex.raw('i.timeExpired < NOW() as expired'), 'i.imageLocation', 'i.title', 'i.takerID', 'i.description', 'i.giverID', 'u.name', 'u.userID', 'u.fbID'])
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
    .select(['i.itemID', 'i.timeExpired', knex.raw('i.timeExpired < NOW() as expired'), 'i.imageLocation', 'i.title', 'i.takerID', 'i.description', 'i.giverID', 'u.name', 'u.userID', 'u.fbID'])
    .count('iw.itemID as numWants')
    .countDistinct('iwu.itemID as meWant')
    .groupBy('i.itemID')
    .groupBy('iw.itemID')
    .groupBy('iwu.itemID')
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
    .select(['i.itemID', 'i.timeExpired', 'i.imageLocation', 'i.title', 'i.takerID', 'i.description', 'i.giverID', 'i.meetup', 'i.postage', 'i.collectionMessage', 'u.name', 'u.userID', 'u.fbID', 't.name as takerName', 't.userID as takerId', 't.fbID as takerFbID'])
    .count('iw.itemID as numWants')
    .countDistinct('iwu.itemID as meWant')
    .groupBy('i.itemID')
    .groupBy('iw.itemID')
    .groupBy('iwu.itemID')
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

// NotificationType 1: Someone snag an item that I am currently giving but haven't given out
// NotificationType 2: My item has just expired and I haven't given out the item
// NotificationType 3: Someone commented on an item I am giving out OR have given out
// NotificationType 3: Someone commented on an item that I am currently snagging and hasn't been given out
// NotificationType 4: The item that I am currently snagging has been given out (to who?)
// NotificationType 5: Receive a thanks on my wall

var NotificationQuery = function(userId, limitNum, cb) {
  knex
    .from('notification as n')
    .leftJoin('readnotification as rn', function() {
      this.on('n.notificationID', '=', 'rn.notificationID').andOn('rn.userID', '=', userId)
    })
    .leftJoin('user as u', function() {
      this.on('u.userID', '=', 'n.userID')
    })
    .leftJoin('item as i', function() {
      this.on('n.itemID', '=', 'i.itemID')
    })
    .leftJoin('itemWanter as iw', function() {
      this.on('iw.itemID', '=', 'n.itemID').andOn('iw.wanterID', '=', userId).andOn('n.timeCreated','>','iw.timeWanted')
    })
    .leftJoin('thank as t', function() {
      this.on('n.thankID', '=', 't.thankID').andOn('t.receiverID', '=', userId).andOn('t.thankerID', '!=', userId)
    })
    .leftJoin('comment as c', function() {
      this.on('n.commentID', '=', 'c.commentID').andOn('c.commenterID', '!=', userId)
    })
    .select(['u.name', 'n.notificationID', 'n.notificationType', 'n.itemID', 'n.userID', 'n.wantID', 'n.commentID', 'n.thankID', 'n.timeCreated', 'iw.timeWanted', 'n.active', 'rn.readnotificationID', 'i.giverID', 'i.takerID', 'i.title', 'iw.wanterID', 't.receiverID', 'c.commenterID'])
    .where('n.active', '=', 1) // Active Notification
    .whereNull('rn.readnotificationID') // Not Read Yet
    .where('n.timeCreated', '<=', moment().format("YYYY-MM-DD HH:mm:ss")) // Notification has already been created
    .where(function() {
      this.where(function() {
        this.where('n.notificationType', 'in', [1,2]).andWhere('i.giverID', '=', userId).whereNull('i.takerID') // Notification Type 1/2
      }).orWhere(function() {
        this.where('n.notificationType', '=', 3).andWhere('i.giverID', '=', userId).whereNotNull('c.commenterID') // Notification Type 3
      }).orWhere(function() {
        this.where('n.notificationType', '=', 3).whereNotNull('iw.wanterID').whereNull('i.takerID').whereNotNull('c.commenterID') // Notification Type 3
      }).orWhere(function() {
        this.where('n.notificationType', '=', 4).whereNotNull('iw.wanterID') // Notification Type 4
      }).orWhere(function() {
        this.where('n.notificationType', '=', 5).whereNotNull('t.receiverID') // Notification Type 5
      })
    })
    .orderBy('n.timeCreated', 'DESC')
    .limit(limitNum)
    .then(function(result){
      return cb(result);
    });
}

var db = {}
db.Item = Item;
db.User = User;
db.Want = Want;
db.Comment = Comment;
db.Thank = Thank;
db.Notification = Notification;
db.CommentUpvote = CommentUpvote;
db.ThankUpvote = ThankUpvote;
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
db.NotificationQuery = NotificationQuery;

module.exports = db;