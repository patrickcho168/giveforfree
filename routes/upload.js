"use strict"

var crypto = require("crypto");
var mime = require("mime");
var moment = require("moment");
var aws = require("aws-sdk");
var xss = require('xss');
var bodyParser = require("body-parser");
var csrf = require('csurf');
var config = require('../config');
var db = require('../models/db');
var ensureLogin = require('connect-ensure-login');
var querystring = require('querystring');
var facebook = require('../controllers/facebook');
var config = require('../config');

// CSRF Token to be used in forms
var csrfProtection = csrf();
var parseForm = bodyParser.urlencoded({ extended: true, limit: '50mb' });

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
        'link': config.domain + '/item/' + itemId,
        'message': 'Snag my ' + title + ' for free now!',
        'method': 'POST',
        'picture': config.imageDomain + '/' + imgUrl
    };
    return querystring.stringify(object);
}

function createFbStory(itemId, startTime, endTime, fbFreeItemId) {
    var object = {
        // 'free_item': 'https://graph.facebook.com/1086175114800378/' + fbFreeItemId,
        'free_item': config.domain + '/item/' + itemId,
        'method': 'POST',
        'fb:explicitly_shared': true,
        'start_time': startTime,
        'end_time': endTime
    };
    console.log(querystring.stringify(object));
    return querystring.stringify(object);
}

function createFbFreeItem(title, itemId, imgUrl) {
    var object = {
        'og:url': config.domain + '/item/' + itemId,
        'og:title': title,
        'og:type': config.fbNamespace + ':free_item',
        'og:image': config.imageDomain + '/' + imgUrl,
        'og:description': '',
        'fb:app_id': config.fbClientID,
    }
    return 'method=POST&object=' + encodeURIComponent(JSON.stringify(object));
}

function saveCategories(item, categories) {
    var categoriesPos = [
        "books",
        "clothes",
        "electronics",
        "entertainment",
        "furniture",
        "kitchen appliances",
        "sports",
        "toys",
        "other"
    ];
    console.log('categories', categories);
    if (categories) {
        var ids = categories.map(function(cat) {
            return categoriesPos.indexOf(cat) + 1;
        });


        console.log('categories ids', ids);
        item.categories().detach();
        item.categories().attach(ids);
    }
}

function saveItem(req, res, fileName) {
    // Create item based on form
    var newItem = new db.Item({
        giverID: req.user.appUserId,
        timeCreated: moment().format("YYYY-MM-DD HH:mm:ss"),
        timeExpired: moment(req.body.date + " 23:59:59").format("YYYY-MM-DD HH:mm:ss"),
        title: xss(req.body.title),
        description: xss(req.body.description),
        collectionMessage: xss(req.body.collectionMessage),
        postage: req.body.postage ? 1 : 0,
        meetup: req.body.meetup ? 1 : 0,
        imageLocation: fileName
    });

    // Save item to database
    newItem.save().then(function(newSavedItem) {

        var createdItemID = newSavedItem.attributes.itemID;

        if (createdItemID != null) {

            // Save categories
            if (req.body.categories) {
                saveCategories(newSavedItem, req.body.categories.replace("&amp;", "&").split(','));
            }
            console.log(createdItemID);
            req.flash('success_messages', 'Woohoo! Your item is now live!!!');
            setTimeout(redirectSuccess, 1, createdItemID, res);
            // res.redirect("/item/" + createdItemID);
        } else {
            console.log(createdItemID);
            req.flash('error_messages', 'Drats we encountered some problems uploading your item! Please try again!');
            setTimeout(redirectFail, 1, res);
        }

        if (createdItemID != null && req.body.postToFacebook) {

            // Create facebook post
            // var userFbId = req.user.id;
            var newItemTitle = newSavedItem.attributes.title;
            var newItemUrl = newSavedItem.attributes.imageLocation;
            var newItemTimeCreated = newSavedItem.attributes.timeCreated;
            var newItemTimeExpired = newSavedItem.attributes.timeExpired;
            // var apiCall = '/' + userFbId + '/feed';
            // facebook.getFbData(req.user.accessToken, apiCall, createFbPost(newItemTitle, createdItemID, newItemUrl), function(data) {});
            console.log("FACEBOOK STORY CREATION");
            var apiCall = '/me/' + config.fbNamespace + ':give';
            var objectApiCall = '/me/objects/' + config.fbNamespace + ':free_item'
            facebook.getFbData(req.user.accessToken, objectApiCall, createFbFreeItem(newItemTitle, createdItemID, newItemUrl), function(data) {
                console.log(data);
                facebook.getFbData(req.user.accessToken, apiCall, createFbStory(createdItemID, newItemTimeCreated, newItemTimeExpired, JSON.parse(data).id), function(data2) {
                    console.log(data2);
                });
            });

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
    app.get('/upload', ensureLogin.ensureLoggedIn(), csrfProtection, function(req, res, next) {
        var userId = req.user.appUserId;
        db.User.where({
            userID: userId
        }).fetch().then(function(user) {
            res.render("upload", {
                user: user.attributes,
                id: req.user.appUserId,
                notification: req.session.notification,
                moment: moment,
                csrfToken: req.csrfToken()
            });
        });
    });


    // Update an item
    app.post('/api/update/:itemId',  parseForm, ensureLogin.ensureLoggedIn(), csrfProtection, function(req, res) {
        var itemId = parseInt(req.params.itemId);
        var userId = parseInt(req.user.appUserId);
        db.Item.where({
            itemID: itemId,
            giverID: userId
        }).fetch().then(function(item) {
            // If this item exists
            if (item) {
                console.log(req.body);
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
                    }
                });

                req.sanitizeBody('title').escape();
                req.sanitizeBody('description').escape();
                req.sanitizeBody('meetup').escape();
                req.sanitizeBody('postage').escape();
                req.sanitizeBody('categories').escape();
                req.sanitizeBody('date').escape();

                var errors = req.validationErrors();

                if (errors) {
                    errors.forEach(function(error) {
                        req.flash('error_messages', error.msg);
                    });
                    res.redirect(301, '/item/'+itemId);
                } else {
                    // Update item
                    item.save({
                        title: xss(req.body.title),
                        description: xss(req.body.description),
                        timeExpired: moment(req.body.date + " 23:59:59").format("YYYY-MM-DD HH:mm:ss"),
                        collectionMessage: xss(req.body.collectionMessage),
                        postage: req.body.postage ? 1 : 0,
                        meetup: req.body.meetup ? 1 : 0
                    }).then(function() {
                        req.flash('success_messages', 'Your item details are updated!');
                        res.redirect("/item/" + itemId);
                    });


                    if (req.body.categories) {
                        saveCategories(item, req.body.categories.replace("&amp;", "&").split(','));
                    }
                }

            } else {
                req.flash('error_messages', 'Drats we had some problems updating your item! Please try again!');
                res.redirect("/item/" + itemId);
            }
        });
    });

    app.post('/upload', parseForm, ensureLogin.ensureLoggedIn(), csrfProtection, function(req, res, next) {
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

            req.sanitizeBody('title').escape();
            req.sanitizeBody('description').escape();
            req.sanitizeBody('collectionMessage').escape();
            req.sanitizeBody('meetup').escape();
            req.sanitizeBody('postage').escape();
            req.sanitizeBody('categories').escape();

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
