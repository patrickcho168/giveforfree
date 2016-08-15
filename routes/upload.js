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

var uploading = multer({

  // Only accept image files
  fileFilter: function (req, file, cb) {
      console.log(typeof(file.mimetype));

      // Checks the file extension
      if (file.mimetype.indexOf("image") == -1) {
        cb(new Error("This is not an image file."), false);
      } else {
        cb(null, true)
      }
  },

  // Files must be smaller than 100kb
  limits: { fileSize: 100 * 1000 },

  // Save to Amazon S3 bucket
  storage: multers3 ({
                      s3: s3,
                      dirname: '/',
                      bucket: 'giveforfree',
                      acl: 'private',
                      key: function (req, file, cb) {
                        crypto.pseudoRandomBytes(16, function (err, raw) {
                          cb(null, raw.toString('hex') + Date.now() + '.' + 
                            mime.extension(file.mimetype));
                        });
                      }
                    })
}).single('avatar');

module.exports = function(app) {
  app.get('/upload', function(req, res) {
    res.render("upload", { messages: req.flash('error_messages') });
  });

  app.post('/upload', function(req, res) {
    uploading(req, res, function (err) {
      if (err) {
        console.log(err.message);
        req.flash('error_messages', err.message);
        res.redirect('/upload');
      } else {
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
      }
    });
  });
}
