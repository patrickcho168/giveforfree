"use strict"

var multer = require("multer");
var crypto = require("crypto");
var mime = require("mime");
var multers3 = require("multer-s3");
var moment = require('moment');
var aws = require('aws-sdk');
var config = require('../config');
var db = require('../models/db');
var ensureLogin = require('connect-ensure-login');

aws.config.update({
  secretAccessKey: config.awsSecretAccessKey,
  accessKeyId: config.awsAccessKeyId,
  region: 'ap-southeast-1',
})

var s3 = new aws.S3();
var storage = multers3({
  s3: s3,
  dirname: '/',
  bucket: 'giveforfree',
  acl: 'private',
  key: function (req, file, cb) {
    crypto.pseudoRandomBytes(16, function (err, raw) {
      cb(null, raw.toString('hex') + Date.now() + '.' + mime.extension(file.mimetype));
    });
  }
});

var uploading = multer({
  storage: storage,
  limits: { fileSize: 100000 }
});

module.exports = function(app) {
  app.get('/upload', function(req, res) {
    res.render("upload");
  });

  app.post('/upload', uploading.single('avatar'), function(req, res) {
    // Create item based on form
    var newItem = new db.Item({
      giverID: req.user.appUserId,
      timeCreated: moment().format(),
      timeExpired: moment().add(req.body.no_of_days, 'days').format(),
      randomAssign: req.body.randomAssign,
      title: req.body.title,
      description: req.body.description,
      imageLocation: req.file.key
    });

    // Save item to database
    newItem.save();

    res.redirect("/");
  });
}
