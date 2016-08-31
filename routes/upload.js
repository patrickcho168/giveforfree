"use strict"

var crypto = require("crypto");
var mime = require("mime");
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

function saveCategories(item, categories) {
    var categoriesPos = [
        "clothes",
        "accessories",
        "furniture & home",
        "parenting",
        "health",
        "beauty",
        "kitchen appliances",
        "gardening",
        "property",
        "design & craft",
        "electronics",
        "sports",
        "photography",
        "antiques",
        "toys",
        "games",
        "music",
        "tickets & vouchers",
        "auto accessories",
        "books",
        "stationery",
        "textbooks",
        "notes",
        "pets",
        "other"
    ];

    var ids = categories.map(function(cat) {
        return categoriesPos.indexOf(cat) + 1;
    })

    console.log(ids);
    return item.categories().attach(ids);
}

function saveItem(req, res, fileName) {
    // Create item based on form
    var newItem = new db.Item({
        giverID: req.user.appUserId,
        timeCreated: moment().format("YYYY-MM-DD HH:mm:ss"),
        timeExpired: moment(req.body.date + moment().format(" HH:mm:ss")).format("YYYY-MM-DD HH:mm:ss"),
        title: req.body.title,
        description: req.body.description,
        postageMessage: req.body.postMessage,
        meetupMessage: req.body.meetupMessage,
        postage: req.body.postage,
        meetup: req.body.meetup,
        imageLocation: fileName
    });

    // Save item to database
    newItem.save().then(function(newSavedItem) {

        var createdItemID = newSavedItem.attributes.itemID;

        if (createdItemID != null) {
            // Save categories
            saveCategories(newSavedItem, req.body.categories);
            console.log(createdItemID);
            req.flash('success_messages', 'Upload Succeeded! Redirecting to item page ...');
            setTimeout(redirectSuccess, 1, createdItemID, res);
            // res.redirect("/item/" + createdItemID);
        } else {
            console.log(createdItemID);
            req.flash('error_messages', 'Upload Failed! Redirecting you to home ... ');
            setTimeout(redirectFail, 1, res);
        }

        if (req.body.postToFacebook) {

            // Create facebook post
            var userFbId = req.user.id;
            var newItemTitle = newSavedItem.attributes.title;
            var newItemUrl = newSavedItem.attributes.imageLocation;
            var apiCall = '/' + userFbId + '/feed';
            facebook.getFbData(req.user.accessToken, apiCall, createFbPost(newItemTitle, createdItemID, newItemUrl), function(data) {});

        }
    });
}

function redirectSuccess(itemID, response) {
    response.redirect("/item/" + itemID);
}

function redirectFail(response) {
    response.redirect("/");
}


module.exports = function(app) {
    app.get('/upload', ensureLogin.ensureLoggedIn(), function(req, res, next) {
        var otherUserId = parseInt(req.params.id);
        var mine = otherUserId === req.user.appUserId;

        res.render("upload", {
            myProfile: mine,
            user: req.user.attributes,
            id: req.user.appUserId,
            notification: req.session.notification
        });
    });

    app.post('/upload', ensureLogin.ensureLoggedIn(), function(req, res, next) {
        var otherUserId = parseInt(req.params.id);
        var mine = otherUserId === req.user.appUserId;

        if (!(req.user.appUserId)) {
            next(new Error("User does not have appUserId"));

        } else {
            req.body.croppedImage = req.body.croppedImage.replace(/^data:image\/\w+;base64,/, "");
            console.log(req.body.date);

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
            req.sanitizeBody('meetupMessage');
            req.sanitizeBody('postageMessage');
            req.sanitizeBody('meetup');
            req.sanitizeBody('postage');
            req.sanitizeBody('categories');

            var errors = req.validationErrors();

            if (errors) {
                errors.forEach(function(error) {
                    req.flash('error_messages', error.msg);
                });
                res.redirect(301, '/upload');

            } else {
                // Upload image
                var buf = new Buffer(req.body.croppedImage, 'base64')
                var fileName = crypto.pseudoRandomBytes(16).toString('hex') + '.png'

                var data = {
                    Key: fileName,
                    Body: buf,
                    ContentEncoding: 'base64',
                    ContentType: 'image/png'
                };

                s3.upload(data, function(err, data, next) {
                    if (err) {
                        console.log(err);
                        console.log('Error uploading data: ', data);
                        next();
                    } else {
                        console.log(data);
                        console.log('successfully uploaded the image!');


                        saveItem(req, res, fileName);
                    }
                });

            }
        }
    });
}
