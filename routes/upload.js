"use strict"

var crypto = require("crypto");
var mime = require("mime");
var moment = require("moment");
var aws = require("aws-sdk");
var bodyParser = require("body-parser");
var config = require('../config');
var db = require('../models/db');
var ensureLogin = require('connect-ensure-login');
var querystring = require('querystring');
var facebook = require('../controllers/facebook');
var moment = require('moment');

aws.config.update({
    secretAccessKey: config.awsSecretAccessKey,
    accessKeyId: config.awsAccessKeyId,
    region: 'ap-southeast-1',
});

var s3 = new aws.S3({
    params: {
        Bucket: 'giveforfree'
    }
});

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

app.get('/upload', ensureLogin.ensureLoggedIn(), function(req, res, next) {
    var otherUserId = parseInt(req.params.id);
    var mine = otherUserId === req.user.appUserId;

    res.render("upload", {
        myProfile: mine,
        user: req.user.attributes,
        id: req.user.appUserId,
        moment: moment
    });
});

app.post('/upload', ensureLogin.ensureLoggedIn(), function(req, res, next) {
    var otherUserId = parseInt(req.params.id);
    var mine = otherUserId === req.user.appUserId;

    if (!(req.user.appUserId)) {
        next(new Error("User does not have appUserId"));
    } else {
        req.body.croppedImage = req.body.croppedImage.replace(/^data:image\/\w+;base64,/, "");

        // Simple form validation
        req.checkBody({

            'title': {
                notEmpty: true,
                isLength: {
                    options: [{
                        min: 1,
                        max: 50
                    }],
                    errorMessage: 'Title must be less than 50 characters' // Error message for the validator, takes precedent over parameter message
                },

                errorMessage: 'Please fill in a valid title.'
            },

            'description': {
                notEmpty: true,
                isLength: {
                    options: [{
                        min: 1,
                        max: 200
                    }],
                    errorMessage: 'Description must be less than 200 characters' // Error message for the validator, takes precedent over parameter message
                },

                errorMessage: 'Please fill in a valid description.'
            },

            'croppedImage': {
                isBase64: true,
                notEmpty: true,
                errorMessage: 'Please upload and confirm an image.'
            }
        });

        req.sanitizeBody('title');
        req.sanitizeBody('description');
        req.sanitizeBody('croppedImage');

        var errors = req.validationErrors();

        if (errors) {
            errors.forEach(function(error) {
                req.flash('error_messages', error.msg);
            });
            res.redirect(301, '/upload');

        } else {
            // Upload image
            var buf = new Buffer(req.body.croppedImage, 'base64');
            var fileName = crypto.pseudoRandomBytes(16).toString('hex') + '.png';

            var data = {
                Key: fileName,
                Body: buf,
                ContentEncoding: 'base64',
                ContentType: 'image/png'
            };

            s3.upload(data, function(err, data) {
                if (err) {
                    console.log(err);
                    console.log('Error uploading data: ', data);
                } else {
                    console.log(data);
                    console.log('succesfully uploaded the image!');
                }
            });

            req.sanitizeBody('title');
            req.sanitizeBody('description');
            req.sanitizeBody('x');
            req.sanitizeBody('y');
            req.sanitizeBody('height');
            req.sanitizeBody('width');
            req.sanitizeBody('rotate');

            var errors = req.validationErrors();


            if (errors) {
                errors.forEach(function(error) {
                    req.flash('error_messages', error.msg);
                });
                res.redirect(301, '/upload');

            } else {
                // Image processing
                var fileBuffer = req.file.buffer;
                var re = /(?:\.([^.]+))?$/;
                var fileExtension = re.exec(req.file.originalname)[1];
                console.log(fileExtension);

                lwip.open(fileBuffer, fileExtension, function(err, image) {
                    if (err) return console.log(err);
                    image.batch()
                        .blur(10)
                        .lighten(0.2)
                        .writeFile('upload/lwip.jpg', function(err) {
                            if (err) return console.log(err);
                            res.send('done');
                            res.redirect("/upload");
                        });
                });

                // Create item based on form
                var newItem = new db.Item({
                    giverID: req.user.appUserId,
                    timeCreated: moment().format("YYYY-MM-DD HH:mm:ss"),
                    timeExpired: moment().add(req.body.no_of_days, 'days').format("YYYY-MM-DD HH:mm:ss"),
                    title: req.body.title,
                    description: req.body.description,
                    imageLocation: "NEED THE LOCATION"
                });

                // Save item to database
                var newItemID = null;
                newItem.save().then(function(newSavedItem) {

                    if (req.body.postToFacebook) {

                        // Create facebook post
                        var userFbId = req.user.id;
                        var newItemTitle = newSavedItem.attributes.title;
                        var newItemId = newSavedItem.attributes.itemID;
                        var newItemUrl = newSavedItem.attributes.imageLocation;
                        var apiCall = '/' + userFbId + '/feed';
                        facebook.getFbData(req.user.accessToken, apiCall, createFbPost(newItemTitle, newItemId, newItemUrl), function(data) {});

                    }

                    // console.log(newSavedItem);
                    // var newItemId = newSavedItem.attributes.itemID;
                    // var newItemUrl = newSavedItem.attributes.imageLocation;
                    // var newItemDesc = newSavedItem.attributes.description;
                    // var newItemTitle = newSavedItem.attributes.title;
                    // var objString = createFbItem(newItemUrl, newItemTitle, newItemDesc, newItemId);
                    // console.log('%7B%22' + objString + '%22%7D');
                });

                if (newItemID == null) {
                    res.redirect("/");
                } else {
                    res.redirect("/item/" + newItem.attributes.itemID);
                }

            }
        }
    }
});
};
