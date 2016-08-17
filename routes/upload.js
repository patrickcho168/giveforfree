"use strict"

var multer = require("multer");
var crypto = require("crypto");
var mime = require("mime");
var multers3 = require("multer-s3");
var moment = require("moment");
var aws = require("aws-sdk");
var config = require('../config');
var db = require('../models/db');
var ensureLogin = require('connect-ensure-login');
var querystring = require('querystring');
var facebook = require('../controllers/facebook');

aws.config.update({
    secretAccessKey: config.awsSecretAccessKey,
    accessKeyId: config.awsAccessKeyId,
    region: 'ap-southeast-1',
})

var s3 = new aws.S3();

var uploading = multer({

    // Only accept image files
    fileFilter: function(req, file, cb) {
        console.log("HERE1");
        console.log(typeof(file.mimetype));
        console.log("HERE2");
        // Checks the file extension
        if (file.mimetype.indexOf("image") == -1) {
            cb(new Error("This is not an image file."), false);
        } else {
            cb(null, true)
        }
    },

    // Files must be smaller than 100kb
    limits: {
        fileSize: 100 * 1000
    },

    // Save to Amazon S3 bucket
    storage: multers3({
        s3: s3,
        dirname: '/',
        bucket: 'giveforfree',
        acl: 'private',
        key: function(req, file, cb) {
            crypto.pseudoRandomBytes(16, function(err, raw) {
                cb(null, raw.toString('hex') + Date.now() + '.' +
                    mime.extension(file.mimetype));
            });
        }
    })
}).single('input-file-preview');

// function createFbItem(imgUrl, title, desc, itemId) {
//   var object = {
//     'og:url': 'http://ec2-54-255-178-61.ap-southeast-1.compute.amazonaws.com/item/' + itemId,
//     'og:title': title,
//     'og:type': 'product.item',
//     'og:image': 'https://d24uwljj8haz6q.cloudfront.net/' + imgUrl,
//     'og:description': desc,
//     'fb:app_id': config.fbClientID,
//     'product:retailer_item_id': itemId,
//     'product:price:amount': '0',
//     'product:price:currency': 'SGD',
//     'product:availability': 'in stock',
//     'product:condition': 'used'
//   };
//   return querystring.stringify(object, '%22%2C%22', '%22%3A%22');
// }

function createFbPost(title, itemId, imgUrl) {
    var object = {
        'link': 'http://ec2-54-255-178-61.ap-southeast-1.compute.amazonaws.com/item/' + itemId,
        'message': 'Snag my ' + title + ' for free now!',
        'method': 'POST',
        'picture': 'https://d24uwljj8haz6q.cloudfront.net/' + imgUrl
    };
    return querystring.stringify(object);
}

module.exports = function(app) {
    app.get('/upload', function(req, res, next) {
        var otherUserId = parseInt(req.params.id);
        var mine = otherUserId === req.user.appUserId;

        res.render("upload", {
            myProfile: mine,
            user: req.user.attributes,
            id: req.user.appUserId
        });
    });

    app.post('/upload', function(req, res, next) {
        uploading(req, res, function(err) {
            console.log("HERE");
            if (err) {
                console.log(err.message);
                req.flash('error_messages', err.message);
                res.redirect('/upload');

      } else if (!(req.file)) {
        req.flash('error_messages', 'Please upload an image.');
        res.redirect('/upload');

            } else {
                // Check appUserId exists
                if (!(req.user.appUserId)) {
                    next(new Error("User does not have appUserId"));
                }

                // Simple form validation
        req.checkBody('title', 'Please fill in a valid title.').notEmpty();
        req.checkBody('description', 'Please fill in a valid description.').notEmpty();

        req.sanitizeBody('title');
        req.sanitizeBody('description');

        var errors = req.validationErrors();
        console.log(errors);
        console.log(req.file);

        if (errors) {
          errors.forEach(function(error) {
            req.flash('error_messages', error.msg);
          });
          
          res.redirect('/upload');
        } else {
          // Create item based on form
                    var newItem = new db.Item({
                        giverID: req.user.appUserId,
                        timeCreated: moment().format("YYYY-MM-DD HH:mm:ss"),
                        timeExpired: moment().add(req.body.no_of_days, 'days').format("YYYY-MM-DD HH:mm:ss"),
                        title: req.body.title,
                        description: req.body.description,
            // Change name asap
            randomAssign: req.body.postToFacebook ? 1 : 0,
                        imageLocation: req.file.key
                    });

                    // Save item to database
          newItem.save().then(function(newSavedItem) {

            // Create facebook post
            var userFbId = req.user.id;
            var newItemTitle = newSavedItem.attributes.title;
            var newItemId = newSavedItem.attributes.itemID;
            var newItemUrl = newSavedItem.attributes.imageLocation;
            var apiCall =  '/' + userFbId +'/feed';
            console.log(apiCall);
            facebook.getFbData(req.user.accessToken, apiCall, createFbPost(newItemTitle, newItemId, newItemUrl), function(data){
              console.log(data);
            });
            // console.log(newSavedItem);
            // var newItemId = newSavedItem.attributes.itemID;
            // var newItemUrl = newSavedItem.attributes.imageLocation;
            // var newItemDesc = newSavedItem.attributes.description;
            // var newItemTitle = newSavedItem.attributes.title;
            // var objString = createFbItem(newItemUrl, newItemTitle, newItemDesc, newItemId);
            // console.log('%7B%22' + objString + '%22%7D');
          });

                    res.redirect("/");
        
        } 
            }
        });
    });
}
