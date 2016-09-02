// Views to append into the scroll container
var html = '';

// Boolean to record the number of times the scroll hits the floor
var triggered = 0;

// Individual trackers for each tab
var lastGiftsId = 0;
var lastWantsId = 0;
var lastThanksId = 0;
var lastFriendsId = 0;
var lastItem = 0;

// Number of items to load every AJAX
var numItems = 9;

var canAJAX = false;

var firstGifts = true;
var firstWants = true;
var firstThanks = true;
var firstFriends = true;

var isFirst = true;

var urlAJAX = null;

// AJAX Infinite Scrolling Function
function addRealViews(html) {

    var currentTab = $(".nav-tabs").find(".active").attr('id');

    switch (currentTab) {
        case "tab-gifts":
            $("#my-tabs-contents").find(".active").removeClass("active");
            $("#my-tabs-contents").find(".active").removeClass("in");
            $("#gifts").addClass("active");
            $("#gifts").addClass("in");
            window.location.hash = "gifts";
            currentTab = "gifts";
            isFirst = firstGifts;
            if (firstGifts) {
                urlAJAX = '/api/myItems/' + 0 + '/' + numItems + '/' + appProfileId;
            } else {
                urlAJAX = '/api/myItems/' + lastGiftsId + '/' + numItems + '/' + appProfileId;
            }
            firstGifts = false;
            lastItem = lastGiftsId;
            break;
        case "tab-wants":
            $("#my-tabs-contents").find(".active").removeClass("active");
            $("#my-tabs-contents").find(".active").removeClass("in");
            $("#wants").addClass("active");
            $("#wants").addClass("in");
            window.location.hash = "wants";
            currentTab = "wants";
            isFirst = firstWants;
            if (firstWants) {
                urlAJAX = '/api/myWants/' + 0 + '/' + numItems + '/' + appProfileId;
            } else {
                urlAJAX = '/api/myWants/' + lastWantsId + '/' + numItems + '/' + appProfileId;
            }
            firstWants = false;
            lastItem = lastWantsId;
            break;
        case "tab-thanks":
            $("#my-tabs-contents").find(".active").removeClass("active");
            $("#my-tabs-contents").find(".active").removeClass("in");
            $("#thanks").addClass("active");
            $("#thanks").addClass("in");
            window.location.hash = "thanks";
            currentTab = "thanks";
            isFirst = firstThanks;
            urlAJAX = null;
            firstThanks = false;
            lastItem = lastThanksId;
            break;
        case "tab-friends":
            $("#my-tabs-contents").find(".active").removeClass("active");
            $("#my-tabs-contents").find(".active").removeClass("in");
            $("#friends").addClass("active");
            $("#friends").addClass("in");
            window.location.hash = "friends";
            currentTab = "friends";
            isFirst = firstFriends;
            urlAJAX = null;
            firstFriends = false;
            lastItem = lastFriendsId;

            break;
        default:
            break;
    }

    if (urlAJAX != null && lastItem >= 1 || isFirst) {
        // AJAX to fetch JSON objects from server
        $.ajax({
            url: urlAJAX,
            dataType: "json",
            method: 'get',
            cache: false,

            // Success Callback
            success: function(data) {
                canAJAX = true;

                // Data available to display / append
                if (data.length > 0) {
                    // Increment tracker
                    switch (currentTab) {
                        case "gifts":
                            lastGiftsId = data[data.length - 1].itemID;
                            break;
                        case "wants":
                            lastWantsId = data[data.length - 1].itemID;
                            break;
                        case "thanks":
                            lastThanksId = data[data.length - 1].itemID;
                            break;
                        case "friends":
                            lastFriendsId = data[data.length - 1].itemID;
                            break;
                        default:
                            break;
                    }
                    // lastItemId = data[data.length - 1].itemID;

                    /*** Factory for views ***/
                    $.each(data, function(key, value) {
                        if (value.giverID !== myAppId && value.takerID !== null && value.takerID !== myAppId) {
                            html = '<div class="item col-lg-3 col-md-3 col-sm-4 col-ms-6 col-xs-12" style="margin-bottom: 20px; opacity: 0.6;">';
                        } else if (value.giverID !== myAppId && value.takerID !== null && value.takerID === myAppId) {
                            html = '<div class="item col-lg-3 col-md-3 col-sm-4 col-ms-6 col-xs-12" style="margin-bottom: 20px; opacity: 0.6;">';
                        } else if (loggedIn && value.giverID !== myAppId && value.meWant === 0 && !value.expired) { // NEED TO ADD NOT EXPIRED
                            html = '<div class="item col-lg-3 col-md-3 col-sm-4 col-ms-6 col-xs-12" style="margin-bottom: 20px;">';
                        } else if (loggedIn && value.giverID !== myAppId && value.meWant > 0 && !value.expired) {
                            html = '<div class="item col-lg-3 col-md-3 col-sm-4 col-ms-6 col-xs-12" style="margin-bottom: 20px;">';
                        } else if (value.giverID !== myAppId && value.expired) {
                            html = '<div class="item col-lg-3 col-md-3 col-sm-4 col-ms-6 col-xs-12" style="margin-bottom: 20px; opacity: 0.6;">';
                        } else if (value.giverID === myAppId && value.takerID !== null) {
                            html = '<div class="item col-lg-3 col-md-3 col-sm-4 col-ms-6 col-xs-12" style="margin-bottom: 20px; opacity: 0.6;">';
                        } else if (value.giverID === myAppId && value.takerID === null) {
                            html = '<div class="item col-lg-3 col-md-3 col-sm-4 col-ms-6 col-xs-12" style="margin-bottom: 20px;">';
                        } else {
                            html = '<div class="item col-lg-3 col-md-3 col-sm-4 col-ms-6 col-xs-12" style="margin-bottom: 20px;">';
                        }
                        // Main Item Photo
                        html += '<a href="/item/' + value.itemID + '" target="_blank"><div class="thumbnail" style="padding: 0; border: none;" align="center">';

                        html += '<div class="box"><img style="display: block;" class="clipped" src="https://d24uwljj8haz6q.cloudfront.net/' + value.imageLocation + '" onerror="handleBrokenImage(this);"></div>';

                        // Item Title
                        html += '<div class="caption-area" align="left">';
                        html += '<br/><h6 class="item-header hide-overflow" style="padding-left: 10px; padding-top: 0px; margin: 5px  auto;"><a href="/item/' + value.itemID + '" target="_blank">' + value.title + '</a></h6>';
                        html += '<row><p class="item-author hide-overflow" style="margin: 5px auto;">';

                        html += '<a href="/profile/' + value.userID + '" target="_blank" class="small-avatar col-lg-4" style="background-image: url(http://graph.facebook.com/' + value.fbID + '/picture?type=large);" style="margin: auto 10px; padding: 0; width: 30px; height: 30px; border-radius:50%;"><span style="padding-left: 20px;">' + value.name + '</span></a></p></row>';

                        // Item Snag Counts
                        if (value.numWants >= 1) {
                            html += '<small class="item-snags pull-right text-muted" align="right" style="padding-right: 10px; padding-top: 0; padding-bottom: 10px;"><b>' + value.numWants + ' people want this.</b></small>';
                        } else {
                            html += '<small class="item-snags pull-right text-muted" align="right" style="padding-right: 10px; padding-top: 0;padding-bottom: 10px;">' + '<b>Be the first to check this out!</b></small>';
                        }

                        // Labels
                        if (value.giverID !== myAppId && value.takerID !== null && value.takerID !== myAppId) {
                            html += '<div class="ribbon-wrapper-green">';
                            html += '<div class="ribbon-grey">';
                            html += 'others';
                            html += '</div>';
                            html += '</div>';
                        } else if (value.giverID !== myAppId && value.takerID !== null && value.takerID === myAppId) {
                            html += '<div class="ribbon-wrapper-green">';
                            html += '<div class="ribbon-grey">';
                            html += 'won';
                            html += '</div>';
                            html += '</div>';
                        } else if (loggedIn && value.giverID !== myAppId && value.meWant === 0 && !value.expired) { // NEED TO ADD NOT EXPIRED

                        } else if (loggedIn && value.giverID !== myAppId && value.meWant > 0 && !value.expired) {
                            html += '<div class="ribbon-wrapper-green">';
                            html += '<div class="ribbon-green">';
                            html += 'wanted';
                            html += '</div>';
                            html += '</div>';
                        } else if (value.expired) {
                            html += '<div class="ribbon-wrapper-green">';
                            if (value.giverID === myAppId) {
                                html += '<div class="ribbon-red">';
                            } else {
                                html += '<div class="ribbon-grey">';
                            }
                            html += 'expired';
                            html += '</div>';
                            html += '</div>';
                        } else if (value.giverID === myAppId && value.takerID !== null) {
                            html += '<div class="ribbon-wrapper-green">';
                            html += '<div class="ribbon-grey">';
                            html += 'given away';
                            html += '</div>';
                            html += '</div>';
                        } else if (value.giverID === myAppId && value.takerID === null) {
                            html += '<div class="ribbon-wrapper-green">';
                            html += '<div class="ribbon-green">';
                            html += 'ongoing';
                            html += '</div>';
                            html += '</div>';
                        }

                        html += '</div>';
                        html += '</div></a>';
                        html += '</div>';

                        switch (currentTab) {
                            case "gifts":
                                firstGifts = false;
                                $('#gifts').append(html);
                                $('#gifts-placeholder').hide();
                                break;
                            case "wants":
                                firstWants = false;

                                $('#wants').append(html);
                                $('#wants-placeholder').hide();
                                break;
                            case "thanks":
                                firstThanks = false;

                                $('#thanks').append(html);
                                $('#thanks-placeholder').hide();
                                break;
                            case "friends":
                                firstFriends = false;

                                $('#friends').append(html);
                                $('#friends-placeholder').hide();
                                break;
                            default:
                                break;
                        }
                    });
                    triggered = 0;

                } else {

                }
            },
            error: function(data) {
                canAJAX = true;
                triggered = 0;
            }
        });
    }
}


// Main Navigation and Load Logic
$(document).ready(function() {

    var currentHash = window.location.hash;
    switch (currentHash) {
        case "#gifts":
            $(".nav-tabs").find(".active").removeClass("active");
            $("#tab-gifts").addClass("active");
            break;
        case "#wants":
            $(".nav-tabs").find(".active").removeClass("active");
            $("#tab-wants").addClass("active");
            break;
        case "#thanks":
            $(".nav-tabs").find(".active").removeClass("active");
            $("#tab-thanks").addClass("active");
            break;
        case "#friends":
            $(".nav-tabs").find(".active").removeClass("active");
            $("#tab-friends").addClass("active");
            break;
        default:
            break;

    }

    addRealViews(html);

    $('.nav-tabs a').click(function() {
        $(".nav-tabs").find(".active").removeClass("active");
        $(this).parent().addClass("active");
        triggered = 0;

        setTimeout(addRealViews, 300, html);
        addRealViews(html);
    });



    $('#confirm-delete').on('show.bs.modal', function(e) {
        $(this).find('.btn-ok').click(function() {
            console.log('click');
            $.ajax({
                type: 'post',
                url: '/api/delete-user',
                success: function(){
                    document.location = "/logout";
                }
            });
        });
    });

     window.scrollTo(0,0);
});

jQuery(document).ready(function($) {
    $.ajaxSetup({
        headers: {'X-CSRF-Token': $('meta[name="_csrf"]').attr('content')}
    });

    $('#comments-container').comments({
        readOnly: loggedIn ? false : true,
        roundProfilePictures: true,
        noCommentsText: 'No Thank You Messages.',
        textareaPlaceholderText: isMine ? 'Reply to your Thank You Messages' :'Leave a Thank You Message',
        // profilePictureURL: 'http://graph.facebook.com/' + userFbID + '/picture',
        getComments: function(success, error) {
            $.ajax({
                url: '/profile/' + appProfileId + '/thank',
                dataType: "json",
                method: 'get',
                cache: false,
                // Success Callback
                success: function(data) {
                    var thanksArray = [];
                    for (var i=0; i<data.length; ++i) {
                        var upvoted = false;
                        for (var j=0; j<data[i].upvote.length; ++j) {
                            if (data[i].upvote[j].userID === myAppId) {
                                upvoted = true;
                                break;
                            }
                        }
                        thanksArray.push({
                            id: data[i].thankID,
                            created: data[i].timeCreated,
                            content: data[i].message,
                            fullname: data[i].thankedBy.name,
                            // fullname: data[i].commentedBy.name,
                            upvote_count: data[i].upvote.length,
                            user_has_upvoted: upvoted,
                            profile_picture_url: 'http://graph.facebook.com/' + data[i].thankedBy.fbID + '/picture',
                            parent: data[i].parentThank,
                            created_by_current_user: data[i].thankedBy.userID === myAppId
                        })
                    }
                    success(thanksArray);
                },
                error: function(error) {
                    console.log("error loading");
                }
            });
        },
        postComment: function(commentJSON, success, error) {
            $.ajax({
                method: 'post',
                url: '/api/thank/profile/' + appProfileId,
                data: commentJSON,
                dataType: "json",
                success: function(data) {
                    var upvoted = false;
                    for (var i=0; i<data.upvote.length; ++i) {
                        if (data.upvote[i].userID === myAppId) {
                            upvoted = true;
                            break;
                        }
                    }
                    success({
                        id: data.thankID,
                        created: data.timeCreated,
                        content: data.message,
                        fullname: data.thankedBy.name,
                        upvote_count: data.upvote.length,
                        user_has_upvoted: upvoted,
                        profile_picture_url: 'http://graph.facebook.com/' + data.thankedBy.fbID + '/picture',
                        parent: data.parentThank,
                        created_by_current_user: data.thankedBy.userID === myAppId
                    });
                },
                error: function(error) {
                    console.log("error posting");
                }
            });
        },
        putComment: function(commentJSON, success, error) {
            $.ajax({
                type: 'post',
                url: '/api/updatethank/profile/' + commentJSON.id,
                data: commentJSON,
                dataType: "json",
                success: function(data) {
                    var upvoted = false;
                    for (var i=0; i<data.upvote.length; ++i) {
                        if (data.upvote[i].userID === myAppId) {
                            upvoted = true;
                            break;
                        }
                    }
                    if (data) {
                        success({
                            id: data.thankID,
                            created: data.timeCreated,
                            content: data.message,
                            fullname: data.thankedBy.name,
                            upvote_count: data.upvote.length,
                            user_has_upvoted: upvoted,
                            profile_picture_url: 'http://graph.facebook.com/' + data.thankedBy.fbID + '/picture',
                            parent: data.parentThank,
                            created_by_current_user: data.thankedBy.userID === myAppId
                        });
                    } else {
                        success({});
                    }
                },
                error: function(error) {
                    console.log("error editing");
                }
            });
        },
        deleteComment: function(commentJSON, success, error) {
            $.ajax({
                type: 'post',
                url: '/api/deletethank/profile/' + commentJSON.id,
                success: function(data) {
                    success();
                },
                error: function(error) {
                    console.log("error editing");
                }
            });
        },
        upvoteComment: function(commentJSON, success, error) {
            var upvotesURL = '/api/thank/profile/upvotes/' + commentJSON.id;
            var downvotesURL = '/api/thank/profile/downvotes/' + commentJSON.id;

            if(commentJSON.user_has_upvoted) {
                $.ajax({
                    type: 'post',
                    url: upvotesURL,
                    success: function(data) {
                        var upvoted = false;
                        for (var i=0; i<data.upvote.length; ++i) {
                            if (data.upvote[i].userID === userId) {
                                upvoted = true;
                                break;
                            }
                        }
                        if (data) {
                            success({
                                id: data.thankID,
                                created: data.timeCreated,
                                content: data.message,
                                fullname: data.thankedBy.name,
                                upvote_count: data.upvote.length,
                                user_has_upvoted: upvoted,
                                profile_picture_url: 'http://graph.facebook.com/' + data.thankedBy.fbID + '/picture',
                                parent: data.parentThank,
                                created_by_current_user: data.thankedBy.userID === userId
                            });
                        } else {
                            success({});
                        }
                    },
                    error:  function() {
                        console.log("error upvoting");
                    }
                });
            } else {
                $.ajax({
                    type: 'post',
                    url: downvotesURL,
                    success: function(data) {
                        var upvoted = false;
                        for (var i=0; i<data.upvote.length; ++i) {
                            if (data.upvote[i].userID === userId) {
                                upvoted = true;
                                break;
                            }
                        }
                        if (data) {
                            success({
                                id: data.thankID,
                                created: data.timeCreated,
                                content: data.message,
                                fullname: data.thankedBy.name,
                                upvote_count: data.upvote.length,
                                user_has_upvoted: upvoted,
                                profile_picture_url: 'http://graph.facebook.com/' + data.thankedBy.fbID + '/picture',
                                parent: data.parentThank,
                                created_by_current_user: data.thankedBy.userID === userId
                            });
                        } else {
                            success({})
                        }
                    },
                    error: function() {
                        console.log("error downvoting");
                    }
                });
            }
        }
    });

});

$(window).scroll(function() {
    if ($(window).scrollTop() + $(window).height() == $(document).height()) {
        // no_data = true;
        triggered += 1;

        if (canAJAX && triggered == 1) {
            canAJAX = false;
            addRealViews(html);
        }
    }
});

function handleBrokenImage(image) {
    image.onerror = "";
    image.src = "/images/common/default-placeholder.png";
    return true;
}

$(window).load(function() {
    $('.thumbnail').find('img').each(function() {
        var imgClass = (this.width / this.height > 1) ? 'wide' : 'tall';
        $(this).addClass(imgClass);
    })
});
